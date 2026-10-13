# 神栖をまもれ！！

神栖限定の、猫チームによる横型タワーディフェンスへ改修中です。

**この作業ブランチは未公開の試作です。** [公開ゲーム](https://tatsuya0726.github.io/kamisu-japan-journey/) は現在 `main` の旧・日本旅版です。更新後も同じURLを使います。

[Claude向け引き継ぎ資料](docs/CLAUDE_HANDOFF.md) に仕様、現状、担当境界、未完部分、素材の扱いと次の作業をまとめています。[実装メモ](DEFENSE-NOTES.md) も参照してください。

## 起動

Node 24:

```sh
npm ci
npm test
npm run dev
npm run build
```

ゲーム: `http://127.0.0.1:8137/`。画像比較: `http://127.0.0.1:8137/sample.html`。配布出力: `dist/`。

## 現在できること

港・利根川沿い・大野原の3ステージ、時間経過で増える資源、4役の猫の出撃、自動移動・攻撃、3種の架空の敵、拠点HP、勝敗・再戦、停止・倍速。新ゲームのクリア記録は旧版とは別キーで保存します。

写真風・ドット版の採用は未決定。提供猫の2画像はWindows側への正式な転送が未完了で、現在の猫4種は仮素材です。比較ページはローカルの透明画像を選んで同じ条件で見るための土台です。画像を送信・保存しません。

手動保存する場合の受取先は `.local-assets/cat-sample/originals/`、ファイル名は `cat-photo-sample.png` と `cat-pixel-sample.png` です。このフォルダはGit・配信対象外です。保存後は比較ページの各ファイル選択から開けます。詳細と未完手順は引き継ぎ資料を参照してください。現在の作業ブランチは引き渡し待ちで、統合を再開する担当者を決めてから変更します。

## 保存・共有

旧版はGit履歴 `2e742d5a74c6959453e84fa6b9b6cba1483662c8` に保持。旧セーブには触れません。作業ブランチ `feat/kamisu-defense-sample` を別clone/worktreeで扱い、既存作業を上書きしないでください。並行作業は別ブランチとPRで行います。`main` へのpushは本番Pagesを更新します。

Phaser/EventEmitter3のMIT通知は [THIRD_PARTY_NOTICES](public/THIRD_PARTY_NOTICES.txt) を参照。独自素材・コードについて追加の再利用ライセンスは付与していません。

地理の根拠: [神栖市公式・位置と自然条件](https://www.city.kamisu.ibaraki.jp/shisei/introduction/1002858.html)。舞台と敵は架空で、実在住民・団体とは無関係です。
