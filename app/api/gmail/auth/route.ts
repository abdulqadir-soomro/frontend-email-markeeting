import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // For now, we'll use a simple approach with app passwords
    // In production, you'd implement full OAuth 2.0 flow
    const authUrl = `/api/gmail/setup?userId=${userId}`;

    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error: any) {
    console.error("Error generating Gmail auth URL:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

