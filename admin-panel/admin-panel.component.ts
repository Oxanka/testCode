import { Component, OnInit, ViewChild } from '@angular/core';
import { DefinitionService } from "../../../services/definition.service";
import { ErrorService } from "../../../services/error.service";
import { MdDialog, MdAutocompleteTrigger } from "@angular/material";
import { ConfirmComponent } from "../../../dialogs/confirm/confirm.component";
import { FormControl } from "@angular/forms";

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import { CreateRuleComponent } from "../../../dialogs/create-rule/create-rule.component";

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {

  private defs: any[] = [];

  //AUTOCOMPLETE
  private search: FormControl;
  private autocompValues: Observable<any[]>;
  @ViewChild('searchbar', { read: MdAutocompleteTrigger }) autocompleteTrigger: MdAutocompleteTrigger;

  //SORT
  private sort: string = 'name';
  private direction: boolean = true;

  //PAGINATION
  private totalCount: number;
  private pageSize: number = 10;
  private pageSizeOptions = [5, 10, 25, "all"];
  private selectPageSize: number = 10;

  private loading: boolean = false;

  constructor(
    private apiDef: DefinitionService,
    private errorHandler: ErrorService,
    private dialog: MdDialog
  ) {
    this.search = new FormControl();
    this.search.valueChanges
      .startWith(null)
      .subscribe(search => search ? this.autocomplete(search) : [])
  }

  ngOnInit() {
    this.getMore();
  }

  autocomplete(q: string) {
    this.apiDef.getAll(0, 15, q, 'name', true)
      .then(res => {
        this.autocompValues = res.defs;
      })
  }

  filter(val: string = '', sort: string = this.sort, direction: boolean = this.direction) {
    this.search.setValue(val);
    this.sort = sort;
    this.direction = direction;
    this.autocompleteTrigger.closePanel();
    this.autocompValues = undefined;
    this.getMore(0, this.pageSize, val, this.sort, this.direction);
  }

  getMore(skip: number = 0, limit: number = this.pageSize, q: string = '', sort: string = this.sort, d: boolean = true) {
    this.loading = true;
    this.apiDef.getAll(skip, limit, q, sort, d)
      .then(res => {
        console.log(res);
        this.loading = false;
        this.totalCount = res.count;
        this.defs = res.defs;
      })
      .catch(err => {
        this.loading = false;
        this.errorHandler.showSnack(err, 'Ok', { duration: 5000 });
      })
  }

  delete(defs: any, def: any) {
    this.dialog.open(ConfirmComponent, {
      data: {
        message: 'Are you sure you want to delete this rule?'
      }
    }).afterClosed().subscribe(res => {
      if (res) {
        this.apiDef.delete(def._id)
          .then(res => {
            defs.splice(defs.indexOf(def), 1);
            this.errorHandler.showSnack('Updated!', null, { duration: 5000 });
          })
          .catch(err => {
            this.errorHandler.showSnack(err, 'Ok', { duration: 5000 });
          })
      }nu
    })
  }

  pageEvent(ev) {
    this.pageSize = ev.pageSize;
    if(ev.pageSize == 'all'){
      ev.pageSize = ev.length;
    }
    this.getMore(ev.pageIndex * ev.pageSize, ev.pageSize, this.search.value ? this.search.value : '', this.sort, this.direction);
  }

  createRule() {
    this.dialog.open(CreateRuleComponent)
      .afterClosed().subscribe(res => {
        if (res) {
          this.ngOnInit();
        }
      })
  }

  update(def: any) {
    this.apiDef.update(def)
      .then(res => {
        this.errorHandler.showSnack('Updated!', null, { duration: 5000 });
      })
      .catch(err => {
        this.errorHandler.showSnack(err, 'Ok', { duration: 5000 });
      })
  }

}
