import { expect } from '@playwright/test';

export class PatientPage {
  constructor(page) {
    this.page = page;
    this.patientsTab = 'text=Patients';
  }

  async openPatients() {
    await this.page.click(this.patientsTab);
  }

  async verifyPatientsPageLoaded() {
    await expect(this.page).toHaveURL(/patients/);
  }
}

