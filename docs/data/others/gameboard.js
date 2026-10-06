const drawGameboard = () => {
	//同名idがあれば削除
	$("#gameboard").remove();
	
	//ゲームボードを貼り付ける位置をtop,leftで指定
	$('.1_fore').append('<div id="gameboard" class="app-container"></div>');
	
	//ゲーム盤面部分だけを書く。divタグで囲まれているはず
	const gameboardHTML = `
    <header>
            <div class="brand-title">
                <i class="fa-solid fa-diamond"></i>
                <span>UNDER 7 BACCARAT</span>
                <span class="badge-tag">1 SUIT MATCH</span>
            </div>

            <div class="score-board">
                <div class="score-team">
                    <span>YOU</span>
                    <div id="player-match-wins" class="dot-container">
                        <div class="score-dot"></div>
                        <div class="score-dot"></div>
                    </div>
                </div>
                <span style="font-size: 0.8rem; color: #666666;">VS</span>
                <div class="score-team">
                    <div id="cpu-match-wins" class="dot-container">
                        <div class="score-dot"></div>
                        <div class="score-dot"></div>
                    </div>
                    <span>CPU</span>
                </div>
            </div>
            <!--
            <div class="btn-group">
                <button id="rules-btn" class="btn"><i class="fa-solid fa-circle-info"></i> ルール</button>
                <button id="reset-btn" class="btn"><i class="fa-solid fa-rotate-right"></i> リセット</button>
            </div>
            -->
    </header>

	<main class="game-board">      
            <!-- CPU Hand -->
            <div>
                <div class="section-label">
                    <i class="fa-solid fa-robot"></i> CPUの手札 (<span id="cpu-card-count">4</span>枚)
                </div>
                <div id="cpu-hand" class="hand-area"></div>
            </div>

            <!-- Central Battle Arena -->
            <div class="battle-arena">
                <!-- Deck status -->
                <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                    <div id="deck-icon" class="card-perspective" style="width: 44px; height: 64px;">
                        <div class="card-inner">
                            <div class="card-back" style="display:flex; align-items:center; justify-content:center;">
                                <i class="fa-solid fa-layer-group" style="color: #ffffff;"></i>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 0.65rem; color: #888888;">残山札数</div>
                        <div style="font-size: 0.85rem; font-weight: bold;"><span id="deck-count">5</span> / 13 枚</div>
                    </div>
                </div>

                <!-- Card Slots -->
                <div class="cards-row">
                    <!-- Center Card -->
                    <div class="slot-box">
                        <span class="slot-title">場</span>
                        <div id="under-7-badge" class="badge-under7 hidden">✨ UNDER 7 ✨</div>
                        <div id="center-card-slot" class="card-perspective slot-placeholder"></div>
                        <span id="center-score-tag" class="score-tag"></span>
                    </div>

                    <span style="font-weight: bold; color: #444444;">+</span>

                    <!-- Player Card -->
                    <div class="slot-box">
                        <span class="slot-title">あなた</span>
                        <div id="player-played-slot" class="card-perspective slot-placeholder"></div>
                        <span id="player-score-tag" class="score-tag"></span>
                    </div>

                    <!-- CPU Card -->
                    <div class="slot-box">
                        <span class="slot-title">CPU</span>
                        <div id="cpu-played-slot" class="card-perspective slot-placeholder"></div>
                        <span id="cpu-score-tag" class="score-tag"></span>
                    </div>
                </div>

                <!-- Battle Action -->
                <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <button id="play-card-btn" disabled class="btn btn-primary" style="width: 100%; justify-content: center; padding: 10px;">
                        <i class="fa-solid fa-play"></i> 勝負する！
                    </button>
                    <div id="round-status-msg" style="font-size: 0.7rem; color: #aaaaaa; text-align: center;">
                        手札を選択してください
                    </div>
                </div>
            </div>

            <!-- Player Hand -->
            <div>
                <div class="section-label">
                    <i class="fa-solid fa-user"></i> あなたの手札 (カードをタップして選択)
                </div>
                <div id="player-hand" class="hand-area"></div>
            </div>
	</main>

    <!-- Footer: Tracker & Log -->
        <footer>
            <div class="tracker-section">
                <div style="font-size: 0.7rem; font-weight: bold; display: flex; justify-content: space-between;">
                    <span><i class="fa-solid fa-eye"></i> カードカウンター (13枚の出現状況)</span>
                    <span style="color: #888888; font-size: 0.65rem;">白: 手札 / 取消線: 出現済み</span>
                </div>
                <div id="card-tracker" class="tracker-grid"></div>
            </div>

            <div class="log-section">
                <div style="font-size: 0.7rem; font-weight: bold; margin-bottom: 4px;">
                    <i class="fa-solid fa-list"></i> 対戦履歴
                </div>
                <div id="game-log" class="log-box"></div>
            </div>
        </footer>

	`;
	
	$("#gameboard").append(gameboardHTML);	
};
