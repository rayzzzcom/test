var user = "1";
var oSettings = null;
function initSettings() {
	oSettings = JSON.parse(window.localStorage.getItem('settings'));
	if(oSettings == null) {
		$.ajax({type: "GET", url: "http://rayzzz.com/dolphin/settings.php?id=" + user, cache: false, dataType:'jsonp', crossDomain: true, success: function(data){
			oSettings = data;
			window.localStorage.setItem('settings', JSON.stringify(oSettings));
			onSettingsReady();
		  }
		});
	}
	else {
		onSettingsReady();
	}
}

function getSetting(key, def) {
	if(oSettings[key] == undefined)
		oSettings[key] = def == undefined ? '' : def;
	return oSettings[key];
}
	
//window.localStorage.setItem('news', JSON.stringify({date: 0,last: 0,items: []}));
var oNews = {};
var news_displayed = false;

function grabNews(callback, bForse) {
	oNews = JSON.parse(window.localStorage.getItem('news'));
	if(oNews == null) {
		oNews = {
			date: 0,
			last: 0,
			items: []
		};
	}
	var dNow = new Date();
	var iTimeNow = dNow.getTime()
	if((bForse != undefined && bForse == true) || (iTimeNow - oNews['date']) > getSetting('posts_update', 5) * 86400000) {//if last update more than [5 to 15 days] ago
		var url = getSetting('posts_url', "http://rayzzz.com/dolphin/blogs/?action=json&user=#user#&id=#id#").replace('#user#', user);
		url = url.replace('#id#', oNews['last']);
		$.ajax({type: "GET", url: url, cache: false, dataType:'jsonp', crossDomain: true, success: function(data){
//			wallpaper.getPath(images_path, function(path){
				oNews['date'] = iTimeNow;
//				var j=0;
//				for(var i=0; i<data.length; i++) {
//					if(data[i]['icon'] != null) {
//						var file = data[i]['id'] + '_icon';
//						wallpaper.saveImage(data[i]['icon'], file, images_path, function(result){
//							data[i]['icon'] = result;
//						}, null);
//						data[i]['icon'] = path + file + '.jpeg';
//					}
//					j=0;
//					data[i]['body'] = data[i]['body'].replace(/<img ([^>])*/gi, function(res) {
//						res = res.replace(/src="([^">])*/gi, function(res1) {
//							j++;
//							var url = res1.substring(5);
//							var file = data[i]['id'] + '_image_' + j;
//							wallpaper.saveImage(url, file, images_path, null, null);
//							return 'src="' + path + file + '.jpeg';
//						});
//						return res;
//					});
//				}
				if(data[0] != undefined && data[0]['id'] != undefined) {
					oNews['last'] = data[0]['id'];
					oNews['items'] = data.concat(oNews['items']);
				}
				window.localStorage.setItem('news', JSON.stringify(oNews));
				if(callback != null) {
					oNews['newItems'] = data;
					callback();
				}
//			}, null);
		  },
		  error: function(XMLHttpRequest, textStatus, errorThrown) { 
			alert("Status: " + textStatus + " Error: " + errorThrown); 
		  }
		});
	}
	else if(callback != null) {
		oNews['newItems'] = [];
		callback();
	}
}
function onShortNews() {
	printNews('items', getSetting('posts_short', 2), 'news_short');
}
function onShowNews() {
	printNews('items');
	$.mobile.loading('hide');
}
function onAddNews() {
	printNews('newItems');
}
function printNews(itemsId, limit, container) {
	if(limit == undefined || limit > oNews[itemsId].length)
		limit = oNews[itemsId].length;
	var sContent = '';
	for(var i=0; i<limit; i++) {
		var img = oNews[itemsId][i]['icon'] == null ? '' : '<img src="' + oNews[itemsId][i]['icon'] + '" />';
		sContent += '<a onclick="setNewsPost(' + i + ')"><div class="news_post">' + img + '<div class="news_title">' + oNews[itemsId][i]['caption'] + '</div></div></a>';
	}
	if(container == undefined)
		container = 'news_content';
	$('#' + container).prepend(sContent);
}
function setNewsPost(id) {
	$('#news_caption').html(oNews['items'][id]['caption']);
	$('#news_body').html(oNews['items'][id]['body']);
	$('#news_icon img').attr('src', oNews['items'][id]['icon']);
	navigateTo('news_post');
	//alert($('#news_icon img').attr('src') + ' - ' + $('#news_body').html());
}