import { test, expect } from '@playwright/test';
import { PatientChartPage } from '../../pages/patientsPage/patientChart.js';

test('Complete patient chart workflow for Dixon Parker', async ({ page }) => {
  test.setTimeout(600000); // 10 minutes for full workflow + validations
  
  const patientChartPage = new PatientChartPage(page);
  
  // Run complete workflow
  await patientChartPage.completePatientChartWorkflow('Dixon Parker');
  
  // ========== VALIDATIONS ==========
  
  // Validate patient chart is loaded
  await patientChartPage.validatePatientChartLoaded();
  console.log('✓ Patient chart loaded successfully');
  
  // Validate profile tab is visible
  await patientChartPage.validateProfileTabVisible();
  console.log('✓ Profile tab is visible');
  
  // Validate insurance was added
  await patientChartPage.validateInsuranceAdded('Yuzu Health');
  console.log('✓ Insurance added successfully');
  
  // Validate prior authorization was archived
  await patientChartPage.validatePriorAuthorizationArchived('234560');
  console.log('✓ Prior authorization archived successfully');
  
  // Validate order was completed
  await patientChartPage.validateOrderCompleted('Lab test 1');
  console.log('✓ Order completed successfully');
  
  // Validate allergy was deleted
  await patientChartPage.validateAllergyDeleted('peniciliin');
  console.log('✓ Allergy deleted successfully');
  
  // Validate diagnosis was deleted
  await patientChartPage.validateDiagnosisDeleted('E830 - Disorders of copper');
  console.log('✓ Diagnosis deleted successfully');
  
  // Validate medication was deleted
  await patientChartPage.validateMedicationDeleted('Neo-polycin - Gramicidin');
  console.log('✓ Medication deleted successfully');
  
  // Validate vaccine was deleted
  await patientChartPage.validateVaccineDeleted('Covaxin');
  console.log('✓ Vaccine deleted successfully');
  
  // Validate vitals were added
  await patientChartPage.validateVitalsAdded();
  console.log('✓ Vitals added successfully');
  
  // Validate care plan was archived
  await patientChartPage.validateCarePlanArchived('mongtly care plan');
  console.log('✓ Care plan archived successfully');
  
  // Validate prescription was added
  await patientChartPage.validatePrescriptionAdded();
  console.log('✓ Prescription added successfully');
  
  // Validate history tab is visible
  await patientChartPage.validateHistoryTabVisible();
  console.log('✓ History tab is visible');
  
  console.log('\n✅ All validations passed!');
});
