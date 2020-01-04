function $(id) {
	return document.getElementById(id);
}

function showPreview() {
	let instance = $("instance").value;
	let toot_id = $("toot-id").value;
	let embed_url = instance + "/api/v1/statuses/" + toot_id + "/embed";
	let target_div = $("card-preview")
	
	target_div.innerHTML = '<iframe src="' + embed_url + '" class="mastodon-embed" style="max-width: 100%; border: 0" width="400"></iframe>';
}
