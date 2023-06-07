
import MQTT from 'sp-react-native-mqtt';
import { binMqttOptions } from "../../constants/urlConstants";
import AsyncStorage from '@react-native-async-storage/async-storage';




const PubBatteryMqtt = (props) => {
  let options = { ...binMqttOptions }
  options.clientId = "pubclientId" + Date.now()
  console.log(options)
  MQTT.createClient(options).then((client) => {
    client.connect();

    client.on('closed', () => {
      console.log('mqtt.event.closed');
    });

    client.on('error', (msg) => {
      console.log('bin mqtt.event.error', msg);
    });

    client.on('message', (msg) => {
      console.log('mqtt.event.message', msg);
    });

    client.on('connect', () => {

      AsyncStorage.getItem("devices").then(devices => {
        console.log("devices here 123 " + JSON.parse(devices))
        JSON.parse(devices).map(item => {
          console.log("device here " + item)

          let publishParams = {
            devID: item,
            data: "GB"
          }
          console.log("devices publishParams here " + JSON.stringify(publishParams))
          client.publish("GET_BAT_STS", JSON.stringify(publishParams), 2, false)
        })
      })
      client.disconnect()
    });

  }).catch((err) => {
    console.log("pub err : " + err);
  });

}

export default PubBatteryMqtt;
