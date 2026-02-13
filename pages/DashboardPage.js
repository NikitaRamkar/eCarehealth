import { expect } from '@playwright/test';

export class DashboardPage {
  constructor(page) {
    this.page = page;

    // stable elements visible on your dashboard
    this.appointmentStatus = 'text=Appointment Status';
    this.todaysAppointments = 'text=Today\'s Appointments';
    this.schedulingTab = 'text=Scheduling';
  }

  async verifyDashboardLoaded() {
    await expect(this.page.locator(this.appointmentStatus)).toBeVisible();
  }
  async openSchedulingMenu() {
    await this.page.click(this.schedulingTab);
  }
  
  async openPatientsTab() {
    const patientsTab = this.page.getByText('Patients').first();
    await patientsTab.waitFor({ state: 'visible' });
    await patientsTab.click();
  }
}


  
  