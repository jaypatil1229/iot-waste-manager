import dbConnect from "@/lib/dbConnect";
import Collector from "@/models/collector";

export async function GET(req) {
  try {
    // Connect to the database
    await dbConnect();

    // Fetch collectors who are not admins
    const collectors = await Collector.find({ isAdmin: false });

    // Return the data as JSON
    return new Response(JSON.stringify({ success: true, data: collectors }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching collectors:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to fetch collectors" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
export async function POST(req) {
  try {
    await dbConnect();
    const { name, email, password, city } = await req.json();
    console.log(name, email, password, city);
    if (!name || !email || !password || !city) {
      console.log("not all field are there")
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("valid data")

    // Check if the email already exists
    const existingCollector = await Collector.findOne({ email });
    if (existingCollector) {
      return new Response(
        JSON.stringify({ error: "Collector with this email already exists" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("no previous user")

    // Create new collector
    const newCollector = await Collector.create({
      name,
      email,
      city,
      password,
      isAdmin: false, // Default to non-admin
    });

    console.log("New collector created")
    return new Response(JSON.stringify(newCollector), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating collector:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}