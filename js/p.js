/* global showCards, decodePermalink, get_url_vars, $ */
/* exported showPreview */
/* eslint no-undef: "error" */

function showPreview () {
	showCards(decodePermalink(get_url_vars));
	$('matomain').addEventListener('mouseover', removeAllDraggable, false);
}

function removeAllDraggable () {
	const elems = document.querySelectorAll('div.toot');

	for (let i = 0; i < elems.length; i++) {
		elems[i].removeAttribute('draggable');
	}
}
