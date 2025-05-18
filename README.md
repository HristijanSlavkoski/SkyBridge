# 🚑 SkyBridge Emergency Satellite System

This project allows emergency data to be submitted from a web application and transmitted via **satellite** using an **Arduino + Kineis KIM1** setup. It supports collecting and sending emergency type, GPS coordinates, and a potentiometer value to the **Verhaert Connect** platform.

---

## 📦 Requirements

- **Node.js v18.20.4**
- Arduino IDE (to flash the sketch)
- A connected Arduino board with:
  - Grove Starter Kit
  - Kineis KIM1 Satellite Module

---

## 📁 Folder Structure

SkyBridge/
├── client/ # React frontend using Vite
├── server/ # Node.js Express backend with TypeScript
├── arduino/ # Arduino sketch for satellite communication
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md

## 🚀 How to Run the Application
### 🐧 Linux / macOS

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/skybridge.git
cd skybridge
```
2. **Install dependencies:**
```bash
npm install
```
3. **Start the backend and frontend (in dev mode)**
```bash
npm run dev
```

### 🐧 Windows (Warning! Not fully tested)
Make sure package.json contains this script
```
"scripts": {
  "dev": "NODE_ENV=development tsx server/index.ts",
  "dev-win": "cross-env NODE_ENV=development tsx server/index.ts",
  ...
}
```
1. **Clone the repository:**
```bash
git clone https://github.com/your-username/skybridge.git
cd skybridge
```
2. **Install dependencies:**
```bash
npm install
```
3. **Start the backend and frontend (in dev mode)**
```bash
npm run dev-win
```

This command runs the Express API and serves the React frontend on port 5000This command runs the Express API and serves the React frontend on port 5000


## 🛰️ Arduino Setup

1. Open the sketch located at: `arduino/SkyBridge_Emergency_Sketch.ino`

2. Connect the following components:
   - Grove **potentiometer** to analog pin `A0`
   - Kineis **KIM1 satellite module** via UART (e.g., RX/TX)

3. Open the **Arduino IDE**:
   - Select your board (e.g., **Arduino Uno**)
   - Choose the correct **serial port**
   - Upload the sketch

4. Once uploaded:
   - **Close the Serial Monitor** so Node.js can access the serial port (e.g., `/dev/ttyUSB0` on Linux).

---

### 📡 Communication Format

The Arduino listens for messages sent from the Node.js backend in the following format:
```
EMERGENCY:<type>,<latitude>,<longitude>
```
Example:
```
EMERGENCY:2,42.0000,21.4300
```


Upon receiving this, the Arduino:
- Parses the emergency type and coordinates
- Reads the potentiometer value
- Sends the final payload over satellite via Kineis KIM1

---

## 📤 Payload Format

The final payload sent via satellite is exactly **10 bytes**, structured as:

| Byte Offset | Field            | Type   | Size (bytes) | Notes                          |
|-------------|------------------|--------|---------------|--------------------------------|
| 0           | Potentiometer     | uint8  | 1             | Mapped value (0–255)           |
| 1–4         | Latitude          | float  | 4             | IEEE 754, little-endian        |
| 5–8         | Longitude         | float  | 4             | IEEE 754, little-endian        |
| 9           | Emergency Type ID | uint8  | 1             | Integer value 1–5              |


> 🧪 The **potentiometer value** is included just to demonstrate integration with the Grove Starter Kit.
> It is not essential to the **location tracking** functionality, but serves as an example of extending the system with other sensors.
> The remaining payload (to meet 23 bytes for Kineis) is padded with `0x00`.

---

## 🧠 Verhaert ABCL Configuration

Paste the following **ABCL (Asset-Based Converter Language)** configuration into the **Verhaert Connect** dashboard for decoding:

```json
[
  {
    "asset": "potentiometer",
    "value": {
      "byte": 0,
      "bytelength": 1,
      "type": "integer",
      "signed": false
    }
  },
  {
    "asset": "latitude",
    "value": {
      "byte": 1,
      "bytelength": 4,
      "type": "float",
      "byteorder": "small"
    }
  },
  {
    "asset": "longitude",
    "value": {
      "byte": 5,
      "bytelength": 4,
      "type": "float",
      "byteorder": "small"
    }
  },
  {
    "asset": "emergencyType",
    "value": {
      "byte": 9,
      "bytelength": 1,
      "type": "integer",
      "signed": false
    }
  }
]
```
>⚠️ Make sure each asset is added as a Virtual Sensor with matching data type and parsing config.
>

References: https://github.com/allthingstalk/cassini-hackathons
