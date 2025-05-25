// import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
//import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schemas
const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  settings: z
    .object({
      allowPublicAccess: z.boolean().optional(),
      requireAuthentication: z.boolean().optional(),
      enableVersioning: z.boolean().optional(),
      moderationRequired: z.boolean().optional(),
    })
    .optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  //   try {
  //     const session = await getServerSession(authOptions);
  //     if (!session?.user) {
  //       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  //     }
  //     const organizationId = parseInt(params.id);
  //     if (isNaN(organizationId)) {
  //       return NextResponse.json(
  //         { error: "Invalid organization ID" },
  //         { status: 400 }
  //       );
  //     }
  //     // Check if user has admin access to this organization
  //     const organization = await prisma.organization.findFirst({
  //       where: {
  //         id: organizationId,
  //         members: {
  //           some: {
  //             userId: session.user.id,
  //             role: { in: ["ADMIN", "OWNER"] },
  //           },
  //         },
  //       },
  //       include: {
  //         privacyPolicies: {
  //           orderBy: { lastUpdated: "desc" },
  //         },
  //         faqs: {
  //           orderBy: { order: "asc" },
  //         },
  //         resources: {
  //           orderBy: { lastUpdated: "desc" },
  //         },
  //         settings: true,
  //       },
  //     });
  //     if (!organization) {
  //       return NextResponse.json(
  //         { error: "Organization not found" },
  //         { status: 404 }
  //       );
  //     }
  //     return NextResponse.json(organization);
  //   } catch (error) {
  //     console.error("Error fetching organization:", error);
  //     return NextResponse.json(
  //       { error: "Internal server error" },
  //       { status: 500 }
  //     );
  //   }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  //   try {
  //     const session = await getServerSession(authOptions);
  //     if (!session?.user) {
  //       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  //     }
  //     const organizationId = parseInt(params.id);
  //     if (isNaN(organizationId)) {
  //       return NextResponse.json(
  //         { error: "Invalid organization ID" },
  //         { status: 400 }
  //       );
  //     }
  //     const body = await request.json();
  //     const validatedData = updateOrganizationSchema.parse(body);
  //     // Check if user has admin access to this organization
  //     const existingOrg = await prisma.organization.findFirst({
  //       where: {
  //         id: organizationId,
  //         members: {
  //           some: {
  //             userId: session.user.id,
  //             role: { in: ["ADMIN", "OWNER"] },
  //           },
  //         },
  //       },
  //     });
  //     if (!existingOrg) {
  //       return NextResponse.json(
  //         { error: "Organization not found" },
  //         { status: 404 }
  //       );
  //     }
  //     const updatedOrganization = await prisma.organization.update({
  //       where: { id: organizationId },
  //       data: {
  //         ...validatedData,
  //         settings: validatedData.settings
  //           ? {
  //               upsert: {
  //                 create: validatedData.settings,
  //                 update: validatedData.settings,
  //               },
  //             }
  //           : undefined,
  //       },
  //       include: {
  //         privacyPolicies: true,
  //         faqs: true,
  //         resources: true,
  //         settings: true,
  //       },
  //     });
  //     return NextResponse.json(updatedOrganization);
  //   } catch (error) {
  //     if (error instanceof z.ZodError) {
  //       return NextResponse.json(
  //         { error: "Invalid data", details: error.errors },
  //         { status: 400 }
  //       );
  //     }
  //     console.error("Error updating organization:", error);
  //     return NextResponse.json(
  //       { error: "Internal server error" },
  //       { status: 500 }
  //     );
  //   }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  //   try {
  //     const session = await getServerSession(authOptions);
  //     if (!session?.user) {
  //       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  //     }
  // const organizationId = parseInt(params.id);
  // if (isNaN(organizationId)) {
  //   return NextResponse.json(
  //     { error: "Invalid organization ID" },
  //     { status: 400 }
  //   );
  // }
  // Check if user is the owner of this organization
  // const organization = await prisma.organization.findFirst({
  //   where: {
  //     id: organizationId,
  //     members: {
  //       some: {
  //         userId: session.user.id,
  //         role: "OWNER",
  //       },
  //     },
  //   },
  // });
  // if (!organization) {
  //   return NextResponse.json(
  //     { error: "Organization not found or insufficient permissions" },
  //     { status: 404 }
  //   );
  // }
  // Delete organization and all related data (cascading)
  //     await prisma.organization.delete({
  //       where: { id: organizationId },
  //     });
  //     return NextResponse.json({
  //       message: "Organization deleted successfully",
  //     });
  //   } catch (error) {
  //     console.error("Error deleting organization:", error);
  //     return NextResponse.json(
  //       { error: "Internal server error" },
  //       { status: 500 }
  //     );
  //   }
}
