const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("express");
const upload = multer({ dest: "uploads/" });
const cors = require("cors");
const app = express();
app.use(
  cors({
    origin: "*",
  })
);

const PORT = process.env.PORT || 3000;
// Middleware to handle JSON parsing
app.use(express.json());

// Create a directory for files if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads/android");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
const iosUploadsDir = path.join(__dirname, "uploads/ios");
if (!fs.existsSync(iosUploadsDir)) {
  fs.mkdirSync(iosUploadsDir);
}
const localesUploadsDir = path.join(__dirname, "uploads/locales/locales");
if (!fs.existsSync(iosUploadsDir)) {
  fs.mkdirSync(iosUploadsDir);
}

// Route to serve the config file
app.get("/files/hyperswitch/release-config.json", (req, res) => {
  try {
    console.log("called");
    const configPath = path.join(__dirname, "config.json");
    const configData = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configData);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Failed to load configuration" });
  }
});


app.get("/files/hyperswitch/ios/release-config.json", (req, res) => {
  try {
    console.log("called ios release bundle");
    const configPath = path.join(__dirname, "ios-config.json");
    const configData = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configData);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Failed to load configuration" });
  }
});

// Route to list all files in the uploads directory
app.get("/files", (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const fileList = files.map((file) => {
      const stats = fs.statSync(path.join(uploadsDir, file));
      return {
        name: file,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      };
    });
    console.log(fileList);
    res.json(fileList);
  } catch (error) {
    res.status(500).json({ error: "Failed to list files" });
  }
});

// Route to download a specific file
app.get("/files/android/:filename", (req, res) => {
  try {
    const filePath = path.join(uploadsDir, req.params.filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Send the file
    console.log(filePath);
    res.download(filePath);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to download file" });
  }
});
app.get("/files/locale/:localeName", (req, res) => {
  try {
    const filePath = path.join(localesUploadsDir, req.params.localeName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Send the file
    console.log(filePath);
    res.download(filePath);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to download file" });
  }
});


app.get("/files/ios/:filename", (req, res) => {
  try {
    const filePath = path.join(iosUploadsDir, req.params.filename);
    // Check if file exists
    console.log("file called from ios folder", filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
    // Send the file
    res.download(filePath);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to download file" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Android Files are being served from: ${uploadsDir}`);
  console.log(`IOS Files are being served from: ${iosUploadsDir}`);
});
