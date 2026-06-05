import { db } from "./src/db/index";
import { documents } from "./src/db/schema";
import { desc } from "drizzle-orm";

async function main() {
  const docs = await db.select({
    id: documents.id,
    fileName: documents.fileName,
    fileUrl: documents.fileUrl,
    uploadDate: documents.uploadDate
  }).from(documents).orderBy(desc(documents.uploadDate)).limit(5);
  
  console.log(JSON.stringify(docs, null, 2));
  process.exit(0);
}
main();
