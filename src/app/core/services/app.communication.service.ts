import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class CommunicationService {
    private subjectCitations = new Subject<any>();
    private subjectDispositionCitations = new Subject<any>();
    private subjectPermits = new Subject<any>();
    private subjectPaymentPermit = new Subject<any>();
    private subjectPaymentCart = new Subject<any>();
    private subjectClearCashiering = new Subject<any>();
    private subjectDMV = new Subject<any>();
    private subjectAP = new Subject<any>();
    private subjectDispositionDMV = new Subject<any>();
    private subjectDispositionAP = new Subject<any>();
    private subjectDispositionFeesTab = new Subject<any>();
    private subjectMessage = new Subject<any>();
    private subjectCart = new Subject<any>();
    private subjectSummery = new Subject<any>();
    private subjectCartDVM = new Subject<any>();
    private subjectCartCitation = new Subject<any>();
    private subjectCartAP = new Subject<any>();
    private subjectRefresh = new Subject<any>();
    private subjectReleaseCheckListUpdation = new Subject<any>();
    private subjectHomeSearchSummery = new Subject<any>();
    private subjectPaymentPlan = new Subject<any>();
    private subjectAutofillCreditCardAmount = new Subject<any>();
    private subjectRefreshData = new Subject<any>();
    sendCitationsData(data: any) {
        this.subjectCitations.next({ citations: data });
    }

    clearCitationsData() {
        this.subjectCitations.next();
    }

    getCitationsData(): Observable<any> {
        return this.subjectCitations.asObservable();
    }

    sendCitationsDataToDisposition(data: any) {
        this.subjectDispositionCitations.next({ citations: data });
    }

    clearCitationsDataDisposition() {
        this.subjectDispositionCitations.next();
    }

    getCitationsDataDisposition(): Observable<any> {
        return this.subjectDispositionCitations.asObservable();
    }

    sendPermitsData(data: any) {
        this.subjectPermits.next({ permits: data });
    }

    sendPermitsDataToDisposition(data: any) {
        this.subjectPermits.next({ permits: data });
    }

    clearPermitsData() {
        this.subjectPermits.next();
    }

    getPermitsData(): Observable<any> {
        return this.subjectPermits.asObservable();
    }

    sendCartPermitData(data: any) {
        this.subjectPermits.next({ permits: data });
    }

    sendPaymentPermitData(data: any) {
        this.subjectPaymentPermit.next({ payment: data });
    }

    clearPaymentPermitData() {
        this.subjectPaymentPermit.next();
    }

    getPaymentPermitData(): Observable<any> {
        return this.subjectPaymentPermit.asObservable();
    }

    sendPaymentCartData(data: any) {
        this.subjectPaymentCart.next({ cart: data });
    }

    clearPaymentCartData() {
        this.subjectPaymentCart.next();
    }

    getPaymentCartData(): Observable<any> {
        return this.subjectPaymentCart.asObservable();
    }

    sendClearCashiering(data: any) {
        this.subjectClearCashiering.next({ data });
    }

    getClearCashiering(): Observable<any> {
        return this.subjectClearCashiering.asObservable();
    }

    sendDMVData(data: any) {
        this.subjectDMV.next({ dmv: data });
    }

    clearDMVData() {
        this.subjectDMV.next();
    }

    getDMVData(): Observable<any> {
        return this.subjectDMV.asObservable();
    }

    sendAPData(data: any) {
        this.subjectAP.next({ ap: data });
    }

    clearAPData() {
        this.subjectAP.next();
    }

    getAPData(): Observable<any> {
        return this.subjectAP.asObservable();
    }

    sendDMVDataToDisposition(data: any) {
        this.subjectDispositionDMV.next({ dmv: data });
    }

    clearDMVDataDisposition() {
        this.subjectDispositionDMV.next();
    }

    getDMVDataDisposition(): Observable<any> {
        return this.subjectDispositionDMV.asObservable();
    }

    sendAPDataToDisposition(data: any) {
        this.subjectDispositionAP.next({ ap: data });
    }

    clearAPDataDisposition() {
        this.subjectDispositionAP.next();
    }

    getAPDataDisposition(): Observable<any> {
        return this.subjectDispositionAP.asObservable();
    }

    sendFeesTabDataToDisposition(data: any) {
        this.subjectDispositionFeesTab.next({ fees: data });
    }

    clearFeesTabDataDisposition() {
        this.subjectDispositionFeesTab.next();
    }

    getFeesTabDataDisposition(): Observable<any> {
        return this.subjectDispositionFeesTab.asObservable();
    }

    sendMessage(data: any) {
        this.subjectMessage.next({ data: data });
    }

    clearMessage() {
        this.subjectMessage.next();
    }

    getMessage(): Observable<any> {
        return this.subjectMessage.asObservable();
    }

    getCartData(): Observable<any> {
        return this.subjectCart.asObservable();
    }

    sendCartData(data: any) {
        this.subjectCart.next({ deleteCartItem: data });
    }

    getSummeryData(): Observable<any> {
        return this.subjectSummery.asObservable();
    }

    sendSummeryData(data: any) {
        this.subjectSummery.next({ summeryItem: data });
    }

    getCartDVMData(): Observable<any> {
        return this.subjectCartDVM.asObservable();
    }

    sendCartDVMData(data: any) {
        this.subjectCartDVM.next({ dmv: data });
    }

    getCartCitationData(): Observable<any> {
        return this.subjectCartCitation.asObservable();
    }

    sendCartCitationData(data: any) {
        this.subjectCartCitation.next({ citations: data });
    }

    getCartAPData(): Observable<any> {
        return this.subjectCartAP.asObservable();
    }

    sendCartAPData(data: any) {
        this.subjectCartAP.next({ ap: data });
    }

    sendReleaseCheckListDataUpdation(data: any) {
        this.subjectReleaseCheckListUpdation.next({ CheckListUpdation: data });
    }

    clearReleaseCheckListDataUpdation() {
        this.subjectReleaseCheckListUpdation.next();
    }

    getReleaseCheckListDataUpdation(): Observable<any> {
        return this.subjectReleaseCheckListUpdation.asObservable();
    }

    getHomeSearchSummeryData(): Observable<any> {
        return this.subjectHomeSearchSummery.asObservable();
    }

    sendHomeSearchSummeryData(data: any) {
        this.subjectHomeSearchSummery.next({ summeryItem: data });
    }    

    sendPaymentPlanData(data: any) {
        this.subjectPaymentPlan.next({ paymentPlan: data });
    }

    sendPaymentPlanDataToDisposition(data: any) {
        this.subjectPaymentPlan.next({ paymentPlan: data });
    }

    clearPaymentPlanData() {
        this.subjectPaymentPlan.next();
    }

    getPaymentPlanData(): Observable<any> {
        return this.subjectPaymentPlan.asObservable();
    }

    sendCartPaymentPlanData(data: any) {
        this.subjectPaymentPlan.next({ paymentPlan: data });
    }

    sendPaymentPlanCartData(data: any) {
        this.subjectPaymentCart.next({ cart: data });
    }

    getCreditCardAutoFillData(): Observable<any> {
        return this.subjectAutofillCreditCardAmount.asObservable();
    }

    sendCreditCardAutoFillData(data: any) {
        this.subjectAutofillCreditCardAmount.next(data);
    }

    getRefreshData(): Observable<any> {
        return this.subjectRefreshData.asObservable();
    }

    sendRefreshData(data: any) {
        this.subjectRefreshData.next(data);
    }

}