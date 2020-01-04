var card_list = {};
var max_index = 0;

function $(id) {
	return document.getElementById(id);
}

function showPreview() {
	let instance_full = $("instance").value;
	if (instance_full.trim() == "") {
		instance_full = "https://qiitadon.com";
		$("instance").value = instance_full;
	}
	let instance = instance_full.split("//")[1];
	let toot_id = $("toot-id").value;
	let toot_url = instance_full + "/api/v1/statuses/" + toot_id;
	let target_div = $("card-preview");

	let xhr = new XMLHttpRequest();
	xhr.open("GET", toot_url, true);
	xhr.onload = function (e) {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				let obj = JSON.parse(xhr.responseText);
				target_div.innerHTML = '<div class="toot"><div class="box"><img width="48" height="48" alt="" class="u-photo" src="'+ obj.account.avatar +'"></div>'
					+ '<div class="box"><span class="display-name">'+ obj.account.display_name
					+ '<span>@'+ obj.account.username +'@'+ instance +'</span></span>'
					+ '<div class="e-content" lang="ja" style="display: block; direction: ltr"><p>'+ obj.content +'</p></div></div>';
				for (let i = 0; i < obj.media_attachments.length; i++) {
					target_div.innerHTML += "<a href='"+ obj.media_attachments[i].url +"'><img class='thumbs' src='"+ obj.media_attachments[i].preview_url +"'></a>";
				}
				target_div.innerHTML += '</div>';
			} else {
				console.error(xhr.statusText);
			}
		}
	};
	xhr.onerror = function (e) {
		console.error(xhr.statusText);
	};
	xhr.send(null); 
}

function addCard() {
	let clone = $("card-preview").firstElementChild.cloneNode(true);
	clone.setAttribute("id", max_index);
	clone.setAttribute("onclick", "deleteCard('"+ max_index +"')");
	max_index++;
	card_list[max_index] = $("toot-id").value;

	$("cards").appendChild(clone);
	genPermalink();
}

function deleteCard(index) {
	$("cards").removeChild($(index));
}

function genPermalink() {
	let permalink = "https://hidao80.github.io/mastogetter/p.html?i="+ $("instance").value +"&t=";
	Object.keys(card_list).forEach(function (key) {
		permalink += card_list[key] + ",";
	});
	$("permalink").value = permalink;
}

function copyPermalink() {
	$("permalink").select();
	document.execCommand("copy");
}
