# コントリビューターのためのガイドライン

## コーディング規約

- [`.editorconfig` ベース](https://github.com/Qithub-BOT/mastogetter/blob/master/.editorconfig)
  - タブ・インデント
  - UTF-8, BOM なし
  - 改行コード LF
  - コメントの言語：任意。ただし数単語で表現できないものや説明文は日本語。

## 特記仕様

- 対象外ブラウザ
  - [IE, 旧 Edge(Chromium ベースより前)](https://github.com/hidao80/mastogetter/issues/52#issuecomment-572322561)
- HTML5, CSS, JavaScript のみで動くこと。

## ブランチの役割と PR（Pull Request）先

- `gh-pages` ブランチ
  - リリース先。このブランチは `master` からのマージのみで PR は受け付けていません。
- `master` ブランチ
  - PR 先。このブランチが開発用で最新の状態です。このブランチに PR をしてください。

## PR の仕方

- 本リポジトリでは Draft PR を使った PR 方法を推奨しています。
  - Draft Pull Request とは
    - [Draft Pull Request をリリースしました](https://github.blog/jp/2019-02-19-introducing-draft-pull-requests/) @ GitHub Blog
    - [WIP の代わりに Draft Pull Request を利用する](https://qiita.com/tatane616/items/13da1b6797a7b871ad58) @ Qiita
- 主な流れ
  1. 作業用のブランチを最新の `master` ブランチから作成します。
     - ブランチ名は作業内容がわかるものにします。
  2. ソースの作業箇所の近くや文頭に「作業の概要」をコメントします。
     - TODO のコメントを書くようなイメージがいいでしょう。
  3. `commit` して `push` したら、そのまま本家（Upstream）の `master` に Draft で PR してしまいます。
  4. CircleCI の自動チェック（自動レビュー）が走るので `✅ All checks have passed` になったことを確認したら、ブランチに作業をコミットして行きます。
     - コミット中、無駄が発生しないように他のメンバーからのレビューが入ることがあります。Draft 解除までレビューを待って欲しい場合は PR 時のコメントに記載しておきます。
  5. 一連の作業が終わり、レビューしてもらってもよい状態になったら PR 先で `Ready for review` ボタンを押してドラフトを解除します。
  6. 自動チェックをパスすると、他のメンバーがレビューを始めるので、指摘を修正し `commit` & `push` していきます。
  7. レビュアーから `LGTM`（`Looks Good To Me`、「特に問題はなさそう」という意味）がもらえたら、マージ担当者の判断で `master` にマージされます。
- 作業時の注意
  - `master` ブランチの追随を忘れないようにします。
    - 作業中にも `master` ブランチに変更が行われる可能性があります。コンフリクトを少なくするためにも、早い段階で作業ブランチに `master` の変更をマージするようにしましょう。

## コミット時のメッセージ

変更をコミット（`git commit`）する際のメッセージですが、基本的に日本語＋`pre-fix` 付きでお願いします。`pre-fix` は、コミットの種類（タイプ）のことで、メッセージの頭に付けます。

- １行コミットの例
  - `$ git commit -m "fix: Issue #54"`
  - `$ git commit -m "typo: README.md"`
  - `$ git commit -m "fix: #54 Chromeでドラッグ&ドロップが効かない問題を修正"`
  - `$ git commit -m "improve: 変数名をキャメルケースに統一"`
  - `$ git commit -m "refactor: HTTPリクエストを関数化"`

- `pre-fix` の種類
  - `feat:`
    - 新しい機能の追加
  - `fix:`
    - 動作が変わる修正（主に不具合修正）
    - Issue やレビューで指摘された内容の修正
  - `docs:`
    - ドキュメントの新規作成や変更全般
  - `typo:`
    - ソースコードのコメントやドキュメントの誤字・脱字の修正
  - `improve:`
    - ドキュメントやソースコードの整頓（見やすさ、読みやすさの改善）
  - `refactor:`
    - 機能が変わらないソースコードの整理（使いやすさの改善）
  - `chore:`
    - その他。分類に困ったこと全般。

`improve` と `refactor` の両方を含んで判断に困ったら、ドキュメントなら `improve`、コードなら `refactor` にしましょう。

## CI (自動レビュー、自動チェック）

このリポジトリには、以下の [CI](https://ja.wikipedia.org/wiki/%E7%B6%99%E7%B6%9A%E7%9A%84%E3%82%A4%E3%83%B3%E3%83%86%E3%82%B0%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3) サービスを利用する設定が含まれています。PR にコミットが `push` されると、以下の CI が実行実行されます。

- [CircleCI](https://www.google.com/search?q=site:qiita.com+CircleCI)
  - [ESLint](https://www.google.com/search?q=site:qiita.com+ESLint)

### ローカルで自動レビュー（自動チェック）を確認する

基本的に PR をするとリポジトリ先で CircleCi が自動実行されますが、ローカルで自動チェックの内容を確認するには以下のコマンドを実行します。

```terminal
# チェック結果をコンソールに表示
npm run eslint
```

エラー内容を見やすく HTML で出力するには以下のコマンドを実行します。HTML ファイルの出力先は `./results/eslint/eslint.html` です。

```terminal
# Install は初回のみ必要
npm install
npm run eslint:ci
cat ./results/eslint/eslint.html
```

ESLint の自動修正機能を使うには以下のコマンドを実行します。

```terminal
npm run eslint:fix
```

## 開発時の TIPS

以下は、デバッグ時に便利な TIPS です。

### Local Server を立てる

JavaScript の内容によっては Web サーバー上で動かさないと [CORS](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS) の制限により JavaScript の挙動が変わることがあります。

デバッグのために Web サーバーが必要になった場合は参考にしてください。サンプルではポート番号は 8888 番にしていますが、任意の空きポート番号に変更してください。

#### npm のパッケージを使う

リポジトリの `index.html` がある階層で以下のコマンドを実行するとローカルにサーバーが立ち上がり、さらに規定のブラウザが自動で立ち上がります。ポート番号はランダムな空きポート番号が使われます。

```bash
npx koko -o
```

#### PHP のビルトイン・サーバーを使う

リポジトリの `index.html` がある階層で以下のコマンドを実行すると、`http://localhost:8888/` でブラウザからアクセスできます。終了は Ctrl+C です。

```bash
php -S localhost:8888
```

#### Docker の軽量 Web サーバーコンテナを使う

リポジトリの `index.html` がある階層で以下のコマンドを実行すると、`http://localhost:8888/` でブラウザからアクセスできます。終了は `docker container kill uhttpd` です。

```bash
docker run --rm -d -v $(pwd):/www -p 8888:80 --name uhttpd fnichol/uhttpd
```

#### Python3 を使う

リポジトリの `index.html` がある階層で以下のコマンドを実行すると、`http://localhost:8888/` でブラウザからアクセスできます。終了は Ctrl+C です。

```bash
python -m http.server 8888
```

#### Python2 を使う

リポジトリの `index.html` がある階層で以下のコマンドを実行すると、`http://localhost:8888/` でブラウザからアクセスできます。終了は Ctrl+C です。

```bash
python -m SimpleHTTPServer 8888
```

### 外部公開した状態や HTTPS（SSL）での簡易動作確認する

外部公開された場合の動作を確認したい、もしくは HTTPS（SSL）での動作を確認したい場合は `ssh` コマンドで外部の `ssh` サーバーにポートフォワードして検証すると便利です。

ローカルで `http://localhost:8888/` とアクセスできる状態で、以下のコマンドを実行すると [localhost.run](https://localhost.run/) の `ssh` サーバーに接続がポートフォワードされます。実行後に表示される `https://xxxxx.localhost.run/` にアクセスすると HTTPS で外部公開した場合と同じ状態を検証できます。

```bash
ssh -R 80:localhost:8888 ssh.localhost.run
```
