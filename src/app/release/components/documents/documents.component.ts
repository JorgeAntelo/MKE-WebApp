import { Component, OnInit, Output, EventEmitter, Input, ViewChild, TemplateRef } from "@angular/core";
import { FormControl, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Global } from "src/app/shared/global";
import { DataService } from "src/app/core/services/data.service";
import { CommunicationService } from "src/app/core/services/app.communication.service";
import { Subscription } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { LocalStorageService } from "angular-2-local-storage";
declare var $: any

@Component({
    selector: 'app-documents',
    templateUrl: './documents.component.html',
    styleUrls: ['./documents.component.css'],
    providers: []
})
export class DocumentsComponent implements OnInit {
    documentUrl: any;
    DLMSPath = Global.PoliceURL;
    checkListSchemaList = [];
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
    EnterpriseId: number;
    UserName: string;
    TowId: number;
    RecordId: string;
    ParentScreenName: string;
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

    @Input('parentScreenName')
    set parentScreenName(data: any) {
        if (data) {
            this.ParentScreenName = data;
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
    }

    ngOnInit(): void {
        this.checkListSchemaList = this.getShcemaUploadDocument().filter(item => item.isVisible == true);
        this.GetDocumentDetails();
    }

    viewDocument(i, template: TemplateRef<any>) {
        $('#divMsg').empty();
        this.checkListSuccessMsg = this.checkListErrorMsg = '';
        this.viewLoading = i;
        this.documentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.DLMSPath + "Officer/DocViewer.aspx?file=" + this.RecordId + "-" + this.checkListSchemaList[i].DocGuid)
        this.viewLoading = -1;
        this.modaltemplateDocumentViewerRef = this.modalService.show(template, Object.assign({}, this.config));
    }

    getShcemaUploadDocument() {
        let jsonFormat = [
            { name: 'DLDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'DL', AttachmentTypeId: 7, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true },
            { name: 'RegistrationDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Registration', AttachmentTypeId: 8, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true },
            { name: 'InsuranceDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Insurance', AttachmentTypeId: 9, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true },
            { name: 'PaidReceiptDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Paid Receipt', AttachmentTypeId: 10, DocId: 0, DocGuid: 0, ContentType: '', isVisible: false },
            { name: 'HoldHarmlessDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Hold Harmless (Repo)', AttachmentTypeId: 11, DocId: 0, DocGuid: 0, ContentType: '', isVisible: false },
            { name: 'HoldHarmlessRepoOrderDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Repo Order', AttachmentTypeId: 15, DocId: 0, DocGuid: 0, ContentType: '', isVisible: false },
            { name: 'HoldHarmlessTitleDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Title', AttachmentTypeId: 16, DocId: 0, DocGuid: 0, ContentType: '', isVisible: false },
            { name: 'TLDReleaseDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'TLD Release', AttachmentTypeId: 12, DocId: 0, DocGuid: 0, ContentType: '', isVisible: false },
            { name: 'RentalCarAgreementDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Rental Car Agreement', AttachmentTypeId: 13, DocId: 0, DocGuid: 0, ContentType: '', isVisible: false },
            { name: 'TrafficDivisonReleaseDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Traffic Division Release', AttachmentTypeId: 15, DocId: 0, DocGuid: 0, ContentType: '', isVisible: false },
            { name: 'OwnerIdDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Owner Identity', AttachmentTypeId: 17, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true },
            { name: 'VehicleReleaseDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Vehicle Release Form (Jail/Teller)', AttachmentTypeId: 18, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true },
            { name: 'WreckerCredentialDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Wrecker Credentials', AttachmentTypeId: 21, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true },
            { name: 'OtherDoc', isChecked: false, isView: false, isDelete: false, DocDescription: 'Other Docs', AttachmentTypeId: 22, DocId: 0, DocGuid: 0, ContentType: '', isVisible: true }
        ]
        return jsonFormat;
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
        this.checkListSuccessMsg = this.checkListErrorMsg = '';
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