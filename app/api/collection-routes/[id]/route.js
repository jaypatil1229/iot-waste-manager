import dbConnect from "@/lib/dbConnect";
import CollectionRoute from "@/models/collectionRoute";
import Bin from "@/models/bin";
import BinCollectionActivity from "@/models/binCollectionActivity";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    // Connect to the database
    await dbConnect();

    //fetch routes of a specific collector by id , routes may be many
    const routes = await CollectionRoute.find({
      collectorId: id,
      status: "active",
    }).populate("bins");

    // Return the data as JSON
    return new Response(JSON.stringify({ success: true, routes: routes }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("Error fetching route:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to fetch route" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// to update the status of the route
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { routeId } = await req.json();

    if (!routeId)
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid request, routeId is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );

    // Connect to the database
    await dbConnect();

    // Step 1: Find the route
    const route = await CollectionRoute.findOne({
      _id: routeId,
      collectorId: id,
      status: "active",
    });

    if (!route) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Route not found or already completed",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 2: Get all bins in the route
    const binIds = route.bins;

    // Step 3: Update bins to "empty"
    await Bin.updateMany(
      { _id: { $in: binIds }, status: "processing" },
      { status: "empty", isFull: false }
    );

    // Step 4: Update BinCollectionActivity to "collected"
    await BinCollectionActivity.updateMany(
      { binId: { $in: binIds }, collectorId: id, status: "processing" },
      { status: "collected", collectedAt: new Date() }
    );

    // Step 5: Mark the route as completed
    await CollectionRoute.findByIdAndUpdate(routeId, { status: "completed" });

    return new Response(
      JSON.stringify({ success: true, message: "Route updated" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log("Error updating route:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to update route" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// to delete the route
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const { routeId } = await req.json();

    if (!routeId)
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid request, routeId is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );

    // Connect to the database
    await dbConnect();

    // Step 1: Find the route
    const route = await CollectionRoute.findOne({
      _id: routeId,
      collectorId: id,
      status: "active",
    });

    if (!route) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Route not found or already completed",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 2: Get all bins in the route
    const binIds = route.bins;

    // Step 3: Update bins to previous state as the route is rejected
    await Bin.updateMany(
      { _id: { $in: binIds }, status: "processing" },
      { status: "full" , isFull: true }
    );

    // Step 4: Update BinCollectionActivity to "collected"
    await BinCollectionActivity.updateMany(
      { binId: { $in: binIds }, collectorId: id, status: "processing" },
      { status: "rejected", collectedAt: new Date() }
    );

    // Step 5: Mark the route as completed
    await CollectionRoute.findByIdAndUpdate(routeId, { status: "cancelled" });

    return new Response(
      JSON.stringify({ success: true, message: "Route Deleted" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log("Error updating route:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to delete route" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
