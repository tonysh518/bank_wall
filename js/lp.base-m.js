/*
 * page base action
 */
LP.use(['jquery', 'api', 'easing', 'transit', 'fileupload', 'flash-detect', 'swfupload', 'swfupload-speed', 'swfupload-queue'] , function( $ , api ){
    'use strict'

    var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > 0;
    var isIE8 = $('html').hasClass('ie8');
    var API_FOLDER = "../api";
    var THUMBNAIL_IMG_SIZE = "_640_640";
    var BIG_IMG_SIZE = "_640_640";
    var _waitingLikeAjax = false;
    var _waitingCommentListAjax = false;
    var $main = $('.main');
    var minWidth = 640;
    var itemWidth = minWidth;
    var winWidth = $(window).width();
    var $listLoading = $('.loading-list');
    var aMonth;
    var _e;

    // live for pic-item hover event
    $(document.body)
        .delegate('.pic-item' , 'mouseenter' , function(){
            if(isIE8) {
                $(this).find('.item-info-wrap').fadeIn(100);
            }
            $(this).find('.item-info')
                //.stop( true , false )
                .fadeIn( 500 );
        })
        .delegate('.pic-item' , 'mouseleave' , function(){
            if(isIE8) {
                $(this).find('.item-info-wrap').fadeOut(100);
            }
            $(this).find('.item-info')
                //.stop( true , false )
                .fadeOut( 500 );
        })
        .delegate('.search-ipt' , 'keypress' , function(ev){
            switch( ev.which ){
                case 13: // enter
                    LP.triggerAction('search');
            }
        })
//        .delegate('.menu-item' , 'mouseenter' , function(){
//            if($(this).hasClass('active')) {
//                return;
//            }
//            $(this).find('h6')
//                .delay(200).stop( true , true).fadeIn( 500 );
//            $(this).find('p')
//                .delay(200).stop( true , true).fadeOut( 500 );
//        })
//        .delegate('.menu-item' , 'mouseleave' , function(){
//            $(this).find('h6')
//                .delay(200).stop( true , true).fadeOut( 500 );
//            $(this).find('p')
//                .delay(200).stop( true , true ).fadeIn( 500 );
//        })
        // for select options
        .delegate('.select-option p' , 'click' , function(){
            $(this)
                // add selected class
                .addClass('selected')
                // remove sibling class
                .siblings()
                .removeClass('selected')
                .end()
                .closest('.select-pop')
                .prev()
                .html( $(this).html() );

            //TODO: loading animation

            // reset status / back to homepage
            if(!$main.is(':visible')){
                LP.triggerAction('back');
            }

            $('.search-hd').fadeOut(100);


            $main.fadeOut(100,function(){
                LP.triggerAction('close_user_page');
                LP.triggerAction('load_list');
            });

        })
        .delegate('.editfi-country-option p' , 'click' , function(){
            $('.editfi-country-box').html($(this).html()).data('id', $(this).data('id'));
        })
        .delegate('.user-edit-page .edit-email' , 'blur' , function(){
            var $error = $('.user-edit-page .edit-email-error');
            var email = $(this).val();
            var exp = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\_|\.]?)*[a-zA-Z0-9]+\.(?:com|cn)$/;
            if (!exp.test(email)) {
                $error.fadeIn();
            }
            else
            {
                $error.fadeOut();
            }
        })
        .delegate('.com-like','mouseenter',function(){
            var needLogin = $(this).find('.need-login');
            if(needLogin) {
                needLogin.fadeIn();
            }
        })
        .delegate('.com-like','mouseleave',function(){
            var needLogin = $(this).find('.need-login');
            if(needLogin) {
                needLogin.fadeOut();
            }
        })
        .delegate('.com-unlike','mouseenter',function(){
            var unlikeTip = $(this).find('.com-unlike-tip');
            if(unlikeTip) {
                unlikeTip.fadeIn();
            }
        })
        .delegate('.com-unlike','mouseleave',function(){
            var unlikeTip = $(this).find('.com-unlike-tip');
            if(unlikeTip) {
                unlikeTip.fadeOut();
            }
        })
        .delegate('.com-ipt','keyup',function(){
            var textLength = $(this).val().length;
            if(textLength > 0 || textLength <= 140) {
                $('.comment-msg-error').fadeOut();
            }
            if(textLength > 140) {
                $('.comment-msg-error').fadeIn().html(_e.ERROR_COMMENT_LIMITED);
                $('.comment-form .submit').attr('disabled','disabled');
            }
        })
        .delegate(document,'keyup',function(ev){
            if(ev.which == 27) {
                LP.triggerAction('close_pop');
                LP.triggerAction('cancel_modal');
            }
        })
        .delegate('.editfi-condition','click',function(){
            if($(this).hasClass('checked')) {
                $(this).removeClass('checked');
            } else {
                $(this).addClass('checked');
                $('.editfi-condition-error').fadeOut();
            }
        })
        .delegate('.poptxt-check','click',function(){
            if($(this).hasClass('checked')) {
                $(this).removeClass('checked');
            } else {
                $(this).addClass('checked');
                $('.poptxt-check .error').fadeOut();
            }
        })
        .delegate('textarea, input','focus',function(){
			$(this).addClass('focus');
            var placeholder = $(this).attr('placeholder');
            if(placeholder)
            {
                if(isIE8) {
                    $(this).val('');
                } else {
                    $(this).data('placeholder', placeholder);
                }
                $(this).removeAttr('placeholder');
            }

        })
        .delegate('textarea, input','blur',function(){
			if($(this).val().length == 0) {
				$(this).removeClass('focus');
			}
            if(!isIE8) {
                var placeholder = $(this).data('placeholder');
                if(placeholder)
                {
                    $(this).attr('placeholder', placeholder);
                }
            }
        })
        .delegate('video','click',function(){
            $(this)[0].pause();
        })


        // click to hide select options
        .click(function( ev ){
            $('.select-pop').fadeOut();
            if( $(ev.target).hasClass('select-box') ){
                $(ev.target)
                    .next()
                    .fadeIn();
            }

            $('.editfi-country-pop').fadeOut();
            if( $(ev.target).hasClass('editfi-country-box') ){
                $(ev.target)
                    .next()
                    .fadeIn();
            }
        });



    // fix one day animation. It is start animate from the day which is not trigger the animation
    // After the day trigger the animation 
    // Fix animation day by day
    var nodeActions = {
        prependNode: function( $dom , nodes , bShowDate ){
            var aHtml = [];
            var lastDate = null;
            var pageParm = $main.data('param'); //TODO:  pageParm.orderby == 'like' || pageParm.orderby == 'random' 此时不显示日历
            nodes = nodes || [];

            // save nodes to cache
            var cache = $dom.data('nodes') || [];
            $dom.data('nodes' , nodes.concat( cache ) );

            // if( bShowDate ){
            //     lastDate = $main.find('.time-item').last().data('date');
            // }
            // filte for date
            $.each( nodes , function( index , node ){
                // get date
                if( bShowDate ){
                    var datetime = new Date((parseInt(node.datetime)+1*3600)*1000);
                    var date = datetime.getUTCFullYear() + "/" + (parseInt(datetime.getUTCMonth()) + 1) + "/" + datetime.getUTCDate();
                    if( lastDate != date){
                        LP.compile( 'time-item-template' ,
                            {date: date , day: parseInt(datetime.getUTCDate()) , month: getMonth(parseInt(datetime.getUTCMonth()) + 1)} ,
                            function( html ){
                                aHtml.push( html );
                            });
                        lastDate = date;
                    }
                }
                // fix video type
                node.image = node.file.replace( node.type == 'video' ? '.mp4' : '.jpg' , THUMBNAIL_IMG_SIZE + '.jpg');
                node.formatDate = date;

                node.str_like = node.likecount > 1 ? 'Likes' : 'Like';
                LP.compile( 'node-item-template' ,
                    node ,
                    function( html ){
                        aHtml.push( html );

                        if( index == nodes.length - 1 ){
                            // render html
                            var $oFirstTimeNode = $dom.children().eq(0);
                            // remove first time item;
                            $dom.prepend(aHtml.join(''));
                            if( bShowDate && 
                                $oFirstTimeNode.prevAll('.time-item').first().data('date')
                                == $oFirstTimeNode.data('date') ){
                                $oFirstTimeNode.remove();
                            }
                            //nodeActions.setItemWidth( $dom );
                            nodeActions.setItemReversal( $dom );
                        }
                    } );

            } );
        },
        // when current dom is main , and the recent ajax param orderby is 'like' or
        // 'random' , the datetime would not be showed.
        // pageParm.orderby == 'like' || pageParm.orderby == 'random' 此时不显示日历
        inserNode: function( $dom , nodes , bShowDate ){
            var aHtml = [];
            var lastDate = null;
            var pageParm = $main.data('param'); 
            nodes = nodes || [];

            // save nodes to cache
            var cache = $dom.data('nodes') || [];
            $dom.data('nodes' , cache.concat( nodes ) );

            // filter for nodes , if there are nodes autoloaded in 5 minutes
            // the page index is not right.  So you should delete the same nodes
            var lastNode = cache[ cache.length - 1 ];
            if( lastNode ){
                var index = null ;
                $.each( nodes , function( i , node ){
                    if( lastNode.nid == node.nid ){
                        index = i;
                        return false;
                    }
                } );
                if( index !== null ){
                    nodes.splice( 0 , index + 1 );
                }
            }

            if( bShowDate ){
                lastDate = $dom.find('.time-item').last().data('date');
            }
            // filte for date
            $.each( nodes , function( index , node ){
                // get date
                if( bShowDate ){
                    var datetime = new Date((parseInt(node.datetime)+1*3600)*1000);
                    var date = datetime.getUTCFullYear() + "/" + (parseInt(datetime.getUTCMonth()) + 1) + "/" + datetime.getUTCDate();
                    if( lastDate != date){
                        LP.compile( 'time-item-template' ,
                            {date: date , day: parseInt(datetime.getUTCDate()) , month: getMonth(parseInt(datetime.getUTCMonth()) + 1)} ,
                            function( html ){
                                aHtml.push( html );
                            } );
                        lastDate = date;
                    }
                }
                // fix video type
                node.image = node.file.replace( node.type == 'video' ? '.mp4' : '.jpg' , THUMBNAIL_IMG_SIZE + '.jpg');
                node.formatDate = date;

                node.str_like = node.likecount > 1 ? 'Likes' : 'Like';
                LP.compile( 'node-item-template' ,
                    node ,
                    function( html ){
                        aHtml.push( html );

                        if( index == nodes.length - 1 ){
                            // render html
                            $dom.append(aHtml.join(''));
                            //nodeActions.setItemWidth( $dom );
                            nodeActions.setItemReversal( $dom );
                        }
                    } );

            } );
        },
        setItemWidth: function( $dom ){
//            if( $dom.is(':hidden') ) return;
//            var mainWidth = $dom.width();
//            var min = ~~( mainWidth / minWidth );
//            // save itemWidth and winWidth
//            itemWidth = ~~( mainWidth / min );
//            winWidth = $(window).width();
//
//            $dom.find('.time-item, .main-item.reversal , .main-item.reversal img')
//                .width( itemWidth )
//                .height( itemWidth );
//            $dom.find('.main-item').height( itemWidth );
        },
        stopItemReversal: function(){
            clearTimeout( nodeActions._reversalTimeout );
        },
        // start pic reversal animation
        setItemReversal: function( $dom ){
            // fix all the items , set position: relative
            $dom.children()
                .css('position' , 'relative');
            if( $dom.children('.isotope-item').length )
                $dom.isotope('destroy')
            // get first time item , which is not opend
            // wait for it's items prepared ( load images )
            // run the animate

            // if has time items, it means it needs to reversal from last node-item element
            // which is not be resersaled
            var $nodes = $dom.find('.pic-item:not(.reversal)');

            var startAnimate = function( $node ){
                if( $dom.is(':hidden') ) return;

                $node.addClass('reversal')
                    .width( itemWidth )
                    .height( itemWidth );
                var animationTimeout = 300;
                if(isIE8) {
                    $node.css({opacity:0}).animate({opacity:1});
                    animationTimeout = 50;
                }
                // fix it's img width and height
                $node.find('img')
                    .width( itemWidth )
                    .height( itemWidth );
                nodeActions._reversalTimeout =  setTimeout(function(){
                    nodeActions.setItemReversal( $dom );
                } , animationTimeout);
            }
            // if esist node , which is not reversaled , do the animation
            if( $nodes.length  ){
                var $img = $nodes.eq(0)
                    .find('img');
                startAnimate( $nodes.eq(0) );
                //TODO: commented the image loaded condition during testing
//                if( $img[0].complete ){
//                    startAnimate( $nodes.eq(0) );
//                } else {
//                    $img.load(function(){
//                        startAnimate( $nodes.eq(0) );
//                    });
//                }
            } else { // judge if need to load next page 
                $(window).trigger('scroll');
            }
        },
        // set items auto fix it's width
//        setItemIsotope: function( $dom ){
//            // if the page has unreversaled node
//            if( $dom.find('.main-item:not(.time-item,.reversal)').length ) return;
//
//            if( $dom.children('.isotope-item').length ){
//                $dom.isotope('reLayout');
//                return;
//            }
//
//            LP.use('isotope' , function(){
//                // first init isotope , render no animate effect
//                $dom
//                    .addClass('no-animate')
//                    .isotope({
//                        resizable: false
//                    });
//
//                // after first isotope init
//                // remove no animate class
//                setTimeout(function(){
//                    $dom.removeClass('no-animate');
//                } , 100);
//            });
//        }
    }

    // fix window resize event
    // resize item width
    var _resizeTimer = null;
    var _scrollAjax = false;
    $(window).resize(function(){
        clearTimeout( _resizeTimer );

        _resizeTimer = setTimeout(function(){
            if( $main.is(':visible') ){
                nodeActions.setItemWidth( $main );

                // run isotope after item width fixed
                setTimeout(function(){
                    nodeActions.setItemIsotope( $main );
                } , 500);
            }

            var $userPage = $('.user-page');
            var $userCom = $userPage.find('.count-com');
            if( $userPage.is(':visible') && $userCom.is(':visible') ){
                nodeActions.setItemWidth( $userCom );
                // run isotope after item width fixed
                setTimeout(function(){
                    nodeActions.setItemIsotope( $userCom );
                } , 500);
            }
        } , 200);

        // immediate resize
        // resize big image
        resizeInnerBox();
        // resize user box
        resizeUserBox();
    })
    .scroll(function(){
        // if is ajaxing the scroll data
        if( _scrollAjax ) return;
        // if scroll to the botton of the window
        // ajax the next datas
        var st = $(window).scrollTop();
        var docHeight = $(document).height();
        var winHeight = document.body.clientHeight;
        if( docHeight - winHeight - st < 100 ){
            
            // fix main element
            // it must visible and in main element has unreversaled node
            if( $main.is(':visible') && !$main.find('.main-item:not(.time-item,.reversal)').length ){
                _scrollAjax = true;
                var param = $main.data('param');
                param.page++;
                $main.data('param' , param);
                $listLoading.fadeIn();
                api.ajax('recent' , param , function( result ){
                    nodeActions.inserNode( $main , result.data , param.orderby == 'datetime');
                    _scrollAjax = false;
                    $listLoading.fadeOut();
                    // TODO:: no more data tip
                });
            }
            // fix user page element
            var $userCom = $('.user-page .count-com');
            // it must visible and in main element has unreversaled node
            if( $('.count-com').is(':visible') && !$userCom.find('.main-item:not(.time-item,.reversal)').length ){
                _scrollAjax = true;
                var userPageParam = $('.count-com').data('param');
                userPageParam.page++;
                $('.count-com').data('param',userPageParam);
                api.ajax('recent' , userPageParam , function( result ){
                    nodeActions.inserNode( $userCom , result.data , true );
                    _scrollAjax = false;

                    // TODO:: no more data tip
                });
            }
            if( _scrollAjax ){
                // TODO: loading animation
            }
        }
    });





    // ================== page actions ====================
    // language select btn event
    LP.action('lang' , function( data ){
        $(this)
            .addClass('language-item-on')
            .siblings()
            .removeClass('language-item-on');

        // set lang tag to cookie
        LP.setCookie('lang' , data.lang );

        // reload document
        LP.reload();
    });

    // view node action
    var _silderWidth = 80;
    var _animateTime = 400;
    var _animateEasing = 'easeInOutQuart';
    var _nodeCache = [];
    var _currentNodeIndex = 0;
    var _innerLock = false;
    LP.action('node' , function( data ){
//        if( _innerLock ) return;
//        _innerLock = true;
        var $dom = $( this );
        if(data.type) {
            var node = data; // 如果直接传入单个node，不再从列表中获取
        }
        else {
            _currentNodeIndex = $(this).prevAll(':not(.time-item)').length;
            if($('.user-page').is(':visible')) {
                var nodes = $('.count-com').data('nodes');
            }
            else
            {
                var nodes = $main.data('nodes');
            }
            var node = nodes[ _currentNodeIndex ];
        }
        if(!$('.side').is(':visible')) {
            _silderWidth = 0;
        }
        $('.search-hd').hide();
        var datetime = new Date((parseInt(node.datetime)+1*3600)*1000);
        node.date = datetime.getUTCDate();
        node.month = getMonth((parseInt(datetime.getUTCMonth()) + 1));
        node.image = node.file.replace( node.type == "video" ? '.mp4' : '.jpg', BIG_IMG_SIZE + '.jpg');
        node.timestamp = (new Date()).getTime();
        node.currentUser = $('.side').data('user');
        if(!node.user.avatar) {
            node.user.avatar = "/uploads/default_avatar.gif";
        }
        node._e = _e;
        LP.compile( 'inner-template' , node , function( html ){
            var mainWidth = winWidth;
            var mainWrapWidth = $main.width();
            // close user page if which opend
            if($('.user-page').is(':visible')) {
                LP.triggerAction('toggle_user_page');
                $main.stop().hide();
            }
            // inner animation
            $('.inner').eq(0).fadeOut(function(){
                $(this).remove();
            });
            var $inner = $(html).insertBefore( $main )
                .css({
                    x: - mainWidth
                    //position: 'relative'
                })
				.transit({
					x: 0
				}, _animateTime , _animateEasing);
//                .animate({
//                    left: 0
//                }, _animateTime , _animateEasing , function(){
//                    // show up node info
//                });
            // set inner-info bottom css


            // main animation
            var scrollTop = $(window).scrollTop();
			$('body').css({overflow:'hidden'});
//            $main
//                .css({
//                    //position: 'fixed',
//                    width: mainWrapWidth,
//                    left: 0
//                    //top: 86 - scrollTop
//                })
//                .animate({
//                    left: winWidth
//                } , _animateTime , _animateEasing , function(){
//                    //$main.hide();
//					$('body').css({overflow:'hidden'});
//					$main.addClass('closed');
//                    _innerLock = false;
//                });
            // loading comments
            bindCommentSubmisson();
            _waitingCommentListAjax = false;
            getCommentList(node.nid,1);

//            LP.use(['jscrollpane' , 'mousewheel'] , function(){
//                $('.com-list').jScrollPane({autoReinitialise:true}).bind(
//                    'jsp-scroll-y',
//                    function(event, scrollPositionY, isAtTop, isAtBottom)
//                    {
//                        if(isAtBottom) {
//                            var commentParam = $('.comment-wrap').data('param');
//                            var page = commentParam ?  commentParam.page : 0;
//                            getCommentList(node.nid,page + 1);
//                            //console.log('Append next page');
//                        }
//                    }
//                );
//            });

            // init vide node
            if( node.type == "video" ){
                renderVideo($('.image-wrap-inner'),node);
                $('#imgLoad').attr('src', './api' + node.image);
                $('#imgLoad').ensureLoad(function(){
                    setTimeout(function(){
                        $('.image-wrap-inner object, .image-wrap-inner video').fadeIn();
                        $('.image-wrap-inner .video-js').fadeIn();
                    },400);

                    // preload before and after images
                    preLoadSiblings();
                    var $info = $inner.find('.inner-info');
                    //$info.css( 'bottom' , - $info.height() );
                    //slideIntroBar($info, _animateTime);
                });
            }

            // init photo node
            if( node.type == "photo" ){
                $('.image-wrap-inner img').ensureLoad(function(){
                    $(this).fadeIn();
                    // preload before and after images
                    preLoadSiblings();
                    var $info = $inner.find('.inner-info');
                    //$info.css( 'bottom' , - $info.height() );
                    //slideIntroBar($info, _animateTime);
                });
            }
            

            // change url
            changeUrl('/nid/' + node.nid , {event: 'back'});
            // loading image

            // Resize Inner Box
//            setTimeout(function(){
//                resizeInnerBox();
//            },100);

            // save node from
            $inner.data('from' , $dom.parent() );
        } );

        return false;
    });

    // for back action
    LP.action('back' , function( data ){
		console.log('back');
        //if( _innerLock ) return;
        var $inner = $('.inner');
        var infoTime = 300;
        // hide the inner info node
        var $info = $inner.find('.inner-info');
        // clean WMV player
        $inner.find('iframe').remove();

        $info.animate({
            bottom: -$info.height()
        } , infoTime);
        // back $inner and remove it
        $inner
            .transit({
                x: - $(window).width()
            } , _animateTime , _animateEasing , function(){
                $inner.remove();
            });

        // back $main
        var $dom = $inner.data('from') || $main;
        var $aniDom = $main;
        if( $dom.get(0) != $main.get(0) ){
            $aniDom = $(".user-page");
        }

        var lastScrollTop = 86 - parseInt( $aniDom.css('top') );
        var _left = 0;
        if($aniDom.hasClass('user-page')) {
            $('.count').delay(_animateTime).animate({left:80});
            _left = 80;
//            $main.css({
//                width: 'auto',
//                height: 'auto'
//            });
        }
        $aniDom
            .stop()
            .show()
            //.css('position' , 'fixed')
            .delay(infoTime)
            .animate({
                left: _left
            } , _animateTime , _animateEasing , function(){
                if($aniDom.hasClass('main')) {
//                    $aniDom.css({
//                        //top: 'auto',
//                        left: 'auto',
//                        //position: 'relative',
//                        width: 'auto'
//                    });
//					$main.removeClass('closed');
                }
                else {
                    $aniDom.css({
                        width: 'auto'
                    });
                }

                //$(window).scrollTop( lastScrollTop );
                // restart reverse

				$('body').css({overflowY:'visible'});
                nodeActions.setItemReversal( $dom );
            });

        var pageParam = $dom.data('param');
        if(pageParam.previouspage != null) {
            $dom.html('');
            $dom.data( 'nodes', [] );
            $listLoading.fadeIn();

            LP.triggerAction('recent' , pageParam);
        }

        changeUrl('' , {event:'back'});

    });

    LP.action('back_home', function(){
		nodeActions.stopItemReversal();
		var delay = 400;
		if($main.hasClass('closed')) {
			LP.triggerAction('back');
			delay = 0;
		}
		if($('.user-page').is(':visible')) {
			LP.triggerAction('toggle_user_page');
			delay = 0;
		}
		resetQuery();
		$('.search-hd').hide();
		$main.html('');
		$main.data( 'nodes', [] );
		$listLoading.fadeIn();
		LP.triggerAction('recent');
    });

    /**
     * @desc: 立方体旋转inner node
     * @date:
     * @param node {node object}
     * @param direction { 'right' or 'left' }
     */
    function cubeInnerNode( node , direction ){

        var cubeDir = 'cube-' + direction;
        var rotateDir = 'rotate-' + direction;

        // base on comment wrap width
        var dist = $('.comment-wrap').width() / 2;
        var dirData = {
            dist: dist,
            rotate: 90
        }
        if( direction == 'left' ){
            dirData.dist = - dist;
            dirData.rotate = -90;
        }

        var datetime = new Date((parseInt(node.datetime)+1*3600)*1000);
        node.date = datetime.getUTCDate();
        node.month = getMonth((parseInt(datetime.getUTCMonth()) + 1));
        node.currentUser = $('.side').data('user');
        node.image = node.file.replace( node.type == "video" ? '.mp4' : '.jpg', BIG_IMG_SIZE + '.jpg');
        node.timestamp = (new Date()).getTime();
        if(!node.user.avatar) {
            node.user.avatar = "/uploads/default_avatar.gif";
        }
        node._e = _e;
        var $inner = $('.inner');
        LP.compile( 'inner-template' , node , function( html ){
            var $comment = $inner.find('.comment');
            // comment animation
            var $newInner = $(html);
            var transform = "translatex(" + dirData.dist + "px) translatez(" + (-dist) + "px) rotateY(" + dirData.rotate + "deg)";;
            var $nextComment = $newInner.find('.comment')
                .addClass(cubeDir)
                .css({
                    "-webkit-transform": transform,
                    "-moz-transform": transform,
                    "transform": transform
                })
                .insertBefore( $comment )
                .find( '.com-list' )
                .css('height' , $comment.find('.com-list').height())
                .end();

            var $cube = $comment.parent();
            var rotate = "translate3d(" + ( - dirData.dist ) + "px,0," + (-dist) + "px) rotateY(" + ( -dirData.rotate ) + "deg)";
            $cube.addClass(rotateDir)
                .css({
                    "-webkit-transform": rotate,
                    "-moz-transform": rotate,
                    "-ms-transform": rotate,
                    "-o-transform": rotate,
                    "transform": rotate
                });



            setTimeout(function(){
                // reset css
                $cube.addClass( 'no-animate' )
                    .removeClass( rotateDir )
                    .css({
                        "-webkit-transform": '',
                        "-moz-transform": '',
                        "-ms-transform": '',
                        "-o-transform": '',
                        "transform": ''
                    });
                $comment.remove();
                $nextComment
                    .removeClass(cubeDir)
                    .css({
                        "-webkit-transform": "",
                        "-moz-transform": "",
                        "transform": ""
                    });
                setTimeout(function(){
                    $cube.removeClass( 'no-animate' );
                    _innerLock = false;
                },20);

                $inner.removeClass('disabled');

            } , 1000);

            // picture animation,
            // append or prepend image
            // set image width
            // set .image-wrap's margin-right
            // animate the first image's margin-left style
            var $imgWrap = $inner.find('.image-wrap');
            var wrapWidth = $imgWrap.width();
            $imgWrap.css('width' , 2 * wrapWidth );

            // append dom
            var $oriItem = $imgWrap.children('.image-wrap-inner');
            // count the style
            var $newItem = $newInner.find('.image-wrap-inner')[ direction == 'left' ? 'insertBefore' : 'insertAfter' ]( $oriItem )
                .attr('style' , $oriItem.attr('style'))
                .find('img')
                .hide()
                .end();

            var $nextFlag = $newInner.find('.flag-node');
            $inner.find('.flag-node').remove();
            $newItem.append($nextFlag);

            var $nextTop = $newInner.find('.inner-top');
            $inner.find('.inner-top').animate({top:-33});
            $newItem.append($nextTop);

            // Resize Image
            var slideWidth = $('.side').width();
            var imgBoxWidth = $(window).width() - 330 - slideWidth;
            var imgBoxHeight =$(window).height() - $('.header').height();
            var minSize = Math.min( imgBoxHeight , imgBoxWidth );
            var $img = $newItem.find('img').css('margin',0);
            $newItem.width(minSize).height(minSize);

            if( imgBoxHeight > imgBoxWidth ){
                var marginLeft = (imgBoxHeight - imgBoxWidth) / 2;
                $newItem.height(imgBoxHeight);
                $img.width('auto').height('100%').css('margin-left', -marginLeft);
            }

            $oriItem.find('iframe').remove();



            // set style and animation
            $imgWrap.children('.image-wrap-inner').css({
                    width: wrapWidth
                })
                .eq(0)
                .css('marginLeft' , direction == 'left' ? - wrapWidth : 0 )
                .animate({
                    marginLeft: direction == 'left' ? 0 : - wrapWidth
                } , _animateTime, _animateEasing)
                // after animation
                .promise()
                .done(function(){
                    $imgWrap.width( wrapWidth );
                    // Resize Inner Box
                    // resizeInnerBox();
                    $newItem.css('width' , '100%');
                    $newItem.siblings('.image-wrap-inner').remove();
                });

            // desc animation
            var $info = $inner.find('.inner-info');
            $info.animate({
                    bottom: -$info.height()
                } , 500 )
                .promise()
                .done(function(){
                    $info.remove();
                });
            var $newInfo = $newInner.find('.inner-info')
                .insertAfter( $info );
            $newInfo.css({
                'bottom' : -$newInfo.height(),
                'width'  : $info.width(),
                'left'   : $info.css('left')
            })

            // day icon animation


            // init video
            if( node.type == "video" ){
                renderVideo($newItem,node);
                $('#imgLoad').attr('src', './api' + node.image);
                $('#imgLoad').ensureLoad(function(){
                    setTimeout(function(){
                        $('.image-wrap-inner object, .image-wrap-inner video').fadeIn();
                        $('.image-wrap-inner .video-js').fadeIn();
                        slideIntroBar($newInfo, _animateTime);
                    },400);
                });
				// resize WMV
				var $wmvIframe = $('.image-wrap-inner iframe');
				if($wmvIframe.length > 0) {
					$wmvIframe.width('100%').height(imgBoxHeight-36);
				}
            }
            // init photo node
            if( node.type == "photo" ){
                $('.image-wrap-inner img').ensureLoad(function(){
                    $(this).fadeIn();
                    slideIntroBar($newInfo, _animateTime);
                });
            }

            // load comment
            bindCommentSubmisson();
            _waitingCommentListAjax = false;
            getCommentList(node.nid,1);
//            LP.use(['jscrollpane' , 'mousewheel'] , function(){
//                $('.com-list').jScrollPane({autoReinitialise:true}).bind(
//                    'jsp-scroll-y',
//                    function(event, scrollPositionY, isAtTop, isAtBottom)
//                    {
//                        if(isAtBottom) {
//                            var commentParam = $('.comment-wrap').data('param');
//                            getCommentList(node.nid,commentParam.page + 1);
//                        }
//                    }
//                );
//            });

            // change url
            changeUrl('/nid/' + node.nid , {event: direction});
        });
    }

    /**
     * @desc: preload sibling images
     * @date:
     */
    function preLoadSiblings(){
        var nodes = $main.data('nodes');
        var aftfix = '_650_650.jpg';
        // preload before and after images
        for( var i = 0 ; i < 5 ; i++ ){
            if( nodes[ _currentNodeIndex - i ] ){
                $('<img/>').attr('src' , API_FOLDER + nodes[ _currentNodeIndex - i ].image.replace(/_\d+_\d+\.jpg/ , aftfix ));
            }
            if( nodes[ _currentNodeIndex + i ] ){
                $('<img/>').attr('src' , API_FOLDER + nodes[ _currentNodeIndex + i ].image.replace(/_\d+_\d+\.jpg/ , aftfix ));
            }
        }
    }

    function slideIntroBar($info, _animateTime){
        $info.delay(_animateTime).fadeIn().dequeue()
            .animate({
                bottom: 0
            } , 300);
        $('.inner-topday').delay(_animateTime)
            .animate({
                top: 0
            } , 300);
        $('.inner-topmonth').delay(_animateTime)
            .animate({
                top: 0
            } , 300);
    }

    //for prev action
    LP.action('prev' , function( data ){
        if( _innerLock ) return;
        _innerLock = true;
        if($('.user-page').is(':visible')) {
            var $dom = $('.count-dom');
        } else {
            var $dom = $main;
        }

        // when reach the first, if the content opened via url id, need to check if has previous page
        if( _currentNodeIndex == 0 ){
            var param = $main.data('param');
            if(!param.previouspage || param.previouspage == 1) {
                //alert('no more nodes');
                _innerLock = false;
                return;
            } else {
                param.previouspage --;
                $dom.data('param' , param);
                param.page = param.previouspage;
                api.ajax('recent' , param , function( result ){
                    _currentNodeIndex = param.pagenum - 1;
                    nodeActions.prependNode( $dom , result.data , param.orderby == 'datetime' );
                    cubeInnerNode( $dom.data('nodes')[ _currentNodeIndex ] , 'left' );
                    preLoadSiblings();
                });
            }
            return;
        }
        // lock the animation
        if( $('.inner').hasClass('disabled') ) return;
        $('.inner').addClass('disabled');

        _currentNodeIndex -= 1;
        var node = $dom.data('nodes')[ _currentNodeIndex ];
        cubeInnerNode( node , 'left' );
        preLoadSiblings();
    });

    //for next action
    LP.action('next' , function( data ){
        if( _innerLock ) return;
        _innerLock = true;
        var $inner = $('.inner');
        var $dom = $inner.data('from') || $main;

        // lock the animation
        if( $inner.hasClass('disabled') ) return;
        $inner.addClass('disabled');

        _currentNodeIndex++;
        var nodes = $dom.data('nodes');
        var node = nodes[ _currentNodeIndex ];
        if( !node ){
            // if no more data
            if( $dom.data('end') ){
                _currentNodeIndex--;
                $inner.removeClass('disabled');
                // TODO:: tip no more nodes
                //alert('no more nodes');
                _innerLock = false;
                return;
            }
            //ajax to get more node
            var param = $dom.data('param');
            param.page++;
            $dom.data('param' , param);
            // show loading 
            $('.inner-loading').show();
            api.ajax('recent' , param , function( result ){
                $('.inner-loading').hide();
                if( result.data.length ){
                    nodeActions.inserNode( $dom , result.data , param.orderby == 'datetime' );
                    cubeInnerNode( $dom.data('nodes')[ _currentNodeIndex ] , 'right' );
                    preLoadSiblings();
                } else {
                    $inner.removeClass('disabled');
                    $dom.data('end' , true);
                    // TODO:: tip no more nodes
                    alert('no more nodes');
                    _innerLock = false;
                }
            });
            return;
        }
        cubeInnerNode( node , 'right' );
        preLoadSiblings();
    });

    // get default nodes
    LP.action('recent', function(){
        var pageParam = refreshQuery();
        $listLoading.fadeIn();
        api.ajax('recent', pageParam, function( result ){
            $main.show();
            $listLoading.fadeOut();
            nodeActions.inserNode( $main , result.data , pageParam.orderby == 'datetime' );
        });
    });

    LP.action('load_list', function(){
        // refresh main query parameter
        var pageParam = refreshQuery();
        $main.html('');
        $main.data('nodes', []);
        $listLoading.fadeIn();
        api.ajax('recent', pageParam, function (result) {
            if (result.data.length > 0) {
                nodeActions.inserNode($main.show(), result.data, pageParam.orderby == 'datetime');
                $listLoading.fadeOut();
            }
            else {
                api.ajax('tagTopThree', function(result){
                    var searchs = '';
                    var $selectBox = $('.select-item .select-box').each(function(){
                        searchs += '[' + $(this).html() + '] ';
                    });
                    // if(pageParam.country_id) {
                    //     var countryName = $('.select-country-option-list p[data-param="country_id='+pageParam.country_id+'"]').html();
                    //     result.country_name = countryName;
                    // }
                    result.searchs = searchs;
                    result._e = _e;
                    LP.compile( 'blank-filter-template' ,
                        result,
                        function( html ){
                            $('.main').append(html).fadeIn();
                        } );
                });
            }
        });
    });

    //for like action
    var updateLikeCount = function(nid, count){
        $('.main-item-' + nid).find('.item-like').html(count).toggleClass('item-liked');
        (function(){
            var nodes = $('.main').data('nodes');
			if(!nodes) {
				return;
			}
            var node = jQuery.grep(nodes, function (node) {
                if(node.nid == nid) {
                    return node;
                }
            });
            if(node) {
                node[0].likecount = count;
                node[0].user_liked = !node[0].user_liked;
            }
        })();

        (function(){
            var nodes = $('.count-com').data('nodes');
			if(!nodes) {
				return;
			}
            var node = jQuery.grep(nodes, function (node) {
                if(node.nid == nid) {
                    return node;
                }
            });
            if(node) {
                node[0].likecount = count;
                node[0].user_liked = !node[0].user_liked;
            }
        })();
        LP.triggerAction('update_user_status');
    }

	LP.action('toggle_comment', function( data ){
		var $comMain = $('.com-main');
		if(!$comMain.is(':visible')) {
			$comMain.show()
				.css({y:1000, opacity:0})
				.transit({y:0, opacity:1}, _animateTime, _animateEasing);
		}
		else {
			$comMain.transit({y:1000, opacity:0}, _animateTime, _animateEasing, function(){
				$(this).hide();
			});
		}

	});


    LP.action('like' , function( data ){
        var _this = $(this);
		if(_this.hasClass('disabled')){
			return;
		}
        var _likeWrap = _this.find('span').eq(0);
		_this.addClass('disabled');
		_this.addClass('flashing');
        api.ajax('like', {nid:data.nid}, function( result ){
			_this.removeClass('flashing');
            setTimeout(function(){
				_this.removeClass('disabled');
            },1000);
            if(result.success) {
                _likeWrap.animate({opacity:0},function(){
                    _likeWrap.html(result.data);
                    _this.data('liked',true);
                    _this.attr('data-a','unlike');
                    _this.addClass('com-unlike');
                    _this.append('<div class="com-unlike-tip">' + _e.UNLIKE + '</div>');
                    $(this).animate({opacity:1});
                });
                updateLikeCount(data.nid, result.data);
            }
        });
    });

    LP.action('unlike' , function( data ){
        var _this = $(this);
		if(_this.hasClass('disabled')){
			return;
		}
        var _likeWrap = _this.parent().find('span').eq(0);
		_this.addClass('disabled');
		_this.addClass('flashing');
        api.ajax('unlike', {nid:data.nid}, function( result ){
			_this.removeClass('flashing');
            setTimeout(function(){
				_this.removeClass('disabled');
            },1000);
            if(result.success) {
                _likeWrap.animate({opacity:0},function(){
                    _likeWrap.html(result.data);
                    _this.parent().data('liked',false);
                    _this.removeClass('com-unlike');
                    _this.attr('data-a','like');
                    _this.find('.com-unlike-tip').remove();
                    $(this).animate({opacity:1});
                });
                updateLikeCount(data.nid, result.data);
            }
        });
    });


    //for flag node action
    LP.action('flag' , function( data ){
        // if this node already flagged, return the action
        if($(this).hasClass('flagged')) {
            return false;
        }
        // display the modal before submit flag
        if(!$('.flag-confirm-modal').is(':visible')) {
            $('.modal-overlay').fadeIn(700);
            $('.flag-confirm-modal').fadeIn(700).dequeue().animate({top:'50%'}, 700, 'easeOutQuart');
            $('.flag-confirm-modal .flag-confirm-text span').html(data.type);
            $('.flag-confirm-modal .ok').attr('data-a','flag');
            if(data.type == 'node') {
                $('.flag-confirm-modal .ok').attr('data-d','nid=' + data.nid + '&type=node');
            }
            if(data.type == 'comment') {
                $('.flag-confirm-modal .ok').attr('data-d','cid=' + data.cid + '&nid=' + data.nid + '&type=comment');
            }
        }
        else {
            if(data.type == 'node') {
                api.ajax('flag', {nid:data.nid});
                $('.inner-icons .flag-node').addClass('flagged').removeClass('btn2').removeAttr('data-a');
            }
            if(data.type == 'comment') {
                api.ajax('flag', {cid:data.cid, comment_nid:data.nid});
                $('.comlist-item-' + data.cid).find('.comlist-flag').addClass('flagged').removeClass('btn2').removeAttr('data-a');
            }
            LP.triggerAction('cancel_modal');
        }
    });


    //for delete comment action
    LP.action('delete' , function( data ){
        if(!$('.delete-confirm-modal').is(':visible')) {
            $('.modal-overlay').fadeIn(700);
            $('.delete-confirm-modal').fadeIn(700).dequeue().animate({top:'50%'}, 700, 'easeOutQuart');
            $('.delete-confirm-modal .flag-confirm-text span').html(data.type);
            $('.delete-confirm-modal .ok').attr('data-a','delete');
            if(data.type == 'node') {
                $('.delete-confirm-modal .ok').attr('data-d','nid=' + data.nid + '&type=node');
            }
            if(data.type == 'comment') {
                $('.delete-confirm-modal .ok').attr('data-d','cid=' + data.cid + '&type=comment');
            }
        }
        else
        {
            if(data.type == 'comment') {
                $('.comlist-item-' + data.cid).fadeOut();
                api.ajax('deleteComment', data, function(){
                    LP.triggerAction('update_user_status');
                });
            }
            if(data.type == 'node') {
                $('.main-item-' + data.nid).css({width:0, opacity:0});
                setTimeout(function(){
                    $('.main-item-' + data.nid).remove();
                    (function(){
                        var nodes = $('.count-com').data('nodes');
                        var index = -1;
                        jQuery.grep(nodes, function (node, i) {
                            if(node.nid == data.nid) {
                                index = i;
                            }
                        });
                        if(index != -1) {
                            nodes.splice(index, 1);
                        }
                    })();

                    (function(){
                        var nodes = $('.main').data('nodes');
                        var index = -1;
                        jQuery.grep(nodes, function (node, i) {
                            if(node.nid == data.nid) {
                                index = i;
                            }
                        });
                        if(index != -1) {
                            nodes.splice(index, 1);
                        }
                    })();

                },1000);
                api.ajax('deleteNode', data, function(){
                    LP.triggerAction('update_user_status');
                });
            }
            LP.triggerAction('cancel_modal');
            LP.triggerAction('update_user_status');
        }
    });

    //upload photo
    LP.action('pop_upload' , function( data ){
        var acceptFileTypes;
        var type = data.type;
        if(type == 'video') {
            data.accept = 'video/*,video/mp4';
        } else {
            data.accept = 'image/*';
        }
        $('.side .menu-item.'+type).addClass('active');
        data._e = _e;
        LP.compile( "pop-template" , data,  function( html ){
            $(document.body).append( html );
            $('.overlay').fadeIn();
            $('.pop').fadeIn(_animateTime).dequeue()
				.css({y:-500, opacity:0})
				.transit({y:127, opacity:1}, _animateTime , _animateEasing);

            var $fileupload = $('#fileupload');
            if(type == 'video') {
                acceptFileTypes = /(\.|\/)(mov|wmv|mp4|avi|mpg|mpeg|3gp)$/i;
                var maxFileSize = 7 * 1024000;
            } else {
                acceptFileTypes = /(\.|\/)(gif|jpe?g|png)$/i;
                var maxFileSize = 5 * 1024000;
                // init event
                transformMgr.initialize();
            }
			LP.use('fileupload' , function(){
				$fileupload.fileupload({
					url: '../api/index.php/uploads/upload',
					datatype:"json",
					autoUpload:false
				})
					.bind('fileuploadadd', function (e, data) {
						$('.step1-tips li').removeClass('error');
						if(!acceptFileTypes.test(data.files[0].name.toLowerCase())) {
							$('.step1-tips li').eq(0).addClass('error');
						}
						else if(data.files[0].size > maxFileSize) {
							$('.step1-tips li').eq(2).addClass('error');
						}
						else {
							data.submit();
						}
					})
					.bind('fileuploadstart', function (e, data) {
						$('.pop-inner').fadeOut(400);
						$('.pop-load').delay(400).fadeIn(400);
					})
					.bind('fileuploadprogress', function (e, data) {
						var rate = data._progress.loaded / data._progress.total * 100;
						var $bar = $('.popload-percent p');
						var currentRate = $bar.data('rate');
						if(!currentRate) {
							currentRate = 0;
						}
						if(rate > currentRate) {
							$bar.data('rate',rate).css({width:rate + '%'});
						}
					})
					.bind('fileuploadfail', function() {
						$('.pop-inner').fadeOut(400);
						$('.pop-file').delay(400).fadeIn(400);
					})
					.bind('fileuploaddone', function (e, data) {
						if(!data.result.success) {
							switch(data.result.message){
								case 502:
									var errorIndex = 0;
									break;
								case 501:
									var errorIndex = 2;
									break;
								case 503:
									var errorIndex = 1;
									break;
							}
							$('.pop-inner').fadeOut(400);
							$('.pop-file').delay(800).fadeIn(400);
							$('.step1-tips li').removeClass('error');
							$('.step1-tips li').eq(errorIndex).addClass('error');
						} else {
							var rdata = data.result.data;

							if(rdata.type == 'video') {
								$('.poptxt-pic-inner').show();
								$('.poptxt-pic img')
									.unbind('load.forinnershow')
									.bind('load.forinnershow' , function(){
										$('.pop-inner').delay(400).fadeOut(400);
										$('.pop-txt').delay(1200).fadeIn(400);
									})
									.attr('src', API_FOLDER + rdata.file.replace('.mp4', /*THUMBNAIL_IMG_SIZE + */'.jpg'));
								// TODO:: why need timeout?
//                                setTimeout(function(){
//                                    $('.poptxt-pic img').attr('src',$('.poptxt-pic img').attr('src') + '?' + new Date().getTime() );
//                                },2000);
								$('.poptxt-submit').attr('data-d','file='+ rdata.file +'&type=' + rdata.type);

							} else {
								if (data.files && data.files[0] && window.FileReader ) {
									//..create loading
									var reader = new FileReader();
									reader.onload = function (e) {
										// change checkpage img
										$('.poptxt-pic img')
											.unbind('load.forinnershow')
											.bind('load.forinnershow' , function(){
												$('.pop-inner').delay(400).fadeOut(400);
												$('.pop-txt').delay(1200).fadeIn(400);
											})
											.attr('src', e.target.result/*.replace('.jpg', THUMBNAIL_IMG_SIZE + '.jpg')*/);
										$('.poptxt-submit').attr('data-d','file='+ rdata.file +'&type=' + rdata.type);
									};
									reader.readAsDataURL(data.files[0]);
								} else {
									$('.poptxt-pic img')
										.unbind('load.forinnershow')
										.bind('load.forinnershow' , function(){
											$('.pop-inner').delay(400).fadeOut(400);
											$('.pop-txt').delay(1200).fadeIn(400);
										})
										.attr('src', API_FOLDER + rdata.file/*.replace('.jpg', THUMBNAIL_IMG_SIZE + '.jpg')*/);
									$('.poptxt-submit').attr('data-d','file='+ rdata.file +'&type=' + rdata.type);
								}
							}
						}
					});
			});


        } );
    });
    

    //avatar upload
    LP.action('avatar_upload' , function( data ){
        var acceptFileTypes;
        data._e = _e;
        LP.compile( "pop-avatar-template" , data,  function( html ){
            $(document.body).append( html );
            $('.overlay').fadeIn();
            $('.pop').fadeIn(_animateTime).dequeue().animate({top:'50%'}, _animateTime , _animateEasing);

            var $fileupload = $('#avatar_post_form');
            acceptFileTypes = /(\.|\/)(gif|jpe?g|png)$/i;
            //$('#select-btn').html(' SELECT PHOTO <input id="file-photo" type="file" name="photo" />');
            if(isIE8) {
                $fileupload.append('<input type="hidden" name="iframe" value="true" />');
                $fileupload.find('input').change(function(){
                    $fileupload.submit();
                    $('.step1-btns').fadeOut();
                });
            }
            else {
                var maxFileSize = 5 * 1024000;
                // init event
                transformMgr.initialize();
                LP.use('fileupload' , function(){
                    // Initialize the jQuery File Upload widget:
                    $fileupload.fileupload({
                        // Uncomment the following to send cross-domain cookies:
                        //xhrFields: {withCredentials: true},
                        url: './api/index.php/uploads/upload',
                        maxFileSize: 5000000,
                        acceptFileTypes: acceptFileTypes,
                        autoUpload:false
                    })
                        .bind('fileuploadadd', function (e, data) {
                            if(data.files[0].size > maxFileSize) {
                                $('.step1-tips li').eq(3).addClass('error');
                            } else {
                                $('.step1-tips li').eq(3).removeClass('error');
                                data.submit();
                            }
                        })
                        .bind('fileuploadstart', function (e, data) {
                            $('.pop-inner').fadeOut(400);
                            $('.pop-load').delay(400).fadeIn(400);
                        })
                        .bind('fileuploadprogress', function (e, data) {
							var rate = data._progress.loaded / data._progress.total * 100;
							var $bar = $('.popload-percent p');
							var currentRate = $bar.data('rate');
							if(!currentRate) {
								currentRate = 0;
							}
							if(rate > currentRate) {
								$bar.data('rate',rate).css({width:rate + '%'});
							}
                        })
                        .bind('fileuploadfail', function() {
                            $('.pop-inner').fadeOut(400);
                            $('.pop-file').delay(400).fadeIn(400);
                        })
                        .bind('fileuploaddone', function (e, data) {
                            if( !data.result.success ){
                                switch(data.result.message){
                                    case 502:
                                        var errorIndex = 0;
                                        break;
                                    case 501:
                                        var errorIndex = 2;
                                        break;
                                    case 503:
                                        var errorIndex = 1;
                                        break;
                                }
                                $('.pop-inner').fadeOut(400);
                                $('.pop-file').delay(800).fadeIn(400);
                                $('.step1-tips li').eq(errorIndex).addClass('error');
                            } else{
                                var rdata = data.result.data;

                                $('.poptxt-pic img').attr('src', API_FOLDER + rdata.file/*.replace('.jpg', THUMBNAIL_IMG_SIZE + '.jpg')*/);
                                $('.poptxt-submit').attr('data-d','file='+ rdata.file +'&type=' + rdata.type);
                                $('.pop-inner').delay(400).fadeOut(400);
                                $('.pop-txt').delay(1200).fadeIn(400);
                            }
                        });
                });
            }

        });
    });


    //close pop
    LP.action('close_pop' , function(){
        $('.overlay').fadeOut(function(){$(this).remove();});
        $('.pop').fadeOut(700, function(){$(this).remove();}).dequeue().animate({top:'-40%'}, 700 , 'easeInQuart');
        $('.side .menu-item.video,.side .menu-item.photo').removeClass('active');
    });

    //cancel confirm modal
    LP.action('cancel_modal' , function(){
        $('.pop-modal').fadeOut(700).dequeue().animate({top:'-40%'},700,'easeInQuart');
        $('.modal-overlay').fadeOut(700);
    });

    //close pop
    LP.action('search_tip' , function(){
        $('.search-tip-modal').fadeIn(700).dequeue().animate({top:'50%'},700,'easeOutQuart');
        $('.modal-overlay').fadeIn(700);
    });

    //select photo
    LP.action('select_photo' , function(){
		if(isIE8 && FlashDetect.installed) {
			$('#flash-select-btn object').trigger('click');
		}
		else {
			$('#select-btn input[type="file"]').trigger('click');
		}
    });

    //select photo
    LP.action('upload_photo' , function(){
        $('.pop-inner').fadeOut(400);
        //TODO uploading
        $('.pop-load').delay(400).fadeIn(400);
        $('.pop-load').delay(400).fadeOut(400);
        $('.pop-txt').delay(800).fadeIn(400);
    });

    //save the content description
    LP.action('save_node' , function(data){
        var description = $('#node-description').val();
        if(description.length == 0) {
            $('.poptxt-preview .error').html(_e.ERROR_WRITE_DESCRIPTION).fadeIn();
            return;
        }
        if(description.length > 140) {
            $('.poptxt-preview .error').html(_e.ERROR_DESCRIPTION_LIMITED).fadeIn();
            return;
        }
        if(!LP.checkIllegalTags(description)) {
            $('.poptxt-preview .error').html(_e.ERROR_DESCRIPTION_ILLEGAL).fadeIn();
            return;
        }
        if(!$('.poptxt-check').hasClass('checked')) {
            $('.poptxt-preview .error').fadeOut();
            $('.poptxt-check .error').fadeIn();
            return;
        }
        $('.poptxt-check .error').fadeOut();

        if(isIE8) {
            LP.use('flash-detect', function(){
                if(!FlashDetect.installed) {
                    $('#node_post_form').submit();
                    return;
                }
            });
        }

        // get image scale , rotate , zoom arguments
        if(data.type == 'photo') {
            var trsdata = transformMgr.result();
            delete trsdata.src;
        }

        var $dom = $(this);
        if( $dom.hasClass('disabled') ) return;
        $dom.addClass('disabled');
        // add loading tag
        $('.pop-uploadloading').show();
        api.ajax('saveNode' , $.extend( {file: data.file, type: data.type, description: description} , trsdata ), function( result ){
            if(result.success) {

//                //TODO: insert the content to photo wall instead of refresh
//                $main.html('');
//                $main.data('nodes' , []);
//                var param = $main.data('param');
//                param.page = 0;
//                $main.data('param', param);
//                api.ajax('recent', param, function( result ){
//                    nodeActions.inserNode( $main , result.data , param.orderby == 'datetime' );
//                });
//
                LP.triggerAction('get_fresh_nodes');
                $('.pop-inner').fadeOut(400);
                $('.pop-success').delay(400).fadeIn(400);
                setTimeout(function() {
                    LP.triggerAction('close_pop');
                },1500);
            };
        } , null , function(){
            $dom.removeClass('disabled');
            // hide loading tag
            $('.pop-uploadloading').hide();
        });
    });

    LP.action('avatar_save' , function( data ){
        var trsdata = transformMgr.result();
        var $dom = $(this);
        if( $dom.hasClass('disabled') ) return;
        $dom.addClass('disabled');
        // add loading tag
        $('.pop-uploadloading').show();
        api.ajax('saveAvatar' , $.extend( trsdata , data ) , function( result ){
            if( result.success ){
                // hide the panel
                $('.popclose').trigger('click');
                // change all avatar image
                $('.user-pho , .count-userpho').find('img')
                    .attr('src' , './api' + result.data.file+'?'+ new Date().getTime() );
            } else {
                // TODO:: show error
            }
        } , null , function(){
            $dom.removeClass('disabled');
            $('.pop-uploadloading').hide();
        });
    });

	//toggle side bar
	LP.action('toggle_side_bar', function(){
		console.log('toggle');
		var $side = $('.side');
		if($side.hasClass('closed')) {
			$side.removeClass('closed').transit({x:0}, 300, 'easeOutQuart');
		}
		else {
			$side.addClass('closed').transit({x:-165}, 300, 'easeInQuart');
		}
	});

    //toggle user page
    LP.action('toggle_user_page' , function(){
        if(!$('.user-page').is(':visible')) {
            var mainWidth = winWidth;
            var slidWidth = 80;
			$('body').css({overflowY:'visible'});
            $('.inner').fadeOut(400);
            $('.main').fadeOut(400);
            $('.count').css({left:-240}).delay(400).animate({left:80});
            $('.user-page').css({left:- mainWidth , width: mainWidth - slidWidth })
                .delay(100)
                .show()
                .animate({left:slidWidth}, 600, 'easeOutQuart' , function(){
                    $(this).css('width' , 'auto');
                    // if first loaded , load user's nodes from server
                    var user = $('.side').data('user');
                    var param = {page:1,pagenum:20, uid:user.uid, orderby:'datetime'};
                    var $countCom = $(this).find('.count-com');
                    $countCom.data('param', param);
                    if( !$countCom.children().length ){
                        api.ajax('recent' , param , function( result ){
                            nodeActions.inserNode( $countCom , result.data , true );
                        });
                    }
                    // remove inner section
                    $('.inner').remove();

                    // reversal
                    nodeActions.setItemWidth( $countCom );
                    nodeActions.setItemReversal( $countCom );
                });
            $('.close-user-page').fadeIn();
            changeUrl('/user' , { event: 'user' });
            resizeUserBox();
        } else {
            changeUrl('' , { event: 'user' });
            LP.triggerAction('close_user_page');
            // LP.triggerAction('load_list');
            // continue to res
            $main.show();
            nodeActions.setItemWidth( $main );
            nodeActions.setItemReversal( $main );
        }
    });

    // List user nodes
    LP.action('list_user_nodes', function(data){
        if($('.user-edit-page').is(':visible')) {
            $('.user-edit-page').fadeOut(400);
            $('.avatar-file').fadeOut();
            $('.count-com').delay(400).fadeIn(400);
            $('.count-edit').fadeIn();
            $('.count-userinfo').removeClass('count-userinfo-edit');
        }
        var type = data.type;
        var param = $('.count-com').data('param');
        param.page = 1;
        delete param.type;
        delete param.start;
        delete param.mycomment;
        delete param.mylike;
        delete param.topmonth;
        delete param.topday;
        switch(data.type) {
            case 'photo':
                param.type = 'photo';
                break;
            case 'video':
                param.type = 'video';
                break;
            case 'day':
                param.topday = 1;
                break;
            case 'month':
                param.topmonth = 1;
                break;
            case 'comment':
                param.mycomment = true;
                break;
            case 'like':
                param.mylike = true;
                break;
        }
        var $countCom = $('.count-com').removeData('nodes').fadeOut(function(){
            param.page = 1;
            $(this).html('').show();
            $('.loading-list').fadeIn();
            api.ajax('recent' , param , function( result ){
                $('.loading-list').fadeOut();
                nodeActions.inserNode( $countCom , result.data , true );
            });
        });
    });

    //close user page
    LP.action('close_user_page' , function(){
        var mainWidth = winWidth - _silderWidth;
        $('.user-page').find('.count')
            .animate({
                'left': -240
            } , 300,'easeInQuart' )
            .end()
            .delay( 100 )
            .css('width' , mainWidth )
            .animate({left:-mainWidth},400,'easeInQuart' , function(){
                $(this).hide();
            });
        $('.close-user-page').fadeOut();
        //$main.css({position:'relative',top:'auto',left:'auto'});
    });

    //open user edit page
    LP.action('open_user_edit_page' , function(){
        $('.count-com').fadeOut(400);
        $(this).fadeOut();
        $('.user-edit-page').delay(400).fadeIn(400, function(){
            resizeUserBox();
        });
        $('.avatar-file').fadeIn();
        $('.count-userinfo').addClass('count-userinfo-edit');
        var $countryList = $('.editfi-country-option');
        LP.use(['jscrollpane' , 'mousewheel'] , function(){
            $('.editfi-country-option-list').jScrollPane({autoReinitialise:true});
        });
        $countryList.empty();
        api.ajax('countryList', function( result ){
            var htmls = [];
            $.each(result, function(index, item){
                htmls.push( '<p data-id="' + item.country_id + '">' + item.country_name + '</p>' );
            });
            $countryList.append(htmls.join(''));
        });
    });

    //save user updates
    LP.action('save_user' , function(){
        $('.user-edit-loading').fadeIn();
        if($('.edit-email-error').is(':visible')) return;
        if(!$('.editfi-condition').hasClass('checked')) {
            $('.editfi-condition-error').fadeIn();
            $('.user-edit-loading').fadeOut();
            return;
        }
        var user = {uid:$('.side').data('user').uid, personal_email: $('.user-edit-page .edit-email').val(), country_id: $('.user-edit-page .editfi-country-box').data('id')}
        api.ajax('saveUser', user, function( result ){
            if(result.success) {
                $('.user-edit-page').fadeOut(400);
                $('.avatar-file').fadeOut();
                $('.count-com').delay(400).fadeIn(400);
                $('.count-edit').fadeIn();
                $('.count-userinfo').removeClass('count-userinfo-edit');
            }
            else if(result.message === 603) {
                $('.edit-email-error').html(_e.ERROR_EXIST_EMAIL).fadeIn();
            }
        }, null, function(){
            $('.user-edit-loading').fadeOut();
        });
    });

    //close user page
    LP.action('logout' , function(){
        api.ajax('logout', function( result ){
            if(result.success) {
                window.location.reload();
            }
        });
    });

    //save user updates
    LP.action('search' , function(data){
        if(data && data.tag) {
            $('.search-ipt').val(data.tag); // this is use for clicking top hash tag feature on blank search page
        }
        if($('.search-ipt').val().length == 0) {
            return false;
        }
        // back to homepage
        if($main.hasClass('closed')){
            LP.triggerAction('back');
        }
        $main.fadeOut(100,function(){
            LP.triggerAction('close_user_page');
            $main.html('').fadeIn();
            $main.data('nodes','');
            var param = refreshQuery();
            $listLoading.fadeIn();
            api.ajax('recent', param , function( result ){
                $listLoading.fadeOut();
                $('.search-ipt').val('').blur();
                $('.search-hd').fadeIn().find('span').html(param.hashtag);
                if(result.data.length > 0) {
                    nodeActions.inserNode( $main.show() , result.data , param.orderby == 'datetime');
                }
                else {
                    api.ajax('tagTopThree', function(result){
                        result._e = _e;
                        LP.compile( 'blank-search-template' ,
                            result,
                            function( html ){
                                $('.main').append(html);
                            } );
                    });

                }
            });
        });
    });


    // get last day nodes
    LP.action('content_of_day' , function(){
        if($main.hasClass('closed')) {
            LP.triggerAction('back');
        }
        $('.search-hd').fadeOut(400);
        $main.fadeOut(400,function(){
            LP.triggerAction('close_user_page');
            $main.html('');
            $main.data('nodes','');
            //TODO this method need to reset selected items to default value
            resetQuery();
            var param = refreshQuery();
            param = $.extend(param, {'topday': 1});
            $('.side .menu-item.day, .side .menu-item.jour').addClass('active');
            $listLoading.fadeIn();
            //TODO save to dom cache date
            api.ajax('recent', param , function( result ){
                $('.search-ipt').val('').blur();
                nodeActions.inserNode( $main.show() , result.data , param.orderby == 'datetime');
            });
        });

        changeUrl( '/cod' , {event:'com'} );
    });

    // get last day nodes
    LP.action('content_of_month' , function(){
        if($main.hasClass('closed')) {
            LP.triggerAction('back');
        }
        $('.search-hd').fadeOut(400);
        $main.fadeOut(400,function(){
            LP.triggerAction('close_user_page');
            $main.html('');
            $main.data('nodes','');
            //TODO this method need to reset selected items to default value
            resetQuery();
            var param = refreshQuery();
            param = $.extend(param, {'topmonth': 1});
            $('.side .menu-item.month').addClass('active');
            $listLoading.fadeIn();
            //TODO save to dom cache date
            api.ajax('recent', param , function( result ){
                $('.search-ipt').val('').blur();
                nodeActions.inserNode( $main.show() , result.data , param.orderby == 'datetime');
            });
        });

        // change url
        changeUrl( '/com' , {event:'com'} );
    });

    // zoom video
    LP.action('video_zoom', function(){
        var $video = $('.video-js .vjs-tech');
        if($video.hasClass('zoom')) {
            $video.removeClass('zoom');
            $(this).removeClass('active');
            $('.vjs-poster').css('background-size','contain');
            $video.height('100%').width('100%').css('margin',0);
        }
        else {
            $video.addClass('zoom');
            $(this).addClass('active');
            $('.vjs-poster').css('background-size','cover');
            resizeInnerBox();
            $(window).trigger('resize');
        }
    });

    LP.action('update_user_status', function(){
        // after page load , load the current user information data from server
        api.ajax('user' , function( result ){
            if(result.success) {
                //bind user data after success logged
                if(result.data.count_by_day == 0) {
                    delete result.data.count_by_day;
                }
                if(result.data.count_by_month == 0) {
                    delete result.data.count_by_month;
                }
                if(!result.data.avatar) {
                    result.data.avatar = "/uploads/default_avatar.gif";
                }
                result.data._e = _e;
                LP.compile( 'user-page-template' , result.data , function( html ){
                    $('.user-page .count').html($(html).find('.count').html());
                });
            }
        });
    });

    LP.action('get_fresh_nodes', function(){
        // if main element is visible
        if( $main.is(':hidden') ) return;
        var nodes = $main.data('nodes');
        var param = $main.data('param');
        var lastNid = nodes && nodes.length ? nodes[0].nid : null;

        param = $.extend( {} , param );
        param.page = 1;
        api.ajax('recent' , param , function( r ){
            if( !r.data || !r.data.length ) return;
            var nodes = [];
            $.each( r.data , function( i , node ){
                if( node.nid == lastNid ){
                    return false;
                } else {
                    nodes.push( node );
                }
            } );

			var count = nodes.length;
			var loaded = 0;
			// preload images before insert
			$.each(nodes, function(i, node){
				var image = node.file.split('.')[0] + '_250_250.jpg';
				$('<img/>').attr('src' , API_FOLDER + image).ensureLoad(function(){
					loaded ++;
					if(count == loaded) {
						// insert node
						nodeActions.prependNode( $main , nodes , param.orderby == "datetime" );
					}
				});
			});

        } );
    });


    //after selected photo
//    $('#file-photo').change(function(){
//        $('.pop-file .step1-btns').fadeOut(400);
//        $('.pop-file .step2-btns').delay(400).fadeIn(400);
//    });



    // bind document key event for back , prev , next actions
    $(document).keydown(function( ev ){
        var $inner = $('.inner');
        if( !$inner.length || !$inner.is(':visible') ) return;
        switch( ev.which ){
            case 37: // left
                LP.triggerAction('prev');
                break;
            case 39: // right
                LP.triggerAction('next');
                break;
            case 27: // esc
				ev.preventDefault();
                LP.triggerAction('back');
                break;
        }
    });

    // get month
    var getMonth = (function(){
        return function( date ){
            date = date || new Date;
            var month;
            if( typeof date == 'object' ){
                month = date.getUTCMonth();
            } else {
                month = date - 1;
            }
            return aMonth[ month ];
        }
    })();


    // get all query parameter
    var refreshQuery = function( query ){
        // get search value
        var $searchInput = $('.search-ipt');
        var param = { page: 1 , pagenum: 20 };
        param [ $searchInput.attr('name') ] = $.trim( $searchInput.val() ).replace( /^#+/ , '' );

        // get select options
        $('.header .select').find('.select-option p.selected')
            .each( function(){
                param = $.extend( param , LP.query2json( $(this).data('param') ) );
            } );

        $main.data('param' , $.extend( param , query || {} ) );

        // change hash
        var param = $main.data('param');
        var str = '';
        $.each( ['orderby' , 'type' , 'country'] , function( i , val){
            if( param[val] ){
                str += '/' + val + '/' + param[val];
            }
        } )

        $('.side .menu-item').removeClass('active');

        return $main.data('param');
    }

    var resetQuery = function() {
        var param = $main.data('param') || {};
        param.orderby = "datatime";
        delete param.country_id;
        $main.data('param',param);
        $.each($('.select-item'), function(index, item){
            $(item).find('.select-option p').removeClass('selected');
            var defaultVal = $(item).find('.select-option p').eq(0).addClass('selected').html();
            $(item).find('.select-box').html(defaultVal);
        })
    }


    var currentHash = location.hash;
    var changeUrl = function( str , data ){
		if(history.pushState && str == '') {
			history.replaceState("", document.title, window.location.pathname
				+ window.location.search);
			return;
		}
        location.hash = '#' + str; // removed the !, don't need search by google
        if( history.pushState ){
            history.replaceState( data , '' , location.href ) ;
        } else {
            location.hash = '#' + str;
        }
        currentHash = location.hash;
    };

    changeUrl( location.hash.replace('#' , '') , {event:'load'} );

    // bind history change
    (function(){
        $(window).bind('popstate' , function( ev ){
            if( !ev.originalEvent.state || !ev.originalEvent.state.event ) return;
            $.each( transitions , function( i , trans ){
                var lastUrl = currentHash.replace('#' , '');
                var currUrl = location.hash.replace('#' , '');
                if( trans.prev.test( lastUrl ) && 
                    trans.curr.test( currUrl ) ){
                    trans.fn( lastUrl , currUrl );
                    return false;
                }
            } );
            currentHash = location.hash;
        });

        // run the right transition for back or prev btn event on browser.
        var transitions = [];
        function addTransition( lastReg , currReg , fn ){
            transitions.push({
                prev: lastReg,
                curr: currReg,
                fn : fn
            });
        }

        // /nid/xx ==> /nid/xx
        addTransition( /^\/nid\/\d+/ , /^\/nid\/\d+/ , function( lastUrl , currUrl ){
            var lnid = lastUrl.match(/\d+/)[0];
            var nid = currUrl.match(/\d+/)[0];
            LP.triggerAction( lnid > nid ? 'next' : 'prev' );
        } );
        //  ==> /nid/xx
        addTransition( /^#?$/ , /^\/nid\/\d+/ , function( lastUrl , currUrl ){
            var nid = currUrl.match(/\d+/)[0];
            $main.children('[data-d="nid=' + nid + '"]').trigger('click');
        } );
        //  /nid/xx ==> 
        addTransition( /^\/nid\/\d+/ , /^#?$/ , function( lastUrl , currUrl ){
            LP.triggerAction('back');
        } );

        // * ==> /user 
        addTransition( /.*/ , /^\/user/ , function( lastUrl , currUrl ){
            LP.triggerAction('toggle_user_page');
        } );

        // /user ==> *
        addTransition( /^\/user/ , /.*/ , function( lastUrl , currUrl ){
            LP.triggerAction('toggle_user_page');
        } );


        // * ==> /com
        addTransition( /.*/ , /^\/com/ , function( lastUrl , currUrl ){
            LP.triggerAction('content_of_month');
        } );
        // /com ==> /nid
        addTransition( /^\/(com|cod)/ ,  /^\/nid\/\d+/ , function( lastUrl , currUrl ){
            var nid = currUrl.match(/\d+/)[0];
            $main.children('[data-d="nid=' + nid + '"]').trigger('click');
        } );
        // /com ==> /user
        addTransition( /^\/(com|cod)/ ,  /^\/nid\/\d+/ , function( lastUrl , currUrl ){
            LP.triggerAction('toggle_user_page');
        } );
        // /com ==> /^$/
        addTransition( /^\/(com|cod)/ ,  /^$/ , function( lastUrl , currUrl ){
            LP.triggerAction('back_home');
        } );
        
        // * ==> /cod
        addTransition( /.*/ , /^\/cod/ , function( lastUrl , currUrl ){
            LP.triggerAction('content_of_day');
        } );
    })();



    var getUrlHash = function() {
        var hash = location.hash;
        var path = hash.split('/');
        path = path.splice(1,path.length-1);
        return path;
    }

    //-----------------------------------------------------------------------
    // init drag event for image upload
    // after image upload, init it's size to fix the window
    // use raephael js to rotate, scale , and drag the image photo
    var transformMgr = (function(){
        var isDragging      = false;
        var isMousedown     = false;
        var startPos        = null;
        var totalMoveX      = 0;
        var totalMoveY      = 0;
        var lastMoveX       = 0;
        var lastMoveY       = 0;

        var maxDistance = 200;

        $(document).mouseup(function(){
            // reset states
            if( !isMousedown ) return;
            isDragging      = false;
            isMousedown     = false;
            startPos        = null;
            totalMoveX += lastMoveX;
            totalMoveY += lastMoveY;

            lastMoveX = 0;
            lastMoveY = 0;


            // // reset center button
            // $centerBtn.animate({
            //     marginLeft  : oMleft,
            //     marginTop   : oMtop,
            //     opacity     : 1
            // } , 300 );
        });

        // init ps_btn_up
        var perRotate   = 10;
        var perScale    = 1.1;

        var totalScale  = 1;
        var totalRotate = 0;
        var transforms = [];

        var trsReg = /T(-?[0-9.]+),(-?[0-9.]+)/;
        var scaReg = /S(-?[0-9.]+),(-?[0-9.]+),(-?[0-9.]+),(-?[0-9.]+)/;
        var rotReg = /R(-?[0-9.]+),(-?[0-9.]+),(-?[0-9.]+)/;

        var transform = function( x , y , s , r , animate ){
            animate = animate === undefined ? true : animate;
            var left = x === undefined ? totalMoveX : x;
            var top = y === undefined ? totalMoveY : y;
            var scale = s === undefined ? totalScale : s;
            var rotate = r === undefined ? totalRotate : r;
            var transformValue = imgRaphael.transform();

            var match = null;
            // move 
            if( x !== undefined ){
                if( transforms.length && ( match = transforms[transforms.length-1].match( trsReg ) ) ){
                    transforms[transforms.length-1] = "T" + ( x + parseFloat( match[1] ) ) + ',' + ( y + parseFloat( match[2] ) );
                } else {
                    transforms.push( "T" + x + ',' + y );
                }

                 imgRaphael.transform( transforms.join('') );
            }
            if( s !== undefined ){
                if( transforms.length && ( match = transforms[transforms.length-1].match( scaReg ) ) ){
                    transforms[transforms.length-1] = "S" + ( s * parseFloat( match[1] ) ) + ','
                         + ( s * parseFloat( match[2] ) )
                         + "," + match[3]
                         + "," + match[4];
                } else {
                    transforms.push( "S" + s + ',' + s + ',' + (tarWidth/2) + "," + (tarHeight/2) );
                }

                if( animate ){
                    imgRaphael.animate({
                        transform: transforms.join('')
                    } , 200);
                } else {
                    imgRaphael.transform( transforms.join('') );
                }
            }
            if( r !== undefined ) {
                if( transforms.length && ( match = transforms[transforms.length-1].match( rotReg ) ) ){
                    transforms[transforms.length-1] = "R" + ( r + parseFloat( match[1] ) ) 
                        + "," + match[2]
                        + "," + match[3];
                } else {
                    transforms.push( "R" + r + ',' + (tarWidth/2) + "," + (tarHeight/2) );
                }

                imgRaphael.animate({
                    transform: transforms.join('')
                } , 200);
            }
        }

        var $poptxtpic = null;
        var $picInner = null;
        var tarHeight   = null;
        var tarWidth    = null;

        var imgRaphael = null;
        var raphael = null;
        var forExpr = 20;

        function reset(){
            isDragging      = false;
            isMousedown     = false;
            startPos        = null;
            totalMoveX      = 0;
            totalMoveY      = 0;
            lastMoveX       = 0;
            lastMoveY       = 0;

            totalScale  = 1;
            totalRotate = 0;
            transforms  = [];
        }

        var initialize = function(){
            reset();
            perRotate   = 10;
            perScale    = 1.1;

            totalScale  = 1;
            totalRotate = 0;
            transforms = [];

            $poptxtpic = $('.poptxt-pic');
            $picInner = $('.poptxt-pic-inner');
            tarHeight   = $picInner.height();
            tarWidth    = $picInner.width();

            imgRaphael = null;
            raphael = null;

            $picInner.find('img').load(function(){
                $(this).css({
                    width: 'auto',
                    height: 'auto'
                })
                .show();
                $picInner.delay(2000).fadeIn();
                // remove last sav
                var img = this;
                
                LP.use('raphael' , function(){
                    var width   = img.width;
                    var height  = img.height;
                    if( width / height > tarWidth / tarHeight ){
                        width   = width / height * ( tarHeight + forExpr );
                        height  = tarHeight + forExpr;
                    } else {
                        height  = height / width * ( tarWidth + forExpr );
                        width   = tarWidth + forExpr;
                    }
                    if( !raphael ){
                        raphael = Raphael( img.parentNode , tarWidth, tarHeight);
                        imgRaphael = raphael.image( img.src , 0 , 0 , width, height);
                    }
                    raphael.setSize( tarWidth , tarHeight );

                    // reset transform
                    imgRaphael.attr({
                        src     : img.src,
                        width   : width,
                        height  : height
                    })
                    .transform('');
                    transformMgr.reset();
                    transformMgr.transform('T' + parseInt( (tarWidth - width ) / 2) + ',' + parseInt( ( tarHeight - height ) / 2 ) );
                    $(img).css({
                        width: width,
                        height : height
                    })
                    .hide();
                });
            });
    
            var minWidth = $('.poptxt-pic-inner').width();
            var minHeight = $('.poptxt-pic-inner').height();

            $poptxtpic.mousedown( function( ev ){
                isMousedown = true;
                startPos = {
                    pageX     : ev.pageX
                    , pageY   : ev.pageY
                }
                return false;
            })
            .mousemove( function( ev ){
                if( !isMousedown ) return;
                if( !isDragging ){
                    if( Math.abs( ev.pageX - startPos.pageX ) + Math.abs( ev.pageY - startPos.pageY ) >= 10 ){
                        isDragging = true;
                    } else {
                        return false;
                    }
                }
                // move images
                if( !imgRaphael ) return;

                var mx = ev.pageX - startPos.pageX - lastMoveX;
                var my = ev.pageY - startPos.pageY - lastMoveY;
                var off = imgRaphael.getBBox();
                if( off.x + mx >= 0 || off.width + off.x + mx <= minWidth ){
                    mx = 0;
                }
                if( off.y + my >= 0 || off.height + off.y + my <= minHeight ){
                    my = 0;
                }

                transform( mx , my );
                lastMoveX = ev.pageX - startPos.pageX;
                lastMoveY = ev.pageY - startPos.pageY;

                // move center icon
                // $centerBtn.css({
                //     marginLeft  : oMleft + lastMoveX / 2
                //     , marginTop : oMtop + lastMoveY / 2
                //     , opacity: 1 - Math.min( 0.5 , ( Math.abs( lastMoveX ) + Math.abs( lastMoveY ) ) / maxDistance )
                // });
            })
            .bind('mousewheel' , function( ev ){
                var deltay = ev.originalEvent.wheelDeltaY || ev.originalEvent.deltaY;
                if( deltay < 0 ){
                    totalScale /= perScale;
                    transform( undefined , undefined , 1/perScale );
                } else {
                    totalScale *= perScale;
                    transform( undefined , undefined , perScale );
                }
            });


            // TODO.. for long click
            var animateTimeout = null;
            var animateScale = 1.02;
            
            var runZoomIn = function( scale ){
                imgWidth = parseInt($picInner.find('img').css('width'));
                imgHeight = parseInt($picInner.find('img').css('height'));
                if( totalScale * imgWidth == minWidth || totalScale * imgHeight == minHeight ){
                    return;
                }
                totalScale /= scale;
                transform( undefined , undefined , 1/scale , undefined , false);

                if( totalScale * imgWidth < minWidth || totalScale * imgHeight < minHeight ){
                    var lastScale = totalScale;
                    totalScale = Math.max( minWidth / imgWidth , minHeight / imgHeight );
                    transform( undefined , undefined , totalScale/lastScale , undefined , false);
                }
                var off = imgRaphael.getBBox();
                if( off.x > 0 ){
                    transform( -off.x , 0 );
                    off.x = 0;
                }
                if( off.x + off.width < minWidth ){
                    transform( minWidth - ( off.x + off.width )  , 0 );
                }
                if( off.y > 0 ){
                    transform( 0 , -off.y );
                    off.y = 0;
                }
                if( off.y + off.height < minHeight ){
                    transform( 0 ,  minHeight - ( off.y + off.height ) );
                }
            }
            var imgWidth , imgHeight;
            var startAnimateScale = function( zoomout ){
                imgWidth = parseInt($picInner.find('img').css('width'));
                imgHeight = parseInt($picInner.find('img').css('height'));

                var duration = 1000 / 60 ;
                var aniFn = function(){
                    if( zoomout ){
                        totalScale *= animateScale;
                        transform( undefined , undefined , animateScale , undefined , false );
                    } else {
                        runZoomIn( animateScale );
                    }
                    animateTimeout = setTimeout( aniFn , duration );
                };
                animateTimeout = setTimeout( aniFn , duration );
            }
            var stopAnimate = function(){
                clearTimeout( animateTimeout );
            }
            
            var longInterval = null;
            var longTimeout = null;
            var runAnimate = false;
            var mousedown = false;
            $('.pop-zoomout-btn').mousedown(function(){
                mousedown = true;
                longTimeout = setTimeout(function(){
                    runAnimate = true;
                    startAnimateScale( true );
                } , 300);
            })
            .bind( "mouseup mouseout" , function(){
                if( !mousedown ) return;
                mousedown = false;
                clearTimeout( longTimeout );
                if( runAnimate ){
                    runAnimate = false;
                    stopAnimate();
                } else {
                    totalScale *= perScale;
                    transform( undefined , undefined , perScale );
                }
            } );

            $('.pop-zoomin-btn').mousedown(function(){
                mousedown = true;
                longTimeout = setTimeout(function(){
                    runAnimate = true;
                    startAnimateScale( false );
                } , 300);
            })
            .bind( "mouseup mouseout" , function(){
                if( !mousedown ) return;
                mousedown = false;
                clearTimeout( longTimeout );
                if( runAnimate ){
                    runAnimate = false;
                    stopAnimate();
                } else {
                    runZoomIn( perScale );
                }
            } );
            
            $('.pop-rright-btn').mousedown(function(){
                totalRotate += perRotate
                transform( undefined , undefined , undefined , perRotate);
                // longTimeout = setTimeout(function(){
                //     longInterval = setInterval(function(){
                //         transform( undefined , undefined , undefined , perRotate);
                //     } , 500 );
                // } , 500);
            });

            $('.pop-rleft-btn').mousedown(function(){
                totalRotate -= perRotate;
                transform( undefined , undefined , undefined , -perRotate );
                // longTimeout = setTimeout(function(){
                //     longInterval = setInterval(function(){
                //         transform( undefined , undefined , undefined , -perRotate);
                //     } , 500 );
                // } , 500);
            });

            // $(document)
            //     .mouseup(function(){
            //         clearTimeout( longTimeout );
            //         clearInterval( longInterval );
            //     });
        }


        return {
            reset       : reset
            , initialize: initialize
            , result    : function(){
                var off  = imgRaphael.getBBox();
                var width = parseInt($picInner.find('img').css('width'));
                var height = parseInt($picInner.find('img').css('height'));
                return {
                    width       : width * totalScale,
                    height      : height * totalScale,
                    src         : $picInner.find('img').attr('src'),
                    rotate      : totalRotate,
                    x           : off.x,
                    y           : off.y,
                    cid         : 1
                }
            }
            , transform  : transform
        }
    })();



    var init = function() {

//        var datetime = new Date(((1392175200+1*3600)*1000));
//        var country = "South Africa,Albania,Algeria,Germany,Saudi,Arabia,Argentina,Australia,Austria,Bahamas,Belgium,Benin,Brazil,Bulgaria,Burkina Faso,Canada,Chile,China,Cyprus,Korea,Republic of Ivory Coast,Croatia,Denmark,Egypt,United Arab Emirates,Spain,Estonia,USA,Finland,France,Georgia,Ghana,Greece,Guinea,Equatorial Guinea,Hungary,India,Ireland,Italy,Japan,Jordan,Latvia,Lebanon,Lithuania,Luxembourg,Macedonia,Madagascar,Morocco,Mauritania,Mexico,Moldova,Republic of Montenegro,Norway,New Caledonia,Panama,Netherlands,Peru,Poland,Portugal,Reunion,Romania,UK,Russian Federation,Senegal,Serbia,Singapore,Slovakia,Slovenia,Sweden,Switzerland,Chad,Czech Republic,Tunisia,Turkey,Ukraine,Uruguay,Vietnam";
//        var countryArray = country.split(',');
//        var output;
//        $.each(countryArray, function(i,e){
//            var string = '{"country_id":'+(i+1)+',"country":"'+e+'"},';
//            output += string;
//        });
//        console.log(output);

//        $(document).ajaxStop(function () {
//            console.log(1);
//        });

//		$('.page-loading-logo img').ensureLoad(function(){
//			$('.page-loading-logo').fadeIn().dequeue().animate({top:'50%'}, 1000, 'easeInOutQuart');
//		});

        // Get language
        var lang = LP.getCookie('lang') || 'fr';

        api.ajax('i18n_' + lang , function( result ){
            _e = result;

            aMonth = [_e.JANUARY,_e.FEBRUARY,_e.MARCH,_e.APRIL,_e.MAY,_e.JUNE,_e.JULY,_e.AUGUST,_e.SEPTEMBER,_e.OCTOBER,_e.NOVEMBER,_e.DECEMBER];

            LP.compile( 'base-template' , {_e:_e} , function( html ){
                $('body').prepend(html);
                $main = $('.main');
                $listLoading = $('.loading-list');

                $('.language-item').removeClass('language-item-on')
                    .filter('[data-d="lang=' + lang + '"]')
                    .addClass('language-item-on');

                // after page load , load the current user information data from server
                api.ajax('user' , function( result ){
                    if(result.success) {
                        //bind user data after success logged
                        if(result.data.count_by_day == 0) {
                            delete result.data.count_by_day;
                        }
                        if(result.data.count_by_month == 0) {
                            delete result.data.count_by_month;
                        }
                        if(!result.data.avatar) {
                            result.data.avatar = "/uploads/default_avatar.gif";
                        }
                        result.data._e = _e;
                        LP.compile( 'user-page-template' , result.data , function( html ){
                            $('.content').append(html);
                        });

                        LP.compile( 'side-template' , result.data , function( html ){
                            $('.content').append(html);
                            //cache the user data
                            $('.side').data('user',result.data);
                        });
                        $('.page').addClass('logged');
                        $('.header .select').fadeIn();
                    }
                    else {
                        $('.header .login').fadeIn();
                    }

                    openByHash();
                });


                var $countryList = $('.select-country-option-list');
                $countryList.empty();
                $countryList.append('<p data-api="recent">All</p>');
                api.ajax('countryList', function( result ){
                    $.each(result, function(index, item){
                        var html = '<p data-param="country_id=' + item.country_id + '" data-api="recent">' + item.country_name + '</p>';
                        $countryList.append(html);
                    });
                    LP.use(['jscrollpane' , 'mousewheel'] , function(){
                        $countryList.jScrollPane({autoReinitialise:true});
                    });
                });

                LP.use('uicustom',function(){
                    var placeHolder = $( ".search-ipt").attr('placeholder'); // TODO: use background instead
                    $( ".search-ipt").val('').autocomplete({
                        source: function( request, response ) {
                            $.ajax({
                                url: "./api/tag/list",
                                dataType: "json",
                                data: {
                                    term: request.term
                                },
                                success: function( data ) {
                                    response( $.map( data.data, function( item ) {
                                        return {
                                            label: item.tag,
                                            value: item.tag
                                        }
                                    }));
                                }
                            });
                        },
                        minLength: 1,
                        select: function( event, ui ) {
                            //console.log(ui);
                        }
                    });
                });


                LP.use('handlebars' , function(){
                    //Handlebars helper
                    Handlebars.registerHelper('ifvideo', function(options) {
                        if(this.type == 'video')
                            return options.fn(this);
                        else
                            return options.inverse(this);
                    });

                    Handlebars.registerHelper('ifliked', function(options) {
                        if(this.user_liked == true)
                            return options.fn(this);
                        else
                            return options.inverse(this);
                    });

                    Handlebars.registerHelper('ifzero', function(value, options) {
                        if(value <= 1)
                            return options.fn(this);
                        else
                            return options.inverse(this);
                    });
                });

                // every five minutes get the latest nodes
                setInterval( function(){
                    LP.triggerAction('get_fresh_nodes');
                } , 5 * 60 * 1000 );
            });
        });




        // When the init AJAX all finished, fadeOut the loading layout
        $(document).ajaxStop(function () {
            pageLoaded(1000);
            $(this).unbind('ajaxStop');
        });

    }



    var bindCommentSubmisson = function() {
        LP.use('form' , function(){
            var $submitBtn = $('.comment-form .submit');
            $('.comment-form').ajaxForm({
                beforeSubmit:  function($form){
                    if($submitBtn.hasClass('disabled')) {
                        return false;
                    }
                    $submitBtn.addClass('disabled');
                    $('.comment-msg-error').hide();
                    $('.com-ipt').val().length;
                    if($('.com-ipt').val().length == 0) {
                        $('.comment-msg-error').fadeIn().html('You should write something.');
                        $submitBtn.removeClass('disabled');
                        return false;
                    }
                    if($('.com-ipt').val().length > 140) {
                        $submitBtn.removeClass('disabled');
                        $('.comment-msg-error').fadeIn().html('The description is limited to 140 characters.');
                        return false;
                    }
					$('.com-loading').fadeIn();
                },
                complete: function(xhr) {
					$('.com-loading').fadeOut();
                    var res = xhr.responseJSON;
                    if(res.success) {
                        var comment = res.data;
                        var datetime = new Date((parseInt(comment.datetime)+1*3600)*1000);
                        comment.date = datetime.getUTCDate();
                        comment.month = getMonth((parseInt(datetime.getUTCMonth()) + 1));
                        comment.user = $('.side').data('user');
                        comment.mycomment = true;
                        $('.comment-form').fadeOut(function(){
							$('.com-ipt').val('');
						});
                        $('.comment-msg-success').delay(500).fadeIn();
                        $('.comment-msg-success').delay(800).fadeOut();
                        $('.comment-form').delay(1800).fadeIn(function(){
							$submitBtn.removeClass('disabled');
						});
                        LP.compile( 'comment-item-template' ,
                            comment,
                            function( html ){
                                // render html
                                if($('.com-list-inner .comlist-item').length == 0) {
                                    $('.com-list-inner').html('');
                                }
                                $('.com-list-inner').first().append(html);
                                var $comCount = $('.com-com-count');
                                var newComCount = parseInt($comCount.html())+1;
                                $comCount.html(newComCount);
                                var nid = $('.comment-wrap').data('param').nid;
                                $('.main-item-' + nid).find('.item-comment').html(newComCount);

                                (function(){
                                    var nodes = $('.main').data('nodes');
                                    var node = jQuery.grep(nodes, function (node) {
                                        if(node.nid == nid) {
                                            return node;
                                        }
                                    });
                                    if(node) {
                                        node[0].commentcount = newComCount;
                                    }
                                })();

                                (function(){
                                    var nodes = $('.count-com').data('nodes');
                                    var node = jQuery.grep(nodes, function (node) {
                                        if(node.nid == nid) {
                                            return node;
                                        }
                                    });
                                    if(node) {
                                        node[0].commentcount = newComCount;
                                    }
                                })();

                                LP.triggerAction('update_user_status');
                            } );
                    }
                    else {
                        if(res.message === 601) {
                            $('.comment-msg-error').html(_e.LOGIN_BEFORE_COMMENT);
                        }
                    }
                }
            });
        });
    }


    /**
     * Get node comments
     * @param nid
     */
    var getCommentList = function(nid, page) {
        var $commentWrap = $('.comment-wrap');
        if($commentWrap.hasClass('loading')) return;
        $commentWrap.addClass('loading');
        var commentParam = {nid: nid, pagenum:10, page:page};
        $commentWrap.data('param', commentParam);
        api.ajax('commentList', commentParam, function( result ){
            $commentWrap.removeClass('loading');
            $('.com-list-loading').fadeOut(100);
            var comments = result.data;
            if(comments.length == 0){
                $commentWrap.addClass('loading');
            }
            if(comments.length == 0 && page == 1) {
                $('.com-list-inner').html('<div class="no-comment">' + _e.FIRST_COMMENT + '</div>');
            }
            else {
                $.each( comments , function( index , comment ){
                    // get date
                    var datetime = new Date((parseInt(comment.datetime)+1*3600)*1000);
                    comment.date = datetime.getUTCDate();
                    comment.month = getMonth((parseInt(datetime.getUTCMonth()) + 1));
                    LP.compile( 'comment-item-template' ,
                        comment ,
                        function( html ){
                            // render html
                            $('.com-list-inner').first().append(html);
                        } );
                });
            }
            // check the flagged comment if is login user
            var user = $('.side').data('user');
            if(user) {
                api.ajax('flaggedComments', {nid: nid}, function( result ){
                    $.each(result.data, function(index, item){
                        $('.comlist-item-' + item.cid).find('.comlist-flag').addClass('flagged').removeClass('btn2').removeAttr('data-a');
                    });
                });
            }
        });
    }

    /**
     * Resize Inner Box width Image and Video
     */
    var resizeInnerBox = function(){
//        var $side = $('.side');
//        var slideWidth = $side.width();
//        // Resize Inner Box
//        var $inner = $('.inner');
//        var innerHeight = $(window).height() - $('.header').height();
//        $inner.height(innerHeight);
//
//        // Resize Comment Box
//        var $comList = $('.com-list');
//        var comListHeight = $(window).height() - 390 - $('.com-user').height();
//        $comList.height(comListHeight);
//
//        // Resize Image
//        var imgBoxWidth = $(window).width() - 330 - slideWidth;
//        var imgBoxHeight =$(window).height() - $('.header').height();
//        var minSize = Math.min( imgBoxHeight , imgBoxWidth );
//        var $img = $('.image-wrap-inner img').css('margin',0);
//        $('.image-wrap-inner').width(minSize).height(minSize);
//
//        if( imgBoxHeight > imgBoxWidth ){
//            var marginLeft = (imgBoxHeight - imgBoxWidth) / 2;
//            $('.image-wrap-inner').height(imgBoxHeight);
//            $img.width('auto').height('100%').css('margin-left', -marginLeft);
//        }
//        // if(imgBoxWidth > imgBoxHeight) {
//        //     var marginTop = (imgBoxWidth - imgBoxHeight) / 2;
//        //     $img.css('margin',0);
//        //     $img.height('auto').width('100%').css('margin-top', -marginTop);
//        // } else {
//        //     var marginLeft = (imgBoxHeight - imgBoxWidth) / 2;
//        //     $img.css('margin',0);
//        //     $img.width('auto').height('100%').css('margin-left', -marginLeft);
//        // }
//
//        // Resize Video
//        var $video = $('.video-js .vjs-tech');
//        if($video.hasClass('zoom')) {
//            var $videoWrap = $('.video-js');
//            var videoWrapWidth = $videoWrap.width();
//            var videoWrapHeight = $videoWrap.height();
//            var videoWrapRatio = videoWrapWidth/videoWrapHeight;
//            var videoWidth = $video.width();
//            var videoHeight = $video.height();
//            var videoRatio = videoWidth/videoHeight;
//            if(videoRatio < videoWrapRatio) {
//                $video.width('100%').height('auto');
//                var videoMarginTop = (videoHeight - videoWrapHeight)/2;
//                $video.css('margin-top',-videoMarginTop);
//                $video.css('margin-left',0);
//            } else {
//                $video.width('auto').height('100%');
//                var videoMarginLeft = (videoWidth - videoWrapWidth)/2;
//                $video.css('margin-left',-videoMarginLeft);
//                $video.css('margin-top',0);
//            }
//        }
//
//        // Resize WMV iframe
//        var $wmvIframe = $('.image-wrap-inner iframe');
//        if($wmvIframe.length > 0) {
//            $wmvIframe.width('100%').height(imgBoxHeight-36);
//        }
//
//        // resize inner width
//        var minLeft = $(window).width() - minSize;
//        $('.inner').css('margin-left' , minLeft )
//            // set inner info
//            .find('.inner-info')
//            .css({
//                'width': minSize,
//                'left' : minLeft
//            })
//            // set .comment-wrap
//            .end()
//            .find('.comment-wrap')
//            .css({
//                'width' : minLeft - slideWidth,
//                'left'  : slideWidth - minLeft
//            })
//            // set image wrap width
//            .end()
//            .find('.image-wrap')
//            .width( minSize );

    }

    /**
     * Resize User Box
     */
    var resizeUserBox = function(){
        var userBoxHeight = $(window).height() - $('.header').height()-130;
        var formHeight = $('.user-edit-page form').height() + 100;
        $('.user-edit-page').height(userBoxHeight);
        $('.count-com').css('min-height',userBoxHeight);
        if(formHeight > userBoxHeight) {
            $('.user-edit-page').height(formHeight);
        }
        if((formHeight+130) > userBoxHeight){
            $('.editfi-country-pop').addClass('up');
        }
        else {
            $('.editfi-country-pop').removeClass('up');
        }
    }


    /**
     * Open the content via url hash id
     */
    var openByHash = function(){
        //获取nid所在的页码，然后加载该list
        var hash = location.hash;
        var match;
        if( ( match = hash.match( /#\/nid\/(\d+)/ ) ) ){
            var nid = match[1];
            var pageParam = refreshQuery();
            api.ajax('getPageByNid', {nid:nid}, function(result){
                pageParam.page = result.data;
                pageParam.previouspage = result.data;
                $main.data('param' , pageParam);
                api.ajax('recent', pageParam , function( result ){
                    if(result.data.length > 0) {
                        nodeActions.inserNode( $main , result.data , pageParam.orderby == 'datetime' );
                        $listLoading.fadeOut();
                        setTimeout(function(){
                            $('.main-item-'+nid).click();
                        },100);
                    }
                });
            });
        } else if( ( match = hash.match( /#\/user/ ) ) ){
            LP.triggerAction('toggle_user_page');
            LP.triggerAction('recent');
        } else if( ( match = hash.match( /#\/com/ ) ) ){
            LP.triggerAction('content_of_month');
        } else if( ( match = hash.match( /#\/cod/ ) ) ){
            LP.triggerAction('content_of_day');
        } else {
            LP.triggerAction('recent');
        }
    }

    /**
     * Hide page loading
     */
    var pageLoaded = function(delay){
        $('.page-loading').delay(delay).fadeOut(function(){
           $(this).remove();
        });
    }

    var renderVideo = function($newItem,node){
        LP.use('flash-detect', function(){
            if($('html').hasClass('video') && !isFirefox) { // need to validate html5 video as well
                LP.compile( 'html5-player-template' , node , function( html ){
                    $newItem.html(html);
                    LP.use('video-js' , function(){
                        videojs( "inner-video-" + node.timestamp , {}, function(){
                            $('.video-js').append('<div class="video-btn-zoom btn2" data-a="video_zoom"></div>');
                        });
                    });
                });
            }
            else if(FlashDetect.installed)
            {
                LP.compile( 'flash-player-template' , node , function( html ){
                    $newItem.html(html);
                });
            }
            else
            {
                node.file = node.file.replace('mp4','wmv');
                LP.compile( 'wmv-player-template' , node , function( html ){
                    $newItem.html(html);
                    $('.image-wrap-inner iframe');
                });
            }
        });
    }



    jQuery.fn.extend({
        ensureLoad: function(handler) {
            return this.each(function() {
                if(this.complete) {
                    handler.call(this);
                } else {
                    $(this).load(handler);
                }
            });
        }
    });

    init();

});

