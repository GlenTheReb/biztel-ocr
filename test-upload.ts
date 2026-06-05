import fs from 'fs';

async function main() {
  try {
    const formData = new FormData();
    // I will read the artifact image
    const buffer = fs.readFileSync("C:/Users/glent/.gemini/antigravity-ide/brain/96b923ee-d1b8-47fc-93c3-862d6365d010/media__1780607304732.jpg");
    const file = new File([buffer], "test_image.jpg", { type: "image/jpeg" });
    
    formData.append("file", file);

    const response = await fetch("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData
    });
    
    const result = await response.json();
    console.log("Upload result:", result);
  } catch (err) {
    console.error("Error:", err);
  }
}
main();
