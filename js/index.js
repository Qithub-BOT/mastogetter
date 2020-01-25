import * as counter from "./class/counter.js";
import * as impl from "./common.js";

function $(id) {
	return document.getElementById(id);
}

function showPreview() {
	let instanceFull = $("instance").value;
	if (instanceFull.trim() === "") {
		instanceFull = "https://qiitadon.com";
		$("instance").value = instanceFull;
	}
	const tootId = $("toot-id")
		.value.split("/")
		.reverse()[0];
	if (!tootId) {
		return;
	}
	const tootUrl = `${instanceFull}/api/v1/statuses/${tootId}`;
	fetch(tootUrl)
		.then(async response => {
			if (response.ok) {
				const toot = await response.json();
				const tootDiv = impl.createTootDiv(toot);
				$("card-preview").innerHTML = tootDiv.outerHTML;
			} else {
				throw new Error(`Request failed: ${response.status}`);
			}
		})
		.catch(err => console.error(err));
}

function addCard() {
	const cardPreview = $("card-preview");
	if (!cardPreview) return;
	const clone = $("card-preview").firstElementChild.cloneNode(true);
	const idx = counter.nextIndex();
	clone.setAttribute("id", `c_${idx}`);
	impl.registerEventsToCard(clone);
	impl.cardList.push(
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

async function loadPermalink() {
	const permalinkObj = impl.decodePermalink(new URL($("load").value).searchParams);
	$("instance").value = permalinkObj.instance_full;
	await impl.showCards(permalinkObj, true).catch(err => console.error(err));
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
	$("usage").addEventListener("click", () => {
		introJs().start();
	});
});
