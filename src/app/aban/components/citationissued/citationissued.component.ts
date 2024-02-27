import { Component, OnInit, ViewChild, Input, Output, EventEmitter, TemplateRef, Inject, ElementRef, NgZone, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Global } from '../../../shared/global';
import { MatOptionSelectionChange, fadeInContent } from '@angular/material';
import { LocalStorageService } from 'angular-2-local-storage';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';

@Component({
  selector: 'app-citationissued',
  templateUrl: './citationissued.component.html',
  styleUrls: ['./citationissued.component.css']
})
export class CitationissuedComponent implements OnInit {
  CitationForm: FormGroup;
  Citations: FormArray;
  CitationCount = 0;
  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.createForm();
    this.LoadCitation();
  }
  private createForm() {
    this.CitationForm = this._formBuilder.group({
      Citations: this._formBuilder.array([])
    });

  }
  LoadCitation(): void {
    this.AddCitation();
  }
  initCitations() {
    return this._formBuilder.group({
      // list of form controls here, which belongs to form array
      CitationFormControl: new FormControl(''),
    });
  }
  get formData() {
    return <FormArray>this.CitationForm.get('Citations');
  }
  AddCitation() {
    // control refers to your formarray
    const control = <FormArray>this.CitationForm.controls['Citations'];
    // add new formgroup
    control.push(this.initCitations());
    this.CitationCount = control.length;

  }
  RemoveCitation(index: number) {

    if (confirm("Are you sure you want to remove the record ?")) {
      let objClient = this.CitationForm.value;
      let citation = objClient.Citations[index];

      // control refers to your formarray
      const control = <FormArray>this.CitationForm.controls['Citations'];

      if (control.length > 1) {
        control.removeAt(index);
        this.CitationCount = control.length;
      }
      if (control.length == 1) {
        
          this.CitationForm.reset();
        

      }
      // remove the chosen row
    }



  }
  ClearCitation(i) {
    (this.CitationForm.controls.Citations['controls'][i].controls['CitationFormControl'])
    .setValue(null, {});
  }
 
}
