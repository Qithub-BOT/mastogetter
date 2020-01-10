import * as impl from "./common.js";

function $(id) {
	return document.getElementById(id);
}

function showPreview() {
	let instance_full = $("instance").value;
	if (instance_full.trim() === "") {
		instance_full = "https://qiitadon.com";
		$("instance").value = instance_full;
	}
	const toot_id = $("toot-id")
		.value.split("/")
		.reverse()[0];
	const toot_url = instance_full + "/api/v1/statuses/" + toot_id;
	const target_div = $("card-preview");

	const xhr = new XMLHttpRequest();
	xhr.open("GET", toot_url, true);
	xhr.onload = function() {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				const toot = JSON.parse(xhr.responseText);
				const timestamp = moment(toot.created_at).format("llll");
				let media = "";
				for (let i = 0; i < toot.media_attachments.length; i++) {
					media += `<a href='${toot.media_attachments[i].url}'>
	<img class='thumbs' src='${toot.media_attachments[i].preview_url}'>
</a>`;
				}
				target_div.innerHTML = `
<div class="toot">
	<div class="box">
		<a href="${toot.account.url}" target="_blank">
			<img width="48" height="48" alt="avatar" class="u-photo" src="${toot.account.avatar}">
		</a>
	</div>
	<div class="box">
		<a class="display-name" href="${toot.account.url}" target="_blank">
			${toot.account.display_name}
			<span>@${toot.account.username}@${new URL(toot.account.url).hostname}</span>
		</a>
		<a class="toot-time" href="${toot.url}" target="_blank">${timestamp}</a>
		<div class="e-content" lang="ja" style="display: block; direction: ltr">
			<p>${toot.content}</p>
		</div>
	${media}
	</div>
</div>`;
			} else {
				console.error(xhr.statusText);
			}
		}
	};
	xhr.onerror = function() {
		console.error(xhr.statusText);
	};
	xhr.send(null);
}

function addCard() {
	const clone = $("card-preview").firstElementChild.cloneNode(true);
	clone.setAttribute("id", `c_${impl.card_list.length}`);
	clone.addEventListener("dblclick", () => {
		deleteCard(impl.card_list.length);
	});
	clone.setAttribute("draggable", "true");
	clone.addEventListener("dragstart", impl.handleDragStart, false);
	clone.addEventListener("dragover", impl.handleDragOver, false);
	clone.addEventListener("drop", impl.handleDrop, false);
	clone.addEventListener("dragend", impl.handleDragEnd, false);
	impl.card_list.push(
		$("toot-id")
			.value.split("/")
			.reverse()[0]
	);

	$("cards").appendChild(clone);
	impl.genPermalink();
}

function deleteCard(index) {
	$("cards").removeChild($(index));
	impl.card_list.splice(index, 1);
	delete impl.card_list[index];
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
	const permalink = $("load").value;
	const permalink_str = { i: permalink.split("?i=")[1].split("&")[0], t: permalink.split("&t=")[1] };
	const permalink_obj = impl.decodePermalink(permalink_str);

	impl.showCards(permalink_obj);
	impl.genPermalink(permalink_obj.toot_ids.join(","));
}

function alertUsageNoPermalink() {
	// eslint-disable-next-line no-alert
	alert("まとめられたリンクがありません。");
}

function isEmptyPermalink() {
	return !$("permalink").value;
}

impl.ready(() => {
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
});
