import dbConnect from "@/lib/dbConnect";
import Bin from "@/models/bin";
import axios from "axios";

const getCordinates = async (location) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const geocodeUrl = process.env.GOOGLE_MAPS_API_GEOCODE;
  const url = `${geocodeUrl}?address=${location}&key=${apiKey}`;
  const response = await axios.get(url);
  const data = response.data;
  return data.results[0].geometry.location;
};
export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if(!start || !end) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing start or end location" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let startCordinates = await getCordinates(start);
    let endCordinates = startCordinates;
    if(start !== end) {
      endCordinates = await getCordinates(end);
    }
    // console.log("Start coordinates:", startCordinates);
    // console.log("End coordinates:", endCordinates);


    // Get empty and full bins
    const emptyBins = await Bin.find({ isFull: false });
    const fullBins = await Bin.find({ isFull: true });

    if (fullBins.length === 0) {
      return new Response(
        JSON.stringify({ success: true, error: "No full bins" }),
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
      start : `${startCordinates.lat},${startCordinates.lng}`,
      end : `${endCordinates.lat},${endCordinates.lng}`,
      waypoints,
      emptyBins,
      fullBins: fullBins,
    };

    return new Response(JSON.stringify({ success: true, data: routeData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating route:", error);
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
