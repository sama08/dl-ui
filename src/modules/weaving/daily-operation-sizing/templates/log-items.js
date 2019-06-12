import {
  inject,
  bindable,
  BindingEngine
} from "aurelia-framework";
import {
  Service
} from "../service";
import moment from "moment";

// var ConstructionLoader = require("../../../../loader/weaving-constructions-loader");

@inject(BindingEngine, Service)
export class LogItems {
  // @bindable Code;
  // @bindable OrderDocument;

  constructor(bindingEngine, service) {
    this.service = service;
    this.bindingEngine = bindingEngine;
  }

  activate(context) {
    this.data = context.data;
    this.error = context.error;

    if (this.data.DateTimeMachineHistory) {
        var DateMachine = moment(this.data.DateTimeMachineHistory).format('DD/MM/YYYY');
        var TimeMachine = moment(this.data.DateTimeMachineHistory).format('LT');
  
        this.data.MachineDateHistory = DateMachine;
        this.data.MachineTimeHistory = TimeMachine;
    }

    this.options = context.context.options;
    this.readOnly = context.options.readOnly;
  }

  //   get orders() {
  //     return ConstructionLoader;
  //   }

  //   OrderDocumentChanged(newValue) {
  //     console.log(newValue);
  //     this.data.ConstructionNumber = newValue.ConstructionNumber;
  //   }
}
