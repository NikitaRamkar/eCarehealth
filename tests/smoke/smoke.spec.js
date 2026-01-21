import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import { DashboardPage } from '../../pages/DashboardPage.js';
import { SchedulingPage } from '../../pages/schedulingPage.js';
import { PatientPage } from '../../pages/PatientPage.js';


/**
 * 🔹 LOGIN SETUP (runs before every smoke test)
 */
test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(
    'nikita.ramkar+nikita@medarch.com',
    'Admin@123'
  );
  await loginPage.verifyLoginSuccess();
});

/**
 * 🔹 SMOKE #1: Provider dashboard loads
 */
test('Smoke – Provider dashboard loads', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.verifyDashboardLoaded();
});

/**
 * 🔹 SMOKE #2: Provider can open Appointments
 */
test('Smoke – Provider can open Appointments', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  const scheduling = new SchedulingPage(page);

  await dashboard.openSchedulingMenu();
  await scheduling.goToAppointments();
  await scheduling.verifyAppointmentsLoaded();
});

/**
 * 🔹 SMOKE #3: Provider can open Availability
 */
test('Smoke – Provider can open Availability', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  const scheduling = new SchedulingPage(page);

  await dashboard.openSchedulingMenu();
  await scheduling.goToAvailability();
  await scheduling.verifyAvailabilityLoaded();
});


test('Smoke – Provider can open Patients', async ({ page }) => {
      const patientPage = new PatientPage(page);
    
      await patientPage.openPatients();
      await patientPage.verifyPatientsPageLoaded();
 });
    
  

