import { expect } from '@playwright/test';

export class AppointmentPage {
  constructor(page) {
    this.page = page;

    // ---- Schedule Appointment (opens menu) ----
    this.scheduleAppointmentButton = page.getByRole('button', {
      name: 'Schedule Appointment',
    });

    // ---- Menu option ----
    this.newAppointmentOption = page.getByRole('menuitem', {
      name: 'New Appointment',
    });

    // ---- Drawer (form is in a dialog or drawer panel) ----
    this.drawerTitle = page.getByText('Schedule Appointment');
    this.appointmentDrawer = page.getByRole('dialog').or(page.locator('[class*="drawer"], [class*="Drawer"]'));

    // ---- Required fields ----
    this.patientInput = page.getByPlaceholder('Search Patient');
    this.appointmentTypeDropdown = page.getByLabel(/appointment type/i).or(page.getByRole('combobox', { name: /appointment type/i }));
    this.chiefComplaintInput = page.getByPlaceholder('Reason');
    this.timezoneDropdown = page.getByLabel('Timezone');

    // ---- Visit Type (toggle group aria-label="Platform": In Office = IN_PERSON, Telehealth = VIRTUAL) ----
    this.visitTypeGroup = page.getByRole('group', { name: 'Platform' });
    this.telehealthOption = this.visitTypeGroup.getByRole('button', { name: /telehealth/i }).or(this.visitTypeGroup.locator('button[value="VIRTUAL"]'));
    this.inOfficeOption = this.visitTypeGroup.getByRole('button', { name: /in office/i }).or(this.visitTypeGroup.locator('button[value="IN_PERSON"]'));

    // ---- Availability (calendar popup + slot selection) ----
    this.viewAvailabilityButton = page.getByRole('button', {
      name: 'View availability',
    });
    this.availabilityCalendarDialog = page.getByRole('dialog').filter({
      has: page.locator('button, [role="gridcell"]').first(),
    });

    // ---- Save ----
    this.saveAndCloseButton = page.getByRole('button', {
      name: 'Save And Close',
    });
  }

  // ---- Open New Appointment ----
  async openNewAppointment() {
    await this.scheduleAppointmentButton.click();

    // Scope to the open menu so we click the right option (avoids stale/hidden state)
    const menu = this.page.getByRole('menu').or(this.page.getByRole('listbox'));
    await menu.waitFor({ state: 'visible', timeout: 5000 });
    const newOption = menu.getByRole('menuitem', { name: /new appointment/i })
      .or(menu.getByRole('option', { name: /new appointment/i }))
      .or(menu.getByText(/new appointment/i));
    await newOption.first().click();

    // Wait for drawer content (patient search only exists in the drawer)
    await expect(this.patientInput).toBeVisible({ timeout: 10000 });
  }

  async selectPatient(patientName) {
    await this.patientInput.fill(patientName);
    await this.page.getByRole('option', { name: patientName }).click();
  }

  async selectAppointmentType(type = 'Followupp') {
    // Scope to drawer so we hit the form field, not another element
    const dropdown = this.appointmentDrawer.getByLabel(/appointment type/i)
      .or(this.appointmentDrawer.getByRole('combobox', { name: /appointment type/i }))
      .first();
    await dropdown.waitFor({ state: 'visible', timeout: 5000 });
    await dropdown.click({ force: true });
    const listbox = this.page.getByRole('listbox', { name: /appointment type/i });
    await listbox.getByRole('option', { name: type }).click();
  }

  async enterChiefComplaint(text = 'Chest pain') {
    await this.chiefComplaintInput.fill(text);
  }

  async selectTimezone(
    timezone = 'Eastern Standard Time (GMT -05:00)'
  ) {
    await this.timezoneDropdown.click();
    await this.page.getByRole('option', { name: timezone }).click();
  }

  async selectVisitType(type = 'Telehealth') {
    const option = type.toLowerCase().includes('telehealth')
      ? this.telehealthOption
      : this.inOfficeOption;
    await option.click();
  }

  /**
   * Opens View availability, selects the given date in the calendar popup, then clicks a time slot.
   * @param {string} date - MM-DD-YYYY (e.g. from availability slot)
   * @param {string} [startTime] - optional e.g. '12:00 AM'; if omitted, picks a random available slot
   */
  async selectSlotFromAvailability(date, startTime) {
    await this.viewAvailabilityButton.click();

    // Wait for calendar popup (availability calendar dialog)
    const calendar = this.page.getByRole('dialog').last();
    await calendar.waitFor({ state: 'visible', timeout: 10000 });

    // Parse date (MM-DD-YYYY) to get day number (second segment is DD)
    const [month, day, year] = date.split('-');
    const dayNum = parseInt(day, 10);

    // Click the day in the calendar (exact day number to avoid 19/29 when choosing 9)
    const dayCell = calendar.getByRole('button', { name: new RegExp(`^${dayNum}$`) })
      .or(calendar.getByRole('gridcell', { name: new RegExp(`^${dayNum}$`) }))
      .or(calendar.getByText(new RegExp(`^${dayNum}$`)).first())
      .first();
    await dayCell.click();

    // 15-min time slots shown as "12:15 AM - 12:30 AM", "01:00 AM - 01:15 AM", etc.
    const slotButtons = this.page.getByRole('button').filter({
      hasText: /\d{1,2}:\d{2}\s*(AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(AM|PM)/i,
    });
    await slotButtons.first().waitFor({ state: 'visible', timeout: 10000 });

    if (startTime) {
      const slot = slotButtons.filter({ hasText: startTime });
      await slot.first().click();
    } else {
      // Pick a different random 15-min slot each run
      const count = await slotButtons.count();
      const randomIndex = Math.floor(Math.random() * count);
      await slotButtons.nth(randomIndex).click();
    }
  }

  /** Clicks "Save And Close" to confirm the appointment. */
  async saveAppointment() {
    await this.saveAndCloseButton.click();
  }

  // ---- FULL FLOW ----
  async bookAppointmentFromAvailability({
    date,
    startTime, // optional; if omitted, a random available slot is selected each time
    patientName = 'mike simon',
    appointmentType = 'Followupp',
    complaint = 'Chest pain',
    timezone = 'Eastern Standard Time (GMT -05:00)',
  }) {
    await this.openNewAppointment();
    await this.selectPatient(patientName);
    await this.selectAppointmentType(appointmentType);
    await this.enterChiefComplaint(complaint);
    await this.selectTimezone(timezone);
    await this.selectVisitType('Telehealth');
    await this.selectSlotFromAvailability(date, startTime);
    await this.saveAppointment();
  }
}
