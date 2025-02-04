import { getServerSession } from "next-auth";

import dbConnect from "@/lib/dbConnect";
import Bin from "@/models/bin";
import Collector from "@/models/collector";
import BinCollectionActivity from "@/models/binCollectionActivity";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(req); // Only `req` and `authOptions`

    if (!session || !session.user) {
      // Unauthorized if no session or user
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    console.log(session.user);
    // Connect to the database
    await dbConnect();
    const collector = await Collector.findOne({ email: session.user.email });
    // Fetch the total number of bins, collectors, bin collections and user collections
    const binCount = await Bin.countDocuments();
    const collectorCount = await Collector.countDocuments();
    const collectionsCount = await BinCollectionActivity.countDocuments({
      status: "collected",
    });
    const userCollectionsCount = await BinCollectionActivity.countDocuments({
      collectorId: collector._id,
      status: "collected",
    });

    const responseData = {
      bins: binCount,
      collectors: collectorCount,
      binCollections: collectionsCount,
      userCollections: userCollectionsCount,
    };

    console.log("Response Data:", responseData);

    // Create a new Response object and return JSON data
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Data not found." }), {
      status: 404,
    });
  }
}
