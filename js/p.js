import impl from "./common";
function $(id) {
	return document.getElementById(id);
}

function showPreview() {
	impl.showCards(impl.decodePermalink(impl.get_url_vars));
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
