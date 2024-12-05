import dbConnect from "@/lib/dbConnect"; // MongoDB connection utility
import Bin from "@/models/bin";
import Collector from "@/models/collector";
import BinCollection from "@/models/binCollection";
import { getSession } from "next-auth/react";
import { getServerSession, unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PiArrowArcRight } from "react-icons/pi";

export async function GET(req, { params }) {
  try {

    const session = await getServerSession(req); // Only `req` and `authOptions`

    if (!session || !session.user) {
      // Unauthorized if no session or user
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    console.log(session.user);
    // Connect to the database
    await dbConnect();
    const collector = await Collector.findOne({email: session.user.email});
    // Fetch the total number of bins, collectors, bin collections and user collections
    const binCount = await Bin.countDocuments();
    const collectorCount = await Collector.countDocuments();
    const binCollectionCount = await BinCollection.countDocuments();
    const userCollectionsCount = await BinCollection.countDocuments({ collectorId: collector._id });
    // console.log(binCount , collectorCount , binCollectionCount, userCollectionsCount);

    const responseData = {
        bins: binCount,
        collectors: collectorCount,
        binCollections: binCollectionCount,
        userCollections: userCollectionsCount,
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
