const fileElem = document.getElementById('fileInput');
const quizImageElem = document.getElementById('quizImage');
const quizNoImageElem = document.getElementById('quizNoImage');
const changeQuizButtonElem = document.getElementById('changeQuizButton');
const resetAlreadyButtonElem = document.getElementById('resetAlreadyButton');
const imagesAreaElem = document.getElementById('imagesArea');
const closeButtonElem = document.getElementById('closeButton');
const dialogElem = document.getElementById('dialog');
const menuButtonElem = document.getElementById('menuButton');
const notShowAlreadyElem = document.getElementById('notShowAlready');
const moveHeaderToBottomElem = document.getElementById('moveHeaderToBottom');
const headerElem = document.getElementById('header');
const headerSpaceElem = document.getElementById('headerSpace');
const showExperimentalElem = document.getElementById('showExperimental');
const experimentalZoneElem = document.getElementById('experimentalZone');
const useLocalStorageElem = document.getElementById('useLocalStorage');
const miniDialogElem = document.getElementById('miniDialog');
const miniDialogImageElem = document.getElementById('miniDialogImage');
const miniDialogDeleteElem = document.getElementById('miniDialogDelete');
const miniDialogCancelElem = document.getElementById('miniDialogCancel')
const deleteAllImageButtonElem = document.getElementById('deleteAllImageButton');
const colorRangeElem = document.getElementById('colorRange');
const themeSelectElem = document.getElementById('themeSelect');

const beginBarButtonElem = document.getElementById('beginBarButton');
const endBarButtonElem = document.getElementById('endBarButton');
const saveButtonElem = document.getElementById('saveButton');
const loadButtonElem = document.getElementById('loadButton');

beginBarButtonElem.onclick = toggleShowAll;
endBarButtonElem.onclick = toggleShowAll;
changeQuizButtonElem.onclick = changeQuiz;
colorRangeElem.oninput = refreshColorTheme;
themeSelectElem.onchange = refreshColorTheme;

// Local Storage が有効である場合、Local Storage からデータの復元を試みる
window.onload = (e) => {
    notShowAlreadyElem.checked = localStorage.getItem('quiz-maker_notShowAlready') == 'true';
    moveHeaderToBottomElem.checked = localStorage.getItem('quiz-maker_moveHeaderToBottom') == 'true';
    colorRangeElem.value = Number(localStorage.getItem('quiz-maker_colorRange') ?? 0);
    themeSelectElem.value = localStorage.getItem('quiz-maker_themeSelect') ?? 'default';
    refreshColorTheme();
    moveHeader();


    // LocalStorage が有効か確認し、有効の場合設定の実験的な機能も有効に
    if(localStorage.getItem('quiz-maker_enabled') === 'true') {
        showExperimentalElem.checked = true;
        experimentalZoneElem.classList.remove('hidden');
        useLocalStorageElem.checked = true;
    }

    if(localStorage.getItem('quiz-maker_enabled') === 'true') {
        let json = localStorage.getItem('quiz-maker_data');

        const errorMessage = (errorCode = 'UNKNOWN') => {return 'Local Storage を正しく読み込めませんでした。\r\nこのメッセージが毎回表示される場合、Local Storage をオフにしてください。\r\nErrorCode: ' + errorCode};

        try {
            let data = JSON.parse(json);
            // データ破損チェック
            if(!data) {errorMessage('NULL_OR_EMPTY_DATA'); return;}
            if(!Array.isArray(data)) {errorMessage('NOT_ARRAY_DATA'); return;}
            data.forEach((elem) => {
                if(!Array.isArray(elem)) {errorMessage('NOT_TWO_DIMENTIONAL_ARRAY_DATA'); return;}
                if(elem.length != 2) {errorMessage('INVALID_ARRAY_LENGTH'); return;}
                if(typeof elem[0] != 'string') {errorMessage('INVALID_IMAGE_DATA_TYPE'); return;}
                if(elem[0].slice(0,11)) {errorMessage('INVALID_IMAGE_DATA_URL'); return;}
                if(typeof elem[1] != 'boolean') {errorMessage('TYPE_NOT_BOOLEAN'); return;}
            });
            quizzes = data.map((elem) => {
                var binary = atob(elem[0].replace(/^.*,/, ''));
                var buffer = new Uint8Array(binary.length);
                for (var i = 0; i < binary.length; i++) {
                    buffer[i] = binary.charCodeAt(i);
                }
                let file = new File([buffer.buffer], String(Date.now()) + Math.random() + '.png', {type: "image/png"});
                return [URL.createObjectURL(file), elem[1], file];
            });
        } catch {
            alert(errorMessage('JSON_PARSE_FAILED'));
        }

        createImageGrid();
    }
}

// Quizzes のデータ型
// Index1: 画像のBlobURL String型 
// Index2: 出題済みか Boolean型
// Index3: 画像ファイル File型
let quizzes = [];
let showAll = false;

// saveData のデータ型
// Index1: Base64形式の画像ファイル String型
// index2: 出題済みか Boolean型
let saveData = [];

menuButtonElem.onclick = (e) => {
    dialogElem.classList.toggle('invisible');
    createImageGrid();
}

closeButtonElem.onclick = (e) => {
    dialogElem.classList.toggle('invisible');
}

dialogElem.onclick = (e) => {
   if(e.target == dialogElem) dialogElem.classList.toggle('invisible');
}

fileElem.onchange = (e) => {
    let files = [...fileElem.files];

    quizzes.forEach((quiz) => {
        URL.revokeObjectURL(quiz[0]);
    });

    if(files.length === 0) {
        alert('少なくとも一件画像ファイルを指定してください。');
        quizzes = [];
        createImageGrid();
        return;
    }

    oldFiles = files;
    
    files = files.filter(file => {
        return /image\/.+/.test(file.type);
    });

    if(files.length === 0) {
        alert('指定されたファイルは全て画像ファイルではありませんでした。\r\n画像ファイルを指定してください。')
        quizzes = [];
        return;
    }

    if(files.length != oldFiles.length) {
        alert(`画像以外のファイルが${oldFiles.length - files.length}件含まれていたため除外しました。`);
    }

    if(quizzes.length != 0) {
        const text = '既に読み込んである画像があります。\r\nこれらの画像を保持したまま今回選択した画像を追加しますか?';
        if(!confirm(text)) {
            quizzes = [];
        }
    }

    quizzes = quizzes.concat(files.map((file, index) => {
        return [URL.createObjectURL(file), false, files[index]];
    }));

    createImageGrid();

    saveToLocalStorage();

    fileElem.value = '';
}

deleteAllImageButtonElem.onclick = (e) => {
    const text = '画像を全て削除します。\r\nこの操作は取り消せません。\r\nよろしいですか?'
    if(confirm(text)) {
        quizzes.forEach((quiz) => {
            URL.revokeObjectURL(quiz[0]);
        });
        quizzes = [];
        createImageGrid();
    }
}

notShowAlreadyElem.onchange = (e) => {
    localStorage.setItem('quiz-maker_notShowAlready', String(notShowAlreadyElem.checked));
}

resetAlreadyButtonElem.onclick = (e) => {
    const confirmText = '出題済をリセットし、既に表示した画像がまた表示されるようになります。\r\nこの操作は取り消せません。\r\n本当にリセットしますか?';
    if(confirm(confirmText)) {
        quizzes = quizzes.map((quiz) => {
            return [quiz[0], false, quiz[2]];
        });
        createImageGrid();

        saveToLocalStorage();
    }
}

saveButtonElem.onclick = async (e) => {
    let convertBlobUrlToBase64 = async (blobUrl) => {
        let reader = new FileReader();
        reader.readAsDataURL(blobUrl);
        let result = await new Promise((resolve) => {
            reader.onload = () => {
                resolve(reader.result);
            }
        });
        return result;
    }
    
    let saveData = await Promise.all(quizzes.map(async (quiz) => {
        return [await convertBlobUrlToBase64(quiz[2]), quiz[1]];
    }));
    
    let json = JSON.stringify(saveData);

    let blob = new Blob([json], { type: 'text/plain' });
    let blobUrl = window.URL.createObjectURL(blob);
    let link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'QuizData.txt';
    link.click();

    URL.revokeObjectURL(blobUrl);
}

loadButtonElem.onchange = (e) => {
    let file = [...loadButtonElem.files][0];
    
    const errorMessage = (errorCode = 'UNKNOWN') => {return 'ファイル正しく読み込めませんでした。\r\n正しいファイルが指定されているか確認してください。\r\nErrorCode: ' + errorCode};

    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
        let json = reader.result;
        try {
            let data = JSON.parse(json);
            // データ破損チェック
            if(!data) {errorMessage('NULL_OR_EMPTY_DATA'); return;}
            if(!Array.isArray(data)) {errorMessage('NOT_ARRAY_DATA'); return;}
            data.forEach((elem) => {
                if(!Array.isArray(elem)) {errorMessage('NOT_TWO_DIMENTIONAL_ARRAY_DATA'); return;}
                if(elem.length != 2) {errorMessage('INVALID_ARRAY_LENGTH'); return;}
                if(typeof elem[0] != 'string') {errorMessage('INVALID_IMAGE_DATA_TYPE'); return;}
                if(elem[0].slice(0,11)) {errorMessage('INVALID_IMAGE_DATA_URL'); return;}
                if(typeof elem[1] != 'boolean') {errorMessage('TYPE_NOT_BOOLEAN'); return;}
            });
            quizzes = data.map((elem) => {
                var binary = atob(elem[0].replace(/^.*,/, ''));
                var buffer = new Uint8Array(binary.length);
                for (var i = 0; i < binary.length; i++) {
                    buffer[i] = binary.charCodeAt(i);
                }
                let file = new File([buffer.buffer], String(Date.now()) + Math.random() + '.png', {type: "image/png"});
                return [URL.createObjectURL(file), elem[1], file];
            });
        } catch {
            alert(errorMessage('JSON_PARSE_FAILED'));
        }

        createImageGrid();

        loadButtonElem.value = '';
    }
}

moveHeaderToBottomElem.onchange = (e)=> {
    localStorage.setItem('quiz-maker_moveHeaderToBottom', String(moveHeaderToBottomElem.checked));
    moveHeader();
}

showExperimentalElem.onchange = (e) => {
    if(showExperimentalElem.checked) {
        const warningMessage = 'この機能は実験的な機能であり、正確に動作する保証はありません。\r\n本当に有効にしますか?';
        showExperimentalElem.checked = confirm(warningMessage);
    }
    if(showExperimentalElem.checked) {
        experimentalZoneElem.classList.remove('hidden');
    } else {
        experimentalZoneElem.classList.add('hidden');
        useLocalStorageElem.checked = false;
        localStorage.setItem('quiz-maker_enabled','false');
    }
}

useLocalStorageElem.onchange = (e) => {
    if(useLocalStorage.checked) {
        const warningMessage = 'Local Storage のデータは確認なしに自動で消える可能性があります。\r\nデータを失いたくない場合、手動のデータのセーブ機能を使用してください。\r\n本当に有効にしますか?';
        useLocalStorage.checked = confirm(warningMessage);
    }
    if(useLocalStorage.checked) {
        localStorage.setItem('quiz-maker_enabled','true');
        saveToLocalStorage();
    } else {
        localStorage.setItem('quiz-maker_enabled','false');
    }
}

function changeQuiz() {
    excludeAlready = notShowAlreadyElem.checked;
    let quizSelection = excludeAlready ? quizzes.filter((quiz) => {return !quiz[1]}) : quizzes;
    if(quizSelection.length == 0) {
        alert('出題するクイズがありません');
        return;
    }
    let index = random(0,quizSelection.length - 1);
    quizSelection[index][1] = true;
    let blobUrl = quizSelection[index][0];
    quizImageElem.style.backgroundImage =  `url(${blobUrl})`;

    quizNoImageElem.remove();

    saveToLocalStorage();
}

function createImageGrid() {
    // 何行までなら省略せずに表示するか
    const defaultRow = 2;

    // 横方向にいくつ並ぶか
    const gridColumn = Math.floor(imagesAreaElem.clientWidth / 100) < 1 ? 1 : Math.floor(imagesAreaElem.clientWidth / 100);

    // Border の色
    const borderColor = 'var(--second-color)';

    // Border の太さ
    const borderSize = '2px';

    if(quizzes.length > gridColumn * defaultRow) {
        beginBarButtonElem.classList.remove('hidden');
        endBarButtonElem.classList.remove('hidden');
    } else {
        beginBarButtonElem.classList.add('hidden');
        endBarButtonElem.classList.add('hidden');
    }
    
    beginBarButtonElem.innerText = showAll ? '一部のみ表示' : 'すべて表示';
    endBarButtonElem.innerText = showAll ? '一部のみ表示' : 'すべて表示';

    let filteredQuizzes = showAll ? quizzes : quizzes.slice(0,gridColumn * defaultRow);

    // セル1つの横幅
    let gridWidth = imagesAreaElem.clientWidth / gridColumn;

    // Grid の親要素(コンテナ)
    let gridContainer = document.createElement('div');
    gridContainer.style.display = 'grid';
    gridContainer.style.width = '100%';
    gridContainer.style.gridAutoFlow = 'column';
    gridContainer.style.grid = `${gridWidth}px `.repeat(Math.ceil(filteredQuizzes.length / gridColumn)) + '/' + ` ${gridWidth}px`.repeat(gridColumn);

    let gridCells = [];
    filteredQuizzes.forEach((quiz, index) => {
        let cell = document.createElement('div');
        cell.style.background = `url(${quiz[0]})`;
        cell.style.backgroundSize = 'cover';
        cell.style.backgroundPosition = 'center';
        cell.style.borderTop = (index + 1) <= gridColumn ? borderSize : '0';
        cell.style.borderLeft = (index + gridColumn) % gridColumn == 0 ? borderSize : '0';
        cell.style.borderRight = borderSize;
        cell.style.borderBottom = borderSize;
        cell.style.borderColor = borderColor;
        cell.style.borderStyle = 'solid';
        cell.dataset.blobUrl = quiz[0];
        cell.onclick = (e) => {
            openMiniDialog(e.target.dataset.blobUrl);
        }
        gridContainer.appendChild(cell);

        let already = document.createElement('div');
        already.style.background = borderColor;
        already.style.width = 'max-content';
        already.innerText = '出題済';
        if(quiz[1]) cell.appendChild(already);
    });
    
    imagesAreaElem.innerHTML = '';
    imagesAreaElem.appendChild(gridContainer);
}

function toggleShowAll() {
    showAll = !showAll;
    createImageGrid();
}

function refreshColorTheme() {
    let degree = colorRangeElem.value;
    localStorage.setItem('quiz-maker_colorRange', String(degree));
    
    let theme = themeSelectElem.value;
    localStorage.setItem('quiz-maker_themeSelect', theme);
    
    if(theme == 'light' || (theme == 'default' && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        // ライトテーマ
        document.querySelector(':root').style.setProperty('--background', 'white');
        document.querySelector(':root').style.setProperty('--foreground', 'black');
        document.querySelector(':root').style.setProperty('--accent-foreground', 'white');
        document.querySelector(':root').style.setProperty('--first-color',`hsl(${degree}deg, 100%, 20%)`);
        document.querySelector(':root').style.setProperty('--second-color',`hsl(${degree}deg, 100%, 30%)`);
    } else if(theme == 'dark' || (theme == 'default' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        // ダークテーマ
        document.querySelector(':root').style.setProperty('--background', '#1f1f1f');
        document.querySelector(':root').style.setProperty('--foreground', 'white');
        document.querySelector(':root').style.setProperty('--accent-foreground', 'white');
        document.querySelector(':root').style.setProperty('--first-color',`hsl(${degree}deg, 100%, 20%)`);
        document.querySelector(':root').style.setProperty('--second-color',`hsl(${degree}deg, 100%, 30%)`);
    } else if(theme == 'lightRainbow') {
        // ライトレインボーテーマ
        document.querySelector(':root').style.setProperty('--background', 'white');
        document.querySelector(':root').style.setProperty('--foreground', 'black');
        document.querySelector(':root').style.setProperty('--accent-foreground', 'white');
        document.querySelector(':root').style.setProperty('--first-color',`#808080`);
        document.querySelector(':root').style.setProperty('--second-color',`linear-gradient(270deg, hsl(${Number(degree) + 180}deg, 100%, 30%), hsl(${Number(degree) + 290}deg, 100%, 30%))`);
    } else if(theme == 'darkRainbow') {
        // ダークレインボーテーマ
        document.querySelector(':root').style.setProperty('--background', '#1f1f1f');
        document.querySelector(':root').style.setProperty('--foreground', 'white');
        document.querySelector(':root').style.setProperty('--accent-foreground', 'white');
        document.querySelector(':root').style.setProperty('--first-color',`#303030`);
        document.querySelector(':root').style.setProperty('--second-color',`linear-gradient(270deg, hsl(${Number(degree) + 180}deg, 100%, 30%), hsl(${Number(degree) + 290}deg, 100%, 30%))`);
    } else {
        // テーマの設定が「端末の設定に従う」かつ、matchMeadia が機能しなかった場合、ダークテーマに
        document.querySelector(':root').style.setProperty('--background', '#1f1f1f');
        document.querySelector(':root').style.setProperty('--foreground', 'white');
        document.querySelector(':root').style.setProperty('--accent-foreground', 'white');
        document.querySelector(':root').style.setProperty('--first-color',`hsl(${degree}deg, 100%, 20%)`);
        document.querySelector(':root').style.setProperty('--second-color',`hsl(${degree}deg, 100%, 30%)`);
    }
}

function moveHeader() {
    if(moveHeaderToBottom.checked) {
        headerElem.classList.remove('header-top');
        headerElem.classList.add('header-bottom');
        headerSpaceElem.classList.add('hidden');
    } else {
        headerElem.classList.add('header-top');
        headerElem.classList.remove('header-bottom');
        headerSpaceElem.classList.remove('hidden');
    }
}

async function saveToLocalStorage() {
    if(localStorage.getItem('quiz-maker_enabled') == 'true') {
        let convertBlobUrlToBase64 = async (blobUrl) => {
            let reader = new FileReader();
            reader.readAsDataURL(blobUrl);
            let result = await new Promise((resolve) => {
                reader.onload = () => {
                    resolve(reader.result);
                }
            });
            return result;
        }
        
        let saveData = await Promise.all(quizzes.map(async (quiz) => {
            return [await convertBlobUrlToBase64(quiz[2]), quiz[1]];
        }));
        
        let json = JSON.stringify(saveData);

        localStorage.setItem('quiz-maker_data', json);
    }
}

function openMiniDialog(blobUrl) {
    miniDialogImageElem.src = blobUrl;
    miniDialogElem.classList.remove('invisible');
    miniDialogDeleteElem.onclick = (e) => {
        quizzes = quizzes.filter((quiz) => {
            return quiz[0] != blobUrl;
        });
        URL.revokeObjectURL(blobUrl);
        createImageGrid();
        miniDialogElem.classList.add('invisible');
    }
    miniDialogCancelElem.onclick = (e) => {
        miniDialogElem.classList.add('invisible');
    }
}

function random(min, max) {
    if(min > max) throw new Error('最小値は最大値より小さくしてください');
    let range = max - min + 1;
    return Math.floor(Math.random() * range + min);
}