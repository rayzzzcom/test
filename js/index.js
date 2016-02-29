var blockBack = false;
var pushRegId;
var instagram_grabbed = false;
var gallery_inited = false;
var images_path = 'rayz';

/*var pages = [];
var currentPage = null;*/
function navigateTo(page) {
/*	if(currentPage != null)
		currentPage.detach();
	currentPage = pages[page].appendTo("body");*/
	$.mobile.navigate('#' + page);
}

/*function onBack(event) {
	if($.mobile.activePage.attr("id") == "main"){
		event.preventDefault();
		navigator.app.exitApp();
	}
}*/
function refreshSendButton() {
	if($('#push_text').val() != '')
		$('#push_send').removeAttr('disabled');
	else
		$('#push_send' + buttonId).attr('disabled', 'disabled');
}
function sendPush() {
	jQuery.post("http://rayzzz.com/rayz_push.php", {regId: pushRegId, text: $('#push_text').val()}).done(
		function(data) {
			//navigator.app.exitApp();
	});
	navigator.app.exitApp();
}

function share(mode) {
	switch(mode) {
		case 'fb':
			window.plugins.socialsharing.shareViaFacebook(language[currentLang]['share_message'], null /* img */, null /* url */,
				function() {console.log('share ok')},
				function(errormsg){
					cordova.plugins.market.open('com.facebook.katana', {success: null,
					  failure: function() {alert('error opening facebook')}
					});
				}
			);
			break;
		case 'tw':
			window.plugins.socialsharing.shareViaTwitter(language[currentLang]['share_message'], null /* img */, null /* url */,
				function() {console.log('share ok')},
				function(errormsg){
					cordova.plugins.market.open('com.twitter.android', {success: null,
					  failure: function() {alert('error opening twitter')}
					});
				}
			);
			break;
		default:
			window.plugins.socialsharing.share(language[currentLang]['share_message'], null /* img */, null /* url */);
			break;
	}
}

function toggleCollapse(id) {
	var col = $('#' + id + '_col').parent();
	if(col.hasClass("ui-collapsible-content-collapsed")) {
		col.removeClass("ui-collapsible-content-collapsed");
		$('#' + id + '_btn > a').removeClass("ui-icon-plus").addClass("ui-icon-minus");
	}
	else {
		col.addClass("ui-collapsible-content-collapsed");
		$('#' + id + '_btn > a').removeClass("ui-icon-minus").addClass("ui-icon-plus");
	}
}

function initGalleryJS(elementId, containerId, flag) {
	if(flag)
		initGallery(elementId, containerId);
	else {
		$.getScript("js/blueimp-helper.js");
		$.getScript("js/blueimp-gallery.js");
		$.getScript("js/blueimp-gallery-fullscreen.js");
		$.getScript("js/blueimp-gallery-indicator.js", function() {
			initGallery(elementId, containerId);
		});
	}
}
function initGallery(elementId, containerId) {
	document.getElementById(elementId).onclick = function (event) {
		event = event || window.event;
		var target = event.target || event.srcElement,
			link = target.src ? target.parentNode : target,
			options = {index: link, event: event, container: '#' + containerId},
			links = this.getElementsByTagName('a');
		blueimp.Gallery(links, options);
	};
	$.mobile.loading('hide');
}
function onSettingsReady() {
	if(!bAndroid)
		return;
	var push = PushNotification.init({
		"android": {"senderID": getSetting('push_sender_id')},
		"ios": {"alert": "true", "badge": "true", "sound": "true"}, "windows": {} 
	});
	push.on('registration', function(data) {
		pushRegId = data.registrationId;
//			alert(pushRegId);
//			window.plugins.socialsharing.share(pushRegId, null /* img */, null /* url */);
	});
	push.on('notification', function(data) {
/*		var s='';
		for(var i in data.additionalData)
			s += i + ' - ' + data.additionalData[i] + '\n';
		alert('notification: message - ' + data.message + '\ntitle - ' + data.title + '\ncount - ' + data.count + '\nsound - ' + data.sound + '\nimage - ' + data.image + '\nadditionalData:' + s);
		*/
		if(data.additionalData.additionalData == 'update') {//news should be updated
			//if news are already displayed then add new items to displayed ones
			grabNews(news_displayed ? onAddNews : null, true);				
		}
		if(data.additionalData.foreground) {
			//to do whenapp is on
		}
	});
	grabNews(onShortNews, false);
}
function doInit() {
	$(document).on( "pagechange", function(event, ui) {
	  /*if(ui.prevPage != undefined && ui.prevPage.attr('id') != undefined)
		$('#' + ui.prevPage.attr('id') + '_btn').removeClass('ui-btn-active');
	  $('#' + ui.toPage.attr('id') + '_btn').addClass('ui-btn-active');*/
	  switch(ui.toPage.attr('id')) {
		case 'news':
			if(!news_displayed) {
				$.mobile.loading('show');
				grabNews(onShowNews, false);
				news_displayed = true;
			}
			break;
		case 'youtube':
			initYoutube();
			break;
		case 'portfolio':
			if(!gallery_inited) {
				$.mobile.loading('show');
				initGalleryJS('links', 'blueimp-gallery', instagram_grabbed);
				gallery_inited = true;
			}
			break;
		case 'instagram':
			if(!instagram_grabbed) {
				$.mobile.loading('show');
				var feed = new Instafeed({
					get: 'user',
					userId: 'self',
					accessToken: '1586518810.745c638.35230b6594384665b4e82162be4fe6a7',
					//https://elfsight.com/service/get-instagram-access-token/
					resolution: 'standard_resolution',
					template: '<a href="{{image}}" style="margin:2px;"><img width="75" height="75" src="{{image}}" /></a>',
					after: function() {
						initGalleryJS('instafeed', 'blueimp-gallery-instagram', gallery_inited);
						instagram_grabbed = true;
					}
				});
				feed.run();
			}
			break;
	  }
	  set_youtube('');
	});
/*	$('a').bind('vclick click',function(e){
		e.preventDefault();
		var s = "";
		for(var i in e)
			s += i + "-" + e[i];
		alert(s);
	});*/
	
	$(document).on('vclick', '#main_btn', function(e){e.preventDefault();navigateTo('main');});
	$(document).on('vclick', '#contact_btn', function(e){e.preventDefault();navigateTo('contact');});
	$(document).on('vclick', '#news_btn', function(e){e.preventDefault();navigateTo('news');});
	$(document).on('vclick', '#services_btn', function(e){e.preventDefault();navigateTo('services');});
	$(document).on('vclick', '#portfolio_btn', function(e){e.preventDefault();navigateTo('portfolio');});
	$(document).on('vclick', '#instagram_btn', function(e){e.preventDefault();navigateTo('instagram');});
	$(document).on('vclick', '#youtube_btn', function(e){e.preventDefault();navigateTo('youtube');});
	$(document).on('vclick', '#testimonials_btn', function(e){e.preventDefault();navigateTo('testimonials');});
	$(document).on('vclick', '#fb_btn', function(e){e.preventDefault();share('fb');});
	$(document).on('vclick', '#tw_btn', function(e){e.preventDefault();share('tw');});
	$(document).on('vclick', '#etc_btn', function(e){e.preventDefault();share();});
	$(document).on('vclick', '#push_btn', function(e){e.preventDefault();navigateTo('#push');});
	$(document).on('vclick', '#externalpanel_btn', function(e){e.preventDefault();$("#externalpanel").panel("open");});
	$(document).on('vclick', '#langpopup_btn', function(e){e.preventDefault();$("#langpopup").popup("open", {x:$(document).width(), y:80});});
	$(document).on('vclick', '#gallery_btn > a', function(e){e.preventDefault();toggleCollapse('gallery');});
	$(document).on('vclick', '#share_btn > a', function(e){e.preventDefault();toggleCollapse('share');});
	
	if(bAndroid) {
		document.addEventListener("backbutton", function(e){
			if(blockBack)
				return;
			if($("#externalpanel").hasClass("ui-panel-open")) {
				$("#externalpanel").panel("close");
			}
			else if($.mobile.activePage.is('#main')) {
				navigator.app.exitApp();
			}
			else if($.mobile.activePage.is('#news_post')) {
				navigateTo('news');
			}
			else {
				navigateTo('main');
			}
		}, false);
		$(document).on("swiperight", function(e) {
		  if ( e.type === "swiperight"  ) {
			$( "#externalpanel" ).panel( "open" );
		  } else if ( e.type === "swipeleft" ) {
			$( "#externalpanel" ).panel( "close" );
		  }
		});
		navigator.globalization.getPreferredLanguage(
			function (language) {setLanguage(language.value.substring(0, 2));},
			null
		);
	}
	initSettings();
}

var currentLang = "ru";
var language = {
	ru: {
		title: "Визитка",
		settings: "Настройки",
		contact: "Связаться с нами",
		contact_menu: "Контакты",
		address: "Адрес: Гражданский Проспект, 113к3",
		phone: "Телефон: ",
		home_menu: "Главная",
		news: "Новости и акции",
		news_all: "ВСЕ",
		news_menu: "Новости",
		services: "Услуги и цены",
		services_menu: "Услуги",
		portfolio: "Портфолио",
		portfolio_menu: "Портфолио",
		portfolio_desc: "Здесь будут фотографии из вашего портфолио",
		instagram: "Instagram",
		instagram_menu: "Instagram",
		instagram_desc: "Здесь будут фотографии из вашего Instagram",
		youtube: "YouTube",
		youtube_menu: "YouTube",
		youtube_desc: "Здесь будут видео из вашего YouTube-канала или любого плэйлиста",
		testimonials: "Отзывы",
		testimonials_menu: "Отзывы",
		vk_menu: "ВКонтакте",
		fb_menu: "FaceBook",
		tw_menu: "Twitter",
		etc_menu: "Другое",
		push: "Уведомления",
		push_menu: "Уведомления",
		push_desc: "Push-уведомления можно рассматривать как небольшой диалог между покупателем и продавцом. Это мощный маркетинговый инструмент при эффективном использовании.<br />Основной целью Push-уведомлений является информирование пользователей о новостях компании, обновлении ассортимента услуг и товаров, предстоящих акциях или скидках, либо просто напоминание о себе.",
		push_sample: "Введите любой текст и нажмите кнопку <b>Отправить</b>. Приложение закроется, и в течение 10 секунд получите уведомление. Нажмите на него, чтобы снова открыть приложение.",
		push_send: "Отправить",
		gallery_menu: "Галерея",
		share_menu: "Поделиться",
		share_message: "Разработка сайтов и мобильных приложений",
	},
	en: {
		title: "Presentation",
		settings: "Settings",
		contact: "Contact us",
		contact_menu: "Contacts",
		address: "Address: Grazhdanskiy Prospekt, 113k3",
		phone: "Phone: ",
		home_menu: "Home",
		news: "News and actions",
		news_all: "ALL",
		news_menu: "News",
		services: "Services and Prices",
		services_menu: "Services",
		portfolio: "Portfolio",
		portfolio_menu: "Portfolio",
		portfolio_desc: "Photos from your Portfolio will be here",
		instagram: "Instagram",
		instagram_menu: "Instagram",
		instagram_desc: "Photos from your Instagram will be here",
		youtube: "YouTube",
		youtube_menu: "YouTube",
		youtube_desc: "Photos from your YouTube channel or any playlist will be here",
		testimonials: "Testimonials",
		testimonials_menu: "Testimonials",
		vk_menu: "VKontakte",
		fb_menu: "FaceBook",
		tw_menu: "Twitter",
		etc_menu: "Other",
		push: "Push-Notifications",
		push_menu: "Notifications",
		push_desc: "Push-notifications can be considered as a little dialogue between a client and a company. Push-notifications is a powerful marketing tool.<br />The main purpose of Push-notifications is to inform clients about news, updated assortment of goods and services, upcoming promotions or discounts, or simply a reminder of your company.",
		push_sample: "Enter some text and push <b>Send</b> button. The applicatioin will close, a push-notification will arrive in 10 seconds. Click it to open the application again.",
		push_send: "Send",
		gallery_menu: "Gallery",
		share_menu: "Share",
		share_message: "Sites and mobile applications development",
	}
};

function setLanguage(lang) {
	if(language[lang] != null) {
		currentLang = lang;
		$(".lang").each(function(index) {
			if(this.classList[1] != undefined)
				this.textContent = language[lang][this.classList[1]];
		});
		$('#lang_img').attr('src', $('#lang_' + lang).attr('src'));
		$("#langpopup").popup("close");
	}	
}