import * as impl from "./common.js";
function $(id) {
	return document.getElementById(id);
}

function showPreview() {
	const page = $("page");
	const permalinkObj = impl.decodePermalink(new URLSearchParams(location.search), page.value);
	if (permalinkObj.toot_ids.length > 0) {
		impl.showCards(permalinkObj);
		page.value++;
	} else {
		$("btnload").style.display = "none";
	}
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
	$("btnload").addEventListener("click", () => {
		showPreview();
	});
});
