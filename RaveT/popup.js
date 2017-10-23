//js for popup page, get information from user and then pass to back

//popover initiation
$(document).ready(function () {
    $('[data-toggle="popover"]').popover();
});


//send message back based on the id to content.js
function popup(e) {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function (tabs) {
        var activeTab = tabs[0];
        if (e.target.id === "startClock") {
            var cTime = document.getElementById('clockTime').value;
            chrome.tabs.sendMessage(activeTab.id, {
                "message": e.target.id,
                "time": cTime
            });
        } else {
            chrome.tabs.sendMessage(activeTab.id, {
                "message": e.target.id
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    var divs = document.querySelectorAll('div.function');
    for (var i = 0; i < divs.length; i++) {
        divs[i].addEventListener("click", popup);
    };

});


window.onload = function () {

        document.getElementById("startRefresh").onclick = function (e) {
            var rTime = document.getElementById('refreshTime').value
            startRefresh(rTime);
        }
        document.getElementById("stopRefresh").onclick = function (e) {
            console.log(e);
            stopRefresh();
        }

    }
    //get the refresh started based on the time from the input
function startRefresh(refreshTime = "null") {
    console.log("startRefresh");
    chrome.runtime.sendMessage({
            type: "start",
            time: refreshTime
        },
        function (response) {
            console.log(response.msg);
        });
}

//stop all refresh
function stopRefresh() {
    console.log("stopRefresh");
    chrome.runtime.sendMessage({
            type: "stop"
        },
        function (response) {
            console.log(response.msg);
        });
}