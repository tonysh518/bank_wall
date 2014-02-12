package com.uploadPic 
{
	import com.makeit.images.JPGEncoder;
	import flash.display.Loader;
	import flash.display.*;
	import com.makeit.managers.Singleton;
	import flash.display.SimpleButton;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.geom.Matrix;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.text.TextField;
	import flash.external.ExternalInterface;
	import flash.events.FocusEvent;
	import flash.utils.ByteArray;
	/**
	 * ...
	 * @author happy
	 */
	public class Step2 extends MovieClip 
	{
		
		public var tipMC_0:MovieClip;
		public var tipMC_1:MovieClip;
		public var agreeMC:MovieClip;
		public var cancelBtn:SimpleButton;
		public var publishBtn:SimpleButton;
		public var description:TextField;
		public var zoomin:SimpleButton;
		public var zoomout:SimpleButton;
		public var picMC:MovieClip;
		private var _dStr:String="Entrez votre description ici avec les#hashtags correspondants(Ex : #Meeting très productif cematin à la #SG)"
		private var _w = 175;
		private var _loader:Loader;
		private var _prop:Number;
		private var _scale:Number = 1;
		private var _miniScale:Number;
		private var _centerPoint:Point;
		private var _appModel:AppModel = Singleton.getInstance(AppModel);
		private var _leftPoint:Point = new Point(50, 80);
		private var _rightPoint:Point = new Point(225, 255);
		public function Step2() 
		{
			agreeMC.gotoAndStop(1);
			agreeMC.buttonMode = true;
			tipMC_0.visible = false;
			tipMC_1.visible = false;
			description.text = _dStr;
			_loader = new Loader();
			_loader.contentLoaderInfo.addEventListener(Event.COMPLETE, loadCompleteHandler);
			_loader.loadBytes(_appModel.picData);
		}
		private function loadCompleteHandler(e:Event):void {
			picMC.mc.addChild(_loader);
			Bitmap(_loader.content).smoothing = true;
			_prop = picMC.mc.width / picMC.mc.height;
			if (_prop > 1) {
				picMC.mc.height = _w;
				picMC.mc.scaleX = picMC.mc.scaleY;
			}else {
				picMC.mc.width = _w;
				picMC.mc.scaleY = picMC.mc.scaleX;
			}
			_scale = _miniScale = picMC.mc.scaleY;
			
			picMC.mc.x = -(picMC.mc.width - _w) / 2;
			picMC.mc.y = -(picMC.mc.height - _w) / 2;
			init();
		}
		private function setPos(propw:Number,proph:Number):Boolean {
			picMC.mc.x= (picMC.mc.x-_centerPoint.x)*propw+_centerPoint.x;
			picMC.mc.y = (picMC.mc.y - _centerPoint.y) * proph + _centerPoint.y;
			if (picMC.mc.x > 0) {
				picMC.mc.x = 0;
			}else if (picMC.mc.x < -(picMC.mc.width - _w)) {
				picMC.mc.x=-(picMC.mc.width - _w)
			}
			
			if (picMC.mc.y > 0) {
				picMC.mc.y = 0;
			}else if (picMC.mc.y < -(picMC.mc.height - _w)) {
				picMC.mc.y=-(picMC.mc.height - _w)
			}
			
			
			var point1:Point = picMC.mc.globalToLocal(_leftPoint);
			var point2:Point = picMC.mc.globalToLocal(_rightPoint);
			
			if (point2.x - point1.x < 450||point2.y-point1.y<450) {
				return false;
			}
			
			
			return true;
		}
		private function init():void {
			_centerPoint = new Point(_w / 2, _w / 2);
			picMC.buttonMode = true;
			picMC.addEventListener(MouseEvent.MOUSE_DOWN, dragDownHandler);
			zoomin.addEventListener(MouseEvent.CLICK, zoominHandler);
			zoomout.addEventListener(MouseEvent.CLICK, zoomoutHandler);
			
			cancelBtn.addEventListener(MouseEvent.CLICK, cancleClickHandler);
			publishBtn.addEventListener(MouseEvent.CLICK, publishClickHandler);
			
			description.addEventListener(FocusEvent.FOCUS_IN, focusInHandler);
			description.addEventListener(FocusEvent.FOCUS_OUT, focusOutHandler);
			
			agreeMC.addEventListener(MouseEvent.CLICK, agreeClickHandler);
		}
		private function cancleClickHandler(e:MouseEvent):void {
			ExternalInterface.call("close_pop");
		}
		private function focusInHandler(e:FocusEvent):void {
			if (description.text == _dStr) {
				description.text = "";
			}
		}
		private function focusOutHandler(e:FocusEvent):void {
			if (description.text == "") {
				description.text = _dStr;
			}
		}
		private function agreeClickHandler(e:MouseEvent):void {
			agreeMC.gotoAndStop(3-agreeMC.currentFrame);
		}
		private function publishClickHandler(e:MouseEvent):void {
			var b:Boolean = true;
			if (description.text == _dStr) {
				tipMC_0.visible = true;
				tipMC_0.t.text = "please write some description";
				b=false;
			}else if (!hashtag(description.text)) {
				tipMC_0.visible = true;
				tipMC_0.t.text = "#Meeting très productif cematin à la #SG";
				b=false;
			}
			if (agreeMC.currentFrame == 1) {
				tipMC_1.visible = true;
				b = false;
			}
			if (!b) {
				return;
			}
			tipMC_0.visible = tipMC_1.visible = false;
			
			
			MovieClip(parent).publish(description.text,getImg().clone());
			
		}
		private function getImg():BitmapData {
			var point1:Point = picMC.mc.globalToLocal(_leftPoint);
			var point2:Point = picMC.mc.globalToLocal(_rightPoint);
			var w:Number = point2.x - point1.x;
			var h:Number = point2.y - point1.y;
			if (w > 1000 || h > 1000) {
				var tempW:Number = 1000;
				var tempH:Number = 1000;
			}else {
				tempW = w;
				tempH = h;
			}
			var prop:Number = tempW / w;
			var bmp:BitmapData = new BitmapData(tempW,tempH );
			var matrix:Matrix = new Matrix();
			matrix.tx = -point1.x;
			matrix.ty = -point1.y;
			matrix.scale(prop, prop);
			bmp.draw(picMC.mc, matrix);
			return bmp;
			//var bp:Bitmap = new Bitmap(bmp);
			//trace(bp.width,bp.height)
			//bp.x = -300;
			//bp.scaleX=bp.scaleY=.3
			//this.addChild(bp)
			
		}
		private function zoominHandler(e:MouseEvent):void {
			var tempScale = picMC.mc.scaleX;
			var tempX = picMC.mc.x;
			var tempY = picMC.mc.y;
			_scale = _scale * 1.1;
			var w1:Number = picMC.mc.width;
			var h1:Number= picMC.mc.height;
			picMC.mc.scaleX = picMC.mc.scaleY = _scale ;
			var w2:Number = picMC.mc.width;
			var h2:Number = picMC.mc.height;
			
			if (!setPos(w2 / w1, h2 / h1)) {
				picMC.mc.scaleX = picMC.mc.scaleY = tempScale;
				picMC.mc.x = tempX;
				picMC.mc.y = tempY;
				_scale = tempScale;
			}
		}
		private function zoomoutHandler(e:MouseEvent):void {
			var tempScale = picMC.mc.scaleX;
			var tempX = picMC.mc.x;
			var tempY = picMC.mc.y;
			
			_scale = _scale * .9
			if (_scale < _miniScale) {
				_scale = _miniScale;
			}
			var w1:Number = picMC.mc.width;
			var h1:Number= picMC.mc.height;
			picMC.mc.scaleX = picMC.mc.scaleY = _scale ;
			var w2:Number = picMC.mc.width;
			var h2:Number = picMC.mc.height;
			
			if (!setPos(w2 / w1, h2 / h1)) {
				picMC.mc.scaleX = picMC.mc.scaleY = tempScale;
				picMC.mc.x = tempX;
				picMC.mc.y = tempY;
				_scale = tempScale;
			}
		}
		private function dragDownHandler(e:MouseEvent):void {
			var x:Number = -(picMC.mc.width - _w);
			var y:Number = -(picMC.mc.height - _w);
			var w:Number = -x;
			var h:Number = -y;
			picMC.mc.startDrag(false, new Rectangle(x, y, w, h));
			picMC.addEventListener(MouseEvent.MOUSE_UP, dragUpHandler);
			stage.addEventListener(MouseEvent.MOUSE_UP, dragUpHandler);
		}
		private function dragUpHandler(e:MouseEvent):void {
			picMC.mc.containerMC.stopDrag();
			picMC.removeEventListener(MouseEvent.MOUSE_UP, dragUpHandler);
			stage.removeEventListener(MouseEvent.MOUSE_UP, dragUpHandler);
		}
		private function hashtag(string:String):Boolean{
            var reg:RegExp = /#[^\s]*/g;
            var tags:Array = string.match(reg);
            if(!tags) return true;
            var illegalChars = false;
            for (var i:uint = 0; i < tags.length;i++){
                var tag = tags[i].replace('#','');
                var reg = /[`~\-!@#$%^&*()_+<>?:"{},.\/;[\]]/im;
                if(reg.test(tag)) {
                    illegalChars = true;
                }
            };
            if(illegalChars) {
                return false;
            }
            return true;
        }

		
		
	}

}