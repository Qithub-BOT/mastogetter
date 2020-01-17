import test from "ava";
import * as impl from "../js/common.js";

test("inputParser", t => {
	// Toot ID

	t.notThrows(() =>
		impl.inputParser(
			"1",
			() => t.fail(),
			tootId => t.is(tootId, "1")
		)
	);
	t.notThrows(() =>
		impl.inputParser(
			"103492879513261939",
			() => t.fail(),
			tootId => t.is(tootId, "103492879513261939")
		)
	);
	t.notThrows(() =>
		impl.inputParser(
			"65tk7_4dby7w3",
			() => t.fail(),
			tootId => t.is(tootId, "103492879513261939")
		)
	);

	// Toot URL

	t.notThrows(() =>
		impl.inputParser(
			"https://qiitadon.com/web/statuses/103492879513261939",
			() => t.fail(),
			tootId => t.is(tootId, "103492879513261939")
		)
	);
	t.throws(
		() =>
			impl.inputParser(
				"https://developer.mozilla.org/ja/docs/Web/API/URL",
				() => t.fail(),
				() => t.fail()
			),
		{
			instanceOf: Error,
			message: "This is not a mastodon's toot URL.",
		}
	);
	t.throws(
		() =>
			impl.inputParser(
				"https://misskey.io/notes/81ptr1f9ox",
				() => t.fail(),
				() => t.fail()
			),
		{
			instanceOf: Error,
			message: "This is not a mastodon's toot URL.",
		}
	);
	t.throws(
		() =>
			impl.inputParser(
				"https://github.com/Qithub-BOT/mastogetter/issues/37",
				() => t.fail(),
				() => t.fail()
			),
		{
			instanceOf: Error,
			message: "This is not a mastodon's toot URL.",
		}
	);
	t.throws(
		() =>
			impl.inputParser(
				"https://note.com/sengoku_bono/n/n7eafe7260759?magazine_key=mc67b2b89d531",
				() => t.fail(),
				() => t.fail()
			),
		{
			instanceOf: Error,
			message: "This is not a mastodon's toot URL.",
		}
	);
	t.throws(
		() =>
			impl.inputParser(
				"https://qiitadon.com/web/statuses/65tk7_4dby7w3",
				() => t.fail(),
				() => t.fail()
			),
		{
			instanceOf: Error,
			message: "invalid id syntax.",
		}
	);
	t.throws(
		() =>
			impl.inputParser(
				"https://twitter.com/yumetodo/status/1217784613973712897",
				() => t.fail(),
				() => t.fail()
			),
		{
			instanceOf: Error,
			message: "Twitter URL is not allowed.",
		}
	);

	// まとめURL
	t.notThrows(() =>
		impl.inputParser(
			"https://qithub-bot.github.io/mastogetter/p.html?i=https://qiitadon.com&t=65tk7_4dby7w3",
			tootIds => t.deepEqual(tootIds, ["103492879513261939"]),
			() => t.fail()
		)
	);
	t.notThrows(() =>
		impl.inputParser(
			"https://qithub-bot.github.io/mastogetter/p.html?i=https://qiitadon.com&t=1,2,3,4,5,6,7,8,9,0",
			tootIds => t.deepEqual(tootIds, ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]),
			() => t.fail()
		)
	);
	t.notThrows(() =>
		impl.inputParser(
			// eslint-disable-next-line max-len
			"https://deploy-preview-104--zen-edison-40804e.netlify.com/p.html?i=https://repos.irregular-at-tus.work&t=1",
			tootIds => t.deepEqual(tootIds, ["1"]),
			() => t.fail()
		)
	);
});
