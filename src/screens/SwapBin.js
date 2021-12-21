import React,{Component} from 'react';
import { Text, View, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import TopBar from './TopBar';
import init from 'react_native_mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MQTT from 'sp-react-native-mqtt';
import { appTheme } from "../lib/Themes";

var mqtt = require('@taoqf/react-native-mqtt');

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: {
  }
});


//Set up an in-memory alternative to global localStorage
const myStorage = {
  setItem: (key, item) => {
    myStorage[key] = item;
  },
  getItem: (key) => myStorage[key],
  removeItem: (key) => {
    delete myStorage[key];
  },
};

export default class SwapBin extends Component  {

  constructor(props) {
    super(props);
    this.state = {
      text: ['...'],
      client:true,
      dialog:false,
      title:"",
      message:"",
      connectionStatus:0
    };
  }

 
  componentDidMount() {
    let { client } = this.state
    

   

  // let mOptions = {
  //   username: server_user, password: server_pass,
  //   protocol: 'mqtt', 
  //   clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  //   rejectUnauthorized: false,
  //   protocolId: 'mqtt',
  //   defaultProtocol:"mqtt",
  //   protocolVersion: 4,
  //   clean:false
  // }
   
    //console.log("mOptions here : "+JSON.stringify(mOptions))
    // let mUrl = "mqtt://" + host + ":" + port;
    // console.log(mUrl)
    
    // var client1 = mqtt.connect(mUrl,mOptions);
    // console.log(client1)
    // client1.on('connect', function () {
    //   console.log("client1 connected");
    //   client1.subscribe(topicN, function (err) {
    //     if (!err) {
    //       client1.publish(topicN, 'Hello mqtt')
    //     }
    //   })
    // })

    // client1.on('message', function (topic, message) {
    //   console.log("client1 message : "+message.toString()+" ... "+topic)
    //   //client1.end()
    // })

    // client1.on('error', function ( message) {
    //   console.log("client1 err : " + message.toString())
    //   //client1.end()
    // })


    

  

  }
  
  startLoading = () => {
    let host = "mqtt.meti.in";
    let port = 1884;
    let protocol = "mqtt";
    let server_user = "quickiot_wd";
    let server_pass = "whiz1234!";
    let mqttURL = protocol + "://" + host + ":" + port;
    let clientId = "clientId";
    let topicN = 'MWPI2/topicA';

    console.log(mqttURL)

    let options = {
      uri: mqttURL,
      clientId: clientId,
      user: server_user,
      pass: server_pass,
      auth: true,
      keepalive: 60
    }
    console.log("options here " + JSON.stringify(options))
    MQTT.createClient(options).then((client) => {
      this.setState({ client: client })
      client.connect();

      client.on('closed', () => {
        console.log('mqtt.event.closed');
        this.setState({ dialog: true, "title": 'MQTT Status', "message": 'connection closed', connectionStatus: 0 });
      });

      client.on('error', (msg) => {
        console.log('mqtt.event.error', msg);
        this.setState({ dialog: true, title: 'MQTT Status', message: msg });

      });

      client.on('message', (msg) => {
        console.log('mqtt.event.message', msg);
        this.setState({ dialog: true, title: 'MQTT Message', message: JSON.stringify(msg) });
      });

      client.on('connect', () => {
        console.log('connected');
        console.log(topicN);
        client.subscribe(topicN, 2);
        this.setState({ title: 'MQTT Status', message: 'connected', connectionStatus: 1 });
        client.publish('MWPI1/48-06-AB-0D/set/led1','3,5',2,true);
        client.publish('MWPI1/48-06-B2-1B/set/led1', '3,5', 2, true)

        //client.publish(topicN, "test1234", 2, true);

      });
      this.state = ({ "client": client })

    }).catch((err) => {
      console.log(err);
      this.setState({ dialog: true, title: 'MQTT Error', message: err, connectionStatus: 2 });
    });
  }
  stopLoading = () => {
    let {client } = this.state
    client.disconnect();
    this.setState({connectionStatus:0,client:undefined})

  }
  pushText = entry => {
    const { text } = this.state;
    this.setState({ text: [...text, entry] });
  };

  showDialog = (title, message) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          onPress: () => this.setState({dialog:false,title:"",message:""}),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => this.setState({ dialog: false, title: "", message: "" }) },
      ]
    );
  }

  render() {
    const { text,client,dialog,title,message,connectionStatus } = this.state;
    console.log(connectionStatus)
    return (
        <View style={{ flex: 1}}>
          {/* {connectionStatus === 0 ? <Text style={{textAlign:'center',fontSize:22,backgroundColor:'orange',color:'white'}}>Connecting</Text> : false} */}
          {connectionStatus === 1? <Text style={{textAlign:'center',fontSize:22,backgroundColor:'green',color:'white'}}>Connected</Text> :  false}
          {connectionStatus === 2 ? <Text style={{textAlign:'center',fontSize:22,backgroundColor:'red',color:'white'}}> Connection Lost </Text> :false}
          
          <View style={{alignContent:'center',alignItems:'center',alignSelf:'center',justifyContent:'center',flex:1}}> 
          <Text style={{textAlign:'center'}}>Swap Bin Screen</Text>
            {text.map((entry,index) => <Text key={index}>{entry}</Text>)}
            {dialog ? this.showDialog(title,message) : false}
          {connectionStatus === 0 ? <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableOpacity style={[styles.successBtn, { flexDirection: 'row' }]} onPress={(e) => this.startLoading(e)} >
              <Text style={styles.successText}>Start loading</Text>
            </TouchableOpacity>
            
          </View> : false}

          {connectionStatus === 1 ? <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableOpacity style={[styles.successBtn, { flexDirection: 'row' }]} onPress={(e) => this.stopLoading(e)} >
              <Text style={styles.successText}>Stop loading</Text>
            </TouchableOpacity>

          </View> : false}
          </View>
        </View>
      );
  }
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    margin: 20
  },
  successBtn: {
    width: "40%",
    borderRadius: 25,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    backgroundColor: appTheme.colors.warnAction,
  },
  successText: {
    color: appTheme.colors.warnActionTxt
  },


  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: "bold"
  },

});