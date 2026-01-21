import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiStateService } from '../../services/ui-state.service';

@Component({
    selector: 'app-hero',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './hero.component.html',
    styleUrls: []
})
export class HeroComponent {
    private uiService = inject(UiStateService);

    openQuotation() {
        this.uiService.openQuotationModal();
    }
}
