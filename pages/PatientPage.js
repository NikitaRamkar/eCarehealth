import { expect } from '@playwright/test';
import { DashboardPage } from './DashboardPage.js';

export class PatientPage {
  constructor(page) {
    this.page = page;
    this.dashboardPage = new DashboardPage(page);
  }

  /**
   * Opens the Patients page
   */
  async openPatients() {
    await this.dashboardPage.openPatientsTab();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verifies that the Patients page has loaded successfully
   */
  async verifyPatientsPageLoaded() {
    // Wait for the Patients page to load - check for common elements
    const patientsTitle = this.page.getByText('Patients', { exact: false }).first();
    await expect(patientsTitle).toBeVisible({ timeout: 10000 });
    
    // Verify URL contains patients
    await expect(this.page).toHaveURL(/patients/i, { timeout: 10000 });
  }
}
