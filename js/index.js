import * as impl from "./common.js";

function $(id) {
	return document.getElementById(id);
}

function showPreview() {
	let instance_full = $("instance").value;
	if (instance_full.trim() === "") {
		instance_full = "https://qiitadon.com";
		$("instance").value = instance_full;
	}
	const toot_id = $("toot-id")
		.value.split("/")
		.reverse()[0];
	const toot_url = instance_full + "/api/v1/statuses/" + toot_id;
	const target_div = $("card-preview");
	const xhr = new XMLHttpRequest();
	xhr.open("GET", toot_url, true);
	xhr.onload = function() {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				const toot = JSON.parse(xhr.responseText);
				const timestamp = moment(toot.created_at).format("llll");
				let media = "";
				for (let i = 0; i < toot.media_attachments.length; i++) {
					media += `
<a href='${toot.media_attachments[i].url}'>
	<img class='thumbs' src='${toot.media_attachments[i].preview_url}'>
</a>`;
				}
				target_div.innerHTML = `
<div class="toot">
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
			<p>${toot.content}</p>
		</div>
	${media}
	</div>
</div>`;
				impl.setAllAnchorsAsExternalTabSecurely(target_div);
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

function addCard() {
	const card_preview = $("card-preview");
	if (!card_preview) return;
	const clone = $("card-preview").firstElementChild.cloneNode(true);
	const len = impl.card_list.length;
	clone.setAttribute("id", `c_${len}`);
	impl.registerEventsToCard(clone, len, "c");
	impl.card_list.push(
		$("toot-id")
			.value.split("/")
			.reverse()[0]
	);

	if ($("cards").hasChildNodes() && $("cards").firstChild.nodeName === "#text") {
		$("cards").removeChild($("cards").firstChild);
	}
	$("cards").appendChild(clone);
	impl.genPermalink();
}

function flipCards() {
	const cards = $("cards");
	if (!cards) return;
	let card_nodes = [];
	while (cards.hasChildNodes()) {
		if (cards.firstChild.nodeName !== "#text") {
			card_nodes.push(cards.firstChild);
		}
		cards.removeChild(cards.firstChild);
	}
	if (card_nodes.length === 0) return;
	while (card_nodes.length > 0) {
		cards.appendChild(card_nodes.pop());
	}
	impl.card_list.reverse();
	impl.genPermalink();
}

function copyPermalink() {
	if (isEmptyPermalink()) {
		alertUsageNoPermalink();
		return false;
	}
	impl.genPermalink();
	$("permalink").select();
	document.execCommand("copy");
}

function loadPermalink() {
	const permalink_obj = impl.decodePermalink(new URL($("load").value).searchParams);
	$("instance").value = permalink_obj.instance_full;
	impl.showCards(permalink_obj);
	// impl.showCardsより前に呼び出してはいけない
	impl.genPermalink();
}

function alertUsageNoPermalink() {
	// eslint-disable-next-line no-alert
	alert("まとめられたリンクがありません。");
}

function isEmptyPermalink() {
	return !$("permalink").value;
}

function focusSelect(e) {
	e.target.select();
}

impl.ready(() => {
	$("load").addEventListener("focus", e => focusSelect(e));
	$("instance").addEventListener("focus", e => focusSelect(e));
	$("toot-id").addEventListener("focus", e => focusSelect(e));
	$("permalink").addEventListener("focus", e => focusSelect(e));
	$("loadPermalink").addEventListener("click", () => {
		loadPermalink();
	});
	$("showPreview").addEventListener("click", () => {
		showPreview();
	});
	$("addCard").addEventListener("click", () => {
		addCard();
	});
	$("copylink").addEventListener("click", () => {
		copyPermalink();
	});
	$("flip").addEventListener("click", () => {
		flipCards();
	});
});
