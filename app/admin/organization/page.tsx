"use client";

import { Edit, Eye, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";

const AdminOrganizationsPage = () => {
	const [activeTab, setActiveTab] = useState("privacy");
	const [isEditing, setIsEditing] = useState(false);
	const [editingItem, setEditingItem] = useState(null);

	// Sample data - in real app would come from database
	const [organizationData, setOrganizationData] = useState({
		privacy: [
			{
				id: 1,
				title: "Data Collection Policy",
				content: "We collect data to provide better services...",
				lastUpdated: "2024-01-15",
				status: "published",
			},
			{
				id: 2,
				title: "Cookie Policy",
				content: "We use cookies to enhance user experience...",
				lastUpdated: "2024-01-10",
				status: "draft",
			},
		],
		faq: [
			{
				id: 1,
				question: "How do I reset my password?",
				answer: "Click on forgot password link and follow instructions...",
				category: "Account",
				status: "published",
			},
			{
				id: 2,
				question: "What payment methods do you accept?",
				answer: "We accept credit cards, PayPal, and bank transfers...",
				category: "Billing",
				status: "published",
			},
		],
		resources: [
			{
				id: 1,
				title: "User Guide",
				description: "Complete guide for new users",
				url: "/docs/user-guide.pdf",
				category: "Documentation",
				status: "published",
			},
			{
				id: 2,
				title: "API Documentation",
				description: "Developer resources and API reference",
				url: "/docs/api",
				category: "Technical",
				status: "published",
			},
		],
	});

	const [newItem, setNewItem] = useState({
		privacy: { title: "", content: "" },
		faq: { question: "", answer: "", category: "" },
		resources: { title: "", description: "", url: "", category: "" },
	});

	const handleAdd = (type) => {
		const item = {
			...newItem[type],
			id: Date.now(),
			status: "draft",
			lastUpdated: new Date().toISOString().split("T")[0],
		};

		setOrganizationData((prev) => ({
			...prev,
			[type]: [...prev[type], item],
		}));

		setNewItem((prev) => ({
			...prev,
			[type]:
				type === "privacy"
					? { title: "", content: "" }
					: type === "faq"
					? { question: "", answer: "", category: "" }
					: { title: "", description: "", url: "", category: "" },
		}));

		setIsEditing(false);
	};

	const handleEdit = (type, item) => {
		setEditingItem({ type, ...item });
		setIsEditing(true);
	};

	const handleSave = () => {
		const { type, id, ...itemData } = editingItem;
		setOrganizationData((prev) => ({
			...prev,
			[type]: prev[type].map((item) =>
				item.id === id
					? {
							...item,
							...itemData,
							lastUpdated: new Date().toISOString().split("T")[0],
					  }
					: item
			),
		}));
		setIsEditing(false);
		setEditingItem(null);
	};

	const handleDelete = (type, id) => {
		if (window.confirm("Are you sure you want to delete this item?")) {
			setOrganizationData((prev) => ({
				...prev,
				[type]: prev[type].filter((item) => item.id !== id),
			}));
		}
	};

	const toggleStatus = (type, id) => {
		setOrganizationData((prev) => ({
			...prev,
			[type]: prev[type].map((item) =>
				item.id === id
					? {
							...item,
							status:
								item.status === "published"
									? "draft"
									: "published",
					  }
					: item
			),
		}));
	};

	const renderPrivacyTab = () => (
		<div className="space-y-6">
			{/* Add New Privacy Policy */}
			<div className="bg-white rounded-lg shadow-sm border p-6">
				<h3 className="text-lg font-semibold mb-4">
					Add New Privacy Policy
				</h3>
				<div className="space-y-4">
					<input
						type="text"
						placeholder="Policy Title"
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						value={newItem.privacy.title}
						onChange={(e) =>
							setNewItem((prev) => ({
								...prev,
								privacy: {
									...prev.privacy,
									title: e.target.value,
								},
							}))
						}
					/>
					<textarea
						placeholder="Policy Content"
						rows={6}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						value={newItem.privacy.content}
						onChange={(e) =>
							setNewItem((prev) => ({
								...prev,
								privacy: {
									...prev.privacy,
									content: e.target.value,
								},
							}))
						}
					/>
					<button
						onClick={() => handleAdd("privacy")}
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
					>
						<Plus size={20} />
						Add Policy
					</button>
				</div>
			</div>

			{/* Privacy Policies List */}
			<div className="space-y-4">
				{organizationData.privacy.map((policy) => (
					<div
						key={policy.id}
						className="bg-white rounded-lg shadow-sm border p-6"
					>
						<div className="flex justify-between items-start mb-4">
							<div>
								<h4 className="text-lg font-semibold">
									{policy.title}
								</h4>
								<p className="text-sm text-gray-500">
									Last updated: {policy.lastUpdated}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<span
									className={`px-2 py-1 text-xs rounded-full ${
										policy.status === "published"
											? "bg-green-100 text-green-800"
											: "bg-yellow-100 text-yellow-800"
									}`}
								>
									{policy.status}
								</span>
								<button
									onClick={() =>
										toggleStatus("privacy", policy.id)
									}
									className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
								>
									<Eye size={16} />
								</button>
								<button
									onClick={() =>
										handleEdit("privacy", policy)
									}
									className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
								>
									<Edit size={16} />
								</button>
								<button
									onClick={() =>
										handleDelete("privacy", policy.id)
									}
									className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
								>
									<Trash2 size={16} />
								</button>
							</div>
						</div>
						<p className="text-gray-700 line-clamp-3">
							{policy.content}
						</p>
					</div>
				))}
			</div>
		</div>
	);

	const renderFAQTab = () => (
		<div className="space-y-6">
			{/* Add New FAQ */}
			<div className="bg-white rounded-lg shadow-sm border p-6">
				<h3 className="text-lg font-semibold mb-4">Add New FAQ</h3>
				<div className="space-y-4">
					<input
						type="text"
						placeholder="Category (e.g., Account, Billing)"
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						value={newItem.faq.category}
						onChange={(e) =>
							setNewItem((prev) => ({
								...prev,
								faq: { ...prev.faq, category: e.target.value },
							}))
						}
					/>
					<input
						type="text"
						placeholder="Question"
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						value={newItem.faq.question}
						onChange={(e) =>
							setNewItem((prev) => ({
								...prev,
								faq: { ...prev.faq, question: e.target.value },
							}))
						}
					/>
					<textarea
						placeholder="Answer"
						rows={4}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						value={newItem.faq.answer}
						onChange={(e) =>
							setNewItem((prev) => ({
								...prev,
								faq: { ...prev.faq, answer: e.target.value },
							}))
						}
					/>
					<button
						onClick={() => handleAdd("faq")}
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
					>
						<Plus size={20} />
						Add FAQ
					</button>
				</div>
			</div>

			{/* FAQ List */}
			<div className="space-y-4">
				{organizationData.faq.map((faq) => (
					<div
						key={faq.id}
						className="bg-white rounded-lg shadow-sm border p-6"
					>
						<div className="flex justify-between items-start mb-4">
							<div>
								<span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mb-2">
									{faq.category}
								</span>
								<h4 className="text-lg font-semibold">
									{faq.question}
								</h4>
							</div>
							<div className="flex items-center gap-2">
								<span
									className={`px-2 py-1 text-xs rounded-full ${
										faq.status === "published"
											? "bg-green-100 text-green-800"
											: "bg-yellow-100 text-yellow-800"
									}`}
								>
									{faq.status}
								</span>
								<button
									onClick={() => toggleStatus("faq", faq.id)}
									className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
								>
									<Eye size={16} />
								</button>
								<button
									onClick={() => handleEdit("faq", faq)}
									className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
								>
									<Edit size={16} />
								</button>
								<button
									onClick={() => handleDelete("faq", faq.id)}
									className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
								>
									<Trash2 size={16} />
								</button>
							</div>
						</div>
						<p className="text-gray-700">{faq.answer}</p>
					</div>
				))}
			</div>
		</div>
	);

	const renderResourcesTab = () => (
		<div className="space-y-6">
			{/* Add New Resource */}
			<div className="bg-white rounded-lg shadow-sm border p-6">
				<h3 className="text-lg font-semibold mb-4">Add New Resource</h3>
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<input
							type="text"
							placeholder="Resource Title"
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							value={newItem.resources.title}
							onChange={(e) =>
								setNewItem((prev) => ({
									...prev,
									resources: {
										...prev.resources,
										title: e.target.value,
									},
								}))
							}
						/>
						<input
							type="text"
							placeholder="Category"
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							value={newItem.resources.category}
							onChange={(e) =>
								setNewItem((prev) => ({
									...prev,
									resources: {
										...prev.resources,
										category: e.target.value,
									},
								}))
							}
						/>
					</div>
					<input
						type="url"
						placeholder="Resource URL"
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						value={newItem.resources.url}
						onChange={(e) =>
							setNewItem((prev) => ({
								...prev,
								resources: {
									...prev.resources,
									url: e.target.value,
								},
							}))
						}
					/>
					<textarea
						placeholder="Description"
						rows={3}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						value={newItem.resources.description}
						onChange={(e) =>
							setNewItem((prev) => ({
								...prev,
								resources: {
									...prev.resources,
									description: e.target.value,
								},
							}))
						}
					/>
					<button
						onClick={() => handleAdd("resources")}
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
					>
						<Plus size={20} />
						Add Resource
					</button>
				</div>
			</div>

			{/* Resources List */}
			<div className="space-y-4">
				{organizationData.resources.map((resource) => (
					<div
						key={resource.id}
						className="bg-white rounded-lg shadow-sm border p-6"
					>
						<div className="flex justify-between items-start mb-4">
							<div>
								<div className="flex items-center gap-2 mb-2">
									<h4 className="text-lg font-semibold">
										{resource.title}
									</h4>
									<span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
										{resource.category}
									</span>
								</div>
								<p className="text-gray-600 mb-2">
									{resource.description}
								</p>
								<a
									href={resource.url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:underline text-sm"
								>
									{resource.url}
								</a>
							</div>
							<div className="flex items-center gap-2">
								<span
									className={`px-2 py-1 text-xs rounded-full ${
										resource.status === "published"
											? "bg-green-100 text-green-800"
											: "bg-yellow-100 text-yellow-800"
									}`}
								>
									{resource.status}
								</span>
								<button
									onClick={() =>
										toggleStatus("resources", resource.id)
									}
									className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
								>
									<Eye size={16} />
								</button>
								<button
									onClick={() =>
										handleEdit("resources", resource)
									}
									className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
								>
									<Edit size={16} />
								</button>
								<button
									onClick={() =>
										handleDelete("resources", resource.id)
									}
									className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
								>
									<Trash2 size={16} />
								</button>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="py-6">
						<h1 className="text-3xl font-bold text-gray-900">
							Organization Management
						</h1>
						<p className="mt-2 text-gray-600">
							Manage privacy policies, FAQs, and resources for
							your organization
						</p>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Tabs */}
				<div className="bg-white rounded-lg shadow-sm border mb-8">
					<div className="border-b border-gray-200">
						<nav className="flex space-x-8 px-6">
							{[
								{
									id: "privacy",
									label: "Privacy Policies",
									count: organizationData.privacy.length,
								},
								{
									id: "faq",
									label: "FAQ",
									count: organizationData.faq.length,
								},
								{
									id: "resources",
									label: "Resources",
									count: organizationData.resources.length,
								},
							].map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
										activeTab === tab.id
											? "border-blue-500 text-blue-600"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									}`}
								>
									{tab.label}
									<span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
										{tab.count}
									</span>
								</button>
							))}
						</nav>
					</div>
				</div>

				{/* Tab Content */}
				{activeTab === "privacy" && renderPrivacyTab()}
				{activeTab === "faq" && renderFAQTab()}
				{activeTab === "resources" && renderResourcesTab()}
			</div>

			{/* Edit Modal */}
			{isEditing && editingItem && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center p-6 border-b">
							<h3 className="text-lg font-semibold">
								Edit {editingItem.type}
							</h3>
							<button
								onClick={() => {
									setIsEditing(false);
									setEditingItem(null);
								}}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>

						<div className="p-6 space-y-4">
							{editingItem.type === "privacy" && (
								<>
									<input
										type="text"
										placeholder="Policy Title"
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										value={editingItem.title || ""}
										onChange={(e) =>
											setEditingItem((prev) => ({
												...prev,
												title: e.target.value,
											}))
										}
									/>
									<textarea
										placeholder="Policy Content"
										rows={8}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										value={editingItem.content || ""}
										onChange={(e) =>
											setEditingItem((prev) => ({
												...prev,
												content: e.target.value,
											}))
										}
									/>
								</>
							)}

							{editingItem.type === "faq" && (
								<>
									<input
										type="text"
										placeholder="Category"
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										value={editingItem.category || ""}
										onChange={(e) =>
											setEditingItem((prev) => ({
												...prev,
												category: e.target.value,
											}))
										}
									/>
									<input
										type="text"
										placeholder="Question"
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										value={editingItem.question || ""}
										onChange={(e) =>
											setEditingItem((prev) => ({
												...prev,
												question: e.target.value,
											}))
										}
									/>
									<textarea
										placeholder="Answer"
										rows={6}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										value={editingItem.answer || ""}
										onChange={(e) =>
											setEditingItem((prev) => ({
												...prev,
												answer: e.target.value,
											}))
										}
									/>
								</>
							)}

							{editingItem.type === "resources" && (
								<>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<input
											type="text"
											placeholder="Resource Title"
											className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											value={editingItem.title || ""}
											onChange={(e) =>
												setEditingItem((prev) => ({
													...prev,
													title: e.target.value,
												}))
											}
										/>
										<input
											type="text"
											placeholder="Category"
											className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											value={editingItem.category || ""}
											onChange={(e) =>
												setEditingItem((prev) => ({
													...prev,
													category: e.target.value,
												}))
											}
										/>
									</div>
									<input
										type="url"
										placeholder="Resource URL"
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										value={editingItem.url || ""}
										onChange={(e) =>
											setEditingItem((prev) => ({
												...prev,
												url: e.target.value,
											}))
										}
									/>
									<textarea
										placeholder="Description"
										rows={4}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										value={editingItem.description || ""}
										onChange={(e) =>
											setEditingItem((prev) => ({
												...prev,
												description: e.target.value,
											}))
										}
									/>
								</>
							)}
						</div>

						<div className="flex justify-end gap-3 p-6 border-t">
							<button
								onClick={() => {
									setIsEditing(false);
									setEditingItem(null);
								}}
								className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
							>
								Cancel
							</button>
							<button
								onClick={handleSave}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
							>
								<Save size={16} />
								Save Changes
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminOrganizationsPage;
