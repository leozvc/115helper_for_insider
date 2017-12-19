// ==UserScript==
// @name         老司机自动开车神器
// @namespace    115helper.for.insider
// @version      1.2.5
// @supportURL   https://github.com/leozvc/115helper_for_insider/issues
// @description  老司机自动开车神器, 自动抓取识别磁链特征码,支持下载到115网盘
// @author       insider
// @require      http://libs.baidu.com/jquery/1.4.4/jquery.min.js
// @require      http://cdn.bootcss.com/jquery-cookie/1.4.1/jquery.cookie.min.js
// @resource     icon1 http://geekdream.com/image/115helper_icon_001.jpg
// @match       http*://*/*
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_openInTab
// @grant       GM_notification
// @grant       GM_getResourceURL
// @run-at      document-end
// @noframes
// ==/UserScript==


var notification_url = ''; //chrome桌面通知默认点击跳转地址
var token_url = 'http://115.com/?ct=offline&ac=space&_='; //获取115 token接口
var lxURL = 'http://115.com/web/lixian/?ct=lixian&ac=add_task_url'; //添加115离线任务接口
var X_userID = 0; //默认115用户ID
var Modal3;
//icon图标
var icon = GM_getResourceURL('icon1');




  function InitModal() {
        table_htmls = '<div id="links" style="font-size:12px; visibility: hidden; top: 150px; left: 50%; margin-left: -500px; width: 1100px; position: absolute; z-index: 101; padding: 30px 40px 34px; -moz-border-radius: 5px; -webkit-border-radius: 5px; border-radius: 5px; -moz-box-shadow: 0 0 10px rgba(0,0,0,.4); -webkit-box-shadow: 0 0 10px rgba(0,0,0,.4); -box-shadow: 0 0 10px rgba(0,0,0,.4); background-color: #FFF; "><div style="display:inline;white-space: nowrap; float:left; padding:0 20px 0 0"><img src="http://geekdream.com/hongbao.png" style="width:150px"></div><div  style="display:inline; float:left; "><table class="table"><thead><tr><th style="width:100px">番号</th><th style="word-break:break-all;word-wrap:break-all">磁链</th><th class="col-4">操作</th></tr></thead><tbody></tbody></table></div><a style=" font-size: 12px; line-height: 0.5; position: absolute; top: 8px; right: 11px; color: #333; text-shadow: 0 -1px 1px rbga(0,0,0,.6); font-weight: bold; cursor: pointer;" class="close-reveal-modal">&#215;</a></div>';
        $(document.body).append(table_htmls);
  }




//方法: 初始化方法
function _init()
{

     //弹出框初始化
     InitModal();
    //扫码磁链,番号
    c_m = check_magnets();
    c_e = check_ed2ks();
    c_c = check_codes();

    if (c_m || c_e || c_c)
    {
        down_btn = '<a type="button" id="down_btn"  data-reveal-id="links" data-animation="fade" class="btn btn-primary btn-lg" style="border: 1px solid #D4CD49; position:fixed;left:0;top:30%;box-shadow: rgb(230, 122, 115) 0px 39px 0px -24px inset; background-color: rgb(228, 104, 93); border-radius: 4px; border: 1px solid rgb(255, 255, 255); display: inline-block; cursor: pointer; color: rgb(255, 255, 255); font-family: Arial; font-size: 12px; padding: 6px 15px; text-decoration: none; text-shadow: rgb(178, 62, 53) 0px 1px 0px;">发现可疑磁链或番号 点击下载!</button>';
        $("body").append(down_btn);
    }



    //115.com监测
    do_115();

    $("#down_btn").click(function(){

    });

    //点击 下载到115 按钮
    $(".download_to_115").click(function(){

        link = $(this).parents("tr").find(".link_url").val();
        a = LXTo115(link);
        $(this).text("已同步115");
    });

    //点击 复制到粘贴板 按钮
    $(".copy_magnetlink").click(function(){

        link = $(this).parents("tr").find(".link_url");
        copy_link(link);
        $(this).text("成功复制链接");
    });


}


//访问115检查方案处理
function do_115()
{
      //访问115.com 执行初始化
    if (location.host.indexOf('115.com') >= 0)
    {
        if(location.href.indexOf('#115helper') < 0)
        {
            console.log("115离线助手:115.com, 不初始化.");
            return false;
        }
        console.log('115离线助手:115.com,尝试获取userid.');
        X_userID = GM_getValue('X_userID', 0);
        if(X_userID !== 0)
        {
            console.log("115离线助手: 115账号:"+X_userID+",无需初始化.");
            return false;
        }
        X_userID = $.cookie("OOFL");
        if(!X_userID)
        {
            console.log("115离线助手: 尚未登录115账号");
            return false;
        }else{
            console.log("115离线助手: 初始化成功");
            notifiy('老司机自动开车-115离线助手', '登陆初始化成功,赶紧上车把!', icon, "");
            GM_setValue('X_userID', X_userID);
        }
        return false;
    }
}

//检查115登陆状态
function check_115_login()
{
    //X_userID
    X_userID = GM_getValue("X_userID", 0);
    if(X_userID === 0)
    {
        console.log("115离线助手: 尚未初始化");
        notifiy("老司机自动开车-115离线助手",
                '点击初始化115助手',
                icon,
                'http://115.com#115helper'
               );
        return false;
    }
    console.log("115离线助手: 115账号:"+X_userID);
    return true;
}


//方法: 未登陆115处理
function nologin()
{
    notifiy("老司机自动开车-115离线助手",
            '115登陆失效,点击重新登陆',
            icon,
            'http://115.com'
           );
    GM_setValue('X_userID', 0);
    return false;

}

//方法: 通用chrome通知
function notifiy(title, body, icon, click_url)
{

    var notificationDetails = {
        text: body,
        title: title,
        timeout: 10000,
        image: icon,
        onclick: function() {
            window.open(click_url);
        }
    };
    GM_notification(notificationDetails);

}

//方法 添加115离线任务方法
function LXTo115(url)
{
    GM_xmlhttpRequest({
        method: 'GET',
        url: token_url + new Date().getTime(),
        onload: function (responseDetails)
        {
            if (responseDetails.responseText.indexOf('html') >= 0) {
                //未登录处理
                return nologin();
            }
            var sign115 = JSON.parse(responseDetails.response).sign;
            var time115 = JSON.parse(responseDetails.response).time;
            downTo115(url, X_userID, sign115, time115);
        }
    });
}

//方法 添加到面板
function addToboard(url, code)
{
    html = '<tr><td >'+code+'</td><td ><form class="bs-example bs-example-form" ><div class="input-group"><input class="link_url input-block-level span8" type="text" value="'+url+'" style="width:500px"></div></form></td><td><div class="btn-group"><button type="button" class="btn btn-primary download_to_115" style="box-shadow: rgb(230, 122, 115) 0px 39px 0px -24px inset; background-color: rgb(228, 104, 93); border-radius: 4px; border: 1px solid rgb(255, 255, 255); display: inline-block; cursor: pointer; color: rgb(255, 255, 255); font-family: Arial; font-size: 12px; padding: 6px 15px; text-decoration: none; text-shadow: rgb(178, 62, 53) 0px 1px 0px;">下载到115</button><button type="button" class="btn btn-primary copy_magnetlink" style="box-shadow: rgb(230, 122, 115) 0px 39px 0px -24px inset; background-color: rgb(228, 104, 93); border-radius: 4px; border: 1px solid rgb(255, 255, 255); display: inline-block; cursor: pointer; color: rgb(255, 255, 255); font-family: Arial; font-size: 12px; padding: 6px 15px; text-decoration: none; text-shadow: rgb(178, 62, 53) 0px 1px 0px;">复制到粘贴板</button></div></td></tr>';

    $("#links tbody").append(html);

}

//POST提交下载任务
function downTo115(url, X_userID, sign115, time115) {


    GM_xmlhttpRequest({
        method: 'POST',
        url: lxURL,
        headers:{
            "Content-Type":"application/x-www-form-urlencoded"
        },
        data:"url="+encodeURIComponent(url)+"&uid="+X_userID+"&sign="+sign115+"&time="+time115,
        onload: function (responseDetails) {
            var lxRs = JSON.parse(responseDetails.responseText); //离线结果
            if (lxRs.state) {
                //离线任务添加成功
                notifiy("老司机自动开车-115离线助手",
                        '上车咯,点击进入网盘',
                        icon,
                        'http://115.com/?tab=offline&mode=wangpan'
                       );
            }
            console.log("磁链:"+url+" 下载结果:"+ lxRs.state+" 原因:"+lxRs.error_msg);

        }
    });

}

//番号检测
function check_codes()
{
    var codes = $("body").text().match(/[a-zA-Z]{2,8}-[0-9]{2,8}/g);
    have = false;
    if(codes)
    {
        $.each(codes, function(i, n){
            var code = n;
            GM_xmlhttpRequest({
                method: 'GET',
                url: "http://www.btrabbit.cc/search/"+code+".html",
                onload: function (responseDetails)
                {
                    var responseData = responseDetails.response;
                    var magnet = responseData.match(/[0-9a-zA-Z]{40,}/);
                    console.log("番号对应magnet磁链: magnet:?xt=urn:btih:"+magnet);
                    if(magnet != null)
                    {
                         addToboard("magnet:?xt=urn:btih:"+ magnet, code);
                    }else
                    {
                         addToboard("该磁链暂无下载地址", code);
                    }

                }
            });
        });

        have = true;

    }

    return have;
}

//magnet链接检测
function check_magnets()
{
    var magnets = $("body").text().match(/[0-9a-zA-Z]{40,}/g);
    var have = false;
    if(magnets)
    {
        $.each(magnets, function(i, n){
            var magnet = n;
            if( magnet.length ==40 )
            {
                console.log("发现magnet磁链: magnet:?xt=urn:btih:"+magnet);
                //LXTo115(magnet);
                addToboard("magnet:?xt=urn:btih:"+magnet,"未知");
                have = true;
            }
        });

    }
    return have;
}

//ed2k链接检测
function check_ed2ks()
{
    var ed2ks = $("body").html().match(/ed2k:\/\/[^'"]*/g);
    if(ed2ks)
    {
        $.each(ed2ks, function(i, n){
            var ed2k = n;
            console.log("发现ed2k: "+ed2k);
            //LXTo115(ed2k);
            addToboard(ed2k,"未知");
        });

        return true;
    }

    return false;

}


//复制链接
function copy_link(link)
{
	link.select();
	document.execCommand("copy");
	alert("复制成功\n\n如浏览器不支持此操作，请手动复制");

}




//===========================
//===========================
//============Reveal.js===============
//===========================
//===========================
//===========================



(function($) {

/*---------------------------
 Defaults for Reveal
----------------------------*/

/*---------------------------
 Listener for data-reveal-id attributes
----------------------------*/

	$('a[data-reveal-id]').live('click', function(e) {
		e.preventDefault();
		var modalLocation = $(this).attr('data-reveal-id');
		$('#'+modalLocation).reveal($(this).data());
	});

/*---------------------------
 Extend and Execute
----------------------------*/

    $.fn.reveal = function(options) {


        var defaults = {
	    	animation: 'fadeAndPop', //fade, fadeAndPop, none
		    animationspeed: 300, //how fast animtions are
		    closeonbackgroundclick: true, //if you click background will modal close?
		    dismissmodalclass: 'close-reveal-modal' //the class of a button or element that will close an open modal
    	};

        //Extend dem' options
        var options = $.extend({}, defaults, options);

        return this.each(function() {

/*---------------------------
 Global Variables
----------------------------*/
        	var modal = $(this),
        		topMeasure  = parseInt(modal.css('top')),
				topOffset = modal.height() + topMeasure,
          		locked = false,
				modalBG = $('.reveal-modal-bg');

/*---------------------------
 Create Modal BG
----------------------------*/
			if(modalBG.length == 0) {
				modalBG = $('<div class="reveal-modal-bg" />').insertAfter(modal);
			}

/*---------------------------
 Open & Close Animations
----------------------------*/
			//Entrance Animations
			modal.bind('reveal:open', function () {
			  modalBG.unbind('click.modalEvent');
				$('.' + options.dismissmodalclass).unbind('click.modalEvent');
				if(!locked) {
					lockModal();
					if(options.animation == "fadeAndPop") {
						modal.css({'top': $(document).scrollTop()-topOffset, 'opacity' : 0, 'visibility' : 'visible'});
						modalBG.fadeIn(options.animationspeed/2);
						modal.delay(options.animationspeed/2).animate({
							"top": $(document).scrollTop()+topMeasure + 'px',
							"opacity" : 1
						}, options.animationspeed,unlockModal());
					}
					if(options.animation == "fade") {
						modal.css({'opacity' : 0, 'visibility' : 'visible', 'top': $(document).scrollTop()+topMeasure});
						modalBG.fadeIn(options.animationspeed/2);
						modal.delay(options.animationspeed/2).animate({
							"opacity" : 1
						}, options.animationspeed,unlockModal());
					}
					if(options.animation == "none") {
						modal.css({'visibility' : 'visible', 'top':$(document).scrollTop()+topMeasure});
						modalBG.css({"display":"block"});
						unlockModal()
					}
				}
				modal.unbind('reveal:open');
			});

			//Closing Animation
			modal.bind('reveal:close', function () {
			  if(!locked) {
					lockModal();
					if(options.animation == "fadeAndPop") {
						modalBG.delay(options.animationspeed).fadeOut(options.animationspeed);
						modal.animate({
							"top":  $(document).scrollTop()-topOffset + 'px',
							"opacity" : 0
						}, options.animationspeed/2, function() {
							modal.css({'top':topMeasure, 'opacity' : 1, 'visibility' : 'hidden'});
							unlockModal();
						});
					}
					if(options.animation == "fade") {
						modalBG.delay(options.animationspeed).fadeOut(options.animationspeed);
						modal.animate({
							"opacity" : 0
						}, options.animationspeed, function() {
							modal.css({'opacity' : 1, 'visibility' : 'hidden', 'top' : topMeasure});
							unlockModal();
						});
					}
					if(options.animation == "none") {
						modal.css({'visibility' : 'hidden', 'top' : topMeasure});
						modalBG.css({'display' : 'none'});
					}
				}
				modal.unbind('reveal:close');
			});

/*---------------------------
 Open and add Closing Listeners
----------------------------*/
        	//Open Modal Immediately
    	modal.trigger('reveal:open')

			//Close Modal Listeners
			var closeButton = $('.' + options.dismissmodalclass).bind('click.modalEvent', function () {
			  modal.trigger('reveal:close')
			});

			if(options.closeonbackgroundclick) {
				modalBG.css({"cursor":"pointer"})
				modalBG.bind('click.modalEvent', function () {
				  modal.trigger('reveal:close')
				});
			}
			$('body').keyup(function(e) {
        		if(e.which===27){ modal.trigger('reveal:close'); } // 27 is the keycode for the Escape key
			});


/*---------------------------
 Animations Locks
----------------------------*/
			function unlockModal() {
				locked = false;
			}
			function lockModal() {
				locked = true;
			}

        });//each call
    }//orbit plugin call
})(jQuery);


//入口运行
_init();


///* */
