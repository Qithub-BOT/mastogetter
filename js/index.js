import * as counter from "./class/counter.js";
import * as impl from "./common.js";

async function showPreview() {
	let instanceFull = impl.$("instance").value;
	if (instanceFull.trim() === "") {
		instanceFull = "https://qiitadon.com";
		impl.$("instance").value = instanceFull;
	}
	const tootId = impl
		.$("toot-id")
		.value.split("/")
		.reverse()[0];
	if (!tootId) {
		return;
	}
	const toot = await impl.fetchJsonAndCheck(`${instanceFull}/api/v1/statuses/${tootId}`);
	if (!toot) {
		return;
	}
	const tootDiv = impl.createTootDiv(toot);
	impl.$("card-preview").innerHTML = tootDiv.outerHTML;
}

function addCard() {
	const cardPreview = impl.$("card-preview");
	if (!cardPreview) return;
	const clone = impl.$("card-preview").firstElementChild.cloneNode(true);
	const idx = counter.nextIndex();
	clone.setAttribute("id", `c_${idx}`);
	impl.registerEventsToCard(clone);
	impl.cardList.push(
		impl
			.$("toot-id")
			.value.split("/")
			.reverse()[0]
	);

	if (impl.$("cards").hasChildNodes() && impl.$("cards").firstChild.nodeName === "#text") {
		impl.$("cards").removeChild(impl.$("cards").firstChild);
	}
	impl.$("cards").appendChild(clone);
	impl.genPermalink();
}

function flipCards() {
	const cards = impl.$("cards");
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
	impl.$("permalink").select();
	document.execCommand("copy");
}

function loadPermalink() {
	const permalinkObj = impl.decodePermalink(new URL(impl.$("load").value).searchParams);
	impl.$("instance").value = permalinkObj.instance_full;
	impl.showCards(permalinkObj, true).catch(err => console.error(err));
}

function alertUsageNoPermalink() {
	// eslint-disable-next-line no-alert
	alert("まとめられたリンクがありません。");
}

function isEmptyPermalink() {
	return !impl.$("permalink").value;
}

function focusSelect(e) {
	e.target.select();
}

impl.ready(() => {
	impl.$("load").addEventListener("focus", e => focusSelect(e));
	impl.$("instance").addEventListener("focus", e => focusSelect(e));
	impl.$("toot-id").addEventListener("focus", e => focusSelect(e));
	impl.$("permalink").addEventListener("focus", e => focusSelect(e));
	impl.$("loadPermalink").addEventListener("click", () => {
		loadPermalink();
	});
	impl.$("showPreview").addEventListener("click", () => {
		showPreview().catch(err => console.error(err));
	});
	impl.$("addCard").addEventListener("click", () => {
		addCard();
	});
	impl.$("copylink").addEventListener("click", () => {
		copyPermalink();
	});
	impl.$("flip").addEventListener("click", () => {
		flipCards();
	});
	impl.$("usage").addEventListener("click", () => {
		introJs().start();
	});
});
