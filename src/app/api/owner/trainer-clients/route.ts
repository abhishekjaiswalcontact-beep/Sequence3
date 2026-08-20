import { prisma } from "@/lib/prisma";
import { requirePermission, apiError, apiResponse, NON_OWNER_USER_FILTER, isOwnerUser } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";

const AssignTrainerSchema = z.object({
  trainerId: z.number(),
  clientId: z.number(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    await requirePermission("MANAGE_TRAINERS");

    // Get all trainers
    const trainers = await prisma.staff.findMany({
      where: {
        designation: { contains: "Trainer", mode: "insensitive" }
      },
      include: {
        trainerClients: {
          where: {
            client: NON_OWNER_USER_FILTER
          },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                memberships: {
                  orderBy: { startDate: "desc" },
                  take: 1
                }
              }
            }
          }
        }
      }
    });

    // Format trainer client overview
    const trainerOverview = trainers.map(t => {
      const activeClients = t.trainerClients.filter(tc => tc.status === "Active");
      const expiredClients = t.trainerClients.filter(tc => tc.status === "Expired");
      const ptClients = t.trainerClients.filter(tc => tc.client.memberships[0]?.personalTrainerIncluded);

      let revenueGenerated = 0;
      t.trainerClients.forEach(tc => {
        tc.client.memberships.forEach(m => {
          revenueGenerated += m.amountPaid || 0;
        });
      });

      return {
        trainerId: t.id,
        trainerName: t.name,
        email: t.email,
        phone: t.phone,
        totalAssigned: t.trainerClients.length,
        activeClientsCount: activeClients.length,
        expiredClientsCount: expiredClients.length,
        ptClientsCount: ptClients.length,
        revenueGenerated,
        assignedClients: t.trainerClients,
      };
    });

    // Unassigned or all members (excluding Owners)
    const allMembers = await prisma.user.findMany({
      where: { ...NON_OWNER_USER_FILTER, role: { in: ["MEMBER", ""] } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        memberships: {
          orderBy: { startDate: "desc" },
          take: 1
        },
        assignedAsClient: {
          select: {
            id: true,
            trainerId: true,
            trainer: { select: { name: true } }
          }
        }
      }
    });

    return apiResponse({
      trainerOverview,
      allMembers,
    });
  } catch (error) {
    console.error("[OWNER_TRAINER_CLIENTS_GET]", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission("MANAGE_TRAINERS");
    const body = await req.json();
    const parse = AssignTrainerSchema.safeParse(body);

    if (!parse.success) return apiError("Invalid trainer or client ID", 400);

    const { trainerId, clientId, notes } = parse.data;

    const trainer = await prisma.staff.findUnique({ where: { id: trainerId } });
    const client = await prisma.user.findUnique({ where: { id: clientId } });

    if (!trainer || !client || isOwnerUser(client)) return apiError("Trainer or Client not found or access denied", 404);

    // Find existing assignment for this client, then update or create
    const existing = await prisma.trainerClient.findFirst({ where: { clientId } });
    let assignment;
    if (existing) {
      assignment = await prisma.trainerClient.update({
        where: { id: existing.id },
        data: {
          trainerId,
          status: "Active",
          notes: notes || `Reassigned to ${trainer.name}`,
        },
      });
    } else {
      assignment = await prisma.trainerClient.create({
        data: {
          trainerId,
          clientId,
          status: "Active",
          notes: notes || `Assigned to ${trainer.name}`,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "TRAINER_ASSIGNED",
        performedByUserId: Number(session.sub),
        performedByName: session.name || session.email,
        role: session.isOwner ? "OWNER" : "ADMIN",
        targetRecordId: String(assignment.id),
        targetRecordType: "TRAINER_CLIENT",
        description: `Assigned client "${client.name}" to trainer "${trainer.name}".`,
      }
    }).catch(() => {});

    return apiResponse({ message: `Client ${client.name} assigned to ${trainer.name}.`, assignment });
  } catch (error) {
    console.error("[OWNER_TRAINER_CLIENTS_POST]", error);
    return apiError("Internal server error", 500);
  }
}

