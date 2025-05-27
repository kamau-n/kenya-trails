// components/Faqs.tsx
"use client";

import { useEffect, useState } from "react";

import { collection, getDocs } from "firebase/firestore";
import { ChevronDown } from "lucide-react";
import { db } from "@/lib/firebase";

type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: string;
  createdAt: any;
  updatedAt: any;
};

export default function Faqs() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      const querySnapshot = await getDocs(collection(db, "faq"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Faq[];
      setFaqs(data.filter((faq) => faq.status !== "draft")); // hide drafts
    };

    fetchFaqs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block p-3 bg-green-100 rounded-2xl mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">?</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions and get the help you need
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-green-100 hover:border-green-200 transition-all duration-300 overflow-hidden"
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: "fadeInUp 0.6s ease-out forwards",
              }}>
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full px-8 py-6 flex justify-between items-center text-left transition-all duration-200 group-hover:bg-green-50/50">
                <span className="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition-colors pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-all duration-200">
                    <ChevronDown
                      className={`w-5 h-5 text-green-600 transition-transform duration-300 ${
                        openId === faq.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
              </button>

              {/* Answer Section with Smooth Animation */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openId === faq.id
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}>
                <div className="px-8 pb-6">
                  <div className="border-t border-green-100 pt-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                      <p className="text-gray-700 leading-relaxed text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {faqs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ChevronDown className="w-12 h-12 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No FAQs Available
            </h3>
            <p className="text-gray-500">
              Check back later for frequently asked questions.
            </p>
          </div>
        )}
      </div>

      {/* Add keyframes for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
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
