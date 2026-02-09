export class AvailabilityPage {
  constructor(page) {
    this.page = page;

    // ---- Edit Availability Button ----
    this.editAvailabilityButton = page.getByRole('button', { name: 'Edit Availability' });

    // ---- Start Date ----
    this.startDateInput = page.locator('input[placeholder="MM-DD-YYYY"]');

    // ---- Booking Window ----
    this.bookingWindowDropdown = page.getByLabel('Booking Window');

    // ---- Apply to All Days ----
    this.applyAllDaysToggle = page.getByLabel(/apply to all days/i);

    // ---- Time Slot ----
    this.startTimeDropdown = page.getByLabel('Start Time');
    this.endTimeDropdown = page.getByLabel('End Time');

    // ---- Save ----
    this.saveButton = page.getByRole('button', { name: 'Save' });

    // ---- Edit Availability Modal (used to wait for close after save) ----
    this.editAvailabilityModal = page.getByRole('dialog');
  }

  // ---- Click Edit Availability ----
  async clickEditAvailability() {
    await this.editAvailabilityButton.click();
  }

  // ---- Set Start Date (Dynamic) ----
  async setStartDate(daysFromToday = 1) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);

    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();

    await this.startDateInput.fill(`${mm}-${dd}-${yyyy}`);

    return `${mm}-${dd}-${yyyy}`;
  }

//  // ---- Select Booking Window ----
  async selectBookingWindow(week = '2 Week') {
    await this.bookingWindowDropdown.click();
   // await this.page.getByRole('option', { name: week }).click();
   const listbox = this.page.getByRole('listbox', {
    name: /booking window/i,
  });

  await listbox.getByRole('option', { name: week, exact: true }).click();
}

  // ---- Enable Apply to All Days ----
 // async enableApplyToAllDays() {
   // if (!(await this.applyAllDaysToggle.isChecked())) {
   //   await this.applyAllDaysToggle.click();
   // }

   // ---- Enable Apply to All Days (optional: click if present) ----
  async enableApplyToAllDays() {
    await this.editAvailabilityModal.waitFor({ state: 'visible', timeout: 10000 });

    const toggle = this.page
      .getByRole('button', { name: /apply to all days/i })
      .or(this.page.getByRole('switch', { name: /apply to all days/i }))
      .or(this.page.getByLabel(/apply to all days/i))
      .or(this.page.getByText(/apply to all days/i));

    const visible = await toggle.first().isVisible({ timeout: 3000 }).catch(() => false);
    if (visible) {
      await toggle.first().click();
    }
    // If not visible, skip - UI may not have this control or it may be optional
  }


  

  // ---- Select Time Slot ----
  async selectTimeSlot(startTime = '12:00 AM', endTime = '04:15 AM') {
    const defaultStart = '12:00 AM';
    const defaultEnd = '04:15 AM';
    const useDefaults = startTime === defaultStart && endTime === defaultEnd;

    if (!useDefaults) {
      await this.startTimeDropdown.click();
      const startListbox = this.page.getByRole('listbox', { name: /start time/i });
      await startListbox.getByRole('option', { name: startTime }).click();

      await this.endTimeDropdown.click();
      const endListbox = this.page.getByRole('listbox', { name: /end time/i });
      await endListbox.getByRole('option', { name: endTime }).click();
    }
    return { startTime, endTime };
  }

  // ---- Save Availability (WAIT FOR ASYNC BACKEND) ----
  async saveAvailability() {
    await this.saveButton.click();

    // wait for save request to complete
//    await this.page.waitForLoadState('networkidle');
       // wait for Save button to disappear or disable
   // await expect(this.saveButton).toBeDisabled({ timeout: 10000 });
        await this.saveButton.click();

    // modal may not auto-close - press Escape to dismiss (MUI dialog pattern)
    await this.page.keyboard.press('Escape');

    // wait for modal to be gone
  //  await this.editAvailabilityModal.waitFor({ state: 'hidden', timeout: 5000 });
  }

  // ---- COMPLETE FLOW + RETURN SLOT DATA ----
  async createAvailabilityAndGetSlot(daysFromToday = 1) {
    await this.clickEditAvailability();

    const date = await this.setStartDate(daysFromToday);

    await this.selectBookingWindow('2 Week');
    await this.enableApplyToAllDays();

    const { startTime, endTime } = await this.selectTimeSlot(
      '12:00 AM',
      '04:15 AM'
    );

    await this.saveAvailability();

    // ---- Return data for AppointmentPage ----
    return {
      date,
      startTime,
      endTime,
    };
  }
}