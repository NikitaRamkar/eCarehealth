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

    // ---- Filter/Search (in the left sidebar) ----
    // Find the "Search By Patient" field - it's near the label "Search By Patient"
    this.searchByPatientFilter = page.locator('input[placeholder="Search & Select"]')
      .filter({ has: page.getByText('Search By Patient', { exact: false }).locator('..') })
      .or(page.locator('label:has-text("Search By Patient") + * input[placeholder*="Search"]'))
      .or(page.getByPlaceholder('Search & Select').first());
    
    // ---- Appointment List ----
    this.scheduledButton = page.getByRole('button', { name: 'Scheduled' });
  }

  // ---- Open New Appointment ----
  async openNewAppointment() {
    // Wait for the appointments page to be ready
    await this.page.waitForTimeout(2000);
    
    // Click the Schedule Appointment button - try multiple selectors
    let scheduleButton;
    try {
      scheduleButton = this.page.getByRole('button', { name: 'Schedule Appointment' });
      await scheduleButton.waitFor({ state: 'visible', timeout: 10000 });
    } catch (e) {
      // Try alternative selector
      scheduleButton = this.page.getByRole('button', { name: /schedule.*appointment/i });
      await scheduleButton.waitFor({ state: 'visible', timeout: 10000 });
    }
    await scheduleButton.click();

    // Wait for the menu to appear
    await this.page.waitForTimeout(1000);
    
    // Directly find and click "New Appointment" - don't try to find menu first
    // The menu item should be visible after clicking the button
    const newAppointmentOption = this.page.getByRole('menuitem', { name: 'New Appointment', exact: false })
      .or(this.page.getByRole('menuitem', { name: /new appointment/i }))
      .or(this.page.getByRole('option', { name: 'New Appointment', exact: false }))
      .or(this.page.getByRole('option', { name: /new appointment/i }))
      .or(this.page.locator('li:has-text("New Appointment")'))
      .or(this.page.getByText('New Appointment', { exact: false }))
      .first();
    
    await newAppointmentOption.waitFor({ state: 'visible', timeout: 10000 });
    await newAppointmentOption.click();

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
    
    // Wait a moment for the listbox to appear
    await this.page.waitForTimeout(1000);
    
    // Wait for listbox to appear - try multiple ways to find it
    // The listbox might be in a portal/overlay, so search the whole page
    const listbox = this.page.getByRole('listbox')
      .or(this.page.locator('[role="listbox"]'))
      .or(this.page.locator('ul[role="listbox"]'))
      .first();
    await listbox.waitFor({ state: 'visible', timeout: 10000 });
    
    // Try to find the option - be flexible with matching
    // The option might be "(ECH1000DF) Followupp" or just "Followupp"
    // Use .first() to handle multiple matches
    let option;
    try {
      // Try exact match first
      option = listbox.getByRole('option', { name: type }).first();
      await option.waitFor({ state: 'visible', timeout: 3000 });
    } catch (e) {
      try {
        // Try regex match (case insensitive)
        option = listbox.getByRole('option', { name: new RegExp(type, 'i') }).first();
        await option.waitFor({ state: 'visible', timeout: 3000 });
      } catch (e2) {
        try {
          // Try has-text selector
          option = listbox.locator(`[role="option"]:has-text("${type}")`).first();
          await option.waitFor({ state: 'visible', timeout: 3000 });
        } catch (e3) {
          // Last resort: find by text anywhere in the option
          option = listbox.getByText(new RegExp(type, 'i')).first();
          await option.waitFor({ state: 'visible', timeout: 5000 });
        }
      }
    }
    
    await option.click();
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
    // Wait for the button to be visible and try multiple selectors
    let saveButton;
    try {
      saveButton = this.page.getByRole('button', { name: 'Save And Close' });
      await saveButton.waitFor({ state: 'visible', timeout: 5000 });
      await saveButton.click();
    } catch (e) {
      // Try alternative selectors
      try {
        saveButton = this.page.getByRole('button', { name: /save.*close/i });
        await saveButton.waitFor({ state: 'visible', timeout: 5000 });
        await saveButton.click();
      } catch (e2) {
        // Try finding by text
        saveButton = this.page.locator('button:has-text("Save And Close")');
        await saveButton.waitFor({ state: 'visible', timeout: 5000 });
        await saveButton.click();
      }
    }
  }

  // ---- FULL FLOW ----
  async bookAppointmentFromAvailability({
    date,
    startTime, // optional; if omitted, a random available slot is selected each time
    patientName = 'mike simon',
    appointmentType = 'Followup',
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

  /**
   * Filters appointments by patient name in the left sidebar
   * @param {string} patientName - Full name of the patient (e.g., "emma johnson")
   */
  async filterByPatient(patientName) {
    // Find the "Search By Patient" input field more reliably
    // Look for input near "Search By Patient" label
    const patientFilterLabel = this.page.getByText('Search By Patient', { exact: false });
    const patientFilterInput = this.page.locator('input[placeholder*="Search"]')
      .filter({ has: patientFilterLabel.locator('..') })
      .or(this.page.locator('label:has-text("Search By Patient") ~ * input'))
      .or(this.page.getByPlaceholder('Search & Select').first());
    
    // Wait for the filter input to be visible
    await patientFilterInput.waitFor({ state: 'visible', timeout: 10000 });
    
    // Clear any existing value and type the patient name
    await patientFilterInput.click();
    await patientFilterInput.fill(patientName);
    
    // Wait a moment for the dropdown to appear
    await this.page.waitForTimeout(500);
    
    // The patient name in the dropdown might be capitalized (e.g., "Emma Johnson")
    const capitalizedName = patientName.split(' ').map(name => 
      name.charAt(0).toUpperCase() + name.slice(1)
    ).join(' ');
    
    // Try to find the patient option - it might be in a listbox or menu
    // Use .first() to handle cases where multiple options match
    const patientOption = this.page.getByRole('option', { name: capitalizedName }).first()
      .or(this.page.getByRole('option', { name: new RegExp(patientName, 'i') }).first())
      .or(this.page.locator(`[role="option"]:has-text("${capitalizedName}")`).first())
      .or(this.page.locator(`[role="option"]:has-text("${patientName}")`).first());
    
    await patientOption.waitFor({ state: 'visible', timeout: 5000 });
    await patientOption.click();
    
    // Wait for the list to filter and update
    await this.page.waitForTimeout(1500);
  }

  /**
   * Clicks on the "Scheduled" element for the filtered appointment
   * Note: The "Scheduled" is actually a <p> tag, not a button
   * After filtering, there should be only one appointment visible
   */
  async clickScheduledAppointment() {
    // Wait a bit more for the filtered list to fully render
    await this.page.waitForTimeout(2000);
    
    // Use XPath to find the Scheduled element: div with role='cell' and data-field='status' containing p with 'Scheduled' text
    const scheduledElement = this.page.locator('xpath=//div[@role="cell" and @data-field="status"]//p[normalize-space()="Scheduled"]');
    
    await scheduledElement.waitFor({ state: 'visible', timeout: 10000 });
    await scheduledElement.click();
    
    // Wait a moment after clicking to ensure the action completes
    await this.page.waitForTimeout(1000);
  }
}
