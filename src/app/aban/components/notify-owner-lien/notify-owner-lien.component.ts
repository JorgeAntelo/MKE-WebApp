import { Component, OnInit, ViewChild, AfterViewInit, TemplateRef, ElementRef, } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Global } from '../../../shared/global';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';

@Component({
  selector: 'app-notify-owner-lien',
  templateUrl: './notify-owner-lien.component.html',
  styleUrls: ['./notify-owner-lien.component.css']
})
export class NotifyOwnerLienComponent implements OnInit {
  indLoading = false;
  LoaderImage: any;
  ErrorMsg: any;
  SuccessMsg: any;
  public activetab: number = 0;
  CurrentDate: Date;
  SearchForm: FormGroup;GenerateForm :FormGroup;
  UserId: Number;
  pageIdItem: any;
  pageNumber: any;
  totalpagenum: any;
  totalRecords: any;
  totalPagecount=[];
  pageSize: any;
  SummaryList=[];
  DetailsList=[];
  ShowDetails:boolean=false;
  SearchClicked:boolean=false;
  CombinedId:number;
  Type:boolean=true;
  constructor(
    private _dataService: DataService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    activatedRoute.params.subscribe(val => {
      let that = this;

    });
    this.activatedRoute.queryParams.subscribe(params => {


      let LoggeduserId = params.UserId;
      if (LoggeduserId) {
        this.UserId = Number(LoggeduserId);
      }


    });
  }

  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    this.CurrentDate = new Date();
    this.CreateForm();
  }
  private CreateForm() {
    this.SearchForm = new FormGroup({
      LetterDateFormControl: new FormControl('', [Validators.required]),
      NotesFormControl: new FormControl(),

    });
    this.GenerateForm = new FormGroup({
      NotesFormControl: new FormControl(),

    });
    (<FormControl>this.SearchForm.controls['LetterDateFormControl']).setValue(this.CurrentDate, {});
    (this.SearchForm.controls['LetterDateFormControl']).updateValueAndValidity();

  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  Search(obj){
    this.SearchClicked=false;
    this.validateAllFormFields(this.SearchForm);
    if (this.SearchForm.valid) {
      this.indLoading = true;
       var objdate = new Date(obj.LetterDateFormControl);
       var date=(objdate.getMonth()+1)+'/'+objdate.getDate()+'/'+objdate.getFullYear();
    this.SummaryList=[];
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/GetAbanAttachmentSummary?Date='+date)
    .subscribe(items => {
      if(items){
        this.SummaryList = items;
      }
      
      this.indLoading = false;
    }, error => {
      this.indLoading = false;
      this.ErrorMsg = <any>error
    });
    this.SearchClicked=true;
    }
  }
  LoadDetails(id,type){
    this.CombinedId=id;
    this.Type=type;
    this.LoadDetailsGrid(1,10,this.CombinedId,this.Type);
    
  }
  LoadDetailsGrid(pageNumber,pageSize,combinedid,type){
   // api/Aban/GetAbanNotificationDetails
   this.indLoading = true;
   this.pageNumber = pageNumber;
      this.pageSize = pageSize;
      this.indLoading = true;
      this._dataService.get(Global.DLMS_API_URL + 'api/Aban/GetAbanNotificationDetails?PageNum='+pageNumber+'&PageSize='+pageSize+'&CombinedId='+combinedid+'&Isgenerated='+type)
        .subscribe(items => {
          this.DetailsList = items.DetailsList;
          var notes=items.Notes;
          (<FormControl>this.SearchForm.controls['NotesFormControl']).setValue(notes.Notes, {});
          (this.SearchForm.controls['NotesFormControl']).updateValueAndValidity();
          
          if (this.DetailsList != null) {
            if (this.DetailsList.length > 0) {
              this.ShowDetails=true;
              this.indLoading = false;
              this.totalpagenum = this.DetailsList [0]["TotalPagenum"];
              this.totalPagecount = [];
              for (var i = 1; i <= this.totalpagenum; i++) {
                this.totalPagecount.push({ Id: i, Description: i });
              }
              if (pageNumber == 1) {
                this.pageIdItem = 1;
              }

              this.pageIdItem = pageNumber;
              this.totalRecords = "Total Record Found: " + this.DetailsList[0]["TotalRecordCount"];

              
              
            }
            else {
              this.indLoading = false;
              this.totalPagecount = [];
              this.totalRecords = "";
              this.indLoading = false;
              this.totalpagenum = 0;

            }
          } else {
            this.indLoading = false;
            this.totalPagecount = [];
            this.totalRecords = "";
            this.indLoading = false;
            this.totalpagenum = 0;

          }
        },
          error => {
            this.indLoading = false;
            this.ErrorMsg = <any>error
          });
  }
  ShowLetter(Guid){
     //open the combined letter in a new window
     window.open("" + Global.PoliceURL + "/Officer/DocViewer.aspx?file=" + Guid, "_blank");

  }
  Generate(obj){
    this.indLoading = true;
    //calling  an api to generate the letter and save it against the Owner and lien  in attachments,townotifydates tables 
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/GenerateAbanletter?AbanIds=-1&Ids=-2&Type='+obj.NotesFormControl+'&UserId=' + this.UserId)
      .subscribe(objresult => {
        console.log(objresult);
        if (objresult != "NA") {
          this.SuccessMsg = 'Letters Generated successfully';
          //open the combined letter in a new window
          window.open("" + Global.PoliceURL + "/Officer/DocViewer.aspx?file=" + objresult, "_blank");

        }

        this.indLoading = false;
      },
        error => {this.ErrorMsg = <any>error
          this.indLoading = false;
        });

  }
  tabClick(ev) {

    switch (ev.index) {
      case 0:
        break;
      case 1:
        break;

    }
  }
  //Paging methods
  onPageChange(PageNumber: any) {
    this.pageNumber = this.pageIdItem;
    this.LoadDetailsGrid(this.pageNumber, this.pageSize, this.CombinedId,this.Type);
  }

  firstItem() {
    if (this.pageIdItem === 'undefined' || this.pageIdItem > 1) {
      this.pageNumber = 1;
      this.pageIdItem = this.pageNumber;
      this.LoadDetailsGrid(this.pageNumber, this.pageSize, this.CombinedId,this.Type);
    }
  }

  previousItem() {
    if (this.pageIdItem != 'undefined') {
      if (this.pageIdItem > 1) {
        this.pageNumber = this.pageIdItem - 1;
        this.pageIdItem = this.pageNumber;
        this.LoadDetailsGrid(this.pageNumber, this.pageSize, this.CombinedId,this.Type);
      }
    }
  }

  nextItem() {
    if (this.pageIdItem != 'undefined') {

      if (this.pageIdItem < this.totalpagenum) {
        this.pageNumber = this.pageIdItem + 1;
        this.pageIdItem = this.pageNumber;
        this.LoadDetailsGrid(this.pageNumber, this.pageSize, this.CombinedId,this.Type);
      }
    }
  }

  lastItem() {
    if (this.pageIdItem === 'undefined' || this.pageIdItem < this.totalpagenum) {
      this.pageNumber = this.totalpagenum;
      this.pageIdItem = this.pageNumber;
      this.LoadDetailsGrid(this.pageNumber, this.pageSize, this.CombinedId,this.Type);
    }
  }
}
