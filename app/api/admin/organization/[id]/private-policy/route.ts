import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createPrivacyPolicySchema = z.object({
	title: z.string().min(1, "Title is required"),
	content: z.string().min(1, "Content is required"),
	status: z.enum(["published", "draft"]).default("draft"),
	version: z.number().optional(),
});

const bulkActionSchema = z.object({
	ids: z.array(z.number()),
	action: z.enum(["publish", "draft", "delete"]),
});

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const organizationId = parseInt(params.id);
		if (isNaN(organizationId)) {
			return NextResponse.json(
				{ error: "Invalid organization ID" },
				{ status: 400 }
			);
		}

		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const search = searchParams.get("search");

		// Check access to organization
		const hasAccess = await prisma.organizationMember.findFirst({
			where: {
				organizationId,
				userId: session.user.id,
				role: { in: ["ADMIN", "OWNER", "MEMBER"] },
			},
		});

		if (!hasAccess) {
			return NextResponse.json(
				{ error: "Access denied" },
				{ status: 403 }
			);
		}

		const whereClause: any = {
			organizationId,
		};

		if (status && ["published", "draft"].includes(status)) {
			whereClause.status = status;
		}

		if (search) {
			whereClause.OR = [
				{ title: { contains: search, mode: "insensitive" } },
				{ content: { contains: search, mode: "insensitive" } },
			];
		}

		const privacyPolicies = await prisma.privacyPolicy.findMany({
			where: whereClause,
			orderBy: { lastUpdated: "desc" },
			include: {
				createdBy: {
					select: { id: true, name: true, email: true },
				},
				_count: {
					select: { versions: true },
				},
			},
		});

		return NextResponse.json(privacyPolicies);
	} catch (error) {
		console.error("Error fetching privacy policies:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const organizationId = parseInt(params.id);
		if (isNaN(organizationId)) {
			return NextResponse.json(
				{ error: "Invalid organization ID" },
				{ status: 400 }
			);
		}

		const body = await request.json();
		const validatedData = createPrivacyPolicySchema.parse(body);

		// Check if user has admin access to this organization
		const hasAccess = await prisma.organizationMember.findFirst({
			where: {
				organizationId,
				userId: session.user.id,
				role: { in: ["ADMIN", "OWNER"] },
			},
		});

		if (!hasAccess) {
			return NextResponse.json(
				{ error: "Access denied" },
				{ status: 403 }
			);
		}

		const privacyPolicy = await prisma.privacyPolicy.create({
			data: {
				...validatedData,
				organizationId,
				createdById: session.user.id,
				lastUpdated: new Date(),
			},
			include: {
				createdBy: {
					select: { id: true, name: true, email: true },
				},
			},
		});

		// Create initial version if versioning is enabled
		const orgSettings = await prisma.organizationSettings.findFirst({
			where: { organizationId },
		});

		if (orgSettings?.enableVersioning) {
			await prisma.privacyPolicyVersion.create({
				data: {
					privacyPolicyId: privacyPolicy.id,
					version: 1,
					title: privacyPolicy.title,
					content: privacyPolicy.content,
					createdById: session.user.id,
					changes: ["Initial version created"],
				},
			});
		}

		return NextResponse.json(privacyPolicy, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid data", details: error.errors },
				{ status: 400 }
			);
		}
		console.error("Error creating privacy policy:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// Bulk operations endpoint
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const organizationId = parseInt(params.id);
		if (isNaN(organizationId)) {
			return NextResponse.json(
				{ error: "Invalid organization ID" },
				{ status: 400 }
			);
		}

		const body = await request.json();
		const { ids, action } = bulkActionSchema.parse(body);

		// Check if user has admin access to this organization
		const hasAccess = await prisma.organizationMember.findFirst({
			where: {
				organizationId,
				userId: session.user.id,
				role: { in: ["ADMIN", "OWNER"] },
			},
		});

		if (!hasAccess) {
			return NextResponse.json(
				{ error: "Access denied" },
				{ status: 403 }
			);
		}

		let result;

		switch (action) {
			case "publish":
				result = await prisma.privacyPolicy.updateMany({
					where: {
						id: { in: ids },
						organizationId,
					},
					data: {
						status: "published",
						lastUpdated: new Date(),
					},
				});
				break;

			case "draft":
				result = await prisma.privacyPolicy.updateMany({
					where: {
						id: { in: ids },
						organizationId,
					},
					data: {
						status: "draft",
						lastUpdated: new Date(),
					},
				});
				break;

			case "delete":
				result = await prisma.privacyPolicy.deleteMany({
					where: {
						id: { in: ids },
						organizationId,
					},
				});
				break;

			default:
				return NextResponse.json(
					{ error: "Invalid action" },
					{ status: 400 }
				);
		}

		return NextResponse.json({
			message: `Successfully ${action}ed ${result.count} privacy policies`,
			count: result.count,
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid data", details: error.errors },
				{ status: 400 }
			);
		}
		console.error("Error performing bulk action:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
