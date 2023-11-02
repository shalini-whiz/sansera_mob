const mqtt = require('mqtt');

//mqtt credentials

const login = {
  username: 'mqtt',

  password: 'mqtt2022',

  clean: true,

  connectTimeout: 4000,
};

const client = mqtt.connect('mqtt://203.129.243.94:1883', login);

//console.log('Connected to MQTT broker');

const SP = [
  //add the device ids's

  //Bins

  {devID: 'EB1222053ED1', data: 'SW'}, // 1

  {devID: 'D2E9053B2BD8', data: 'SW'}, // 2
  
  {devID: 'D2E9053B2BD8', data: 'SW'}, // 3
  {devID: 'E87928D368C4', data: 'SW'}, // 4
  {devID: '875D47DCCAE9', data: 'SW'}, // 5
  // {devID: '48-06-AE-01i', data: 'SW'}, // 6
  // {devID: '48-06-AE-01o', data: 'SW'}, // 7
  // {devID: '48-06-AE-01p', data: 'SW'}, // 8
  // {devID: '48-06-AE-01s', data: 'SW'}, // 9
  {devID: 'A4E9C09240E0', data: 'SW'}, // 10

  //Racks
  // {devID: '2450378D19', data: 'SW'}, //    A1
  // {devID: '4D66CDFE37', data: 'SW'}, //    A2
  // {devID: '48-06-AE-01t', data: 'SW'}, //  A3
  // {devID: '48-06-AE-01a', data: 'SW'}, //  A4
  // {devID: 'C50FC97C93', data: 'SW'}, //    C1
  // {devID: 'C87BAAF79C', data: 'SW'}, //    C2
  // {devID: '48-06-AE-01y', data: 'SW'}, //  C3
  // {devID: '48-06-AE-01g', data: 'SW'}, //  C4
  // {devID: '8BEBBFF646', data: 'SW'}, //    R1
  // {devID: '48-06-AE-01r', data: 'SW'}, //  R2
  // {devID: '48-06-AE-01u', data: 'SW'}, //  R3
  // {devID: '48-06-AE-01f', data: 'SW'}, //  R4
];

client.on('connect', function () {
  console.log('Connected to MQTT broker');

  client.subscribe('SWITCH_PRESS');

  publishMessages();
});

async function publishMessages() {
  // Initial publishing of messages

  for (let i = 0; i < SP.length; i++) {
    console.log(i + ': ' + JSON.stringify(SP[i]));

    client.publish('SWITCH_PRESS', JSON.stringify(SP[i]));

    // await new Promise(r => setTimeout(r, 2000)); //gives 3sec delay
  }

  client.end();
}
