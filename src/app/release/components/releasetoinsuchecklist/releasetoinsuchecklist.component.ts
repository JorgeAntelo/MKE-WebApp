import { Component, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { DataService } from '../../../core/services/data.service';
import { Global } from 'src/app/shared/global';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'angular-2-local-storage';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DomSanitizer } from '@angular/platform-browser';
import twainscanner from '../../../../assets/js/twainscanner';
declare var $: any;

@Component({
  selector: 'app-releasetoinsuchecklist',
  templateUrl: './releasetoinsuchecklist.component.html',
  styleUrls: ['./releasetoinsuchecklist.component.css'],
  providers: []
})
export class ReleaseToInscChecklistComponent implements OnInit {

  documentUrl: any;
  DLMSPath = Global.PoliceURL;
  checkListSchemaList = [];
  uploadedDocs = [];
  ModalErrorMsg: string;
  ModalSuccessMsg: string;
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
  EnterpriseId: number;
  UserName: string;
  TowId: number;
  RecordId: string;
  //ddocsUrl: string;
  @ViewChild('templateDocumentViewer') modaltemplateDocumentViewerRef: BsModalRef;
  public config = {
    animated: true,
    keyboard: false,
    backdrop: true,
    ignoreBackdropClick: true
  };

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

  VehicleStatus: string;
  @Input('vehicleStatus')
  set vehicleStatus(data: any) {
    if (data) {
      this.VehicleStatus = String(data);
    }
  }

  constructor(private _dataService: DataService,
    public sanitizer: DomSanitizer,
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute,
    private localStorageService: LocalStorageService) {
    this.LoaderImage = this.ModalLoaderImage = Global.FullImagePath;
    this.documentUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
    //this.ddocsUrl = Global.ddocsUrl;
  }

  ngOnInit(): void {
    twainscanner.RegisterDynamsoft();
    this.checkListSchemaList = this.getReleaseToInsuranceUploadDocument().filter(item => item.isVisible == true);
    this.GetDocumentDetails();
  }

  scanDocument(i) {
    $('#divMsg').empty();
    this.ModalSuccessMsg = this.ModalErrorMsg = '';
    const Doc = this.checkListSchemaList[i].name;
    const AttachmentTypeId = this.checkListSchemaList[i].AttachmentTypeId;
    const DocDescription = this.checkListSchemaList[i].DocDescription;
    twainscanner.AcquireImage(Doc, AttachmentTypeId, DocDescription, this.UserId);
  }

  viewDocument(i, template: TemplateRef<any>) {
    $('#divMsg').empty();
    this.ModalSuccessMsg = this.ModalErrorMsg = '';
    this.viewLoading = i;
    this.documentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.DLMSPath + "Officer/DocViewer.aspx?file=" + this.RecordId + "-" + this.checkListSchemaList[i].DocGuid)
    this.viewLoading = -1;
    this.modaltemplateDocumentViewerRef = this.modalService.show(template, Object.assign({}, this.config));
  }

  getReleaseToInsuranceUploadDocument() {
    let jsonFormat = [
      { name: 'DLDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'DL', AttachmentTypeId: 7, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true }
    ]
    return jsonFormat;
  }

  onFileChange1(event, index: number) {
    $('#divMsg').empty();
    this.ModalSuccessMsg = this.ModalErrorMsg = '';
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
              DocDescription: this.checkListSchemaList[index].DocDescription,
              AttachmentTypeId: this.checkListSchemaList[index].AttachmentTypeId,
              IsActive: true
            }
            this.uploadedDocs.push(obj);
            this.UploadDocuments();
          };
        } else {
          this.loading = -1;
          this.ModalErrorMsg = "File: " + event.target.files[0].name + " is too large to upload.";
        }
      }
    }
    event.target.value = '';
  }

  UploadDocuments() {
    $('#divMsg').empty();
    this.ModalSuccessMsg = this.ModalErrorMsg = '';
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
            this.ModalSuccessMsg = 'Uploaded successfully';
            this.loading = -1;
            this.uploadedDocs = [];
            if (this.TowId != null) {
              this.GetDocumentDetails();
            }
          }
          else {
            this.ModalErrorMsg = "Error occured while uploading document";
            this.loading = -1;
            this.uploadedDocs = [];
          }
        },
          error => {
            this.ModalErrorMsg = "Error occured while uploading document";
            this.loading = -1;
            this.uploadedDocs = [];
          });
    }
  }

  GetDocumentDetails() {
    this._dataService.get(Global.DLMS_API_URL + 'api/upload/GetDocumentDetails?tid=' + this.TowId)
      .subscribe(data => {
        this.documentDetails = data;
        if (this.checkListSchemaList.length > 0 && this.documentDetails.length > 0) {
          for (let index = 0; index < this.checkListSchemaList.length; index++) {
            let AttachmentTypeId = this.checkListSchemaList[index].AttachmentTypeId;
            let guid = this.documentDetails.filter(item => item.Attachment_Type_ID === AttachmentTypeId);
            if (guid.length > 0) {
              this.checkListSchemaList[index].DocGuid = guid[guid.length - 1].DocGuid;
            }
            this.checkListSchemaList[index].isChecked = this.checkListSchemaList[index].DocGuid != undefined && this.checkListSchemaList[index].DocGuid != '' ? true : false;
            this.checkListSchemaList[index].isView = this.checkListSchemaList[index].DocGuid != undefined && this.checkListSchemaList[index].DocGuid != '' ? true : false;
            this.checkListSchemaList[index].isDelete = this.checkListSchemaList[index].DocGuid != undefined && this.checkListSchemaList[index].DocGuid != '' ? true : false;
          }
        }
      }, error => {
        console.log(error);
      });
  }

  delete(i) {
    $('#divMsg').empty();
    this.ModalSuccessMsg = this.ModalErrorMsg = '';
    this.deleteloading = i;
    let pdfpath = null;
    let docname = null;
    let guid = this.documentDetails.filter(item => item.Attachment_Type_ID === this.checkListSchemaList[i].AttachmentTypeId);
    if (guid.length > 0) {
      pdfpath = guid[0].PdfPath;
      docname = guid[0].Doc_Name
    }
    let deleteModel = {
      DocGuid: this.checkListSchemaList[i].DocGuid,
      filePathUrl: pdfpath + '\\' + this.RecordId + '\\' + docname
    }
    this._dataService.post(Global.DLMS_API_URL + 'tow/deletereleaseCheckListFile', deleteModel)
      .subscribe(data => {
        if (data['Id'] > 0) {
          this.ModalSuccessMsg = 'Document deleted successfully';
          this.deleteloading = -1;
          if (this.TowId != null) {
            this.GetDocumentDetails()
          }
        }
        else {
          this.ModalErrorMsg = 'Error occured while deleting document';
          this.deleteloading = -1;
        }
      },
        error => {
          this.ModalErrorMsg = 'Error occured while deleting document';
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
