var card_list = {};
var max_index = 0;

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

function deleteCard(index) {}

function decodePermalink(get_url_vars) {
	let instance_full = get_url_vars["i"];
	if (instance_full.trim() == "") {
		instance_full = "https://qiitadon.com";
		if ($("instance") !== null) {
			$("instance").value = instance_full;
		}
	}
	let instance = instance_full.split("//")[1];
	let toot_ids_csv = get_url_vars["t"];
	let toot_ids = tootIdsUncompress(toot_ids_csv);
	if (toot_ids[toot_ids.length-1].indexOf("NaN",0) >= 0) {
		toot_ids.pop();
	}

	return {"instance_full": instance_full, 
					"instance": instance,
					"toot_ids": toot_ids};
}

function genPermalink() {
	if ($("permalink") !== null) {
		let permalink = "https://hidao80.github.io/mastogetter/v2/p.html?i="+ $("instance").value +"&t=";
		card_list = tootIdsCompress(card_list);
		Object.keys(card_list).forEach(function (key) {
			permalink += card_list[key] + ",";
		});
		$("permalink").value = permalink;
	}
}

function showCards(permalink_obj) {
	let instance_full = permalink_obj["instance_full"];
	let instance = permalink_obj["instance"];
	let toot_ids = permalink_obj["toot_ids"];
	let toot_url = "";
	let target_div = $("cards");
	let xhr = new XMLHttpRequest();

	for (let i = 0; i < toot_ids.length; i++) {
		toot_url = instance_full + "/api/v1/statuses/" + toot_ids[i];
		xhr.open("GET", toot_url, false);
		xhr.onload = function (e) {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					let obj = JSON.parse(xhr.responseText);
					let timestamp = moment(obj.created_at).format('llll');
					let e = document.createElement("div");
					e.setAttribute("class","toot");
					let tmp = "";
					for (let i = 0; i < obj.media_attachments.length; i++) {
						tmp += "<a href='"+ obj.media_attachments[i].url +"'><img class='thumbs' src='"+ obj.media_attachments[i].preview_url +"'></a>";
					}
					e.innerHTML = '<div class="box"><img width="48" height="48" alt="" class="u-photo" src="'+ obj.account.avatar +'"></div>'
						+ '<div class="box"><span class="display-name">'+ obj.account.display_name
						+ '<span>@'+ obj.account.username +'@'+ instance +'</span></span>'
						+ '<span class="create-at">' + timestamp + '</span>'
						+ '<div class="e-content" lang="ja" style="display: block; direction: ltr"><p>'+ obj.content +'</p></div>'
						+ tmp + '</div>';
					e.setAttribute("id", max_index);
					e.setAttribute("ondblclick", "deleteCard('"+ max_index +"')");
					max_index++;
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
	for (let i = 0; i < toot_ids.length; i++) {
		card_list[i] = toot_ids[i];
	}
	genPermalink();
}

function tootIdsCompress(toot_ids_obj) {
	let toot_ids_ary = {};
	let compress_toot_id;
	Object.keys(toot_ids_obj).forEach(function (key) {
		if (toot_ids_obj[key].indexOf("_") < 0) {
			compress_toot_id = parseInt(toot_ids_obj[key].substr(0,toot_ids_obj[key].length-10)).toString(36);
			compress_toot_id += "_" + parseInt(toot_ids_obj[key].substr(-10)).toString(36);
			toot_ids_ary[key] = compress_toot_id;	
		} else {
			// 圧縮済みのデータはそのまま追加
			toot_ids_ary[key] = toot_ids_obj[key];	
		}
	});
	return toot_ids_ary;
}

function tootIdsUncompress(toot_ids_csv) {
	const toot_ids_ary = toot_ids_csv.split(',');
	let tmp_toot_id;
	let uncompress_toot_id;
	let tmp;
	for (let i = 0; i < toot_ids_ary.length; i++) {
		tmp_toot_id = toot_ids_ary[i].split("_");
		uncompress_toot_id = parseInt(tmp_toot_id[0], 36).toString();
		tmp = parseInt(tmp_toot_id[1], 36).toString();
		uncompress_toot_id += ("00000000000" + parseInt(tmp)).slice(-tmp.length);
		toot_ids_ary[i] = uncompress_toot_id;
	}
	return toot_ids_ary;
}
