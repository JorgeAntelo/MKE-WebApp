import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { Global } from 'src/app/shared/global';
import { MapServiceService } from '../map-service.service';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-driver-list',
  templateUrl: './driver-list.component.html',
  styleUrls: ['./driver-list.component.css']
})
export class DriverListComponent implements OnInit {
  Wreckerid: any = 0;
  Towingid: any = 0;
  Lat: any = '20.268496';
  Long: any = '85.84851';
  Miles: any = 200;
  EnterpriseIds: any = 77;
  DriverList: any = [];
  // [{
  //   "Id": 45,
  //   "Name": "dipika sah",
  //   "DriverId": 365,
  //   "latitude": 20.26653480529785,
  //   "longitude": 85.86004638671875,
  //   "OnLocationDate": "2021-10-19T18:59:02",
  //   "Phone": "(124) 578-9566",
  //   "IsOccupied": "NO",
  //   "WreckerName": "ALL CITY TOWING",
  //   "WreckerId": 92,
  //   "distances": 0.76,
  //   "isacceptreject": false,
  //   "DriveStatus": "Online",
  //   "DriveStatusId": 1,
  //   "DriverUID": "NA",
  //   "TowTo": null,
  //   "TowId": null,
  //   "PickUp": null,
  //   "ColorCode": "#ffffff",
  //   "DlmsTowGUID": "",
  //   "AvailableDriversFlag": null,
  //   "DriverAddress": "303, Laxmisagar Canal Rd, Santoshi Vihar, Laxmisagar, Bhubaneswar, Odisha 751006, India"
  // },
  // {
  //   "Id": 80,
  //   "Name": "Sachin jenaa",
  //   "DriverId": 497,
  //   "latitude": 21.06247329711914,
  //   "longitude": 86.49918365478516,
  //   "OnLocationDate": "2021-10-19T17:22:07",
  //   "Phone": "(889) 562-3478",
  //   "IsOccupied": "NO",
  //   "WreckerName": "ALL CITY TOWING",
  //   "WreckerId": 92,
  //   "distances": 68.98,
  //   "isacceptreject": false,
  //   "DriveStatus": "Online",
  //   "DriveStatusId": 1,
  //   "DriverUID": "NA",
  //   "TowTo": null,
  //   "TowId": null,
  //   "PickUp": null,
  //   "ColorCode": "#ffffff",
  //   "DlmsTowGUID": "",
  //   "AvailableDriversFlag": null,
  //   "DriverAddress": "SH 9, Buddha Vihar, Bhadrak, Odisha 756100, India"
  // }];
  ErrorMsg: any;
  subscription: Subscription;
  constructor(private dataService: DataService,
    public mapServiceService: MapServiceService) { }

  ngOnInit() {
    // this.GetGISTrackingMap();
    this.subscription = this.mapServiceService.getDriverList().subscribe((res) => {
      console.log(res);
      
      this.DriverList = res;
    })
  }

  GetGISTrackingMap() {
    this.dataService.getWithHeader(Global.WreckerTowAPIURL + `DriverLocation/GetNearestDriver?WreckerId=${this.Wreckerid}&towingid=${this.Towingid}&latitude=${this.Lat}&longitude=${this.Long}&miles=${this.Miles}&enterpriseIDs=${this.EnterpriseIds}&type=`, Global.WreckerTowHeaderName, Global.WreckerTowHeaderValue)
      .subscribe(res => {
        if (res) {
          res.shift();
          this.DriverList = res;
          console.log(this.DriverList);

        } else {
          this.DriverList = [];
        }
      },
        error => (this.ErrorMsg = <any>error));
  }
}
