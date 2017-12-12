// ==UserScript==
// @name         老司机自动开车 V1.1.5
// @namespace    115helper.for.insider
// @version      1.1.5
// @supportURL   https://github.com/leozvc/115helper_for_insider/issues
// @description  老司机自动开车-115离线助手, 自动抓取页面磁链同步至115离线
// @author       insider
// @require      http://libs.baidu.com/jquery/1.10.2/jquery.min.js
// @require      http://cdn.bootcss.com/jquery-cookie/1.4.1/jquery.cookie.min.js
// @require      http://apps.bdimg.com/libs/bootstrap/3.3.4/js/bootstrap.min.js
// @require      http://geekdream.com/bootstrapEx.js
// @resource      bootstrapCSS http://apps.bdimg.com/libs/bootstrap/3.3.4/css/bootstrap.css
// @resource      bootstrapExCSS   http://geekdream.com/bootstrapEx.css
// @resource     icon1 http://geekdream.com/image/115helper_icon_001.jpg
// @match       http://www.zhaonima.com/*
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

var css1 = GM_getResourceText ("bootstrapCSS");
GM_addStyle (css1);
var css2 = GM_getResourceText ("bootstrapExCSS");
GM_addStyle (css2);

var notification_url = ''; //chrome桌面通知默认点击跳转地址
var token_url = 'http://115.com/?ct=offline&ac=space&_='; //获取115 token接口
var lxURL = 'http://115.com/web/lixian/?ct=lixian&ac=add_task_url'; //添加115离线任务接口
var X_userID = 0; //默认115用户ID
var Modal3;
//icon图标
var icon = GM_getResourceURL('icon1');


  function InitModal3() {
        $(document.body).append('<div id="modal3"></div>');
        Modal3 = new Modal();
        Modal3.renderto = "#modal3";
        Modal3.InitShow = true;
        Modal3.btns = [{ id: "closebtn", text: "关闭"  }];
        Modal3.setTitle = "老司机自动开车 V1.1.5";
        tab1 = new Tab();

        table_htmls = '<div class="table table-striped" id="links"><table class="table"><thead><tr><th class="col-5" style="word-break:break-all;word-wrap:break-all">磁链</th><th class="col-4">操作</th></tr></thead><tbody></tbody></table></div>';

        Modal3.OnfirstInited = function (thismodal) {
            tab1.tabs = [ {
                id: "tabs1", title: '快速下载',active: true, bodyel: table_htmls
            },{
                id: "tabs2", title: "作死买家秀", isiframe: true, url: "http://zuosi.la/"
            }];
            tab1.renderto = thismodal.body;
            tab1.Init();
        };
    }




//方法: 初始化方法
function _init()
{

        //弹出框初始化
        InitModal3();
        Modal3.show();
        Modal3.hide();
    //扫码磁链,番号
    c_m = check_magnets();
    c_e = check_ed2ks();

    if (c_m || c_e)
    {
        down_btn = '<button type="button" id="down_btn" class="btn btn-primary btn-lg" style="border: 1px solid #D4CD49; position:fixed;left:0;top:30%">发现磁链 马上下载!</button>';
        $("body").append(down_btn);
    }



    //115.com监测
    do_115();

    $("#down_btn").click(function(){


        Modal3.show();
        Modal3.setHeigth("400px");
        Modal3.setWidth("900px");
    });

    //点击 下载到115 按钮
    $(".download_to_115").click(function(){

        $(this).button('loading').delay(1000).queue(function() {
            $(this).button('complete');
        });
        link = $(this).parents("tr").find(".link_url").val();
        LXTo115(link);
    });

    //点击 复制到粘贴板 按钮
    $(".copy_magnetlink").click(function(){

        $(this).button('loading').delay(1000).queue(function() {
            $(this).button('complete');
        });
        link = $(this).parents("tr").find(".link_url");
        copy_link(link);
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
function addToboard(url)
{
    html = '<tr><td ><form class="bs-example bs-example-form" ><div class="input-group"><input class="link_url input-block-level span8" type="text" value="'+url+'" style="width:500px"></div></form></td><td><div class="btn-group"><button type="button" class="btn btn-primary download_to_115"  data-complete-text="传输成功">下载到115</button><button type="button" class="btn btn-primary copy_magnetlink"  data-complete-text="复制成功">复制到粘贴板</button></div></td></tr>';

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


//magnet链接检测
function check_magnets()
{
    var magnets = $("body").html().match(/magnet:\?xt=urn:btih:[0-9a-zA-Z]{40}/g);
    if(magnets)
    {
        $.each(magnets, function(i, n){
            var magnet = n;
            console.log("发现magnet磁链: "+magnet);
            //LXTo115(magnet);
            addToboard(magnet);

        });
        return true;
    }
    return false;
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
            addToboard(ed2k);
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


//入口运行
_init();


///* */
