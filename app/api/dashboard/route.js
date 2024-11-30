import dbConnect from "@/lib/dbConnect"; // MongoDB connection utility
import Bin from "@/models/bin";
import Collector from "@/models/collector";
import BinCollection from "@/models/binCollection";

export async function GET(req, { params }) {
  try {
    // Connect to the database
    await dbConnect();

    // Fetch the total number of bins, collectors, and bin collections
    const binCount = await Bin.countDocuments();
    const collectorCount = await Collector.countDocuments();
    const binCollectionCount = await BinCollection.countDocuments();
    // console.log(binCount , collectorCount , binCollectionCount);

    const responseData = {
        bins: binCount,
        collectors: collectorCount,
        binCollections: binCollectionCount,
      };
      
      console.log('Response Data:', responseData);
  
      // Create a new Response object and return JSON data
      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Data not found." }), {
        status: 404,
      });
  }
}
