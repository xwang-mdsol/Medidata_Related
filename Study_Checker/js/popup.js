//JS for the popup page
var studyGroups = [];
var isTableExisting = false;
var isStudyListenerAdded = false;
var iMedidataURL = "https://www.imedidata.com/";
var iMedidataURL1 = "https://www.imedidata.com/?ticket";

$(document).ready(function () {
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

//Add the listener to the get study group button
document.addEventListener("DOMContentLoaded", function () {
    var buttons = document.querySelectorAll('button.function');
    //console.log(buttons);
    //Close the window and show the alert if iMedidata has not been logged
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function (tabs) {
        var activeTab = tabs[0];
        if (!(activeTab.url.includes(iMedidataURL1) || activeTab.url == iMedidataURL)) {
            alert("Please log into iMedidata home page first and run this again!");
            window.close();
        };
    });

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", popup);
    };
});


//send message back based on the id to content.js, mainly get data from
//content page and then get the groups from it and create responseTable from that
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

//Helper function to create table in the popup page
function createResponseTable() {
    var table = $('<table id="result"></table>').addClass('table table-sm');

    for (i = 0; i < studyGroups.length; i++) {
        var row = $('<tr class="text-danger" id="row_' + i + '"></tr>');
        var noCell = $('<th></th>').text(i + 1);
        var contentCell = $('<td></td>');
        var contentAnchor = $('<a class="studyGroup" id= "study_' + i + '"></a>').text(studyGroups[i].studyGroupName).attr('href', studyGroups[i].studyGroupURL);

        contentCell.append(contentAnchor);
        row.append(noCell);
        row.append(contentCell);
        table.append(row);
    }
    if (isTableExisting == false) {
        $('#response').append(table);
        isTableExisting = true;
        $(".studyGroup").click(function (event) {
            event.preventDefault();
            createResponseStudy(event);
        })
    }
}

//Helper function to create studies after clicked each study group
function createResponseStudy(event) {
    console.log(studyGroups);
    console.log(event.target);
    var no = parseInt(event.target.id.split("_")[1]);
    console.log(typeof (no));
    var studies = studyGroups[no].studies;
    var studyGroupRow = $("#row_" + no);
    var studyGroupInfo = $(studyGroupRow).find('.studyGroup');
    var errorText = "";
    //console.log(studies);
    if (studies.length == 0) {
        errorText = studyGroupInfo.text().split(" - Loading")[0] + " - Loading";
        studyGroupInfo.text(errorText);
        setTimeout(function () {
            studyGroupInfo.text(studyGroupInfo.text().split(" - Loading")[0]);
        }, 2000)
    } else if (studies.error == "No Study") {
        errorText = studyGroupInfo.text().split(" - No study created yet")[0] + " - No study created yet";
        studyGroupInfo.text(errorText);
    } else if (studies.error == "Not Found") {
        errorText = studyGroupInfo.text().split(" - No study group owner access")[0] + " - No study group owner access";
        studyGroupInfo.text(errorText);
    } else if (studies.isLoaded == undefined) {
        for (i = studies.length - 1; i >= 0; i--) {
            studyName = (studies[i].studyName.split("(", 2)[0] + '(' + studies[i].studyName.split("(", 2)[1]).substr(0, 50);
            var j = i + 1;
            studyGroupRow.after('<tr class="studies_' + no + '" id="studies_' + studies[i].studyID + '"><td class="text-primary">Study ' + j +
                '</td><td><a class="env studies_' + no + ' srow_' + i + '" id="site_' + studies[i].studyID + '" href="' +
                studies[i].studyURL + '">' + studyName + '</a></td></tr>');
            $("#site_" + studies[i].studyID).click(function (event) {
                event.preventDefault();
                createResponseSite(event);
            })
        }
        studies.isLoaded = true;
    } else if (studies.isLoaded == true) {
        $('.studies_' + no).hide();
        studies.isLoaded = false;
    } else if (studies.isLoaded == false) {
        $('.studies_' + no).show();
        studies.isLoaded = true;
    } else {
        console.log("Other");
    }

}

//Helper function to create site reponse
function createResponseSite(event) {
    var no = parseInt($(event.target).attr('class').split("_")[2]);
    var id = parseInt(event.target.id.split("_")[1]);
    var sgNo = parseInt($(event.target).attr('class').split("_")[1])
    console.log(no);
    console.log(sgNo);
    //console.log(typeof (no));
    var sites = studyGroups[sgNo].studies[no].sites;
    var studyRow = $("#studies_" + id);
    var studyInfo = $(studyRow).find('.env');
    var errorText = "";
    console.log(sites);
    if (sites.length == 0) {
        errorText = studyInfo.text().split(" - Loading")[0] + " - Loading";
        studyInfo.text(errorText);
        setTimeout(function () {
            studyInfo.text(studyInfo.text().split(" - Loading")[0]);
        }, 2000)
    } else if (sites.error == "No Site") {
        errorText = studyInfo.text().split(" - No site created yet")[0] + " - No site created yet";
        studyInfo.text(errorText);
    } else if (sites.isLoaded == undefined) {
        for (i = sites.length - 1; i >= 0; i--) {
            siteName = sites[i].siteName;
            var j = i + 1;
            studyRow.after('<tr class="studies_' + sgNo + ' sites_' + id + '" id="' + sites[i].siteID + '"><td class="text-success">Site ' + j +
                '</td><td><a class="site" id="siteID_' + sites[i].siteID + '" href="#">' + siteName + '</a></td></tr>');
        }
        sites.isLoaded = true;
    } else if (sites.isLoaded == true) {
        $('.sites_' + id).hide();
        sites.isLoaded = false;
    } else if (sites.isLoaded == false) {
        $('.sites_' + id).show();
        sites.isLoaded = true;
    } else {
        console.log("Other");
    }
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


//Get all the necessary study group data from iMedidata
function getAllData(response) {
    console.log(response);
    studyGroups = [];
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

//Get the studies inforamtion from iMedidata
function getStudiesFromMedidata(studyGroupURL, studyGroupNumber) {
    return $.ajax({
        type: 'GET',
        url: studyGroupURL,
        datatype: 'html',
        success: function (data) {
            var studies = [];
            var table = $(data).find('tbody');
            studyAnchors = table.find('a');
            //console.log(studyAnchors);
            if (studyAnchors.length == 0) {
                studies = {
                    error: "No Study"
                };
            }
            for (i = 0; i < studyAnchors.length; i++) {
                var studyID = studyAnchors[i].id.split("_")[1];
                var studyURL = createAllURL(studyID, "study");
                studies.push({
                    studyURL: studyURL,
                    studyName: studyAnchors[i].innerText,
                    studyID: studyID,
                    sites: []
                });
                studyNumber = i;
                getSitesFromMedidata(studyURL, studyGroupNumber, studyNumber)
            }
            studyGroups[studyGroupNumber].studies = studies;
        },
        error: function (data) {
            console.log(data);
            studyGroups[studyGroupNumber].studies = {
                error: data.statusText
            };
        }

    });

}

//ajax call to get all sites information
function getSitesFromMedidata(studyURL, studyGroupNumber, studyNumber) {

    return $.ajax({
        type: 'GET',
        url: studyURL,
        datatype: 'html',
        success: function (data) {
            var sites = [];
            var table = $(data).find('tbody');
            var siteNameAnchors = [];
            //Get site name after site number
            var siteAnchors = table.find('span a');
            table.find('tr').each(function () {
                siteNameAnchors.push($(this).find("td:eq(1)"));
            });

            //console.log(siteAnchors);
            //console.log(siteNameAnchors);
            //console.log(siteAnchors);
            if (siteAnchors.length == 0) {
                sites = {
                    error: "No Site"
                };
            }
            for (i = 0; i < siteAnchors.length; i++) {
                var siteID = siteAnchors[i].id.split("_")[2];
                sites.push({
                    siteName: siteNameAnchors[i][0].innerText,
                    siteID: siteID
                });
            }
            studyGroups[studyGroupNumber].studies[studyNumber].sites = sites;
        },
        error: function (data) {
            console.log(data);
            studyGroups[studyGroupNumber].studies[studyNumber].sites = {
                error: data.statusText
            };
        }
    });
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