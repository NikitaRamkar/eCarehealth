import { expect } from '@playwright/test';

export class SchedulingPage {
  constructor(page) {
    this.page = page;

    // MUI menus expose menu items with role="menuitem"
    this.appointmentsMenuItem = page.getByRole('menuitem', {
      name: 'Appointments',
    });

    this.availabilityMenuItem = page.getByRole('menuitem', {
      name: 'Availability',
    });
  }

  async goToAppointments() {
    // wait until the menu item is actually visible & clickable
    await this.appointmentsMenuItem.waitFor({ state: 'visible' });
    await this.appointmentsMenuItem.click();
  }

  async goToAvailability() {
    await this.availabilityMenuItem.waitFor({ state: 'visible' });
    await this.availabilityMenuItem.click();
  }

  async verifyAppointmentsLoaded() {
    await expect(this.page).toHaveURL(/appointment/);
  }

  async verifyAvailabilityLoaded() {
    await expect(this.page).toHaveURL(/availability/);
  }
}
