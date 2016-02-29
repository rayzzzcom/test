var youtube_grabbed = false;
var createPlayer;
var player;
var youtube_playlist = "PLFSXLuczIM62coWr89ya9hOTmVm9t__L2";
var youtube_key = "AIzaSyAc7zHk-DYgXBS6hUy5aAstdVF_Dnn0Cx8";

function onYouTubeIframeAPIReady() {
	//alert('onYouTubeIframeAPIReady');
	createPlayer = function(id) {
		if(player == undefined) {
			player = new YT.Player('youtube_player', {
			  height: '200',
			  width: '300',
			  videoId: id,
			  playerVars: {'fs': 0},
/*			  events: {
				'onReady': function(event) {
					//alert('onPlayerReady');
				},
			  }*/
			});
		}
		else {
			player.loadVideoById(id);
			window.addEventListener("orientationchange", onOrientationChange);
			if(window.orientation == 90 || window.orientation == 270) 
				expandVideo();
			screen.lockOrientation('landscape');									
		}
	}
}
			
function initYoutube() {
	if(!youtube_grabbed) {
		$.mobile.loading('show');
		$.ajax({type: "GET", url: "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=20&playlistId=" + youtube_playlist + "&key=" + youtube_key, cache: false, dataType:'jsonp', success: function(data){
			for(var i=0; i<data.items.length; i++) {
				if(data.items[i].snippet.thumbnails != undefined) {
					$('#videos').append('<a style="margin:2px;" role="button" id="youtube' + i + '"><img alt="' + data.items[i].snippet.resourceId.videoId + '" src="' + data.items[i].snippet.thumbnails.default.url + '" /></a>');
					$(document).on('vclick', '#youtube' + i, function(e){e.preventDefault();set_youtube(e.target['alt'])});
				}
			}
			youtube_grabbed = true;
			$.mobile.loading('hide');
		  }
		});
		createPlayer('rdoW1NSIM7M');
	}
}
function set_youtube(id) {
	if(id == "") {
		if(player != undefined)
			player.stopVideo();
	}
	else {
		createPlayer(id);
	}
}
function onOrientationChange() {
	if(window.orientation == 90 || window.orientation == 270) 
		expandVideo();
}
function expandVideo() {
	var h = effectiveDeviceHeight();
	var w = effectiveDeviceWidth();
	$('#youtube_player').css({display: 'block', width: h + 'px', height: w + 'px'});
	blockBack = true;
	document.addEventListener("backbutton", onVideoBack);
	AndroidFullScreen.immersiveMode(null, null);
}
function onVideoBack(e) {
	screen.unlockOrientation();
	set_youtube('');
	$('#youtube_player').css({display: 'none'});
	blockBack = false;
	document.removeEventListener("backbutton", onVideoBack);
	window.removeEventListener("orientationchange", onOrientationChange);
	AndroidFullScreen.showSystemUI(null, null);
}
function effectiveDeviceWidth() {
    var deviceWidth = window.orientation == 0 ? window.screen.height : window.screen.width;
    if (navigator.userAgent.indexOf('Android') >= 0 && window.devicePixelRatio)
        deviceWidth = deviceWidth / window.devicePixelRatio;
    return deviceWidth;
}

function effectiveDeviceHeight() {
    var deviceHeight = window.orientation == 0 ? window.screen.width : window.screen.height;
    if (navigator.userAgent.indexOf('Android') >= 0 && window.devicePixelRatio)
        deviceHeight = deviceHeight / window.devicePixelRatio;
    return deviceHeight;
}