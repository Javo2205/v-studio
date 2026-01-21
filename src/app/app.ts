import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { HeroComponent } from './components/hero/hero.component';
import { TrustBarComponent } from './components/trust-bar/trust-bar.component';
import { FeaturesGridComponent } from './components/features-grid/features-grid.component';
import { FooterComponent } from './components/footer/footer.component';
import { QuotationModalComponent } from './components/quotation-modal/quotation-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroComponent,
    TrustBarComponent,
    FeaturesGridComponent,
    FooterComponent,
    QuotationModalComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }
