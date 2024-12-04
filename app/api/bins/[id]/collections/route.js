import dbConnect from "@/lib/dbConnect";
import Bin from "@/models/bin";
import BinCollection from "@/models/binCollection";
import Collector from "@/models/collector";
export async function GET(req, { params }) {
  try {
    // Connect to the database
    await dbConnect();

    const { id } = await params; // Assuming 'id' is a string (e.g., '1236')
    const bin = await Bin.find({binId : id});

    if(!bin){
        return new Response(JSON.stringify({ message: "Bin not found" }), {
          status: 404,
        });
    }

    // Fetch bin collection records using the ObjectId
    const collections = await BinCollection.find({ binId: bin._id });
    // Return the collection data as JSON
    return new Response(JSON.stringify({ success: true, data: collections }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching bin collections:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to fetch collections" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
export async function POST(req) {
  try {
    // const session = await getSession({ req });
    // console.log("Session in API:", session);
    // if (!session) {
    //   return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    // }

    const { binId, collectorId } = await req.json();
    const bin = await Bin.findById(binId);
    if (!bin) {
      return new Response(JSON.stringify({ message: "Bin not found" }), {
        status: 404,
      });
    }
    const collector = await Collector.findById(collectorId);
    if (!collector) {
      return new Response(JSON.stringify({ message: "Collector not found" }), {
        status: 404,
      });
    }

    // Create a new BinCollection record
    const binCollection = new BinCollection({
      binId: bin._id,
      collectorId: collectorId, // Assuming `session.user.id` has the collector's ID
      status: "Collected", // Set status to pending initially
      collectedAt: new Date(),
    });

    await binCollection.save();

    // Update bin status to pending
    bin.isFull = false;
    await bin.save();
    collector.binsCollected = collector.binsCollected ? collector.binsCollected + 1 : 1;
    await collector.save();


   

    // Return a success response
    return new Response(
      JSON.stringify({
        message: "Bin collection request created successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error collecting bin:", error);
    return new Response(JSON.stringify({ message: "Something went wrong." }), {
      status: 500,
    });
  }
}
