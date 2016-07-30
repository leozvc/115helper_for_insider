// ==UserScript==
// @name         老司机自动开车-115离线助手
// @namespace    115helper.for.insider
// @version      1.1
// @supportURL   https://github.com/leozvc/115helper_for_insider/issues
// @description  老司机自动开车-115离线助手, 自动抓取页面磁链同步至115离线
// @author       insider
// @require      http://libs.baidu.com/jquery/2.0.0/jquery.min.js
// @require      //cdn.bootcss.com/jquery-cookie/1.4.1/jquery.cookie.min.js
// @resource     icon1 http://geekdream.com/image/115helper_icon_001.jpg
// @match        http*://*/*
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_openInTab
// @grant       GM_notification
// @grant       GM_getResourceURL
// @run-at      document-end
// ==/UserScript==

var notification_url = ''; //chrome桌面通知默认点击跳转地址
var token_url = 'http://115.com/?ct=offline&ac=space&_='; //获取115 token接口
var lxURL = 'http://115.com/web/lixian/?ct=lixian&ac=add_task_url'; //添加115离线任务接口
var X_userID = 0; //默认115用户ID

//icon图标
var icon = GM_getResourceURL('icon1');


//方法: 初始化方法
function _init()
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




//初始化
_init();

//magnet链接检测
var magnets = $("body").html().match(/magnet:\?xt=urn:btih:[0-9a-zA-Z]{40}/g);
if(magnets)
{
    $.each(magnets, function(i, n){
        var magnet = n;
        console.log("发现magnet磁链: "+magnet);
        LXTo115(magnet);
    });
}


//ed2k链接检测
var ed2ks = $("body").html().match(/ed2k:\/\/[^'"]*/g);
if(ed2ks)
{
    $.each(ed2ks, function(i, n){
        var ed2k = n;
        console.log("发现ed2k: "+ed2k);
        LXTo115(ed2k);
    });
}


///* */