document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. アクセスカウンター機能
       ========================================== */
    const NAMESPACE = 'prsk_x_count_voenkyo_id_v2'; 
    const KEY = 'visits';

    fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/${KEY}`)
        .then(response => response.json())
        .then(data => {
            const count = data.value;
            // 隠し要素に数字を書き込む
            const hiddenDiv = document.getElementById('access-counter-storage');
            if (hiddenDiv) {
                hiddenDiv.setAttribute('data-count', count);
                hiddenDiv.innerText = `Access: ${count}`;
            }
            // コンソールに出力（F12で確認用）
            console.log(`%c現在のアクセス数: ${count}`, "color: #ff007f; font-weight: bold; font-size: 14px;");
        })
        .catch(error => {
            console.error('Counter Error:', error);
        });

    /* ==========================================
       2. 文章生成機能 (ツイ募ビルダ)
       ========================================== */
    const inputs = document.querySelectorAll('input, select, textarea');
    const outputTextarea = document.getElementById('outputTextarea');
    const charCount = document.getElementById('charCount');
    const copyButton = document.getElementById('copyButton');
    const tweetButton = document.getElementById('tweetButton');

    // ラジオボタンによる表示切り替え（回数 or 時間）
    const countTypeRadios = document.getElementsByName('countType');
    const countInput = document.getElementById('countInput');
    const timeInput = document.getElementById('timeInput');

    function updateCountTypeVisibility() {
        let selected = 'count';
        for(const radio of countTypeRadios) {
            if(radio.checked) selected = radio.value;
        }
        if(selected === 'count') {
            countInput.style.display = 'block';
            timeInput.style.display = 'none';
        } else {
            countInput.style.display = 'none';
            timeInput.style.display = 'block';
        }
        generateText(); // 切り替え時にも再生成
    }

    // イベントリスナー設定
    inputs.forEach(input => {
        input.addEventListener('input', generateText);
        input.addEventListener('change', generateText); // SelectやCheckbox用
    });
    
    // ラジオボタンの変更監視
    countTypeRadios.forEach(r => r.addEventListener('change', updateCountTypeVisibility));
    
    // 初期化
    updateCountTypeVisibility();

    // メインのテキスト生成関数
    function generateText() {
        let text = "プライベート\n";

        // 1. 周回種類
        const loopTypeSelect = document.getElementById('loopTypeSelect').value;
        const loopTypeCustom = document.getElementById('loopTypeCustom').value;
        const loopVal = loopTypeCustom ? loopTypeCustom : loopTypeSelect;
        
        if (loopVal) {
            text += `${loopVal}周回\n`;
        }

        // 2. 回数 or 時間
        const countType = document.querySelector('input[name="countType"]:checked').value;
        if (countType === 'count') {
            const val = document.getElementById('countInput').value;
            if(val) text += `あと${val}回\n`;
        } else {
            const val = document.getElementById('timeInput').value;
            if(val) text += `${val}まで\n`;
        }

        // 3. 募集人数
        const slots = document.getElementById('slotsInput').value;
        if (slots) text += `@${slots}\n`;

        // 4. 部屋番号
        const roomNum = document.getElementById('roomNumberInput').value;
        if (roomNum) text += `🔑${roomNum}\n`;

        text += "\n"; // 空行

        // 5. 主の状態
        const myScoreVal = document.getElementById('myScoreInput').value;
        if (myScoreVal) {
            const myType = document.querySelector('input[name="myScoreType"]:checked').nextElementSibling.innerText.trim();
            // ラジオボタンのラベルテキストを取得しています (%, ☆4, etc)
            // もしラベルに余計な文字がある場合は .innerText を調整してください
            text += `主：${myScoreVal}${myType}\n`;
        }

        // 6. 募集条件
        const reqScoreVal = document.getElementById('reqScoreInput').value;
        if (reqScoreVal) {
            const reqType = document.querySelector('input[name="reqScoreType"]:checked').nextElementSibling.innerText.trim();
            const condition = document.getElementById('reqScoreCondition').value;
            
            let condText = "";
            if (condition === "↑") condText = "以上";
            else if (condition === "〜") condText = ""; // 文脈によるがここでは空
            
            text += `募：${reqScoreVal}${reqType}${condText}\n`;
        }

        // 7. 支援・アンコール
        const supportCheck = document.getElementById('supportCheck').checked;
        const encoreCheck = document.getElementById('encoreCheck').checked;
        const supportScore = document.getElementById('supportScoreInput').value;
        const freeText = document.getElementById('freeTextInpue').value; // IDのスペル注意(Inpue)

        let supportLine = "";
        if (supportCheck) supportLine += "支援○ ";
        if (encoreCheck) supportLine += "アンコ○ ";
        if (supportScore) supportLine += `支援${supportScore}% `;
        if (freeText) supportLine += `${freeText}`;
        
        if (supportLine) text += `(${supportLine.trim()})\n`;

        // 8. ルール (チェックボックス)
        const rules = [];
        document.querySelectorAll('#ruleCheckboxes input[type="checkbox"]:checked').forEach(cb => {
            rules.push(cb.value);
        });

        if (rules.length > 0) {
            text += `\n条件：${rules.join('、')}`;
        }

        // テキストエリアに反映
        outputTextarea.value = text;
        updateCharCount(text);
    }

    // 文字数カウント & ボタン制御
    function updateCharCount(text) {
        const count = text.length;
        charCount.innerText = `${count} / 140 文字`;
        
        if (count > 0 && count <= 140) {
            copyButton.disabled = false;
            copyButton.classList.remove('cursor-not-allowed', 'bg-gray-400');
            copyButton.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
            
            // X投稿ボタンの更新
            const encodedText = encodeURIComponent(text);
            tweetButton.href = `https://twitter.com/intent/tweet?text=${encodedText}`;
            tweetButton.style.pointerEvents = 'auto';
            tweetButton.style.opacity = '1';
        } else {
            copyButton.disabled = true;
            copyButton.classList.add('cursor-not-allowed', 'bg-gray-400');
            copyButton.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
            
            tweetButton.removeAttribute('href');
            tweetButton.style.pointerEvents = 'none';
            tweetButton.style.opacity = '0.5';
        }
    }

    // コピー機能
    copyButton.addEventListener('click', () => {
        outputTextarea.select();
        document.execCommand('copy');
        alert('コピーしました！');
    });

});
