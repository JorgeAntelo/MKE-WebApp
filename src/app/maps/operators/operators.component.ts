import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { Global } from 'src/app/shared/global';
import { MapServiceService } from '../map-service.service';

@Component({
  selector: 'app-operators',
  templateUrl: './operators.component.html',
  styleUrls: ['./operators.component.css']
})
export class OperatorsComponent implements OnInit {
  @Output() ClickMiles: EventEmitter<number> = new EventEmitter();
  @Output() ClickWrecker: EventEmitter<{}> = new EventEmitter();
  ErrorMsg: any;
  ZoneList: any[];
  enterpriseids: any;
  TowcompanyList: any;
  WTEnterpriseId: any;
  EnterpriseIds: any;
  Wreckerid: any;
  infowindowopenflag: number;
  driveracceptanceflag: number;
  miles: any;
  Towingid: any;
  Long: any;
  Lat: any;

  constructor(private dataService: DataService,
    private mapServiceService: MapServiceService) { }

  ngOnInit() {
    this.LoadZone();
  }

  LoadZone() {
    this.dataService.get(Global.DLMS_API_URL + 'api/Request/GETZones')
      .subscribe(res => {
        if (res) {
          this.ZoneList = res;
        } else {
          this.ZoneList = [];
        }
      },
        error => (this.ErrorMsg = <any>error));
  }

  loadTowCompanyWreckerTow(EnterpriseIds) {
    this.dataService.getWithHeader(Global.WreckerTowAPIURL + `TowCompany/GetTowCompanyListofEnterprise?enterpriseids=${EnterpriseIds}`, Global.WreckerTowHeaderName, Global.WreckerTowHeaderValue)
      .subscribe(res => {
        if (res) {
          this.TowcompanyList = res;
        } else {
          this.TowcompanyList = [];
        }
      },
        error => (this.ErrorMsg = <any>error));
  }

  OnChangeZone(ev) {
    let zoneid: any = ev.target.value;
    if (zoneid > 0) {
      this.loadTowCompanyByZoneAPI(zoneid)
        .then((res) => {
          if (res.length > 0) {
            let dataArray = [];
            for (let item in res) {
              dataArray.push({ 'TCGUID': res[item]["WTGUID"] });
            }
            if (dataArray.length > 0) {
              this.GetWTEnterpriseIDsOfCompanies(dataArray)
                .then((pl) => {
                  if (pl.length > 0) {
                    this.EnterpriseIds = pl;
                    this.loadTowCompanyWreckerTow(this.EnterpriseIds);
                  }
                  else {
                    //this.towcompanywreckertow = '';
                    this.EnterpriseIds = 0;
                    this.mapServiceService.ErrorMsg = `No Tow Company found for this zone.`;
                  }
                }, (err) => {
                  this.mapServiceService.ErrorMsg = `There was some error. Please try again after some time.`;
                });
            }
          }
          else {
            this.EnterpriseIds = 0;
            //this.towcompanywreckertow = '';
            this.mapServiceService.ErrorMsg = `No Tow Company found for this zone.`;
          }
        },
          (error) => {
            console.log(error);
          });
    }
  }

  loadTowCompanyByZoneAPI(zoneid) {
    return this.dataService.get(Global.DLMS_API_URL + `api/TowCompany/GetCompanyByZones?zoneid=${zoneid}`).toPromise();
  }

  OnChangeCompany(ev) {
    let towcompanyId: any = ev.target.value;
    if (towcompanyId > 0) {
      let objWTComp = this.TowcompanyList.filter(obj => obj.TowCompanyId == towcompanyId);
      if (objWTComp.length > 0) {
        this.WTEnterpriseId = objWTComp[0].EnterPriseId;
        this.EnterpriseIds = objWTComp[0].EnterPriseId.toString();
        this.Wreckerid = towcompanyId;
        this.infowindowopenflag = 0;
        this.driveracceptanceflag = 0;
        //document.getElementById("distance_road").innerHTML = '';
      }
    }
    else {
      if (this.TowcompanyList.length > 0) {
        var towcompanyWT = this.TowcompanyList.filter(obj => obj.WTGUID != null);
        var dataArray = [];
        setTimeout(() => {
          for (var o in towcompanyWT) {
            dataArray.push({ 'TCGUID': towcompanyWT[o]["WTGUID"] });
          }
          if (dataArray.length > 0) {
            this.GetWTEnterpriseIDsOfCompanies(dataArray)
              .then((response) => {
                this.EnterpriseIds = response;
              }, (err) => {
                this.mapServiceService.ErrorMsg = `There was some error. Please try again after some time.`;
              });
          }
        }, 2000);
      }
    }
    this.ClickWrecker.emit(
      { EnterpriseIds: this.EnterpriseIds, WreckerId: this.Wreckerid }
    );
  }

  GetWTEnterpriseIDsOfCompanies(dataArray) {
    return this.dataService.postWithHeader(Global.WreckerTowAPIURL + `Request/SelectAllEnterpriseofCompany`, dataArray, Global.WreckerTowHeaderName, Global.WreckerTowHeaderValue).toPromise();
  }

  OnChangeMiles(ev) {
    let mileId: any = ev.target.value;
    this.ClickMiles.emit(mileId);
  }
}
