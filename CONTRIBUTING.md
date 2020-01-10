# コントリビューターのためのガイドライン

1. コーディング規約
    - [`.editordonfig` ベース](https://github.com/hidao80/mastogetter/blob/master/.editorconfig)
        - タブ・インデント
        - UTF-8, BOM なし
        - 改行コード LF

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
        9. レビュアーから LGTM（特に問題ないという意味）がもらえたら、マージ担当者の判断で `master` にマージされます。
    - 作業時の注意
        - `master` ブランチの追随を忘れないようにします。
            - 作業中に `master` ブランチに変更が行われる可能性があります。コンフリクトを少なくするためにも早い段階で作業ブランチに `master` の変更をマージするようにしましょう。

## 開発時の TIPS

以下は、デバッグ時に便利な TIPS です。

### Local Server を立てる

Javascript の内容によっては Web サーバー上で動かさないと [CORS](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS) の制限により Javascript の挙動が変わることがあります。

デバッグのために Web サーバーが必要になった場合は参考にしてください。

#### PHP のビルトイン・サーバーを使う

リポジトリの index.php がある階層で以下のコマンドを実行すると、`http://localhost:8888/` でブラウザからアクセスできます。終了は Ctrl+C です。

```bash
php -S localhost:8888 index.html
```

#### Docker で軽量 Web サーバーを使う

リポジトリの index.php がある階層で以下のコマンドを実行すると、`http://localhost:8888/` でブラウザからアクセスできます。終了は `docker container kill uhttpd` です。

```bash
docker run --rm -d -v $(pwd):/www -p 8888:80 --name uhttpd fnichol/uhttpd
```

### 外部公開した状態や https（SSL） での簡易動作確認する

外部公開された場合の動作を確認したい場合や、SSL での動作を確認したい場合は [localhost.run](https://localhost.run/) のサービスと SSH を使って、ローカルの `http://localhost:8080/` への接続を公開すると `https://xxxxx.localhost.run/` でアクセスできるようになります。

```bash
ssh -R 80:localhost:8888 ssh.localhost.run
```
