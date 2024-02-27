{/* <reference path="http://code.jquery.com/jquery-2.2.1.min.js" /> */ }

var tmr;
function onSign() {
    console.log('fired');
    onClear();
    var ctx = document.getElementById('cnv').getContext('2d');
    // console.log(ctx);
    SetDisplayXSize(500);
    SetDisplayYSize(100);
    SetTabletState(0, tmr);
    SetJustifyMode(0);
    ClearTablet();
    if (tmr == null) {
        tmr = SetTabletState(1, ctx, 50);
    }
    else {
        SetTabletState(0, tmr);
        tmr = null;
        tmr = SetTabletState(1, ctx, 50);
    }
}

function onClear() {
    ClearTablet();
}

function onDone(ind) {
    $("#CloseInd").val(ind);
    if (NumberOfTabletPoints() == 0) {
        alert("Please sign before continuing");
    }
    else {
        SetTabletState(0, tmr);
        //RETURN TOPAZ-FORMAT SIGSTRING
        SetSigCompressionMode(1);
        document.getElementById("bioSigData").value = GetSigString();
        document.getElementById("sigStringData").value += GetSigString();
        //document.FORM1.bioSigData.value = GetSigString();
        //document.FORM1.sigStringData.value += GetSigString();
        //this returns the signature in Topaz's own format, with biometric information


        //RETURN BMP BYTE ARRAY CONVERTED TO BASE64 STRING
        SetImageXSize(500);
        SetImageYSize(100);
        SetImagePenWidth(5);
        GetSigImageB64(SigImageCallback);
    }
}

function SigImageCallback(str) {
    document.getElementById("sigImageData").value = str;
    var CloseInd = $("[id*=CloseInd]").val();
    if (str) {
        // var base64Image = $("[id*=sigImageData]").val();
        // console.log('sigImageData');
        // console.log(base64Image);
        $("#result").html('Signature captured');
        $("#result").addClass("alert alert-success");
        if (CloseInd == 'Yes') {
            $("#hfCloseInd").val('Success');
        }
    } else {
        $("#result").html('Signature captured failed');
        $("#result").addClass("alert alert-danger");
        if (CloseInd == 'Yes') {
            $("#hfCloseInd").val('Failure');
        }
    }
    //document.FORM1.sigImageData.value = str;
}
window.onunload = window.onbeforeunload = (function () {
    closingSigWeb()
})

function closingSigWeb() {
    ClearTablet();
    SetTabletState(0, tmr);
}

module.exports.onSign = onSign;
module.exports.onDone = onDone;