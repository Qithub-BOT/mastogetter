import * as counter from "./class/counter.js";
import * as impl from "./common.js";

function $(id) {
	return document.getElementById(id);
}

async function showPreview() {
	let instanceFull = $("instance").value;
	if (instanceFull.trim() === "") {
		instanceFull = "https://qiitadon.com";
		$("instance").value = instanceFull;
	}
	const tootId = $("toot-id").value.split("/").reverse()[0];
	if (!tootId) {
		return;
	}
	const toot = await impl.fetchJsonAndCheck(`${instanceFull}/api/v1/statuses/${tootId}`);
	if (!toot) {
		return;
	}
	const tootDiv = impl.createTootDiv(toot);
	$("card-preview").innerHTML = tootDiv.outerHTML;
}

function addCard() {
	const cardPreview = $("card-preview");
	if (!cardPreview) return;
	const clone = $("card-preview").firstElementChild.cloneNode(true);
	const idx = counter.nextIndex();
	clone.setAttribute("id", `c_${idx}`);
	impl.registerEventsToCard(clone);
	impl.cardList.push($("toot-id").value.split("/").reverse()[0]);

	if ($("cards").hasChildNodes() && $("cards").firstChild.nodeName === "#text") {
		$("cards").removeChild($("cards").firstChild);
	}
	$("cards").appendChild(clone);
	impl.genPermalink();
}

function flipCards() {
	const cards = $("cards");
	if (!cards) return;
	const cardNodes = [];
	while (cards.hasChildNodes()) {
		if (cards.firstChild.nodeName !== "#text") {
			cardNodes.push(cards.firstChild);
		}
		cards.removeChild(cards.firstChild);
	}
	if (cardNodes.length === 0) return;
	while (cardNodes.length > 0) {
		cards.appendChild(cardNodes.pop());
	}
	impl.cardList.reverse();
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
	const permalinkObj = impl.decodePermalink(new URL($("load").value).searchParams);
	$("instance").value = permalinkObj.instance_full;
	impl.showCards(permalinkObj, true).catch(err => console.error(err));
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
		showPreview().catch(err => console.error(err));
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
	$("usage").addEventListener("click", () => {
		introJs().start();
	});
});
