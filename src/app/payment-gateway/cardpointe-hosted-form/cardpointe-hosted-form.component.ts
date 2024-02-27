import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'src/app/core/services/data.service';
import { Global } from 'src/app/shared/global';

@Component({
  selector: 'app-cardpointe-hosted-form',
  templateUrl: './cardpointe-hosted-form.component.html',
  styleUrls: ['./cardpointe-hosted-form.component.css']
})
export class CardpointeHostedFormComponent implements OnInit {
  PaymentForm: FormGroup;
  loading = false;
  siteKey = Global.GoogleCaptchav2Key;
  phonemask: any[] = Global.phonemask;
  ErrorMsg: string;
  SuccessMsg: string;
  submitted = false;
  totalAmount = 200;
  constructor(private formBuilder: FormBuilder,
    private dataService: DataService) { }

  ngOnInit() {
    window.addEventListener('message', (event)=> {
      this.ErrorMsg ='';
      var token = JSON.parse(event.data);
      let mytoken: any = document.getElementById('mytoken');
      mytoken.value = token.message;
      if(token.validationError !=undefined){
        this.ErrorMsg =token.validationError;
      }
      
      console.log(mytoken.value);
    }, false);
    this.initForm();
  }
  get f() { return this.PaymentForm.controls; }

  initForm() {
    this.PaymentForm = this.formBuilder.group({
      NameFormControl: [''],
      AddressFormControl: [''],
      CityFormControl: [''],
      RegionFormControl: [''],
      CountryFormControl: [''],
      PostalFormControl: ['', Validators.compose([Validators.required])],
      PhoneFormControl: ['', Validators.compose([Validators.required, Validators.pattern(Global.PHONE_REGEX)])],
      EmailFormControl: ['', Validators.compose([Validators.pattern(Global.EMAIL_REGEX)])]
    });
  }
  onSubmit(obj) {
    this.SuccessMsg = '';
    this.ErrorMsg = '';
    if (this.PaymentForm.invalid) {
      return;
    }
    this.loading = true;
    let mytoken: any = document.getElementById('mytoken');
    let model: any = {
      UserId: 1,
      TowId: 0,
      Account: mytoken.value,
      Amount: this.totalAmount,
      Name: obj.NameFormControl,
      Address: obj.AddressFormControl,
      City: obj.CityFormControl,
      Region: obj.RegionFormControl,
      Country: obj.CountryFormControl,
      Postal: obj.PostalFormControl,
      Phone: obj.PhoneFormControl,
      Email: obj.EmailFormControl
    }

    this.dataService.post(Global.DLMS_API_URL + 'api/Cashiering/SaveHostedFormPayment', model).subscribe(response => {
      if (response.Id > 0) {
        this.SuccessMsg = response.Result;
        this.loading = false;
        this.PaymentForm.reset();
      } else {
        this.ErrorMsg = response.Result;
        this.loading = false;
      }
    },
      error => {
        this.ErrorMsg = <any>error;
        this.loading = false;
      });
  }
}
