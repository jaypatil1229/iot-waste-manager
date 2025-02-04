import dbConnect from "@/lib/dbConnect";
import Collector from "@/models/collector";
import { getServerSession } from "next-auth";

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(req);
    if (!session || !session.user) {
      // Unauthorized if no session or user
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    await dbConnect();

    const collector = await Collector.findOne({ email: session.user.email });
    if (!collector) {
      return new Response(JSON.stringify({ error: "Collector not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!collector.isAdmin) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { id } = await params;

    // Find and delete the collector by ID
    const deletedCollector = await Collector.findByIdAndDelete(id);

    if (!deletedCollector) {
      return new Response(JSON.stringify({ error: "Collector not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ message: "Collector deleted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting collector:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
