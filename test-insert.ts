import { db } from "./src/db/index";
import { documents } from "./src/db/schema";
import { crypto } from "crypto";

async function main() {
  try {
    const fileUrl = "https://example.com/test.jpeg";
    const fileName = "test-file-name.jpeg";
    
    await db.insert(documents).values([{
        id: "12345-test",
        fileName,
        fileUrl,
        status: "PENDING",
    }]);

    const docs = await db.query.documents.findMany({
        where: (documents, { eq }) => eq(documents.id, "12345-test")
    });
    console.log("Inserted docs:", docs);
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
main();
