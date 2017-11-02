//JS for the popup page

$(document).ready(function () {


    //confirm button clicked
    $("#getStudyGroup").click(function () {

        $("#studyGroupResponse").html("Loading...");

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

            createResponseTable(response.groups);
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    var buttons = document.querySelectorAll('button.function');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", popup);
    };
});


//Helper function create table in the popup page
function createResponseTable(response) {

    console.log(response);
    var table = $('<table></table>').addClass('table table-sm');

    for (i = 0; i < response.length; i++) {
        var row = $('<tr></tr>');
        var noCell = $('<th></th>').text(i + 1);
        var contentCell = $('<td></td>');
        var studyGroupURL = createStudyGroupURL(response[i].groupID);
        var contentAnchor = $('<a></a>').text(response[i].groupName).attr('href', studyGroupURL);
        contentCell.append(contentAnchor);
        row.append(noCell);
        row.append(contentCell);
        table.append(row);
    }
    $('#response').append(table);
}

//Helper function to create the study group url
function createStudyGroupURL(studyID) {
    var studyGroupURL = "https://www.imedidata.com/study_groups/" + studyID + "/studies";
    return studyGroupURL;
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