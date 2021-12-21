//var liveAddress = "http://192.168.0.107:7000/";
var liveAddress_old = "https://p-san-forge-feature.herokuapp.com/";
var liveAddress = 'https://p-san-forge-mobile.herokuapp.com/'

var mqttHost = "mqtt.meti.in"
var mqttUrl = "mqtt" + "://" + mqttHost + ":1884";
var mqttUser = "quickiot_wd"
var mqttUserPwd = "whiz1234!"
var mqttClientId = "clientId"

const  mqttOptions = {
    uri: mqttUrl,
    clientId: mqttClientId,
    user: mqttUser,
    pass: mqttUserPwd,
    auth: true,
    keepalive: 60
}




const SERVER_URL = liveAddress;

const urls = {
    login: SERVER_URL + "api/login",
    getProcess:SERVER_URL+"api/process-line",
    get_next_element:SERVER_URL+"api/process-line",
    pop_element:SERVER_URL+"api/fifo",
    create_request:SERVER_URL+"api/operator-task",
    update_request:SERVER_URL+"api/operator-task",
    get_supplier:SERVER_URL+"api/supplier",
    create_batch: SERVER_URL +"api/raw-materials",
    list_raw_material_by_status: SERVER_URL +"api/raw-materials",
    update_batch: SERVER_URL +"api/raw-materials",
    batch: SERVER_URL +"api/raw-materials",
    

};



export { urls, SERVER_URL, mqttOptions };