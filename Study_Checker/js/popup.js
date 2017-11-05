//JS for the popup page
var studyGroups = [];

$(document).ready(function () {


    //confirm button clicked
    $("#getStudyGroup").click(function () {

        $("#studyGroupResponse").html("Loading...");

    })


    $(".study").click(function () {
        console.log($(this).attr('id'));
    })

    //helper badge clicked
    $("#helper").click(function () {
        console.log("learn.mdsol.com");
        var win = window.open(learnURL, '_blank');
        if (win) {
            //Browser has allowed it to be opened
            win.focus();
        } else {
            //Browser has blocked it
            alert('Please allow popups for this website');
        }
    })
});



//send message back based on the id to content.js
function popup(e) {
    console.log(e);
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function (tabs) {
        var activeTab = tabs[0];
        //console.log(activeTab);
        chrome.tabs.sendMessage(activeTab.id, {
            "message": e.target.id
        }, function (response) {
            getAllData(response.groups);
            createResponseTable();
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    var buttons = document.querySelectorAll('button.function');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", popup);
    };
});

//Get all the necessary data from iMedidata
function getAllData(response) {
    console.log(response);
    for (i = 0; i < response.length; i++) {
        var studyGroupURL = createAllURL(response[i].groupID, "group");
        var studyGroupName = response[i].groupName;
        studyGroups.push({
            studyGroupName: studyGroupName,
            studyGroupURL: studyGroupURL,
            studies: []
        })
        getStudiesFromMedidata(studyGroupURL, i);
    }
    console.log(studyGroups);


}

//Helper function create table in the popup page
function createResponseTable() {
    console.log("run");
    var table = $('<table></table>').addClass('table table-sm');

    for (i = 0; i < studyGroups.length; i++) {
        var row = $('<tr id="' + i + '"></tr>');
        var noCell = $('<th></th>').text(i + 1);
        var contentCell = $('<td></td>');
        var contentAnchor = $('<a class="study" id= "study_' + i + '"></a>').text(studyGroups[i].studyGroupName).attr('href', studyGroups[i].studyGroupURL);

        contentCell.append(contentAnchor);
        row.append(noCell);
        row.append(contentCell);
        table.append(row);

    }
    $('#response').append(table);
}

//Helper function to create the study group url
function createAllURL(id, type) {
    if (type == "group") {
        var url = "https://www.imedidata.com/study_groups/" + id + "/studies";
    } else if (type == "study") {
        var url = "https://www.imedidata.com/studies/" + id + "/sites";
    }
    return url;
}

//Get the studies inforamtion from iMedidata
function getStudiesFromMedidata(studyURL, studyNumber) {
    studies = [];
    return $.ajax({
        type: 'GET',
        url: studyURL,
        datatype: 'html',
        success: function (data) {
            var studies = [];
            var table = $(data).find('tbody');
            studyAnchors = table.find('a');
            //console.log(studyAnchors);
            if (studyAnchors.length == 0) {
                studies = {
                    error: "No study"
                };
            }
            for (i = 0; i < studyAnchors.length; i++) {
                var studyURL = createAllURL(studyAnchors[i].id, "study");
                studies.push({
                    studyURL: studyURL,
                    studyName: studyAnchors[i].innerText
                });
            }
            //console.log(studies);
            studyGroups[studyNumber].studies = studies;
        },
        error: function (data) {
            console.log(data);
            studyGroups[studyNumber].studies = {
                error: data.statusText
            };
        }

    });

}

//Helper function to get the error response from xml string
function getErrorString(response) {
    var message;
    if (response === undefined || response === "") {
        message = "Error not defined";
    } else if (response.includes("DOCTYPE html")) {
        message = response;
    } else if (response.includes("</ODM>")) {
        var xml = $.parseXML(response);
        console.log(xml);
        message = $(xml).find('ODM').attr('mdsol:ErrorDescription');
    } else if (response.includes("</Response>")) {
        message = response.split("ErrorClientResponseMessage=")[1].split(">")[0];
    } else {
        message = response.split("mdsol:ErrorDescription=")[1].split("xmlns=")[0];
    }
    console.log(message);
    return message;
}

//Helper function for converting xml result to string
function xmlToString(xmlData) {

    var xmlString;
    //IE
    if (window.ActiveXObject) {
        xmlString = xmlData.xml;
    }
    // code for Mozilla, Firefox, Opera, etc.
    else {
        xmlString = (new XMLSerializer()).serializeToString(xmlData);
    }
    return xmlString;
}

//Helper function to get the authentication
function make_base_auth(user, password) {
    var tok = user + ':' + password;
    var hash = btoa(tok);
    return 'Basic ' + hash;
}

//Make text file
function makeTextFile(text) {
    var data = new Blob([text], {
        type: 'text/plain'
    });
    var textFile;
    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    return textFile;
};

//Make the data lock text file
function makeLockTextFile(xmlData) {
    var result;
    nodeList = xmlData.getElementsByTagName("ItemData");
    xmlData.getElementsByTagName("ODM")[0].setAttribute("FileType", "Transactional");
    console.log(nodeList);
    console.log(nodeList.length);
    for (i = 0; i < nodeList.length; i++) {
        xmlData.getElementsByTagName("ItemData")[i].setAttribute("mdsol:Lock", "Yes");
    }
    result = xmlToString(xmlData);
    result = makeTextFile(result);
    return result;
}