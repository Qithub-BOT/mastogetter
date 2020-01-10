# コントリビューターのためのガイドライン

1. コーディング規約
    - [`.editordonfig` ベース](https://github.com/hidao80/mastogetter/blob/master/.editorconfig)
        - タブ・インデント
        - UTF-8, BOM なし
        - 改行コード LF
        - コメント：任意。ただし数単語で表現できないものや説明文は日本語。

2. 特記仕様
    - 対象外ブラウザ
        - [IE, 旧 Edge(Chromium ベースより前)](https://github.com/hidao80/mastogetter/issues/52#issuecomment-572322561)
    - HTML5, CSS, Javascript のみで動くこと。

3. ブランチの役割と PR（Pull Request）先
    - `gh-pages` ブランチ
        - リリース先。このブランチは `master` からのマージのみで PR は受け付けていません。
    - `master` ブランチ
        - PR 先。このブランチが開発用で最新の状態です。このブランチに PR をしてください。

4. PR の仕方
    - 本リポジトリでは Draft PR を使った PR 方法を推奨しています。
        - Draft Pull Request とは
            - [Draft Pull Request をリリースしました](https://github.blog/jp/2019-02-19-introducing-draft-pull-requests/) @ GitHub Blog
            - [WIPの代わりにDraft Pull Requestを利用する](https://qiita.com/tatane616/items/13da1b6797a7b871ad58) @ Qiita
    - 主な流れ
        1. 作業用のブランチを最新の `master` ブランチから作成します。
            - ブランチ名は作業内容がわかるものにします。
        2. ソースの作業箇所の近くや文頭に「作業の概要」をコメントします。
            - TODO のコメントを書くようなイメージがいいでしょう。
        3. `commit` して `push` したら、そのまま本家（Upstream）の master に Draft で PR してしまいます。
        4. ブランチに作業をコミットして行きます。
        5. レビューしてもらってもよい状態になったら、PR 先で `Ready for review` ボタンを押してドラフトを解除します。
        6. PR 先で CircleCI の自動レビュー（自動チェック）が開始されるので、レビューをパスしているか確認します。
        7. パスしていない場合は、そのエラー内容を確認して修正を `commit` & `push` します。
        8. 自動チェックをパスすると、他のメンバーがレビューを始めるので、指摘を修正し `commit` & `push` します
        9. レビュアーから `LGTM`（`Looks Good To Me`、「特に問題はなさそう」という意味）がもらえたら、マージ担当者の判断で `master` にマージされます。
    - 作業時の注意
        - `master` ブランチの追随を忘れないようにします。
            - 作業中に `master` ブランチに変更が行われる可能性があります。コンフリクトを少なくするためにも早い段階で作業ブランチに `master` の変更をマージするようにしましょう。

5. コミット時のメッセージ

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

## 開発時の TIPS

以下は、デバッグ時に便利な TIPS です。

### Local Server を立てる

Javascript の内容によっては Web サーバー上で動かさないと [CORS](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS) の制限により Javascript の挙動が変わることがあります。

デバッグのために Web サーバーが必要になった場合は参考にしてください。サンプルではポート番号は 8888 番にしていますが、任意の空きポート番号に変更してください。

#### npmのパッケージを使う

リポジトリの`index.html`がある階層で`npx koko -o`のように実行するとローカルにサーバーが立ち上がり、さらに規定のブラウザが自動で立ち上がります。
#### PHP のビルトイン・サーバーを使う

リポジトリの index.html がある階層で以下のコマンドを実行すると、`http://localhost:8888/` でブラウザからアクセスできます。終了は Ctrl+C です。

```bash
php -S localhost:8888 index.html
```

#### Docker で軽量 Web サーバーを使う

リポジトリの index.html がある階層で以下のコマンドを実行すると、`http://localhost:8888/` でブラウザからアクセスできます。終了は `docker container kill uhttpd` です。

```bash
docker run --rm -d -v $(pwd):/www -p 8888:80 --name uhttpd fnichol/uhttpd
```

### 外部公開した状態や https（SSL） での簡易動作確認する

外部公開された場合の動作を確認したい場合や、SSL での動作を確認したい場合は [localhost.run](https://localhost.run/) のサービスと SSH を使って、ローカルの `http://localhost:8888/` への接続を公開すると `https://xxxxx.localhost.run/` でアクセスできるようになります。

```bash
ssh -R 80:localhost:8888 ssh.localhost.run
```
