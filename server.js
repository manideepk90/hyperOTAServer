const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const cors = require("cors");
const os = require("os");
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
app.get("/mobile-ota/android/:version/config.json", (req, res) => {
  try {
    console.log("called android release bundle");
    const configPath = path.join(__dirname, "config.json");
    const configData = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configData);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Failed to load configuration" });
  }
});


app.get("/mobile-ota/ios/:version/config.json", (req, res) => {
  try {
    const version = req.params.version;
    console.log("called ios release bundle, version:", version);
    const configPath = path.join(__dirname, "ios-config2.json");
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
    console.log("called file")
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

// Route to download android file a specific file
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


// Route to serve locale

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

// Function to get network interfaces
function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        addresses.push({
          name: name,
          address: interface.address
        });
      }
    }
  }
  
  return addresses;
}

// Start the server on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log('Server is running and accessible at:');
  console.log('-'.repeat(60));
  
  // Show localhost URL
  console.log(`Local:    http://localhost:${PORT}`);
  
  // Show network URLs
  const networkInterfaces = getNetworkInterfaces();
  if (networkInterfaces.length > 0) {
    console.log('Network:');
    networkInterfaces.forEach(({ name, address }) => {
      console.log(`  - http://${address}:${PORT} (${name})`);
    });
  }
  
  console.log('-'.repeat(60));
  console.log('File directories:');
  console.log(`Android:  ${uploadsDir}`);
  console.log(`iOS:      ${iosUploadsDir}`);
  console.log('='.repeat(60));
});
