import { AfterViewInit, Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { ExcelService } from 'src/app/core/services/excel.service';
import { Global } from 'src/app/shared/global';
import { TowService } from '../Tow.service';
import { MapsAPILoader } from '@agm/core';
import { MapServiceService } from 'src/app/maps/map-service.service';

@Component({
  selector: 'app-activecalls',
  templateUrl: './activecalls.component.html',
  styleUrls: ['./activecalls.component.css']
})
export class ActivecallsComponent implements OnInit, AfterViewInit {
  indLoading = false;
  LoaderImage: any;
  ErrorMsg: any;
  SuccessMsg: any;
  UserId: Number;
  towlistService: TowService;
  Pagenumber: any;
  PageId: any;
  PageSize = Global.PageSize;
  TotalPagenum: any;
  TotalPageCount: any[];
  TotalRecord: string;
  AssignedList: any; UnassignedList: any; TowList: any;
  webUrl = Global.PoliceURL;
  subscription: Subscription;
  RoleId: any;
  IsInterval: any;
  EnterpriseIds: any;
  SearchForm: FormGroup;

  @ViewChild('googleMap') gmapElement: any;

  WreckerId: any = 0;
  Towingid: any = 0;
   Lat: any = '29.6612022709';
   Long: any = '-95.7133835891';
  /*Lat: any = '43.045394';
  Long: any = '-87.9063575';
  Lat: any = '20.266534';
  Long: any = '85.860046';*/

  //29.66120227094787, -95.7133835891767


  // 29.6708231,-95.744626
  Miles: any = 50;
  map: google.maps.Map;
  center: google.maps.LatLngLiteral = { lat: 29.6612022709, lng: -95.7133835891 };


  //center: google.maps.LatLngLiteral = { lat: 20.26653480529785, lng: 85.86004638671875 };

  zoom = 4;
  DriverList: any = [];
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
  showALL: boolean = true;
  ShowUnassigned: boolean = false;
  ShowAssigned: boolean = false;
  constructor(private _dataService: DataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private towlistServiceProvider: TowService,
    private mapsAPILoader: MapsAPILoader,
    public mapServiceService: MapServiceService) {
    this.towlistService = towlistServiceProvider;
  }
  createForm() {
    this.SearchForm = new FormGroup({
      typeControl: new FormControl('-1')

    });
  }
  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.PageId = params.PageId;
      this.RoleId = params.RoleId;
      this.UserId = params.uid;
    });
    this.LoaderImage = Global.FullImagePath;
    this.Pagenumber = 1;
    this.createForm();
    this.LoadTowList();
    /*setInterval(() => {
      this.LoadTowList();
    }, 30000);*/
  }
  ngAfterViewInit(): void {
    this.setHeight()
  }
  setHeight() {
    this.IsInterval = setInterval(() => {
      window.top.postMessage(document.body.scrollHeight, Global.PoliceURL);
    }, Global.SetHeightTime);
  }
  GetWTEnterpriseIDsOfCompanies(dataArray) {
    return this._dataService.postWithHeader(Global.WreckerTowAPIURL + `Request/SelectAllEnterpriseofCompany`, dataArray, Global.WreckerTowHeaderName, Global.WreckerTowHeaderValue).toPromise();
  }
  LoadTowList(): void {
    this.ErrorMsg = "";
    this.SuccessMsg = "";
    this.indLoading = true;
    this._dataService.get(Global.DLMS_API_URL + 'api/Request/GetActiveCalls')
      .subscribe(items => {
        this.indLoading = false;
        if (items != null) {
          this.TowList = items.ActiveCalls;


          this.TowList.forEach(item => {
            let itemarray = [];
            let ListProps = Object.keys(item);
            let desc = ""
            let badgeclass = "bdg ";
            badgeclass = badgeclass + item["bgClass"];

            ListProps.forEach(prop => {
              if (item[prop] != null && (item[prop]).toString().trim() != "") {               

                if (prop != "DispatchId" && prop != "RequestId" && prop != "IsAssigned" && prop != "borderClass" && prop != "bgClass") {
                  //desc=desc+"<strong>"+prop+" : </strong> ";
                  // desc=desc+"<span>"+item[prop]+" </span> ";
                  if (prop == "Status") {
                    desc = desc + "<li class='pull-right'> <span class='" + badgeclass + "'> " + item[prop] + " </span> </li>";
                  } else {
                    if (prop == "Towed From" || prop == "Drop off Location" || prop == "Tow Company") {
                      desc = desc + "</br>";
                    }
                    if (prop == "Towed From" || prop == "Drop off Location") {
                      if(prop == "Drop off Location"){
                        desc = desc + "<li > <i class='fa fa-xs fa-map-marker text-danger' aria-hidden=true></i> <span class=font-11> " + item[prop] + " </span>  </li>";

                      }else{
                        desc = desc + "<li > <i class='fa fa-xs fa-map-marker text-primary' aria-hidden=true></i> <span class=font-11> " + item[prop] + " </span>  </li>";

                      }
                    }
                    else {
                      if(prop == "RecordId"){
                        desc = desc + "<li>  <span class=text-success> " + item[prop] + " </span>  </li>";
                      }else{
                        desc = desc + "<li>  <span> " + item[prop] + " </span>  </li>";
                      }
                      
                    }


                  }
                  //itemarray.push({"prop":prop,"value":item[prop]});
                  // desc=desc+"<span>"+item[prop]" </span> " + "<span>"+item[prop]"</span>";
                }
              }
            });

            item["Desc"] = desc;
            //  item["All"]=itemarray;
          });
          //console.log(this.TowList);
          this.AssignedList = this.TowList.filter(s => s.IsAssigned == true)
          this.UnassignedList = this.TowList.filter(s => s.IsAssigned == false)
          if (items.TCGUID.length > 0) {
            this.GetWTEnterpriseIDsOfCompanies(items.TCGUID)
              .then((response) => {
                //console.log(response);
                this.EnterpriseIds = response;
                this.GetGISTrackingMap();
              }, (err) => {
                this.ErrorMsg = `There was some error. Please try again after some time.`;
              });
          }

        }
        else {
          this.TowList = [];
        }
      },
        error => {
          this.indLoading = false;
          this.ErrorMsg = <any>error
        });
  }

  changeTypeRadio(e) {

    this.showALL = false;
    this.ShowUnassigned = false;
    this.ShowAssigned = false;

    if (e.value == "-1") {
      this.showALL = true;
    } else if (e.value == "0") {
      this.ShowUnassigned = true;
    } else {
      this.ShowAssigned = true;
    }
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
      radius: 50,    // 10 miles in metres
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
          let icon='assets/images/circle-greentowruck.png'
          if(x.DriveStatus=="Busy"){
            icon='assets/images/circle-redtowruck.png'
          }
          const lat = x.latitude;
          const lng = x.longitude;
          let position = new google.maps.LatLng(Number(lat), Number(lng));
          bounds.extend(position);
          marker = new google.maps.Marker({
            position: position,
            map: this.map,
            animation: google.maps.Animation.DROP,
            icon: Global.WebUrl + icon,//'assets/images/circle-greentowruck.png',
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
  GetGISTrackingMap() {
    this._dataService.getWithHeader(Global.WreckerTowAPIURL + `DriverLocation/GetAllCompanyDrivers?WreckerId=${this.WreckerId}&towingid=${this.Towingid}&latitude=${this.Lat}&longitude=${this.Long}&miles=${this.Miles}&enterpriseId=${this.EnterpriseIds}&availabletype=5`, Global.WreckerTowHeaderName, Global.WreckerTowHeaderValue)
      .subscribe(res => {
        if (res) {
          res.shift();
          this.DriverList = res;
          this.loadMap(null);
        } else {
          this.DriverList = [];
        }
      }, error => (this.ErrorMsg = <any>error));
  }
  ClearMarkers() {
    this.DriverList.forEach((element, i) => {
      this.DriverList[i].Marker.setMap(null);
    });
  }
}
