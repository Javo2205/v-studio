import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiStateService } from '../../services/ui-state.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './header.component.html',
    styleUrls: [] // Using Tailwind mainly
})
export class HeaderComponent {

    private uiService = inject(UiStateService);

    openQuotationModal() {
        this.uiService.openQuotationModal();
    }
}
