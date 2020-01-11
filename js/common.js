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
	$("cards").removeChild($(`${prefix}_${index}`));
	card_list.splice(index, 1);
	delete card_list[index];
	genPermalink();
}

/**
 * idを36進数へ変換する
 * @param {string} id 10進数の文字列
 */
function CompressTootId(id) {
	const compressed = parseInt(id.substr(0, id.length - 10)).toString(36);
	return compressed + "_" + parseInt(id.substr(-10)).toString(36);
}

/**
 * Toot Idを10進数に変換する
 * @param {string} id
 * @throws 10進数として変換できないか36進数2つが_で結合された文字列出ない場合エラー
 * @returns {string}
 */
function UncompressOrPassThroughTootId(id) {
	const splitted = id.split("_");
	switch (splitted.length) {
		case 1: {
			const parsed = parseInt(id, 10);
			// 1.0+E18より小さければ、id の途中で url が切れたと判断してエラーに（仕様）
			if (isNaN(parsed)) {
				throw new Error("invalid id syntax.");
			} else if (parsed < 1000000000000000) {
				throw new Error("too small id");
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
			const uncompressed = `${parsed[0]}${parsed[1]}`;
			// 1.0+E18より小さければ、id の途中で url が切れたと判断してエラーに（仕様）
			if (uncompressed < 1000000000000000) {
				throw new Error("too small id");
			}
			return `${parsed[0]}${parsed[1]}`;
		}
		default:
			throw new Error("invalid id syntax.");
	}
}

/**
 * Permalinkの分解
 * @param {URLSearchParams} searchParams
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
			.map((id, i, a) => {
				try {
					return UncompressOrPassThroughTootId(id);
				} catch (e) {
					if (i === a.length - 1) {
						return null;
					}
					throw e;
				}
			})
			.filter(e => null === e),
	};
}

export function genPermalink(toot_csv = undefined) {
	if ($("permalink") !== null) {
		if (toot_csv === undefined) {
			updatePermalinkFromCardList();
		} else {
			addPermalink(toot_csv);
		}
	}
}

function updatePermalinkFromCardList() {
	console.log("Updaing permalink from card_list.");
	const permalink = "https://qithub-bot.github.io/mastogetter/p.html?i=" + $("instance").value + "&t=";
	$("permalink").value = permalink + card_list.map(id => CompressTootId(id)).join(",");
}

function addPermalink(toot_csv) {
	console.log("Adding CSV to permalink.");
	$("permalink").value += toot_csv;
}

export function showCards(permalink_obj) {
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
					toot_div.addEventListener("dblclick", () => {
						deleteCard(idx, "o");
					});
					toot_div.setAttribute("draggable", "true");
					toot_div.setAttribute("data-dblclickable", "true");
					toot_div.addEventListener("dragstart", e => handleDragStart(e), false);
					toot_div.addEventListener("dragover", e => handleDragOver(e), false);
					toot_div.addEventListener("drop", e => handleDrop(e), false);
					toot_div.addEventListener("dragend", e => handleDragEnd(e), false);
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
			src_index = i - 1;
		}
		if (children[i] === node) {
			node_index = i - 1;
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
