import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UiStateService {
    // Signal to control the visibility of the Quotation Modal
    private _isQuotationModalOpen = signal<boolean>(false);

    // Read-only signal for consumers
    isQuotationModalOpen = this._isQuotationModalOpen.asReadonly();

    constructor() { }

    openQuotationModal() {
        this._isQuotationModalOpen.set(true);
    }

    closeQuotationModal() {
        this._isQuotationModalOpen.set(false);
    }

    toggleQuotationModal() {
        this._isQuotationModalOpen.update(value => !value);
    }
}
