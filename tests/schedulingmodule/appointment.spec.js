import { test } from '@playwright/test';

import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { SchedulingPage } from '../../pages/schedulingPage';
import { AvailabilityPage } from '../../pages/schedulingmodule/AvailabilityPage';
import { AppointmentPage } from '../../pages/schedulingmodule/AppointmentPage';

test('Provider creates availability and schedules appointment', async ({ page }) => {
  // ---- Page Objects ----
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const schedulingPage = new SchedulingPage(page);
  const availabilityPage = new AvailabilityPage(page);
  const appointmentPage = new AppointmentPage(page);

  // ---- Login ----
  await loginPage.goto();
  await loginPage.login();

  // ---- Navigate to Availability ----
  await dashboardPage.openSchedulingMenu();
  await schedulingPage.goToAvailability();

  // ---- Create Availability ----
  const slot = await availabilityPage.createAvailabilityAndGetSlot(2);
  // slot = { date, startTime, endTime }

  // ---- Navigate to Appointments ----
  await schedulingPage.goToAppointmentsFromSubPage();

  // ---- Schedule Appointment (picks a random available slot each run) ----
  await appointmentPage.bookAppointmentFromAvailability({
    date: slot.date,
    patientName: 'mike simon',
    complaint: 'Chest pain',
  });

  // ---- Optional Assertion (Recommended) ----
  // Verify appointment appears in list
  // await page.getByText('mike simon').first().waitFor();
});
