import { MapsAPILoader } from '@agm/core';
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { UtilService } from 'src/app/core/services/util.service';
import { Global } from 'src/app/shared/global';
import { isNullOrUndefined } from 'util';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { trigger, state, style, transition, animate, keyframes, query, stagger, AnimationKeyframesSequenceMetadata } from '@angular/animations';

@Component({
  selector: 'app-scrap-company',
  templateUrl: './scrap-company.component.html',
  styleUrls: ['./scrap-company.component.css']
})
export class ScrapCompanyComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('Address') AddressElementRef: ElementRef;
  ErrorMsg: any;
  SuccessMsg: any;
  ScrapCompanyForm: FormGroup;
  states: any; filteredStates: Observable<any[]>;

  Isinvalid: boolean;
  indLoading: boolean;
  LoaderImage: any;
  CompanyId: number = 0; RecordId: any; Status: any; DATE: any; UserId: Number;
  phonemask: any[] = Global.phonemask;
  Header: any = "Company Details";
  IsInterval: any;
  constructor(private _dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private router: Router, private modalService: BsModalService,
    private utilService: UtilService) {
    this.activatedRoute.queryParams.subscribe(params => {
      let CompanyId = params.CompanyId;
      let LoggeduserId = params.UserId;
      if (LoggeduserId) {
        this.UserId = Number(LoggeduserId);
      }
      if (CompanyId > 0) {
        this.CompanyId = CompanyId;
        this.Header = "Edit Company Details";
        this.createForm();
        this.LoadScrapCompanyDetails();
      }
    });
  }

  Reload(id) {
    if (id > 0) {
      this.LoadScrapCompanyDetails();
    }
  }

  ngAfterViewInit() {
    this.LoaderImage = Global.FullImagePath;
    this.setHeight()
  }
  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    if (this.CompanyId == 0) {
      this.createForm();
      this.LoadStates('');
    }
    //this.googleAutoComplete();
  }

  ngOnDestroy(): void {
    clearInterval(this.IsInterval);
  }

  setHeight() {
    this.IsInterval = setInterval(() => {
      window.top.postMessage(document.body.scrollHeight, Global.PoliceURL);
    }, Global.SetHeightTime);
  }
  private createForm() {
    this.ScrapCompanyForm = new FormGroup({
      CompanyNameFormControl: new FormControl('', [Validators.required]),
      ContactNameFormControl: new FormControl('', [Validators.required]),
      AddressFormControl: new FormControl('', [Validators.required]),
      StateFormControl: new FormControl('', [Validators.required]),
      CityFormControl: new FormControl('', [Validators.required]),
      ZipFormControl: new FormControl('', [Validators.required]),
      PhoneFormControl: new FormControl('', [Validators.maxLength(15), Validators.pattern(Global.PHONE_REGEX)]),
      EmailFormControl: new FormControl('', [Validators.pattern(Global.EMAIL_REGEX), Validators.maxLength(50)]),
    });
  }

  ResetForm() {
    this.ScrapCompanyForm.reset();
    this.LoadStates('');
  }

  Save(obj) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    this.utilService.validateAllFormFields(this.ScrapCompanyForm);
    if (this.ScrapCompanyForm.valid) {
      this.indLoading = true;
      var CompanyModel =
        {
          "CompanyId": this.CompanyId,
          "UserId": this.UserId,
          "CompanyName": obj.CompanyNameFormControl,
          "ContactName": obj.ContactNameFormControl,
          "Address": obj.AddressFormControl,
          "State": obj.StateFormControl.State_Code,
          "City": obj.CityFormControl,
          "Zip": obj.ZipFormControl,
          "Telephone": obj.PhoneFormControl,
          "Email": obj.EmailFormControl
        };
      this._dataService.post(Global.DLMS_API_URL + 'ScrapProcess/SaveScrapCompany', CompanyModel)
        .subscribe(items => {
          this.indLoading = false;

          if (items.Id > 0) {
            this.CompanyId = items.Id;
            this.SuccessMsg = items.result;
            this.LoadScrapCompanyDetails();
          } else {
            this.ErrorMsg = items.result;
          }
        },
        error => {
          this.indLoading = false;
          this.ErrorMsg = <any>error
        });
    }
  }

  LoadScrapCompanyDetails() {
    this._dataService.get(Global.DLMS_API_URL + 'ScrapProcess/GetScrapCompany?ScrapCompanyId=' + this.CompanyId)
      .subscribe(response => {
        if (response != null) {
          let item = response[0];
          (<FormControl>this.ScrapCompanyForm.controls['CompanyNameFormControl']).setValue(item.CompanyName, {});
          (this.ScrapCompanyForm.controls['CompanyNameFormControl']).updateValueAndValidity();
          (<FormControl>this.ScrapCompanyForm.controls['ContactNameFormControl']).setValue(item.ContactName, {});
          (this.ScrapCompanyForm.controls['ContactNameFormControl']).updateValueAndValidity();
          (<FormControl>this.ScrapCompanyForm.controls['AddressFormControl']).setValue(item.Address, {});
          (this.ScrapCompanyForm.controls['AddressFormControl']).updateValueAndValidity();
          this.LoadStates(item.State);
          (<FormControl>this.ScrapCompanyForm.controls['CityFormControl']).setValue(item.City, {});
          (this.ScrapCompanyForm.controls['CityFormControl']).updateValueAndValidity();
          (<FormControl>this.ScrapCompanyForm.controls['ZipFormControl']).setValue(item.Zip, {});
          (this.ScrapCompanyForm.controls['ZipFormControl']).updateValueAndValidity();
          (<FormControl>this.ScrapCompanyForm.controls['PhoneFormControl']).setValue(item.Telephone, {});
          (this.ScrapCompanyForm.controls['PhoneFormControl']).updateValueAndValidity();
          (<FormControl>this.ScrapCompanyForm.controls['EmailFormControl']).setValue(item.Email, {});
          (this.ScrapCompanyForm.controls['EmailFormControl']).updateValueAndValidity();
        }
      },
      error => {
        this.ErrorMsg = <any>error
      });
  }

  //States
  reset(): void {
    setTimeout(() => {
      (this.ScrapCompanyForm.controls['StateFormControl']).setValue(null);
    }, 1);
  }

  filterStates(val) {
    return val ? this.states.filter(s => s.State_Code.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.states;
  }

  displayFn(state): string {
    return state ? state.State_Code : state;
  }

  LoadStates(State): void {
    this._dataService.get(Global.DLMS_API_URL + 'api/Request/GetState?CountryId=1')
      .subscribe(states => {
        this.states = states;
        this.filteredStates = this.ScrapCompanyForm.controls['StateFormControl'].valueChanges
          .startWith(null)
          .map(state => state && typeof state === 'object' ? state.Name : state)
          .map(name => this.filterStates(name));
        if (State != '') {
          for (let state of this.states) {
            if (State == state.State_Code) {
              (<FormControl>this.ScrapCompanyForm.controls['StateFormControl'])
                .setValue(state, {});
            }
          }
        } else {
          /*  if (this.states != null) {
             (<FormControl>this.ScrapCompanyForm.controls['StateFormControl'])
               .setValue(this.states[0], {});
           } */
        }
      },
      error => this.ErrorMsg = <any>error);
  }

  Back() {
    this.router.navigate(['/scrap/scrapcompany'], { queryParams: { uid: this.UserId } });
  }

  googleAutoComplete() {
    if (Global.GoogleMapAPIKey != '') {
      // this.blockStreetAddressElementRef.nativeElement.focus();
      this.mapsAPILoader.load().then(() => {
        const autocomplete: any = new google.maps.places.Autocomplete(this.AddressElementRef.nativeElement, {
          componentRestrictions: { country: 'US' },
          types: ['address']
        });

        autocomplete.addListener("place_changed", () => {
          this.ngZone.run(() => {
            //get the place result
            let place: google.maps.places.PlaceResult = autocomplete.getPlace();

            //verify result
            if (place.geometry === undefined || place.geometry === null) {
              return;
            }
            if (place) {
              let address_list = place.address_components;

              let addressModel: AddressModel = {
                street_number: isNullOrUndefined(address_list.find(x => x.types[0] === "street_number")) ? null : address_list.find(x => x.types[0] === "street_number").short_name,
                street: isNullOrUndefined(address_list.find(x => x.types[0] === "premises")) ? null : address_list.find(x => x.types[0] === "premises").long_name,
                route: isNullOrUndefined(address_list.find(x => x.types[0] === "route")) ? null : address_list.find(x => x.types[0] === "route").long_name,
                zip: isNullOrUndefined(address_list.find(x => x.types[0] === "postal_code")) ? null : address_list.find(x => x.types[0] === "postal_code").short_name,
                city: isNullOrUndefined(address_list.find(x => x.types[0] === "locality")) ? null : address_list.find(x => x.types[0] === "locality").long_name,
                state: isNullOrUndefined(address_list.find(x => x.types[0] === "administrative_area_level_1")) ? null : address_list.find(x => x.types[0] === "administrative_area_level_1").long_name,
                stateShortName: isNullOrUndefined(address_list.find(x => x.types[0] === "administrative_area_level_1")) ? null : address_list.find(x => x.types[0] === "administrative_area_level_1").short_name,
                logitude: isNullOrUndefined(place.geometry.location.lng()) ? null : place.geometry.location.lng().toString(),
                latitude: isNullOrUndefined(place.geometry.location.lat()) ? null : place.geometry.location.lat().toString(),
                formatted_address: isNullOrUndefined(place) ? null : place.formatted_address,
                notavailablegeometry: null
              }
              this.f.AddressFormControl.setValue(addressModel.street_number + ' ' + addressModel.route);

            }
          });
        });

      });
    }
  }
  Cancel() {
    this.ScrapCompanyForm.reset();
  }
  get f() { return this.ScrapCompanyForm.controls; }
  onStateChange(val) {
    var stformctrl = (<FormControl>this.ScrapCompanyForm.controls['StateFormControl']);

    if (stformctrl.errors && stformctrl.errors['invalidState']) {
      delete stformctrl.errors['invalidState'];
    }

    let statefound = 0;
    var stc = stformctrl.value;

    if (stc && stc.length > 0) {
      for (let state of this.states) {
        if (stc.toLowerCase() == state.State_Code.toLowerCase()) {
          stformctrl.setValue(state, {});
          statefound = 1;
        }

      }

      if (statefound != 1) {
        stformctrl.setErrors({ invalidState: true });
      }
    }

  }
}
interface AddressModel {
  street_number: string
  street: string
  route: string
  zip: string
  city: string
  state: string
  stateShortName: string
  logitude: string
  latitude: string
  formatted_address: string
  notavailablegeometry: string
}
