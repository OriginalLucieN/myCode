/**
 * Created by yl on 2018/5/21.
 */
import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

import {ZuanZhan} from './zuan-zhan.model';
import {createRequestOption} from '../../../../shared/model/request-util';
import {
    WORKFLOW_ZUAN_ZHAN_API,
    WORKFLOW_ZUAN_ZHAN_DETAIL_API,
    WORKFLOW_ZUAN_ZHAN_EXPORT_API
} from '../../../../app.constants';

@Injectable()
export class ZuanZhanService {
    zuanZhanId: any;
    private resourceUrl = WORKFLOW_ZUAN_ZHAN_API;
    private checkDetailUrl = WORKFLOW_ZUAN_ZHAN_DETAIL_API;
    private exportDataByTimeBetweenUrl = WORKFLOW_ZUAN_ZHAN_EXPORT_API;


    constructor(private http: HttpClient) {
    }

    query(req?: any): Observable<HttpResponse<ZuanZhan[]>> {
        const options = createRequestOption(req);
        return this.http.get<ZuanZhan[]>(this.resourceUrl, {
            params: options,
            observe: 'response'
        });
    }

    find(id: any): Observable<HttpResponse<ZuanZhan>> {
        return this.http.get<ZuanZhan>(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    update(zuanZhan: ZuanZhan): Observable<HttpResponse<ZuanZhan>> {
        return this.http.put<ZuanZhan>(this.resourceUrl, zuanZhan, {observe: 'response'});
    }

    create(zuanZhan: ZuanZhan): Observable<HttpResponse<ZuanZhan>> {
        return this.http.post<ZuanZhan>(this.resourceUrl, zuanZhan, {observe: 'response'});
    }

    delete(id: string): Observable<HttpResponse<any>> {
        return this.http.delete(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    checkDetail(req?: any): Observable<HttpResponse<ZuanZhan>> {
        const options = createRequestOption(req);
        return this.http.get<ZuanZhan>(this.checkDetailUrl, {
            params: options,
            observe: 'response'
        });
    }

    exportDataByTimeBetween(req?: any): Observable<HttpResponse<ZuanZhan[]>> {
        const options = createRequestOption(req);
        return this.http.get<ZuanZhan[]>(this.exportDataByTimeBetweenUrl, {
            params: options,
            observe: 'response'
        });
    }
}
