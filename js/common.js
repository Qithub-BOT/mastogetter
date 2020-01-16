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

/**
 * idを36進数へ変換する
 *
 * @param {string} id 10進数の文字列
 * @returns {string}
 */
function CompressTootId(id) {
	if (id.length > 10) {
		const compressed = parseInt(id.substr(0, id.length - 10)).toString(36);
		return compressed + "_" + parseInt(id.substr(-10)).toString(36);
	} else {
		return `0_${parseInt(id).toString(36)}`;
	}
}

/**
 * Toot Idを10進数に変換する
 *
 * @param {string} id
 * @throws 10進数として変換できないか36進数2つが_で結合された文字列出ない場合エラー
 * @returns {string}
 */
function UncompressOrPassThroughTootId(id) {
	const splitted = id.split("_");
	switch (splitted.length) {
		case 1: {
			const parsed = parseInt(id, 10);
			if (isNaN(parsed)) {
				throw new Error("invalid id syntax.");
			}
			return id;
		}
		case 2: {
			const parsed = splitted.map(e => parseInt(e, 36));
			for (const e of parsed) {
				if (isNaN(e)) {
					throw new Error("invalid id syntax.");
				}
			}
			// parsed[1]は10桁
			return parsed[0] === 0 ? `${parsed[1]}` : `${parsed[0]}${`${parsed[1]}`.padStart(10, "0")}`;
		}
		default:
			throw new Error("invalid id syntax.");
	}
}

/**
 * Permalinkの分解
 *
 * @param {URLSearchParams} searchParams
 * @returns {{instance_full: string, instance: string, toot_ids: string[]}}
 */
export function decodePermalink(searchParams) {
	if (!searchParams.has("t")) {
		throw new Error("t must be required.");
	}
	const instance_full = searchParams.has("i") ? searchParams.get("i") : "https://qiitadon.com";
	return {
		instance_full: instance_full,
		instance: new URL(instance_full).hostname,
		toot_ids: searchParams
			.get("t")
			.split(",")
			// 末尾が,で終わると空文字列が最終要素に来る
			.filter(e => e !== "")
			.map(id => UncompressOrPassThroughTootId(id))
			.filter(e => e !== null),
	};
}

export function genPermalink() {
	if (!$("permalink")) return;
	console.log("Updaing permalink from card_list.");
	const currentURL = new URL(location.href);
	const path = currentURL.pathname.substring(0, currentURL.pathname.lastIndexOf("/") + 1);
	const permalink = `${currentURL.origin}${path}p.html?i=${$("instance").value}&t=`;
	$("permalink").value = permalink + card_list.map(id => CompressTootId(id)).join(",");
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
	const instance_full = permalink_obj.instance_full;
	const toot_ids = permalink_obj.toot_ids;
	const xhr = new XMLHttpRequest();
	const target_div = $("cards");
	let toot_url = "";

	for (let i = 0; i < toot_ids.length; i++) {
		toot_url = instance_full + "/api/v1/statuses/" + toot_ids[i];
		xhr.open("GET", toot_url, false);
		xhr.onload = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					const toot_div = document.createElement("div");
					const toot = JSON.parse(xhr.responseText);
					const timestamp = moment(toot.created_at).format("llll");
					const content_html = getHtmlFromContent(toot.content);
					const idx = max_index;
					let media = "";
					for (let i = 0; i < toot.media_attachments.length; i++) {
						media += `
<a href='${toot.media_attachments[i].url}'>
	<img class='thumbs' src='${toot.media_attachments[i].preview_url}'>
</a>`;
					}
					toot_div.innerHTML = `
<div class="box">
	<a href="${toot.account.url}">
		<img width="48" height="48" alt="" class="u-photo" src="${toot.account.avatar}">
	</a>
</div>
<div class="box">
	<a class="display-name" href="${toot.account.url}">
		${toot.account.display_name}
		<span>@${toot.account.username}@${new URL(toot.account.url).hostname}</span>
	</a>
	<a class="toot-time" href="${toot.url}">${timestamp}</a>
	<div class="e-content" lang="ja" style="display: block; direction: ltr">
		<p>${content_html}</p>
	</div>
	${media}
</div>`;
					toot_div.setAttribute("id", `o_${idx}`);
					toot_div.setAttribute("class", "toot");
					if (registerEvent === true) {
						registerEventsToCard(toot_div, idx, "o");
					}
					max_index++;
					setAllAnchorsAsExternalTabSecurely(toot_div);
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

function getHtmlFromContent(str_content) {
	const div = document.createElement("div");
	div.innerHTML = str_content;
	return div.innerHTML;
}

export function setAllAnchorsAsExternalTabSecurely(elements) {
	console.log("Setting all anchor elements as external tab avoiding tabnabbing.");
	elements.querySelectorAll("a").forEach(anchor => setAnchorWithSecureAttribute(anchor));
}

function setAnchorWithSecureAttribute(element) {
	if (element.href) {
		addAttributesToAvoidTabnabbing(element);
	}
}

function addAttributesToAvoidTabnabbing(element) {
	// Tabnabbing 脆弱性対策
	// Ref:EN: https://link.medium.com/W8bktSl8e3 @ Medium
	// Ref:JA: http://disq.us/t/2cg96k8 @ blog.kazu69.net
	element.target = "_blank";
	element.rel += " noopener noreferrer";
	// リンク先のクロール禁止
	// Ref: https://support.google.com/webmasters/answer/96569?hl=ja
	element.rel += " nofollow";
}
