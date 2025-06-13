"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Plus,
  Edit3,
  Trash2,
  Clock,
  Globe,
  Settings,
  CheckCircle,
  XCircle,
  Calendar,
  Loader,
} from "lucide-react";

const CronJobsAdmin = () => {
  const [cronJobs, setCronJobs] = useState([
    {
      id: "1",
      name: "Update Promoted Events",
      url: "/api/cronjobs/promotions",
      method: "GET",
      requestBody: "",
      schedule: "0 0 * * *", // Daily at midnight
      isActive: true,
      lastRun: new Date("2024-06-03T10:30:00"),
      lastStatus: "success",
      description: "Checks and updates expired promotional events",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [runningJobs, setRunningJobs] = useState(new Set());
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    method: "GET",
    requestBody: "",
    schedule: "",
    isActive: true,
    description: "",
  });

  const scheduleOptions = [
    { value: "*/5 * * * *", label: "Every 5 minutes" },
    { value: "0 * * * *", label: "Every hour" },
    { value: "0 0 * * *", label: "Daily at midnight" },
    { value: "0 0 * * 0", label: "Weekly (Sunday)" },
    { value: "0 0 1 * *", label: "Monthly" },
    { value: "custom", label: "Custom schedule" },
  ];

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      method: "GET",
      requestBody: "",
      schedule: "",
      isActive: true,
      description: "",
    });
    setEditingJob(null);
  };

  const handleSubmit = () => {
    if (editingJob) {
      setCronJobs((jobs) =>
        jobs.map((job) =>
          job.id === editingJob.id
            ? { ...job, ...formData, id: editingJob.id }
            : job
        )
      );
    } else {
      const newJob = {
        ...formData,
        id: Date.now().toString(),
        lastRun: null,
        lastStatus: "never",
      };
      setCronJobs((jobs) => [...jobs, newJob]);
    }

    setShowModal(false);
    resetForm();
  };

  const handleEdit = (job: any) => {
    setFormData({
      name: job.name,
      url: job.url,
      method: job.method,
      requestBody: job.requestBody || "",
      schedule: job.schedule,
      isActive: job.isActive,
      description: job.description || "",
    });
    setEditingJob(job);
    setShowModal(true);
  };

  const handleDelete = (jobId: any) => {
    if (confirm("Are you sure you want to delete this cron job?")) {
      setCronJobs((jobs) => jobs.filter((job) => job.id !== jobId));
    }
  };

  const toggleJobStatus = (jobId: any) => {
    setCronJobs((jobs) =>
      jobs.map((job) =>
        job.id === jobId ? { ...job, isActive: !job.isActive } : job
      )
    );
  };

  const runJobManually = async (job: any) => {
    setRunningJobs((prev) => new Set(prev).add(job.id));

    try {
      // Simulate API call
      const response = await fetch(`/api/admin/run-cronjob`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: job.url,
          method: job.method,
          requestBody: job.requestBody,
        }),
      });

      const result = await response.json();

      // Update job status
      setCronJobs((jobs) =>
        jobs.map((j) =>
          j.id === job.id
            ? {
                ...j,
                lastRun: new Date(),
                lastStatus: response.ok ? "success" : "error",
              }
            : j
        )
      );

      alert(`Job executed ${response.ok ? "successfully" : "with errors"}`);
    } catch (error) {
      setCronJobs((jobs) =>
        jobs.map((j) =>
          j.id === job.id
            ? { ...j, lastRun: new Date(), lastStatus: "error" }
            : j
        )
      );
      alert("Failed to run job: " + error.message);
    } finally {
      setRunningJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(job.id);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatSchedule = (schedule) => {
    const option = scheduleOptions.find((opt) => opt.value === schedule);
    return option ? option.label : schedule;
  };

  return (
    <div className="p-4  mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Cron Jobs Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage automated tasks and scheduled jobs
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Cron Job
        </button>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL & Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cronJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {job.name}
                      </div>
                      {job.description && (
                        <div className="text-sm text-gray-500">
                          {job.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          job.method === "GET"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                        {job.method}
                      </span>
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-mono text-gray-600">
                        {job.url}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatSchedule(job.schedule)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          job.isActive ? "bg-green-400" : "bg-gray-400"
                        }`}></div>
                      <span className="text-sm text-gray-600">
                        {job.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.lastStatus)}
                      <div className="text-sm text-gray-600">
                        {job.lastRun ? (
                          <>
                            <div>{job.lastRun.toLocaleDateString()}</div>
                            <div className="text-xs text-gray-400">
                              {job.lastRun.toLocaleTimeString()}
                            </div>
                          </>
                        ) : (
                          "Never run"
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => runJobManually(job)}
                        disabled={runningJobs.has(job.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                        title="Run manually">
                        {runningJobs.has(job.id) ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => toggleJobStatus(job.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        title={job.isActive ? "Disable" : "Enable"}>
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(job)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                        title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingJob ? "Edit Cron Job" : "Add New Cron Job"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Brief description of what this job does"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL
                    </label>
                    <input
                      type="text"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="/api/cronjobs/promotions"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Method
                    </label>
                    <select
                      value={formData.method}
                      onChange={(e) =>
                        setFormData({ ...formData, method: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2">
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                </div>

                {formData.method !== "GET" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Request Body (JSON)
                    </label>
                    <textarea
                      value={formData.requestBody}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requestBody: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 font-mono text-sm"
                      placeholder='{"key": "value"}'
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule
                  </label>
                  <select
                    value={
                      scheduleOptions.find(
                        (opt) => opt.value === formData.schedule
                      )?.value || "custom"
                    }
                    onChange={(e) => {
                      if (e.target.value !== "custom") {
                        setFormData({ ...formData, schedule: e.target.value });
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2">
                    {scheduleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {(formData.schedule === "" ||
                    !scheduleOptions.find(
                      (opt) => opt.value === formData.schedule
                    )) && (
                    <input
                      type="text"
                      value={formData.schedule}
                      onChange={(e) =>
                        setFormData({ ...formData, schedule: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                      placeholder="* * * * * (cron expression)"
                      required
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Cron format: minute hour day month weekday
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">Active</label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingJob ? "Update" : "Create"} Job
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CronJobsAdmin;
