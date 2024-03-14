import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  SegmentedControlIOSComponent,
  ToastAndroid,
} from 'react-native';
import {dateUtil, util} from '../../commons';
import FormGen from '../../lib/FormGen';
import CustomHeader from '../../components/CustomHeader';
import {ApiService} from '../../httpservice';
import UserContext from '../UserContext';
import CustomModal from '../../components/CustomModal';
import {useIsFocused} from '@react-navigation/native';
import FormGrid from '../../lib/FormGrid';
import AppStyles from '../../styles/AppStyles';
import ErrorModal from '../../components/ErrorModal';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {appTheme} from '../../lib/Themes';
import RNFetchBlob from 'rn-fetch-blob';
import {PermissionsAndroid} from 'react-native';

let batchSchema = [
  {
    key: 'supplier_id',
    displayName: 'Supplier',
    placeholder: '',
    value: '',
    error: '',
    required: true,
    label: 'supplier',
    select: true,
    options: [],
    keyName: '_id',
    valueName: 'supplier_name',
    titleCase: true,
  },
  {
    key: 'material_code',
    displayName: 'Material Code',
    placeholder: '',
    value: '',
    error: '',
    required: true,
    lowerCase: true,
    label: 'Material Code',
    select: true,
    options: [],
    keyName: 'material_code',
    valueName: 'material_code',
    lowerCase: false,
  },
  {
    key: 'material_grade',
    displayName: 'Material Grade',
    placeholder: '',
    value: '',
    error: '',
    required: true,
    lowerCase: true,
    label: 'Material Grade',
    select: true,
    options: [],
    //keyName: "material_grade", valueName: "material_grade",
    lowerCase: false,
  },
  // {
  //   "key": "type", displayName: "Type", placeholder: "", value: "steel", error: "",
  //   required: true, lowerCase: true, "label": "type", select: true, options: [
  //     { "_id": "steel", "value": "Steel" },
  //     { "_id": "aluminium", "value": "Aluminium" }
  //   ],
  //   keyName: "_id", valueName: "value"
  // },
  {
    key: 'heat_num',
    displayName: 'Heat Number',
    placeholder: '',
    value: '',
    error: '',
    required: true,
    label: 'heat number',
    // type: 'string',
    type: 'regex',
  },
  {
    key: 'total_weight',
    displayName: 'Total Quantity (in Kg)',
    placeholder: '',
    value: '',
    error: '',
    required: true,
    label: 'quantity',
    type: 'decimal',
    nonZero: true,
  },
];

let createdBatch = [
  {
    key: 'batch_num',
    displayName: 'Batch',
    placeholder: '',
    value: '',
    error: '',
    required: true,
    lowerCase: true,
    label: 'batch num',
    type: 'string',
  },
  {
    key: 'created_on',
    displayName: 'Created Date',
    placeholder: '',
    value: '',
    error: '',
    required: true,
    lowerCase: true,
    label: 'created date',
    type: 'date',
  },
  {
    key: 'supplier',
    displayName: 'Supplier',
    placeholder: '',
    value: '',
    error: '',
    required: true,
    lowerCase: true,
    label: 'supplier',
    type: 'string',
  },
  // {
  //   "key": "type", displayName: "Type", placeholder: "", value: "", error: "",
  //   required: true, lowerCase: true, "label": "type", type: "string"
  // },
  {
    key: 'heat_num',
    displayName: 'Heat Number',
    placeholder: '',
    value: '',
    error: '',
    required: true,
    label: 'heat number',
    // type: 'string',
    type: 'regex',
  },
  {
    key: 'total_weight',
    displayName: 'Total Quantity (in Kg)',
    placeholder: '',
    value: '',
    error: '',
    required: true,
    label: 'quantity',
    type: 'decimal',
  },
  {
    key: 'created_by',
    displayName: 'Created By',
    placeholder: '',
    value: '',
    error: '',
    required: true,
    lowerCase: true,
    label: 'created by',
    type: 'string',
  },
  {
    key: 'status',
    displayName: 'Status',
    placeholder: '',
    value: '',
    error: '',
    required: true,
    lowerCase: true,
    label: 'status',
    type: 'string',
  },
];

export default function BatchDetails(props) {
  const [batchFormData, setBatchFormData] = useState([]);
  const [apiError, setApiError] = useState('');
  const [apiStatus, setApiStatus] = useState(false);
  const [supplier, setSupplier] = useState([]);
  const userState = React.useContext(UserContext);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [batchDet, setBatchDet] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const [materials, setMaterials] = useState([]);
  const [count, setCount] = useState(0);
  const [certif, setCertif] = useState('');

  useEffect(() => {
    if (isFocused) {
      loadForm();
    }
    return () => {};
  }, [isFocused, props.content && props.content._id, props]);

  useEffect(() => {
    if (!props._id) {
      getSuppliers();
    }
    return () => {};
  }, [count]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadForm();
    if (!props._id) getSuppliers();
  }, []);

  const loadForm = () => {
    let batchSchemaData = [];
    if (props._id) {
      batchSchemaData = [...createdBatch];
      batchSchemaData.map(item => {
        item['value'] = props._id ? props.content[item.key] + '' : '';
        if (item.type === 'date') {
          item.value = dateUtil.fromToDateFormat(
            item.value,
            'DD/MM/YYYY, hh:mm:ss A',
            'DD MMM YYYY hh:mm A',
          );
        }
        if (
          item.key === 'status' &&
          props.content[item.key].toLowerCase() === 'new'
        )
          item.value = 'HOLD';
        if (item.key === 'created_by') {
          item.value =
            props.content['created_by_emp_name'] +
            ' (' +
            props.content[item.key] +
            ')';
        }
      });
      setBatchFormData(batchSchemaData);
    } else {
      batchSchemaData = [...batchSchema];
      //let formData = await util.formatForm(batchSchemaData);
      batchSchemaData.map(item => (item['error'] = '')); // by Rakshith
      batchSchemaData.map(item => (item['value'] = '')); // by Rakshith
      setBatchFormData(batchSchemaData);
    }
    setCount(previousCount => previousCount + 1);
  };

  const getSuppliers = async () => {
    setApiStatus(true);

    let apiData = {
      op: 'get_suppliers',
    };
    setRefreshing(false);

    let apiRes = await ApiService.getAPIRes(apiData, 'POST', 'get_supplier');
    setApiStatus(false);
    if (apiRes && apiRes.status) {
      if (apiRes.response.message && apiRes.response.message.length) {
        setSupplier(apiRes.response.message);
        let formData = [...batchFormData];
        let index = formData.findIndex(item => item.key === 'supplier_id');
        if (index != -1) {
          let updatedItem = formData[index];
          const options = apiRes.response.message;
          updatedItem['options'] = options;
          if (apiRes.response.message[0])
            updatedItem.value = apiRes.response.message[0]._id;
          let updatedBatchData = [
            ...formData.slice(0, index),
            updatedItem,
            ...formData.slice(index + 1),
          ];
          setBatchFormData([...updatedBatchData]);
          loadSupplierMaterials();
        }
      }
    }
  };

  const loadSupplierMaterials = () => {
    let formData = [...batchFormData];
    let sIndex = formData.findIndex(item => item.key === 'supplier_id');
    let sItem = formData[sIndex];
    let mIndex = formData.findIndex(
      materialItem => materialItem.key === 'material_code',
    );
    let mgIndex = formData.findIndex(
      materialItem => materialItem.key === 'material_grade',
    );

    if (mIndex != -1 && sIndex != -1) {
      let selectedSupplierIndex = sItem.options.findIndex(
        item => item._id === sItem.value,
      );
      let updatedItem = formData[mIndex];
      let updatedMaterialGrade = formData[mgIndex];
      if (selectedSupplierIndex != -1) {
        let material_details =
          sItem.options[selectedSupplierIndex].material_details;
        if (material_details) {
          setMaterials(material_details);
          if (material_details.length && material_details[0])
            updatedItem.value = material_details[0].material_code;
          updatedItem.options = material_details;
          updatedMaterialGrade.options = material_details[0].material_grade;
          updatedMaterialGrade.value = material_details[0].material_grade[0];
          updatedMaterialGrade.options = material_details[0].material_grade;
          let updatedBatchData = [
            ...formData.slice(0, mIndex),
            updatedItem,
            ...formData.slice(mIndex + 1),
          ];
          updatedBatchData[mgIndex] = updatedMaterialGrade;
          setBatchFormData([...updatedBatchData]);
        }
      }
    }
  };

  const handleChange = name => value => {
    let formData = [...batchFormData];
    let index = formData.findIndex(item => item.key === name);
    if (index != -1) {
      let updatedItem = formData[index];
      updatedItem['value'] = value;
      let updatedBatchData = [
        ...formData.slice(0, index),
        updatedItem,
        ...formData.slice(index + 1),
      ];
      setBatchFormData([...updatedBatchData]);
      if (name === 'supplier_id') {
        loadSupplierMaterials();
      }
    }
  };

  const closeDialog = () => {
    showDialog(false);
    setDialogTitle('');
    setDialogMessage('');
    setBatchDet({});
    if (!props._id) {
      let newForm = util.resetForm(batchSchema);
      setBatchFormData(newForm);
      getSuppliers();
    }
  };

  const downloadPdf = async () => {
    setApiStatus(true);
    let apiData = {
      op: 'get_certificate',
      batch_num: props.content.batch_num,
      status: 'APPROVED',
      unit_num: props.content.unit_num,
    };
    let apiRes = await ApiService.getAPIRes(apiData, 'POST', 'batch');

    // setCertif(apiRes.response.message.appr_certificate);
    const base64String = apiRes.response.message.appr_certificate?.replace(
      'data:application/pdf;base64,',
      '',
    );
    const fileName = `${props.content.batch_num}.pdf`;

    convertBase64ToPDF(base64String, fileName);
  };

  const convertBase64ToPDF = async (base64String, fileName) => {
    try {
      const date = dateUtil.toDateFormat(Date.now(), 'DD-MMM-YYYY');
      const granted = await requestStoragePermission();
      if (!granted) {
        // console.warn('Storage permission denied. Cannot download the file.');
        Alert.alert('Storage permission denied. Cannot download the file.');
        return;
      }
      const {fs, config} = RNFetchBlob;
      const pdfLocation = `${fs.dirs.DownloadDir}//${date}/${fileName}`;

      try {
        if (base64String) {
          await fs
            .writeFile(pdfLocation, base64String, 'base64')
            .then(() => {
              ToastAndroid.show(
                `${fileName} File Downloaded `,
                ToastAndroid.SHORT,
              );
              console.log(`${fileName} File Downloaded `);
            })
            .then(
              Alert.alert(fileName, 'Downloaded Successfully'),
              setApiStatus(false),
            )
            .catch(err => Alert.alert(err));
        } else {
          Alert.alert('Certificate Not Found');
          setApiStatus(false);
        }
      } catch (err) {
        console.log('error -> ', err);
        setApiStatus(false);
      }
    } catch (err) {
      console.error('Failed to convert and download the file:', err);
      setApiStatus(false);
    }
  };

  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to your device storage to download files.',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Failed to request storage permission:', err);
      return false;
    }
  };

  const openDialog = batchDetails => {
    showDialog(true);
    let dialogTitle = 'Confirm Batch Creation';
    let dialogMessage =
      batchDetails.batch_num + ' is the new batch number generated.';
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
  };

  const handleSubmit = async () => {
    let loginFormData = [...batchFormData];
    let validFormData = await util.validateFormData(loginFormData);
    let isError = validFormData.find(item => {
      if (item.error.length) return item;
    });
    setBatchFormData(validFormData);
    if (!isError) {
      let apiData = await util.filterFormData([...batchFormData]);
      apiData.total_weight = parseFloat(apiData.total_weight);
      //apiData.created_by = userState.user.id;
      apiData.op = 'add_raw_material';
      apiData.type = 'Steel';
      setApiStatus(true);
      let apiRes = await ApiService.getAPIRes(apiData, 'POST', 'batch');
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message) {
          setBatchDet(apiRes.response.message);
          openDialog(apiRes.response.message);
        }
      } else if (apiRes && apiRes.response.message)
        setApiError(apiRes.response.message);
    }
  };

  const errOKAction = () => {
    setApiError('');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.container}>
        {props.noTitle ? (
          false
        ) : (
          <View
            style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
            <CustomHeader
              title={props.title ? props.title : ''}
              align="center"
            />
          </View>
        )}

        {props._id ? (
          <FormGrid labelDataInRow={true} formData={batchFormData} />
        ) : (
          <View style={{width: '70%', margin: 10, padding: 5}}>
            <FormGen
              handleChange={handleChange}
              editMode={true}
              formData={batchFormData}
              labelDataInRow={true}
            />
          </View>
        )}
        {dialog ? (
          <CustomModal
            modalVisible={dialog}
            dialogTitle={dialogTitle}
            dialogMessage={dialogMessage}
            okDialog={closeDialog}
          />
        ) : (
          false
        )}

        {apiError && apiError.length ? (
          <ErrorModal msg={apiError} okAction={errOKAction} />
        ) : (
          false
        )}

        {props._id ? (
          <></>
        ) : (
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              style={[AppStyles.successBtn, {flexDirection: 'row'}]}
              onPress={e => handleSubmit(e)}>
              <Text style={AppStyles.successText}>SAVE</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {props.pdf ? (
        <View style={{flex: 1, flexDirection: 'row'}}>
          <Text style={{margin: 9, fontFamily: appTheme.fonts.regular}}>
            Certificate
          </Text>
          <View
            style={{flex: 1, flexDirection: 'row', marginHorizontal: '20%'}}>
            <Icon
              name={'download'}
              size={20}
              color={appTheme.colors.cardTitle}
              onPress={downloadPdf}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
              }}
            />
          </View>
        </View>
      ) : null}
      {apiStatus ? (
        <ActivityIndicator size="large" animating={apiStatus} />
      ) : (
        false
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    margin: 1,
  },
});
