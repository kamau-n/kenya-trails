// Organization Service - Handles all organization-related API calls
export interface PrivacyPolicy {
	id: number;
	title: string;
	content: string;
	lastUpdated: string;
	status: "published" | "draft";
	createdBy?: string;
	version?: number;
}

export interface FAQ {
	id: number;
	question: string;
	answer: string;
	category: string;
	status: "published" | "draft";
	order?: number;
	tags?: string[];
	createdBy?: string;
	lastUpdated?: string;
}

export interface Resource {
	id: number;
	title: string;
	description: string;
	url: string;
	category: string;
	status: "published" | "draft";
	fileType?: string;
	downloadCount?: number;
	createdBy?: string;
	lastUpdated?: string;
}

export interface Organization {
	id: number;
	name: string;
	slug: string;
	privacyPolicies: PrivacyPolicy[];
	faqs: FAQ[];
	resources: Resource[];
	settings: {
		allowPublicAccess: boolean;
		requireAuthentication: boolean;
		enableVersioning: boolean;
		moderationRequired: boolean;
	};
}

class OrganizationService {
	private baseUrl = "/api/admin/organizations";

	// Privacy Policies
	async getPrivacyPolicies(organizationId: number): Promise<PrivacyPolicy[]> {
		const response = await fetch(
			`${this.baseUrl}/${organizationId}/privacy-policies`
		);
		if (!response.ok) throw new Error("Failed to fetch privacy policies");
		return response.json();
	}

	async createPrivacyPolicy(
		organizationId: number,
		policy: Omit<PrivacyPolicy, "id" | "lastUpdated">
	): Promise<PrivacyPolicy> {
		const response = await fetch(
			`${this.baseUrl}/${organizationId}/privacy-policies`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(policy),
			}
		);
		if (!response.ok) throw new Error("Failed to create privacy policy");
		return response.json();
	}

	async updatePrivacyPolicy(
		organizationId: number,
		policyId: number,
		policy: Partial<PrivacyPolicy>
	): Promise<PrivacyPolicy> {
		const response = await fetch(
			`${this.baseUrl}/${organizationId}/privacy-policies/${policyId}`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(policy),
			}
		);
		if (!response.ok) throw new Error("Failed to update privacy policy");
		return response.json();
	}

	async deletePrivacyPolicy(
		organizationId: number,
		policyId: number
	): Promise<void> {
		const response = await fetch(
			`${this.baseUrl}/${organizationId}/privacy-policies/${policyId}`,
			{
				method: "DELETE",
			}
		);
		if (!response.ok) throw new Error("Failed to delete privacy policy");
	}

	async publishPrivacyPolicy(
		organizationId: number,
		policyId: number
	): Promise<PrivacyPolicy> {
		return this.updatePrivacyPolicy(organizationId, policyId, {
			status: "published",
		});
	}

	async draftPrivacyPolicy(
		organizationId: number,
		policyId: number
	): Promise<PrivacyPolicy> {
		return this.updatePrivacyPolicy(organizationId, policyId, {
			status: "draft",
		});
	}

	// FAQs
	async getFAQs(organizationId: number, category?: string): Promise<FAQ[]> {
		const url = category
			? `${
					this.baseUrl
			  }/${organizationId}/faqs?category=${encodeURIComponent(category)}`
			: `${this.baseUrl}/${organizationId}/faqs`;

		const response = await fetch(url);
		if (!response.ok) throw new Error("Failed to fetch FAQs");
		return response.json();
	}

	async createFAQ(
		organizationId: number,
		faq: Omit<FAQ, "id" | "lastUpdated">
	): Promise<FAQ> {
		const response = await fetch(`${this.baseUrl}/${organizationId}/faqs`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(faq),
		});
		if (!response.ok) throw new Error("Failed to create FAQ");
		return response.json();
	}

	async updateFAQ(
		organizationId: number,
		faqId: number,
		faq: Partial<FAQ>
	): Promise<FAQ> {
		const response = await fetch(
			`${this.baseUrl}/${organizationId}/faqs/${faqId}`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(faq),
			}
		);
		if (!response.ok) throw new Error("Failed to update FAQ");
		return response.json();
	}

	async deleteFAQ(organizationId: number, faqId: number): Promise<void> {
		const response = await fetch(
			`${this.baseUrl}/${organizationId}/faqs/${faqId}`,
			{
				method: "DELETE",
			}
		);
		if (!response.ok) throw new Error("Failed to delete FAQ");
	}

	async reorderFAQs(organizationId: number, faqIds: number[]): Promise<void> {
		const response = await fetch(
			`${this.baseUrl}/${organizationId}/faqs/reorder`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ faqIds }),
			}
		);
		if (!response.ok) throw new Error("Failed to reorder FAQs");
	}

	async getFAQCategories(organizationId: number): Promise<string[]> {
		const response = await fetch(
			`${this.baseUrl}/${organizationId}/faqs/categories`
		);
		if (!response.ok) throw new Error("Failed to fetch FAQ categories");
		return response.json();
	}

	// Resources
	async getResources(
		organizationId: number,
		category?: string
	): Promise<Resource[]> {
		const url = category
			? `${
					this.baseUrl
			  }/${organizationId}/resources?category=${encodeURIComponent(
					category
			  )}`
			: `${this.baseUrl}/${organizationId}/resources`;

		const response = await fetch(url);
		if (!response.ok) throw new Error("Failed to fetch resources");
		return response.json();
	}

	async createResource(
		organizationId: number,
		resource: Omit<Resource, "id" | "lastUpdated" | "downloadCount">
	): Promise<Resource> {
		const response = await fetch(
			`${this.baseUrl}/${organizationId}/resources`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(resource),
			}
		);
		if (!response.ok) throw new Error("Failed to create resource");
		return response.json();
	}

	async updateResource(
		organizationId: number,
		resourceId: number,
		resource: Partial<Resource>
	): Promise<Resource> {
		const response = await fetch(
			`${this.baseUrl}/${organizationId}/resources/${resourceId}`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(resource),
			}
		);
		if (!response.ok) throw new Error("Failed to update resource");
		return response.json();
	}

	async deleteResource(
		organizationId: number,
		resourceId: number
	): Promise<void> {
		const response = await fetch(
			`${this.baseUrl}/${organizationId}/resources/${resourceId}`,
			{
				method: "DELETE",
			}
		);
		if (!response.ok) throw new Error("Failed to delete resource");
	}

	async uploadResourceFile(
		organizationId: number,
		resourceId: number,
		file: File
	): Promise<string> {
		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch(
			`${this.baseUrl}/${organizationId}/resources/${resourceId}/upload`,
			{
				method: "POST",
				body: formData,
			}
		);

		if (!response.ok) throw new Error("Failed to upload file");
		const result = await response.json();
		return result.url;
	}

	async getResourceCategories(organizationId: number): Promise<string[]> {
		const response = await fetch(
			`${this.baseUrl}/${organizationId}/resources/categories`
		);
		if (!response.ok)
			throw new Error("Failed to fetch resource categories");
		return response.json();
	}

	// Organization Management
	async getOrganization(organizationId: number): Promise<Organization> {
		const response = await fetch(`${this.baseUrl}/${organizationId}`);
		if (!response.ok) throw new Error("Failed to fetch organization");
		return response.json();
	}

	async updateOrganizationSettings(
		organizationId: number,
		settings: Partial<Organization["settings"]>
	): Promise<Organization> {
		const response = await fetch(
			`${this.baseUrl}/${organizationId}/settings`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(settings),
			}
		);
		if (!response.ok)
			throw new Error("Failed to update organization settings");
		return response.json();
	}

	// Bulk Operations
	async bulkUpdateStatus(
		organizationId: number,
		type: "privacy" | "faq" | "resources",
		ids: number[],
		status: "published" | "draft"
	): Promise<void> {
		const response = await fetch(
			`${this.baseUrl}/${organizationId}/${type}/bulk-status`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ids, status }),
			}
		);
		if (!response.ok) throw new Error("Failed to bulk update status");
	}

	async bulkDelete(
		organizationId: number,
		type: "privacy" | "faq" | "resources",
		ids: number[]
	): Promise<void> {
		const response = await fetch(
			`${this.baseUrl}/${organizationId}/${type}/bulk-delete`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ids }),
			}
		);
		if (!response.ok) throw new Error("Failed to bulk delete items");
	}

	// Search and Filtering
	async searchContent(
		organizationId: number,
		query: string,
		type?: "privacy" | "faq" | "resources"
	): Promise<{
		privacy: PrivacyPolicy[];
		faq: FAQ[];
		resources: Resource[];
	}> {
		const params = new URLSearchParams({ query });
		if (type) params.append("type", type);

		const response = await fetch(
			`${this.baseUrl}/${organizationId}/search?${params}`
		);
		if (!response.ok) throw new Error("Failed to search content");
		return response.json();
	}

	// Analytics
	async getAnalytics(
		organizationId: number,
		dateRange?: { start: string; end: string }
	): Promise<{
		totalViews: number;
		privacyPolicyViews: number;
		faqViews: number;
		resourceDownloads: number;
		popularContent: Array<{
			type: string;
			id: number;
			title: string;
			views: number;
		}>;
	}> {
		const params = new URLSearchParams();
		if (dateRange) {
			params.append("start", dateRange.start);
			params.append("end", dateRange.end);
		}

		const response = await fetch(
			`${this.baseUrl}/${organizationId}/analytics?${params}`
		);
		if (!response.ok) throw new Error("Failed to fetch analytics");
		return response.json();
	}

	// Version Management
	async getVersionHistory(
		organizationId: number,
		type: "privacy" | "faq" | "resources",
		itemId: number
	): Promise<
		Array<{
			version: number;
			createdAt: string;
			createdBy: string;
			changes: string[];
		}>
	> {
		const response = await fetch(
			`${this.baseUrl}/${organizationId}/${type}/${itemId}/versions`
		);
		if (!response.ok) throw new Error("Failed to fetch version history");
		return response.json();
	}

	async restoreVersion(
		organizationId: number,
		type: "privacy" | "faq" | "resources",
		itemId: number,
		version: number
	): Promise<void> {
		const response = await fetch(
			`${this.baseUrl}/${organizationId}/${type}/${itemId}/versions/${version}/restore`,
			{
				method: "POST",
			}
		);
		if (!response.ok) throw new Error("Failed to restore version");
	}
}

export const organizationService = new OrganizationService();
