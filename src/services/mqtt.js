import mqtt from "mqtt";

const MQTT_URL = "wss://broker.emqx.io:8084/mqtt";

const client = mqtt.connect(MQTT_URL, {
  keepalive: 60,
  reconnectPeriod: 2000,
  clean: true,
  connectTimeout: 10000,
});

client.on("connect", () => {
  console.log("MQTT Connected");
});

client.on("reconnect", () => {
  console.log("MQTT Reconnecting...");
});

client.on("error", (err) => {
  console.log("MQTT Error:", err);
});

client.on("close", () => {
  console.log("MQTT Disconnected");
});

export default client;