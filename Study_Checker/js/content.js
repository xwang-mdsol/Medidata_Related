var appNameID = "app_type_1";

//Change the content of the web page on running based on the message sent from popup page, filter for only Rave pages
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        //only for navigation panel regular expression
        var navReg = /(imedidata)/;
        var contentURL = window.location.href;
        console.log(request.message);
        console.log(contentURL);


        //Do the function based on the meassage
        if (request.message === "getStudyGroup" && navReg.test(contentURL)) {
            console.log("Study Group");
            var apps = $('#app_type_1');
            var responseMessage = "";
            console.log(apps);
            console.log(apps.children.length);
            apps.each(function () {
                var groups = $(this).find(".study_group_launcher");
                anchors = groups.find('a');
                anchors.each(function () {
                    var groupName = $(this).html();
                    var groupURL = $(this).attr('href');
                    var groupID = getGroupID(groupURL);
                    responseMessage += '{"groupName": "' + groupName + '","groupID":"' + groupID + '"},';

                });


            });

            responseMessage = '{"groups":[' + responseMessage.slice(0, -1) + ']}';
            console.log(JSON.parse(responseMessage));
            sendResponse(JSON.parse(responseMessage));
        } else {
            console.log("Other");
        }
    }
);


//helper function get the study group id from the study group url
function getGroupID(URL) {
    var start_pos = URL.indexOf('=') + 1;
    var end_pos = URL.indexOf('&study_group_uuid', start_pos);
    var studyGroupID = URL.substring(start_pos, end_pos);
    console.log(studyGroupID);
    return studyGroupID;
}