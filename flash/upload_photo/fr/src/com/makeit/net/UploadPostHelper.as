package com.makeit.net{ 
  
         import com.gaiaframework.debug.GaiaDebug;
         import flash.events.*; 
         import flash.net.*; 
         import flash.utils.ByteArray; 
         import flash.utils.Endian; 
  
         /** 
          * Take a fileName, byteArray, and parameters object as input and return ByteArray post data suitable for a UrlRequest as output 
          * 
          * @see http://marstonstudio.com/?p=36 
          * @see http://www.w3.org/TR/html4/interact/forms.html 
          * @see http://www.jooce.com/blog/?p=143 
          * @see http://www.jooce.com/blog/wp%2Dcontent/uploads/2007/06/uploadFile.txt 
          * @see http://blog.je2050.de/2006/05/01/save-bytearray-to-file-with-php/ 
          * 
          * @author Jonathan Marston 
          * @version 2007.08.19 
          * 
          * This work is licensed under a Creative Commons Attribution NonCommercial ShareAlike 3.0 License. 
          * @see http://creativecommons.org/licenses/by-nc-sa/3.0/ 
          * 
          */
		 
		 /**
			var request:URLRequest=new URLRequest(UPLOAD_PAGE);

			request.contentType="multipart/form-data; boundary="+UploadPostHelper.getBoundary();

			request.method=URLRequestMethod.POST;

			var variables:URLVariables = new URLVariables();

			variables.uid = 1;

			variables.filename=fnTxt.text;

			variables.wish=alarm_mc.alarm.wishTxt.text;

			request.data=UploadPostHelper.getPostData(fnTxt.text,bytes,"pic",variables);

			var loader:URLLoader = new URLLoader();

			loader.dataFormat=URLLoaderDataFormat.BINARY;

			loader.addEventListener(Event.COMPLETE, uploadCompleteHandler);

			loader.addEventListener(IOErrorEvent.IO_ERROR,uploadErrorHandler);

			loader.load(request);

		  */
		/**
		 *  .net
		 * 
		 *  HttpPostedFile file = Request.Files["name"];
			if(file == null || file.ContentLength <= 0)
			{
				return;
			}
			string filePath = Server.MapPath("~/Temp/" + System.Guid.NewGuid().ToString() + System.IO.Path.GetFileName(file.FileName));
			file.SaveAs(filePath);

		 */
         public class UploadPostHelper { 
  
                 /** 
                  * Boundary used to break up different parts of the http POST body 
                  */ 
                 private static var _boundary:String = ""; 
  
                 /** 
                  * Get the boundary for the post. 
                  * Must be passed as part of the contentType of the UrlRequest 
                  */ 
                 public static function getBoundary():String { 
  
                         if(_boundary.length == 0) { 
                                 for (var i:int = 0; i < 0x20; i++ ) { 
                                         _boundary += String.fromCharCode( int( 97 + Math.random() * 25 ) ); 
                                 } 
                         } 
  
                         return _boundary; 
                 } 
  
                 /** 
                  * Create post data to send in a UrlRequest 
                  */ 
                 public static function getPostData(fileName:String, byteArray:ByteArray, uploadDataFieldName:String = "filedata", parameters:Object = null):ByteArray { 
  
                         var i: int; 
                         var bytes:String; 
  
                         var postData:ByteArray = new ByteArray(); 
                         postData.endian = Endian.BIG_ENDIAN; 
  
                         //add Filename to parameters 
                         if(parameters == null) { 
                                 parameters = new Object(); 
                         } 
                         parameters.Filename = fileName; 
  
                         //add parameters to postData 
                         for(var name:String in parameters) { 
					
                                 postData = BOUNDARY(postData); 
                                 postData = LINEBREAK(postData); 
                                 bytes = 'Content-Disposition: form-data; name="' + name + '"'; 
                                 for ( i = 0; i < bytes.length; i++ ) { 
                                         postData.writeByte( bytes.charCodeAt(i) ); 
                                 } 
                                 postData = LINEBREAK(postData); 
                                 postData = LINEBREAK(postData); 
                                 postData.writeUTFBytes(parameters[name]); 
                                 postData = LINEBREAK(postData); 
                         } 
  
                         //add Filedata to postData 
                         postData = BOUNDARY(postData); 
                         postData = LINEBREAK(postData); 
                         bytes = 'Content-Disposition: form-data; name="'+uploadDataFieldName+'"; filename="'; 
                         for ( i = 0; i < bytes.length; i++ ) { 
                                 postData.writeByte( bytes.charCodeAt(i) ); 
                         } 
                         postData.writeUTFBytes(fileName); 
                         postData = QUOTATIONMARK(postData); 
                         postData = LINEBREAK(postData); 
                         bytes = 'Content-Type:image/jpg'; 
                         for ( i = 0; i < bytes.length; i++ ) { 
                                 postData.writeByte( bytes.charCodeAt(i) ); 
                         } 
                         postData = LINEBREAK(postData); 
                         postData = LINEBREAK(postData); 
                         postData.writeBytes(byteArray, 0, byteArray.length); 
                         postData = LINEBREAK(postData); 
  
                         //add upload filed to postData 
                         postData = LINEBREAK(postData); 
                         postData = BOUNDARY(postData); 
                         postData = LINEBREAK(postData); 
                         bytes = 'Content-Disposition: form-data; name="Upload"'; 
                         for ( i = 0; i < bytes.length; i++ ) { 
                                 postData.writeByte( bytes.charCodeAt(i) ); 
                         } 
                         postData = LINEBREAK(postData); 
                         postData = LINEBREAK(postData); 
                         bytes = 'Submit Query'; 
                         for ( i = 0; i < bytes.length; i++ ) { 
                                 postData.writeByte( bytes.charCodeAt(i) ); 
                         } 
                         postData = LINEBREAK(postData); 
  
                         //closing boundary 
                         postData = BOUNDARY(postData); 
                         postData = DOUBLEDASH(postData); 
  
                         return postData; 
                 } 
  				public static function getMulitFilePostData(fileVector:Vector.<UploadFileData>, parameters : Object = null):ByteArray{
					var i : int;
					var bytes : String;
		
					var postData : ByteArray = new ByteArray();
					postData.endian = Endian.BIG_ENDIAN;
		
					// add Filename to parameters
					if (parameters == null) {
						parameters = new Object();
					}
					
					for(i=0;i<fileVector.length;i++){
						var uploadFileData:UploadFileData=fileVector[i];
						parameters["Filename"+i] = uploadFileData.fileName;
					}
		
					// add parameters to postData
					for (var name:String in parameters) {
						postData = BOUNDARY(postData);
						postData = LINEBREAK(postData);
						bytes = 'Content-Disposition: form-data; name="' + name + '"';
						for ( i = 0; i < bytes.length; i++ ) {
							postData.writeByte(bytes.charCodeAt(i));
						}
						postData = LINEBREAK(postData);
						postData = LINEBREAK(postData);
						postData.writeUTFBytes(parameters[name]);
						postData = LINEBREAK(postData);
					}
		
					// add Filedata to postData
					
					
					for(var j:uint=0;j<fileVector.length;j++){
						postData = BOUNDARY(postData);
						postData = LINEBREAK(postData);
						uploadFileData=fileVector[j];
						bytes = 'Content-Disposition: form-data; name="' + uploadFileData.uploadDataFieldName + '"; filename="';
						for ( i = 0; i < bytes.length; i++ ) {
							postData.writeByte(bytes.charCodeAt(i));
						}
	
						postData.writeUTFBytes(uploadFileData.fileName);
						postData = QUOTATIONMARK(postData);
						postData = LINEBREAK(postData);
						bytes = 'Content-Type: application/octet-stream';
						for ( i = 0; i < bytes.length; i++ ) {
							postData.writeByte(bytes.charCodeAt(i));
						}
						postData = LINEBREAK(postData);
						postData = LINEBREAK(postData);
						postData.writeBytes(uploadFileData.fileBytes, 0, uploadFileData.fileBytes.length);
						postData = LINEBREAK(postData);
			
						// add upload filed to postData
						postData = LINEBREAK(postData);
						postData = BOUNDARY(postData);
						postData = LINEBREAK(postData);
						bytes = 'Content-Disposition: form-data; name="Upload"';
						for ( i = 0; i < bytes.length; i++ ) {
							postData.writeByte(bytes.charCodeAt(i));
						}
						postData = LINEBREAK(postData);
						postData = LINEBREAK(postData);
						bytes = 'Submit Query';
						for ( i = 0; i < bytes.length; i++ ) {
							postData.writeByte(bytes.charCodeAt(i));
						}
						postData = LINEBREAK(postData);
					}
		
					
					// closing boundary
					postData = BOUNDARY(postData);
					postData = DOUBLEDASH(postData);
		
					return postData;
			
			
		
				}
                 /** 
                  * Add a boundary to the PostData with leading doubledash 
                  */ 
                 private static function BOUNDARY(p:ByteArray):ByteArray { 
                         var l:int = UploadPostHelper.getBoundary().length; 
  
                         p = DOUBLEDASH(p); 
                         for (var i:int = 0; i < l; i++ ) { 
                                 p.writeByte( _boundary.charCodeAt( i ) ); 
                         } 
                         return p; 
                 } 
  
                 /** 
                  * Add one linebreak 
                  */ 
                 private static function LINEBREAK(p:ByteArray):ByteArray { 
                         p.writeShort(0x0d0a); 
                         return p; 
                 } 
  
                 /** 
                  * Add quotation mark 
                  */ 
                 private static function QUOTATIONMARK(p:ByteArray):ByteArray { 
                         p.writeByte(0x22); 
                         return p; 
                 } 
  
                 /** 
                  * Add Double Dash 
                  */ 
                 private static function DOUBLEDASH(p:ByteArray):ByteArray { 
                         p.writeShort(0x2d2d); 
                         return p; 
                 } 
  
         } 
 } 
 