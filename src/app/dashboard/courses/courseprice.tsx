"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Course } from "@/types/course";
import { getCoursePricing } from '@/lib/courseprice-api';
import { CoursePricing } from '@/types/course-pricing';
import { Button } from "@/components/ui/button";

interface CoursePriceProps {
  courseData?: Course | null;
}

export default function CoursePrice({ courseData }: CoursePriceProps) {
  const [pricingINR, setPricingINR] = useState<CoursePricing | null>(null);
  const [pricingUSD, setPricingUSD] = useState<CoursePricing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isoToDateInput = (iso?: string | null): string => {
    if (!iso) return "";
    if (iso.includes("T")) return iso.split("T")[0];
    // Fallback: try parsing and normalizing
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
          setError(null);
        })
        .catch(() => {
          setError("Failed to fetch course pricing");
          setPricingINR(null);
          setPricingUSD(null);
        })
        .finally(() => setLoading(false));
    }
  }, [courseData?.uuid]);

  return <>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="border p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold">Indian Rupees Pricing</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-md font-semibold text-gray-600">Current Price</label>
            <Input
              className="p-5"
              placeholder="Enter price in INR"
              value={pricingINR?.price !== undefined && pricingINR?.price !== null ? String(pricingINR.price) : ""}
              onChange={() => { }}
            />
          </div>
          <div>
            <label className="text-md font-semibold text-gray-600">Future Price</label>
            <Input placeholder="Enter future price in INR" value={pricingINR?.future_price !== undefined && pricingINR?.future_price !== null ? String(pricingINR.future_price) : ""} onChange={() => { }} />
          </div>
          <div>
            <label className="text-md font-semibold text-gray-600">Future Price Effective Period</label>
            <div>
              <Input type="date" value={isoToDateInput(pricingINR?.future_price_effect_from)} onChange={() => { }} />
            </div>
          </div>
          <div>
            <label className="text-md font-semibold text-gray-600">Extended Validity Price</label>
            <Input placeholder="Enter extended validity price in INR" value={pricingINR?.extended_validity_price !== undefined && pricingINR?.extended_validity_price !== null ? String(pricingINR.extended_validity_price) : ""} onChange={() => { }} />
          </div>
          <div>
            <label className="text-md font-semibold text-gray-600">Major Upgrade Price</label>
            <Input placeholder="Enter major upgrade price in INR" value={pricingINR?.major_update_price !== undefined && pricingINR?.major_update_price !== null ? String(pricingINR.major_update_price) : ""} readOnly />
          </div>
        </div>
      </div>
      <div className="border p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold">International Pricing</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-md font-semibold text-gray-600">Current Price</label>
            <Input placeholder="Enter price in USD" value={pricingUSD?.price !== undefined && pricingUSD?.price !== null ? String(pricingUSD.price) : ""} onChange={() => { }} />
          </div>
          <div>
            <label className="text-md font-semibold text-gray-600">Future Price</label>
            <Input placeholder="Enter future price in USD" value={pricingUSD?.future_price !== undefined && pricingUSD?.future_price !== null ? String(pricingUSD.future_price) : ""} onChange={() => { }} />
          </div>
          <div>
            <label className="text-md font-semibold text-gray-600">Future Price Effective Period</label>
            <div>
              <Input type="date" value={isoToDateInput(pricingUSD?.future_price_effect_from)} onChange={() => { }} />
            </div>
          </div>
          <div>
            <label className="text-md font-semibold text-gray-600">Extended Validity Price</label>
            <Input placeholder="Enter extended validity price in USD" value={pricingUSD?.extended_validity_price !== undefined && pricingUSD?.extended_validity_price !== null ? String(pricingUSD.extended_validity_price) : ""} readOnly />
          </div>
          <div>
            <label className="text-md font-semibold text-gray-600">Major Upgrade Price</label>
            <Input placeholder="Enter major upgrade price in USD" value={pricingUSD?.major_update_price !== undefined && pricingUSD?.major_update_price !== null ? String(pricingUSD.major_update_price) : ""} readOnly />
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4 col-span-2">
        <Button className="me-2">Cancel</Button>
        <Button variant='courseCreate'>Update</Button>
      </div>
    </div>
    {loading && <div>Loading course pricing...</div>}
    {error && <div className="text-red-500">{error}</div>}
  </>;
}