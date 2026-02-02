document.addEventListener("keydown", function (event) {
    if (event.keyCode === 123 || (event.ctrlKey && event.shiftKey && event.keyCode === 73)) {
        event.preventDefault();
        blockDevTools(); // 개발자 도구 차단 함수 호출
    }
});

// 개발자 도구 감지 및 차단 함수
const blockDevTools = () => {
    // 페이지를 빈 페이지로 리다이렉션하거나, 종료
    window.location.href = "about:blank";
};

const devToolsDetector = () => {
    const checkStatus = () => {
        const startTime = performance.now();
        debugger; // 개발자 도구 감지
        const endTime = performance.now();

        // 일정 시간 이상 걸릴 경우 개발자 도구로 판단
        if (endTime - startTime > 100) {
            blockDevTools(); // 개발자 도구 감지 시 차단
        }
    };

    setInterval(checkStatus, 500); // 감지 주기를 짧게 설정
};

devToolsDetector();
