import { AfterViewInit, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-dynamic-component-modal',
  templateUrl: './dynamic-component-modal.component.html',
  styleUrls: ['./dynamic-component-modal.component.css']
})

export class DynamicComponentModalComponent implements OnInit, AfterViewInit {
  title: any;
  data: any;
  @ViewChild('refrenceObj', { read: ViewContainerRef }) entry: ViewContainerRef;
  componentRef: any;
  constructor(public bsModalRef: BsModalRef,
    private resolver: ComponentFactoryResolver) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    const component: any =this.data.Component;
    const factory = this.resolver.resolveComponentFactory(component);
    this.componentRef = this.entry.createComponent(factory);
    this.componentRef.instance.DataObj = this.data;
  }

  close() {
    if (this.bsModalRef.content.callback != null) {
      this.bsModalRef.content.callback('close');
      this.bsModalRef.hide();
    }
  }
}
