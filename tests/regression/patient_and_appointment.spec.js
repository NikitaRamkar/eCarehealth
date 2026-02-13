import { test } from '@playwright/test';

import { LoginPage } from '../../pages/LoginPage.js';
import { DashboardPage } from '../../pages/DashboardPage.js';
import { PatientsPage } from '../../pages/patientsPage/patientcreation.js';
import { SchedulingPage } from '../../pages/schedulingPage.js';
import { AvailabilityPage } from '../../pages/schedulingmodule/AvailabilityPage.js';
import { AppointmentPage } from '../../pages/schedulingmodule/AppointmentPage.js';
import { generatePatient } from '../../utils/patientData.js';

test('Provider creates patient and schedules appointment for new patient', async ({ page }) => {
  test.setTimeout(300000); // 5 minutes timeout
  // ---- Page Objects ----
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const patientsPage = new PatientsPage(page);
  const schedulingPage = new SchedulingPage(page);
  const availabilityPage = new AvailabilityPage(page);
  const appointmentPage = new AppointmentPage(page);

  // ---- Login ----
  await loginPage.goto();
  await loginPage.login();

  // ---- Create New Patient ----
  await dashboardPage.openPatientsTab();
  
  const patient = generatePatient();
  // Store both lowercase (for form input) and capitalized (for display/search) versions
  const patientFullNameLower = `${patient.firstName} ${patient.lastName}`.toLowerCase();
  const patientFullNameCapitalized = `${patient.firstName} ${patient.lastName}`;
  
  await patientsPage.openNewPatientForm();
  await patientsPage.fillPatientDetails(patient);
  await patientsPage.waitForPatientSaved();

  // Wait for page to be ready after patient creation
  await page.waitForTimeout(3000);

  // ---- Navigate to Availability ----
  await dashboardPage.openSchedulingMenu();
  await schedulingPage.goToAvailability();

  // ---- Create Availability ----
  const slot = await availabilityPage.createAvailabilityAndGetSlot(2);
  // slot = { date, startTime, endTime }

  // ---- Navigate to Appointments ----
  await schedulingPage.goToAppointmentsFromSubPage();

  // ---- Schedule Appointment for the newly created patient ----
  await appointmentPage.bookAppointmentFromAvailability({
    date: slot.date,
    patientName: patientFullNameLower,
    complaint: 'Follow-up appointment',
  });

  // Wait for appointment to be saved and page to refresh
  await page.waitForTimeout(2000);

  // ---- Navigate back to Appointments list ----
  await dashboardPage.openSchedulingMenu();
  await schedulingPage.goToAppointments();

  // ---- Filter appointments by the newly created patient ----
  // Use lowercase for search input, the method will handle capitalization matching
  await appointmentPage.filterByPatient(patientFullNameLower);

  // ---- Click on the Scheduled appointment ----
  // After filtering, there should be only one appointment visible
  await appointmentPage.clickScheduledAppointment();

  // ---- Complete the appointment workflow ----
  // Fill in the amount
  await page.getByRole('spinbutton', { name: 'Amount *' }).click();
  await page.getByRole('spinbutton', { name: 'Amount *' }).fill('2994');
  
  // Confirm the appointment
  await page.getByRole('button', { name: 'Confirm Appointment' }).click();
  await page.waitForTimeout(3000); // Wait for UI to update after confirmation
  
  // Start check in (click multiple times as needed)
  // Wait for the button to appear - it might take a moment after confirmation
  const startCheckInButton = page.getByRole('button', { name: 'Start Check In' });
  await startCheckInButton.waitFor({ state: 'visible', timeout: 15000 });
  await startCheckInButton.click();
  await page.waitForTimeout(1000);
  
  // Click again if needed (the button might still be visible)
  try {
    await startCheckInButton.waitFor({ state: 'visible', timeout: 2000 });
    await startCheckInButton.click();
    await page.waitForTimeout(1000);
  } catch (e) {
    // Button might have disappeared, continue
  }
  
  // Click one more time if still visible
  try {
    await startCheckInButton.waitFor({ state: 'visible', timeout: 2000 });
    await startCheckInButton.click();
    await page.waitForTimeout(1000);
  } catch (e) {
    // Button might have disappeared, continue
  }
  
  // Complete check in
  await page.getByRole('button', { name: 'Complete Check In' }).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('button', { name: 'Complete Check In' }).click();
  await page.waitForTimeout(2000);
  
  // Start appointment
  await page.getByRole('button', { name: 'Start Appointment' }).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('button', { name: 'Start Appointment' }).click();
  await page.waitForTimeout(2000);
  
  // Start encounter
  await page.getByRole('button', { name: 'Start Encounter' }).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('button', { name: 'Start Encounter' }).click();
  await page.waitForTimeout(2000);
  
  // Open Psychiatric Note menu
  await page.getByRole('button', { name: 'Psychiatric Note' }).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('button', { name: 'Psychiatric Note' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('menuitem', { name: 'Psychiatric Note' }).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('menuitem', { name: 'Psychiatric Note' }).click();
  await page.waitForTimeout(2000); // Wait for page/dialog to load

  // ---- Complete Psychiatric Note Workflow ----
  // Click on the paragraph in the menuitem (if it exists, otherwise continue)
  try {
    const paragraph = page.getByRole('menuitem', { name: 'Psychiatric Note' }).getByRole('paragraph');
    await paragraph.waitFor({ state: 'visible', timeout: 3000 });
    await paragraph.click();
    await page.waitForTimeout(500);
  } catch (e) {
    // Paragraph might not be needed, or page already navigated - continue
    await page.waitForTimeout(1000);
  }

  // Fill in Problems
  await page.getByRole('textbox', { name: 'Problems...' }).click();
  await page.getByRole('textbox', { name: 'Problems...' }).click();
  await page.getByRole('textbox', { name: 'Problems...' }).fill('Patient reports mild lower abdominal pain since 2 days. Pain is intermittent, dull in nature, rated 4/10 in severity. Denies fever, vomiting, or urinary complaints. Appetite normal. No recent travel or known sick contacts.');
  await page.waitForTimeout(500);

  // Fill in Allergies
  await page.getByRole('textbox', { name: 'Enter Allergies, ex:dust <' }).click();
  await page.getByRole('textbox', { name: 'Enter Allergies, ex:dust <' }).fill('Patient presents for routine visit. Denies any new complaints. No fever, cough, chest pain, shortness of breath, or gastrointestinal symptoms. Overall feeling well.');
  await page.getByRole('button', { name: 'Add Allergy' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('textbox', { name: 'Allergy Name *' }).click();
  await page.getByRole('textbox', { name: 'Allergy Name *' }).fill('Penicillin');
  await page.getByRole('combobox', { name: 'Severity' }).click();
  await page.getByRole('option', { name: 'Moderate' }).click();
  await page.getByRole('textbox', { name: 'Reaction' }).click();
  await page.getByRole('textbox', { name: 'Reaction' }).fill('Nausea');
  await page.getByRole('combobox', { name: 'Status *' }).click();
  await page.getByRole('combobox', { name: 'Status *' }).click();
  await page.getByRole('textbox', { name: 'Note' }).click();
  await page.getByRole('textbox', { name: 'Note' }).fill('allegy');
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
  await page.waitForTimeout(1000);

  // Add PMH (Past Medical History)
  await page.getByRole('button', { name: 'Add PMH' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('textbox', { name: 'Condition Name *' }).click();
  await page.getByRole('textbox', { name: 'Condition Name *' }).fill('Spine L!');
  await page.getByRole('textbox', { name: 'Note' }).click();
  await page.getByRole('textbox', { name: 'Note' }).fill('past medicl histry');
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
  await page.waitForTimeout(1000);

  // Add PSH (Past Surgical History)
  await page.getByRole('button', { name: 'Add PSH' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('textbox', { name: 'Surgery Name *' }).click();
  await page.getByRole('textbox', { name: 'Surgery Name *' }).fill('Appendectomy');
  await page.getByRole('textbox', { name: 'Note' }).click();
  await page.getByRole('textbox', { name: 'Note' }).fill('past surgical');
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
  await page.waitForTimeout(1000);

  // Add FH (Family History)
  await page.getByRole('button', { name: 'Add FH' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('combobox', { name: 'Problem Name *' }).click();
  await page.getByRole('option', { name: 'E830 - Disorders of copper metabolism' }).click();
  await page.getByRole('combobox', { name: 'Relative *' }).click();
  await page.getByRole('option', { name: 'Father' }).click();
  await page.getByRole('textbox', { name: 'Note' }).click();
  await page.getByRole('textbox', { name: 'Note' }).fill('past family');
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
  await page.waitForTimeout(1000);

  // Add SH (Social History)
  await page.getByRole('button', { name: 'Add SH' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('combobox', { name: 'Social History Type' }).click();
  await page.getByRole('option', { name: 'Advance Directive' }).click();
  await page.getByRole('button', { name: 'Yes' }).first().click();
  await page.getByRole('button', { name: 'Yes' }).nth(1).click();
  await page.getByRole('button', { name: 'Save Response' }).click();
  await page.waitForTimeout(500);
  
  // Close the Social History form - try multiple approaches for robustness
  try {
    const socialHistoryClose = page.getByTestId('CloseIcon').nth(2);
    await socialHistoryClose.waitFor({ state: 'visible', timeout: 5000 });
    await socialHistoryClose.click();
    await page.waitForTimeout(500);
  } catch (e) {
    // Try different index or last close icon
    try {
      await page.getByTestId('CloseIcon').last().click();
      await page.waitForTimeout(500);
    } catch (e2) {
      // Dialog might have closed automatically, continue
      await page.waitForTimeout(500);
    }
  }

  // Add Current Medications
  await page.getByRole('button', { name: 'Add Current Meds' }).click();
  await page.waitForTimeout(1000);
  
  // Wait for and click the Medicine Name combobox
  const medicineCombobox = page.getByRole('combobox', { name: 'Medicine Name *' });
  await medicineCombobox.waitFor({ state: 'visible', timeout: 10000 });
  await medicineCombobox.click();
  await page.waitForTimeout(500);
  
  // Wait for the option to appear and click it
  const medicineOption = page.getByRole('option', { name: 'Neo-polycin - Gramicidin' });
  await medicineOption.waitFor({ state: 'visible', timeout: 10000 });
  await medicineOption.click();
  await page.waitForTimeout(500);
  
  await page.getByRole('textbox', { name: 'Quantity' }).click();
  await page.getByRole('textbox', { name: 'Quantity' }).fill('4');
  await page.getByRole('checkbox', { name: 'For Lifetime' }).check();
  await page.getByRole('textbox', { name: 'Note' }).click();
  await page.getByRole('textbox', { name: 'Note' }).fill('use this medication');
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
  await page.waitForTimeout(1000);

  // Fill Observations
  await page.getByRole('textbox', { name: 'Observations...' }).click();
  await page.getByRole('textbox', { name: 'Observations...' }).click();
  await page.getByRole('textbox', { name: 'Observations...' }).fill('Patient alert and oriented ×3.\nNo acute distress noted.\nPhysical examination unremarkable.\nVital signs reviewed and stable.');
  await page.waitForTimeout(500);

  // Add Vitals
  await page.getByRole('button', { name: 'Add Vitals' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('combobox', { name: 'Select Vitals' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: 'Body Temperature' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
  await page.waitForTimeout(1000);
  
  // Fill in the vitals value - wait for the textbox to appear
  const enterVitalsInput = page.getByRole('textbox', { name: 'Enter', exact: true });
  await enterVitalsInput.waitFor({ state: 'visible', timeout: 10000 });
  await enterVitalsInput.click();
  await enterVitalsInput.fill('120');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
  await page.waitForTimeout(1000);

  // Add ROS (Review of Systems)
  await page.getByRole('button', { name: 'Add ROS' }).click();
  await page.waitForTimeout(1000);
  // Wait for the combobox to be ready and use force click if needed
  const rosTemplate = page.getByRole('combobox', { name: 'Select Template' }).first();
  await rosTemplate.waitFor({ state: 'visible', timeout: 10000 });
  await rosTemplate.click({ force: true });
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: 'General OPD Visit – Adult', exact: true }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
  await page.waitForTimeout(1000);

  // Add PE (Physical Examination)
  await page.getByRole('button', { name: 'Add PE' }).click();
  await page.waitForTimeout(1000);
  // Wait for the dialog/modal to appear, then find the Select Template combobox within it
  // Use the last visible Select Template combobox (the one that appears after clicking Add PE)
  const peTemplate = page.getByRole('combobox', { name: 'Select Template' }).last();
  await peTemplate.waitFor({ state: 'visible', timeout: 10000 });
  await peTemplate.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: 'PE - Template1', exact: true }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
  await page.waitForTimeout(1000);
  
  // Close the PE dialog if it's still open - try multiple approaches
  try {
    const peCloseIcon = page.getByTestId('CloseIcon').nth(2);
    await peCloseIcon.waitFor({ state: 'visible', timeout: 3000 });
    await peCloseIcon.click();
    await page.waitForTimeout(500);
  } catch (e) {
    // Dialog might have closed automatically, or try different index
    try {
      await page.getByTestId('CloseIcon').last().click();
      await page.waitForTimeout(500);
    } catch (e2) {
      // Dialog already closed, continue
      await page.waitForTimeout(500);
    }
  }

  // Add Screening
  await page.getByRole('button', { name: 'Add Screening' }).click();
  await page.waitForTimeout(500);
  await page.getByText('AAI (Appearance Anxiety').click();
  await page.getByRole('radio').nth(1).check();
  await page.locator('tr:nth-child(2) > td:nth-child(4) > .MuiBox-root').click();
  await page.locator('tr:nth-child(3) > td:nth-child(3) > .MuiBox-root > .MuiButtonBase-root > .PrivateSwitchBase-input').check();
  await page.locator('tr:nth-child(4) > td:nth-child(3) > .MuiBox-root > .MuiButtonBase-root > .PrivateSwitchBase-input').check();
  await page.locator('tr:nth-child(5) > td:nth-child(4) > .MuiBox-root > .MuiButtonBase-root > .PrivateSwitchBase-input').check();
  await page.locator('tr:nth-child(6) > td:nth-child(3) > .MuiBox-root').click();
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
  await page.waitForTimeout(1000);

  // Fill Assessment
  await page.getByRole('textbox', { name: 'Assessment...' }).click();
  await page.getByRole('textbox', { name: 'Assessment...' }).fill('Acute viral illness – mild.\nHemodynamically stable.');
  await page.waitForTimeout(500);

  // Fill Plan
  await page.getByRole('textbox', { name: 'Plan...' }).click();
  await page.getByRole('textbox', { name: 'Plan...' }).fill('Plan:\n• Continue current medications.\n• Symptomatic treatment as needed.\n• Encourage hydration and rest.\n• Follow up in 1–2 weeks or earlier if symptoms worsen.');
  await page.waitForTimeout(500);

  // Add ICD Codes
  await page.getByRole('button', { name: 'Add ICD Codes' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('combobox', { name: 'Search & Select ICD Codes' }).click();
  await page.getByRole('option', { name: 'E8311 - Hemochromatosis' }).click();
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.waitForTimeout(1000);

  // Add Prescription (eRx)
  await page.getByRole('button', { name: 'eRx' }).click();
  await page.waitForTimeout(500);
  await page.getByText('Paper Prescription').click();
  await page.waitForTimeout(500);
  await page.getByRole('combobox', { name: 'Type *' }).click();
  await page.getByRole('option', { name: 'New Rx' }).click();
  await page.getByRole('combobox', { name: 'Medication Name *' }).click();
  await page.getByRole('option', { name: 'Neo-polycin - Gramicidin' }).click();
  await page.getByRole('combobox', { name: 'Substitutions or Dispense *' }).click();
  await page.getByRole('option', { name: 'Dispense As Written' }).click();
  await page.getByRole('textbox', { name: 'Quantity *' }).click();
  await page.getByRole('textbox', { name: 'Quantity *' }).fill('4');
  await page.getByRole('combobox', { name: 'Pharmacy *' }).click();
  await page.getByRole('option', { name: 'pharmacy health clinic ' }).click();
  await page.getByRole('button', { name: 'Add Rx' }).click();
  await page.waitForTimeout(1000);
  await page.getByTestId('CloseIcon').nth(1).click();
  await page.waitForTimeout(500);

  // Add Orders
  await page.getByRole('button', { name: 'Orders' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('textbox', { name: 'Order Title *' }).click();
  await page.getByRole('textbox', { name: 'Order Title *' }).fill('lab machine');
  await page.getByRole('combobox', { name: 'Lab *' }).click();
  await page.getByRole('option', { name: 'pathology' }).click();
  await page.getByRole('combobox', { name: 'Icd Code' }).click();
  await page.getByRole('option', { name: 'E8311 - Hemochromatosis' }).click();
  await page.getByRole('combobox', { name: 'Tests *' }).click();
  await page.getByRole('option', { name: '13016-1 - Nitrophenol [Units/volume] in Blood' }).click();
  await page.getByRole('button', { name: 'Order', exact: true }).click();
  //await page.getByText('Prescription', { exact: true }).first().click();
  //await page.locator('div').filter({ hasText: /^Tests \*7708989 - Test Loinc codeTests \*$/ }).first().click();
  //await page.getByRole('button', { name: 'Order', exact: true }).click();
  await page.waitForTimeout(1000);

  // Add Immunization
  await page.getByRole('button', { name: 'Immunization' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('combobox', { name: 'Vaccine Name *' }).click();
  await page.getByRole('option', { name: 'Covaxin' }).click();
  await page.getByRole('combobox', { name: 'Administered By *' }).click();
  await page.getByRole('option', { name: 'Niki Scofield' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
  await page.waitForTimeout(1000);

  // Add CPT Codes
  await page.getByRole('button', { name: 'Add CPT Codes' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('combobox', { name: 'Search & Select CPT Codes' }).click();
  await page.getByRole('option', { name: 'G2063 - Qualifie' }).click();
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.waitForTimeout(1000);

  // Add Care Plan
  await page.getByRole('button', { name: 'Add Care Plan' }).click();
  await page.waitForTimeout(500);
  // Find the Select Template combobox that appears after clicking Add Care Plan
  const carePlanTemplate = page.getByRole('combobox', { name: 'Select Template' }).last();
  await carePlanTemplate.waitFor({ state: 'visible', timeout: 5000 });
  await carePlanTemplate.click();
  await page.getByRole('option', { name: 'Monthly Care Plan' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
  await page.waitForTimeout(1000);

  // Fill Follow Up & Instructions
  await page.getByRole('textbox', { name: 'Follow Up & Instructions...' }).click();
  await page.getByRole('textbox', { name: 'Follow Up & Instructions...' }).fill('follow routine');
  await page.waitForTimeout(500);

  // Save & Sign Notes
  await page.getByRole('button', { name: 'Save & Sign Notes' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Sign' }).click();
  await page.waitForTimeout(1000);

  // Draw signature on canvas
  const canvas = page.getByRole('dialog', { name: 'Sign And Lock Diagnosis And' }).locator('canvas');
  await canvas.click({ position: { x: 136, y: 180 } });
  await canvas.click({ position: { x: 133, y: 92 } });
  await canvas.click({ position: { x: 133, y: 92 } });
  await canvas.click({ position: { x: 133, y: 92 } });
  await canvas.click({ position: { x: 163, y: 105 } });
  await canvas.click({ position: { x: 146, y: 162 } });
  await page.waitForTimeout(500);

  // Sign & Lock
  await page.getByRole('button', { name: 'Sign & Lock' }).click();
  await page.waitForTimeout(2000);

  // Close
  await page.getByRole('button', { name: 'Close' }).click();
  await page.waitForTimeout(1000);

  // ---- Optional Assertion ----
  // Verify appointment details are displayed
  // await expect(page.getByText(patientFullName)).toBeVisible();
});
