import { test } from '@playwright/test';

import { LoginPage } from '../../pages/LoginPage.js';
import { DashboardPage } from '../../pages/DashboardPage.js';
import { PatientsPage } from '../../pages/patientsPage/patientcreation.js';
import { generatePatient } from '../../utils/patientData.js';

test('Provider creates patient with dynamic name and email', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const patientsPage = new PatientsPage(page);

  await loginPage.goto();
  await loginPage.login();

  await dashboardPage.openPatientsTab();

  const patient = generatePatient();

  await patientsPage.openNewPatientForm();
  await patientsPage.fillPatientDetails(patient);
});