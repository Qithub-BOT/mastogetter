# コントリビューターのためのガイドライン

1. コーディング規約
    - [`.editordonfig` ベース](https://github.com/hidao80/mastogetter/blob/master/.editorconfig)
        - タブ・インデント
        - UTF-8, BOM なし
        - 改行コード LF
2. 特記仕様
    - [IE, 旧 Edge(Chromium ベースより前)](https://github.com/hidao80/mastogetter/issues/52#issuecomment-572322561) は対象外

3. ブランチの役割と PR 先
    - `gh-pages`
        - リリース先。このブランチは `master` からのマージのみで PR は受け付けない。
    - `master`
        - 最新ブランチ。開発用ブランチ。
        - PR はこのブランチに行う。

4. PR の仕方
    - 本リポジトリでは Draft PR を使った PR 方法を推奨しています。
        - Draft Pull Request とは
            - [Draft Pull Request をリリースしました](https://github.blog/jp/2019-02-19-introducing-draft-pull-requests/) @ GitHub Blog
            - [WIPの代わりにDraft Pull Requestを利用する](https://qiita.com/tatane616/items/13da1b6797a7b871ad58) @ Qiita
    - 主な流れ
        1. 作業用のブランチを最新の `master` ブランチから作成します。
            - ブランチ名は「推奨するブランチ名の付け方」をご覧ください。
        2. ソースの作業箇所付近や文頭に「作業の概要」をコメントします。
        3. commit して push したら、そのまま本家（Upstream）の master に Draft で PR してしまいます。
            - この時、`Draft` で PR を行ってください。
        4. ブランチに作業をコミットして行きます。
            - コミットを `push` すると、本家のリポジトリで自動チェック（CI）が働きます。<br>作業が終わった時点で CI のチェックをパスしていれば、途中 `❌` が出ていても気にする必要はありません。少しずつ `❌` の内容を潰して行きましょう。
            - 作業再開時もしくは作業中に **`master` もしくは PR したブランチに変更が行われる可能性があります**。コンフリクトを少なくするためにも早い段階で同期を忘れないように注意しましょう。

    - 推奨するブランチ名の付け方（`[]` は任意です）
        - `issue`-`<Issue番号>`[-`<担当者名>`-`<作業概要>`]
            -  特定 Issue の対応を行う。
            - Issue の一部の作業である場合は、作業の概要がわかる名前を付けてください。
        - `issue`-`<Issue番号>`[-`<作業概要>`]
            -  担当者名を付けない場合は「他のコラボレーターからも差し込みをして欲しいブランチ」である意味になります。
            - Issue の一部の作業である場合は、作業の概要がわかる名前を付けてください。
        - `typo`-`<担当者名>`
            - 単純な誤字脱字の修正する。
        - `refactor`[-`<担当者名>`-`<対象>`]
            - [リファクタリング](https://ja.wikipedia.org/wiki/%E3%83%AA%E3%83%95%E3%82%A1%E3%82%AF%E3%82%BF%E3%83%AA%E3%83%B3%E3%82%B0_(%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%9F%E3%83%B3%E3%82%B0))をする。
            - 特定ファイルのリファクタの場合は、対象がわかる名前を付けてください。
