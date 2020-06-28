import * as impl from "./common.js";
async function showPreview() {
	impl.showCards(impl.decodePermalink(new URLSearchParams(location.search), 10)).catch(err => console.error(err));
}

impl.ready(() => {
	showPreview();
	impl.$("btnload").addEventListener("click", showPreview);
});
