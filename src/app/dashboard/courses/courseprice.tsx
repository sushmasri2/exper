"use client";

import { useEffect, useState } from "react";
// import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { Course } from "@/types/course";
import { getCoursePricing, createCoursePricing, updateCoursePricing } from '@/lib/courseprice-api';
import { CoursePricing } from '@/types/course-pricing';
import { Button } from "@/components/ui/button";
import { useCoursePricingValidation } from './hooks/useCoursePricingValidation';
import { ValidatedInput } from "./components/ValidatedFormComponents";
import { showToast } from "@/lib/toast";

interface CoursePriceProps {
  courseData?: Course | null;
}

export default function CoursePrice({ courseData }: CoursePriceProps) {
  const [pricingINR, setPricingINR] = useState<CoursePricing | null>(null);
  const [pricingUSD, setPricingUSD] = useState<CoursePricing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data state for tracking changes
  const [formDataINR, setFormDataINR] = useState<Partial<CoursePricing>>({});
  const [formDataUSD, setFormDataUSD] = useState<Partial<CoursePricing>>({});

  // Validation hook
  const [, validationActions] = useCoursePricingValidation();

  // Handler functions for form ValidatedInputs
  const handleINRChange = (field: keyof CoursePricing, value: string) => {
    setFormDataINR(prev => ({ ...prev, [field]: value }));
    validationActions.validatePricingField('INR', field, value);
  };

  const handleUSDChange = (field: keyof CoursePricing, value: string) => {
    setFormDataUSD(prev => ({ ...prev, [field]: value }));
    validationActions.validatePricingField('USD', field, value);
  };


const handleFormSubmit = async () => {
  if (!courseData?.uuid) {
    setError('Course data is required');
    return;
  }

  const isValid = validationActions.validateAllPricing({
    INR: formDataINR,
    USD: formDataUSD
  });

  if (isValid) {
    setLoading(true);
    setError(null);

    try {
      // Helper function to ensure numeric values
      const ensureNumber = (value: string | number | undefined | null): number | undefined => {
        if (value === undefined || value === null || value === '') return undefined;
        const num = Number(value);
        return isNaN(num) ? undefined : num;
      };

      // Process INR pricing
      if (Object.keys(formDataINR).length > 0) {
        const inrData: Partial<CoursePricing> = {
          currency: "INR",
          price: ensureNumber(formDataINR.price) ?? 0,
          status: 1
        };

        const inrFuturePrice = ensureNumber(formDataINR.future_price);
        if (inrFuturePrice !== undefined) {
          inrData.future_price = inrFuturePrice;
        }
        
        if (formDataINR.future_price_effect_from) {
          inrData.future_price_effect_from = formDataINR.future_price_effect_from;
        }
        
        const inrExtendedPrice = ensureNumber(formDataINR.extended_validity_price);
        if (inrExtendedPrice !== undefined) {
          inrData.extended_validity_price = inrExtendedPrice;
        }
        
        const inrMajorUpdatePrice = ensureNumber(formDataINR.major_update_price);
        if (inrMajorUpdatePrice !== undefined) {
          inrData.major_update_price = inrMajorUpdatePrice;
        }

        if (pricingINR?.uuid && pricingINR?.id) {
          await updateCoursePricing(courseData.uuid, pricingINR.id, inrData);
        } else {
          await createCoursePricing(courseData.uuid, [inrData]);
        }
      }

      // Process USD pricing
      if (Object.keys(formDataUSD).length > 0) {
        const usdData: Partial<CoursePricing> = {
          currency: "USD",
          price: ensureNumber(formDataUSD.price) ?? 0,
          status: 1
        };

        const usdFuturePrice = ensureNumber(formDataUSD.future_price);
        if (usdFuturePrice !== undefined) {
          usdData.future_price = usdFuturePrice;
        }
        
        if (formDataUSD.future_price_effect_from) {
          usdData.future_price_effect_from = formDataUSD.future_price_effect_from;
        }
        
        const usdExtendedPrice = ensureNumber(formDataUSD.extended_validity_price);
        if (usdExtendedPrice !== undefined) {
          usdData.extended_validity_price = usdExtendedPrice;
        }
        
        const usdMajorUpdatePrice = ensureNumber(formDataUSD.major_update_price);
        if (usdMajorUpdatePrice !== undefined) {
          usdData.major_update_price = usdMajorUpdatePrice;
        }


        if (pricingUSD?.uuid && pricingUSD?.id) {
          await updateCoursePricing(courseData.uuid, pricingUSD.id, usdData);
        } else {
          await createCoursePricing(courseData.uuid, [usdData]);
        }
      }

      // Refresh pricing data after successful submission
      const updatedData = await getCoursePricing(courseData.uuid);
      const inr = updatedData.find((p: CoursePricing) => p.currency === "INR") || null;
      const usd = updatedData.find((p: CoursePricing) => p.currency === "USD") || null;
      setPricingINR(inr);
      setPricingUSD(usd);
      setFormDataINR(inr || {});
      setFormDataUSD(usd || {});

      showToast('Prices updated successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error submitting pricing:', err);
      showToast(`Failed to save pricing data: ${errorMessage}`, 'error');
      setError(`Failed to save pricing data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  } else {
    console.log('Form validation failed');
    showToast('Please fix validation errors before submitting', 'error');
  }
};

  // Helper functions
  const isoToDateValidatedInput = (iso?: string | null): string => {
    if (!iso) return "";
    if (iso.includes("T")) return iso.split("T")[0];
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (courseData?.uuid) {
      setLoading(true);
      getCoursePricing(courseData.uuid)
        .then((data) => {
          const inr = data.find((p: CoursePricing) => p.currency === "INR") || null;
          const usd = data.find((p: CoursePricing) => p.currency === "USD") || null;
          setPricingINR(inr);
          setPricingUSD(usd);

          // Initialize form data with fetched pricing
          setFormDataINR(inr || {});
          setFormDataUSD(usd || {});

          setError(null);
        })
        .catch(() => {
          setError("Failed to fetch course pricing");
          setPricingINR(null);
          setPricingUSD(null);
          setFormDataINR({});
          setFormDataUSD({});
        })
        .finally(() => setLoading(false));
    }


  }, [courseData?.uuid]);



  // Only show pricing when courseData.no_price is 0 (paid course)
  if (courseData?.no_price === 1) {
    return (
      <div className="p-4 text-center text-gray-600">
        <p>This is a free course. No pricing information needed.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold">Indian Rupees Pricing</h2>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-md font-semibold text-gray-600">Current Price</label>
              <ValidatedInput
                className={`p-5 ${validationActions.hasFieldError('INR', 'price') ? 'border-red-500' : ''}`}
                placeholder="Enter price in INR"
                value={formDataINR?.price !== undefined && formDataINR?.price !== null ? String(formDataINR.price) : ""}
                onChange={(e) => handleINRChange('price', e.target.value)}
                error={validationActions.getFieldError('INR', 'price')}
              />
            </div>
            <div>
              <label className="text-md font-semibold text-gray-600">Future Price</label>
              <ValidatedInput
                className={validationActions.hasFieldError('INR', 'future_price') ? 'border-red-500' : ''}
                placeholder="Enter future price in INR"
                value={formDataINR?.future_price !== undefined && formDataINR?.future_price !== null ? String(formDataINR.future_price) : ""}
                onChange={(e) => handleINRChange('future_price', e.target.value)}
                error={validationActions.getFieldError('INR', 'future_price')}
              />
            </div>
            <div>
              <label className="text-md font-semibold text-gray-600">Future Price Effective Period</label>
              <ValidatedInput
                type="date"
                className={validationActions.hasFieldError('INR', 'future_price_effect_from') ? 'border-red-500' : ''}
                value={isoToDateValidatedInput(formDataINR?.future_price_effect_from)}
                onChange={(e) => handleINRChange('future_price_effect_from', e.target.value)}
                error={validationActions.getFieldError('INR', 'future_price_effect_from')}
              />
            </div>
            <div>
              <label className="text-md font-semibold text-gray-600">Extended Validity Price</label>
              <ValidatedInput
                className={validationActions.hasFieldError('INR', 'extended_validity_price') ? 'border-red-500' : ''}
                placeholder="Enter extended validity price in INR"
                value={formDataINR?.extended_validity_price !== undefined && formDataINR?.extended_validity_price !== null ? String(formDataINR.extended_validity_price) : ""}
                onChange={(e) => handleINRChange('extended_validity_price', e.target.value)}
                error={validationActions.getFieldError('INR', 'extended_validity_price')}
              />
            </div>
            <div>
              <label className="text-md font-semibold text-gray-600">Major Upgrade Price</label>
              <ValidatedInput
                className={validationActions.hasFieldError('INR', 'major_update_price') ? 'border-red-500' : ''}
                placeholder="Enter major upgrade price in INR"
                value={formDataINR?.major_update_price !== undefined && formDataINR?.major_update_price !== null ? String(formDataINR.major_update_price) : ""}
                onChange={(e) => handleINRChange('major_update_price', e.target.value)}
                error={validationActions.getFieldError('INR', 'major_update_price')}
              />
            </div>
          </div>
        </div>
        <div className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold">International Pricing</h2>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-md font-semibold text-gray-600">Current Price</label>
              <ValidatedInput
                className={validationActions.hasFieldError('USD', 'price') ? 'border-red-500' : ''}
                placeholder="Enter price in USD"
                value={formDataUSD?.price !== undefined && formDataUSD?.price !== null ? String(formDataUSD.price) : ""}
                onChange={(e) => handleUSDChange('price', e.target.value)}
                error={validationActions.getFieldError('USD', 'price')}
              />
            </div>
            <div>
              <label className="text-md font-semibold text-gray-600">Future Price</label>
              <ValidatedInput
                className={validationActions.hasFieldError('USD', 'future_price') ? 'border-red-500' : ''}
                placeholder="Enter future price in USD"
                value={formDataUSD?.future_price !== undefined && formDataUSD?.future_price !== null ? String(formDataUSD.future_price) : ""}
                onChange={(e) => handleUSDChange('future_price', e.target.value)}
                error={validationActions.getFieldError('USD', 'future_price')}
              />
            </div>
            <div>
              <label className="text-md font-semibold text-gray-600">Future Price Effective Period</label>
              <ValidatedInput
                type="date"
                className={validationActions.hasFieldError('USD', 'future_price_effect_from') ? 'border-red-500' : ''}
                value={isoToDateValidatedInput(formDataUSD?.future_price_effect_from)}
                onChange={(e) => handleUSDChange('future_price_effect_from', e.target.value)}
                error={validationActions.getFieldError('USD', 'future_price_effect_from')}
              />
            </div>
            <div>
              <label className="text-md font-semibold text-gray-600">Extended Validity Price</label>
              <ValidatedInput
                className={validationActions.hasFieldError('USD', 'extended_validity_price') ? 'border-red-500' : ''}
                placeholder="Enter extended validity price in USD"
                value={formDataUSD?.extended_validity_price !== undefined && formDataUSD?.extended_validity_price !== null ? String(formDataUSD.extended_validity_price) : ""}
                onChange={(e) => handleUSDChange('extended_validity_price', e.target.value)}
                error={validationActions.getFieldError('USD', 'extended_validity_price')}
              />
            </div>
            <div>
              <label className="text-md font-semibold text-gray-600">Major Upgrade Price</label>
              <ValidatedInput
                className={validationActions.hasFieldError('USD', 'major_update_price') ? 'border-red-500' : ''}
                placeholder="Enter major upgrade price in USD"
                value={formDataUSD?.major_update_price !== undefined && formDataUSD?.major_update_price !== null ? String(formDataUSD.major_update_price) : ""}
                onChange={(e) => handleUSDChange('major_update_price', e.target.value)}
                error={validationActions.getFieldError('USD', 'major_update_price')}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4 col-span-2">
          <Button className="me-2" onClick={() => {
            // Reset form to original data
            const originalINR = pricingINR || {};
            const originalUSD = pricingUSD || {};
            setFormDataINR(originalINR);
            setFormDataUSD(originalUSD);
            validationActions.clearPricingErrors();
          }}>Cancel</Button>
          <Button
            variant='primaryBtn'
            onClick={handleFormSubmit}
          >
            {!courseData ? 'Create' : 'Update'}
          </Button>
        </div>
      </div>
      {error && (
        <div className="text-red-500 font-semibold mt-2">{error}</div>
      )}
      {loading && (<div className="text-blue-500 font-semibold mt-2">Loading...</div>)}
    </>
  );
}