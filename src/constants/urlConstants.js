const VM = {
  sansera: {
    liveAddress: 'http://10.11.2.32:8086/',
    mqttAddress: 'mqtt://10.11.2.32:1883',
  },
  testServer: {
    liveAddress: 'http://49.249.241.171:8086/',
    mqttAddress: 'mqtt://49.249.241.171:1883',
  },
  oldMysore: {
    liveAddress: 'http://103.162.246.109:8086/',
    mqttAddress: 'mqtt://103.162.246.109:1883',
    ssl: 'mqtts://103.162.246.109:8883',
  },
  ganeshLH: {
    liveAddress: 'http://192.168.0.38:8080/',
    mqttAddress: 'mqtt://103.162.246.109:1883',
  },
  banloreLH: {
    liveAddress: 'http://192.168.100.18:8086/',
    mqttAddress: 'mqtt://103.162.246.109:1883',
    ssl: 'mqtts://103.162.246.109:8883',
  },
};

var liveAddress = VM.sansera.liveAddress;
var mqttAddress = VM.sansera.mqttAddress;

let oldmqttOptions = {
  uri: 'mqtt://mqtt.meti.in:1884',
  clientId: 'clientId',
  user: 'quickiot_wd',
  pass: 'whiz1234!',
  auth: true,
  keepalive: 32000,
  // keepalive: 60
};

let mqttOptions = {
  uri: mqttAddress,
  clientId: 'clientId',
  user: 'mqtt',
  pass: 'mqtt2022',
  auth: true,
  keepalive: 32000,
  // keepalive: 60
};

let binMqttOptions = {
  uri: mqttAddress,
  clientId: 'clientId',
  user: 'mqtt',
  pass: 'mqtt2022',
  auth: true,
  keepalive: 32000,
  // keepalive: 60
};

let oldbinMqttOptions = {
  uri: 'mqtt' + '://mqtt.meti.in:1884',
  clientId: 'clientId',
  user: 'quickiot_wd',
  pass: 'whiz1234!',
  auth: true,
  keepalive: 32000,
  // keepalive: 60
};

const SERVER_URL = liveAddress;
const urls = {
  login: SERVER_URL + 'api/auth',
  getProcess: SERVER_URL + 'api/process-line',
  get_next_element: SERVER_URL + 'api/process-line',
  pop_element: SERVER_URL + 'api/fifo',
  create_request: SERVER_URL + 'api/operator-task',
  update_request: SERVER_URL + 'api/operator-task',
  get_supplier: SERVER_URL + 'api/supplier',
  create_batch: SERVER_URL + 'api/raw-materials',
  list_raw_material_by_status: SERVER_URL + 'api/raw-materials',
  update_batch: SERVER_URL + 'api/raw-materials',
  batch: SERVER_URL + 'api/raw-materials',
  get_batch_reason: SERVER_URL + 'api/batch-rejection',
  process: SERVER_URL + 'api/process-line',
  forgeMachine: SERVER_URL + 'api/forge-machine',
  customer: SERVER_URL + 'api/customer',
  fifo: SERVER_URL + 'api/fifo',
  'process-master': SERVER_URL + 'api/process-master',
  mqtt: SERVER_URL + 'api/mqtt-service',
  rejection: SERVER_URL + 'api/rejection',
  org: SERVER_URL + 'api/org-service',
  task: SERVER_URL + 'api/operator-task',
  process_consumption: SERVER_URL + 'api/process-consumption',
  compartment: SERVER_URL + 'api/compartment',
  downtime: SERVER_URL + 'api/downtime',
};

export {urls, SERVER_URL, mqttOptions, binMqttOptions};
