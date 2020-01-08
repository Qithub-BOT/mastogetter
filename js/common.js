var card_list = [];
var max_index = 0;

function $(id) {
	return document.getElementById(id);
}

var get_url_vars = (function () {
	var vars = {};
	var param = location.search.substring(1).split('&');
	for (var i = 0; i < param.length; i++) {
		var keySearch = param[i].search(/=/);
		var key = '';
		if (keySearch != -1) key = param[i].slice(0, keySearch);
		var val = param[i].slice(param[i].indexOf('=', 0) + 1);
		if (key != '') vars[key] = decodeURI(val);
	}
	return vars;
})();

function deleteCard(index) { }

function decodePermalink(get_url_vars) {
	let instance_full = get_url_vars["i"];
	if (instance_full.trim() == "") {
		instance_full = "https://qiitadon.com";
		if ($("instance") !== null) {
			$("instance").value = instance_full;
		}
	}
	let instance = instance_full.split("//")[1];
	let toot_id = get_url_vars["t"];
	let toot_ids = toot_id.split(',');
	if (toot_ids[toot_ids.length - 1] < "1000000000000000") {
		// 最後の要素が 1.0+E18より小さければ、
		// id の途中で url が切れたと判断して最後の項目を
		// 除外（仕様）
		toot_ids.pop();
	}

	return {
		"instance_full": instance_full,
		"instance": instance,
		"toot_ids": toot_ids
	};
}

function genPermalink(toot_csv = undefined) {
	if ($("permalink") !== null) {
		if (toot_csv === undefined) {
			updatePermalinkFromCardList();
		} else {
			addPermalink(toot_csv);
		}
	}
}

function updatePermalinkFromCardList(){
	console.log('Updaing permalink from card_list.');
	let permalink = "https://hidao80.github.io/mastogetter/p.html?i=" + $("instance").value + "&t=";
	Object.keys(card_list).forEach(function (key) {
		permalink += card_list[key] + ",";
	});
	$("permalink").value = permalink;
}

function addPermalink(toot_csv) {
	console.log('Adding CSV to permalink.');
	$("permalink").value += toot_csv;
}

function showCards(permalink_obj) {
	let instance_full = permalink_obj["instance_full"];
	let instance = permalink_obj["instance"];
	let toot_url = "";
	let target_div = $("cards");
	let xhr = new XMLHttpRequest();
	let toot_ids = permalink_obj["toot_ids"];

	for (let i = 0; i < toot_ids.length; i++) {
		toot_url = instance_full + "/api/v1/statuses/" + toot_ids[i];
		xhr.open("GET", toot_url, false);
		xhr.onload = function (e) {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					let obj = JSON.parse(xhr.responseText);
					let timestamp = moment(obj.created_at).format('llll');
					let e = document.createElement("div");
					e.setAttribute("class", "toot");
					let tmp = "";
					for (let i = 0; i < obj.media_attachments.length; i++) {
						tmp += `<a href='${obj.media_attachments[i].url}'><img class='thumbs' src='${obj.media_attachments[i].preview_url}'></a>`;
					}
					e.innerHTML = `
<div class="box"><img width="48" height="48" alt="" class="u-photo" src="${obj.account.avatar}"></div>
<div class="box"><span class="display-name">${obj.account.display_name}<span>@${obj.account.username}@${instance}</span></span>
<span class="toot-time">${timestamp}</span>
<div class="e-content" lang="ja" style="display: block; direction: ltr"><p>${obj.content}</p></div>
${tmp}</div>
`;
					e.setAttribute("id", max_index);
					e.setAttribute("ondblclick", "deleteCard('" + max_index + "')");
					e.setAttribute("draggable", "true");
					e.addEventListener("dragstart", handleDragStart, false);
					e.addEventListener("dragover", handleDragOver, false);
					e.addEventListener("drop", handleDrop, false);
					e.addEventListener("dragend", handleDragEnd, false);
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

	card_list = card_list.concat(toot_ids);
	genPermalink();
}

function handleDragStart(e) {
	e.dataTransfer.effectAllowed = 'move';
	e.dataTransfer.setData('text/plain', this.id);
}

function handleDragOver(e) {
	if (e.preventDefault) {
		e.preventDefault();
	}
}

function handleDrop(e) {
	if (e.preventDefault) {
		e.preventDefault();
	}
	e.dataTransfer.dropEffect = 'move';
	let node = e.target;
	while (!node.getAttribute("ondblclick")) {
		node = node.parentNode;
	}
	let src = $(e.dataTransfer.getData('text/plain'));
	if (src.id == node.id) {
		return;
	}
	let cards = $("cards");
	let children = cards.childNodes;
	let src_index = -1;
	let node_index = -1;
	for (var i = 0; i < children.length; i++) {
		if (children[i] === src) {
			src_index = i - 1;
		}
		if (children[i] === node) {
			node_index = i - 1;
		}
	}
	if (src_index < 0) {
		return
	}
	if (node_index < 0) {
		return
	}

	cards.removeChild(src);
	cards.insertBefore(src, node);

	if (src_index < node_index) {
		card_list.splice(node_index, 0, card_list[src_index]);
		card_list.splice(src_index, 1);
	} else {
		let toot_id = card_list[src_index]
		card_list.splice(src_index, 1);
		card_list.splice(node_index, 0, toot_id);
	}
	genPermalink();
}

function handleDragEnd(e) {
	console.log("drag end");
}
