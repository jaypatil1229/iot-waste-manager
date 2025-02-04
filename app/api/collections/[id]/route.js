import dbConnect from "@/lib/dbConnect";
import BinCollectionActivity from "@/models/binCollectionActivity";
import Bin from "@/models/bin";
import CollectionRoute from "@/models/collectionRoute";
import Collector from "@/models/collector";
import { getServerSession } from "next-auth";

//to update the collection as per colletion as param, and collectorId in the body, and status as completed
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(req);

    if (!session || !session.user) {
      // Unauthorized if no session or user
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const { id } = await params;
    const { collectorId } = await req.json();

    if (!collectorId)
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid request, collectorId is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );

    // Connect to the database
    await dbConnect();

    // Step 1: Find the collection
    const collection = await BinCollectionActivity.findOne({
      _id: id,
      collectorId: collectorId,
      status: "processing",
    });

    if (!collection) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Collection not found or already completed",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 2: Update the status of the bin
    const bin = await Bin.findById(collection.binId);
    bin.status = "empty";
    bin.isFull = false;
    await bin.save();

    //setp 3: check if this collection belongs to any route and update the status of the route on basis of collector id and bin id from one of the bins of route
    const route = await CollectionRoute.findOne({
      _id: collection.routeId,
    });

    if (route) {
      const routeBins = route.bins;
      const index = routeBins.indexOf(collection.binId);
      if (index > -1) {
        routeBins.splice(index, 1);
      }

      if (routeBins.length === 0) {
        route.status = "completed";
      }

      //update the route
      const updatedRoute = await CollectionRoute.findByIdAndUpdate(
        route._id,
        { bins: routeBins, status: route.status },
        { new: true }
      );
    }

    //step 4: increase the binsCollected count of the collector as per collectorId, as its a successful collection
    const collector = await Collector.findById(collectorId);
    collector.binsCollected += 1;
    await collector.save();

    // Step 5: Update the collection
    collection.status = "collected";
    collection.collectedAt = new Date();
    await collection.save();

    return new Response(
      JSON.stringify({
        success: true,
        data: collection,
        message: "Collection completed successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log("Error completing collection:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error updating collection" || error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

//to delete the collection as per collectionId as param, and collectorId in the body and status as rejected
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(req);

    if (!session || !session.user) {
      // Unauthorized if no session or user
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const { id } = await params;
    const { collectorId } = await req.json();

    if (!collectorId)
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid request, collectorId is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );

    // Connect to the database
    await dbConnect();

    // Step 1: Find the collection
    const collection = await BinCollectionActivity.findOne({
      _id: id,
      collectorId: collectorId,
      status: "processing",
    });

    if (!collection) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Collection not found or already completed",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 2: Update the status of the bin
    const bin = await Bin.findById(collection.binId);
    bin.status = "full";
    bin.isFull = true;
    await bin.save();

    //setp 3: check if this collection belongs to any route and update the status of the route on basis of collector id and bin id
    const route = await CollectionRoute.findOne({
      _id: collection.routeId,
    });

    if (route) {
      const routeBins = route.bins;
      const index = routeBins.indexOf(collection.binId);
      if (index > -1) {
        routeBins.splice(index, 1);
      }

      if (routeBins.length === 0) {
        route.status = "completed";
      }

      //update the route
      const updatedRoute = await CollectionRoute.findByIdAndUpdate(
        route._id,
        { bins: routeBins, status: route.status },
        { new: true }
      );
    }

    // Step 4: Update the collection
    collection.status = "rejected";
    await collection.save();

    return new Response(
      JSON.stringify({
        success: true,
        data: collection,
        message: "Collection rejected/deleted successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error deleting collection" || error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
