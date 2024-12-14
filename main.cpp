#include <Arduino.h>
#include <WiFi.h>
#include <ESP32Servo.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_SSD1306.h>

const int redButtonPin = 14;
const int blueButtonPin = 12;
const int yellowButtonPin = 13;
const int redLED = 27;
const int blueLED = 26;
const int yellowLED = 25;
const int buzzerPin = 33;
const int servoPin = 18;
const int noMedicineLED = 32;

Servo myServo;

const char* ssid = "sudiksha";
const char* password = "password";

const String AWS_TIMESTAMP_URL = "https://your-api-id.execute-api.us-west-2.amazonaws.com/dev/timestamp";
const String AWS_ALARM_URL = "https://your-api-id.execute-api.us-west-2.amazonaws.com/dev/upcoming-alarms";
const String AWS_DISMISS_URL = "https://your-api-id.execute-api.us-west-2.amazonaws.com/dev/dismiss-alarm";

Adafruit_SSD1306 display(128, 64, &Wire, -1);  // Define OLED display

void setup() {
  Serial.begin(115200);
  pinMode(redButtonPin, INPUT_PULLUP);
  pinMode(blueButtonPin, INPUT_PULLUP);
  pinMode(yellowButtonPin, INPUT_PULLUP);
  pinMode(buzzerPin, OUTPUT);
  pinMode(noMedicineLED, OUTPUT);
  myServo.attach(servoPin);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi connected");

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {  // Corrected initialization
    Serial.println(F("SSD1306 allocation failed"));
    for (;;);
  }
  display.display();
  delay(2000); // Show welcome message for 2 seconds
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Welcome to Pill Pal AI. Press Red to setup alarm");
  display.display();
  delay(2000);

  digitalWrite(redLED, LOW);
  digitalWrite(blueLED, LOW);
  digitalWrite(yellowLED, LOW);
}

void loop() {
  if (digitalRead(redButtonPin) == LOW) {
    sendTimestampToAWS();
    digitalWrite(redLED, HIGH);
    displayMessage("Set Alarm for Timestamp");
    delay(500);
    digitalWrite(redLED, LOW);
  }

  if (digitalRead(blueButtonPin) == LOW) {
    getUpcomingAlarms();
    digitalWrite(blueLED, HIGH);
    displayMessage("Upcoming Alarms");
    delay(500);
    digitalWrite(blueLED, LOW);
  }

  if (digitalRead(yellowButtonPin) == LOW) {
    dismissAlarm();
    digitalWrite(yellowLED, HIGH);
    displayMessage("Alarm Dismissed");
    delay(500);
    digitalWrite(yellowLED, LOW);
  }

  if (isAlarmActive()) {
    if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { // Check for display init
      digitalWrite(buzzerPin, HIGH);
      displayMessage("Alarm Ringing. Press yellow button to snooze");
      rotateServo();
    } else {
      Serial.println(F("SSD1306 allocation failed"));
    }
  } else {
    digitalWrite(buzzerPin, LOW);
  }

  if (isNoMedicine()) {
    digitalWrite(noMedicineLED, HIGH);
  } else {
    digitalWrite(noMedicineLED, LOW);
  }

  delay(100);
}

void sendTimestampToAWS() {
  HTTPClient http;
  http.begin(AWS_TIMESTAMP_URL);
  http.addHeader("Content-Type", "application/json");
  String payload = "{\"timestamp\":\"" + String(millis()) + "\"}";
  int httpCode = http.POST(payload);
  if (httpCode > 0) {
    Serial.println("Alarm set.");
  } else {
    Serial.println("Error sending timestamp.");
  }
  http.end();
}

void getUpcomingAlarms() {
  HTTPClient http;
  http.begin(AWS_ALARM_URL);
  int httpCode = http.GET();
  if (httpCode > 0) {
    String payload = http.getString();
    Serial.println("Upcoming alarms:");
    Serial.println(payload);
  } else {
    Serial.println("Error getting alarms.");
  }
  http.end();
}

void dismissAlarm() {
  HTTPClient http;
  http.begin(AWS_DISMISS_URL);
  int httpCode = http.GET();
  if (httpCode > 0) {
    Serial.println("Alarm dismissed.");
  } else {
    Serial.println("Error dismissing alarm.");
  }
  http.end();
}

bool isAlarmActive() {
  return true; 
}

bool isNoMedicine() {
  return false; 
}

void rotateServo() {
  myServo.write(90);
  displayMessage("Dispensing medicine");
  delay(1000);
  myServo.write(0);
  delay(1000);
}

void displayMessage(String message) {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.setTextSize(1);
  display.println(message);
  display.display();
}
