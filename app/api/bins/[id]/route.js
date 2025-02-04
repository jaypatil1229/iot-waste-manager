import dbConnect from "@/lib/dbConnect";
import Bin from "@/models/bin";
import collector from "@/models/collector";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    // Connect to the database
    await dbConnect();

    // Fetch collectors who are not admins
    const bin = await Bin.findOne({ binId: id });

    // Return the data as JSON
    return new Response(JSON.stringify({ success: true, data: bin }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching bin:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to fetch bin" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();

    // Find and delete the collector by ID
    const deletedBin = await Bin.findByIdAndDelete(id);

    if (!deletedBin) {
      return new Response(JSON.stringify({ error: "Bin not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ message: "Bin deleted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting bin:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    const { isFull, latitude, longitude, status } = await req.json();

    if (
      typeof isFull !== "boolean" ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return new Response(JSON.stringify({ error: "Invalid data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find the bin by ID
    const bin = await Bin.findById(id);
    if (!bin) {
      return new Response(JSON.stringify({ error: "Bin not found" }), {
        status: 404,
      });
    }

    // Update the bin data
    bin.isFull = isFull;
    bin.status = status || bin.status;
    if (latitude && longitude) {
      bin.location = { latitude, longitude };
    }
    bin.updatedAt = new Date();

    await bin.save();

    if (global.io) {
      console.log("global.io");
      global.io.emit("binUpdated", { bin });
    }

    console.log("binUpdated");
    return new Response(
      JSON.stringify({ message: "Bin updated successfully", bin }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating bin:", error);
    return new Response(JSON.stringify({ error: "Failed to update bin" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
