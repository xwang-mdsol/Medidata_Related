//js for active pages, get information from popup page

//clock set for content page
var myClock;

//Change the content of the web page on running based on the message sent from popup page, filter for only Rave pages
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    //only for navigation panel regular expression
    var navReg = /EDC\/[CS][Ru]/;
    var contentURL = window.location.href; 
    var navFlag;
    console.log(contentURL);
    //Give the navFlag based on the message and current URL
    if((request.message === "expand" || request.message === "contract")&& navReg.test(contentURL)){
        navFlag = true;
    }
    else if((request.message === "expand" || request.message === "contract")&& !navReg.test(contentURL)){
        navFlag = false;
    }
    //Do the function based on the meassage
    if( request.message === "expand" && navFlag) {
      $("#MasterLeftNav").css("width","220px");
      $(".leftNavTableRow").css("width","220px");
      alert("Left Navigation Expanded!");
    }
    else if( request.message === "contract" && navFlag ) {
      $("#MasterLeftNav").css("width","180px");
      $(".leftNavTableRow").css("width","180px");
      console.log("Contract");
	  alert("Left Navigation Contracted!");
    }
    else if( request.message === "startRefresh" ) {
      console.log("Refresh");
	  alert("Refresh all related Medidata pages started!");
    }
    else if( request.message === "stopRefresh" ) {
      console.log("Stop Refresh");
	  alert("Refresh all related Medidata pages stopped!")
    }
	else if( request.message === "startClock"){
	  console.log("Start Clock");
	  alert("Clock Started");
      var inTime = parseInt(request.time);
      if (request.time !== "null" && !isNaN(inTime))
			{
				if(inTime<5){
					inTime = 5;
				}
                var timeSec = inTime * 1000 * 60;
				clearInterval(myClock);
				myClock = setInterval(function(){clock(inTime);},timeSec);
            }
        
	}
	else if( request.message === "stopClock"){
	  console.log("Stop Clock");
	  alert("Clock Stopped");
	  clearInterval(myClock);
	}
    else if(navFlag === false){
        alert("No action as it is not a proper action related to the page");
    }
    else{
        console.log("Other");
    }
  }
);

//Give the alert for the defined time
function clock(minute){
    if(minute == 5){
        alert("5 minutes(minimum) passed for the page!");
    }
    else{
        alert(minute + " minutes passed for the page!");
    }
}
