import * as impl from "./common.js";
function $(id) {
	return document.getElementById(id);
}

function showPreview() {
	impl.showCards(impl.decodePermalink(impl.get_url_vars));
	$("matomain").addEventListener("mouseover", removeHandles, false);
}

function removeHandles() {
	const elems = document.querySelectorAll("div.toot");

	for (let i = 0; i < elems.length; i++) {
		elems[i].removeAttribute("draggable");
		elems[i].removeEventListener("dblclick", impl.handleDeleteCard);
	}
}

showPreview();
