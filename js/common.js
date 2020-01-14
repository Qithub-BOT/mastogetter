export let card_list = [];
let max_index = 0;

export function ready(loaded) {
	if (["interactive", "complete"].includes(document.readyState)) {
		loaded();
	} else {
		document.addEventListener("DOMContentLoaded", loaded);
	}
}

function $(id) {
	return document.getElementById(id);
}

export const get_url_vars = (function() {
	const vars = {};
	const params = location.search.substring(1).split("&");
	for (let i = 0; i < params.length; i++) {
		if (/=/.test(params[i])) {
			const [key, val] = params[i].split("=");
			vars[key] = val;
		}
	}
	return vars;
})();

/**
 * @param {number} index
 * @param {string} prefix
 */
export function deleteCard(index, prefix) {
	const card = $(`${prefix}_${index}`);
	const cards = $("cards").childNodes;
	let idx = 0;
	for (let i = 0; i < cards.length; i++) {
		if (cards[i] === card) {
			idx = i;
			break;
		}
	}
	$("cards").removeChild(card);
	card_list.splice(idx, 1);
	genPermalink();
}

export function decodePermalink(get_url_vars) {
	let instance_full = get_url_vars["i"];
	if (instance_full.trim() === "") {
		instance_full = "https://qiitadon.com";
		if ($("instance") !== null) {
			$("instance").value = instance_full;
		}
	}
	const instance = instance_full.split("//")[1];
	const toot_id = get_url_vars["t"];
	const toot_ids = toot_id.split(",");
	if (toot_ids[toot_ids.length - 1] < "1000000000000000") {
		// 最後の要素が 1.0+E18より小さければ、
		// id の途中で url が切れたと判断して最後の項目を
		// 除外（仕様）
		toot_ids.pop();
	}

	return {
		instance_full: instance_full,
		instance: instance,
		toot_ids: toot_ids,
	};
}

export function genPermalink() {
	if (!$("permalink")) return;
	console.log("Updaing permalink from card_list.");
	const currentURL = new URL(location.href);
	const path = currentURL.pathname.substring(0, currentURL.pathname.lastIndexOf("/") + 1);
	const permalink = `${currentURL.origin}${path}p.html?i=${$("instance").value}&t=`;
	$("permalink").value = permalink + card_list.join(",");
}

/**
 *
 * @param {Element} element DOM Element
 * @param {number} index
 * @param {string} prefix
 */
export function registerEventsToCard(element, index, prefix) {
	element.addEventListener("dblclick", () => {
		deleteCard(index, prefix);
	});
	element.setAttribute("draggable", "true");
	element.setAttribute("data-dblclickable", "true");
	element.addEventListener("dragstart", e => handleDragStart(e), false);
	element.addEventListener("dragover", e => handleDragOver(e), false);
	element.addEventListener("drop", e => handleDrop(e), false);
	element.addEventListener("dragend", e => handleDragEnd(e), false);
}

/**
 *
 * @param {{instance_full: string, instance: string, toot_ids: string[]}} permalink_obj created by `decodePermalink`
 * @param {boolean | undefined} registerEvent
 */
export function showCards(permalink_obj, registerEvent = false) {
	const instance_full = permalink_obj["instance_full"];
	const toot_ids = permalink_obj["toot_ids"];
	const xhr = new XMLHttpRequest();
	const target_div = $("cards");
	let toot_url = "";

	for (let i = 0; i < toot_ids.length; i++) {
		toot_url = instance_full + "/api/v1/statuses/" + toot_ids[i];
		xhr.open("GET", toot_url, false);
		xhr.onload = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					const toot = JSON.parse(xhr.responseText);
					const timestamp = moment(toot.created_at).format("llll");
					const toot_div = document.createElement("div");
					toot_div.setAttribute("class", "toot");
					let media = "";
					for (let i = 0; i < toot.media_attachments.length; i++) {
						media += `
<a href='${toot.media_attachments[i].url}'>
	<img class='thumbs' src='${toot.media_attachments[i].preview_url}'>
</a>`;
					}
					toot_div.innerHTML = `
<div class="box">
	<a href="${toot.account.url}" target="_blank">
		<img width="48" height="48" alt="" class="u-photo" src="${toot.account.avatar}">
	</a>
</div>
<div class="box">
	<a class="display-name" href="${toot.account.url}" target="_blank">
		${toot.account.display_name}
		<span>@${toot.account.username}@${new URL(toot.account.url).hostname}</span>
	</a>
	<a class="toot-time" href="${toot.url}" target="_blank">${timestamp}</a>
	<div class="e-content" lang="ja" style="display: block; direction: ltr">
		<p>${toot.content}</p>
	</div>
	${media}
</div>`;
					const idx = max_index;
					toot_div.setAttribute("id", `o_${idx}`);
					if (true === registerEvent) {
						registerEventsToCard(toot_div, idx, "o");
					}
					max_index++;
					target_div.appendChild(toot_div);
				} else {
					console.error(xhr.statusText);
				}
			}
		};
		xhr.onerror = function() {
			console.error(xhr.statusText);
		};
		xhr.send(null);
	}

	card_list = card_list.concat(toot_ids);
	genPermalink();
}

/**
 * @param {Event} e
 */
export function handleDragStart(e) {
	e.dataTransfer.effectAllowed = "move";
	e.dataTransfer.setData("text/plain", e.target.id);
}

/**
 * @param {Event} e
 */
export function handleDragOver(e) {
	if (e.preventDefault) {
		e.preventDefault();
	}
}

/**
 * @param {Event} e drop event
 */
export function handleDrop(e) {
	if (e.preventDefault) {
		e.preventDefault();
	}
	e.dataTransfer.dropEffect = "move";
	let node = e.target;
	while (!node.getAttribute("data-dblclickable")) {
		node = node.parentNode;
	}
	const src = $(e.dataTransfer.getData("text/plain"));
	if (src.id === node.id) {
		return;
	}
	const cards = $("cards");
	const children = cards.childNodes;
	let src_index = -1;
	let node_index = -1;
	for (let i = 0; i < children.length; i++) {
		if (children[i] === src) {
			src_index = i;
		}
		if (children[i] === node) {
			node_index = i;
		}
	}
	if (src_index < 0) {
		return;
	}
	if (node_index < 0) {
		return;
	}

	cards.removeChild(src);
	cards.insertBefore(src, node);

	if (src_index < node_index) {
		card_list.splice(node_index, 0, card_list[src_index]);
		card_list.splice(src_index, 1);
	} else {
		const toot_id = card_list[src_index];
		card_list.splice(src_index, 1);
		card_list.splice(node_index, 0, toot_id);
	}
	genPermalink();
}

export function handleDragEnd() {
	// console.log("drag end");
}
