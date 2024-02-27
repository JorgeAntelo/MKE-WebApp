import { Component, OnInit, TemplateRef, NgZone, ViewChild, ElementRef, Input, Output, EventEmitter } from "@angular/core";
import { FormControl, FormGroup, FormArray, Validators, FormBuilder, AbstractControl, ValidatorFn } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Global } from "src/app/shared/global";
import { DataService } from "src/app/core/services/data.service";
import { AgmCoreModule, MapsAPILoader } from "@agm/core";
import { } from 'googlemaps';
import { isNullOrUndefined } from "util";
import { DatePipe } from '@angular/common';
import { CommunicationService } from "src/app/core/services/app.communication.service";
import { Subscription } from "rxjs";

@Component({
    selector: 'app-permit_test',
    templateUrl: './permit_test.component.html',
    styleUrls: ['./permit_test.component.css'],
    providers: []
})
export class PermitTestComponent implements OnInit {
    public config = {
        animated: true,
        keyboard: false,
        backdrop: true,
        ignoreBackdropClick: true
    };
    @ViewChild('blockStreetAddress') blockStreetAddressElementRef: ElementRef;
    set address(elRef: ElementRef) {
        this.blockStreetAddressElementRef = elRef;
    }
    phonemask: any[] = Global.phonemask;
    permitInfoList = [];
    PermitId = 0;
    permitIndex: number;
    submitted = false;
    submittedPopup = false;
    PermitForm: FormGroup;
    PermitInfoForm: FormGroup;
    YearList = [];
    MakeList = [];
    ModelList = [];
    ColorList = [];
    StateList = [];
    PlateTypeList = [];
    BodyTypeList = [];
    PermitTypeList = [];
    ErrorMsg: string;
    SuccessMsg: string;
    error: any = { isError: false, errorMessage: '' };
    UserId: number;
    public modalPermitInfoRef: BsModalRef;
    hfUserId: HTMLInputElement;
    PaymentListDetails = [];
    PermitDetailsId: number;
    defaultState = Global.DefaultState;
    servicePaymentData: any;
    subscription: Subscription;
    @Input('userId')
    set userId(data: any) {
        if (data) {
            this.UserId = Number(data);
        }
    }

    ParentScreenName: string;
    @Input('parentScreenName')
    set parentScreenName(data: any) {
        if (data) {
            this.ParentScreenName = data;
        }
    }
    
    VehicleStatus:string;
    @Input('vehicleStatus')
    set vehicleStatus(data: any) {
        if (data) {
            this.VehicleStatus = String(data);
        }
    }

    constructor(
        private formBuilder: FormBuilder,
        private modalService: BsModalService,
        private _dataService: DataService,
        private mapsAPILoader: MapsAPILoader,
        private ngZone: NgZone,
        private commService: CommunicationService) {
        this.subscription = this.commService.getPaymentPermitData().subscribe(res => {
            if (res) {
                this.servicePaymentData = res.payment;
                this.SuccessMsg = this.servicePaymentData.SuccessMsg;
                this.ErrorMsg = this.servicePaymentData.ErrorMsg;
                this.f.applicationNoFormControl.setValue(this.servicePaymentData.ApplicationNo);
                this.getPermitByPermitId(this.servicePaymentData.PermitId);
            }
        });
        this.subscription = this.commService.getClearCashiering().subscribe(res => {
            if (res) {
                this.PermitForm.reset();
                this.ErrorMsg = this.SuccessMsg = '';
                this.submitted = false;
                const control = <FormArray>this.PermitForm.controls['permitVehInfoListArray'];
                control.controls = [];
                control.push(this.initVehicleInfoItem('', '', '', '', '', '', '', '', '', '', '', '', ''));

                this.loadDropdowns();
            }
        });
    }

    ngOnInit(): void {
        this.initForm();
        this.loadDropdowns();
        this.googleAutoComplete();
    }

    get permitVehInfoListArrayformData() {
        return <FormArray>this.PermitForm.get('permitVehInfoListArray');
    }

    get f() { return this.PermitForm.controls; }

    initForm() {
        this.PermitForm = this.formBuilder.group({
            firstNameFormControl: ['', Validators.required],
            middleNameFormControl: [''],
            lastNameFormControl: ['', Validators.required],
            applicationNoFormControl: [''],
            blockStreetFormControl: ['', Validators.required],
            cityFormControl: ['', Validators.required],
            stateFormControl: ['', Validators.required],
            zipFormControl: ['', Validators.required],
            phoneFormControl: ['', Validators.compose([Validators.required, Validators.pattern(Global.PHONE_REGEX)])],
            emailFormControl: ['', Validators.compose([Validators.required, Validators.pattern(Global.EMAIL_REGEX)])],
            dlNumFormControl: ['', Validators.required],
            dlStateFormControl: ['', Validators.required],
            dlExptDateFormControl: ['', Validators.required],
            // dlPhoneFormControl: ['', Validators.compose([Validators.required, Validators.pattern(Global.PHONE_REGEX)])],
            // dlEmailFormControl: ['', Validators.compose([Validators.required, Validators.pattern(Global.EMAIL_REGEX)])],
            permitVehInfoListArray: this.formBuilder.array([])
        });

        const control = <FormArray>this.PermitForm.controls['permitVehInfoListArray'];
        control.controls = [];

        control.push(this.initVehicleInfoItem('', '', '', '', '', '', '', '', '', '', '', '', ''));
    }

    initVehicleInfoItem(licensePlate, state, plateType, bodyType, year, make, model, color, permitType, permitFee, permitNo, effectiveDate, expDate) {
        return this.formBuilder.group({
            licensePlateFormControl: new FormControl(licensePlate, Validators.required),
            stateFormControl: new FormControl(state, Validators.required),
            plateTypeFormControl: new FormControl(plateType, Validators.required),
            bodyTypeFormControl: new FormControl(bodyType, Validators.required),
            yearFormControl: new FormControl(year, Validators.required),
            makeFormControl: new FormControl(make, Validators.required),
            modelFormControl: new FormControl(model),
            colorFormControl: new FormControl(color, Validators.required),
            permitTypeFormControl: new FormControl(permitType, Validators.required),
            permitFeeFormControl: new FormControl(permitFee, Validators.required),
            permitNoFormControl: new FormControl(permitNo),
            effectiveDateFormControl: new FormControl(effectiveDate, Validators.compose([Validators.required, DateValidator.pastDateValidation])),
            expDateFormControl: new FormControl(expDate, Validators.compose([Validators.required, DateValidator.pastDateValidation]))
        }, { validator: this.dateLessThan('effectiveDateFormControl', 'expDateFormControl') });
    }

    dateLessThan(from: string, to: string) {
        return (group: FormGroup): { [key: string]: any } => {
            let f = group.controls[from];
            let t = group.controls[to];
            if (f.value > t.value) {
                return {
                    datelessThan: true
                };
            }
            return {};
        }
    }

    openPermitInfo(template: TemplateRef<any>, index: number) {
        this.submitted = false;
        this.submittedPopup = false;
        this.permitIndex = index;
        this.modalPermitInfoRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
    }

    loadDropdowns() {
        this.loadState(0, 0);
        this.loadColor(0, 0);
        this.loadMake(0, 0, 0);
        this.loadBodyType(0, 0);
        this.loadPlateType(0, 0);
        this.loadPermitType(0, 0);
    }

    loadState(StateId, index) {
        this._dataService.get(Global.DLMS_API_URL + 'api/Request/GetState?CountryId=1')
            .subscribe(states => {
                this.StateList = states;
                if (StateId > 0) {
                    for (let obj of this.StateList[index]) {
                        if (StateId == obj.StateId) {
                            this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['stateFormControl'].setValue(obj, {});
                        }
                    }
                }
                else {
                    let data = this.StateList.filter(x => x.State_Code == this.defaultState);
                    this.f.stateFormControl.setValue(data[0], {});
                    this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['stateFormControl'].setValue(data[0], {});
                }
            },
                error => this.ErrorMsg = <any>error);
    }

    loadColor(colorId, index) {
        this._dataService.get(Global.DLMS_API_URL + 'api/Color')
            .subscribe(colors => {
                this.ColorList = colors;
                if (colorId > 0) {
                    for (let obj of this.ColorList[index]) {
                        if (colorId == obj.Color_Id) {
                            this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['colorFormControl'].setValue(obj, {});
                        }
                    }
                }
            },
                error => this.ErrorMsg = <any>error);
    }

    loadMake(makeid, modelid, index) {
        this._dataService.get(Global.DLMS_API_URL + 'api/Make')
            .subscribe(result => {
                if (result != null && result.length > 0) {
                    this.MakeList = result;
                }
                if (makeid > 0) {
                    for (let obj of this.MakeList[index]) {
                        if (modelid == obj.Make_Id) {
                            this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['makeFormControl'].setValue(obj, {});
                        }
                    }
                }
            },
                error => {
                    this.ErrorMsg = <any>error
                });

    }

    onMakeChange(index: number) {
        let make = this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['makeFormControl'].value;
        this.loadModel(Number(make.Make_Id), 0, index);
        // let data = this.MakeList.filter((x) => Number(x.Make_Id) == Number(make.Make_Id));
        // this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['modelFormControl'].setValue(null);
    }

    loadModel(makeid, modelid, index) {
        this._dataService.get(Global.DLMS_API_URL + 'api/Model/?MakeId=' + makeid)
            .subscribe(result => {
                if (result != null && result.length > 0) {
                    this.ModelList[index] = result;
                }
                if (modelid > 0) {
                    for (let obj of this.ModelList[index]) {
                        if (modelid == obj.Model_Id) {
                            this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['modelFormControl'].setValue(obj, {});
                        }
                    }
                }
            },
                error => {
                    this.ErrorMsg = <any>error
                });
    }

    onPermitType(index) {
        let permitType = this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['permitTypeFormControl'].value;
        this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['permitFeeFormControl'].setValue(permitType.PermitFee);
    }

    loadYear() {

    }

    loadBodyType(bodyTypeId, index) {
        this._dataService.get(Global.DLMS_API_URL + 'api/Common/GetStyles')
            .subscribe(result => {
                if (result != null && result.length > 0) {
                    this.BodyTypeList = result;
                }
                if (bodyTypeId > 0) {
                    for (let obj of this.BodyTypeList[index]) {
                        if (bodyTypeId == obj.BodyTypeID) {
                            this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['bodyTypeFormControl'].setValue(obj, {});
                        }
                    }
                }
            },
                error => {
                    this.ErrorMsg = <any>error
                });
    }

    loadPermitType(permitTypeId, index) {
        this._dataService.get(Global.DLMS_API_URL + 'api/Common/GetPermitType')
            .subscribe(result => {
                if (result != null && result.length > 0) {
                    this.PermitTypeList = result;
                }
                if (permitTypeId > 0) {
                    for (let obj of this.PermitTypeList[index]) {
                        if (permitTypeId == obj.PermitTypeID) {
                            this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['permitTypeFormControl'].setValue(obj, {});
                        }
                    }
                }
            },
                error => {
                    this.ErrorMsg = <any>error
                });
    }

    loadPlateType(plateTypeId, index) {
        this._dataService.get(Global.DLMS_API_URL + 'api/Common/GetPlateType')
            .subscribe(result => {
                if (result != null && result.length > 0) {
                    this.PlateTypeList = result;
                } if (plateTypeId > 0) {
                    for (let obj of this.PlateTypeList[index]) {
                        if (plateTypeId == obj.PlateTypeID) {
                            this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['plateTypeFormControl'].setValue(obj, {});
                        }
                    }
                }
            },
                error => {
                    this.ErrorMsg = <any>error
                });
    }

    SavePermit() {
        this.ErrorMsg = this.SuccessMsg = '';
        this.submitted = true;
        // reset alerts on submit
        // stop here if form is invalid
        if (this.PermitForm.invalid) {
            // this.alertService.error('Please select seach by seller');
            return;
        }

        let permitModel: CashieringPermitModel = new CashieringPermitModel();
        permitModel.firstName = this.f.firstNameFormControl.value;
        permitModel.middleName = this.f.middleNameFormControl.value;
        permitModel.lastName = this.f.lastNameFormControl.value;
        permitModel.blockStreet = this.f.blockStreetFormControl.value;
        permitModel.city = this.f.cityFormControl.value;
        permitModel.stateId = this.f.stateFormControl.value.StateId;
        permitModel.zip = this.f.zipFormControl.value;
        if (this.f.phoneFormControl.value) {
            permitModel.phone = this.f.phoneFormControl.value.replace("(", "").replace(") ", "").replace("-", "");
        } else {
            permitModel.phone = null;
        }        
        permitModel.email = this.f.emailFormControl.value;
        permitModel.dlNum = this.f.dlNumFormControl.value;
        permitModel.dlStateId = this.f.dlStateFormControl.value.StateId;
        permitModel.dlExpDate = this.f.dlExptDateFormControl.value;
        permitModel.dlMobileNo = '' //this.f.dlPhoneFormControl.value.replace("(", "").replace(") ", "").replace("-", "");
        permitModel.dlEmail = '' // this.f.dlEmailFormControl.value;
        permitModel.UserId = this.UserId;

        let permitVehInfoList = [];
        const control = <FormArray>this.PermitForm.controls['permitVehInfoListArray'];
        for (let index = 0; index < control.length; index++) {
            //const element = control[index];     
            const element = control.controls[index].value;
            let permitDetailModel: CashieringPermitDetailModel = new CashieringPermitDetailModel();

            permitDetailModel.PermitId = this.PermitId;
            permitDetailModel.licensePlate = element.licensePlateFormControl;
            permitDetailModel.stateId = element.stateFormControl.StateId;
            permitDetailModel.plateTypeId = element.plateTypeFormControl.PlateTypeID;
            permitDetailModel.bodyTypeId = element.bodyTypeFormControl.Style_Id;
            permitDetailModel.year = element.yearFormControl;
            permitDetailModel.makeId = element.makeFormControl.Make_Id;
            permitDetailModel.modelId = element.modelFormControl.Model_Id;
            permitDetailModel.colorId = element.colorFormControl.Color_Id;
            permitDetailModel.permitTypeId = element.permitTypeFormControl.PermitTypeID;
            permitDetailModel.permitFee = element.permitFeeFormControl;
            permitDetailModel.effectiveDate = element.effectiveDateFormControl;
            permitDetailModel.expDate = element.expDateFormControl;
            permitVehInfoList.push(permitDetailModel);
            console.log(permitDetailModel);
        }
        permitModel.permitVehInfoListArray = permitVehInfoList;

        this.PermitId = 0;
        this._dataService.post(Global.DLMS_API_URL + 'api/Cashiering/SavePermit', permitModel).subscribe(result => {
            if (result.Id > 0) {
                // console.log(result);
                this.SuccessMsg = result.Result;
                this.f.applicationNoFormControl.setValue(result.ApplicationNo);
                this.PermitId = result.Id;
                this.getPermitByPermitId(this.PermitId);
            } else {
                this.ErrorMsg = result.result;
                this.f.applicationNoFormControl.setValue('');
            }
        },
            error => {
                this.ErrorMsg = <any>error;
                this.f.applicationNoFormControl.setValue('');
            });

    }

    AddToCart() {
        this.ErrorMsg = this.SuccessMsg = '';
        this.submitted = true;
        // reset alerts on submit
        // stop here if form is invalid
        if (this.PermitForm.invalid) {
            // this.alertService.error('Please select seach by seller');
            return;
        }

        let permitModel: CashieringPermitModel = new CashieringPermitModel();
        permitModel.firstName = this.f.firstNameFormControl.value;
        permitModel.middleName = this.f.middleNameFormControl.value;
        permitModel.lastName = this.f.lastNameFormControl.value;
        permitModel.blockStreet = this.f.blockStreetFormControl.value;
        permitModel.city = this.f.cityFormControl.value;
        permitModel.stateId = this.f.stateFormControl.value.StateId;
        permitModel.zip = this.f.zipFormControl.value;
        permitModel.phone = this.f.phoneFormControl.value.replace("(", "").replace(") ", "").replace("-", "");
        permitModel.email = this.f.emailFormControl.value;

        permitModel.dlNum = this.f.dlNumFormControl.value;
        permitModel.dlStateId = this.f.dlStateFormControl.value.StateId;
        permitModel.dlExpDate = this.f.dlExptDateFormControl.value;
        permitModel.dlMobileNo = '' //this.f.dlPhoneFormControl.value.replace("(", "").replace(") ", "").replace("-", "");
        permitModel.dlEmail = '' // this.f.dlEmailFormControl.value;
        permitModel.UserId = this.UserId;

        let permitVehInfoList = [];
        const control = <FormArray>this.PermitForm.controls['permitVehInfoListArray'];
        for (let index = 0; index < control.length; index++) {
            //const element = control[index];     
            const element = control.controls[index].value;
            let permitDetailModel: CashieringPermitDetailModel = new CashieringPermitDetailModel();

            permitDetailModel.PermitId = this.PermitId;
            permitDetailModel.licensePlate = element.licensePlateFormControl;
            permitDetailModel.stateId = element.stateFormControl.StateId;
            permitDetailModel.plateTypeId = element.plateTypeFormControl.PlateTypeID;
            permitDetailModel.bodyTypeId = element.bodyTypeFormControl.Style_Id;
            permitDetailModel.year = element.yearFormControl;
            permitDetailModel.makeId = element.makeFormControl.Make_Id;
            permitDetailModel.modelId = element.modelFormControl.Model_Id;
            permitDetailModel.colorId = element.colorFormControl.Color_Id;
            permitDetailModel.permitTypeId = element.permitTypeFormControl.PermitTypeID;
            permitDetailModel.permitFee = element.permitFeeFormControl;
            permitDetailModel.effectiveDate = element.effectiveDateFormControl;
            permitDetailModel.expDate = element.expDateFormControl;
            permitVehInfoList.push(permitDetailModel);
            console.log(permitDetailModel);
        }
        permitModel.permitVehInfoListArray = permitVehInfoList;

        let permitsData = {
            'totalofPermits': this.getSum(),
            'permitModel': permitModel
        }

        this.commService.sendPermitsData(permitsData);
        this.SuccessMsg = 'Permit(s) added to cart';
    }

    getPermitByPermitId(permitId) {
        this._dataService.get(Global.DLMS_API_URL + 'api/Cashiering/GetPermit?PermitId=' + permitId).subscribe(res => {
            // console.log(res);
            this.PaymentListDetails = res[1];
            this.PaymentListDetails.forEach((element, index) => {
                // const control = <FormArray>this.PermitForm.controls['permitVehInfoListArray'];
                this.PermitDetailsId = element.PermitDetailsId;
                this.loadModel(Number(element.MakeID), Number(element.ModelID), index);
                // this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['licensePlateFormControl'].setValue();
                // this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['stateFormControl'].setValue();
                // this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['plateTypeFormControl'].setValue();
                // this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['bodyTypeFormControl'].setValue();
                // this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['yearFormControl'].setValue();
                // this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['makeFormControl'].setValue();
                // this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['modelFormControl'].setValue();
                // this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['colorFormControl'].setValue();
                // this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['permitTypeFormControl'].setValue();
                // this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['permitFeeFormControl'].setValue();
                this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['permitNoFormControl'].setValue(element.PermitNo);
                // this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['effectiveDateFormControl'].setValue();
                // this.PermitForm.controls.permitVehInfoListArray['controls'][index].controls['expDateFormControl'].setValue();
                // this.initVehicleInfoItem(element.LicensePlate, element.StateId, element.PlateTypeID, element.BodyTypeID, element.Year, element.MakeID, element.ModelID, element.ColorID, element.permitTypeId, element.permitFee, element.PermitNo, element.effectiveDate, element.expDate)
                // control[index](this.initVehicleInfoItem(element.LicensePlate, element.StateId, element.PlateTypeID, element.BodyTypeID, element.Year, element.MakeID, element.ModelID, element.ColorID, element.permitTypeId, element.permitFee, element.PermitNo, element.effectiveDate, element.expDate));
            });
        },
            error => {
                this.ErrorMsg = <any>error;
            });
    }

    printPermit() {
        window.open('' + Global.ReportPath + '?reportName=PermitApplication&showpdf=false&rendertopdf=false&PermitId=' + this.PermitId, '_blank');
    }

    integerOnly(event) {
        const e = <KeyboardEvent>event;
        if (e.key === 'Tab' || e.key === 'TAB') {
            return;
        }
        if ([46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A
            //(e.keyCode === 65 && e.ctrlKey === true) ||
            // Allow: Ctrl+C
            //(e.keyCode === 67 && e.ctrlKey === true) ||
            // Allow: Ctrl+V
            //(e.keyCode === 86 && e.ctrlKey === true) ||
            // Allow: Ctrl+X
            (e.keyCode === 88 && e.ctrlKey === true)) {
            // let it happen, don't do anything
            return;
        }
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(e.key) === -1) {
            e.preventDefault();
        }
    }

    AddNewPermitInfoRow() {
        this.ErrorMsg = this.SuccessMsg = '';
        this.submitted = false;
        let data = this.StateList.filter(x => x.State_Code == this.defaultState);
        const control = <FormArray>this.PermitForm.controls['permitVehInfoListArray'];
        control.push(this.initVehicleInfoItem('', data[0], '', '', '', '', '', '', '', '', '', '', ''));
    }

    copyRow(index: number) {
        const control = <FormArray>this.PermitForm.controls['permitVehInfoListArray'];
        this.ErrorMsg = this.SuccessMsg = '';
        this.submitted = true;
        if (control.invalid) {
            return;
        }
        const controlFormArray = <FormArray>this.PermitForm.controls['permitVehInfoListArray']['controls'][index];
        // console.log(controlFormArray);
        this.loadModel(Number(controlFormArray.controls['makeFormControl'].value.Make_Id), Number(controlFormArray.controls['modelFormControl'].value.Model_Id), index + 1);
        control.push(this.initVehicleInfoItem(controlFormArray.controls['licensePlateFormControl'].value, controlFormArray.controls['stateFormControl'].value, controlFormArray.controls['plateTypeFormControl'].value, controlFormArray.controls['bodyTypeFormControl'].value, controlFormArray.controls['yearFormControl'].value, controlFormArray.controls['makeFormControl'].value, controlFormArray.controls['modelFormControl'].value, controlFormArray.controls['colorFormControl'].value, controlFormArray.controls['permitTypeFormControl'].value, controlFormArray.controls['permitFeeFormControl'].value, '', controlFormArray.controls['effectiveDateFormControl'].value, controlFormArray.controls['expDateFormControl'].value));
    }

    deleteRow(index: number) {
        const control = <FormArray>this.PermitForm.controls['permitVehInfoListArray'];
        control.controls.splice(index, 1);
    }

    googleAutoComplete() {
        if (Global.GoogleMapAPIKey != '') {
            // this.blockStreetAddressElementRef.nativeElement.focus();
            this.mapsAPILoader.load().then(() => {
                const autocomplete: any = new google.maps.places.Autocomplete(this.blockStreetAddressElementRef.nativeElement, {
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
                            this.f.blockStreetFormControl.setValue(addressModel.street_number + ' ' + addressModel.route);
                            this.f.cityFormControl.setValue(addressModel.city);
                            let stateFilter = this.StateList.filter(x => x.State_Code == addressModel.stateShortName);
                            if (stateFilter.length > 0) {
                                this.f.stateFormControl.setValue(stateFilter[0]);
                            } else {
                                this.f.stateFormControl.setValue('');
                            }
                            this.f.zipFormControl.setValue(addressModel.zip);
                            document.getElementById("maplat").innerHTML = addressModel.latitude;
                            document.getElementById("maplong").innerHTML = addressModel.logitude;
                        }
                    });
                });

            });
        }
    }

    getSum() {
        let sum = 0;
        const control = <FormArray>this.PermitForm.controls['permitVehInfoListArray'];
        for (let index = 0; index < control.length; index++) {
            //const element = control[index];     
            const element = control.controls[index].value;
            if (element.permitFeeFormControl) {
                sum += Number(element.permitFeeFormControl);
            } else {
                sum += Number(0);
            }
        }
        return sum;
    }
}

export class DateValidator {
    // static ptDate(control: FormControl): { [key: string]: any } {
    //     let ptDatePattern = /^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/g;

    //     if (!control.value.match(ptDatePattern))
    //         return { "ptDate": true };

    //     return null;
    // }

    // static usDate(control: FormControl): { [key: string]: any } {
    //     let usDatePattern = /^02\/(?:[01]\d|2\d)\/(?:19|20)(?:0[048]|[13579][26]|[2468][048])|(?:0[13578]|10|12)\/(?:[0-2]\d|3[01])\/(?:19|20)\d{2}|(?:0[469]|11)\/(?:[0-2]\d|30)\/(?:19|20)\d{2}|02\/(?:[0-1]\d|2[0-8])\/(?:19|20)\d{2}$/;

    //     if (!control.value.match(usDatePattern))
    //         return { "usDate": true };

    //     return null;
    // }

    // static dateLessThan(dateField1: string, dateField2: string, validatorField: { [key: string]: boolean }): ValidatorFn {
    //     return (c: AbstractControl): { [key: string]: boolean } | null => {
    //         const date1 = c.get(dateField1).value;
    //         const date2 = c.get(dateField2).value;
    //         if ((date1 !== null && date2 !== null) && date1 > date2) {
    //             return validatorField;
    //         }
    //         return null;
    //     };
    // }

    static pastDateValidation(control: FormControl): { [key: string]: boolean } | null {
        let currentDate = new Date();
        let mon = currentDate.getMonth() + 1;
        let day = currentDate.getDate();
        var dateString = currentDate.getFullYear() + "-" + (mon < 9 ? ('0' + (currentDate.getMonth() + 1)) : mon) + "-" + (day < 9 ? ('0' + currentDate.getDate()) : day) //output : 2018-02-13        
        if (Date.parse(control.value) < Date.parse(dateString)) {
            return {
                pastDate: true
            }
        }
        else {
            return null;
        }
    }
}

class CashieringPermitModel {
    firstName: string;
    middleName: string;
    lastName: string;
    blockStreet: string;
    city: string;
    stateId: number;
    zip: number;
    phone: string;
    email: string;
    dlNum: string;
    dlStateId: number;
    dlExpDate: string;
    dlMobileNo: string;
    dlEmail: string;
    UserId: number;
    permitVehInfoListArray: CashieringPermitDetailModel[];
}

class CashieringPermitDetailModel {
    PermitId: number;
    permitTypeId: any;
    permitFee: any;
    effectiveDate: any;
    expDate: any;
    licensePlate: any;
    stateId: any;
    plateTypeId: any;
    bodyTypeId: any;
    year: any;
    makeId: any;
    modelId: any;
    colorId: any;
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