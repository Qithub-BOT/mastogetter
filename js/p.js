function $(id) {
	return document.getElementById(id);
}

var get_url_vars = (function() {
	var vars = {};
	var param = location.search.substring(1).split('&');
	for(var i = 0; i < param.length; i++) {
			var keySearch = param[i].search(/=/);
			var key = '';
			if(keySearch != -1) key = param[i].slice(0, keySearch);
			var val = param[i].slice(param[i].indexOf('=', 0) + 1);
			if(key != '') vars[key] = decodeURI(val);
	}
	return vars;
})();

function showPreview() {
	console.log(get_url_vars);
	let instance = get_url_vars["i"];
	if (instance.trim() == "") {
		instance = "https://qiitadon.com";
	}
	let toot_id = get_url_vars["t"];
	let toot_ids = toot_id.split(',');
	if (toot_ids[toot_ids.length-1] < "1000000000000000") {
		// 最後の要素が 1.0+E18より小さければ、
		// id の途中で url が切れたと判断して最後の項目を
		// 除外（仕様）
		toot_ids.pop();
	}

	let toot_url = "";
	let target_div = $("cards");
	let xhr = new XMLHttpRequest();

	console.log(toot_ids);
	for (let i = 0; i < toot_ids.length; i++) {
		toot_url = instance + "/api/v1/statuses/" + toot_ids[i];
		xhr.open("GET", toot_url, false);
		xhr.onload = function (e) {
			console.log(toot_url);
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					let obj = JSON.parse(xhr.responseText);
					let e = document.createElement("div");
					e.setAttribute("class","toot");
					e.innerHTML = '<div class="box"><img width="48" height="48" alt="" class="u-photo" src="'+ obj.account.avatar +'"></div>'
						+ '<div class="box"><span class="display-name">'+ obj.account.display_name
						+ '<span>@'+ obj.account.username +'@'+ instance +'</span></span>'
						+ '<div class="e-content" lang="ja" style="display: block; direction: ltr"><p>'+ obj.content +'</p></div></div>';
					target_div.appendChild(e);
				} else {
					console.error(xhr.statusText);
				}
			}
		};
		xhr.onerror = function (e) {
			console.error(xhr.statusText);
		};
		xhr.send(null); 	
	}
}
