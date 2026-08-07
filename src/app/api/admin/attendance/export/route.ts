import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    // Authenticate as Admin
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const plan = searchParams.get('plan') || '';
    const dateVal = searchParams.get('date') || '';
    const monthVal = searchParams.get('month') || '';

    // Build Prisma query condition
    const where: Prisma.AttendanceWhereInput = {};

    if (search) {
      where.user = {
        is: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ]
        }
      };
    }

    if (plan) {
      where.user = {
        is: {
          ...where.user?.is,
          memberships: {
            some: { plan }
          }
        }
      };
    }

    if (dateVal) {
      where.date = dateVal;
    } else if (monthVal) {
      where.date = { startsWith: monthVal };
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { time: 'desc' }
      ]
    });

    // Generate CSV contents
    const csvHeaders = ['Member Name', 'Email', 'Phone', 'Date', 'Checked-In Time', 'Status'];
    const csvRows = records.map(r => [
      `"${(r.user?.name || '').replace(/"/g, '""')}"`,
      `"${(r.user?.email || '').replace(/"/g, '""')}"`,
      `"${(r.user?.phone || '').replace(/"/g, '""')}"`,
      r.date,
      r.time,
      r.status
    ]);

    const csvString = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    
    const filename = `attendance_export_${dateVal || monthVal || 'all'}.csv`;

    return new Response(csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error("[ADMIN_ATTENDANCE_EXPORT_GET]", error);
    return new Response("Unauthorized or Internal Server Error", { status: 500 });
  }
}
