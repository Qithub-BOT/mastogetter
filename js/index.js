function $(id) {
	return document.getElementById(id);
}

function showPreview() {
	let instance = $("instance").value;
	let toot_id = $("toot-id").value;
	let toot_url = instance + "/api/v1/statuses/" + toot_id;
	let target_div = $("card-preview");

	let xhr = new XMLHttpRequest();
	xhr.open("GET", toot_url, true);
	xhr.onload = function (e) {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				target_div.innerHTML = '<iframe src="' + JSON.parse(xhr.responseText).uri + '"/embed">';
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
