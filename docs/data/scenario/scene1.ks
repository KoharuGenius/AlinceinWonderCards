;ティラノスクリプトサンプルゲーム

*start

[cm  ]
[clearfix]
[start_keyconfig]


[bg storage="bg_badend.jpg" time="100"]

;メニューボタンの表示
@showmenubutton

@freeimage layer=1
@layopt layer=1 visible="true"
[eval exp="drawGameboard();"]
[eval exp="initMatch()";]

[eval exp="addeventPlay();"}
[s]