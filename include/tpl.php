<!-- all tpls start -->
<script type="text/tpl" id="base-template">
	<div class="page">
		<!-- header -->
		<div class="header">
			<a href="./login" class="login btn">
				{{_e.CONNECT}}
			</a>
			<!--  -->
			<div class="logo logo-{{lang}}" data-a="back_home"></div>
			<!--  -->

			<div class="search clear">
				<input class="search-ipt" name="hashtag" type="text" placeholder="#HASHTAG" />
				<input data-a="search" class="search-sub" type="submit" value="search" />
				<div class="search-tip btn" data-a="search_tip"></div>
			</div>
			<!--  -->
			<div class="select clear">
				<!--  -->
				<div class="select-item">
					<div class="select-box btn2">{{_e.RECENT}}</div>
					<div class="select-pop">
						<div class="select-option"><p data-api="recent" class="selected" data-param="orderby=datetime">{{_e.RECENT}}</p><p data-api="recent" data-param="orderby=like">{{_e.POPULAR}}</p><p data-api="recent" data-param="orderby=random">{{_e.RANDOM}}</p></div>
					</div>
				</div>
				<!--  -->
				<div class="select-item">
					<div class="select-box btn2">{{_e.PHOTO}}/{{_e.VIDEO}}</div>
					<div class="select-pop">
						<div class="select-option"><p data-api="recent">{{_e.PHOTO}}/{{_e.VIDEO}}</p><p data-api="recent" data-param="type=photo">{{_e.PHOTO}}</p><p data-api="recent" data-param="type=video">{{_e.VIDEO}}</p></div>
					</div>
				</div>
				<!--  -->
				<div class="select-item">
					<div class="select-box btn2">{{_e.COUNTRY}}</div>
					<div class="select-pop">
						<div class="select-option select-country-option">
							<div class="select-country-option-list">
								<p data-api="recent">All</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!--  -->
			<div class="language">
				<div data-a="lang" data-d="lang=fr" class="btn language-item language-item-fr"><p class="fr"></p></div>
				<div data-a="lang" data-d="lang=en" class="btn language-item language-item-en"><p class="en"></p></div>
			</div>
			<a class="term-icon" target="_blank" href="./pdf/wall150ans_cgu_{{lang}}.pdf"></a>
		</div>
		<!--  -->
		<div class="content">
			<div class="search-hd">{{_e.RESULTS}} #<span></span></div>
			<div class="main"></div>
			<div class="loading-list"></div>
		</div>
	</div>
	<!--  -->

	<!-- modal -->
	<div class="modal-overlay" data-a="cancel_modal"></div>
	<div class="search-tip-modal pop-modal" >
		<div class="tip-text">{{{_e.HASHTAG_TIP}}}</div>
		<div class="example-text">{{_e.HASHTAG_EXAMPLES}}</div>
		<button class="btn cancel" data-a="cancel_modal">{{_e.CANCEL}}</button>
	</div>
	<div class="flag-confirm-modal pop-modal">
		<div class="flag-confirm-text">{{_e.REPORT_THIS}} <span></span>?</div>
		<button class="btn cancel" data-a="cancel_modal">{{_e.CANCEL}}</button>
		<button class="btn ok" data-a="user">{{_e.CONFIRM}}</button>
	</div>

	<div class="flag-login-modal pop-modal">
		<div class="flag-login-text">{{_e.REPORT_LOGIN}} <span></span></div>
		<button class="btn cancel" data-a="cancel_modal">OK</button>
	</div>

	<div class="delete-confirm-modal pop-modal">
		<div class="flag-confirm-text">{{_e.DELETE_THIS}} <span></span>?</div>
		<button class="btn cancel" data-a="cancel_modal">{{_e.CANCEL}}</button>
		<button class="btn ok" data-a="">{{_e.CONFIRM}}</button>
	</div>

	<div class="saveuser-confirm-modal pop-modal">
		<div class="saveuser-confirm-text">{{_e.CONFIRM_SAVE_USER}}</div>
		<button class="btn cancel" data-a="cancel_modal">{{_e.CANCEL}}</button>
		<button class="btn ok" data-a="save_user">{{_e.CONFIRM}}</button>
	</div>
	<!-- modal -->
</script>

<script type="text/tpl" id="pop-template">
	<div class="overlay" data-a="close_pop"></div>
	<div class="pop pop-{{type}}" style="display:none">
		<div class="popclose" data-a="close_pop"></div>
		<div class="pophd">
			<div class="poptit">{{_e.UPLOAD}} {{type}}</div>
		</div>
		<div class="popbd">
            <form target="node_upload_iframe" id="node_post_form" name="node_post_form" action="./api/index.php/node/post" method="post" enctype="multipart/form-data" >
              <!--  -->
              <div class="pop-inner pop-file">
                <div id="fileupload">
                  <div class="popfile-drag-box" data-a="select_photo"></div>
                  <ul class="step1-tips">
                    {{#ifvideo}}
                    <li>{{_e.VIDEO_FORMATE}}</li>
                    <li>{{_e.VIDEO_RESOLUTION}}</li>
                    <li>{{_e.VIDEO_SIZE}}</li>
					<li class="damaged">{{_e.ERROR_VIDEO_CORRUPTED}}</li>
                    {{else}}
                    <li>{{_e.PHOTO_FORMATE}}</li>
                    <li>{{_e.PHOTO_RESOLUTION}}</li>
                    <li>{{_e.PHOTO_SIZE}}</li>
					<li class="damaged">{{_e.ERROR_PHOTO_CORRUPTED}}</li>
                    {{/ifvideo}}
                  </ul>
                  <div class="error"></div>
                  <div class="step1-btns">
					<div id="flash-select-btn" class="popfile-btn btn">
						{{_e.SELECT}} {{type}}
						<div id="flash-video-popfile-btn"></div>
					</div>
                    <div class="popfile-btn btn" id="select-btn">
                      {{_e.SELECT}} {{type}}
                      <input type="file" name="file" accept="{{accept}}" />
                      <input type="hidden" name="type" value="{{type}}" />
                    </div>
                  </div>
                  <div class="step2-btns"><div class="popfile-btn btn" data-a="upload_photo">{{_e.UPLOAD}}</div><div class="popfile-btn btn">{{_e.SELECT_AGAIN}}</div></div>
                </div>
              </div>
              <!--  -->
              <div class="pop-inner pop-load" style="display:none">
                <div class="popload-icon-bg">
                  <div class="popload-icon"></div>
                </div>
                <div class="poploading">
                  <div class="popload-percent"><p></p></div>
                  <p>{{_e.UPLOAD_IN_PROGRESS}}</p>
                </div>
              </div>
              <!--  -->
              <div class="pop-inner pop-txt"  style="display:none">
                <div class="poptxt-preview clear">
                  {{#if type}}
                  <div class="poptxt-pic">
                    <a class="pop-zoomout-btn" data-a="pop-zoomout-btn" href="#">Zoom In</a>
                    <a class="pop-zoomin-btn" data-a="pop-zoomin-btn" href="#">Zoom Out</a>
                    <a class="pop-rright-btn" data-a="pop-rright-btn" href="#">Turn Right</a>
                    <a class="pop-rleft-btn" data-a="pop-rleft-btn" href="#">Turn Left</a>
                    <div class="poptxt-pic-inner">
                      <img style="pointer-events:none" />
                    </div>
                  </div>
                  {{else}}
                  <div class="poptxt-video-wrap">
                    <video id="poptxt-video" class="video-js vjs-big-play-centered vjs-default-skin" controls="controls" preload="none" width="100%" height="100%" poster="about:blank" data-setup="{}">
                      <source src="about:blank" type='video/mp4' />
                    </video>
                  </div>
                  {{/if}}
                  <textarea id="node-description" name="description" class="poptxt-textarea" placeholder="{{_e.ENTER_DESCRIPTION}}"></textarea>
                  <div class="error"></div>
                </div>
                <div class="poptxt-check btn">{{_e.UPLOAD_TERM}}<span class="error">{{_e.ERROR_CONDITION}}</span></div>
                <div class="poptxt-btn clear">
                  <p class="poptxt-cancel btn" data-a="close_pop">{{_e.CANCEL}}</p>
                  <p class="poptxt-submit btn" data-a="save_node">{{_e.PUBLISH}} {{type}}</p>
                </div>
              </div>
              <!--  -->
              <div class="pop-inner pop-success">
                {{_e.YOU_PUBLISHED}} {{type}}.
              </div>
              <iframe id='node_upload_iframe' name='node_upload_iframe' src=""></iframe>
            </form>
            <div id="node_post_flash"></div>
		</div>
        <div class="pop-uploadloading"></div>
	</div>
</script>


<script type="text/tpl" id="pop-avatar-template">
	<div class="overlay" data-a="close_pop"></div>
	<div class="pop pop-avatar" style="display:none">
		<div class="popclose" data-a="close_pop"></div>
		<div class="pophd">
			<div class="poptit">{{_e.AVATAR_UPLOAD}}</div>
		</div>
		<div class="popbd">
			<!--  -->
			<div class="pop-inner pop-file">
				<form target="avatar_upload_iframe" id="avatar_post_form" name="avatar_post_form" action="./api/index.php/user/saveavatar" method="post" enctype="multipart/form-data" >
					<div class="popfile-drag-box" data-a="select_photo"></div>
					<ul class="step1-tips">
						<li>{{_e.PHOTO_FORMATE}}</li>
						<li>{{_e.AVATAR_RESOLUTION}}</li>
						<li>{{_e.PHOTO_SIZE}}</li>
						<li class="damaged">{{_e.ERROR_PHOTO_CORRUPTED}}</li>
					</ul>
					<div class="error"></div>
					<div class="step1-btns">
						<div class="popfile-btn btn" id="select-btn">
							{{_e.SELECT}}
							<input type="file" name="file" accept="{{accept}}" />
						</div>
					</div>
					<div class="step2-btns"><div class="popfile-btn btn" data-a="upload_photo">{{_e.UPLOAD}}</div><div class="popfile-btn btn">{{_e.SELECT_AGAIN}}</div></div>
				</form>
        		<iframe id='avatar_upload_iframe' name='avatar_upload_iframe' src=""></iframe>
			</div>
			<!--  -->
			<div class="pop-inner pop-load" style="display:none">
				<div class="popload-icon-bg">
					<div class="popload-icon"></div>
				</div>
				<div class="poploading">
					<div class="popload-percent"><p></p></div>
					<p>{{_e.UPLOAD_IN_PROGRESS}}</p>
				</div>
			</div>
			<!--  -->
			<div class="pop-inner pop-txt"  style="display:none">
				<div class="poptxt-preview clear">
					<div class="poptxt-pic">
						<a class="pop-zoomout-btn" data-a="pop-zoomout-btn" href="#">Zoom In</a>
						<a class="pop-zoomin-btn" data-a="pop-zoomin-btn" href="#">Zoom Out</a>
						<a class="pop-rright-btn" data-a="pop-rright-btn" href="#">Turn Right</a>
						<a class="pop-rleft-btn" data-a="pop-rleft-btn" href="#">Turn Left</a>
						<div class="poptxt-pic-inner">
							<img style="pointer-events:none" />
						</div>
					</div>
					<div class="error"></div>
				</div>
				<div class="poptxt-btn clear">
					<p class="poptxt-cancel btn" data-a="close_pop">{{_e.CANCEL}}</p>
					<p class="poptxt-submit btn" data-a="avatar_save">{{_e.SAVE}}</p>
				</div>
			</div>
			<!--  -->
			<div class="pop-inner pop-success">
				{{_e.SAVE_AVATAR_SUCCESS}}.
			</div>
		</div>
        <div class="pop-uploadloading"></div>
	</div>
</script>
<!-- inner-template -->
<script type="text/tpl" id="inner-template">
	<div class="inner">
		<div class="comment-wrap">
			<div class="comment-cube">
				<div class="comment">
					<div class="com-user">
						<div class="comuser-pho"><img src="./api{{user.avatar}}?{{timestamp}}" width="32" /><div class="avatar-ie-round"></div></div>
						<div class="comuser-name"><p>{{user.firstname}} {{user.lastname}}</p></div>
						<div class="comuser-location"><p>{{country.country_name}}</p></div>
					</div>
					<!--  -->
					<div class="com-main">
						<div class="com-list">
							<div class="com-list-inner">
								<div class="com-list-loading">{{_e.LOADING_COMMENTS}}</div>
							</div>
						</div>
						{{#if currentUser}}
						<div class="com-make">
							<form class="comment-form" action="./api/index.php/comment/post" method="post">
								<textarea name="content" class="com-ipt" placeholder="{{_e.WRITE_YOUR_COMMENT}}"></textarea>
								<input type="hidden" name="nid" value="{{nid}}" />
								<div class="com-loading"></div>
								<input class="submit btn2" type="submit" value="{{_e.SUBMIT}}" />
								<div class="clear"></div>
							</form>
							<div class="comment-msg-success">{{_e.THANKS_COMMENT}}</div>
							<div class="comment-msg-error"></div>
						</div>
						{{else}}
						<div class="need-login">{{_e.LOGIN_BEFORE_COMMENT}}</div>
						{{/if}}
					</div>
					<!--  -->
					<div class="com-info">
						<div class="com-counts clear">
							<p class="com-day">{{date}} {{month}}</p>
							{{#ifliked}}
							<div data-a="unlike" data-d="nid={{nid}}" class="com-like com-unlike clickable">
								<span>{{likecount}}</span>
								<div class="com-unlike-tip">unlike</div>
							</div>
							{{else}}
							<div data-a="like" data-d="nid={{nid}}" class="com-like clickable">
								<span>{{likecount}}</span>
								{{#if currentUser}}{{else}}
								<div class="need-login">{{_e.LOGIN_BEFORE_LIKE}}</div>
								{{/if}}
							</div>
							{{/ifliked}}
							<p class="com-com-count">{{commentcount}}</p>
						</div>
						<div class="com-btn">
							<p data-a="back" class="com-back btn2"></p>
							<p data-a="prev" class="com-prev btn2"></p>
							<p data-a="next" class="com-next btn2"></p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="image-wrap">
			<div class="image-wrap-inner">
				{{#ifvideo}}

				{{else}}
				<img src="./api{{image}}" width="100%" />
				{{/ifvideo}}
			</div>
			<div class="inner-loading"></div>
			<div class="inner-info">
				<div class="inner-shade"></div>
				{{#if description}}<div class="inner-infocom">{{{description}}}</div>{{/if}}
				<div class="inner-infoicon"><div class="{{type}}"></div></div>
			</div>
			{{#if user_flagged}}
			<div class="flag-node flagged">flag</div>
			{{else}}
			<div class="flag-node btn2" data-d="nid={{nid}}&type=node" data-a="flag">flag</div>
			{{/if}}

			{{#if topmonth}}
				<div class="inner-top inner-topmonth"></div>
			{{else}}
				{{#if topday}}
					<div class="inner-top inner-topday"></div>
				{{/if}}
			{{/if}}
		</div>
	</div>
</script>
<!-- time-item-tpl -->
<script type="text/tpl" id="time-item-template">
	<div class="main-item time-item" data-date="{{date}}">
		<div class="time-date"><span>{{day}}</span>{{month}}</div>
	</div>
</script>

<!-- node-item-tpl -->
<script type="text/tpl" id="node-item-template">
	<div data-a="node" data-d="nid={{nid}}" class="main-item pic-item main-item-{{nid}}">
		<a>
			<img src="./api{{image}}" width="180" />
			<div class="item-info" >
        <div class="item-info-wrap">
          <div class="item-time"><span class="item-timeicon">{{formatDate}}</span></div>
          <div class="item-user"><span class="item-usericon">{{user.firstname}} {{user.lastname}}</span></div>
          <div class="item-source">
            <div class="{{type}}"></div>
          </div>
          <div class="item-like {{#if user_liked}}item-liked{{/if}}">{{likecount}}</div>
          <div class="item-comment">{{commentcount}}</div>
        </div>
			</div>
			<div class="item-icon" style="display: block;"><div class="{{type}}"></div></div>
			{{#if topday}}
			<div class="item-topday"></div>
			{{/if}}
			{{#if topmonth}}
			<div class="item-topmonth"></div>
			{{/if}}
			{{#if mynode}}
			<div class="item-delete btn" data-a="delete" data-d="nid={{nid}}&type=node"></div>
			{{/if}}
		</a>
	</div>
</script>


<!-- node-item-tpl -->
<script type="text/tpl" id="user-page-template">
	<div class="user-page clear">
		<div class="count">
			<div data-a="list_user_nodes" data-d="type=photo" class="count-item"><span>{{photos_count}}</span>{{#ifzero photos_count}}{{_e.PHOTO_POSTED}}{{else}}{{_e.PHOTOS_POSTED}}{{/ifzero}}</div>
			<div data-a="list_user_nodes" data-d="type=video" class="count-item"><span>{{videos_count}}</span>{{#ifzero videos_count}}{{_e.VIDEO_POSTED}}{{else}}{{_e.VIDEOS_POSTED}}{{/ifzero}}</div>
			{{#if count_by_day}}<div data-a="list_user_nodes" data-d="type=day" class="count-item"><span>{{count_by_day}}</span>{{#ifzero count_by_day}}{{_e.CONTENT_OF_THE_DAY}}{{else}}{{_e.CONTENTS_OF_DAY}}{{/ifzero}}</div>{{/if}}
			{{#if count_by_month}}<div data-a="list_user_nodes" data-d="type=month" class="count-item"><span>{{count_by_month}}</span>{{#ifzero count_by_month}}{{_e.CONTENT_OF_THE_MONTH}}{{else}}{{_e.CONTENTS_OF_MONTH}}{{/ifzero}}</div>{{/if}}
			<div class="count-item no-link"><span>{{comments_count}}</span>{{#ifzero comments_count}}{{_e.COMMENT}}{{else}}{{_e.COMMENTS}}{{/ifzero}}</div>
			<div class="count-item no-link"><span>{{likes_count}}</span>{{#ifzero likes_count}}{{_e.LIKE}}{{else}}{{_e.LIKES}}{{/ifzero}}</div>
		</div>
		<!-- inner -->
		<div class="count-inner">
			<div class="count-user">
				<div class="count-userpho"><img src="./api{{avatar}}" width="64" /><div class="avatar-ie-round"></div></div>
				<div class="count-userinfo">
					<p class="name">{{firstname}} {{lastname}}</p>
					<p class="location">{{country.country_name}}</p>
				</div>
				<a class="count-edit btn" data-a="open_user_edit_page">{{_e.EDIT_PROFILE}}</a>
				<div data-a="avatar_upload" class="avatar-file btn">{{_e.CHOOSE_FILE}}</div>
			</div>
			<!--  -->
			<div class="count-com">
				<!--TODO: node items -->
			</div>
			<div class="user-edit-page">
				<form>
					<div class="edit-fi clear">
						<div class="editfi-tit">{{_e.EMAIL_PROFESSIONNEL}}:</div>
						<div class="editfi-email">{{company_email}}</div>
					</div>
					<div class="edit-tips"><em>{{{_e.COMPANY_EMAIL_TERM}}}:</em></div>
					<div class="edit-fi clear">
						<div class="editfi-tit">{{_e.EMAIL_PERSONNEL}}:</div>
						<div class="editfi-com">
							<input class="edit-email" type="text" value="{{personal_email}}" /> <em>({{_e.OPTIONAL}})</em>
							<div class="edit-email-error">{{_e.ERROR_EMAIL}}</div>
						</div>
						<div class="editfi-info clear">
							<div class="editfi-condition">{{_e.PERSONAL_EMAIL_TERM}}</div>
							<div class="editfi-condition-error">{{_e.ERROR_CONDITION}}</div>
							<div class="editfi-information">{{_e.PERSONAL_EMAIL_INFO}} <a target="_blank" href="./pdf/wall150ans_cgu_{{lang}}.pdf">{{_e.CLICK_HERE}}</a></div>
						</div>
					</div>
					<div class="edit-fi clear">
						<div class="editfi-tit">{{_e.COUNTRY}}:</div>
						<div class="editfi-com">
							<div class="editfi-country">
								<div class="editfi-country-box" data-id="{{country.country_id}}">{{country.country_name}}</div>
								<div class="editfi-country-pop">
									<div class="editfi-country-option-list">
										<div class="editfi-country-option">
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="user-edit-btns">
						<a class="user-edit-save btn" data-a="save_user">{{_e.SAVE}}</a>
						<a class="user-edit-cancel btn" data-a="cancel_user_edit">{{_e.CANCEL}}</a>
					</div>
				</form>
				<div class="user-edit-loading"></div>
			</div>
		</div>
	</div>
</script>

<!-- comment-item-tpl -->
<script type="text/tpl" id="comment-item-template">
	<div class="comlist-item comlist-item-{{cid}}">
		<div class="comlist-tit"><span>{{user.firstname}} {{user.lastname}} </span> - {{date}} {{month}}</div>
		<div class="comlist-con">{{{content}}}</div>
		{{#if mycomment}}
		<div class="comlist-delete btn2" data-a="delete" data-d="cid={{cid}}&type=comment"></div>
		{{/if}}
		<div class="comlist-flag btn2" data-a="flag" data-d="cid={{cid}}&nid={{nid}}&type=comment"></div>
	</div>
</script>

<!-- side-tpl -->
<script type="text/tpl" id="side-template">
	<div class="side">
		<!-- user -->
		<div class="user" data-a="toggle_user_page">
			<div class="user-pho"><img src="./api{{avatar}}" width="34" height="34" /><div class="avatar-ie-round"></div></div>
			<div class="user-name">{{{_e.MY_PROFILE}}}</div>
			<div class="close-user-page" data-a="toggle-user-page"></div>
			<h6>{{{_e.MY_PROFILE}}}</h6>
		</div>
		<!-- menu -->
		<div class="menu">
			<div class="menu-item photo" data-a="pop_upload" data-d="type=photo"><div class="menu-item-arrow"></div><p></p><h6>{{_e.POST_A_PHOTO}}</h6></div>
			<div class="menu-item video" data-a="pop_upload" data-d="type=video"><div class="menu-item-arrow"></div><p></p><h6>{{_e.POST_A_VIDEO}}</h6></div>
			<div class="menu-item {{_e.DAY}}" data-a="content_of_day"><div class="menu-item-arrow"></div><p></p><h6>{{_e.CONTENT_OF_THE_DAY}}</h6></div>
			<div class="menu-item month" data-a="content_of_month"><div class="menu-item-arrow"></div><p></p><h6>{{_e.CONTENT_OF_THE_MONTH}}</h6></div>
			<a class="menu-item logout" href="./api/user/samllogout"><div class="menu-item-arrow"></div><p></p><h6>{{_e.LOGOUT}}</h6></a>
		</div>
	</div>
</script>

<!-- html5-player-tpl -->
<script type="text/tpl" id="html5-player-template">
  <video id="inner-video-{{timestamp}}" class="video-js vjs-big-play-centered vjs-default-skin" preload="none" width="100%" height="100%" poster="./api{{image}}" data-setup="{}">
    <source src="./api{{file}}" type='video/mp4' />
  </video>
</script>

<!-- wmv-player-tpl -->
<script type="text/tpl" id="wmv-player-template">
  <iframe id="wmv-iframe" style="display:none" onload="this.style.display='block';" src="wmv_player.php?file={{file}}" scrolling="no" frameborder="0"></iframe>
</script>

<!-- flash-player-tpl -->
<script type="text/tpl" id="flash-player-template">
  <object id="flash-player" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0" width="100%" height="100%">
	<param name="allowScriptAccess" value="always"/>
	<param name="movie" value="flash/player.swf"/>
	<param name="flashVars" value="source=../api{{file}}&skinMode=show&onPlay=flashPlay()&onPause=flashPause()&onPlayComplete=flashplayComplete()&fengmian=./api{{image}}"/>
	<param name="quality" value="high"/>
	<param name="wmode" value="opaque"/>
	<param name="allowFullScreen" value="true"/>
    <embed id="flash-player-embed" name="player" src="flash/player.swf" flashVars="source=../api{{file}}&skinMode=show&onPlay=flashPlay()&onPause=flashPause()&onPlayComplete=flashplayComplete()&fengmian=./api{{image}}" allowFullScreen="true" quality="high" wmode="opaque" pluginspage="http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash" type="application/x-shockwave-flash" width="100%" height="100%" allowScriptAccess="always"></embed>
  </object>
</script>

<!-- flash-uploder-tpl -->
<script type="text/tpl" id="flash-uploader-template">
  <object id="flash-uploader" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0" width="443" height="330">
    <param name="allowScriptAccess" value="always"/>
    <param name="movie" value="flash/upload_photo_{{lang}}.swf"/>
    <param name="quality" value="high"/>
    <param name="wmode" value="opaque"/>
    <embed name="player" src="flash/upload_photo_{{lang}}.swf" quality="high" wmode="opaque" pluginspage="http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash" type="application/x-shockwave-flash" width="443" height="330" allowScriptAccess="always"></embed>
  </object>

	<div class="pop-inner pop-success">
		{{_e.YOU_PUBLISHED}} {{type}}.
	</div>
</script>

<!-- blank-search-tpl -->
<script type="text/tpl" id="blank-search-template">
	<div class="blank-search">
		<div class="no-results">{{_e.NO_RESULTS_THIS_SEARCH}}</div>
		<div class="no-results-line"></div>
		<div class="popular-hashtags">
			{{_e.POPULAR_HASHTAGS}}:
			<ul>
				{{#each data}}
				<li class="btn" data-a="search" data-d="tag={{tag}}">#{{tag}}</li>
				{{/each}}
			</ul>
		</div>
	</div>
</script>

<!-- blank-filter-tpl -->
<script type="text/tpl" id="blank-filter-template">
  <div class="blank-search">
    <div class="no-results">{{_e.NO_RESULTS_THIS_SEARCH}} {{#if searchs}}{{searchs}}{{/if}}</div>
    <div class="no-results-line"></div>
    <div class="popular-hashtags">
      {{_e.POPULAR_HASHTAGS}}:
      <ul>
        {{#each data}}
        <li class="btn" data-a="search" data-d="tag={{tag}}">#{{tag}}</li>
        {{/each}}
      </ul>
    </div>
  </div>
</script>


<script type="text/tpl" id="tutor-template">
<div class="tutor">
	<div class="tutor-bg">
		<img src="./img/tutor/tutor-bg-img-{{lang}}.jpg"/>
	</div>
	<div class="tutor-mask"></div>
	<div class="tutor-steps">
		<div class="tutor-step tutor-step1"  style="display:block;"> 
			<p class="txt">{{{_e.TUTOR_EXPLAIN}}}</p>
			<div class="tutor-btns">
				<button data-a="skip-tutor" class="tutor-skip">{{_e.SKIP_THE_TUTORIAL}}</button>
				<button data-a="next-tutor" class="tutor-ok tutor-btn-red">{{_e.OK}}</button>
			</div>
		</div>
		<div class="tutor-step tutor-step2">
			<div class="tutor-step2-2">
				<img src="./img/tutor/step2-2.png">
				<p class="t1">{{{_e.STEP2_2}}}</p>
				<p class="t2">{{{_e.STEP2_3}}}</p>
			</div>
			<div class="tutor-step2-1">
				<img src="./img/tutor/step2-1.png">
				<p class="t1">{{{_e.STEP2_1}}}</p>
			</div>
			<div class="tutor-step2-3">
				<img src="./img/tutor/step2-3-{{lang}}.png">
				<p class="t1">{{{_e.STEP2_4}}}</p>
				<p class="t2">{{{_e.STEP2_5}}}</p>
			</div>
			<div class="tutor-btns">
				<button data-a="skip-tutor" class="tutor-skip">{{_e.SKIP}}</button>
				<button data-a="next-tutor" class="tutor-ok tutor-btn-red">{{_e.NEXT}}</button>
			</div>
		</div>
		<div class="tutor-step tutor-step3" > 
			<div class="tutor-step3-1">
				<img src="./img/tutor/step3-1-{{lang}}.png">
				<p class="t1">{{_e.STEP3_1}}</p>
			</div>
			<div class="tutor-btns">
				<button data-a="skip-tutor" class="tutor-skip">{{_e.SKIP}}</button>
				<button data-a="next-tutor" class="tutor-ok tutor-btn-red">{{_e.NEXT}}</button>
			</div>
		</div>
		<div class="tutor-step tutor-step4" > 
			<div class="tutor-step4-1">
				<img src="./img/tutor/step4-1-{{lang}}.png">
				<p class="t1">{{_e.STEP4_1}}</p>
			</div>
			<div class="tutor-btns">
				<button data-a="skip-tutor" class="tutor-skip">{{_e.SKIP}}</button>
				<button data-a="next-tutor" class="tutor-ok tutor-btn-red">{{_e.NEXT}}</button>
			</div>
		</div>
		<div class="tutor-step tutor-step5" > 
			<div class="tutor-step5-1">
				<img src="./img/tutor/step5-1-{{lang}}.png">
				<p class="t1">{{{_e.STEP5_1}}}</p>
				<p class="t2">{{_e.STEP5_2}}</p>
				<p class="t3">{{_e.STEP5_3}}</p>
				<p class="t4">{{_e.STEP5_4}}</p>
				<p class="t5">{{_e.STEP5_5}}</p>
				<p class="t6">{{_e.STEP5_6}}</p>
			</div>
			<div class="tutor-btns">
				<button data-a="skip-tutor" class="tutor-enjoy tutor-btn-red">{{_e.ENJOY}}</button>
			</div>
		</div>
	</div>
</div>
</script>