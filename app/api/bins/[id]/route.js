import dbConnect from "@/lib/dbConnect";
import Bin from "@/models/bin";

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
    const { id } = await params; // Access bin ID from params
    const {isFull } = await req.json(); // Extract updated fields from body
    console.log(isFull);

    // Ensure the required fields are provided
    if (typeof isFull !== "boolean") {
      return new Response(JSON.stringify({ error: "Invalid data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Connect to the database
    await dbConnect();

    // Update the bin in the database
    const updatedBin = await Bin.findByIdAndUpdate(
      id,
      {
        $set: {
          isFull,
          updatedAt: new Date().toISOString(),
        },
      },
      { new: true }
    );

    if (!updatedBin) {
      return new Response(
        JSON.stringify({ error: "Bin not found or no changes made" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Successfully updated the bin
    return new Response(
      JSON.stringify({ message: "Bin updated successfully", data: updatedBin }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating bin:", error);
    return new Response(JSON.stringify({ error: "Failed to update bin" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
