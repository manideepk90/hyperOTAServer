# HyperOTA Server

A Node.js server for serving Over-The-Air (OTA) updates and configurations for mobile applications.

## Features

- Serves configuration files for Android and iOS apps
- Version-based configuration management
- File upload and download capabilities
- CORS enabled for cross-origin requests
- Automatic network interface detection

## Installation

```bash
npm install
# or
yarn install
```

## Running the Server

```bash
node server.js
```

The server will start on port 3000 (or the port specified in the PORT environment variable) and display all available network interfaces.

## API Endpoints

### Configuration Endpoints

#### Android Configuration

- **GET** `/mobile-ota/android/:version/config.json`
  - Returns configuration for the specified Android app version
  - Example: `/mobile-ota/android/1.0.0/config.json`

#### iOS Configuration

- **GET** `/mobile-ota/ios/:version/config.json`
  - Returns configuration for the specified iOS app version
  - Example: `/mobile-ota/ios/2.0.0/config.json`

### File Management Endpoints

#### List Files

- **GET** `/files` - Lists all files in the Android uploads directory

#### Download Files

- **GET** `/files/android/:filename` - Download a specific Android file
- **GET** `/files/ios/:filename` - Download a specific iOS file
- **GET** `/files/locale/:localeName` - Download a specific locale file

## Version-Based Configuration System

The server supports serving different configurations based on the app version. It follows this priority order:

1. **Version-specific config**: `ota/{version}/config.json`
2. **Default config**: `ota/default/config.json`
3. **Fallback config**:
   - Android: `config.json`
   - iOS: `ios-config2.json`

### Directory Structure

```
hyperOTAServer/
├── server.js
├── package.json
├── config.json              # Fallback config for Android
├── ios-config2.json         # Fallback config for iOS
├── ota/                     # Version-based configs
│   ├── 1.0.0/
│   │   └── config.json
│   ├── 2.0.0/
│   │   └── config.json
│   └── default/
│       └── config.json
└── uploads/
    ├── android/
    ├── ios/
    └── locales/
```

### Configuration Examples

#### Version-specific configuration

When a client requests `/mobile-ota/ios/1.0.0/config.json`, the server will:

1. First look for `ota/1.0.0/config.json`
2. If not found, check `ota/default/config.json`
3. If still not found, use `ios-config2.json`

#### Setting up configurations

1. Create version-specific folders in the `ota` directory:

   ```bash
   mkdir -p ota/1.0.0
   mkdir -p ota/2.0.0
   mkdir -p ota/default
   ```

2. Place your `config.json` files in the appropriate folders

3. The server will automatically serve the correct configuration based on the requested version

### Example Configuration File

```json
{
  "version": "2",
  "config": {
    "version": "v2",
    "release_config_timeout": 2000,
    "boot_timeout": 2000,
    "properties": {}
  },
  "package": {
    "name": "Hyperswitch_SDK",
    "version": "v2",
    "properties": {
      "manifest": {},
      "manifest_hash": {}
    },
    "index": {
      "url": "http://localhost:3000/files/android/bundle-v1-android.zip",
      "filePath": "hyperswitch.bundle"
    },
    "important": [],
    "lazy": []
  },
  "resources": []
}
```

## Logging

The server logs:

- Startup information including all available network interfaces
- Which configuration file is being served for each request
- File access attempts and errors

## CORS Configuration

The server is configured to accept requests from any origin (`*`). Modify the CORS settings in `server.js` if you need to restrict access to specific domains.

## Environment Variables

- `PORT`: Server port (default: 3000)

## Error Handling

All endpoints include error handling and will return appropriate HTTP status codes:

- `404`: File or configuration not found
- `500`: Server error (e.g., failed to read configuration file)
