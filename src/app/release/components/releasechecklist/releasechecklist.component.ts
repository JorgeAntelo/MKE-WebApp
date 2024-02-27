import { Component, OnInit, TemplateRef, ViewChild, Input, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormArray, Validators, FormBuilder } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { Global } from 'src/app/shared/global';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'angular-2-local-storage';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DomSanitizer } from '@angular/platform-browser';
import twainscanner from '../../../../assets/js/twainscanner';
import { Subscription } from 'rxjs';
import { CommunicationService } from 'src/app/core/services/app.communication.service';
declare var $: any;
//declare var Dynamsoft: any;

@Component({
  selector: 'app-releasechecklist',
  templateUrl: './releasechecklist.component.html',
  styleUrls: ['./releasechecklist.component.css'],
  providers: []
})
export class ReleaseChecklistComponent implements OnInit,AfterViewInit, OnChanges,OnDestroy {

  documentUrl: any;
  DLMSPath = Global.PoliceURL;
  clsList = [];
  uploadedDocs = [];
  checkListErrorMsg: string;
  checkListSuccessMsg: string;
  documentDetails: any;
  loading: number;
  deleteloading: number;
  scanLoading: number;
  viewLoading: number;
  LoaderImage: string;
  ModalLoaderImage: string;
  indLoading = false;
  PageId: number;
  RoleId: number;
  UserId: number;
  Guid: string;
  //ddocsUrl: string;
  EnterpriseId: number;
  UserName: string;
  TowId: number;
  RecordId: string;
  ParentScreenName: string;
  hasUploadPermission:boolean=false;
  hasScanPermission:boolean=false;
  @ViewChild('templateDocumentViewer') modaltemplateDocumentViewerRef: BsModalRef;
  public config = {
    animated: true,
    keyboard: false,
    backdrop: true,
    ignoreBackdropClick: true
  };
  param: any;

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

  @Input() parentScreenName:string
  // set parentScreenName(data: any) {
  //   if (data) {
  //     this.ParentScreenName = data;
  //   }
  // }

  VehicleStatus: string;
  @Input('vehicleStatus')
  set vehicleStatus(data: any) {
    if (data) {
      this.VehicleStatus = String(data);
    }
  }
  @Input('HasUploadPermission')
  set HasUploadPermission(data: any) {
    if (data) {
      this.hasUploadPermission = Boolean(data);
    }
  }
  @Input('HasScanPermission')
  set HasScanPermission(data: any) {
    if (data) {
      this.hasScanPermission = Boolean(data);
    }
  }

  subscription: Subscription;
  constructor(private _dataService: DataService,
    public sanitizer: DomSanitizer,
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private ref: ChangeDetectorRef,
    private commService: CommunicationService) {

    this.LoaderImage = this.ModalLoaderImage = Global.FullImagePath;
    this.documentUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
    this.activatedRoute.queryParams.subscribe(params => {
      this.PageId = params.PageId;
      this.RoleId = params.RoleId;
      this.TowId = params.TID;
      this.UserId = params.uid;
      //this.ddocsUrl = Global.ddocsUrl;
      if (params.Id) {
        this.Guid = params.Id;
      }
      else {
        this.Guid = this.localStorageService.get('GUID');
      }
      if (this.localStorageService.get('EnterpriseId') != null) {
        this.EnterpriseId = this.localStorageService.get('EnterpriseId');
      }
      this.UserName = this.localStorageService.get('UserName');
    });

    this.subscription = this.commService.getReleaseCheckListDataUpdation().subscribe(res => {
      if (res) {
        let resModel = res.CheckListUpdation;
        if(resModel[0].TTI =="Update"){
          this.GetDocumentDetails();
        }
        if(resModel[0].TTI =="Delete"){
          this.delete(0);
        }
      }
    });
  }

  ngOnDestroy(): void {

  }

  ngAfterViewInit(): void {
    this.ParentScreenName = this.parentScreenName;
    setTimeout(() => {
      //Dynamsoft.WebTwainEnv.AutoLoad = false;
      //Dynamsoft.WebTwainEnv.ResourcesPath = 'https://ddocs.govtow.com/twain/resources';
    }, 1000);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.parentScreenName !=undefined){
      this.localStorageService.set("ScreenName",changes.parentScreenName.currentValue);
    }
  }

  ngOnInit(): void {
    
    sessionStorage.removeItem("ScannAction");
    this.ParentScreenName = this.parentScreenName;
    if (this.ParentScreenName == 'Disposition') {
      this.clsList = this.getSchemaUploadDocument().filter(item => item.isVisible == true);
    } else if (this.ParentScreenName == 'ReleaseToTTI') {
      this.clsList = this.getReleaseToTTIUploadDocument().filter(item => item.isVisible == true);
    }else{
      this.clsList = this.getReleaseToInsuranceUploadDocument().filter(item => item.isVisible == true);
    }
    this.GetDocumentDetails();
  }
  addScript() {
    let script1 = document.createElement("script");
    script1.setAttribute("id", "install");
    script1.setAttribute("src", "https://ddocs.govtow.com/twain/resources/dynamsoft.webtwain.install.js");
    document.body.appendChild(script1);
    let script2 = document.createElement("script");
    script2.setAttribute("id", "initiate");
    script2.setAttribute("src", "https://ddocs.govtow.com/twain/resources/dynamsoft.webtwain.initiate.js");
    document.body.appendChild(script2);
    let script3 = document.createElement("script");
    script3.setAttribute("id", "config");
    script3.setAttribute("src", "https://ddocs.govtow.com/twain/resources/dynamsoft.webtwain.config.js");
    document.body.appendChild(script3);
  }
  scanDocument(i) {
    this.addScript();
    sessionStorage.setItem("ScannAction",'true');
    $('#divMsg').empty();
    this.checkListSuccessMsg = this.checkListErrorMsg = '';
    const Doc = this.clsList[i].name;
    const AttachmentTypeId = this.clsList[i].AttachmentTypeId;
    const DocDescription = this.clsList[i].DocDescription;
    setTimeout(() => {
      twainscanner.AcquireImage(Doc, AttachmentTypeId, DocDescription, this.UserId);
    }, 1000);
   
  }

  viewDocument(i, template: TemplateRef<any>) {
    $('#divMsg').empty();
    this.checkListSuccessMsg = this.checkListErrorMsg = '';
    this.viewLoading = i;
    this.documentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.DLMSPath + "Officer/DocViewer.aspx?file=" + this.RecordId + "-" + this.clsList[i].DocGuid)
    this.viewLoading = -1;
    this.modaltemplateDocumentViewerRef = this.modalService.show(template, Object.assign({}, this.config));
  }

  getSchemaUploadDocument() {
    let jsonFormat = [
      { name: 'DLDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'DL', AttachmentTypeId: 7, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true  },
      { name: 'RegistrationDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Registration', AttachmentTypeId: 8, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true  },
      { name: 'InsuranceDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Insurance', AttachmentTypeId: 9, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true  },
      { name: 'PaidReceiptDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Paid Receipt', AttachmentTypeId: 10, DocId: 0, DocGuid: 0, ContentType: '', isVisible: false  },
      { name: 'HoldHarmlessDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Hold Harmless (Repo)', AttachmentTypeId: 11, DocId: 0, DocGuid: 0, ContentType: '', isVisible: false  },
      { name: 'HoldHarmlessRepoOrderDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Repo Order', AttachmentTypeId: 15, DocId: 0, DocGuid: 0, ContentType: '', isVisible: false  },
      { name: 'HoldHarmlessTitleDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Title', AttachmentTypeId: 16, DocId: 0, DocGuid: 0, ContentType: '', isVisible: false  },
      { name: 'TLDReleaseDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'TLD Release', AttachmentTypeId: 12, DocId: 0, DocGuid: 0, ContentType: '', isVisible: false  },
      { name: 'RentalCarAgreementDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Rental Car Agreement', AttachmentTypeId: 13, DocId: 0, DocGuid: 0, ContentType: '', isVisible: false  },
      { name: 'TrafficDivisonReleaseDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Traffic Division Release', AttachmentTypeId: 15, DocId: 0, DocGuid: 0, ContentType: '', isVisible: false  },
      { name: 'OwnerIdDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Owner Identity', AttachmentTypeId: 17, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true  },
      { name: 'VehicleReleaseDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Vehicle Release Form (Jail/Teller)', AttachmentTypeId: 14, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true  },
      { name: 'WreckerCredentialDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Notarized Release Form', AttachmentTypeId: 21, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true  },
      // { name: 'VehicleReleaseDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Vehicle Release Form (Jail/Teller)', AttachmentTypeId: 18, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true  },
      // { name: 'WreckerCredentialDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Wrecker Credentials', AttachmentTypeId: 21, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true  },
      { name: 'OtherDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Other Docs', AttachmentTypeId: 22, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true  }
    ]
    return jsonFormat;
  }

  getReleaseToInsuranceUploadDocument() {
    let jsonFormat = [
      { name: 'DLDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'DL', AttachmentTypeId: 7, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true  }
    ]
    return jsonFormat;
  }

  getReleaseToTTIUploadDocument() {
    let jsonFormat = [
      { name: 'Title', isChecked: false, isView: false, isDelete: false, DocDescription: 'Title', AttachmentTypeId: 30, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true  }
    ]
    return jsonFormat;
  }

  onFileChange(event, index: number) {
    // const screenName = this.localStorageService.get("ScreenName");
    // if (screenName == 'Disposition') {
    //   this.clsList = this.getSchemaUploadDocument().filter(item => item.isVisible == true);
    // } else if (screenName == 'ReleaseToTTI') {
    //   this.clsList = this.getReleaseToTTIUploadDocument().filter(item => item.isVisible == true);
    // }else {
    //   this.clsList = this.getReleaseToInsuranceUploadDocument().filter(item => item.isVisible == true);
    // }
    $('#divMsg').empty();
    this.checkListSuccessMsg = this.checkListErrorMsg = '';
    this.loading = index;
    const reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      for (var i = 0; i <= event.target.files.length - 1; i++) {
        if (event.target.files[0].size < Global.FILE_MAX_SIZE) {
          let obj = {};
          const file: File = event.target.files[i];
          reader.readAsDataURL(file);
          reader.onload = () => {
            obj = {
              TowingId: this.TowId,
              base64Image: reader.result,
              FileName: file.name,
              FileSize: Math.round((file.size / 1024)) + 'KB',
              FileType: file.type,
              DocDescription: this.clsList[index].DocDescription,
              AttachmentTypeId: this.clsList[index].AttachmentTypeId,
              IsActive: true
            }
            this.uploadedDocs.push(obj);
            setTimeout(() => {
              this.UploadDocuments();
            }, 500);

          };
        } else {
          this.loading = -1;
          this.checkListErrorMsg = "File: " + event.target.files[0].name + " is too large to upload.";
        }
      }
    }
    event.target.value = '';
  }

  UploadDocuments() {
    $('#divMsg').empty();
    this.checkListSuccessMsg = this.checkListErrorMsg = '';
    let uploadDocumentModel: UploadDocumentModel = new UploadDocumentModel();
    uploadDocumentModel.TowingId = this.TowId;
    uploadDocumentModel.Base64File = this.uploadedDocs[0].base64Image;
    uploadDocumentModel.DocName = this.uploadedDocs[0].FileName;
    uploadDocumentModel.DocDescription = this.uploadedDocs[0].DocDescription;
    uploadDocumentModel.AttachmentTypeId = this.uploadedDocs[0].AttachmentTypeId;
    uploadDocumentModel.FileSize = this.uploadedDocs[0].FileSize;
    uploadDocumentModel.ContentType = this.uploadedDocs[0].FileType;
    uploadDocumentModel.IsActive = true;
    uploadDocumentModel.createdBy = this.UserId;
    uploadDocumentModel.UserId = this.UserId;
    uploadDocumentModel.RecordId = this.RecordId;
    uploadDocumentModel.Screen = 'ReleaseCheckList';
    if (uploadDocumentModel.TowingId > 0) {
      //this.loading = true;
      this._dataService.post(Global.DLMS_API_URL + 'api/upload/UploadAttachment', uploadDocumentModel)
        .subscribe(data => {
          if (data['Id'] > 0) {
            this.checkListSuccessMsg = 'Uploaded successfully';
            this.loading = -1;
            this.uploadedDocs = [];
            if (this.TowId != null) {
                this.GetDocumentDetails();
            }
          }
          else {
            this.checkListErrorMsg = "Error occured while uploading document";
            this.loading = -1;
            this.uploadedDocs = [];
          }
        },
          error => {
            this.checkListErrorMsg = "Error occured while uploading document";
            this.loading = -1;
            this.uploadedDocs = [];
          });
    }
  }

  GetDocumentDetails() {
    const screenName = this.localStorageService.get("ScreenName");
    if (screenName == 'Disposition') {
      this.clsList = this.getSchemaUploadDocument().filter(item => item.isVisible == true);
    } else if (screenName == 'ReleaseToTTI') {
      this.clsList = this.getReleaseToTTIUploadDocument().filter(item => item.isVisible == true);
    }else {
      this.clsList = this.getReleaseToInsuranceUploadDocument().filter(item => item.isVisible == true);
    }
    $('#divMsg').empty();
    this.checkListSuccessMsg = this.checkListErrorMsg = '';
    this._dataService.get(Global.DLMS_API_URL + 'api/upload/GetDocumentDetails?tid=' + this.TowId)
      .subscribe(data => {
        this.documentDetails = data;
        if (this.clsList.length > 0 && this.documentDetails.length > 0) {
          for (let index = 0; index < this.clsList.length; index++) {
            let AttachmentTypeId = this.clsList[index].AttachmentTypeId;
            let guid = this.documentDetails.filter(item => item.Attachment_Type_ID === AttachmentTypeId);
            if (guid.length > 0) {
              this.clsList[index].DocGuid = guid[guid.length - 1].DocGuid;
            }
            this.clsList[index].isChecked = this.clsList[index].DocGuid != undefined && this.clsList[index].DocGuid != '' ? true : false;
            this.clsList[index].isView = this.clsList[index].DocGuid != undefined && this.clsList[index].DocGuid != '' ? true : false;
            this.clsList[index].isDelete = this.clsList[index].DocGuid != undefined && this.clsList[index].DocGuid != '' ? true : false;

          }
        }
      }, error => {
        console.log(error);
      });
  }

  delete(i) {
    $('#divMsg').empty();
    this.checkListSuccessMsg = this.checkListErrorMsg = '';
    this.deleteloading = i;
    let pdfpath = null;
    let docname = null;
    let guid = this.documentDetails.filter(item => item.Attachment_Type_ID === this.clsList[i].AttachmentTypeId);
    if (guid.length > 0) {
      pdfpath = guid[0].PdfPath;
      docname = guid[0].Doc_Name
    }
    let deleteModel = {
      DocGuid: this.clsList[i].DocGuid,
      filePathUrl: pdfpath + '\\' + this.RecordId + '\\' + docname
    }
    this._dataService.post(Global.DLMS_API_URL + 'tow/deletereleaseCheckListFile', deleteModel)
      .subscribe(data => {
        if (data['Id'] > 0) {
          this.checkListSuccessMsg = 'Document deleted successfully';
          this.deleteloading = -1;
          if (this.TowId != null) {
            this.GetDocumentDetails()
          }
        }
        else {
          this.checkListErrorMsg = 'Error occured while deleting document';
          this.deleteloading = -1;
        }
      },
        error => {
          this.checkListErrorMsg = 'Error occured while deleting document';
          this.deleteloading = -1;
        });
  }
}

class UploadDocumentModel {
  TowingId: number;
  Base64File: string;
  DocName: string;
  DocDescription: string;
  AttachmentTypeId: number;
  FileSize: number;
  ContentType: string;
  IsActive: boolean;
  createdBy: number;
  RecordId: string;
  UserId: number;
  Screen: string;
}
