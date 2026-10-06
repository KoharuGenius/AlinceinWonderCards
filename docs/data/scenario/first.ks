;一番最初に呼び出されるファイル

[title name="ティラノスクリプト解説"]
[stop_keyconfig]


;ティラノスクリプトが標準で用意している便利なライブラリ群
;コンフィグ、CG、回想モードを使う場合は必須
@call storage="tyrano.ks"

;ゲームで必ず必要な初期化処理はこのファイルに記述するのがオススメ
;キャラクターの名前が表示される文字領域
[ptext name="chara_name_area" layer="message0" color="white" size=28 bold=true x=180 y=510]

;上記で定義した領域がキャラクターの名前表示であることを宣言（これがないと#の部分でエラーになります）
[chara_config ptext="chara_name_area"]

;
;このゲームで登場するキャラクターを宣言
;nozomi
;
;[chara_new  name="nozomi" storage="chara/akane/normal.png" jname="のぞみ"  ]
;キャラクターの表情登録
;[chara_face name="nozomi" face="angry" storage="chara/akane/angry.png"]
;[chara_face name="nozomi" face="doki" storage="chara/akane/doki.png"]
;[chara_face name="nozomi" face="happy" storage="chara/akane/happy.png"]
;[chara_face name="nozomi" face="sad" storage="chara/akane/sad.png"]


;メッセージボックスは非表示
@layopt layer="message" visible=false

;最初は右下のメニューボタンを非表示にする
[hidemenubutton]

[loadcss file="./data/scenario/game.css"]
[loadjs storage="module.js"]
[loadjs storage="gameboard.js"]

;タイトル画面へ移動
@jump storage="title.ks"

[s]


