let card_list = [];
let max_index = 0;

function $(id) {
	return document.getElementById(id);
}

const get_url_vars = (function () {
	const vars = {};
	const params = location.search.substring(1).split('&');
	for (let i = 0; i < params.length; i++) {
		if (/=/.test(params[i])) {
			const [key, val] = params[i].split('=');
			vars[key] = val;
		}
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
	const instance = instance_full.split("//")[1];
	const toot_id = get_url_vars["t"];
	const toot_ids = toot_id.split(',');
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
	const instance_full = permalink_obj["instance_full"];
	const instance = permalink_obj["instance"];
	const toot_ids = permalink_obj["toot_ids"];
	const xhr = new XMLHttpRequest();
	const target_div = $("cards");
	let toot_url = "";

	for (let i = 0; i < toot_ids.length; i++) {
		toot_url = instance_full + "/api/v1/statuses/" + toot_ids[i];
		xhr.open("GET", toot_url, false);
		xhr.onload = function (e) {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					const toot = JSON.parse(xhr.responseText);
					const timestamp = moment(toot.created_at).format('llll');
					const toot_div = document.createElement("div");
					toot_div.setAttribute("class", "toot");
					let media = "";
					for (let i = 0; i < toot.media_attachments.length; i++) {
						media += `<a href='${toot.media_attachments[i].url}'><img class='thumbs' src='${toot.media_attachments[i].preview_url}'></a>`;
					}
					toot_div.innerHTML = `
<div class="box"><a href="${toot.account.url}" target="_blank"><img width="48" height="48" alt="" class="u-photo" src="${toot.account.avatar}"></a></div>
<div class="box"><a class="display-name" href="${toot.account.url}" target="_blank">${toot.account.display_name}<span>@${toot.account.username}@${instance}</span></a>
<a class="toot-time" href="${toot.url}" target="_blank">${timestamp}</a>
<div class="e-content" lang="ja" style="display: block; direction: ltr"><p>${toot.content}</p></div>
${media}</div>
`;
					toot_div.setAttribute("id", max_index);
					toot_div.setAttribute("ondblclick", "deleteCard('" + max_index + "')");
					toot_div.setAttribute("draggable", "true");
					toot_div.addEventListener("dragstart", handleDragStart, false);
					toot_div.addEventListener("dragover", handleDragOver, false);
					toot_div.addEventListener("drop", handleDrop, false);
					toot_div.addEventListener("dragend", handleDragEnd, false);
					max_index++;
					target_div.appendChild(toot_div);
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
	const src = $(e.dataTransfer.getData('text/plain'));
	if (src.id == node.id) {
		return;
	}
	const cards = $("cards");
	const children = cards.childNodes;
	let src_index = -1;
	let node_index = -1;
	for (let i = 0; i < children.length; i++) {
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
		const toot_id = card_list[src_index]
		card_list.splice(src_index, 1);
		card_list.splice(node_index, 0, toot_id);
	}
	genPermalink();
}

function handleDragEnd(e) {
	console.log("drag end");
}
