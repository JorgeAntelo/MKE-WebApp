import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Global } from '../../../shared/global';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  AbanList = [];
  ErrorMsg: any;
  SuccessMsg: any;
  indLoading = false;
  LoaderImage: any;
  SearchForm:FormGroup;
  searchclicked=0;
  IsCitizenRequest:boolean=true;
  constructor(private _dataService: DataService,
    private router: Router,
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute,) {
      activatedRoute.params.subscribe(val => {
        let that = this;
  
      });
      this.activatedRoute.queryParams.subscribe(params => {
        let iscitizen=params.Ic;
      if(iscitizen==1){
        this.IsCitizenRequest=true;
      }
    });
     }
     private createForm() {
      this.SearchForm = new FormGroup({
        
        ComplaintNoFormControl: new FormControl('',[Validators.required]),
        
      });
  
    }
  ngOnInit() {
    this.createForm();
  }
  LoadAbanList(pageNumber, pageSize, obj): void {
    this.ErrorMsg = "";
    this.SuccessMsg = "";
    var searchCounter = 0    
    var SearchComplaintNo=""; 
    var violationFrmDate_datestring = "";
    var violationToDate_datestring = "";
    var violationSearchReason_ID = "";
    var voilationSearchLOCType_ID = "";
    var violationviolationStaus_ID = null;
    var SearchRecId = 0;
    var SearchPlateNo = "";
    var SearchVinNo = "";
    var SearchRequestBy = "";
    var SearchComplaintNo="";
    var searchCreatedBy = null;
    var IsDispatchEligible = false;  
    var searchobj = {};
    

    
    if (obj.ComplaintNoFormControl !== undefined && obj.ComplaintNoFormControl !== "") {
      SearchComplaintNo = obj.ComplaintNoFormControl;
      searchCounter++
    }
    

    if (searchCounter == 0) {
      this.ErrorMsg = "Please enter Complaint No";

    } else {
      searchobj = {
        "id": SearchRecId,
        "createdby": searchCreatedBy,
        "statusid": violationviolationStaus_ID,
        "frmDate": violationFrmDate_datestring,
        "toDate": violationToDate_datestring,
        "voilationReasonid": violationSearchReason_ID,
        "textlocationid": voilationSearchLOCType_ID,
        "LicNo": SearchPlateNo,
        "carvin_id": SearchVinNo,
        "reqBy": SearchRequestBy,
        "complaintno": SearchComplaintNo,
        "offset": pageNumber,
        "counter": pageSize,
        "IsDispatchEligible": IsDispatchEligible,
        "MakeId": 0,
        "ModelId": 0,
        "Location":'',
        "StyleId":0,
        "ColorId":0,
        "LastName":""
      };
      
     
      this.indLoading = true;
      this._dataService.post(Global.DLMS_API_URL + 'api/Aban/Search', searchobj)
        .subscribe(items => {
          this.AbanList = items;
          //console.log(this.contractList);
          if (this.AbanList != null) {
            if (this.AbanList.length > 0) {
              this.indLoading = false;
              

              
             
            }
            else {
              this.indLoading = false;
              

            }
          } else {
            this.indLoading = false;
            

          }
        },
          error => {
            this.indLoading = false;
            this.ErrorMsg = <any>error
          });

    }
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
  Search(obj) {
    this.validateAllFormFields(this.SearchForm);
    if(this.SearchForm.valid){
      this.searchclicked++;
      this.LoadAbanList(1, 1, obj);
    }
    

  }
 
}
