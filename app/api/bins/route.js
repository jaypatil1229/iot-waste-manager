import dbConnect from "@/lib/dbConnect";
import Bin from "@/models/bin";
import Collector from "@/models/collector";
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
    return { latitude: location.lat, longitude: location.lng };
  } else {
    throw new Error("Error getting coordinates, Please enter a valid location");
  }
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
    // Connect to the database
    await dbConnect();

    // Fetch collectors who are not admins
    const bins = await Bin.find();

    // Sort bins by `isFill` using a custom sorting function
    const sortedBins = bins.sort((a, b) => b.isFull - a.isFull);

    // Return the data as JSON
    return new Response(JSON.stringify({ success: true, data: sortedBins }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching bins:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to fetch bins" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
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

    const { binId, pin, capacity, defaultCity, cityAddress } = await req.json();
    if (!binId || !pin || !capacity || !defaultCity) {
      console.log("not all field are there");
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if the email already exists
    const existingBin = await Bin.findOne({ binId });
    if (existingBin) {
      return new Response(
        JSON.stringify({ error: "Bin with this id already exists" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const location = await getCordinates(cityAddress || defaultCity);
    // Create new collector
    const newBin = await Bin.create({
      binId,
      pin,
      capacity,
      defaultCity,
      isFull: false,
      location,
    });

    console.log("New Bin created");
    return new Response(JSON.stringify(newBin), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating bin:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
