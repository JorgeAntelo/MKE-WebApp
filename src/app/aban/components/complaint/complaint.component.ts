import { Component, OnInit } from '@angular/core';
import { Global } from '../../../shared/global';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';

@Component({
  selector: 'app-complaint',
  templateUrl: './complaint.component.html',
  styleUrls: ['./complaint.component.css']
})
export class ComplaintComponent implements OnInit {
  SuccessMsg: any;
  ComplaintNo:any;
  IsCitizen:number;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router) {
      activatedRoute.params.subscribe(val => {
        //console.log(val);
        let ComplaintNo = val.compno;
        let that = this;
  
      });
      this.activatedRoute.queryParams.subscribe(params => {

        this.ComplaintNo = params.compno;

      });
     }

  ngOnInit() {
  }
AddNew(){
  let url = '/citizenaban?Id=-1&UserId=-1&Ic=1';
    this.router.navigateByUrl(url);
}
Close(){
  let url = 'https://city.milwaukee.gov/dpw';
  window.top.location.href = url;
}
}
