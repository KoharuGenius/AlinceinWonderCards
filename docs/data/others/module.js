        // Game Constants
        const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const SUIT = '♠';

        // State Variables
        let deck = [];
        let playerHand = [];
        let cpuHand = [];
        let playedHistory = [];

        let centerCard = null;
        let playerPlayedCard = null;
        let cpuPlayedCard = null;

        let selectedPlayerCardIndex = null;
        let isRoundInProgress = false;

        let playerMatchWins = 0;
        let cpuMatchWins = 0;

        /* Sound synth using Web Audio API */
        class SoundFX {
            constructor() { this.ctx = null; }
            init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
            playTone(freq, duration) {
                this.init();
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            }
            playFlip() { this.playTone(400, 0.05); }
            playWin() { this.playTone(800, 0.15); }
        }
        const sfx = new SoundFX();

        function getBaccaratValue(rank) {
            if (rank === 'A') return 1;
            if (['10', 'J', 'Q', 'K'].includes(rank)) return 0;
            return parseInt(rank, 10);
        }

        function isFaceCard(rank) {
            return ['J', 'Q', 'K'].includes(rank);
        }

        function createDeck() {
            return RANKS.map((rank, index) => ({
                rank: rank,
                suit: SUIT,
                value: index + 1,
                baccaratValue: getBaccaratValue(rank)
            }));
        }

        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function initMatch() {
            playerMatchWins = 0;
            cpuMatchWins = 0;
            playedHistory = [];
            addLog("--- 新しいマッチ開始 ---");
            updateMatchWinsUI();
            startNewDeckCycle();
        }

        function startNewDeckCycle() {
            deck = shuffle(createDeck());
            playerHand = deck.splice(0, 4);
            cpuHand = deck.splice(0, 4);
            
            playerHand.sort((a, b) => a.value - b.value);

            selectedPlayerCardIndex = null;
            playerPlayedCard = null;
            cpuPlayedCard = null;
            centerCard = null;

            addLog("山札をシャッフルし、手札4枚ずつ配りました。");
            updateTrackerUI();
            renderHands();
            prepareRound();
        }

        function prepareRound() {
            if (deck.length === 0) {
                addLog("山札終了。手札を再配布します。");
                startNewDeckCycle();
                return;
            }

            centerCard = deck.pop();
            selectedPlayerCardIndex = null;
            playerPlayedCard = null;
            cpuPlayedCard = null;
            isRoundInProgress = false;

            document.getElementById('player-played-slot').innerHTML = '';
            document.getElementById('cpu-played-slot').innerHTML = '';
            document.getElementById('player-played-slot').classList.remove('royal-highlight');
            document.getElementById('cpu-played-slot').classList.remove('royal-highlight');

            document.getElementById('player-score-tag').textContent = '';
            document.getElementById('cpu-score-tag').textContent = '';
            document.getElementById('center-score-tag').textContent = '';

            const centerSlot = document.getElementById('center-card-slot');
            centerSlot.innerHTML = createCardHTML(centerCard, false, 'center-card-inner');

            const under7Badge = document.getElementById('under-7-badge');
            // Check rank: A(1), 2, 3, 4, 5, 6
            const isUnder7 = ['A', '2', '3', '4', '5', '6'].includes(centerCard.rank);
            
            under7Badge.classList.remove('hidden');
            if (isUnder7) {
                under7Badge.textContent = "✨ UNDER 7 ✨";
                under7Badge.className = "badge-under7 badge-under";
                centerSlot.classList.add('under7-active');
                centerSlot.classList.remove('over7-active');
                addLog("場カード: 【UNDER 7】(A~6) が発生中！");
            } else {
                under7Badge.textContent = "⚡ 7 or OVER ⚡";
                under7Badge.className = "badge-under7 badge-over";
                centerSlot.classList.remove('under7-active');
                centerSlot.classList.add('over7-active');
                addLog("場カード: 【7 or OVER】(7~K) が発生中！");
            }

            document.getElementById('round-status-msg').textContent = "手札から1枚選択してください";
            document.getElementById('play-card-btn').disabled = true;

            updateDeckUI();
            renderHands();
        }

        function createCardHTML(card, isFaceUp, innerId = '') {
            return `
                <div id="${innerId}" class="card-inner ${isFaceUp ? 'flipped' : ''}">
                    <div class="card-back"></div>
                    <div class="card-front">
                        <div class="card-center-rank">${card.rank}</div>
                        <div class="card-center-suit">${card.suit}</div>
                    </div>
                </div>
            `;
        }

        function renderHands() {
            // Player Hand
            const playerHandEl = document.getElementById('player-hand');
            playerHandEl.innerHTML = '';
            playerHand.forEach((card, idx) => {
                const cardDiv = document.createElement('div');
                cardDiv.className = `card-perspective card-selectable ${selectedPlayerCardIndex === idx ? 'card-selected' : ''}`;
                cardDiv.innerHTML = createCardHTML(card, true);
                cardDiv.onclick = () => selectPlayerCard(idx);
                playerHandEl.appendChild(cardDiv);
            });

            // CPU Hand
            const cpuHandEl = document.getElementById('cpu-hand');
            cpuHandEl.innerHTML = '';
            cpuHand.forEach(() => {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card-perspective';
                cardDiv.style.opacity = '0.8';
                cardDiv.innerHTML = createCardHTML({ rank: '?', suit: '♠' }, false);
                cpuHandEl.appendChild(cardDiv);
            });

            document.getElementById('cpu-card-count').textContent = cpuHand.length;
        }

        function selectPlayerCard(index) {
            if (isRoundInProgress) return;
            selectedPlayerCardIndex = index;
            sfx.playFlip();
            renderHands();
            document.getElementById('play-card-btn').disabled = false;
            document.getElementById('round-status-msg').textContent = `「${playerHand[index].rank}」選択中。「勝負する！」を押してください。`;
        }

        function chooseCpuCard() {
            const isCenterUnder7 = ['A', '2', '3', '4', '5', '6'].includes(centerCard.rank);
            let bestIndex = 0;
            let bestScore = -999;

            cpuHand.forEach((card, index) => {
                let rating = 0;
                const cardVal = card.baccaratValue;

                if (isFaceCard(card.rank)) {
                    rating += isCenterUnder7 ? -5 : 15;
                }

                let possibleCenterVals = isCenterUnder7 ? [1, 2, 3, 4, 5, 6] : [7, 8, 9, 0, 0, 0, 0];
                let expectedSum = 0;
                possibleCenterVals.forEach(cVal => {
                    expectedSum += (cVal + cardVal) % 10;
                });

                rating += (expectedSum / possibleCenterVals.length) * 3;
                rating += Math.random();

                if (rating > bestScore) {
                    bestScore = rating;
                    bestIndex = index;
                }
            });

            return bestIndex;
        }

        function addeventPlay(){
         document.getElementById('play-card-btn').addEventListener('click', () => {
            if (selectedPlayerCardIndex === null || isRoundInProgress) return;
            isRoundInProgress = true;
            document.getElementById('play-card-btn').disabled = true;

            playerPlayedCard = playerHand.splice(selectedPlayerCardIndex, 1)[0];
            const cpuIndex = chooseCpuCard();
            cpuPlayedCard = cpuHand.splice(cpuIndex, 1)[0];

            renderHands();

            const pSlot = document.getElementById('player-played-slot');
            const cSlot = document.getElementById('cpu-played-slot');

            pSlot.innerHTML = createCardHTML(playerPlayedCard, false, 'p-played-inner');
            cSlot.innerHTML = createCardHTML(cpuPlayedCard, false, 'c-played-inner');

            sfx.playFlip();
            document.getElementById('round-status-msg').textContent = "カードオープン！";

            setTimeout(() => {
                document.getElementById('center-card-inner').classList.add('flipped');
                sfx.playFlip();

                setTimeout(() => {
                    document.getElementById('p-played-inner').classList.add('flipped');
                    document.getElementById('c-played-inner').classList.add('flipped');
                    sfx.playFlip();

                    setTimeout(() => {
                        evaluateRoundResult();
                    }, 600);
                }, 500);
            }, 500);
         });
        }

        function evaluateRoundResult() {
            const centerVal = centerCard.baccaratValue;
            const playerVal = playerPlayedCard.baccaratValue;
            const cpuVal = cpuPlayedCard.baccaratValue;

            const pScore = (centerVal + playerVal) % 10;
            const cScore = (centerVal + cpuVal) % 10;

            const isCenterFace = isFaceCard(centerCard.rank);
            const isPlayerRoyal = isCenterFace && isFaceCard(playerPlayedCard.rank);
            const isCpuRoyal = isCenterFace && isFaceCard(cpuPlayedCard.rank);

            document.getElementById('center-score-tag').textContent = `(${centerCard.rank}=${centerVal})`;
            document.getElementById('player-score-tag').textContent = isPlayerRoyal ? "ROYAL!" : `${pScore}点`;
            document.getElementById('cpu-score-tag').textContent = isCpuRoyal ? "ROYAL!" : `${cScore}点`;

            let winner = null;

            if (isPlayerRoyal && isCpuRoyal) winner = 'draw';
            else if (isPlayerRoyal) {
                winner = 'player';
                document.getElementById('player-played-slot').classList.add('royal-highlight');
            } else if (isCpuRoyal) {
                winner = 'cpu';
                document.getElementById('cpu-played-slot').classList.add('royal-highlight');
            } else {
                if (pScore > cScore) winner = 'player';
                else if (cScore > pScore) winner = 'cpu';
                else winner = 'draw';
            }

            playedHistory.push(centerCard, playerPlayedCard, cpuPlayedCard);
            updateTrackerUI();

            if (winner === 'player') {
                playerMatchWins++;
                sfx.playWin();
                addLog(`勝利: あなた[${playerPlayedCard.rank}] vs CPU[${cpuPlayedCard.rank}] (場:${centerCard.rank}) -> ${pScore}対${cScore}`);
                document.getElementById('round-status-msg').textContent = "あなたの勝ち！";
            } else if (winner === 'cpu') {
                cpuMatchWins++;
                addLog(`敗北: あなた[${playerPlayedCard.rank}] vs CPU[${cpuPlayedCard.rank}] (場:${centerCard.rank}) -> ${pScore}対${cScore}`);
                document.getElementById('round-status-msg').textContent = "CPUの勝ち";
            } else {
                addLog(`引き分け: あなた[${playerPlayedCard.rank}] vs CPU[${cpuPlayedCard.rank}] (場:${centerCard.rank})`);
                document.getElementById('round-status-msg').textContent = "引き分け";
            }

            updateMatchWinsUI();

            setTimeout(() => {
                if (playerMatchWins >= 2 || cpuMatchWins >= 2) {
                    showMatchEndModal(playerMatchWins >= 2);
                } else {
                    prepareRound();
                }
            }, 1800);
        }

        function updateTrackerUI() {
            const trackerContainer = document.getElementById('card-tracker');
            trackerContainer.innerHTML = '';

            RANKS.forEach(rank => {
                const isPlayed = playedHistory.some(c => c.rank === rank);
                const isPlayerHolding = playerHand.some(c => c.rank === rank);

                let statusClass = "";
                if (isPlayed) statusClass = "played";
                else if (isPlayerHolding) statusClass = "in-hand";

                const item = document.createElement('div');
                item.className = `tracker-item ${statusClass}`;
                item.textContent = rank;
                trackerContainer.appendChild(item);
            });
        }

        function updateDeckUI() {
            document.getElementById('deck-count').textContent = deck.length;
        }

        function updateMatchWinsUI() {
            const pDots = document.getElementById('player-match-wins').children;
            const cDots = document.getElementById('cpu-match-wins').children;

            for (let i = 0; i < 2; i++) {
                pDots[i].className = `score-dot ${i < playerMatchWins ? 'active' : ''}`;
                cDots[i].className = `score-dot ${i < cpuMatchWins ? 'active' : ''}`;
            }
        }

        function addLog(text) {
            const logContainer = document.getElementById('game-log');
            const entry = document.createElement('div');
            entry.textContent = text;
            logContainer.prepend(entry);
        }

        function showMatchEndModal(isPlayerWinner) {
            const modal = document.getElementById('match-modal');
            document.getElementById('match-icon').textContent = isPlayerWinner ? "🏆" : "💀";
            document.getElementById('match-title').textContent = isPlayerWinner ? "VICTORY!" : "DEFEAT";
            document.getElementById('match-subtitle').textContent = isPlayerWinner ? "2勝先取でCPUに勝利しました！" : "2勝先取されました。";
            modal.classList.remove('hidden');
        }

        // Event Listeners
        document.getElementById('rules-btn').onclick = () => document.getElementById('rules-modal').classList.remove('hidden');
        document.getElementById('close-rules-btn').onclick = () => document.getElementById('rules-modal').classList.add('hidden');
        document.getElementById('confirm-rules-btn').onclick = () => document.getElementById('rules-modal').classList.add('hidden');
        document.getElementById('reset-btn').onclick = () => initMatch();
        document.getElementById('new-match-btn').onclick = () => {
            document.getElementById('match-modal').classList.add('hidden');
            initMatch();
        };

        window.onload = () => {
            initMatch();
        };