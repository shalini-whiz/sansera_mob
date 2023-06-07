
import MQTT from 'sp-react-native-mqtt';
import { binMqttOptions } from "../../constants/urlConstants";
import AsyncStorage from '@react-native-async-storage/async-storage';

const pub_topic_format = (topic) => {
  return "MWPI2/" + topic + "/set/led1";
}
const devices = [
  '123', '341'
]


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
      console.log('pub connected' + props.topic);
      // let topic = pub_topic_format(props.topic)
      //console.log("publish topic here "+topic);
      AsyncStorage.getItem("racks").then(item => {
        let publishParams = {
          devID: item,
          data: "GB"
        }
        console.log("publishParams here " + JSON.stringify(publishParams))
        client.publish("GET_BAT_STS", JSON.stringify(publishParams), 2, false)
      })
      AsyncStorage.getItem("bins").then(item => {
        let publishParams = {
          devID: item,
          data: "GB"
        }
        console.log("publishParams here " + JSON.stringify(publishParams))
        client.publish("GET_BAT_STS", JSON.stringify(publishParams), 2, false)
      })
      client.disconnect()
    });

  }).catch((err) => {
    console.log("pub err : " + err);
  });

}

export default PubBatteryMqtt;
