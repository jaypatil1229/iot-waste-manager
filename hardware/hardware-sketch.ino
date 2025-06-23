#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>

// WiFi credentials
const char* ssid = "peace";
const char* password = "RadheKrishna1229";

// Define pins for the ultrasonic sensor
#define TRIG_PIN 12
#define ECHO_PIN 4


// GPS module pins
#define RXD2 16            // GPS TX to ESP32 RX
#define TXD2 17            // GPS RX to ESP32 TX
HardwareSerial neogps(1);  // Using Serial1 for GPS communication
TinyGPSPlus gps;           // Create a TinyGPS++ object

// Variables for ultrasonic sensor
long duration;
float distance;

// URL and bin ID
const String baseUrl = "https://iot-waste-manager.onrender.com/api/bins";
const String binId = "1236";

void setup() {
  // Initialize Serial Monitor
  Serial.begin(115200);

  // Configure ultrasonic sensor pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // Initialize GPS module communication
  neogps.begin(9600, SERIAL_8N1, RXD2, TXD2);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("connecting...");
  }
  Serial.println("\nWiFi connected!");
}

void loop() {
  // Measure distance using ultrasonic sensor
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Measure the time taken for the Echo pin to go HIGH
  duration = pulseIn(ECHO_PIN, HIGH);


  // Calculate the distance in centimeters
  distance = (duration * 0.0343) / 2;

  // Print the distance to the Serial Monitor
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  //If the distance is less than 10 cm, send POST request with GPS data
  if (distance < 10.0) {
    Serial.println("Distance is less than 10 cm. Sending POST request with location...");
    sendPostRequest(true);
  } else {
    Serial.println("Distance is greater than 10 cm. Sending POST request without location...");
    sendPostRequest(false);
  }

  // Delay for 5 seconds before the next measurement
  delay(2000);
}

void sendPostRequest(bool isFull) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Construct the full URL
    String url = baseUrl + "/" + binId;

    // Begin HTTP request
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    // Prepare GPS data
    String latitude = "null";
    String longitude = "null";
    String status = "";
    if (isFull == true) {
      status = "full";
    } else {
      status = "empty";
    }

    // Read GPS data
    while (neogps.available()) {
      char c = neogps.read();
      if (gps.encode(c)) {
        if (gps.location.isValid()) {
          latitude = String(gps.location.lat(), 6);
          longitude = String(gps.location.lng(), 6);
          break;
        } else {
          Serial.println("Invalid GPS");
        }
      }
    }

    // Prepare JSON payload
    String payload = "{\"isFull\": " + String(isFull ? "true" : "false") + 
                 ", \"latitude\": \"" + latitude + "\"" + 
                 ", \"longitude\": \"" + longitude + "\"" + 
                 ", \"fromBin\": \"" + binId + "\"" + 
                 ", \"status\": \"" + status + "\"}";

    Serial.print("Sending payload: ");
    Serial.println(payload);

    // Send POST request
    int httpResponseCode = http.POST(payload);

    // Print HTTP response code and response
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.print("Response: ");
      Serial.println(response);
    } else {
      Serial.print("Error in HTTP request: ");
      Serial.println(http.errorToString(httpResponseCode).c_str());
    }

    // End HTTP request
    http.end();
  } else {
    Serial.println("WiFi not connected. Unable to send POST request.");
  }
}