import dbConnect from "@/lib/dbConnect";
import Bin from "@/models/bin";
import Collector from "@/models/collector";
import BinCollectionActivity from "@/models/binCollectionActivity";
import { getServerSession } from "next-auth";
import e from "express";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(req);

    if (!session || !session.user) {
      // Unauthorized if no session or user
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

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

    //check if there are any routes, collections are associated with the bin
    const bin = await Bin.findById(id);
    if (!bin) {
      return new Response(JSON.stringify({ error: "Bin not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const collections = await BinCollectionActivity.find({ binId: id });
    if (collections.length > 0 || bin.status === "processing") {
      return new Response(
        JSON.stringify({
          error: "Bin cannot be deleted because it has collections",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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
    const { isFull, latitude, longitude, status, fromBin } = await req.json();

    if (
      typeof isFull !== "boolean" ||
      latitude === undefined ||
      longitude === undefined ||
      (status && typeof status !== "string")
    ) {
      return new Response(JSON.stringify({ error: "Invalid data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find the bin by ID
    let bin = null;
    if (fromBin) {
      bin = await Bin.findOne({ binId: fromBin });
    } else {
      bin = await Bin.findById(id);
    }

    if (!bin) {
      return new Response(JSON.stringify({ error: "Bin not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    //check if the bin is already full or bin is in processing state, if so don't update the bin
    if (bin.status === "processing") {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Bin is in processing state, unable update the bin untill the collection is completed",
        }),
        { status: 400 }
      );
    }

    // Update the bin data
    bin.isFull = isFull;
    bin.status = status || bin.status;
    if (latitude && longitude && latitude != "null" && longitude != "null") {
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
      JSON.stringify({
        success: true,
        message: "Bin updated successfully",
        bin,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating bin:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to update bin",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
