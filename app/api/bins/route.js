import dbConnect from "@/lib/dbConnect";
import Bin from "@/models/bin";
import axios from "axios";

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
    await dbConnect();
    const { binId, pin, capacity, defaultCity, cityAddress } = await req.json();
    console.log(binId, pin, capacity, defaultCity, cityAddress);
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
