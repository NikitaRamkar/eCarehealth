import { expect } from '@playwright/test';

export class PatientsPage {
    constructor(page) {
      this.page = page;
  
      // ---- Create menu ----
      this.createButton = page.getByText('Create');
      this.newPatientOption = page.getByRole('menuitem', { name: 'New Patient' });
  
      // ---- Navigation ----
      this.nextButton = page.getByRole('button', { name: 'Next' });
  
      // ---- Dropdowns ----
      this.providerLocation = page.getByRole('combobox', {
        name: 'Provider Group Location',
      });
      this.primaryProvider = page.getByRole('combobox', {
        name: 'Primary Provider',
      });
  
      // ---- Patient fields ----
      this.firstNameInput = page.getByRole('textbox', {
        name: 'First Name *',
      });
      this.lastNameInput = page.getByRole('textbox', {
        name: 'Last Name *',
      });
      this.genderDropdown = page.getByRole('combobox', {
        name: 'Gender *',
      });
      this.timezoneDropdown = page.getByRole('combobox', {
        name: 'Time Zone *',
      });
      this.noMobileCheckbox = page.getByRole('checkbox', {
        name: "Patient doesn't have a mobile",
      });
      this.emailInput = page.getByRole('textbox', {
        name: 'Email *',
      });
  
      this.saveButton = page.getByRole('button', { name: 'Save' });
    }
  
    async openNewPatientForm() {
      await this.createButton.click();
      await this.newPatientOption.click();
    }
  
    async fillPatientDetails({ firstName, lastName, email }) {
      await this.page.getByRole('img').nth(1).click(); // avatar
      await this.nextButton.click();
  
      await this.providerLocation.click();
      await this.page.getByRole('option', { name: 'Denver' }).click();
  
      await this.primaryProvider.click();
      await this.page.getByRole('option', { name: 'Heather Clark' }).click();
  
      await this.firstNameInput.fill(firstName);
      await this.lastNameInput.fill(lastName);
  
      await this.page
        .locator('[id="Patient Details"]')
        .getByRole('button', { name: 'Choose date' })
        .click();
      await this.page.getByRole('gridcell', { name: '3', exact: true }).click();
  
      await this.genderDropdown.click();
      await this.page.getByRole('option', { name: 'Male', exact: true }).click();
  
      await this.timezoneDropdown.click();
      await this.page
        .getByRole('option', {
          name: 'Alaska Daylight Time (UTC -8)',
        })
        .click();
  
      await this.noMobileCheckbox.check();
  
      await this.emailInput.fill(email);
  
      await this.saveButton.click();
    }

    /**
     * Waits for patient to be saved successfully
     * You can customize this based on your app's success indicators
     */
    async waitForPatientSaved() {
      // Wait for the save to complete - adjust based on your app's behavior
      // Option 1: Wait for success message
      try {
        await this.page.getByText(/patient.*saved|success/i).waitFor({ timeout: 5000 });
      } catch (e) {
        // Success message might not appear, continue
      }
      
      // Option 2: Wait for the drawer/modal to close
      try {
        const drawer = this.page.locator('[role="presentation"][title="Add Patient"]')
          .or(this.page.locator('.MuiDrawer-root'))
          .or(this.page.locator('[class*="MuiModal-root"]'))
          .or(this.page.getByRole('dialog', { name: 'Add Patient' }));
        await drawer.waitFor({ state: 'hidden', timeout: 15000 });
      } catch (e) {
        // If drawer doesn't close automatically, wait a bit
        await this.page.waitForTimeout(2000);
      }
      
      // Small additional wait to ensure UI is ready
      await this.page.waitForTimeout(1000);
    }
  }
