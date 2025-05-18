/* 
Name:        Cassini Hackathons Example Sketch
Description: Send sensor data from Arduino to Verhaert Connect Platform via Kineis Satellite
Version:     0.5.9
Written by:  Vanja S.
Verhaert x AllThingsTalk x Kineis
Details:
 - Do not use pin number 4. This pin is used to power on/off the Kineis KIM1 module. On the grove starter kit, pin 4 is the LED, so you can observe it to figure if the KIM1 is on or off.
 - Do not break off the sensors from the Grove Starter Kit.
 - Make sure to reflect any payload changes in the ABCL Converter on the platform.
*/

#include <Wire.h>
#include "KIM_Arduino_Library.h"
#include <Grove_Temperature_And_Humidity_Sensor.h> // Install "Grove Temperature And Humidity Sensor" by Seeed Studio
#include <Seeed_BMP280.h> // Install "Grove - Barometer Sensor BMP280" by Seeed Studio

// Pin Definitions for sensors and actuators. Display, BMP280, DHT20 and Accelerometer are I2C.
#define BUZZER_PIN         5
#define BUTTON_PIN         6
#define POTENTIOMETER_PIN  A0
#define SOUND_SENSOR_PIN   A2
#define LIGHT_SENSOR_PIN   A6

// Kineis KIM1 AT Commands
char ID[2]   = "ID";
char FW[2]   = "FW";
char TX[2]   = "TX";
char PWR[3]  = "PWR";
char AFMT[4] = "AFMT";
char SAVE[8] = "SAVE_CFG";

// Variables
const long    kineisTransmissionInterval = 60;    // Seconds; How often to transmit sensor data
unsigned long kineisLastTransmissionTime = 0;     // Last time (in ms since boot) a transmission occured
const long    buttonPressIntervalLimit   = 5;    // Seconds; Minimum delay between button presses that force the data to be sent
unsigned long lastButtonPressTime        = 0;     // Last time (in ms since boot) the button was pressed
bool          bmp280initialized          = false;
bool          kim1initialized            = false;

SoftwareSerial kimSerial(RX_KIM, TX_KIM);
KIM kineis(&kimSerial);
BMP280 bmp280;
DHT dht(DHT20);


float lat = 0.0;
float lng = 0.0;
int emergencyType = 0;



byte readLightSensor() {
  byte value = analogRead(LIGHT_SENSOR_PIN);
  return map(value, 0, 300, 0, 255);
}

byte readSoundSensor() {
  long value = 0;
  for(int i=0; i<32; i++) {
    value += analogRead(SOUND_SENSOR_PIN);
  }
  value >>= 5;
  return map(value, 0, 400, 0, 255);
}

// Piezo buzzer beep with duration in milliseconds
void buzzerBeep(int duration) {
  for (int i=0; i<duration/4; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(2);
    digitalWrite(BUZZER_PIN, LOW);
    delay(2);
  }
}

bool readButton() {
  if (digitalRead(BUTTON_PIN) == HIGH) {
    return true;
  } else {
    return false;
  }
}

byte readPotentiometer() {
  int raw = analogRead(POTENTIOMETER_PIN);
  return map(raw, 0, 1023, 255, 0);
}

void readAndSendData() {
  Serial.println(F("System - Reading sensor data..."));
byte potentiometer = readPotentiometer();

  const int payloadSize = 10;
  const int hexPayloadSize = 47;
  byte payload[payloadSize];
  char hexPayload[hexPayloadSize];

  // Fill payload
  payload[0] = potentiometer;
  memcpy(&payload[1], &lat, 4);  // float is 4 bytes
  memcpy(&payload[5], &lng, 4);  // float is 4 bytes
  payload[9] = emergencyType;

  // Convert to hex string
  for (int i = 0; i < payloadSize; i++) {
    sprintf(&hexPayload[i * 2], "%02X", payload[i]);
  }
  for (int i = payloadSize * 2; i < hexPayloadSize; i++) {
    hexPayload[i] = '0';
  }
  hexPayload[hexPayloadSize - 1] = '\0';
  if (kim1initialized) {
    Serial.print(F("Kineis - Powering on KIM1 and attempting to send payload: "));
    Serial.println(hexPayload);
    kineis.KIM_powerON(true);
    delay(200);
    kineis.KIM_sendATCommandSet(TX, sizeof(TX), hexPayload, sizeof(hexPayload) - 1);
    delay(1000); // Wait for the KIM1 to finish transmission
    if (kineis.KIM_getState() == KIM_OK) {
      Serial.println(F("Kineis - Payload sent!"));
    } else {
      Serial.println(F("Kineis - Error!"));
      buzzerBeep(200);
    }
    Serial.println(F("Kineis - Powering off KIM1 Module."));
    kineis.KIM_powerON(false);
  } else {
    Serial.print(F("Kineis - KIM1 is not initialized or connected, so the following payload can't be sent: "));
    Serial.println(hexPayload);
  }
}

void initPeripherals() {
  // Initialize pins
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT);
  pinMode(POTENTIOMETER_PIN, INPUT);
  pinMode(LIGHT_SENSOR_PIN, INPUT);
  pinMode(SOUND_SENSOR_PIN, INPUT);

  // Initialize i2c
  Wire.begin();

  // Initialize BMP280 Pressure Sensor
  if (!bmp280.init()) {
    Serial.print(F("BMP280 - Failed to initialize sensor"));
    bmp280initialized = false;
  } else {
    Serial.println(F("BMP280 - Sensor initialized!"));
    bmp280initialized = true;
  }

  // Initialize DHT20 Sensor
  dht.begin();
}

bool initKineis() {
  Serial.println(F("Kineis - Powering up Kineis Satellite Connectivity Module..."));
  kineis.KIM_powerON(true);
  kineis.KIM_userWakeupPinToggle();
  if (kineis.KIM_check()) {
    Serial.println(F("Kineis - Success! Module is connected. Reading configuration..."));
  } else {
    Serial.println(F("Kineis - Power up failed. Make sure the Kineis SPP (KIM1) Module is connected and the wiring is correct. Booting without the KIM1 Module."));
    kim1initialized = false;
    buzzerBeep(1000);
    delay(500);
    buzzerBeep(1000);
    return false;
	}
	Serial.print(F("Kineis - Module ID: "));
	Serial.println(kineis.KIM_sendATCommandGet(ID, sizeof(ID)));
	Serial.print(F("Kineis - Module Firmware: "));
	Serial.println(kineis.KIM_sendATCommandGet(FW, sizeof(FW)));
 	// Set Format frame configuration.
  Serial.println(F("Kineis - Setting frame format..."));
  kineis.KIM_sendATCommandSet(AFMT, sizeof(AFMT), "1,16,32", sizeof("1,16,32") );
  Serial.print(F("Kineis - Frame Format: "));
  Serial.println(kineis.KIM_sendATCommandGet(AFMT, sizeof(AFMT)));
  /* Set TX configuration */
  kineis.KIM_sendATCommandSet(PWR, sizeof(PWR), "1000", sizeof("1000") - 1);
  Serial.print(F("Kineis - Transmission Power: "));
  Serial.println(kineis.KIM_sendATCommandGet(PWR, sizeof(PWR)));
  /* Save configuration */
  kineis.KIM_sendATCommandSet(SAVE, sizeof(SAVE), "", sizeof("") );
  kim1initialized = true;
  return true;
}

void setup() {
  Serial.begin(9600);
  delay(200);
  Serial.println(F("System - Booting..."));
  initPeripherals();
  initKineis();
  Serial.println(F("System - Kineis and Peripherals initialization done."));
}

void loop() {
  if (Serial.available()) {
  String input = Serial.readStringUntil('\n');
  
  if (input.startsWith("EMERGENCY:")) {
    int firstComma = input.indexOf(',');
    int secondComma = input.indexOf(',', firstComma + 1);
    String typeStr = input.substring(10, firstComma);
    String latStr = input.substring(firstComma + 1, secondComma);
    String lngStr = input.substring(secondComma + 1);

    emergencyType = typeStr.toInt();  // assign to global
    lat = latStr.toFloat();           // assign to global
    lng = lngStr.toFloat();           // assign to global


    Serial.print("🆘 Emergency Type: "); Serial.println(emergencyType);
    Serial.print("📍 Latitude: "); Serial.println(lat);
    Serial.print("📍 Longitude: "); Serial.println(lng);

    // Immediately trigger satellite send
    readAndSendData();
  }
  }

  // if (millis() - kineisLastTransmissionTime >= kineisTransmissionInterval * 1000) {
  //   readAndSendData();
  //   kineisLastTransmissionTime = millis();
  // }
  // if (readButton() && millis() - lastButtonPressTime >= buttonPressIntervalLimit * 1000) {
  //   Serial.println("Button - Pressed");
  //   buzzerBeep(50);
  //   readAndSendData();
  //   kineisLastTransmissionTime = millis();
  //   lastButtonPressTime = millis();
  // }
}
