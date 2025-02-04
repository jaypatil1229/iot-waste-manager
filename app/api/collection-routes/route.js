import dbConnect from "@/lib/dbConnect";
import Bin from "@/models/bin";
import BinCollectionActivity from "@/models/binCollectionActivity";
import collectionRoute from "@/models/collectionRoute";
import axios from "axios";
import { getServerSession } from "next-auth";

const getCordinates = async (location) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const geocodeUrl = process.env.GOOGLE_MAPS_API_GEOCODE;
  const url = `${geocodeUrl}?address=${location}&key=${apiKey}`;
  const response = await axios.get(url);
  const data = response.data;
  if (data.status === "OK") {
    const location = data.results[0].geometry.location;
    return { lat: location.lat, lng: location.lng };
  } else {
    throw new Error("Error getting coordinates, Please enter a valid location");
  }
};

const isCoordinates = (location) => {
  // check if the location is in coordinates format or not
  return location.match(/^-?\d+\.\d+,-?\d+\.\d+$/);
};

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
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing start or end location",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let startCordinates = isCoordinates(start)
      ? start
      : await getCordinates(start);
    let endCordinates = startCordinates;
    if (start !== end) {
      endCordinates = isCoordinates(end) ? end : await getCordinates(end);
    }
    console.log("Start coordinates:", startCordinates);
    console.log("End coordinates:", endCordinates);

    // Get empty and full bins
    const fullBins = await Bin.find({ isFull: true, status: "full" });
    //get remaining bins which are not full or processing status
    const remainingBins = await Bin.find({
      status: { $in: ["empty", "processing"] },
    });

    if (fullBins.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          error: "No full bins or bins are in processing",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const waypoints = fullBins.map((bin) => ({
      location: { lat: bin.location.latitude, lng: bin.location.longitude },
      stopover: true,
    }));

    const routeData = {
      start: `${startCordinates.lat},${startCordinates.lng}`,
      end: `${endCordinates.lat},${endCordinates.lng}`,
      waypoints,
      remainingBins,
      fullBins,
    };

    return new Response(JSON.stringify({ success: true, data: routeData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("Error generating route:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// //fetch optimized route from Google Maps API with the waypoints , travel mode, i want to show them in DirectionsRenderer
// const apiKey = process.env.GOOGLE_MAPS_API_KEY;
// const directionsUrl = process.env.GOOGLE_MAPS_API_DIRECTIONS;
// const url = `${directionsUrl}?origin=${start}&destination=${end}&waypoints=optimize:true|${waypoints}&key=${apiKey}`;

// const response = await axios.get(url);
// // console.log("Route generated:", response.data);
// // Return the data as JSON

export async function POST(req) {
  try {
    const session = await getServerSession(req);

    if (!session || !session.user) {
      // Unauthorized if no session or user
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const { collectorId, binIds, start, end } = await req.json();
    if (!collectorId || !binIds || binIds.length === 0 || !start || !end) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid request, all fields are required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await dbConnect();
    // Step 1: Mark bins as "processing" and check if the all bins are full with the given ids and if not return an error
    const bins = await Bin.find({
      _id: { $in: binIds },
      isFull: true,
      status: "full",
    });
    if (bins.length !== binIds.length) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "All bins must be full or not in processing",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update bin status to "processing"
    await Bin.updateMany({ _id: { $in: binIds } }, { status: "processing" });

    // Step 2: Create a collector route entry
    const newRoute = new collectionRoute({
      collectorId,
      bins: binIds,
      start,
      end,
    });
    await newRoute.save();

    // Step 3: Create bin collection activities for each bin
    const collectionActivities = binIds.map((binId) => ({
      routeId: newRoute._id,
      collectorId,
      binId,
      status: "processing",
    }));
    await BinCollectionActivity.insertMany(collectionActivities);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Route created",
        route: newRoute,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log("Error creating route:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to create route" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
