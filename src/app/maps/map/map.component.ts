import { MapsAPILoader } from '@agm/core';
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { Global } from 'src/app/shared/global';
import { MapServiceService } from '../map-service.service';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css'],
    providers: [DatePipe]
})
export class MapComponent implements OnInit {
    @ViewChild('googleMap') gmapElement: any;
    EnterpriseIds: any = 0;
    WreckerId: any = 0;
    Towingid: any = 0;
    Lat: any = '20.268496';
    Long: any = '85.84851';
    Miles: any = 20;
    map: google.maps.Map;
    center: google.maps.LatLngLiteral = { lat: 20.26653480529785, lng: 85.86004638671875 };

    zoom = 4;
    DriverList: any = [];
    // [
    //     {
    //         "Id": 45,
    //         "Name": "dipika sah",
    //         "DriverId": 365,
    //         "latitude": 20.26653480529785,
    //         "longitude": 85.86004638671875,
    //         "OnLocationDate": "2021-10-19T18:59:02",
    //         "Phone": "(124) 578-9566",
    //         "IsOccupied": "NO",
    //         "WreckerName": "ALL CITY TOWING",
    //         "WreckerId": 92,
    //         "distances": 0.76,
    //         "isacceptreject": false,
    //         "DriveStatus": "Online",
    //         "DriveStatusId": 1,
    //         "DriverUID": "NA",
    //         "TowTo": null,
    //         "TowId": null,
    //         "PickUp": null,
    //         "ColorCode": "#ffffff",
    //         "DlmsTowGUID": "",
    //         "AvailableDriversFlag": null,
    //         "DriverAddress": "303, Laxmisagar Canal Rd, Santoshi Vihar, Laxmisagar, Bhubaneswar, Odisha 751006, India",
    //         Content: '',
    //         Marker: {}
    //     },
    //     {
    //         "Id": 80,
    //         "Name": "Sachin jenaa",
    //         "DriverId": 497,
    //         "latitude": 21.06247329711914,
    //         "longitude": 86.49918365478516,
    //         "OnLocationDate": "2021-10-19T17:22:07",
    //         "Phone": "(889) 562-3478",
    //         "IsOccupied": "NO",
    //         "WreckerName": "ALL CITY TOWING",
    //         "WreckerId": 92,
    //         "distances": 68.98,
    //         "isacceptreject": false,
    //         "DriveStatus": "Online",
    //         "DriveStatusId": 1,
    //         "DriverUID": "NA",
    //         "TowTo": null,
    //         "TowId": null,
    //         "PickUp": null,
    //         "ColorCode": "#ffffff",
    //         "DlmsTowGUID": "",
    //         "AvailableDriversFlag": null,
    //         "DriverAddress": "SH 9, Buddha Vihar, Bhadrak, Odisha 756100, India",
    //         Content: '',
    //         Marker: {}
    //     }
    // ]

    clickEventsubscription: Subscription;
    Nid: any;
    Ncode: any;
    TowGUID: any;
    Pdvid: any;
    AllWrecker: any;
    DLMSWreckerid: any;
    CurrentUserId: any = 0;
    TowingDetails: any = [];
    RecordNumber: any = '';
    WreckerName: any = 'All Towing'
    markerList: any = [];
    contentList: any = [];
    currInfoWindow: any;
    cityCircle: google.maps.Circle;
    distance: string;
    directionsDisplay: google.maps.DirectionsRenderer;
    directionsService: google.maps.DirectionsService;
    CurrentLatitude: any;
    CurrentLongitude: any;
    CurrentDriverId: any;
    ConfirmDriverLatitude: any;
    ConfirmDriverLongitude: any;
    WTDispatchId: any;
    constructor(private mapsAPILoader: MapsAPILoader,
        private datePipe: DatePipe,
        public mapServiceService: MapServiceService,
        private dataService: DataService,
        private activatedRoute: ActivatedRoute) {

        this.activatedRoute.queryParams.subscribe(params => {
            this.CurrentUserId = params.uid;
            this.RecordNumber = params.recordnumber;
        });
        this.clickEventsubscription = this.mapServiceService.getClickEvent().subscribe((res) => {
            this.openInfo(res)
        })


    }

    ngOnInit() {
        //this.GetGISTrackingMap();
        this.GetTowingDetails(this.RecordNumber);
    }


    loadMap(res) {
        const geo_options = {
            enableHighAccuracy: true,
            maximumAge: 30000,
            timeout: 27000
        };
        if (Global.GoogleMapAPIKey) {
            this.mapsAPILoader.load().then(() => {
                this.initialize(this.DriverList);
            });
        }
    }

    showPosition(position) {
        const lng = position.coords.longitude;
        const lat = position.coords.latitude;

        const mapProp = {
            center: new google.maps.LatLng(Number(lat), Number(lng)),
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);

        // Create marker 
        const marker = new google.maps.Marker({
            map: this.map,
            position: new google.maps.LatLng(Number(lat), Number(lng)),
            title: 'My current location',
            animation: google.maps.Animation.DROP
        });

        // Add circle overlay and bind to marker
        const circle = new google.maps.Circle({
            map: this.map,
            radius: 1000,    // 10 miles in metres
            fillColor: '#AA0000',
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillOpacity: 0.35,
        });
        circle.bindTo('center', marker, 'position');
        marker.setMap(this.map);

        // const infowindow = new google.maps.InfoWindow({
        //     content: 'My Current Location'
        // });
        // infowindow.open(this.map, marker);

        // this.currentLat = position.coords.latitude;
        // this.currentLong = position.coords.longitude;

        // let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        // this.map.panTo(location);

        // if (!this.marker) {
        //     this.marker = new google.maps.Marker({
        //         position: location,
        //         map: this.map,
        //         title: 'Got you!'
        //     });
        // }
        // else {
        //     this.marker.setPosition(location);
        // }
    }

    openInfo(obj) {
        if (obj.Marker.position != null) {
            //const lat = x.latitude;
            //const lng = x.longitude;
            //let center = new google.maps.LatLng(Number(lat), Number(lng));
            //let location = new google.maps.LatLng(Number(lat), Number(lng));
            this.map.panTo(obj.Marker.position);

            // const marker = new google.maps.Marker({
            //     position: location,
            //     icon: this.pinSymbol(x.AreaColor),
            //     animation: google.maps.Animation.DROP
            // });
            // const contentString = '<div id="content">' +
            //     '<div id="bodyContent">' +
            //     '<p><b>Crane Operator : </b> ' + x.Name + ',</br> <b>Phone : </b> <span style="color:' + x.AreaColor + '">' + x.Phone + '</span>' + ',</br>  <b>WreckerName: </b> ' + x.WreckerName + ',</br> <b>Address : </b> ' + x.DriverAddress + '</p>' +
            //     '<p><b>Driver Status: </b> ' + x.DriveStatus + '</p>' +
            //     '<p><button type="button" id="butSubmit" class="btn btn-success">Notify</button></p>' +
            //     '</div>' +
            //     '</div>';
            // let mapOptions = {
            //     mapTypeId: google.maps.MapTypeId.ROADMAP,
            //     center: center,
            //     zoom: 14,
            // };


            // Display a map on the page
            //let map = new google.maps.Map(this.gmapElement.nativeElement, mapOptions);
            let infoWindow = new google.maps.InfoWindow();
            //let index = this.markerList.indexOf(obj);
            if (this.currInfoWindow) {
                this.currInfoWindow.close();
            }

            infoWindow.setContent(obj.Content);

            infoWindow.open(this.map, obj.Marker);
            this.currInfoWindow = infoWindow;
            // google.maps.event.addListener(marker, 'click',()=> {
            //     infoWindow.open(this.map,marker);
            //  });

            //  infoWindow.open(this.map,marker);

            // infoWindow.open(this.map);
            //marker.setMap(map);
            // google.maps.event.addListener(marker, 'click', ((marker) => {
            //     return () => {
            //         infoWindow.setContent(contentString);
            //         infoWindow.open(this.map, marker);
            //     }
            // })(marker));
            // infoWindow.open(this.map);
            // infoWindow.open(this.map,marker);
            google.maps.event.addListener(infoWindow, 'domready', () => {
                //now my elements are ready for dom manipulation
                let clickableItem = document.getElementById('butSubmit');
                clickableItem.addEventListener('click', () => {
                    this.CurrentDriverId = obj.DriverId;
                    this.NearestDriverConfirmation(this.TowingDetails, obj.DriverId, this.DriverList);
                });
            });
            let startPoint = obj.Marker.position;
            let endPoint = new google.maps.LatLng(Number(20.273082), Number(85.855431));
            this.ClearMarkers();
            this.DrawRoute(startPoint, endPoint);
            // google.maps.event.trigger(marker, 'click');
        }
    }

    initialize(driverList) {
        //var center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        let bounds = new google.maps.LatLngBounds();
        let mapOptions = {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoom: 14,
        };

        // Display a map on the page
        this.map = new google.maps.Map(this.gmapElement.nativeElement, mapOptions);
        this.map.setTilt(45);
        this.cityCircle = new google.maps.Circle({
            strokeColor: '#0000FF',
            strokeOpacity: 0.7,
            strokeWeight: 1,
            fillColor: '#0000FF',
            fillOpacity: 0.15,
            draggable: false,
            map: this.map,
            center: this.center,
            radius: this.Miles * 1609.34
        });
        // Display multiple markers on a map
        let infoWindow = new google.maps.InfoWindow(), marker, i;
        if (driverList.length > 0) {
            driverList.forEach((x, i) => {
                if (x.latitude && x.longitude) {
                    const lat = x.latitude;
                    const lng = x.longitude;
                    let position = new google.maps.LatLng(Number(lat), Number(lng));
                    bounds.extend(position);
                    marker = new google.maps.Marker({
                        position: position,
                        map: this.map,
                        animation: google.maps.Animation.DROP,
                        icon: Global.WebUrl + 'assets/images/circle-greentowruck.png',
                        title: 'Name: ' + x.Name + ', Phone: ' + x.Phone + ', Tow Company:' + x.WreckerName,
                    });
                    const contentString = '<div id="content">' +
                        '<div id="siteNotice">' +
                        '</div>' +
                        '<div id="bodyContent">' +
                        '<p><b>Crane Operator : </b> ' + x.Name + ',</br> <b>Phone : </b>' + x.Phone + ',</br>  <b>WreckerName: </b> ' + x.WreckerName + ',</br> <b>Address : </b> ' + x.DriverAddress + '</p>' +
                        '<p><b>Driver Status: </b> ' + x.DriveStatus + '</p>' +
                        '<p><button type="button" id="butSubmit" class="btn btn-success">Notify</button></p>' +
                        '</div>' +
                        '</div>';
                    google.maps.event.addListener(marker, 'click', ((marker, i) => {
                        return () => {
                            infoWindow.setContent(contentString);
                            infoWindow.open(this.map, marker);
                        }
                    })(marker, i));
                    this.DriverList[i].Content = contentString;
                    this.DriverList[i].Marker = marker;
                    this.map.fitBounds(this.cityCircle.getBounds());
                    //this.map.fitBounds(bounds);
                }
            });
            this.mapServiceService.sendDriverList(this.DriverList);
        }
    }

    /*
      This Method sending notification to driver
      this is to update Towing Table before sending request
      API pulls all record from Table and send to WT
    */
    NearestDriverConfirmation(TowingDetails, DriverId, AllAssetGIS) {
        this.mapServiceService.SuccessMsg = '';
        this.mapServiceService.ErrorMsg = '';
        let resD = AllAssetGIS.filter(obj => obj.DriverId == DriverId);
        let WreckerName = resD[0].WreckerName;
        let DriverName = resD[0].Name;

        if ((TowingDetails[0].ModeId == 1 || TowingDetails[0].ModeId == 3) && (TowingDetails[0].RequestStatusId == 1 || TowingDetails[0].RequestStatusId == 7)) {
            this.GetWreckerByNameAPI(WreckerName)
                .then((response) => {
                    if (response.length > 0) {
                        this.AllWrecker = response
                        this.DLMSWreckerid = response[0]["WreckerId"];
                        TowingDetails[0].TowCompanyId = this.DLMSWreckerid;
                        TowingDetails[0].CloseProximityDriverId = DriverId;

                        let model = {
                            guidId: TowingDetails[0].GUIDID,
                            towCompanyId: this.DLMSWreckerid,
                            closeProximityDriverId: DriverId,
                            closeProximityMapFlag: 1
                        }
                        this.UpdateCP(model)
                            .then((pl) => {
                                this.PostDispatchToWT(TowingDetails[0].DispatchId, this.CurrentUserId)
                                    .then((response2) => {
                                        this.TowGUID = TowingDetails[0].GUIDID;
                                        this.mapServiceService.SuccessMsg = `Notification send successfully to ${DriverName.toUpperCase()}`
                                        this.GetWTNotificationDetails(this.TowGUID, DriverId)
                                            .then((response3) => {
                                                if (response3.length > 0) {
                                                    this.Nid = response3[0].DispatchNotificationId;
                                                    this.Ncode = response3[0].NotificationCode;
                                                }
                                            }, (errorPl) => { });
                                    }, (err) => {
                                        this.mapServiceService.ErrorMsg = `There was some error. Please try again after some time.`;
                                    });
                            }, (err) => {
                                console.log("Err" + err);
                            });
                    }
                    else {
                        this.mapServiceService.ErrorMsg = `Driver belongs to Tow Company (${WreckerName}) has not registered with MKE, Mode changed to manual.`;
                        TowingDetails[0].ModeId = '1';
                        TowingDetails[0].isTowCompanyEnabled = true;
                        TowingDetails[0].CloseProximityDriverId = 0;
                        TowingDetails[0].TowCompanyId = '';
                    }

                }, (errorPl) => { });
        }
        else {
        }
    }

    GetWTNotificationDetails(agencyGuid, driverId) {
        return this.dataService.getWithHeader(Global.WreckerTowAPIURL + `DriverLocation/WTNotificationDetails?agencyGuid=${agencyGuid}&driverId=${driverId}`, Global.WreckerTowHeaderName, Global.WreckerTowHeaderValue).toPromise();
    }

    GetWreckerByNameAPI(wTName) {
        return this.dataService.get(Global.DLMS_API_URL + `api/Request/GetWreckerByName?wTName=${wTName}`).toPromise();
    }

    UpdateCP(cp) {
        return this.dataService.post(Global.DLMS_API_URL + `api/Request/UpdateCloseProximity`, cp).toPromise();
    }

    PostDispatchToWT(TowingId, UserId) {
        return this.dataService.get(Global.DLMS_API_URL + `api/Request/DispatchToWT?TowingId=${TowingId}&UserId=${UserId}`).toPromise();
    }

    GetTowingDetails(RecordNumber) {
        this.dataService.get(Global.DLMS_API_URL + `api/Request/GetTowingByRecordNumber?RecordNumber=${RecordNumber}`).subscribe((response) => {
            this.TowingDetails = response;
            console.log(response);
        },
            error => (this.mapServiceService.ErrorMsg = <any>error));
    }

    ClickMiles(miles) {
        this.cityCircle.setRadius(miles * 1609.34);
        this.map.fitBounds(this.cityCircle.getBounds());
    }

    ClickWrecker(obj) {
        console.log(obj);
        this.EnterpriseIds = obj.EnterpriseIds;
        this.WreckerId = obj.WreckerId
        this.GetGISTrackingMap();
    }

    GetGISTrackingMap() {
        this.dataService.getWithHeader(Global.WreckerTowAPIURL + `DriverLocation/GetNearestDriver?WreckerId=${this.WreckerId}&towingid=${this.Towingid}&latitude=${this.Lat}&longitude=${this.Long}&miles=${this.Miles}&enterpriseIDs=${this.EnterpriseIds}&type=`, Global.WreckerTowHeaderName, Global.WreckerTowHeaderValue)
            .subscribe(res => {
                if (res) {
                    res.shift();
                    this.DriverList = res;
                    this.loadMap(null);
                } else {
                    this.DriverList = [];
                }
            }, error => (this.mapServiceService.ErrorMsg = <any>error));
    }

    DrawRoute(start, end) {
        this.directionsDisplay = new google.maps.DirectionsRenderer();
        this.directionsService = new google.maps.DirectionsService();
        this.directionsDisplay.setMap(this.map);

        var request = {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING
        };
        this.directionsService.route(request, (response, status) => {
            if (status == google.maps.DirectionsStatus.OK) {
                this.directionsDisplay.setDirections(response);
                var miles = 0.000621371 * response.routes[0].legs[0].distance.value;// returns in meter
                var hr = response.routes[0].legs[0].duration.value / 3600; // returns in minute
                this.distance = "The distance between the two points on the chosen route is: " + miles.toFixed(4) + " miles (" + (response.routes[0].legs[0].distance.value * 0.001).toFixed(3) + ") km";
                this.distance += ",  The aproximative driving time is: " + hr.toFixed(2) + " hr (" + (response.routes[0].legs[0].duration.value / 60).toFixed(2) + ") min";
            }
        });
    }

    DriverAcceptedRejected() {
        this.GetDriverAcceptedRejected(this.Nid, this.Ncode, this.CurrentDriverId)
        .then((response)=> {
            let acceptreject = response;
            if (acceptreject.length > 0) {
                if (acceptreject[0].AcceptedFlag != null) {
                    if (acceptreject[0].AcceptedFlag.toString() == "true") {
                        // infowindowopenflag = 1;
                        // confirmflag = 0;
                        // driveracceptanceflag = 1;
                        // dispatchflag = 1;
                        // directionsDisplay.setMap(null);
                        this.ClearMarkers();
                        let myLatlng = new google.maps.LatLng(Number(this.CurrentLatitude.toFixed(6)), Number(this.CurrentLongitude.toFixed(6)));
                        let newLatLon = new google.maps.LatLng(Number(this.ConfirmDriverLatitude.toFixed(6)), Number(this.ConfirmDriverLongitude.toFixed(6)));
                        if (this.CurrentLatitude != '' && this.CurrentLongitude != '' && this.ConfirmDriverLatitude != '' && this.ConfirmDriverLongitude != '') {
                            this.DrawRoute(myLatlng, newLatLon);
                        }
                        else {
                            this.ConfirmDriverLatitude = '';
                            this.ConfirmDriverLongitude = '';
                        }
                        this.mapServiceService.SuccessMsg = `Driver has accepted the notification.`;
                        this.GetNotificationByDLMSGUID(this.TowGUID);
                    }
                    else if (acceptreject[0].AcceptedFlag.toString() == "false" && acceptreject[0].RejectionReason != null && acceptreject[0].NoresponseFlag == null) {
                        //infowindowopenflag = 0;
                        this.Nid = '';
                        this.Ncode = '';
                        //infowindowopenflag = '';
                        this.mapServiceService.SuccessMsg = `Driver has rejected the notification due to ${acceptreject[0].RejectionReason.toUpperCase()}`;
                        //rejecteddvid = dvid;
                        //confirmflag = '';

                        //var dtls = $scope.DispatchList.filter(obj => obj.GUIDID == this.TowGUID);
                        //loadMaps(0, currentlatitude, currentlongitude, dtls);
                    }
                    else if (acceptreject[0].AcceptedFlag.toString() == "false" && acceptreject[0].RejectionReason == null && acceptreject[0].NoresponseFlag == true) {
                        if (this.Nid != '') {
                            this.GetDriverResponse(this.Nid, this.Ncode, this.CurrentDriverId).then((response)=> {
                                if (response.length > 0) {
                                    this.Nid = '';
                                    this.Ncode = '';
                                    this.mapServiceService.ErrorMsg = 'Driver is not responding, notification expired.';
                                    //infowindowopenflag = '';
                                    //rejecteddvid = dvid;
                                    //var dtls = $scope.DispatchList.filter(obj => obj.GUIDID == TowGUID);
                                    //loadMaps(0, currentlatitude, currentlongitude, dtls);
                                }
                            },(errorPl)=> {});
                        }
                    }
                }
            }
            else {
                // infowindowopenflag = 1;
                // confirmflag = 0;
            }
        },(errorPl)=> {});
    }

    ClearMarkers() {
        this.DriverList.forEach((element,i) => {
            this.DriverList[i].Marker.setMap(null);
        });
    }

    GetNotificationByDLMSGUID(towGUID) {
       this.GetNotificationByDLMSGUIDAPI(towGUID).then((response)=> {
            if (response.length > 0) {
                this.Nid = response[0]["DispatchNotificationId"];
                this.Ncode = response[0]["NotificationCode"];
                this.WTDispatchId = response[0]["DispatchID"];
                let DriverUserId = response[0]["DriverUserId"];
                let accepteddriverlatitude = response[0]["DriverAcceptedLat"];
                let accepteddriverlongitude = response[0]["DriverAcceptedLong"];
                //infowindowopenflag = 0;
                //confirmflag = 0;
                //dispatchcompletedflag = 1;
                //driveracceptanceflag = 1;
                let startLatLong = new google.maps.LatLng(accepteddriverlatitude, accepteddriverlongitude);
                //loadMapsforSingleVendor(DriverUserId);
            }
            else {
                this.mapServiceService.ErrorMsg = 'No driver activities found for this request.';
                //this.showMapModal = false;
            }
        },(errorPl)=> {});
    }

    GetDriverAcceptedRejected(nid, ncode, dvid) {
        return this.dataService.getWithHeader(Global.WreckerTowAPIURL + `DriverLocation/GetDriverAcceptedRejected?nid=${nid}&ncode=${ncode}&dvid=${dvid}`, Global.WreckerTowHeaderName, Global.WreckerTowHeaderValue).toPromise();
    }

    GetDriverResponse(nid, ncode, dvid) {
        return this.dataService.getWithHeader(Global.WreckerTowAPIURL + `DriverLocation/GetDriverResponse?nid=${nid}&ncode=${ncode}&dvid=${dvid}`, Global.WreckerTowHeaderName, Global.WreckerTowHeaderValue).toPromise();
    }

    GetNotificationByDLMSGUIDAPI(towGUID) {
        return this.dataService.getWithHeader(Global.WreckerTowAPIURL + `DriverLocation/GetNotificationByDLMSGUID?towGUID=${towGUID}`, Global.WreckerTowHeaderName, Global.WreckerTowHeaderValue).toPromise();
    }
}
