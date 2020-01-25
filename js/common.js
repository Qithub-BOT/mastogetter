import * as counter from "./class/counter.js";

export let cardList = [];

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
 * @param {string} input 入力文字列
 * @param {(tootIds: string[])=>void} onPURL 入力がまとめのURLだったときのcallback
 * @param {(tootId: string)=>void} onToot 入力がTooT URLかToot IDだったときのcallback
 * @returns {void}
 */
export function inputParser(input, onPURL, onToot) {
	/**
	 * @param {string} i
	 * @returns {string}
	 */
	const assumeIsTootId = i => {
		if (/[^0-9]/.test(i) || isNaN(parseInt(i))) {
			throw new Error("invalid id syntax.");
		}
		return i;
	};
	/** @type {URL} */
	let url;
	try {
		url = new URL(input);
	} catch (_) {
		onToot(UncompressOrPassThroughTootId(input));
		return;
	}
	if (/twitter/.test(url.hostname)) {
		throw new Error("Twitter URL is not allowed.");
	}
	if (url.searchParams != null && url.searchParams.has("t")) {
		const t = url.searchParams.get("t").split(",");
		onPURL(t.map(v => UncompressOrPassThroughTootId(v)));
	} else {
		// pathnameは常に"/"から始まる
		const p = url.pathname;
		if (!/^\/@[^/]+\/[0-9]+/.test(p) && !p.startsWith("/web/statuses")) {
			throw new Error("This is not a mastodon's toot URL.");
		}
		onToot(assumeIsTootId(p.substring(p.lastIndexOf("/") + 1)));
	}
}

/**
 * @param {string} elementId
 */
export function deleteCard(elementId) {
	const card = $(elementId);
	const cards = $("cards").childNodes;
	let idx = 0;
	for (let i = 0; i < cards.length; i++) {
		if (cards[i] === card) {
			idx = i;
			break;
		}
	}
	$("cards").removeChild(card);
	cardList.splice(idx, 1);
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
	const instanceFull = searchParams.has("i") ? searchParams.get("i") : "https://qiitadon.com";
	return {
		instance_full: instanceFull,
		instance: new URL(instanceFull).hostname,
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
	$("permalink").value = permalink + cardList.map(id => CompressTootId(id)).join(",");
}

/**
 *
 * @param {Element} element DOM Element
 */
export function registerEventsToCard(element) {
	element.addEventListener("dblclick", () => deleteCard(element.id));
	element.setAttribute("draggable", "true");
	element.addEventListener("dragstart", e => handleDragStart(e), false);
	element.addEventListener("dragover", e => handleDragOver(e), false);
	element.addEventListener("drop", e => handleDrop(e), false);
	element.addEventListener("dragend", e => handleDragEnd(e), false);
}

/**
 * @param {Request | string} input
 * @returns {Promise<Response>}
 */
export function fetchJsonAndCheck(input) {
	return fetch(input)
		.then(r => {
			if (r.ok) {
				return r.json();
			}
			throw new Error(`Request failed: ${r.status}`);
		})
		.catch(
			/**
			 * @param {any} e
			 * @returns {Response | null}
			 */
			e => {
				console.error(e);
				return null;
			}
		);
}

/**
 *
 * @param {{instance_full: string, instance: string, toot_ids: string[]}} permalinkObj created by `decodePermalink`
 * @param {boolean | undefined} registerEvent
 */
export async function showCards(permalinkObj, registerEvent = false) {
	const instanceFull = permalinkObj.instance_full;
	const tootIds = permalinkObj.toot_ids;
	const targetDiv = $("cards");

	const fetchArray = tootIds.map(tootId => fetchJsonAndCheck(`${instanceFull}/api/v1/statuses/${tootId}`));
	const toots = await Promise.all(fetchArray);
	toots
		.filter(toot => toot)
		.forEach(toot => {
			const tootDiv = createTootDiv(toot);
			const idx = counter.nextIndex();
			tootDiv.setAttribute("id", `o_${idx}`);
			if (registerEvent === true) {
				registerEventsToCard(tootDiv);
			}
			targetDiv.appendChild(tootDiv);
		});

	cardList = cardList.concat(tootIds);
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
	while (!node.getAttribute("draggable")) {
		node = node.parentNode;
	}
	const src = $(e.dataTransfer.getData("text/plain"));
	if (src.id === node.id) {
		return;
	}
	const cards = $("cards");
	const children = cards.childNodes;
	let srcIndex = -1;
	let nodeIndex = -1;
	for (let i = 0; i < children.length; i++) {
		if (children[i] === src) {
			srcIndex = i;
		}
		if (children[i] === node) {
			nodeIndex = i;
		}
	}
	if (srcIndex < 0) {
		return;
	}
	if (nodeIndex < 0) {
		return;
	}

	cards.removeChild(src);
	cards.insertBefore(src, node);

	if (srcIndex < nodeIndex) {
		cardList.splice(nodeIndex, 0, cardList[srcIndex]);
		cardList.splice(srcIndex, 1);
	} else {
		const tootId = cardList[srcIndex];
		cardList.splice(srcIndex, 1);
		cardList.splice(nodeIndex, 0, tootId);
	}
	genPermalink();
}

export function handleDragEnd() {
	// console.log("drag end");
}

export function createTootDiv(toot) {
	const tootDiv = document.createElement("div");
	const timestamp = moment(toot.created_at).format("llll");
	let strContent = toot.content;
	for (const emoji of toot.emojis) {
		strContent = strContent.replace(
			new RegExp(`:${emoji.shortcode}:`, "g"),
			`<img class="emoji" alt=":${emoji.shortcode}:" src="${emoji.url}">`
		);
	}
	const contentHtml = getHtmlFromContent(strContent);
	const media = toot.media_attachments
		.map(attachment => `<a href='${attachment.url}'><img class='thumbs' src='${attachment.preview_url}'></a>`)
		.join("");
	tootDiv.innerHTML = `
<div class="box">
	<a href="${toot.account.url}">
		<img width="48" height="48" alt="avatar" class="u-photo" src="${toot.account.avatar}">
	</a>
</div>
<div class="box">
	<a class="display-name" href="${toot.account.url}">
		${toot.account.display_name}
		<span>@${toot.account.username}@${new URL(toot.account.url).hostname}</span>
	</a>
	<a class="toot-time" href="${toot.url}">${timestamp}</a>
	<div class="e-content" lang="ja" style="display: block; direction: ltr">
		<p>${contentHtml}</p>
	</div>
	${media}
</div>`;
	tootDiv.setAttribute("class", "toot");
	setAllAnchorsAsExternalTabSecurely(tootDiv);
	return tootDiv;
}

function getHtmlFromContent(strContent) {
	const div = document.createElement("div");
	div.innerHTML = strContent;
	return div.innerHTML;
}

function setAllAnchorsAsExternalTabSecurely(elements) {
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
