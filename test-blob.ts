import { put } from "@vercel/blob";

async function main() {
  try {
    const blob = await put("test.txt", "Hello World", { access: "public" });
    console.log("Blob returned:", blob);
  } catch (err) {
    console.error("Error:", err);
  }
}
main();
