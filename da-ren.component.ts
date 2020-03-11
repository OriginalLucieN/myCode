/**
 * Created by yl on 2018/5/21.
 */
import {Component, OnInit, OnDestroy} from '@angular/core';
import {HttpResponse} from '@angular/common/http';
import {Principal} from "../../../../shared/auth/principal.service";
import {JhiAlertService, JhiEventManager} from "ng-jhipster";
import {DaRenService} from "./da-ren.service";
import {DaRen} from "./da-ren.model";
import {NbThemeService} from "@nebular/theme";
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute, Router} from "@angular/router";
import {DaRenAddComponent} from "./da-ren-add.component";
import {DaRenDetailComponent} from "./da-ren-detail.component";
import {UserService} from "../../../../shared/user/user.service";
import {ZhiTongCheService} from "../zhi-tong-che/zhi-tong-che.service";
import {ExportDataFilterComponent} from "../zhi-tong-che/export-data-filter.component";
import {Subscription} from "rxjs/Subscription";
import {ExportData} from "../export-data.model";
@Component({
    selector: 'ngx-da-ren',
    templateUrl: './da-ren.component.html',
    styleUrls: ['../../../../../content/scss/table.scss']
})
export class DaRenComponent implements OnInit, OnDestroy {
    currentAccount: any;

    // 按钮主题相关
    themeName = 'default';
    settingsBtn: Array<any>;
    themeSubscription: any;

    daRens: DaRen[];
    error: any;
    success: any;
    routeData: any;
    links: any;
    totalItems: any;
    queryCount: any;
    itemsPerPage: any;
    page: any;
    predicate: any;
    previousPage: any;
    reverse: any;

    exportDatas: DaRen[]; // 导出excell的数据变量
    array: any;  // 数组容器
    data: any; // 对象容器

    subs: Subscription;
    startTime: any;
    endTime: any;

    constructor(private principal: Principal,
                private alertService: JhiAlertService,
                private eventManager: JhiEventManager,
                private daRenService: DaRenService,
                private themeService: NbThemeService,
                private activatedRoute: ActivatedRoute,
                private router: Router,
                private modalService: NgbModal,
                private userService: UserService,
                private zhiTongCheService: ZhiTongCheService) {
        this.themeSubscription = this.themeService.getJsTheme().subscribe(theme => {
            this.themeName = theme.name;
            this.init(theme.variables);
        });
        this.itemsPerPage = 15;
        this.routeData = this.activatedRoute.data.subscribe((data) => {
            this.page = data['pagingParams'].page;
            this.previousPage = data['pagingParams'].page;
            this.reverse = data['pagingParams'].ascending;
            this.predicate = data['pagingParams'].predicate;
        });
        this.array = [];
    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.currentAccount = account;
            this.loadAll();
            this.registerChangeInUsers();
        });
    }

    // 初始化 添加、取消和确认按钮
    init(colors: any) {
        this.settingsBtn = [{
            class: 'btn-hero-primary',
            container: 'primary-container',
            title: 'Primary Button',
            buttonTitle: '添加新数据',
            default: {
                gradientLeft: `adjust-hue(${colors.primary}, 20deg)`,
                gradientRight: colors.primary,
            },
            cosmic: {
                gradientLeft: `adjust-hue(${colors.primary}, 20deg)`,
                gradientRight: colors.primary,
                bevel: `shade(${colors.primary}, 14%)`,
                shadow: 'rgba (6, 7, 64, 0.5)',
                glow: `adjust-hue(${colors.primary}, 10deg)`,
            },
        }];
    }

    registerChangeInUsers() {
        this.eventManager.subscribe('daRenListModification', (response) => this.loadAll());
    }

    ngOnDestroy() {
        this.themeSubscription.unsubscribe();
    }

    loadAll() {
        this.daRenService.query({
            page: this.page - 1,
            size: this.itemsPerPage,
        }).subscribe(
            (res: HttpResponse<(DaRen)[]>) => this.onSuccess(res.body),
            (res: Response) => this.onError(res.json())
            // (data) =>{this.source.load(data.body);},
            // (error)=>{this.alertService.error(error.error, error.message, null);}
        );
    }

    trackIdentity(index, item: DaRen) {
        return item.id;
    }

    sort() {
        const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'id') {
            result.push('id');
        }
        return result;
    }

    loadPage(page: number) {
        if (page !== this.previousPage) {
            this.previousPage = page;
            this.transition();
        }
    }

    transition() {
        this.router.navigate(['/section/dingding/da-ren'], {
            queryParams: {
                page: this.page,
                sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
            }
        });
        this.loadAll();
    }

    private onSuccess(data) {
        this.totalItems = data.totalPages * 10;
        this.daRens = data.content;
    }

    private onError(error) {
        this.alertService.error(error.error, error.message, null);
    }

    add() {
        this.daRenService.daRenId = null;
        const activeModal = this.modalService.open(DaRenAddComponent, {size: 'lg', container: 'nb-layout'});
    }

    // 编辑
    edit(id) {
        this.daRenService.daRenId = id;
        const activeModal = this.modalService.open(DaRenAddComponent, {size: 'lg', container: 'nb-layout'});
    }

    // 查看详情
    check(id) {
        this.daRenService.daRenId = id;
        const activeModal = this.modalService.open(DaRenDetailComponent, {size: 'lg', container: 'nb-layout'});
    }

    delete(id) {
        if (window.confirm('确定删除该条目?')) {
            this.daRenService.delete(id).subscribe((response) => {
                this.eventManager.broadcast({
                    name: 'daRenListModification',
                    content: 'Deleted a daRen'
                });
            });
        }
    }

    export() {
        const activeModal = this.modalService.open(ExportDataFilterComponent, {size: 'lg', container: 'nb-layout'});
        this.subs = this.eventManager.subscribe('exportDataFilterChooseDone', (response) => {
            this.startTime = this.zhiTongCheService.startTime;
            this.endTime = this.zhiTongCheService.endTime;
            if (this.startTime && this.endTime) {
                this.exportDataTimeBetween();
            }
        })
    }

    exportDataTimeBetween() {
        this.daRenService.exportDataByTimeBetween({
            startTime: this.startTime,
            endTime: this.endTime,
            size: 999999
        }).subscribe((res: HttpResponse<DaRen[]>) => this.onQueryExportDataSuccess(res.body),
            (res: Response) => this.onError(res.json()));
    }

    private onQueryExportDataSuccess(data) {
        this.exportDatas = data.content;
        this.array = [];
        this.exportDatas.forEach((value) => {
            if (value) {
                let goodId;
                if (value.approveInfoDTO.goodBakGoodId) {
                    goodId = value.approveInfoDTO.goodBakGoodId;
                } else {
                    goodId = value.approveInfoDTO.goodGoodId;
                }
                this.data = {
                    num1: value.approveInfoDTO.shopName,
                    num2: value.approveInfoDTO.brandName,
                    num3: value.approveInfoDTO.goodName,
                    num4: goodId,
                    num5: value.priceType == 1 ? '日费用' : '月费用',
                    num6: value.perPrice,
                    num7: value.startDate,
                    num8: value.endDate,
                    num9: value.isSupportedByFactory == 0 ? '否' : '是',
                    num10: value.perPriceOfSupport,
                    num11: value.approveInfoDTO.applicant,
                    num12: value.totalPrice,
                    num13: value.usedPrice,
                    num14: value.approveInfoDTO.completeDate,
                    num15: value.approveInfoDTO.status == 12 ? '已完结' : '已审批',
                };
                this.array.push(this.data);
            }
        });
        this.userService.exportCsv({
            title: ["店铺", "品牌", "商品", "商品ID", "单位类型", "金额/单位", "开始时间", "结束时间", "厂家支持", "厂家支持费用", "申请人", "总费用", "实际结算金额", "实际结束日期", "状态"],
            titleForKey: ["num1", "num2", "num3", "num4", "num5", "num6", "num7", "num8", "num9", "num10", "num11", "num12", "num13", "num14", "num15"],
            data: this.array
        }, "达人.csv");
        this.subs.unsubscribe();
    }
}
