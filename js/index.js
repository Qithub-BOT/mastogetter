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
	let toot_id = $("toot-id").value.split("/").reverse()[0];
	let toot_url = instance_full + "/api/v1/statuses/" + toot_id;
	let target_div = $("card-preview");

	let xhr = new XMLHttpRequest();
	xhr.open("GET", toot_url, true);
	xhr.onload = function (e) {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				let obj = JSON.parse(xhr.responseText);
				let timestamp = moment(obj.created_at).format('llll');
				let tmp = "";
				for (let i = 0; i < obj.media_attachments.length; i++) {
					tmp += "<a href='"+ obj.media_attachments[i].url +"'><img class='thumbs' src='"+ obj.media_attachments[i].preview_url +"'></a>";
				}
				target_div.innerHTML = '<div class="toot"><div class="box"><img width="48" height="48" alt="" class="u-photo" src="'+ obj.account.avatar +'"></div>'
					+ '<div class="box"><span class="display-name">'+ obj.account.display_name + '<span>@'+ obj.account.username +'@'+ instance +'</span></span>'
					+ '<span class="toot-time">' + timestamp + '</span>'
					+ '<div class="e-content" lang="ja" style="display: block; direction: ltr"><p>'+ obj.content +'</p></div>'
					+ tmp + '</div></div>';
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
	clone.setAttribute("ondblclick", "deleteCard('"+ max_index +"')");
	card_list[max_index] = $("toot-id").value.split("/").reverse()[0];
	max_index++;

	$("cards").appendChild(clone);
	genPermalink();
}

function deleteCard(index) {
	$("cards").removeChild($(index));
	delete card_list[index];
	genPermalink();
}

function copyPermalink() {
	$("permalink").select();
	document.execCommand("copy");
}

function loadPermalink() {
	const permalink = $("load").value;
	const permalink_str = {"i": permalink.split("?i=")[1].split("&")[0],
						 "t": permalink.split("&t=")[1]};
	const permalink_obj = decodePermalink(permalink_str);

	showCards(permalink_obj);
	genPermalink(toot_ids.join(","));
}

function submitGitIO() {
	$("form-gitio").submit();
}
