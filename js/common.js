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

function decodePermalink(get_url_vars) {
	let instance_full = get_url_vars["i"];
	if (instance_full.trim() == "") {
		instance_full = "https://qiitadon.com";
		$("instance").value = instance_full;
	}
	let instance = instance_full.split("//")[1];
	let toot_id = get_url_vars["t"];
	let toot_ids = toot_id.split(',');
	if (toot_ids[toot_ids.length-1] < "1000000000000000") {
		// 最後の要素が 1.0+E18より小さければ、
		// id の途中で url が切れたと判断して最後の項目を
		// 除外（仕様）
		toot_ids.pop();
	}

	return {"instance_full": instance_full, 
					"instance": instance,
					"toot_ids": toot_ids};
}
