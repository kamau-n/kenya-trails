// components/PrivacyPolicy.tsx
"use client";

import { useEffect, useState } from "react";

import { collection, getDocs } from "firebase/firestore";
import { Shield, Calendar, FileText } from "lucide-react";
import { db } from "@/lib/firebase";
import { date } from "zod";

type Policy = {
  id: string;
  title: string;
  content: string;
  status: string;
  createdAt: any;
  updatedAt: any;
  lastUpdated: string;
};

export default function PrivacyPolicy() {
  const [policies, setPolicies] = useState<Policy[]>([]);

  useEffect(() => {
    const fetchPolicies = async () => {
      const querySnapshot = await getDocs(collection(db, "privacy_policies")); // change this to your collection name
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Policy[];
      setPolicies(data.filter((policy) => policy.status !== "draft"));
    };
    console.log("this are the fetched Policies", policies);

    fetchPolicies();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block p-4 bg-green-100 rounded-3xl mb-6">
            <div className="md:w-16 w-12 h-12 md:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
              <Shield className="md:w-8 w-6 h-6 md:h-8 text-white" />
            </div>
          </div>
          <h1 className="md:text-4xl text-xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
            Privacy Policy
          </h1>
          <p className="md:text-lg text-sm text-gray-600 max-w-3xl mx-auto mb-8">
            We are committed to protecting your privacy and ensuring the
            security of your personal information
          </p>

          {/* Last Updated Badge */}
          {policies[0]?.lastUpdated && (
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-md border border-green-100">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-left">
                <p className="md:text-sm text-xs font-medium text-gray-800">
                  Last Updated
                </p>
                <p className="md:text-sm text-xs text-green-600 font-semibold">
                  {policies[0]?.lastUpdated}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Policy Content */}
        <div className="space-y-8">
          {policies.map((policy, index) => (
            <div
              key={policy.id}
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-xl border border-green-100 hover:border-green-200 transition-all duration-300 overflow-hidden"
              style={{
                animationDelay: `${index * 0.15}s`,
                animation: "fadeInUp 0.8s ease-out forwards",
              }}>
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400" />

              {/* Content */}
              <div className="p-8 lg:p-10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 md:w-12 w-8 h-8 md:h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <FileText className="md:w-6 w-4 h-4 md:h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="md:text-2xl text-xl font-bold text-gray-800 mb-2 group-hover:text-green-700 transition-colors">
                      {policy.title}
                    </h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-2xl p-6 border border-green-100">
                    <p className="text-gray-700  text-sm leading-relaxed whitespace-pre-wrap md:text-base">
                      {policy.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {policies.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-8">
              <Shield className="w-16 h-16 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              No Privacy Policy Available
            </h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              Our privacy policy is currently being updated. Please check back
              soon.
            </p>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-md border border-green-100">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Questions About Privacy?
              </h3>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or our data
              practices, please don't hesitate to contact our support team.
              support@kenyatrails.co.ke
            </p>
          </div>
        </div>
      </div>

      {/* Add keyframes for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
