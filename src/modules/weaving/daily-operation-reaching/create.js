import {
  inject,
  bindable,
  BindingEngine,
  Lazy
} from "aurelia-framework";
import {
  Router
} from "aurelia-router";
import {
  Service
} from "./service";
import moment from 'moment';
var UnitLoader = require("../../../loader/unit-loader");
var MachineLoader = require("../../../loader/weaving-machine-loader");
// var ConstructionLoader = require("../../../loader/weaving-constructions-loader");
var OrderLoader = require("../../../loader/weaving-order-loader");
var OperatorLoader = require("../../../loader/weaving-operator-loader");
var SizingBeamLoader = require("../../../loader/weaving-sizing-beam-by-order-loader");
@inject(Service, Router, BindingEngine)
export class Create {
  @bindable readOnly;
  @bindable MachineDocument;
  @bindable WeavingDocument;
  @bindable OrderDocument;
  @bindable OperatorDocument;
  @bindable PreparationTime;
  @bindable BeamsWarping;

  beamColumns = [{
    value: "BeamNumber",
    header: "Nomor Beam Warping"
  }, {
    value: "YarnStrands",
    header: "Helai Benang Beam Warping"
  }];

  constructor(service, router, bindingEngine) {
    this.router = router;
    this.service = service;
    this.bindingEngine = bindingEngine;
    this.data = {};
    this.error = {};
  }

  LoaderFilter = {
    "Type": "Sizing"
  };
  formOptions = {
    cancelText: 'Kembali',
    saveText: 'Simpan',
  };

  get machines() {
    return MachineLoader;
  }

  get units() {
    return UnitLoader;
  }

  // get constructions() {
  //   return ConstructionLoader;
  // }

  get orders() {
    return OrderLoader;
  }

  get beams() {
    return SizingBeamLoader;
  }

  get operators() {
    return OperatorLoader;
  }

  OrderDocumentChanged(newValue) {
    if (newValue) {
      this.LoaderFilter.OrderId = newValue.Id;
      let constructionId = newValue.ConstructionId;
      let weavingUnitId = newValue.WeavingUnit;
      this.service.getConstructionNumberById(constructionId)
        .then(resultConstructionNumber => {
          this.error.ConstructionNumber = "";
          this.ConstructionNumber = resultConstructionNumber;
          return this.service.getUnitById(weavingUnitId);
        })
        .then(resultWeavingUnit => {
          this.error.WeavingUnitDocument = "";
          this.WeavingUnitDocument = resultWeavingUnit.Name;
        })
        .catch(e => {
          this.ConstructionNumber = "";
          this.WeavingUnitDocument = "";

          this.error.ConstructionNumber = " Nomor Konstruksi Tidak Ditemukan ";
          this.error.WeavingUnitDocument = " Unit Weaving Tidak Ditemukan ";
        });
    }
  }

  OperatorDocumentChanged(newValue) {
    this.SizingGroup = newValue.Group;
  }

  PreparationTimeChanged(newValue) {
    this.service.getShiftByTime(newValue)
      .then(result => {
        this.error.Shift = "";
        this.Shift = {};
        this.Shift = result;
        this.data.ShiftDocumentId = this.Shift.Id;
      })
      .catch(e => {
        this.Shift = {};
        this.data.ShiftDocumentId = this.Shift.Id;
        this.error.Shift = " Shift tidak ditemukan ";
      });
  }

  saveCallback(event) {
    var preparationData = {};
    if (this.MachineDocument) {
      preparationData.MachineDocumentId = this.MachineDocument.Id;
    }
    if (this.OrderDocument) {
      preparationData.OrderDocumentId = this.OrderDocument.Id;
    }
    if (this.SizingBeamDocument) {
      preparationData.SizingBeamId = this.SizingBeamDocument.Id
    }
    if (this.OperatorDocument) {
      preparationData.OperatorDocumentId = this.OperatorDocument.Id;
    }

    if (this.PreparationDate) {
      var PreparationDateContainer = this.PreparationDate;
      preparationData.PreparationDate = moment(PreparationDateContainer).utcOffset("+07:00").format();
    }

    if (this.PreparationTime) {
      preparationData.PreparationTime = this.PreparationTime;
    }
    if (this.Shift) {
      preparationData.ShiftDocumentId = this.Shift.Id;
    }
    
    this.service
      .create(preparationData)
      .then(result => {
        this.router.navigateToRoute('list');
      })
      .catch(e => {
        this.error = e;
      });
  }

  cancelCallback(event) {
    this.router.navigateToRoute('list');
  }
}
