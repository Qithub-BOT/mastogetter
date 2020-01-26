import * as impl from "./common.js";
impl.ready(() => {
	impl.showCards(impl.decodePermalink(new URLSearchParams(location.search))).catch(err => console.error(err));
});
