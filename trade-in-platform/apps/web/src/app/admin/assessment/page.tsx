'use client';

import { useCallback, useState } from 'react';
import {
  createAssessment,
  getAssessment,
  type Assessment,
  type Customer,
  type ProductModel,
} from '../../../lib/api';
import { StepIndicator } from './step-indicator';
import { StepCustomer } from './step-customer';
import { StepProduct } from './step-product';
import { StepTestGuide, type TestStepResult } from './step-test-guide';
import { StepTestResults } from './step-test-results';
import { StepPhotos } from './step-photos';
import { StepDefects } from './step-defects';
import { StepPrice } from './step-price';
import { StepComplete } from './step-complete';

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [assessmentData, setAssessmentData] = useState<Assessment | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [productModel, setProductModel] = useState<ProductModel | null>(null);
  const [testResults, setTestResults] = useState<TestStepResult[]>([]);
  const [error, setError] = useState('');

  const refreshAssessment = useCallback(async (id: string) => {
    try {
      const data = await getAssessment(id);
      setAssessmentData(data);
      return data;
    } catch {
      // silent — assessment data is supplementary
      return null;
    }
  }, []);

  // Step 1: Customer selected
  const handleCustomerSelect = (c: Customer) => {
    setCustomer(c);
    setCurrentStep(2);
  };

  // Step 2: Product model selected → create assessment
  const handleProductSelect = async (model: ProductModel) => {
    if (!customer) return;
    setProductModel(model);
    setError('');
    try {
      const assessment = await createAssessment({
        customerId: customer.id,
        productModelId: model.id,
      });
      setAssessmentId(assessment.id);
      setAssessmentData(assessment);
      setCurrentStep(3);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create assessment',
      );
    }
  };

  // Step 3: Test guide completed
  const handleTestGuideComplete = (results: TestStepResult[]) => {
    setTestResults(results);
    setCurrentStep(4);
  };

  // Step 4: Test results submitted
  const handleTestResultsSubmitted = async () => {
    if (assessmentId) await refreshAssessment(assessmentId);
    setCurrentStep(5);
  };

  // Step 5: Photos done
  const handlePhotosContinue = async () => {
    if (assessmentId) await refreshAssessment(assessmentId);
    setCurrentStep(6);
  };

  // Step 6: Defects submitted
  const handleDefectsSubmitted = async () => {
    if (assessmentId) {
      await refreshAssessment(assessmentId);
    }
    setCurrentStep(7);
  };

  // Step 7: Added to stock
  const handleStocked = () => {
    setCurrentStep(8);
  };

  // Step 8: Start new
  const handleStartNew = () => {
    setCurrentStep(1);
    setAssessmentId(null);
    setAssessmentData(null);
    setCustomer(null);
    setProductModel(null);
    setTestResults([]);
    setError('');
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Product Assessment
      </h1>

      <StepIndicator currentStep={currentStep} />

      <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {currentStep === 1 && (
          <StepCustomer onSelect={handleCustomerSelect} />
        )}

        {currentStep === 2 && (
          <StepProduct onSelect={handleProductSelect} />
        )}

        {currentStep === 3 && productModel && (
          <StepTestGuide
            category={productModel.category}
            onComplete={handleTestGuideComplete}
          />
        )}

        {currentStep === 4 && assessmentId && (
          <StepTestResults
            assessmentId={assessmentId}
            results={testResults}
            onSubmitted={handleTestResultsSubmitted}
          />
        )}

        {currentStep === 5 && assessmentId && (
          <StepPhotos
            assessmentId={assessmentId}
            onContinue={handlePhotosContinue}
          />
        )}

        {currentStep === 6 && assessmentId && productModel && (
          <StepDefects
            assessmentId={assessmentId}
            category={productModel.category}
            onSubmitted={handleDefectsSubmitted}
          />
        )}

        {currentStep === 7 && assessmentData && (
          <StepPrice
            assessment={assessmentData}
            onStocked={handleStocked}
          />
        )}

        {currentStep === 8 && (
          <StepComplete onStartNew={handleStartNew} />
        )}
      </div>
    </div>
  );
}
