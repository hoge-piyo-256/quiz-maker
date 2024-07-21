const fileElem = document.getElementById('fileInput');
const quizImageElem = document.getElementById('quizImage');
const changeQuizButton = document.getElementById('changeQuizButton');

changeQuizButton.onclick = changeQuiz;

// Quizzes のデータ型
// Index1: 画像ファイル File型 
// Index2: 出題済みか   Boolean型
let quizzes = [];

fileElem.onchange = (e) => {
    let files = [...fileElem.files];

    if(files.length === 0) {
        alert('少なくとも一件画像ファイルを指定してください。');
    }

    oldFiles = files;
    
    files = files.filter(file => {
        return /image\/.+/.test(file.type);
    });

    if(files.length === 0) {
        alert('指定されたファイルは全て画像ファイルではありませんでした。\r\n画像ファイルを指定してください。')
    }

    if(files.length != oldFiles.length) {
        alert(`画像以外のファイルが${oldFiles.length - files.length}件含まれていたため除外しました。`);
    }

    quizzes = files.map((file) => {
        return [file, false];
    });
}

function changeQuiz(excludeAlready = false) {
    let quizSelection = excludeAlready ? quizzes.filter((quiz) => {return !quiz[1]}) : quiz;
    if(quizSelection.length == 0) {
        alert('出題するクイズがありません');
        return;
    }
    let blobUrl = URL.createObjectURL(quizSelection[random(0,quizSelection.length - 1)][0]);
    quizImageElem.src =  blobUrl;
}

function random(min, max) {
    if(min > max) throw new Error('最小値は最大値より小さくしてください');
    let range = max - min + 1;
    return Math.floor(Math.random() * range + min);
}