"use client";

import { organizationService } from "@/lib/services/organizationServices";
import {
  ExternalLink,
  Search,
  Filter,
  BookOpen,
  FileText,
  Video,
  Download,
  Globe,
  Users,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredResources, setFilteredResources] = useState([]);

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedCategory]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const fetchedResources = await organizationService.getResources();
      // Only show published resources to public users
      const publishedResources = fetchedResources.filter(
        (resource) => resource.status === "published"
      );
      setResources(publishedResources);
    } catch (error) {
      console.error("Error loading resources:", error);
      setError("Failed to load resources. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          resource.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (resource) =>
          resource.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredResources(filtered);
  };

  const getUniqueCategories = () => {
    const categories = resources.map((resource) => resource.category);
    return [...new Set(categories)].sort();
  };

  const getResourceIcon = (category) => {
    const iconMap = {
      documentation: FileText,
      tutorial: BookOpen,
      video: Video,
      download: Download,
      website: Globe,
      community: Users,
      guide: Lightbulb,
      default: ExternalLink,
    };

    const IconComponent = iconMap[category.toLowerCase()] || iconMap.default;
    return <IconComponent size={20} />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      documentation: "bg-blue-100 text-blue-800",
      tutorial: "bg-purple-100 text-purple-800",
      video: "bg-red-100 text-red-800",
      download: "bg-yellow-100 text-yellow-800",
      website: "bg-indigo-100 text-indigo-800",
      community: "bg-pink-100 text-pink-800",
      guide: "bg-orange-100 text-orange-800",
    };

    return colors[category.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-green-700">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-lg">Loading resources...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-lg">
            <p className="font-medium">Error Loading Resources</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={loadResources}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Hero Section */}
      {/* <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Resource Center
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
              Explore our comprehensive collection of resources, guides, and
              tools to help you succeed
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 max-w-md mx-auto">
              <div className="flex items-center">
                <Search className="text-green-200 ml-4" size={20} />
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="w-full bg-transparent text-white placeholder-green-200 px-4 py-3 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-green-700">
              <Filter size={20} />
              <span className="font-medium">Filter by category:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-green-600 text-white"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}>
                All Resources ({resources.length})
              </button>
              {getUniqueCategories().map((category) => {
                const count = resources.filter(
                  (r) => r.category.toLowerCase() === category.toLowerCase()
                ).length;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-green-600 text-white"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}>
                    {category} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-sm border border-green-100 p-12">
              <BookOpen className="mx-auto text-green-300 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Resources Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No resources are currently available"}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-green-700 font-medium">
                Showing {filteredResources.length} of {resources.length}{" "}
                resources
                {searchTerm && ` for "${searchTerm}"`}
                {selectedCategory !== "all" && ` in ${selectedCategory}`}
              </p>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-white rounded-xl shadow-sm border border-green-100 hover:shadow-lg hover:border-green-200 transition-all duration-300 group">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                          {getResourceIcon(resource.category)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                            {resource.title}
                          </h3>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getCategoryColor(
                              resource.category
                            )}`}>
                            {resource.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {resource.description}
                    </p>

                    {/* Action Button */}
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 w-full justify-center bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium group-hover:shadow-md">
                      <span>Access Resource</span>
                      <ExternalLink
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help
            you find the right resources for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors">
              Contact Support
            </a>
            <a
              href="/faqs"
              className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition-colors">
              Browse FAQ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
