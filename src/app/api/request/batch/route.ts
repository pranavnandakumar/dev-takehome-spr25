import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import RequestModel from "../../../../models/Request";
import { batchUpdateRequestBody, batchDeleteRequestBody } from "../../../../lib/validation/requestSchemas";

/**
 * PATCH /api/request/batch
 * Body: { ids: string[], status: "pending"|"completed"|"approved"|"rejected" }
 * - Updates status for multiple requests
 * - Updates lastEditedDate for all updated requests
 */
export async function PATCH(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const parsed = batchUpdateRequestBody.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { ids, status } = parsed.data;
    const now = new Date();

    const result = await RequestModel.updateMany(
      { _id: { $in: ids } },
      { $set: { status, lastEditedDate: now } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "No requests found with the provided IDs" },
        { status: 404 }
      );
    }

    // Return the updated documents
    const updatedRequests = await RequestModel.find({ _id: { $in: ids } });

    return NextResponse.json({
      message: `Successfully updated ${result.modifiedCount} requests`,
      updatedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
      data: updatedRequests
    }, { status: 200 });
  } catch (e) {
    console.error("PATCH /api/request/batch error:", e);
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/request/batch
 * Body: { ids: string[] }
 * - Deletes multiple requests by their IDs
 */
export async function DELETE(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const parsed = batchDeleteRequestBody.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { ids } = parsed.data;

    const result = await RequestModel.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "No requests found with the provided IDs" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Successfully deleted ${result.deletedCount} requests`,
      deletedCount: result.deletedCount
    }, { status: 200 });
  } catch (e) {
    console.error("DELETE /api/request/batch error:", e);
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
