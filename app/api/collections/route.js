import dbConnect from "@/lib/dbConnect";
import BinCollectionActivity from "@/models/binCollectionActivity";
import Bin from "@/models/bin";
import { getServerSession } from "next-auth";

export async function GET(req) {
  try {
    const session = await getServerSession(req);

    if (!session || !session.user) {
      // Unauthorized if no session or user
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const collectorId = searchParams.get("collectorId");

    if (!collectorId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing collectorId parameter",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    //find the collection activities for the collector
    // const collections = await BinCollectionActivity.find({ collectorId, status: "processing" }).populate("binId");
    //populate the binId field with the bin data as bin object not as binId
    const collections = await BinCollectionActivity.find({
      collectorId,
      status: "processing",
    }).populate("binId");

    const modifiedCollections = collections.map((collection) => {
      const obj = collection.toObject();
      obj.bin = obj.binId; // Assign populated binId to bin
      delete obj.binId; // Remove original binId field
      return obj;
    });

    return new Response(
      JSON.stringify({ success: true, collections: modifiedCollections }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.log("Error finding collections: ", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

//function to create a new collection activity
export async function POST(req) {
  try {
    const session = await getServerSession(req);

    if (!session || !session.user) {
      // Unauthorized if no session or user
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    await dbConnect();

    const { collectorId, binId } = await req.json();

    if (!collectorId || !binId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing collectorId or binId parameter",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    //check if the bin exists
    const bin = await Bin.findById(binId);
    if (!bin) {
      return new Response(
        JSON.stringify({ success: false, error: "Bin not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    //create the collection activity
    const collection = await BinCollectionActivity.create({
      collectorId,
      binId,
      status: "processing",
      routeId: null,
    });

    //update the bin status to processing
    await Bin.findByIdAndUpdate(binId, { status: "processing" });

    return new Response(JSON.stringify({ success: true, collection }), {
      status: 201,
      success: true,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("Error creating collection: ", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
