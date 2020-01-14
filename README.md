[![CircleCI](https://circleci.com/gh/Qithub-BOT/mastogetter.svg?style=svg)](https://circleci.com/gh/Qithub-BOT/mastogetter)

# Mastogetter is 何

<ruby>Mastogetter<rt>ますとげったー</rt></ruby> とは、オーブンソースの分散型 SNS「[Mastodon](https://ja.wikipedia.org/wiki/%E3%83%9E%E3%82%B9%E3%83%88%E3%83%89%E3%83%B3_(%E3%83%9F%E3%83%8B%E3%83%96%E3%83%AD%E3%82%B0))」の**トゥート（投稿）を任意の順番でまとめ、パーマリンクの作成と表示をするサービス**です。

このパーマリンクにより togetter 的な「まとめサイト」を作成することができます。Mastodon API v1 に対応／互換のあるインスタンス（以下 Mastodon サーバー）の公開トゥートに対して利用できます。

- Mastogetter 編集画面の URL
  - https://qithub-bot.github.io/mastogetter/

- まとめの表示サンプルの URL
  - https://git.io/Jvfzg

## 特徴

本サービスはデータベース等を使用しておらず、HTML・CSS・JavaScript のみで構成されています。そのため、[静的サイト](https://ja.wikipedia.org/wiki/%E9%9D%99%E7%9A%84%E3%82%A6%E3%82%A7%E3%83%96%E3%83%9A%E3%83%BC%E3%82%B8)として設置・公開できます。

ただし、「まとめサイト」のパーマリンクにアクセスがあるたび、対象の Mastodon サーバーに複数のリクエストを投げることになるため、そのサーバーに負荷をかけることに注意ください。

## 本リポジトリのコンセプトと注意点

- 要件
  - ストレージを利用せずに使用・設置できること。
  - 自分の所属する Mastodon サーバーで流れているローカル・タイムラインをまとめられること
- Mastogetter が、**目標としていない内容**（2020/01/12 現在）
  - Mastodon における togetter の代替／互換サービス
  - ActivityPub で連携するすべてのインスタンスを単一のスレッド状の status の並びにするもの

本リポジトリは「togetter 相当ものが Mastodon にないのは何故か」という @hidao80 氏の個人的興味を探究する目的から[始まった](https://qiitadon.com/web/statuses/103422588059240282)ものです。

後に、同氏も参加する [Organization](https://github.com/Qithub-BOT/) の、このリポジトリに[移管されました](https://qiitadon.com/web/statuses/103462224435592925)。現在は[コントリビューター（有志の参加者）](https://github.com/Qithub-BOT/mastogetter/graphs/contributors)により継続開発およびメンテナンスされているものです。

そのため、リポジトリ名／サービス名による誤解、もしくは各種権利者および利用者にとって害があるようでしたら、予告なくリポジトリ名およびサービス名が変更される可能性があることをご承知おきください。

## 使い方

1. https://qithub-bot.github.io/mastogetter/ にアクセスします。
2. 「インスタンス名」テキストボックスにインスタンスの URL を http, https 付きで入力します。
3. 「トゥート ID or URL」テキストボックスに追記したいトゥートの ID の数字またはトゥートの URL を入力します。
4. 「ID or URL からプレビュー」ボタンを押し、フォーム下のプレビュー欄にトゥートを一度表示させます。
5. 「トゥートを追加」ボタンを押し、プレビュー欄のトゥートを画面右半分の編集リストの一番下にコピーします。
6. 必要な数だけ 3～5 を繰り返します。
7. 編集リスト上の「コピー」ボタンを押し、パーマリンクをコピーします。
8. まとめページへのパーマリンクを任意の Web ページに配置します。

- 「インポートするまとめリンク」テキストボックスにパーマリンクを入力し「まとめを読み込む」ボタンを押すと、パーマリンクで表示されるトゥートまとめを編集リストに読み込むことが出来ます。
- 画面右半分の編集リストに表示されているトゥートをダブルクリックすると編集リストからトゥートを取り除くことができます。削除した項目は元には戻せません。
- 編集リストのトゥートをドラッグ＆ドロップすることで順番を変えることができます。

## コントリビュート（参加方法）について

- [コントリビューターのためのガイドライン](CONTRIBUTING.md)

## ライセンス

MIT ライセンスです。ライセンスが許す範囲での複製・頒布が可能です。詳しくは[ライセンスファイル](LICENSE)をご確認下さい。

## 著作者

- Original Author: [@hidao80](https://github.com/hidao80)
- [Contributors](https://github.com/Qithub-BOT/mastogetter/graphs/contributors)
