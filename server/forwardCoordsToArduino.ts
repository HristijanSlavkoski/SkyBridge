import { SerialPort } from "serialport";
import { existsSync } from "fs";

const path = "/dev/ttyUSB1";

let arduinoPort: SerialPort | null = null;

if (existsSync(path)) {
    arduinoPort = new SerialPort({ path, baudRate: 9600 }, (err) => {
        if (err) {
            console.error("❌ Failed to open serial port:", err.message);
        } else {
            console.log(`✅ Serial connection opened at ${path}`);
        }
    });
} else {
    console.warn(`⚠️ Serial port ${path} not found. Arduino might not be connected.`);
}

// ✅ Only use the single `arduinoPort` to send messages
export function forwardMessageToArduino(message: string) {
    const finalMessage = message.trim() + "\n";
    if (arduinoPort?.writable) {
        arduinoPort.write(finalMessage, (err) => {
            if (err) {
                console.error("❌ Error writing to Arduino:", err.message);
            } else {
                console.log("✅ Sent to Arduino:", finalMessage);
            }
        });
    } else {
        console.warn("⚠️ Arduino serial port not writable.");
    }
}

export function forwardCoordsToArduino(lat: number, lng: number, id: number) {
    const payload = `EMERGENCY:${id},${lat},${lng}\n`;
    arduinoPort?.write(payload, (err) => {
        if (err) {
            console.error("❌ Failed to send to Arduino:", err.message);
        } else {
            console.log("✅ Sent to Arduino:", payload);
        }
    });
}

