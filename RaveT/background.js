//js for background page, running all the time while extension runs

//Interval set for the background page
var myInterval;

//only for refresh setting, get message from popup page
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "start") {
            var inTime = parseInt(request.time);
            if (request.time !== "null" && !isNaN(inTime)) {
                if (inTime < 5) {
                    inTime = 5;
                }
                var timeSec = inTime * 1000 * 60;
                clearInterval(myInterval);
                myInterval = setInterval(refreshMedPages, timeSec);
                sendResponse({
                    msg: "started"
                });
            } else {
                sendResponse({
                    msg: "not started"
                });
            }
        } else if (request.type === "stop") {
            clearInterval(myInterval);
            sendResponse({
                msg: "stopped"
            });
        } else {
            sendResponse({
                msg: "other"
            });
        }
    });


//refresh all windows for the window, filtering for the medidata pages
function refreshMedPages() {

    chrome.tabs.query({
        currentWindow: true
    }, function (tabs) {
        var refreshReg = /(imedidata|MedidataRave)/;
        var i = 0;

        console.log(tabs.length);
        for (i = 0; i <= tabs.length; i++) {
            var tabURL = tabs[i].url;
            if (refreshReg.test(tabURL)) {
                chrome.tabs.reload(tabs[i].id);
            }
        }
    })
};