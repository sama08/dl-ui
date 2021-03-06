import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';

@inject(Router, Service)
export class List {
    dataToBePosted = [];
    context = ["Detail", "Cetak Cost Calculation", "Cetak Budget"];
    columns = [
        {
            field: "isPosting", title: "Post", checkbox: true, sortable: false,
            formatter: function (value, data, index) {
                this.checkboxEnabled = !data.IsPosted;
                return "";
            }
        },
        { field: "PreSCNo", title: "No Sales Contract" },
        { field: "RO_Number", title: "No RO" },
        { field: "Article", title: "Artikel" },
        { field: "UnitName", title: "Unit" },
        { field: "Quantity", title: "Kuantitas" },
        { field: "ConfirmPrice", title: "Harga Konfirmasi" },
        { field: "IsApprovedMD", title: "Approval MD" },
        { field: "IsApprovedIE", title: "Approval IE" },
        { field: "IsApprovedPurchasing", title: "Approval Purchasing" },
        { field: "IsApprovedPPIC", title: "Approval PPIC" },
    ];

    rowFormatter(data, index) {
        if (data.ApprovalMD.IsApproved && data.ApprovalPurchasing.IsApproved && data.ApprovalIE.IsApproved && data.ApprovalPPIC.IsApproved)
            return { classes: "success" }
        else
            return { classes: "danger" }
    }

    loader = (info) => {
        var order = {};

        if (info.sort)
            order[info.sort] = info.order;

        var arg = {
            page: parseInt(info.offset / info.limit, 10) + 1,
            size: info.limit,
            keyword: info.search,
            order: order,
        }

        return this.service.search(arg)
            .then(result => {
                result.data.map(data => {
                    data.isPosting = data.IsPosted;
                    data.IsApprovedMD = data.ApprovalMD.IsApproved ? "SUDAH" : "BELUM";
                    data.IsApprovedIE = data.ApprovalIE.IsApproved ? "SUDAH" : "BELUM";
                    data.IsApprovedPurchasing = data.ApprovalPurchasing.IsApproved ? "SUDAH" : "BELUM";
                    data.IsApprovedPPIC = data.ApprovalPPIC.IsApproved ? "SUDAH" : "BELUM";
                    return data;
                });
                return {
                    total: result.info.total,
                    data: result.data
                }
            });
    }

    constructor(router, service) {
        this.service = service;
        this.router = router;
    }

    get postButtonActive() {
        return this.dataToBePosted.filter(d => d.IsPosted === false).length < 1;
    }

    contextCallback(event) {
        var arg = event.detail;
        var data = arg.data;
        switch (arg.name) {
            case "Detail":
                this.router.navigateToRoute('view', { id: data.Id });
                break;
            case "Cetak Cost Calculation":
                this.service.getPdfById(data.Id)
                break;
            case "Cetak Budget":
                this.service.getBudgetById(data.Id)
                break;
        }
    }

    contextShowCallback(index, name, data) {
        switch (name) {
            case "Cetak Cost Calculation":
            case "Cetak Budget":
                return data.IsPosted;
            default:
                return true;
        }
    }

    create() {
        this.router.navigateToRoute('create');
    }

    posting() {
        const unpostedDataToBePosted = this.dataToBePosted.filter(d => d.IsPosted === false);
        if (unpostedDataToBePosted.length > 0) {
            if (confirm(`Post ${unpostedDataToBePosted.length} data?`)) {
                this.service.postCC(unpostedDataToBePosted.map(d => d.Id))
                    .then(result => {
                        this.table.refresh();
                        this.dataToBePosted = [];
                    }).catch(e => {
                        this.error = e;
                    })
            }
        }
    }
}