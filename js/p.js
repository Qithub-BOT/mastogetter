function showPreview() {
	let permalink = decodePermalink(get_url_vars);
	let instance_full = permalink["instance_full"];
	let instance = permalink["instance"];
	let toot_ids = permalink["toot_ids"];
	let toot_url = "";
	let target_div = $("cards");
	let xhr = new XMLHttpRequest();

	for (let i = 0; i < toot_ids.length; i++) {
		toot_url = instance_full + "/api/v1/statuses/" + toot_ids[i];
		xhr.open("GET", toot_url, false);
		xhr.onload = function (e) {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					let obj = JSON.parse(xhr.responseText);
					let timestamp = moment(obj.created_at).format('LLLL');
					let e = document.createElement("div");
					e.setAttribute("class","toot");
					let tmp = "";
					for (let i = 0; i < obj.media_attachments.length; i++) {
						tmp += "<a href='"+ obj.media_attachments[i].url +"'><img class='thumbs' src='"+ obj.media_attachments[i].preview_url +"'></a>";
					}
					e.innerHTML = '<div class="box"><img width="48" height="48" alt="" class="u-photo" src="'+ obj.account.avatar +'"></div>'
						+ '<div class="box"><span class="display-name">'+ obj.account.display_name
						+ '<span>@'+ obj.account.username +'@'+ instance +'</span></span>'
						+ '<span class="create-at">' + timestamp + '</span>'
						+ '<div class="e-content" lang="ja" style="display: block; direction: ltr"><p>'+ obj.content +'</p></div>'
						+ tmp + '</div>';
					target_div.appendChild(e);
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
}
