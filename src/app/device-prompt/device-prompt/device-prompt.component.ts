import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap';
import { ConfirmModalComponent } from 'src/app/confirm-modal/confirm-modal.component';
import { DataService } from 'src/app/core/services/data.service';
import { Global } from 'src/app/shared/global';

@Component({
  selector: 'app-device-prompt',
  templateUrl: './device-prompt.component.html',
  styleUrls: ['./device-prompt.component.css']
})
export class DevicePromptComponent implements OnInit {
  title = `Confirmation`
  message = `Are you working at the casheiring window?`
  btnCancelText = `No`
  btnOkText = `Yes`
  //isVisible: boolean = true;
  PaymentForm: FormGroup;
  ListData: any=[];
  @Input() isVisible?: boolean = true;
  ConnectionResponse: any;
  ErrorMessage: any;
  SuccessMessage:any;
  loading: boolean;
  constructor(private formBuilder: FormBuilder, private _dataService: DataService,
    private activatedRoute: ActivatedRoute) { 
    this.activatedRoute.queryParams.subscribe(params => {
      localStorage.setItem('SessionId',params.sessionId);
    });
  }

  ngOnInit() {
    this.initForm();
    this.LoadData();
  }
  LoadData() {
    this._dataService.get(Global.DLMS_API_URL + 'api/Cashiering/SelectTerminal')
    .subscribe(res => {
        if (res) {
          this.ListData = res;
        } else {
          this.ListData = [];
        }
    },
        error => (<any>error));
  }

  get f() { return this.PaymentForm.controls; }
  initForm() {
    this.PaymentForm = this.formBuilder.group({
      TerminalFormControl: ['', Validators.compose([Validators.required])],
    });
  }
  confirm() {
    this.isVisible = false;
  }

  decline() {
    window.top.postMessage("close", Global.PoliceURL);
  }
  
  async onSubmit(obj){
    this.loading = true;
    this.SuccessMessage = '';
    this.ErrorMessage = '';
    const SessionId = localStorage.getItem('SessionId');
    let model={
      HSN:obj.TerminalFormControl,
      RequestOrigin:'Global',
      SessionId:SessionId
    }
    localStorage.removeItem('hsn');
    let resp = await this._dataService.post(Global.DLMS_API_URL + 'api/Cashiering/ConnectTerminal',model).toPromise().catch(()=>{this.loading = false;});
    if(resp.Id > 0){
      localStorage.setItem('hsn', obj.TerminalFormControl);
      this.SuccessMessage = resp.Message;
      this.loading = false;
      window.top.postMessage({"hsn": obj.TerminalFormControl}, Global.PoliceURL);
    }else{
      this.loading = false;
      this.ErrorMessage = resp.Message;
    }
  }

  onClose(){
    let origin =  window.location.origin + '/';
    if(origin ==Global.PoliceURL){
      window.top.postMessage("close", Global.PoliceURL);
    }
    if(origin ==Global.WebUrl){
      if(this._dataService.modalPromptDetailsRef){
       this._dataService.modalPromptDetailsRef.hide()
      }
      window.top.postMessage("close", Global.PoliceURL);
    }
  }
  
}
