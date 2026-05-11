import { useState } from "react";
import SilentConfirmation from "./SilentConfirmation";

export default function AnonymousReportForm() {
  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const categories = [
    "Domestic Violence",
    "Harassment",
    "Sexual Assault",
    "Child Abuse",
  ];

  const triggerSilentConfirmation = () => {
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
    }, 2000);
  };

  const handleSubmit = async () => {
    if (!selectedCategory) return;

    const payload = {
      incident_type: selectedCategory,
      severity_level: "High",
      reporting_channel: "Mobile App",
      timestamp: new Date().toISOString(),
      area: "Anonymous Area",
    };

    try {
      setSubmitting(true);

      const start = performance.now();

      // Fake API request
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      const end = performance.now();

      console.log(
        `Submission took ${end - start} ms`
      );

      console.log(payload);

      triggerSilentConfirmation();
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          SafePulse
        </h1>

        <p className="text-gray-500 mb-6">
          Anonymous Incident Reporting
        </p>

        <div className="grid gap-3 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() =>
                setSelectedCategory(category)
              }
              className={`p-4 rounded-xl transition-all duration-300 text-left font-medium border ${
                selectedCategory === category
                  ? "bg-[#1a3d2a] text-white border-[#1a3d2a]"
                  : "bg-gray-50 hover:bg-gray-100 border-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mb-6 text-sm text-gray-600">
          Selected:
          {" "}
          <span className="font-semibold">
            {selectedCategory || "None"}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={
            submitting || !selectedCategory
          }
          className="w-full bg-[#1a3d2a] text-white py-4 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting
            ? "Submitting..."
            : "Submit Report"}
        </button>

        <SilentConfirmation
          submitted={submitted}
        />
      </div>
    </div>
  );
}