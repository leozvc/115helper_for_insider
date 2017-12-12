// ==UserScript==
// @name         老司机自动开车 V1.1.5
// @namespace    115helper.for.insider
// @version      1.1.5
// @supportURL   https://github.com/leozvc/115helper_for_insider/issues
// @description  老司机自动开车-115离线助手, 自动抓取页面磁链同步至115离线
// @author       insider
// @require      http://libs.baidu.com/jquery/1.10.2/jquery.min.js
// @require      http://cdn.bootcss.com/jquery-cookie/1.4.1/jquery.cookie.min.js
// @require      https://apps.bdimg.com/libs/bootstrap/3.3.4/js/bootstrap.min.js

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

//boostrapEx modal

var bootstrapEx = {};
bootstrapEx.language = {
    Modal: {
        title: function () { return "窗口标题"; },
        closebtn: function () { return "关闭"; }
    }
};
(function ($) {
    doCallback = function (fn, args) {
        return fn.apply(this, args);
    }

    //modal弹出层
    Modal = function () {
        var _Modal = {
            renderto: "",//绘制ID
            header: null,//头元素
            body: null,//body元素
            footer: null,//footer元素
            btns: [],//按钮组
            title: bootstrapEx.language.Modal.title(),//title
            showclosebtn: true,//显示关闭按钮
            InitMax: true,//是否最大化
            firstInit: false,
            setHeigth: function (h) {
                var t = this;
                $(t.renderto).find('.modal-body').css('min-height', h);// - 110 * 2
                $(window).resize(function () {
                    $(t.renderto).find('.modal-body').css('min-height', h);// - 110 * 2
                });
            },//设置高度
            setWidth: function (w) {
                var t = this;
                $(t.renderto).find('.modal-dialog').css('width', w);// - 200 * 2
                $(window).resize(function () {
                    $(t.renderto).find('.modal-dialog').css('width', w);// - 200 * 2
                });
            },//设置宽度
            modal: { show: true, backdrop: 'static' },
            Init: function (isshow) {
                var t = this;
                $(t.renderto).html('');
                var body = t.body;
                t.header = null;
                t.body = null;
                t.footer = null;
                if (!$(t.renderto).hasClass('modal')) {
                    $(t.renderto).addClass('modal');
                }
                if (!$(t.renderto).hasClass('fade')) {
                    $(t.renderto).addClass('fade');
                }
                $(t.renderto).append('<div class="modal-dialog"><div class="modal-content"></div></div>');
                t.header = $('<div class="modal-header"></div>');
                if (t.showclosebtn) {
                    $(t.header).append('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>');
                }
                $(t.header).append('<div class="modal-title">' + t.title + '</div>');
                $(t.renderto).find(".modal-content").append(t.header);
                t.body = $('<div class="modal-body"></div>');
                $(t.renderto).find(".modal-content").append(t.body);
                t.body.append(body);
                t.footer = $('<div class="modal-footer"></div>');
                $(t.renderto).find(".modal-content").append(t.footer);
                t.btns.forEach(function (btn) {
                    var btnclass = btn.class || "btn-primary";
                    var _b = "";
                    if (btn.id != "closebtn") {
                        _b = $('<button class="btn" type="button"  id="' + btn.id + '">' + btn.text + '</button>');
                        $(_b).addClass(btnclass);
                    } else {
                        _b = $('<button class="btn btn-default" type="button" data-dismiss="modal" aria-hidden="true" id="' + btn.id + '">' + bootstrapEx.language.Modal.closebtn() + '</button>');
                    }
                    $(t.footer).append(_b);
                }, this);
                if (t.InitMax) {
                    $(t.renderto).find('.modal-dialog').css('width', $(window).width() - 150 * 2);// - 200 * 2
                    $(t.renderto).find('.modal-body').css('min-height', $(window).height() - 110 * 2);// - 150 * 2
                }
                if (isshow) {
                    var moopt = { show: true, backdrop: 'static' };//keyboard
                    moopt = $.extend(moopt, t.modal);
                    $(t.renderto).modal(moopt);
                }
                $(t.renderto).on('shown.bs.modal', function () {
                    try {
                        eval(t.renderto.replace("#", "").replace(".", "") + "_Show();");
                    } catch (ex) { }
                })

                $(t.renderto).on('hide.bs.modal', function () {
                    try {
                        eval(t.renderto.replace("#", "").replace(".", "") + "_Hide();");
                    } catch (ex) { }
                })
                $(t.renderto).on('hidden.bs.modal', function () {
                    try {
                        eval(t.renderto.replace("#", "").replace(".", "") + "_Hideend();");
                    } catch (ex) { }
                })
                t.firstInit = true;
                doCallback(t.OnfirstInited, [t]);
            },
            setTitle: function (title) {//设置标题
                var t = this;
                t.title = title;
                $(t.header).find('.modal-title').html(t.title);
            },
            toggle: function () {//设置是否显示
                var t = this;
                $(t.renderto).modal('toggle');
            },
            show: function () {//显示
                var t = this;
                if (!t.firstInit) {
                    t.Init();
                }
                var moopt = { show: true, backdrop: 'static' };//keyboard
                moopt = $.extend(moopt, t.modal);
                $(t.renderto).modal(moopt);
            },
            hide: function () {//关闭
                var t = this;
                $(t.renderto).modal('hide');
            },
            OnfirstInited: function () {

            }


        }
        return _Modal;
    }
    //页签tab
    Tab = function () {
        var tabdefault = function () {
            var _tab = {
                id: "",//id
                title: "",//标题
                url: "",//地址
                isiframe: false,//是否生成ifram
                active: false,//是否激活
                iframe: null,//ifram
                iframefn: null,//返回ifram 的中的contentWindow对象 执行function 返回
                tabel: null,//页签元素
                bodyel: null,//body元素
                load: null,//load 事件触发
                showclosebtn: false
            }; return _tab;
        }
        var _tabs = {
            renderto: "",//绘制ID
            navtabs: null,
            tabcontent: null,
            tabs: [],
            fade: true,//是否显示过度效果
            firstInit: false,
            show: function (tab) {
                var tabindex;
                var t = this;
                if (!t.firstInit) {
                    t.init();
                }
                if (typeof tab == "number") {
                    tabindex = parseInt(tab);
                }
                else if (typeof tab == "object") {
                    tabindex = t.tabs.indexOf(tab);
                }
                $(t.renderto).find('li').removeClass('active');
                $(t.renderto).find('div.tab-pane').removeClass('active');
                if ($(t.renderto).find('li').eq(tabindex).css("display") == 'none') {
                    $(t.renderto).find('li').eq(tabindex).css("display", "inline");
                }
                $(t.renderto).find('li').eq(tabindex).addClass('active');
                $(t.renderto).find('div.tab-pane').eq(tabindex).addClass('active');
                if ($(t.renderto).find('div.tab-pane').eq(tabindex).hasClass('fade') && !$(t.renderto).find('div.tab-pane').eq(tabindex).hasClass('in')) {
                    $(t.renderto).find('div.tab-pane').eq(tabindex).addClass('in');
                }
                if (t.tabs && t.tabs[tabindex] && t.tabs[tabindex].id) {
                    eval("var fun;try{fun=" + t.tabs[tabindex].id + "_onactive;}catch(ex){}");
                    if (fun) {
                        fun(t);
                    }
                }
            },
            hide: function (tab) {
                var tabindex;
                var t = this;
                if (typeof tab == "number") {
                    tabindex = parseInt(tab);
                }
                else if (typeof tab == "object") {
                    tabindex = t.tabs.indexOf(tab);
                }
                if (t.tabs.length == 1 && tabindex == 0) { return };
                $(t.renderto).find('li').eq(tabindex).css("display", "none");
                //隐藏后显示后一个，如果后一个本来就隐藏就显示再后一个
                for (var k = tabindex - 1; k >= 0 && k <= t.tabs.length - tabindex; k--) {
                    if ($(t.renderto).find('li').eq(k).css("display") != 'none') {
                        t.show(k);
                        break;
                    }
                }
                if (t.tabs && t.tabs[tabindex] && t.tabs[tabindex].id) {
                    eval("var fun;try{fun=" + t.tabs[tabindex].id + "_onhide;}catch(ex){}");
                    if (fun) {
                        fun(t);
                    }
                }
            },
            Init: function () {//绘制方法
                var t = this;
                t.navtabs = $('<ul class="nav nav-tabs"></ul>');
                t.tabcontent = $('<div class="tab-content"></div>');
                $(t.renderto).append(t.navtabs);
                $(t.renderto).append(t.tabcontent);
                var is_active = false;
                $.each(t.tabs, function (i, _tab) {
                    tab = $.extend(tabdefault(), _tab);
                    tab.tabel = $('<li> <a data-toggle="tab" href="#' + tab.id + '" >' + tab.title + '</a></li>');
                    if (tab.showclosebtn) {
                        tab.tabel = $('<li> <a data-toggle="tab" style="padding-right:25px;" href="#' + tab.id + '" >' + tab.title
                            + '&nbsp;<i class="glyphicon glyphicon-remove small" tabsindex="' + i + '" id="tabclose_' + i + '" style="position: absolute;top: 14px;cursor: pointer; opacity: 0.3;" ></i></a></li>');
                    }
                    var bodyel = tab.bodyel;
                    tab.bodyel = $('<div class="tab-pane" id="' + tab.id + '"></div>');
                    if (tab.isiframe) {
                        tab.iframe = $('<iframe id="' + tab.id + '_iframe" width="100%" height="100%" src="' + tab.url + '" frameborder="0"></iframe>');
                        $(tab.bodyel).append(tab.iframe);
                    }
                    if (t.fade) {
                        $(tab.bodyel).addClass("fade");
                        $(tab.bodyel).addClass("in");
                    }
                    if (!is_active && tab.active) {
                        is_active = true;
                        $(tab.tabel).addClass("active");
                        $(tab.bodyel).addClass("active");
                    }
                    $(t.navtabs).append(tab.tabel);
                    $(t.tabcontent).append(tab.bodyel);
                    tab.bodyel.append(bodyel);
                    t.tabs[i] = tab;
                    if (document.getElementById(tab.id + '_iframe') && document.getElementById(tab.id + '_iframe').contentWindow) {
                        tab.iframefn = document.getElementById(tab.id + '_iframe').contentWindow;
                    }
                    tab.iframe = $('#' + tab.id + '_iframe');
                    var load;
                    if (tab.load) {
                        load = tab.load;
                        $('#' + tab.id + '_iframe').load(function () {
                            load(this);
                        });
                    }
                })
                //$(t.renderto).find('.tab-pane').css('min-height', $(t.renderto).height());
                setTimeout(function () {
                    $(t.renderto).find('.tab-pane').find('iframe').css('min-height', $(window).height() - 140 * 2);
                }, 200);
                $(t.navtabs).find('[tabsindex]').on('click', function () {
                    t.hide(parseInt($(this).attr('tabsindex')));
                    return false;
                })
                t.firstInit = true;
                doCallback(t.OnfirstInited, [t]);
            },
            isactive: function (tab) {
                var tabindex;
                var t = this;
                if (typeof tab == "number") {
                    tabindex = parseInt(tab);
                }
                else if (typeof tab == "object") {
                    tabindex = t.tabs.indexOf(tab);
                }
                if (tabindex == 0) { return };
                return $(t.renderto).find('li').eq(tabindex).css("display") != 'none';
            },
            OnfirstInited: function () {
            }
        };
        return _tabs;
    }
    getNowDateInt = function () {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + month + strDate
            + date.getHours() + date.getMinutes()
            + date.getSeconds();
        return currentdate;
    }

})(jQuery);

//入口运行
_init();


///* */
