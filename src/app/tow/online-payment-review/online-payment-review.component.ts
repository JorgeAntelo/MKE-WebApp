import { Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { BsModalService } from 'ngx-bootstrap';
import { DataService } from 'src/app/core/services/data.service';
import { UtilService } from 'src/app/core/services/util.service';
import { Global } from 'src/app/shared/global';
@Component({
  selector: 'app-online-payment-review',
  templateUrl: './online-payment-review.component.html',
  styleUrls: ['./online-payment-review.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class OnlinePaymentReviewComponent implements OnInit {
  ReviewForm: FormGroup;
  RequiredDocsForm: FormGroup;
  ReleaseInstructionsForm: FormGroup;
  ErrorMsg: string;

  SuccessMsgPayment: string;
  SuccessMsgPaymentABC: string;
  documentDetails: any;
  documentUrl: any;
  @ViewChild('templateDocumentView') templateDocumentView: TemplateRef<any>;
  TowingId: number = 0;
  RecordId: string = '';
  uploadSchemaList = [];
  UserId: any = 0;
  OwnerInfoList: any;
  IsInterval: any;
  CommunicationDetails: any;
  CommunicationId: any;
  OnlineCustomerList: any;
  SelectReleaseToInsurance: any=[];
  RequestType: any;

  @Input('RefObject')
  set RefObject(data: any) {
    if (data) {
      this.UserId = data.UserId;
      this.TowingId = data.TowingId;
      this.RecordId = data.RecordId;
      this.RequestType= data.RequestType;
      this.createForm();
    }
  }
  @Output("ReviewClosed") reviewClosed = new EventEmitter<any>();
  submitted = false;
  constructor(private dataService: DataService,
    private sanitizer: DomSanitizer,
    public utilService: UtilService,
    private modalService: BsModalService) {
    this.setHeight();
  }

  ngOnInit() {
    this.LoadSchemaList();
    this.GetDocumentDetails();
    this.GetOwnerDetails();
    this.GetOnlineCustomerDetails();
    this.GetCommunicationDetails();
    this.getReleaseToInsurance();  
    
  }

  setHeight() {
    this.IsInterval = setInterval(() => {
        // first parameter is the message to be passed
        // second paramter is the domain of the parent              
        // in production always pass the target domain for which the message is intended             

        window.top.postMessage(document.body.scrollHeight, Global.PoliceURL);
    }, Global.SetHeightTime);

    // Receive message
    window.addEventListener('message', function (event) {
        this.localStorage.setItem('scroll_top', event.data);
    });
  }

  createForm() {
    this.ReviewForm = new FormGroup({
      StatusFormControl: new FormControl('',[Validators.required]),
      NotesFormControl: new FormControl('', [Validators.required]),
      eTIMEClearanceFormControl: new FormControl(false, [Validators.requiredTrue]),
    });

    this.RequiredDocsForm = new FormGroup({
      RequiredDocuments: new FormControl('', [])
    });

    this.ReleaseInstructionsForm  = new FormGroup({
      ReleaseInstructions: new FormControl('', [])
    });
  }
  get f() { return this.ReviewForm.controls; }
  LoadSchemaList() {
    this.utilService.getShcemaUploadDocument().subscribe(response => {
      this.uploadSchemaList = response.filter(item => item.isVisible == true);
    }, error => this.ErrorMsg = <any>error);
  };

  GetOnlineCustomerDetails() {
    this.dataService.get(Global.DLMS_API_URL + 'Owner/SelectOnlineCustomerDetails?TowingId='+ this.TowingId)
      .subscribe(items => {
        if (items.Code > 0) {
          this.OnlineCustomerList = items.ResponseData;
        }
      },
        error => {
          this.ErrorMsg = <any>error
        });
  }

  GetOwnerDetails() {
    this.dataService.get(Global.DLMS_API_URL + 'Owner/SelectOwnerInfo?TowingId='+ this.TowingId)
      .subscribe(items => {
        if (items.Code > 0) {
          this.OwnerInfoList = items.ResponseData;
        }
      },
        error => {
          this.ErrorMsg = <any>error
        });
  }

  GetCommunicationDetails() {
    this.dataService.get(Global.DLMS_API_URL + 'Communication/SelectCommunicationByTowingId?TowingId='+ this.TowingId)
      .subscribe(items => {
        if (items.Code > 0) {
          this.CommunicationDetails = items.ResponseData[0];
          this.CommunicationId = this.CommunicationDetails.Communication_ID
          this.ReviewForm.controls["StatusFormControl"].setValue(this.CommunicationDetails.Action_taken);
          this.ReviewForm.controls["NotesFormControl"].setValue(this.CommunicationDetails.Comment);
          this.ReviewForm.controls["eTIMEClearanceFormControl"].setValue(this.CommunicationDetails.ETIMEClearance);
          this.RequiredDocsForm.controls["RequiredDocuments"].setValue(this.CommunicationDetails.RequiredDocuments);
          this.ReleaseInstructionsForm.controls["ReleaseInstructions"].setValue(this.CommunicationDetails.ReleaseInstructions);
          console.log(this.CommunicationDetails )
        }
      },
        error => {
          this.ErrorMsg = <any>error
        });
  }

  getReleaseToInsurance() {
  //  this.dataService.get(Global.DLMS_API_URL + 'api/Disposition/SelectReleaseToInsurance?TowingId=' + this.TowingId)
    this.dataService.get(Global.DLMS_API_URL + 'api/Disposition/SelectReleaseToInsuranceFmtc?TowingId=' + this.TowingId)
      .subscribe(res => {
        console.log(res)
        if (res) {
          this.SelectReleaseToInsurance = res;        
        }
        else {
          this.SelectReleaseToInsurance = null;        
                            
        }
      },
        error => (this.ErrorMsg = <any>error));
  }

  Save(IsCLose: boolean) {
    this.ErrorMsg = "";
    this.SuccessMsgPayment = "";
    this.submitted = true;
    this.f.NotesFormControl.markAsTouched();
    this.f.NotesFormControl.updateValueAndValidity();
    if (this.ReviewForm.invalid) {
      return;
    }
    let model: any = {
      CommunicationId: this.CommunicationId,
      TowingId: this.TowingId,
      RecordId: this.RecordId,
      CreatedBy: this.UserId,
      Actiontaken: this.ReviewForm.getRawValue().StatusFormControl,
      Comment: this.ReviewForm.getRawValue().NotesFormControl,
      ETIMEClearance: this.ReviewForm.getRawValue().eTIMEClearanceFormControl,
      Screen: 'PaymentReview',
      CommunicationType: 'Notes',
      CommunicationDate: new Date(),
      RequiredDocuments: this.RequiredDocsForm.controls['RequiredDocuments'].value,
      ReleaseInstructions: this.ReleaseInstructionsForm.controls['ReleaseInstructions'].value
    };
    this.dataService.post(Global.DLMS_API_URL + '/Communication/SaveCommunication', model)
      .subscribe(items => {
        console.log(items)       
        if (items.Code > 0) {
          debugger
          this.SuccessMsgPayment= items.Message.toString(); 
          this.reviewClosed.emit(true);
          this.submitted = false;
          this.ReviewForm.reset();
          this.RequiredDocsForm.reset();
          this.ReleaseInstructionsForm.reset();
          this.LoadSchemaList();
          this.GetDocumentDetails();
          this.GetOwnerDetails();
          this.GetOnlineCustomerDetails();
          this.GetCommunicationDetails();
          this.getReleaseToInsurance();         
          if (IsCLose) {
            this.utilService.modalRef2.hide()
          }
        }
      },
        error => {
          this.ErrorMsg = <any>error
        });
  }

  GetDocumentDetails() {
    this.dataService.get(Global.DLMS_API_URL + 'api/upload/GetDocumentDetails?tid=' + this.TowingId)
      .subscribe(data => {
        this.documentDetails = data;

        if (this.uploadSchemaList.length > 0 && this.documentDetails.length > 0) {
          for (let index = 0; index < this.uploadSchemaList.length; index++) {
            let description = this.uploadSchemaList[index].DocDescription;
            let guid = this.documentDetails.filter(item => item.Doc_Description === description);
            if (guid.length > 0) {
              this.uploadSchemaList[index].DocGuid = guid[0].DocGuid;
            }
            else {
              this.uploadSchemaList[index].DocGuid = 0;
            }
            this.uploadSchemaList[index].isChecked = this.uploadSchemaList[index].DocGuid != undefined && this.uploadSchemaList[index].DocGuid != '' ? true : false;
            this.uploadSchemaList[index].isView = this.uploadSchemaList[index].DocGuid != undefined && this.uploadSchemaList[index].DocGuid != '' ? true : false;
            this.uploadSchemaList[index].isDelete = this.uploadSchemaList[index].DocGuid != undefined && this.uploadSchemaList[index].DocGuid != '' ? true : false;
          }

          this.uploadSchemaList = this.uploadSchemaList.filter((item) => {
            if (item.isView) {
              return item;
            }
          })
        }
      }, error => {

      });
  }

  viewDocument(i) {
    this.documentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(Global.PoliceURL + "Officer/DocViewer.aspx?file=" + this.RecordId + "-" + this.uploadSchemaList[i].DocGuid)
    this.utilService.modalRef = this.modalService.show(this.templateDocumentView, Object.assign({}, this.utilService.config, { class: 'gray modal-lg' }));
    document.getElementById("modal-document").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
  }

  ApproveReleaseToInsurance(IsApprove) {
    this.ErrorMsg = "";
    this.SuccessMsgPayment = "";
    this.submitted = true;

    this.dataService.post(Global.DLMS_API_URL + '/Communication/ApproveReleaseToInsurance', { IsApprove: IsApprove, TowId: this.TowingId, CreatedBy: this.UserId, })
      .subscribe(items => {
        if (items.Code > 0) {
          this.SuccessMsgPayment = items.Message;
          this.submitted = false;
          this.getReleaseToInsurance();
        }
      },
        error => {
          this.ErrorMsg = <any>error
        });
  }
}
