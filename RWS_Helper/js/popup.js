//JS for the popup page
var debugGETURL = "https://trainingj4.mdsol.com/RaveWebServices/studies/00_site (DEV)/datasets/raw/EN_AE1";
var debugPOSTURL = "https://trainingj4.mdsol.com/RaveWebServices/webservice.aspx?PostODMClinicalData";
var debugPOSTContent =
    '<ODM xmlns="http://www.cdisc.org/ns/odm/v1.3" ODMVersion="1.3" FileType="Transactional" FileOID="Example-1" CreationDateTime="2008-01-01T00:00:00">\
<ClinicalData StudyOID="00_site (DEV)" MetaDataVersionOID="1">\
  <SubjectData SubjectKey="666 DDD" TransactionType="Insert">\
    <SiteRef LocationOID="AAA"/>\
  </SubjectData>\
</ClinicalData>\
</ODM>';
var debugUser = "";
var debugPassword = "wangxiao@1";
var debugHost = "trainingj4";
var debugStudyOID = "00_site (DEV)";
var debugFormOID = "EN_AE1";

var learnURL = "https://learn.mdsol.com/api/rws/getting-started-with-rave-web-services-95587258.html";

var url;
var user;
var password;
var host;
var studyOID;
var dataType;
var formOID;
var response;
var requestType;
var postContent;
var requestDataType;
var getType;

var debugMode;
debugMode = true;

$(document).ready(function () {

    //hide save result and lock all button
    $('#saveResult').hide();
    $('#lockAll').hide();
    //workaround for chrome focus problem
    setTimeout(function () {
        $('#inputUser').focus();
    }, 50);

    if (debugMode) {
        $("#inputUser").val(debugUser);
        $("#inputPassword").val(debugPassword);
        $("#host").val(debugHost);
        $("#studyOID").val(debugStudyOID);
        $("#formOID").val(debugFormOID);
        $("#postContent").val(debugPOSTContent);
    }

    //when getType changes
    $('#getType').on('change', function () {

        getType = $("#getType").val();
        toggleGetType(getType);
    })
    //confirm button clicked
    $("#inputConfirm").click(function () {

        user = $("#inputUser").val();
        password = $("#inputPassword").val();
        requestType = $("#requestType").val();
        getType = $("#getType").val();
        $("#inputUser").prop("readonly", true);
        $("#inputPassword").prop("readonly", true);
        $("#requestType").attr("disabled", true);
        console.log(user);
        console.log(password);
        console.log(requestType);

        toggleGetType(getType);

        if (requestType == "GET") {
            requestDataType = "xml";
            $(".postInfo").hide();
            $(".getInfo").show();
        } else if (requestType == "POST") {
            requestDataType = "text/xml";
            $(".getInfo").hide();
            $(".postInfo").show();
        } else {

        }
    })

    //request button clicked
    $("#httpRequest").click(function () {
        url = createURL();
        console.log(url);
        console.log(requestType);
        console.log(requestDataType);
        console.log(postContent);

        $("#httpResponse").html("Loading...");
        $.ajax({
            type: requestType,
            url: url,
            dataType: "xml",
            contentType: requestDataType,
            data: postContent,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', make_base_auth(user, password));
            },
            success: function (data) {
                console.log(data);
                var successMessage;
                $("#urlRequest").text("URL: " + url);
                if (requestType == "GET") {
                    successMessage = xmlToString(data);
                    $("#httpResponse").text(successMessage);
                    //Show the save result and lock all button
                    $('#saveResult').show();
                    $('#lockAll').show();
                    //Create a txt file based on the result
                    $('#downloadLink').attr('href', makeTextFile(successMessage));
                    //Create a lock data txt file based on the result
                    $('#downloadLockLink').attr('href', makeLockTextFile(data));
                } else if (requestType == "POST") {
                    successMessage = $(data).find('Response').attr('SuccessStatistics');
                    $("#httpResponse").text(successMessage);
                }
            },
            error: function (data) {
                console.log(data);
                var errorMessage =
                    "<strong>" + getErrorString(data.responseText) + "</strong>";
                console.log(errorMessage);
                $("#urlRequest").text("URL: " + url);
                $("#httpResponse").html(errorMessage);
                //hide save result button
                $('#saveResult').hide();
                $('#lockAll').hide();
            }

        });
    });

    //reset button clicked
    $("#reset").click(function () {
        $("#inputUser").val("");
        $("#inputPassword").val("");
        $("#requestType").val("GET");
        $("#inputUser").prop("readonly", false);
        $("#inputPassword").prop("readonly", false);
        $("#requestType").attr("disabled", false);
        $("#contentCollapse").collapse('hide');
        $("#host").val("");
        $("#studyOID").val("");
        $("#formOID").val("");
        $("#dataType").val("regular");
        $("#httpResponse").html("");
        $("#urlRequest").html("");
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

//Helper function to create the url
function createURL() {
    host = $("#host").val();
    studyOID = $("#studyOID").val();
    formOID = $("#formOID").val();
    dataType = $("#dataType").val();
    postContent = $("#postContent").val();
    console.log(postContent);
    if (requestType == "GET") {
        postContent = "";
        if (getType == "Clinical Data") {
            if (studyOID == "") {
                url = "https://" + host + ".mdsol.com/RaveWebServices/studies";
            } else if (formOID == "") {
                url = "https://" + host + ".mdsol.com/RaveWebServices/studies/" + studyOID + "/datasets/" + dataType;
            } else {
                url = "https://" + host + ".mdsol.com/RaveWebServices/studies/" + studyOID + "/datasets/" + dataType + "/" + formOID;
            }
        } else if (getType == "Metadata") {
            if (studyOID == "") {
                url = "https://" + host + ".mdsol.com/RaveWebServices/metadata/studies";
            } else {
                url = "https://" + host + ".mdsol.com/RaveWebServices/metadata/studies/" + studyOID + "/versions";
            }
        }
    } else if (requestType == "POST") {
        url = "https://" + host + ".mdsol.com/RaveWebServices/webservice.aspx?PostODMClinicalData"
    }
    return url;
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

//toggle the get type input information
function toggleGetType(getType) {
    if (getType == "Clinical Data") {
        $(".clinical").show();
        $(".metadata").hide();
    } else if (getType == "Metadata") {
        $(".clinical").hide();
        $(".metadata").show();
    }
}