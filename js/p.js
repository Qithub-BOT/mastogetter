import * as impl from "./common.js";
function $(id) {
	return document.getElementById(id);
}

function showPreview() {
	impl.showCards(impl.decodePermalink(new URLSearchParams(location.search)));
	$("matomain").addEventListener("mouseover", removeAllDraggable, false);
}

function removeAllDraggable() {
	const elems = document.querySelectorAll("div.toot");

	for (let i = 0; i < elems.length; i++) {
		elems[i].removeAttribute("draggable");
	}
}
impl.ready(() => {
	showPreview();
});
