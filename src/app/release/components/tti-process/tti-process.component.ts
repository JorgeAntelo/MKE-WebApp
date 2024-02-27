import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { CommunicationService } from 'src/app/core/services/app.communication.service';
import { DataService } from 'src/app/core/services/data.service';
import { Global } from 'src/app/shared/global';
import signature from './../../../../assets/js/signature';

@Component({
  selector: 'app-tti-process',
  templateUrl: './tti-process.component.html',
  styleUrls: ['./tti-process.component.css']
})
export class TtiProcessComponent implements OnInit {
  ReleaseToTTIForm: FormGroup;
  VehicleStatus: string = 'Received';
  UserId: number;
  DispositionTowId: string;
  RecordId: string;
  ReleaseToTTI = 'ReleaseToTTI';
  TowId: number;
  ModalErrorMsg: string;
  ModalSuccessMsg: string;
  noInsuranceSubmitted: boolean;
  ParentScreenName: any;
  tticurrSignature: string;
  SelectReleaseToTTI: any;
  ReleaseToTTIId: number;
  ErrorMsg: any;
  isReadonly = false;
  OwnerList: any = [];
  @Input('userId')
  set userId(data: any) {
    if (data) {
      this.UserId = Number(data);
    }
  }

  @Input('towId')
  set towId(data: any) {
    if (data) {
      this.TowId = Number(data);
    }
  }

  @Input('recordId')
  set recordId(data: any) {
    if (data) {
      this.RecordId = String(data);
    }
  }

  @Input('vehicleStatus')
  set vehicleStatus(data: any) {
    if (data) {
      this.VehicleStatus = String(data);
    }
  }
  @Input('parentScreenName')
  set parentScreenName(data: any) {
    if (data) {
      this.ParentScreenName = data;
      console.log(this.ParentScreenName);
    }
  }
  hasUploadPermission = false;
  @Input('HasUploadPermission')
  set HasUploadPermission(data: any) {
    if (data) {
      this.hasUploadPermission = Boolean(data);
    }
  }
  hasScanPermission = false;
  @Input('HasScanPermission')
  set HasScanPermission(data: any) {
    if (data) {
      this.hasScanPermission = Boolean(data);
    }
  }
  @Output() closeEvent = new EventEmitter<string>();

  constructor(private fb: FormBuilder,
    private _dataService: DataService,
    public sanitizer: DomSanitizer,
    private datePipe: DatePipe,
    private commService: CommunicationService) { }

  ngOnInit() {
    this.createForm();
    this.getReleaseToTTI(Number(this.TowId));
    this.LoadOwner();
  }

  createForm() {
    this.ReleaseToTTIForm = this.fb.group({
      NotesFormControl: [''],
      OwnerNameFormControl: ['', [Validators.required]],
      cashierFormControl: [''],
      transactionDateFormControl: [''],
    });
  }

  LoadOwner() {
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/SelectReleaseToName?TowId=' + this.TowId + '&Type=O')
      .subscribe(res => {
        if (res && res.length > 0) {
          this.OwnerList = res;
        } else {
          this.OwnerList = [];
        }
      },
        error => (this.ErrorMsg = <any>error));
  }

  isReleaseToTTIVisible(ind) {
    if (ind == 'Sign' || ind == 'Save' || ind == 'Close' || (ind == 'Delete' && this.ReleaseToTTIId > 0)) {
      if (this.VehicleStatus == 'Received') {
        return true;
      }
      else {
        return false;
      }
    }

    if (ind == 'Delete') {
      if (this.VehicleStatus == 'Received' && this.ReleaseToTTIId > 0) {
        return true;
      }
      else {
        return false;
      }
    }
  }

  get nif() { return this.ReleaseToTTIForm.controls; }

  SaveTTI() {
    this.ModalErrorMsg = this.ModalSuccessMsg = '';
    const resultDiv = document.getElementById("result") as HTMLDivElement;
    resultDiv.innerHTML = '';
    resultDiv.className = '';

    const ele = document.getElementById("sigImageData") as HTMLTextAreaElement;
    this.noInsuranceSubmitted = true;
    if (this.ReleaseToTTIForm.invalid) {
      return;
    }
    let model: ReleaseToInsuranceModel = new ReleaseToInsuranceModel();
    model.Id = this.ReleaseToTTIId;
    model.TowId = Number(this.TowId);
    model.Notes = this.nif.NotesFormControl.value;
    model.Name = this.nif.OwnerNameFormControl.value;
    if (ele) {
      model.Signature = ele.value;
    } else {
      model.Signature = '';
    }
    model.UserId = this.UserId;
    this._dataService.post(Global.DLMS_API_URL + 'api/Disposition/ReleaseToTTI', model)
      .subscribe(res => {
        if (res && Number(res.Id) > 0) {
          this.ModalSuccessMsg = 'Save Successfully';
          this.noInsuranceSubmitted = false;
          this.commService.sendReleaseCheckListDataUpdation([{ TTI: 'Update' }]);
          this.getReleaseToTTI(Number(this.TowId));
          this.ReleaseToTTIId = res.Id;
        }
        else {
          this.ModalErrorMsg = 'Error';
          this.noInsuranceSubmitted = false;
        }
      }, error => {
        this.ModalErrorMsg = 'Error';
        this.noInsuranceSubmitted = false;
      });
  }

  getReleaseToTTI(towId) {
    this.ReleaseToTTIId = 0;
    this.SelectReleaseToTTI = null;
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/SelectReleaseToTTI?TowingId=' + towId)
      .subscribe(res => {
        if (res) {
          this.SelectReleaseToTTI = res;
          this.nif.NotesFormControl.setValue(this.SelectReleaseToTTI.Notes);
          this.nif.OwnerNameFormControl.setValue(this.SelectReleaseToTTI.OwnerName);
          this.nif.cashierFormControl.setValue(this.SelectReleaseToTTI.Cashier);
          this.nif.transactionDateFormControl.setValue(this.datePipe.transform(this.SelectReleaseToTTI.CreatedDate, 'MM/dd/yyyy hh:mm a'));
          this.ReleaseToTTIId = this.SelectReleaseToTTI.Id;
          this.tticurrSignature = 'data:image/jpg;base64,' + (this.sanitizer.bypassSecurityTrustResourceUrl(this.SelectReleaseToTTI.Signature) as any).changingThisBreaksApplicationSecurity;
        }
        else {
          this.SelectReleaseToTTI = null;
        }
        //this.releaseToInsurancePush();
      },
        error => (this.ErrorMsg = <any>error));
  }

  printReleaseToTTI() {
    window.open('' + Global.ZebraPrintReportPath + '?reportName=TTIProcess&showpdf=false&rendertopdf=false&TowId=' + this.TowId, '_blank');
  }

  deleteReleaseToTTI() {
    this.ModalErrorMsg = this.ModalSuccessMsg = '';
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/DeleteReleaseToTTI?TowId=' + Number(this.TowId) + '&Id=' + this.ReleaseToTTIId + '&UserId=' + this.UserId)
      .subscribe(res => {
        if (res && Number(res.Id) > 0) {
          this.ModalSuccessMsg = 'Deleted Successfully';
          this.ReleaseToTTIId = 0;
          this.SelectReleaseToTTI = null;
          this.ReleaseToTTIForm.reset();
          this.noInsuranceSubmitted = false;

          this.commService.sendReleaseCheckListDataUpdation([{ TTI: 'Delete' }]);
          this.getReleaseToTTI(Number(this.TowId));
        }
        else {
          this.ModalErrorMsg = 'Error';
        }
      },
        error => {
          this.ModalErrorMsg = 'Error';
        });
  }

  onTTISignature() {
    signature.onSign();
  }

  onTTISignatureDone(ind) {
    signature.onDone(ind);
  }

  closeReleaseToTTIRef() {
    this.closeEvent.emit();
  }

}

class ReleaseToInsuranceModel {
  Id: number;
  TowId: number;
  Notes: string;
  Name: string;
  Signature: string;
  UserId: number;
}
