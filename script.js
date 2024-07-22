const fileElem = document.getElementById('fileInput');
const quizImageElem = document.getElementById('quizImage');
const changeQuizButtonElem = document.getElementById('changeQuizButton');
const resetAlreadyButtonElem = document.getElementById('resetAlreadyButton');
const imagesAreaElem = document.getElementById('imagesArea');
const closeButtonElem = document.getElementById('closeButton');
const dialogElem = document.getElementById('dialog');
const menuButtonElem = document.getElementById('menuButton');
const notShowAlreadyElem = document.getElementById('notShowAlready');

const beginBarButtonElem = document.getElementById('beginBarButton');
const endBarButtonElem = document.getElementById('endBarButton');

beginBarButtonElem.onclick = toggleShowAll;
endBarButtonElem.onclick = toggleShowAll;
changeQuizButtonElem.onclick = changeQuiz;

// Quizzes のデータ型
// Index1: 画像のBlobURL String型 
// Index2: 出題済みか Boolean型
let quizzes = [];
let showAll = false;

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

    quizzes = files.map((file) => {
        return [URL.createObjectURL(file), false];
    });

    createImageGrid();
}

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

resetAlreadyButtonElem.onclick = (e) => {
    const confirmText = '出題済をリセットし、既に表示した画像がまた表示されるようになります。\r\nこの操作は取り消せません。\r\n本当にリセットしますか?';
    if(confirm(confirmText)) {
        quizzes = quizzes.map((quiz) => {
            return [quiz[0], false];
        });
        createImageGrid();
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
    quizSelection[index][1] = true;;
    let blobUrl = quizSelection[index][0];
    quizImageElem.src =  blobUrl;
}

function createImageGrid() {
    // 横方向にいくつ並ぶか
    const gridColumn = 3;

    // Border の色
    const borderColor = 'var(--var-second-color)';

    // Border の太さ
    const borderSize = '2px';

    if(quizzes.length > 9) {
        beginBarButtonElem.classList.remove('hidden');
        endBarButtonElem.classList.remove('hidden');
    } else {
        beginBarButtonElem.classList.add('hidden');
        endBarButtonElem.classList.add('hidden');
    }
    
    beginBarButtonElem.innerText = showAll ? '一部のみ表示' : 'すべて表示';
    endBarButtonElem.innerText = showAll ? '一部のみ表示' : 'すべて表示';

    let filteredQuizzes = showAll ? quizzes : quizzes.slice(0,9);

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
        gridContainer.appendChild(cell);

        let already = document.createElement('div');
        already.style.background = borderColor;
        already.style.width = 'max-content';
        already.innerText = '出題済';
        if(quiz[1]) cell.appendChild(already);
    })
    
    imagesAreaElem.innerHTML = '';
    imagesAreaElem.appendChild(gridContainer);
}

function toggleShowAll() {
    showAll = !showAll;
    createImageGrid();
}

function random(min, max) {
    if(min > max) throw new Error('最小値は最大値より小さくしてください');
    let range = max - min + 1;
    return Math.floor(Math.random() * range + min);
}
