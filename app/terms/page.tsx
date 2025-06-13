"use client";

import { organizationService } from "@/lib/services/organizationServices";
import {
  Calendar,
  Clock,
  FileText,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEffect, useState } from "react";

interface TermsOfService {
  id: string;
  title: string;
  content: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  status: string;
  createdAt: any;
  updatedAt: any;
}

const TermsOfServicePage = () => {
  const [termsData, setTermsData] = useState<TermsOfService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    loadTermsData();
  }, []);

  const loadTermsData = async () => {
    setLoading(true);
    try {
      const terms = await organizationService.getPublishedTermsOfService();
      setTermsData(terms);
    } catch (error) {
      console.error("Error loading terms of service:", error);
      setError("Failed to load terms of service");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (termId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [termId]: !prev[termId],
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((paragraph, index) => (
      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading Terms of Service...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Unable to Load
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadTermsData}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (termsData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="md:px-12 mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="md:w-20 w-12 h-12 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="md:w-10 w-7 h-7 md:h-10 text-green-600" />
              </div>
              <h1 className="md:text-3xl text-xl font-bold text-gray-900 mb-4">
                Terms of Service
              </h1>
              <p className="text-gray-600 text-lg">
                No terms of service are currently available. Please check back
                later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentTerms = termsData[0]; // Get the most recent terms

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 text-white">
        <div className="md:px-12 mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Please read these terms carefully as they govern your use of our
              services
            </p>

            {/* Version Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">
                    Version {currentTerms.version}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    Effective {formatDate(currentTerms.effectiveDate)}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Updated {formatDate(currentTerms.lastUpdated)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:px-12 mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Current Terms */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {currentTerms.title}
              </h2>
              <div className="flex items-center gap-4 text-green-100">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  Current Version
                </span>
                <span className="text-sm">
                  Last updated on {formatDate(currentTerms.lastUpdated)}
                </span>
              </div>
            </div>

            <div className="p-8">
              <div className="prose prose-lg max-w-none">
                {formatContent(currentTerms.content)}
              </div>
            </div>
          </div>

          {/* Previous Versions (if any) */}
          {termsData.length > 1 && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gray-50 border-b p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Previous Versions
                </h3>
                <p className="text-gray-600">
                  View historical versions of our terms of service
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {termsData.slice(1).map((terms, index) => (
                  <div key={terms.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {terms.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            Version {terms.version}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Effective {formatDate(terms.effectiveDate)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSection(terms.id)}
                        className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        {expandedSections[terms.id] ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            View
                          </>
                        )}
                      </button>
                    </div>

                    {expandedSections[terms.id] && (
                      <div className="bg-gray-50 rounded-xl p-6 prose prose-lg max-w-none">
                        {formatContent(terms.content)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Section */}
          <div className="mt-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">
              Questions About Our Terms?
            </h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              If you have any questions about these Terms of Service, please
              don't hesitate to contact us. We're here to help clarify any
              concerns you may have.
            </p>
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
