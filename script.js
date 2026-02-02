let songs = [];
let filteredSongs = [];
let currentSongIndex = null;
let currentCoverIndex = null;

let currentPage = 1;
let totalPages = 1;
const rowsPerPage = 8;

document.getElementById('addSong').addEventListener('click', addSong);
document.getElementById('download').addEventListener('click', downloadJSON);
document.getElementById('jsonFile').addEventListener('input', (event) => {uploadJSON(event)});
document.getElementById('filterInput').addEventListener('keyup', (event) => {if (event.key === 'Enter') {filterSongs(1);saveToLocalStorage();}});
document.getElementById('prevPage').addEventListener('click', prevPage);
document.getElementById('nextPage').addEventListener('click', nextPage);
document.getElementById('pageIndicator').addEventListener('keyup', (event) => {
    if (event.target && event.target.id === 'pageInput') {
        inputPage(event);
    }
});
document.getElementById('addCover').addEventListener('click', addCover);

// 초기화 시 로드
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    filterSongs(currentPage);
    document.getElementById('titleEN').focus();
});

// 데이터 저장 함수
function saveToLocalStorage() {
    localStorage.setItem('songs', JSON.stringify(songs));
    localStorage.setItem('filterInput', document.getElementById('filterInput').value);
    localStorage.setItem('currentPage', currentPage);
}

// 데이터 로드 함수
function loadFromLocalStorage() {
    const savedSongs = localStorage.getItem('songs');
    const savedFilterInput = localStorage.getItem('filterInput');
    const savedCurrentPage = localStorage.getItem('currentPage');

    if (savedSongs) {
        songs = JSON.parse(savedSongs);
    }

    if (savedFilterInput) {
        document.getElementById('filterInput').value = savedFilterInput;
    }

    if (savedCurrentPage) {
        currentPage = parseInt(savedCurrentPage, 10);
    }
}

function addSong() {
    let rank = document.getElementById('rank').value;
    let titleEN = document.getElementById('titleEN').value.trim();
    let titleJP = document.getElementById('titleJP').value.trim();
    let titleKR = document.getElementById('titleKR').value.trim();
    let artist = document.getElementById('artist').value.trim();
    let producer = document.getElementById('producer').value.trim();
    let media = document.getElementById('media').value.trim();
    let genre = document.getElementById('genre').value.trim();
    let youtubeLink = document.getElementById('youtubeLink').value.trim();

    // 중복 확인 (제목이 비어 있지 않은 경우만 확인)
    const isDuplicate = songs.some(song => {
        return (
            (titleEN && song.titleEN.trim() === titleEN) ||
            (titleJP && song.titleJP.trim() === titleJP) ||
            (titleKR && song.titleKR.trim() === titleKR)
        );
    });

    if (titleEN === '') {
        alert("영제를 입력해주세요.");
        return;
    }

    if (isDuplicate) {
        // 기존 필터 값을 저장
        const originalFilterText = document.getElementById('filterInput').value;
        const currentPageBackup = currentPage;

        // 새로운 필터 값 설정
        const filters = [];
        if (titleEN.trim()) filters.push(`titleEN:${titleEN}`);
        if (titleJP.trim()) filters.push(`titleJP:${titleJP}`);
        if (titleKR.trim()) filters.push(`titleKR:${titleKR}`);
        document.getElementById('filterInput').value = filters.join(' or ');

        // 필터 적용 후, 확인창을 비동기로 실행
        filterSongs(1); // 첫 페이지부터 중복 곡 표시
        setTimeout(() => {
            if (!confirm("입력하신 제목 중 하나가 이미 존재합니다. 그래도 추가하시겠습니까?")) {
                // 필터 복원
                document.getElementById('filterInput').value = originalFilterText;
                filterSongs(currentPageBackup);
                return;
            }

            // 중복 확인 후 필터 복원
            document.getElementById('filterInput').value = originalFilterText;
            filterSongs(currentPageBackup);
            addNewSong();
        }, 100); // 필터링이 적용될 시간을 약간 줌
    } else {
        addNewSong();
    }

    function addNewSong() {
        // 새 노래 데이터 추가
        const newSong = { rank, titleEN, titleJP, titleKR, artist, producer, media, genre, youtubeLink, covers: [] };
        songs.push(newSong);

        // 새 노래에 따른 페이지 이동
        totalPages = Math.ceil(filteredSongs.length / rowsPerPage);
        if (filteredSongs.length % rowsPerPage === 0) {
            filterSongs(totalPages + 1);
        } else {
            filterSongs(totalPages);
        }

        // 입력 필드 초기화
        document.getElementById('titleEN').value = '';
        document.getElementById('titleJP').value = '';
        document.getElementById('titleKR').value = '';
        document.getElementById('artist').value = '';
        document.getElementById('producer').value = '';
        document.getElementById('media').value = '';
        document.getElementById('genre').value = '';
        document.getElementById('youtubeLink').value = '';
        document.getElementById('titleEN').focus();

        saveToLocalStorage();
    }
}

// 테이블에 새 행 추가 함수
function addRowToTable(song) {
    const table = document.getElementById('songTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    // 데이터 셀 추가
    newRow.insertCell(0).innerText = song.rank;
    newRow.insertCell(1).innerText = song.titleEN;
    newRow.insertCell(2).innerText = song.titleJP;
    newRow.insertCell(3).innerText = song.titleKR;
    newRow.insertCell(4).innerText = song.artist;
    newRow.insertCell(5).innerText = song.producer;
    newRow.insertCell(6).innerText = song.media;
    newRow.insertCell(7).innerText = song.genre;

    // 링크 셀 추가
    const linkCell = newRow.insertCell(8);
    const linkElement = document.createElement('a');
    linkElement.href = song.youtubeLink;
    linkElement.target = '_blank';
    linkElement.innerText = song.youtubeLink;
    linkCell.appendChild(linkElement);

    // 액션 셀 추가
    const actionsCell = newRow.insertCell(9);
    actionsCell.classList.add('actions-cell');

    // Cover 보기 버튼
    const coverButton = document.createElement('button');
    coverButton.innerText = 'Cover 보기';
    coverButton.addEventListener('click', () => showCover(songs.indexOf(song)));
    actionsCell.appendChild(coverButton);

    // 수정 버튼
    const editButton = document.createElement('button');
    editButton.innerText = '수정';
    editButton.addEventListener('click', (event) => editSong(event, songs.indexOf(song)));
    actionsCell.appendChild(editButton);

    // 삭제 버튼
    const deleteButton = document.createElement('button');
    deleteButton.innerText = '삭제';
    deleteButton.addEventListener('click', () => deleteRow(songs.indexOf(song)));
    actionsCell.appendChild(deleteButton);
}

// 페이지별 데이터 표시 함수
function displayPage(page) {
    const tableBody = document.getElementById('songTable').getElementsByTagName('tbody')[0];
    totalPages = Math.ceil(filteredSongs.length / rowsPerPage) || 1;

    tableBody.innerHTML = ''; // 현재 테이블 초기화

    // 시작과 끝 인덱스를 계산하여 현재 페이지에 해당하는 데이터만 표시
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredSongs.slice(start, end);

    // 현재 페이지의 데이터를 테이블에 추가
    pageData.forEach(song => addRowToTable(song));

    document.getElementById('pageIndicator').innerHTML = `Page <input id="pageInput" type="number" value="${page}"> of ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage < 2;
    document.getElementById('nextPage').disabled = currentPage > totalPages-1;
}

//입력한 페이지로 이동
function inputPage(event) {
    const inputPage = parseInt(document.getElementById('pageInput').value, 10);
    totalPages = Math.ceil(filteredSongs.length / rowsPerPage);

    if (event.key === 'Enter' && inputPage % 1 ===0 && inputPage>0 && inputPage <totalPages+1) {
        currentPage = inputPage;
        displayPage(currentPage);
        saveToLocalStorage();
    }
}

// 이전 페이지로 이동
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayPage(currentPage);
        saveToLocalStorage();
    }
}

// 다음 페이지로 이동
function nextPage() {
    totalPages = Math.ceil(filteredSongs.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayPage(currentPage);
        saveToLocalStorage();
    }
}

// 필터 입력을 파싱하고 처리하는 헬퍼 함수
function parseFilterInput(filterInput) {
    const conditionPattern = /\(([^)]+)\)|([^()]+)/g;
    const conditions = [];
    let match;

    // 입력된 필터에서 조건을 찾아서 배열에 추가
    while ((match = conditionPattern.exec(filterInput)) !== null) {
        const condition = match[1] || match[2];
        conditions.push(condition.trim());
    }

    return conditions;
}

// 논리 연산(AND, OR)을 처리하는 헬퍼 함수
function applyLogicalOperations(conditions) {
    const processedConditions = [];

    conditions.forEach(cond => {
        // AND, OR 논리 연산자에 따라 조건을 분리
        let logic = 'AND'; // 기본값은 'AND'
        let conditionParts = cond.split(/\s+(AND|OR)\s+/i);
        
        // 각 조건을 논리 연산자에 따라 처리
        const conditionGroup = {
            operator: logic,
            subConditions: []
        };
        conditionParts.forEach((part, idx) => {
            if (idx % 2 === 0) {
                conditionGroup.subConditions.push(part.trim());
            } else {
                conditionGroup.operator = part.trim().toUpperCase();
            }
        });
        processedConditions.push(conditionGroup);
    });
    return processedConditions;
}

// 개별 조건을 노래에 대해 검사하는 함수
function checkCondition(song, field, value) {
    switch (field) {
        case 'rank': return song.rank && song.rank.toLowerCase() === value; // rank는 정확히 일치해야 함
        case 'titleen': return song.titleEN && song.titleEN.toLowerCase().includes(value);
        case 'titlejp': return song.titleJP && song.titleJP.toLowerCase().includes(value);
        case 'titlekr': return song.titleKR && song.titleKR.toLowerCase().includes(value);
        case 'artist': return song.artist && song.artist.toLowerCase().includes(value);
        case 'producer': return song.producer && song.producer.toLowerCase().includes(value);
        case 'media': return song.media && song.media.toLowerCase().includes(value);
        case 'genre': return song.genre && song.genre.toLowerCase().includes(value);
        case 'youtube': return song.youtubeLink && song.youtubeLink.toLowerCase().includes(value);
        default: return false;
    }
}

// 조건을 적용하여 노래가 조건을 만족하는지 평가하는 함수
function evaluateConditions(song, conditions) {
    return conditions.every(conditionGroup => {
        // 각 조건 그룹(AND, OR)에 따라 평가
        const subResults = conditionGroup.subConditions.map(subCondition => {
            const [field, value] = subCondition.split(':').map(str => str.trim().toLowerCase());
            return checkCondition(song, field, value); // 각 조건을 노래에 대해 확인
        });

        if (conditionGroup.operator === 'AND') {
            return subResults.every(result => result); // 모든 조건이 참이어야 참
        } else if (conditionGroup.operator === 'OR') {
            return subResults.some(result => result); // 하나라도 참이면 참
        }
        return true;
    });
}

// 메인 필터 함수
function filterSongs(page) {
    const filterInput = document.getElementById('filterInput').value;
    const filterConditions = parseFilterInput(filterInput); // 입력값을 조건으로 파싱
    const processedConditions = applyLogicalOperations(filterConditions); // 논리 연산 적용

    // 필터 조건에 맞는 노래를 필터링
    if (filterInput === "") {
        filteredSongs = songs.slice();
    } else {
        filteredSongs = songs.filter((song, index) => {
            try {
                return evaluateConditions(song, processedConditions); // 조건을 노래에 적용하여 필터링
            } catch (error) {
                console.error(`인덱스 ${index}에서 오류 발생:`, song);
                throw error; // 오류를 다시 던져서 원래의 에러 메시지를 출력
            }
        });
    }

    currentPage = page; // 필터링 후 첫 페이지로 초기화
    displayPage(currentPage); // 필터링된 결과를 화면에 표시
}

function deleteRow(songIndex) {
    if (confirm("노래가 삭제됩니다. 계속하시겠습니까?")) {
        // 필터링된 결과에서 삭제될 항목 찾기
        const filteredIndex = filteredSongs.indexOf(songs[songIndex]);

        // 실제 songs 배열에서 해당 인덱스의 항목 삭제
        if (filteredIndex > -1) {
            filteredSongs.splice(filteredIndex, 1); // 필터링된 배열에서 삭제
        }
        songs.splice(songIndex, 1); // 원본 배열에서 삭제
        totalPages = Math.ceil(filteredSongs.length / rowsPerPage);

        // 필터링된 페이지 다시 표시
        if (currentPage>totalPages) {
            currentPage--;
            displayPage(totalPages);
        } else {
            displayPage(currentPage);
        }
        saveToLocalStorage();
    }
}

function editSong(event, songIndex) {
    const button = event.target;

    // 필터링된 결과에서 수정할 항목 찾기
    const filteredIndex = filteredSongs.indexOf(songs[songIndex]);
    let song = filteredSongs[filteredIndex]

    if (button.innerText === '수정') {
        document.getElementById('rank').value = song.rank;
        document.getElementById('titleEN').value = song.titleEN;
        document.getElementById('titleJP').value = song.titleJP;
        document.getElementById('titleKR').value = song.titleKR;
        document.getElementById('artist').value = song.artist;
        document.getElementById('producer').value = song.producer;
        document.getElementById('media').value = song.media;
        document.getElementById('genre').value = song.genre;
        document.getElementById('youtubeLink').value = song.youtubeLink;

        document.getElementById('titleEN').focus();

        button.innerText = '저장';
    } else {
        songs[songIndex].rank = document.getElementById('rank').value;
        songs[songIndex].titleEN = document.getElementById('titleEN').value;
        songs[songIndex].titleJP = document.getElementById('titleJP').value;
        songs[songIndex].titleKR = document.getElementById('titleKR').value;
        songs[songIndex].artist = document.getElementById('artist').value;
        songs[songIndex].producer = document.getElementById('producer').value;
        songs[songIndex].media = document.getElementById('media').value;
        songs[songIndex].genre = document.getElementById('genre').value;
        songs[songIndex].youtubeLink = document.getElementById('youtubeLink').value;
        
        button.innerText = '수정';

        document.getElementById('titleEN').value = '';
        document.getElementById('titleJP').value = '';
        document.getElementById('titleKR').value = '';
        document.getElementById('artist').value = '';
        document.getElementById('producer').value = '';
        document.getElementById('media').value = '';
        document.getElementById('genre').value = '';
        document.getElementById('youtubeLink').value = '';

        filterSongs(currentPage);
        saveToLocalStorage();
    }
}

// 커버 아티스트 보기 모달
function showCover(index) {
    currentSongIndex = index;
    const song = songs[index];

    if (song.covers.length === 0) {
        document.getElementById('coverList').innerHTML = '<p>Cover 아티스트 정보가 없습니다.</p>';
        document.getElementById('coverModal').style.display = 'block';
    } else {
        document.getElementById('coverList').innerHTML = song.covers.map((cover, idx) => `
            <div class="cover-item">
                <span>Cover Artist: ${cover.artist} | YouTube Link: <a href="${cover.youtubeLink}" target="_blank">${cover.youtubeLink}</a></span>
                <div>
                    <button class="coverEditBtn" data-index="${index}" data-cover-index="${idx}">수정</button>
                    <button class="coverRemoveBtn" data-index="${index}" data-cover-index="${idx}">삭제</button>
                </div>
            </div>
        `).join('');
    
        // 모든 수정 버튼에 이벤트 리스너 추가
        const editButtons = document.getElementsByClassName('coverEditBtn');
        Array.from(editButtons).forEach((button) => {
            button.addEventListener('click', (event) => {
                const songIndex = event.target.getAttribute('data-index');
                const coverIndex = event.target.getAttribute('data-cover-index');
                editCover(event, parseInt(songIndex), parseInt(coverIndex));
            });
        });
    
        // 모든 삭제 버튼에 이벤트 리스너 추가
        const removeButtons = document.getElementsByClassName('coverRemoveBtn');
        Array.from(removeButtons).forEach((button) => {
            button.addEventListener('click', (event) => {
                const songIndex = event.target.getAttribute('data-index');
                const coverIndex = event.target.getAttribute('data-cover-index');
                removeCover(parseInt(songIndex), parseInt(coverIndex));
            });
        });
    }
    document.getElementById('coverArtistInput').focus();
    document.getElementById('coverModal').style.display = 'block';
}


// 커버 추가
function addCover() {
    const coverArtist = document.getElementById('coverArtistInput').value;
    const coverYoutubeLink = document.getElementById('coverYoutubeLinkInput').value;
    if (coverArtist && coverYoutubeLink) {
        const song = songs[currentSongIndex];
        song.covers.push({ artist: coverArtist, youtubeLink: coverYoutubeLink });
        showCover(currentSongIndex);
        document.getElementById('coverArtistInput').value = '';
        document.getElementById('coverYoutubeLinkInput').value = '';
        saveToLocalStorage();
    } else {
        alert("커버 아티스트와 유튜브 링크를 모두 입력해주세요.");
    }
}

function editCover(event, songIndex, coverIndex) {
    const cover = songs[songIndex].covers[coverIndex];
    const button = event.target;
    if (button.innerText === '수정') {
        document.getElementById('coverArtistInput').value = cover.artist;
        document.getElementById('coverYoutubeLinkInput').value = cover.youtubeLink;
        document.getElementById('coverArtistInput').focus();
        button.innerText = '저장';
    } else {
        cover.artist = document.getElementById('coverArtistInput').value;
        cover.youtubeLink = document.getElementById('coverYoutubeLinkInput').value;
        document.getElementById('coverArtistInput').value = '';
        document.getElementById('coverYoutubeLinkInput').value = '';
        showCover(songIndex);
        saveToLocalStorage();
    }
}

// 커버 삭제
function removeCover(songIndex, coverIndex) {
    songs[songIndex].covers.splice(coverIndex, 1);
    showCover(songIndex);
    saveToLocalStorage();
}

// 모달 닫기
function closeModal() {
    document.getElementById('coverModal').style.display = 'none';
}

// JSON 다운로드
function downloadJSON() {
    const jsonData = JSON.stringify(songs, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'songs.json';
    link.click();
}

// JSON 파일 업로드
function uploadJSON(event) {
    const file = event.target.files[0];
    if (songs.length) {
        if (confirm("파일을 불러오면 기존의 기록이 사라집니다. 불러오시겠습니까?")) {
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const fileContent = e.target.result;
                    const json = JSON.parse(fileContent);
                    songs.length = 0; // 기존 배열 초기화
                    json.forEach(song => songs.push(song));
                    filterSongs(1);
                    saveToLocalStorage();
                };
                reader.readAsText(file);
            }
        }
    } else {
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const fileContent = e.target.result;
                const json = JSON.parse(fileContent);
                songs.length = 0; // 기존 배열 초기화
                json.forEach(song => songs.push(song));
                filterSongs(1);
                saveToLocalStorage();
            };
            reader.readAsText(file);
        }
    }
}