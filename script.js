// Firebase関連のコードをすべて削除し、ローカル動作に専念

let userId = null;
let isAuthReady = true; // ローカル動作のためtrueに設定

// プレースホルダーと初期テンプレートの定義
const PLACEHOLDERS = {
    ACTION: '募集目的・周回タイプ (例: MV周回)',
    ROOM: '部屋番号 (5桁)',
    SLOTS: '募集人数 (1-4)',
    COUNT: '回数 (3回など)',
    MY: '自分の内部値/条件',
    REQ: '募集内部値/条件',
    RULE: '部屋ルール (SFなし, 火消し×など)',
    VETERAN: 'ベテラン部屋の接頭辞',
};
const FIXED_TEMPLATE_STRUCTURE = 
`[VETERAN] [ACTION] [COUNT] @[SLOTS]

🔑[ROOM]

主: [MY]
募: [REQ]

[SUPPORT] 
[RULE]

#プロセカ協力 #プロセカ募集`;
// DOM要素の参照
let dynamicInputs = {};
// DOM読み込み完了後に要素を取得
function initializeDOMElements() {
    dynamicInputs = {
        veteran: document.getElementById('veteranCheck'),
        loopTypeSelect: document.getElementById('loopTypeSelect'),
        loopTypeCustom: document.getElementById('loopTypeCustom'),
        roomNumber: document.getElementById('roomNumberInput'),
        slots: document.getElementById('slotsInput'),
        count: document.getElementById('countInput'),
        supportCheck: document.getElementById('supportCheck'),
        encoreCheck: document.getElementById('encoreCheck'),
        supportScoreInput: document.getElementById('supportScoreInput'),
        freeTextInput: document.getElementById('freeTextInpue'), // HTMLのタイポ'freeTextInpue'を使用
        timeInput: document.getElementById('timeInput'),
        myScoreInput: document.getElementById('myScoreInput'),
        reqScoreInput: document.getElementById('reqScoreInput'),
        reqScoreCondition: document.getElementById('reqScoreCondition'),
        // ルールチェックボックスの参照
        ruleSf: document.getElementById('rule_sf'),
        ruleHikeshi: document.getElementById('rule_hikeshi'),
        ruleNonEfficiency: document.getElementById('rule_non_efficiency'),
        ruleMv: document.getElementById('rule_mv'),
        ruleHouchi: document.getElementById('rule_houchi'),
        ruleSoku: document.getElementById('rule_soku'),
        ruleMiss: document.getElementById('rule_miss'),
        ruleTime: document.getElementById('rule_time'),
        ruleNanido: document.getElementById('rule_nanido'),
        ruleMasterng: document.getElementById('rule_masterng'),
        ruleExng: document.getElementById('rule_exng'),
        ruleTaisitsung: document.getElementById('rule_taisitsung'),
        ruleTaisitsuok: document.getElementById('rule_taisitsuok'),
        ruleOtsusaki: document.getElementById('rule_otsusaki'),
        ruleStamp: document.getElementById('rule_stamp'),
        ruleKaisan: document.getElementById('rule_kaisan'),
        ruleWait: document.getElementById('rule_wait'),
    };
}

/**
 * 最終的なツイート文章を生成し、表示と文字数カウントを更新
 */
function updateOutput() {
    // DOM要素がまだ初期化されていない場合は終了
    if (!dynamicInputs.veteran) return; 

    const outputTextarea = document.getElementById('outputTextarea');
    const charCount = document.getElementById('charCount');
    const copyButton = document.getElementById('copyButton');
    const tweetButton = document.getElementById('tweetButton');
    let structure = FIXED_TEMPLATE_STRUCTURE;

    // 1. 周回タイプ [ACTION] の処理
    let loopType = dynamicInputs.loopTypeCustom.value.trim();
    if (!loopType) {
        const selectedPreset = dynamicInputs.loopTypeSelect.value;
        if (selectedPreset) {
            loopType = selectedPreset;
        }
    }
    // 周回が付いていない場合のみ追加
    if (loopType && !loopType.includes('周回')) {
        loopType = loopType + '周回';
    } else if (loopType === '周回') {
        loopType = '周回';
    }
    
    // 2. 自分の内部値 [MY] の処理
    let myScore;
    const myTypeElement = document.querySelector('input[name="myScoreType"]:checked');
    const myType = myTypeElement ? myTypeElement.value : 'percent';
    if (myType === 'percent') {
        myScore = dynamicInputs.myScoreInput.value ?
        `${dynamicInputs.myScoreInput.value}%` : '';
    } else {
        myScore = myType;
    }

    // 3. 募集内部値 [REQ] の処理
    let reqScore;
    const reqTypeElement = document.querySelector('input[name="reqScoreType"]:checked');
    const reqType = reqTypeElement ? reqTypeElement.value : 'percent';
    if (reqType === 'percent') {
        const condition = dynamicInputs.reqScoreCondition.value;
        reqScore = dynamicInputs.reqScoreInput.value ? `${dynamicInputs.reqScoreInput.value}%${condition}` : '';
    } else {
        reqScore = reqType;
    }

    // 4. ベテラン接頭辞 [VETERAN] の処理
    const veteranPrefix = dynamicInputs.veteran.checked ?
    'ベテラン ' : '';

    // 5. 支援/アンコ情報 [SUPPORT] の処理
    let supportText = '';
    const isSupport = dynamicInputs.supportCheck.checked;
    const isEncore = dynamicInputs.encoreCheck.checked;
    const scoreValue = dynamicInputs.supportScoreInput.value.trim().replace(/[^0-9]/g, '');
    const freeText = dynamicInputs.freeTextInput.value.trim();
    if (isSupport || isEncore) {
        let status = [];
        if (isSupport && isEncore) {
            status.push('支援、アンコいます');
        } else if (isSupport) {
            status.push('支援います');
        } else if (isEncore) {
            status.push('アンコいます');
        }

        let details = [];
        if (scoreValue) {
            details.push(`${scoreValue}%`);
        }
        if (freeText) {
            details.push(freeText);
        }

        if (details.length > 0) {
            supportText = `${status.join(' ')}(${details.join(' ')})`;
        } else {
            supportText = status.join(' ');
        }

        // 募集要項の後に空行を入れるため、改行文字を追加
        if (supportText) {
            supportText = `${supportText}\n`;
        }
    } 
    
    // 6. ルール選択の結果 [RULE] の結合
    let selectedRules = [];
    if (dynamicInputs.ruleSf && dynamicInputs.ruleSf.checked) selectedRules.push(dynamicInputs.ruleSf.value);
    if (dynamicInputs.ruleHikeshi && dynamicInputs.ruleHikeshi.checked) selectedRules.push(dynamicInputs.ruleHikeshi.value);
    if (dynamicInputs.ruleMiss && dynamicInputs.ruleMiss.checked) selectedRules.push(dynamicInputs.ruleMiss.value);
    if (dynamicInputs.ruleTime && dynamicInputs.ruleTime.checked) selectedRules.push(dynamicInputs.ruleTime.value);
    if (dynamicInputs.ruleNanido && dynamicInputs.ruleNanido.checked) selectedRules.push(dynamicInputs.ruleNanido.value);
    if (dynamicInputs.ruleMasterng && dynamicInputs.ruleMasterng.checked) selectedRules.push(dynamicInputs.ruleMasterng.value);
    if (dynamicInputs.ruleExng && dynamicInputs.ruleExng.checked) selectedRules.push(dynamicInputs.ruleExng.value);
    // 途中退室OK/NGはHTMLのラベルとvalueが逆転しているため、valueを上書きして使用
    if (dynamicInputs.ruleTaisitsung && dynamicInputs.ruleTaisitsung.checked) selectedRules.push('途中退室OK');
    if (dynamicInputs.ruleTaisitsuok && dynamicInputs.ruleTaisitsuok.checked) selectedRules.push('途中退室NG');

    if (dynamicInputs.ruleNonEfficiency && dynamicInputs.ruleNonEfficiency.checked) selectedRules.push(dynamicInputs.ruleNonEfficiency.value);
    if (dynamicInputs.ruleMv && dynamicInputs.ruleMv.checked) selectedRules.push(dynamicInputs.ruleMv.value);
    if (dynamicInputs.ruleOtsusaki && dynamicInputs.ruleOtsusaki.checked) selectedRules.push(dynamicInputs.ruleOtsusaki.value);
    if (dynamicInputs.ruleStamp && dynamicInputs.ruleStamp.checked) selectedRules.push(dynamicInputs.ruleStamp.value);
    if (dynamicInputs.ruleKaisan && dynamicInputs.ruleKaisan.checked) selectedRules.push(dynamicInputs.ruleKaisan.value);
    if (dynamicInputs.ruleSoku && dynamicInputs.ruleSoku.checked) selectedRules.push(dynamicInputs.ruleSoku.value);
    if (dynamicInputs.ruleWait && dynamicInputs.ruleWait.checked) selectedRules.push(dynamicInputs.ruleWait.value);

    let formattedRules = [];
    for (let i = 0; i < selectedRules.length; i += 2) {
        if (i + 1 < selectedRules.length) {
            // ペアになるルールがある場合、コンマで連結
            formattedRules.push(selectedRules[i] + ', ' + selectedRules[i+1]);
        } else {
            // 最後のルールが1つだけ余った場合、そのまま追加
            formattedRules.push(selectedRules[i]);
        }
    }
    // 各ペア（または単独のルール）を改行で結合
    selectedRules = formattedRules.join('\n');

    // 7. 回数/時間の処理
    let countValue = '';
    const countTypeElement = document.querySelector('input[name="countType"]:checked');
    const countType = countTypeElement ? countTypeElement.value : 'count';
    if (countType === 'count') {
        countValue = dynamicInputs.count.value ?
        `${dynamicInputs.count.value}回` : '';
    } else if (countType === 'time') {
        countValue = dynamicInputs.timeInput.value ?
        dynamicInputs.timeInput.value : '';
    }

    // 8. データマップの作成
    const dataMap = {
        '[ACTION]': loopType,
        // 部屋番号は5桁に整形
        '[ROOM]': dynamicInputs.roomNumber.value.replace(/[^0-9]/g, '').slice(0, 5).padStart(5, '0'),
        '[SLOTS]': dynamicInputs.slots.value ?
        dynamicInputs.slots.value : '',
        '[COUNT]': countValue,
        '[MY]': myScore,
        '[REQ]': reqScore,
        '[SUPPORT]': supportText, 
        '[RULE]': selectedRules,
    };

    let generatedText = structure;
    
    // プレースホルダーを置換
    for (const [placeholder, value] of Object.entries(dataMap)) {
        generatedText = generatedText.replace(new RegExp(placeholder.replace(/[\[\]]/g, '\\$&'), 'g'), value);
    }

    // [VETERAN] 専用の置換処理
    generatedText = generatedText.replace(/\[VETERAN\]/g, veteranPrefix);
    // 完全に空になった行や、ベテランの後にできた余計なスペースを削除して整形
    generatedText = generatedText.replace(/\[\w+\]/g, '');
    generatedText = generatedText.trim();
    
    if (outputTextarea) {
        outputTextarea.value = generatedText;
    }

    const templateViewer = document.getElementById('templateViewer');
    if (templateViewer) {
        templateViewer.textContent = `現在の固定構造:\n${structure}`;
    }

    // 文字数カウントと制限チェック (140文字)
    const count = generatedText.length;
    if (charCount) {
        charCount.textContent = `${count} / 140 文字`;
        if (count > 140) {
            charCount.classList.remove('text-gray-600', 'text-green-600');
            charCount.classList.add('text-red-600');
            if (copyButton) {
                copyButton.disabled = true;
                copyButton.classList.remove('btn-primary');
                copyButton.classList.add('bg-red-400', 'cursor-not-allowed');
            }
            if (tweetButton) {
                tweetButton.href = '#';
                tweetButton.classList.add('cursor-not-allowed', 'bg-gray-400');
                tweetButton.style.backgroundColor = '#9ca3af'; // グレーアウト
            }
        } else {
            charCount.classList.remove('text-red-600', 'text-gray-600');
            charCount.classList.add(count > 0 ? 'text-green-600' : 'text-gray-600');
            if (copyButton) {
                copyButton.disabled = false;
                copyButton.classList.add('btn-primary');
                copyButton.classList.remove('bg-red-400', 'cursor-not-allowed');
            }
            if (tweetButton) {
                const encodedText = encodeURIComponent(generatedText);
                tweetButton.href = `https://twitter.com/intent/tweet?text=${encodedText}`;
                tweetButton.classList.remove('cursor-not-allowed', 'bg-gray-400');
                tweetButton.style.backgroundColor = '#1DA1F2'; // Xのブランドカラー
            }
        }
    }
}

// クリップボードにコピー
function copyToClipboard() {
    const outputTextarea = document.getElementById('outputTextarea');
    const copyButton = document.getElementById('copyButton');
    
    if (!outputTextarea || outputTextarea.value.length === 0 || outputTextarea.value.length > 140) return;
    try {
        outputTextarea.select();
        document.execCommand('copy');
        if (copyButton) {
            copyButton.textContent = 'コピー完了！ 🎉';
            setTimeout(() => {
                copyButton.textContent = '生成した文章をコピー (140字以内)';
            }, 1500);
        }
    } catch (err) {
        console.error('コピーに失敗しました', err);
    }
}

// （未使用の関数を定義）
function initializePlaceholderList() {
    // プレースホルダーリストの初期化処理（必要に応じて実装）
}

window.insertPlaceholder = (placeholder) => {
   // プレースホルダー挿入処理（必要に応じて実装）
};
// イベントリスナーの設定
window.onload = () => {
    // DOM要素を初期化
    initializeDOMElements();
    // ローディングオーバーレイを非表示
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
    
    // ユーザーIDを表示
    const userIdDisplay = document.getElementById('userIdDisplay');
    if (userIdDisplay) {
        userIdDisplay.textContent = 'ユーザーID: (ローカル動作)';
    }
    
    // 全ての入力フィールドとチェックボックスにリスナーを登録
    const allInputs = document.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
        if (input.id !== 'outputTextarea') { 
            if (input.type === 'checkbox' || input.type === 'radio' || input.tagName === 'SELECT') {
                input.addEventListener('change', updateOutput);
            } else {
                input.addEventListener('input', updateOutput);
            }
        }
    });

    // 部屋番号は5桁に制限
    if (dynamicInputs.roomNumber) {
        dynamicInputs.roomNumber.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
            updateOutput();
        });
    }

    // 募集人数は1〜4に制限
    if (dynamicInputs.slots) {
        dynamicInputs.slots.addEventListener('input', (e) => {
            let valStr = e.target.value.trim();
            
            if (valStr === '') {
                updateOutput();
                return; 
            }
          
            let val = parseInt(valStr);
            
            if (isNaN(val) || val < 1) val = 1;
            if (val > 4) val = 4;
            
            e.target.value = val;
            updateOutput();
        });
    }

    // 周回タイプが選択されたらカスタム入力をクリア
    if (dynamicInputs.loopTypeSelect) {
        dynamicInputs.loopTypeSelect.addEventListener('change', () => {
            if (dynamicInputs.loopTypeCustom) {
                dynamicInputs.loopTypeCustom.value = '';
            }
            updateOutput();
        });
    }

    // カスタム入力があれば周回タイプ選択をリセット
    if (dynamicInputs.loopTypeCustom) {
        dynamicInputs.loopTypeCustom.addEventListener('input', () => {
            if (dynamicInputs.loopTypeSelect) {
                dynamicInputs.loopTypeSelect.value = '';
            }
            updateOutput();
        });
    }

    // 回数/時間選択の切り替えロジック
    const countFields = document.querySelectorAll('.count-field');
    const countRadios = document.querySelectorAll('input[name="countType"]');

    const toggleCountInput = () => {
        const selectedTypeElement = document.querySelector('input[name="countType"]:checked');
        if (!selectedTypeElement) return;
        
        const selectedType = selectedTypeElement.value;
        countFields.forEach(field => field.style.display = 'none');
        if (selectedType === 'count' && dynamicInputs.count) {
            dynamicInputs.count.style.display = 'block';
        } else if (selectedType === 'time' && dynamicInputs.timeInput) {
            dynamicInputs.timeInput.style.display = 'block';
        }
        updateOutput();
    };
    countRadios.forEach(radio => {
        radio.addEventListener('change', toggleCountInput);
    });
    // 時間入力フィールドにもリスナーを追加
    if (dynamicInputs.timeInput) {
        dynamicInputs.timeInput.addEventListener('input', updateOutput);
    }

    // 初期表示で一度実行
    toggleCountInput();
    // コピーボタンのイベントリスナー
    const copyButton = document.getElementById('copyButton');
    if (copyButton) {
        copyButton.addEventListener('click', copyToClipboard);
    }

    // 初期表示
    initializePlaceholderList();
    updateOutput();
};
