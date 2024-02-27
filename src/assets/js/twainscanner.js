//<reference path="https://ddocs.govtow.com/twain/resources/dynamsoft.webtwain.install.js" />
//<reference path="https://ddocs.govtow.com/twain/resources/dynamsoft.webtwain.initiate.js" />
//<reference path="https://ddocs.govtow.com/twain/resources/dynamsoft.webtwain.config.js" />
//<reference path="https://ddocs.govtow.com/twain/resources/dynamsoft.webtwain.min.js" />
var DWObject;
var DocName = '';
var AttachmentId = 0;
var DocDesc = '';
var userId = 0;

// Dynamsoft.WebTwainEnv.AutoLoad = false;
// Dynamsoft.WebTwainEnv.RegisterEvent('OnWebTwainReady', Dynamsoft_OnReady); // Register OnWebTwainReady event. This event fires as soon as Dynamic Web TWAIN is initialized and ready to be used
// Dynamsoft.WebTwainEnv.ResourcesPath = 'https://ddocs.govtow.com/twain/resources';

function RegisterDynamsoft() {

}

/*function waitForElement(id, callback){
    if(document.getElementById(id)){
        callback();
    }else{
        var poops = setInterval(function(){
            if(document.getElementById(id)){
                clearInterval(poops);
                callback();
            }
        }, 100);
    }
   
}*/


function AcquireImage(doc, attachmenttypeId, desc, user_Id) {
   // waitForElement("initiate", function(){

    Dynamsoft.WebTwainEnv.AutoLoad = false;
    Dynamsoft.WebTwainEnv.ResourcesPath = 'https://ddocs.govtow.com/twain/resources';
    Dynamsoft.WebTwainEnv.Load();
    DWObject = Dynamsoft.WebTwainEnv.GetWebTwain('dwtcontrolContainer');
    document.getElementById('divMsg').setAttribute('class', '');
    document.getElementById('divMsg').innerHTML = '';
    // DocName = doc;
    // AttachmentId = attachmenttypeId;
    // DocDesc = desc;
    // userId = user_Id;
    localStorage.setItem("AttachmentDetails", JSON.stringify({ DocName: doc, AttachmentId: attachmenttypeId, DocDesc: desc, userId: user_Id }));

   // });
}

function Dynamsoft_OnReady() {
    // Dynamsoft.WebTwainEnv.Load();
    let ScannAction = sessionStorage.getItem("ScannAction");
    console.log(ScannAction);
    if (ScannAction == 'true') {
    DWObject = Dynamsoft.WebTwainEnv.GetWebTwain('dwtcontrolContainer'); // Get the Dynamic Web TWAIN object that is embeded in the div with id 'dwtcontrolContainer'
    // console.log(DWObject);
    if (DWObject) {
        var count = DWObject.SourceCount;
        for (var i = 0; i < count; i++) {
            document.getElementById("source").options.add(new Option(DWObject.GetSourceNameItems(i), i));
        }

        if (DWObject) {
            var OnAcquireImageSuccess = OnAcquireImageFailure = function () {
                DWObject.CloseSource();
                var TID = document.getElementById("hdnTowingId").value;
                var WebURL = document.getElementById("hdnWebUrl").value;
                var RecordId = document.getElementById("hdnRecordId").value;
                var AttachmentDetails = JSON.parse(localStorage.getItem("AttachmentDetails"));
                if(AttachmentDetails)
                UploadImage(AttachmentDetails.DocName, AttachmentDetails.AttachmentId, AttachmentDetails.DocDesc, RecordId, TID, WebURL, AttachmentDetails.userId);
            };
            var selectedScanner = document.getElementById("source").selectedIndex;
            if (selectedScanner >= 0) {
                DWObject.SelectSourceByIndex(document.getElementById("source").selectedIndex);
                DWObject.OpenSource();
                DWObject.IfDisableSourceAfterAcquire = true;
                DWObject.IfShowUI = false; //Disable the Data Source's default User Interface
                DWObject.PixelType = EnumDWT_PixelType.TWPT_RGB;
                DWObject.AcquireImage(OnAcquireImageSuccess, OnAcquireImageFailure);
            } else {
                alert("No device found");
            }
        }
    }
}
}

function UploadImage(doc, attachmenttypeId, desc, recordId, TID, WebURL, userId) {
    if (DWObject) {
        // If no image in buffer, return the function
        if (DWObject.HowManyImagesInBuffer == 0)
            return;
        var strHTTPServer = WebURL; //The name of the HTTP server. For example: "www.dynamsoft.com";
        var tid = TID;
        var strActionPage = "Twain/SaveToFile.aspx?towingID=" + tid + "&attachmenttypeId=" + attachmenttypeId + "&doc=" + doc + "&desc=" + desc + "&TCN=" + recordId + "&UserId=" + userId;

        DWObject.IfSSL = false; // Set whether SSL is used
        DWObject.HTTPPort = location.port == "" ? '' : location.port;
        var Digital = new Date();
        var uploadfilename = Digital.getMilliseconds();
        // Upload the image(s) to the server asynchronously
        DWObject.HTTPUploadAllThroughPostAsPDF(strHTTPServer, strActionPage, uploadfilename + ".pdf", OnHttpUploadSuccess, OnHttpUploadFailure);
    }
}

function OnHttpUploadSuccess(httpResponse, newIndices, _arguments) {
    if (!httpResponse) {
        setTimeout(() => {
            document.getElementById('divMsg').setAttribute('class', 'alert alert-success alert-dismissible');
            document.getElementById('divMsg').innerHTML = "<h6>" + "Scan completed successfully" + "</h6>";
        }, 2000);
        document.getElementById('btnRefreshCheckList').click();
    }
}

function OnHttpUploadFailure(errorCode, errorString, httpResponse, newIndices, _arguments) {
    console.log(errorString + httpResponse);
    setTimeout(() => {
        document.getElementById('divMsg').setAttribute('class', 'alert alert-danger alert-dismissible');
        document.getElementById('divMsg').innerHTML = "<h6>" + errorCode + "-" + errorString + "-" + httpResponse + "</h6>";
    }, 2000);
}

module.exports.AcquireImage = AcquireImage;
module.exports.RegisterDynamsoft = RegisterDynamsoft;