import dbConnect from "@/lib/dbConnect";
import Collector from "@/models/collector";

export async function DELETE(req, { params }) {
    try {
      const { id } = await params;
      await dbConnect();
  
      // Find and delete the collector by ID
      const deletedCollector = await Collector.findByIdAndDelete(id);
  
      if (!deletedCollector) {
        return new Response(
          JSON.stringify({ error: "Collector not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
  
      return new Response(
        JSON.stringify({ message: "Collector deleted successfully" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error deleting collector:", error);
      return new Response(
        JSON.stringify({ error: "Internal Server Error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }