import { expect } from '@playwright/test';

export class SchedulingPage {
  constructor(page) {
    this.page = page;

    this.schedulingMenu = page.getByText('Scheduling').first();

    this.appointmentsMenuItem = page
      .locator('#menu-appbar')
      .getByText('Appointments');
    this.availabilityMenuItem = page
      .locator('#menu-appbar')
      .getByText('Availability');
  }

  async goToAppointments() {
    await this.appointmentsMenuItem.waitFor({ state: 'visible' });
    await this.appointmentsMenuItem.click();
  }

  async goToAppointmentsFromSubPage() {
    await this.schedulingMenu.waitFor({ state: 'visible', timeout: 30000 });
    await this.schedulingMenu.click();
    await this.appointmentsMenuItem.waitFor({ state: 'visible', timeout: 10000 });
    await this.appointmentsMenuItem.click();
  }

  async goToAvailability() {
    await this.availabilityMenuItem.waitFor({ state: 'visible' });
    await this.availabilityMenuItem.click();
  }

  async verifyAppointmentsLoaded() {
    await expect(this.page).toHaveURL(/appointments?/i);
  }

  async verifyAvailabilityLoaded() {
    await expect(this.page).toHaveURL(/availability/i);
  }
}