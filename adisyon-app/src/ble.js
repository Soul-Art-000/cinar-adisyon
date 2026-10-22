import { BleClient } from '@capacitor-community/bluetooth-le';

const ESP32_SERVICE = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const ESP32_CHAR = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

export let connectedDeviceId = null;
let onMessageCallback = null;

export const setBleCallback = (cb) => {
  onMessageCallback = cb;
};

export const connectBle = async () => {
  try {
    await BleClient.initialize();
    const device = await BleClient.requestDevice({
      services: [ESP32_SERVICE],
      optionalServices: []
    });
    
    await BleClient.connect(device.deviceId);
    connectedDeviceId = device.deviceId;
    
    await BleClient.startNotifications(
      connectedDeviceId,
      ESP32_SERVICE,
      ESP32_CHAR,
      (value) => {
        try {
          const text = new TextDecoder().decode(value.buffer);
          console.log("BLE Received:", text);
          if (onMessageCallback) onMessageCallback(JSON.parse(text));
        } catch(e) {
          console.error("BLE Decode Error", e);
        }
      }
    );
    return true;
  } catch (err) {
    console.error("BLE Connect Error:", err);
    alert("Bluetooth Bağlantı Hatası: " + err.message);
    return false;
  }
};

export const sendBleMessage = async (msgObj) => {
  if (!connectedDeviceId) return false;
  try {
    const dataStr = JSON.stringify(msgObj);
    const buffer = new TextEncoder().encode(dataStr).buffer;
    const dataView = new DataView(buffer);
    await BleClient.write(connectedDeviceId, ESP32_SERVICE, ESP32_CHAR, dataView);
    return true;
  } catch (err) {
    console.error("BLE Write Error:", err);
    return false;
  }
};
