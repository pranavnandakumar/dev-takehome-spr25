import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import RequestModel from "../../../models/Request";
import { PAGINATION_PAGE_SIZE } from "../../../lib/constants";
import { createRequestBody, listRequestQuery, patchRequestBody } from "../../../lib/validation/requestSchemas";

/**
 * GET /api/request?page=_&status=_
 * - Returns requests sorted by createdDate desc
 * - Paginated using PAGINATION_PAGE_SIZE
 * - Optional status filter
 */
export async function GET(request: Request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const pageParam = url.searchParams.get("page");
    const statusParam = url.searchParams.get("status");

    const parsed = listRequestQuery.safeParse({
      page: pageParam,
      status: statusParam || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { page, status } = parsed.data;
    const limit = PAGINATION_PAGE_SIZE;
    const skip = (page - 1) * limit;

    const filter: Record<string, string> = {};
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      RequestModel.find(filter)
        .sort({ createdDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      RequestModel.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return NextResponse.json({ data, page, limit, total, totalPages }, { status: 200 });
  } catch (e) {
    console.error("GET /api/request error:", e);
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/request
 * Body: { requestorName, itemRequested }
 * - Creates a new request
 * - Sets createdDate + lastEditedDate = now
 * - Sets status = "pending"
 */
export async function PUT(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const parsed = createRequestBody.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const now = new Date();
    const doc = await RequestModel.create({
      requestorName: parsed.data.requestorName,
      itemRequested: parsed.data.itemRequested,
      createdDate: now,
      lastEditedDate: now,
      status: "pending",
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (e) {
    console.error("PUT /api/request error:", e);
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/request
 * Body: { id, status }  // status ∈ {"pending","completed","approved","rejected"}
 * - Updates the status
 * - Updates lastEditedDate = now
 */
export async function PATCH(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const parsed = patchRequestBody.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { id, status } = parsed.data;

    const updated = await RequestModel.findByIdAndUpdate(
      id,
      { $set: { status, lastEditedDate: new Date() } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (e) {
    console.error("PATCH /api/request error:", e);
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}