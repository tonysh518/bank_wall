﻿package com.uploadPic 
{
	import flash.display.BitmapData;
	import flash.display.MovieClip;
	import flash.display.SimpleButton;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.events.TimerEvent;
	import flash.net.*;
	import com.makeit.net.UploadPostHelper;
	import flash.external.ExternalInterface;
	import com.makeit.managers.Singleton;
	import com.makeit.images.JPGEncoder;
	import flash.utils.ByteArray;
	import flash.utils.Timer;
	import com.makeit.json.JSON;
	/**
	 * ...
	 * @author happy
	 */
	public class Document extends MovieClip 
	{
		public var closeBtn:SimpleButton;
		public var stepMC3:MovieClip;
		private var _appModel:AppModel = Singleton.getInstance(AppModel);
		private var _bmp:BitmapData;
		private var _d:String;
		public var isPass:Boolean = false;
		public function Document() 
		{
			this.loaderInfo.addEventListener(Event.COMPLETE, loadCompleteHandler);
		}
		private function loadCompleteHandler(e:Event):void {
			init();
		}
		private function init():void {
			stop();
			//closeBtn.addEventListener(MouseEvent.CLICK, closeClickHandler);
		}
		private function closeClickHandler(e:MouseEvent):void {
			ExternalInterface.call("close_pop");
		}
		public function publish(d:String, bmp:BitmapData):void {
			_d = d;
			_bmp = bmp;
			_appModel.bmp = _bmp.clone();
			gotoAndStop(3);
			
			upload(null)
		}
		public function upload(e:TimerEvent):void {
			//if(Worker.current.isPrimordial){
				var jpg:JPGEncoder = new JPGEncoder(100);
				var bytes:ByteArray = jpg.encode(_bmp);
				
				var request:URLRequest=new URLRequest("./api/node/post");
				request.contentType="multipart/form-data; boundary="+UploadPostHelper.getBoundary();
				request.method=URLRequestMethod.POST;
				var variables:URLVariables = new URLVariables();
				variables.description = _d;
				variables.type = "photo";
				variables.flash = true;
				request.data=UploadPostHelper.getPostData("pic.jpg",bytes,"file",variables);
				var loader:URLLoader = new URLLoader();
				loader.dataFormat=URLLoaderDataFormat.BINARY;
				//loader.addEventListener(Event.COMPLETE, uploadCompleteHandler);
				loader.load(request);
			//}
			
			
		}
		public function uploadCompleteHandler(e:Event):void {
			var target:URLLoader = e.target as URLLoader;
			/*
			var data:Object = JSON.decode(target.data);
			if (!data.success) {
				ExternalInterface.call("alert",data.message);
			}else {
				isPass = true;
				stepMC3.play();
			}
			ExternalInterface.call("close_pop");
			*/
		}
	}

}