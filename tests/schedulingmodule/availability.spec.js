import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { SchedulingPage } from '../../pages/schedulingPage';
import { AvailabilityPage } from '../../pages/schedulingmodule/AvailabilityPage';

test('Provider sets availability', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboard = new DashboardPage(page);
  const schedulingPage = new SchedulingPage(page);
  const availabilityPage = new AvailabilityPage(page);
  
  await loginPage.goto();  
  await loginPage.login();
  await dashboard.openSchedulingMenu();
  await schedulingPage.goToAvailability();
  await availabilityPage.clickEditAvailability();

  await availabilityPage.setStartDate(2);
  await availabilityPage.selectBookingWindow('1 Week');
  // TODO: Fix locator for "Apply to All Days" - enableApplyToAllDays();
  // Start Time (12:00) and End Time (4:30) are already set by default
  await availabilityPage.saveAvailability();

  await schedulingPage.goToAppointmentsFromSubPage();
  await schedulingPage.verifyAppointmentsLoaded();
});

