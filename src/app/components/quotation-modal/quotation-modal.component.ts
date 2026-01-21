import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { UiStateService } from '../../services/ui-state.service';

@Component({
    selector: 'app-quotation-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './quotation-modal.component.html'
})
export class QuotationModalComponent {
    uiService = inject(UiStateService);
    private http = inject(HttpClient);
    isSubmitting = signal(false);

    // View State: 'form' | 'success'
    viewState = signal<'form' | 'success'>('form');

    // Form Data Signals (Simple binding)
    formData = {
        name: '',
        email: '',
        projectType: ''
    };

    close() {
        this.uiService.closeQuotationModal();
        // Reset state after delay so transition isn't jarring if re-opened
        setTimeout(() => {
            this.viewState.set('form');
            this.formData = { name: '', email: '', projectType: '' };
            this.isSubmitting.set(false);
        }, 300);
    }

    submitForm() {
        if (this.isSubmitting()) return;
        this.isSubmitting.set(true);

        this.http.post('/api/quotation', this.formData).subscribe({
            next: (response) => {
                console.log('Email sent successfully', response);
                this.viewState.set('success');
                this.isSubmitting.set(false);
            },
            error: (err) => {
                console.error('Error sending email', err);
                alert('Hubo un error al enviar la solicitud. Por favor intenta de nuevo.');
                this.isSubmitting.set(false);
            }
        });
    }
}
