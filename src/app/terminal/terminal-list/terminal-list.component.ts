import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap';
import { DataService } from 'src/app/core/services/data.service';
import { UtilService } from 'src/app/core/services/util.service';
import { DynamicComponentModalComponent } from 'src/app/dynamic-component-modal/dynamic-component-modal.component';
import { Global } from 'src/app/shared/global';
import { TerminalManageComponent } from '../terminal-manage/terminal-manage.component';

@Component({
  selector: 'app-terminal-list',
  templateUrl: './terminal-list.component.html',
  styleUrls: ['./terminal-list.component.css']
})
export class TerminalListComponent implements OnInit {

  indLoading = false;
  LoaderImage: any;
  ErrorMsg: any;
  SuccessMsg: any;
  UserId: Number;
  TowRowsList: any;
  TowColumnsList: any;
  Pagenumber: any;
  PageId: any;
  TotalPagenum: any;
  TotalPageCount: any[];
  TotalRecord: string;
  CurrentDate = new Date();
  MakeList: any;
  TowConfig: any;
  TowList: any;
  @ViewChild('templateTerminalManage') public templateTerminalManage: TemplateRef<any>;
  DataObj: any;
  constructor(private _dataService: DataService,
    private modalService: BsModalService,
    public utilService: UtilService,
    private activatedRoute: ActivatedRoute) {
      this.activatedRoute.queryParams.subscribe(params => {
        this.UserId = params.uid;
      });
  }

  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    this.LoadList();
  }

  LoadList(): void {
    this.ErrorMsg = "";
    this.SuccessMsg = "";

    this.indLoading = true;
    this._dataService.get(Global.DLMS_API_URL + 'api/Cashiering/SelectTerminal')
      .subscribe(items => {
        this.indLoading = false;
        if (items != null) {
          this.TowList = items;
        }
        else {
          this.TowList = [];
        }
      },
        error => {
          this.indLoading = false;
          this.ErrorMsg = <any>error
        });
  }
  Edit(item) {
    // const initialState = {
    //   title: `Terminal Details`,
    //   data: {
    //     ReferenceId: item.CCID,
    //     UserId: this.UserId,
    //     Component:TerminalManageComponent
    //   },
    //   callback: (result) => {
    //     if (result == 'close') {
    //       this.LoadList();
    //       this.utilService.modalRef.hide();
    //     }
    //   }
    // };
    this.DataObj = {
      ReferenceId: item.CCID,
      HSN: item.HSN,
      Description: item.Description,
      UserId: this.UserId
    }

    this.utilService.modalRef = this.modalService.show(this.templateTerminalManage, Object.assign({}, this.utilService.config, { class: 'gray modal-md modal-dialog-top' }));
  }

  AddNew() {
    this.DataObj = {
      ReferenceId: 0,
      HSN: '',
      Description: '',
      UserId: this.UserId
    }

    this.utilService.modalRef = this.modalService.show(this.templateTerminalManage, Object.assign({}, this.utilService.config, { class: 'gray modal-md modal-dialog-top' }));
  }

}


