import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'src/app/core/services/data.service';
import { Global } from 'src/app/shared/global';

@Component({
  selector: 'app-terminal-manage',
  templateUrl: './terminal-manage.component.html',
  styleUrls: ['./terminal-manage.component.css']
})
export class TerminalManageComponent implements OnInit {

  PaymentForm: FormGroup;
  ListData: any=[];
  @Input() isVisible?: boolean = true;
  ConnectionResponse: any;
  ErrorMessage: any;
  SuccessMessage:any;
  loading: boolean;
  UserId: any;
  ReferenceId: number;
  ErrorMsg: any;
  SuccessMsg: any;
  HSN: any;
  Description: any;
  IsActive: any;

  @Input('DataObj')
  set DataObj(data: any) {
    if (data) {
      this.ReferenceId = Number(data.ReferenceId);
      this.HSN = data.HSN;
      this.Description = data.Description;
      this.IsActive = data.IsActive;
      this.UserId = data.UserId;
      this.initForm();
    }
  }
  constructor(private formBuilder: FormBuilder, private _dataService: DataService) { }

  ngOnInit() {
    this.LoadData();
  }
  LoadData() {
   
    this.f.HSNFormControl.setValue(this.HSN, {});
    this.f.HSNFormControl.updateValueAndValidity();
        
    this.f.DescriptionFormControl.setValue(this.Description, {});
    this.f.DescriptionFormControl.updateValueAndValidity();

    this.f.IsActiveFormControl.setValue(this.IsActive, {});
    this.f.IsActiveFormControl.updateValueAndValidity();
  }

  get f() { return this.PaymentForm.controls; }
  initForm() {
    this.PaymentForm = this.formBuilder.group({
      HSNFormControl: ['', Validators.compose([Validators.required])],
      DescriptionFormControl: ['', Validators.compose([Validators.required])],
      IsActiveFormControl:['', Validators.compose([Validators.required])]
    });
  }
  
  async onSubmit(obj){
    this.loading = true;
    this.SuccessMsg = '';
    this.ErrorMsg = '';
    let model={
      ReferenceId:this.ReferenceId,
      HSN:obj.HSNFormControl,
      Description:obj.DescriptionFormControl,
      IsActive:obj.IsActiveFormControl,
      UserId:this.UserId
    }
    this._dataService.post(Global.DLMS_API_URL + 'api/Cashiering/SaveTerminal', model).subscribe(result => {
      if (result.Id > 0) {
          this.SuccessMsg = result.Message;
          this.PaymentForm.reset();
          this.loading = false;
      } else {
          this.ErrorMsg = result.Message;
          this.loading = false;
      }
  },
      error => {
          this.ErrorMsg = <any>error;
          this.loading = false;
      });
  }
}