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
} from 'react-native';
import {dateUtil, util} from '../../commons';
import {appTheme} from '../../lib/Themes';
import FormGen from '../../lib/FormGen';
import CustomHeader from '../../components/CustomHeader';
import {ApiService} from '../../httpservice';
import UserContext from '../UserContext';
import CustomModal from '../../components/CustomModal';
import {useIsFocused} from '@react-navigation/native';
import {RadioButton} from 'react-native-paper';
import ProcessDetails from '../process/ProcessDetails';
import {default as AppStyles} from '../../styles/AppStyles';
import WeightDetails from '../process/WeightDetails';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RequestBin from './RequestBin';
import ProcessInfo from '../process/ProcessInfo';
import {EmptyBinContext} from '../../context/EmptyBinContext';

let stageSchema = [
  {
    key: 'ok_component',
    displayName: 'OK Component (Count)',
    placeholder: '',
    value: 0,
    error: '',
    required: true,
    label: 'components',
    type: 'number',
    defaultValue: 0,
    nonZero: true,
  },
];

export const WorkPlan = React.memo(props => {
  const [formData, setFormData] = useState([]);
  const [apiError, setApiError] = useState('');
  const [apiStatus, setApiStatus] = useState(false);
  const userState = React.useContext(UserContext);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogType, setDialogType] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [batchDet, setBatchDet] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const [count, setCount] = useState(0);
  const [rackData, setRackData] = useState({});
  const {appProcess} = React.useContext(EmptyBinContext);

  useEffect(() => {
    if (isFocused) {
      loadForm();
    }
    return () => {};
  }, [isFocused]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadForm();
  }, []);

  const loadForm = () => {
    let schemaData = [...stageSchema];
    setRefreshing(false);
    setFormData(schemaData);
    setCount(previousCount => previousCount + 1);
  };

  const handleChange = name => value => {
    let formDataInput = [...formData];

    let index = formDataInput.findIndex(item => item.key === name);
    if (index != -1) {
      let updatedItem = formDataInput[index];
      updatedItem['value'] = value;
      let updatedBatchData = [
        ...formDataInput.slice(0, index),
        updatedItem,
        ...formDataInput.slice(index + 1),
      ];
      setFormData([...updatedBatchData]);
    }
  };

  const closeDialog = () => {
    showDialog(false);
    setDialogTitle('');
    setDialogMessage('');
    setBatchDet({});
    setRackData({});
  };

  //UI_Enhancement issue 7
  const openDialog = () => {
    showDialog(true);
    let dialogTitle = 'CONFIRM COMPONENT DETAILS'; // Confirmation Dialog msg change
    let dialogMessage = '';
    setDialogType('update');
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
  };

  //UI_Enhancement issue 7
  const Validation = async () => {
    let loginFormData = [...formData];
    let validFormData = await util.validateFormData(loginFormData);
    let isError = validFormData.find(item => {
      if (item.error.length) return item;
    });
    setFormData(validFormData);

    if (!isError) {
      openDialog();
    }
  };

  const handleSubmit = async () => {
    let apiData = await util.filterFormData([...formData]);
    (apiData.op = 'update_process'),
      (apiData.process_name = appProcess.process_name);
    apiData.stage_name = await AsyncStorage.getItem('stage');

    setApiStatus(true);
    ApiService.getAPIRes(apiData, 'POST', 'process').then(apiRes => {
      closeDialog()
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message) {
          Alert.alert('Process updated');
          // props.setProcessEntity(apiRes.response.message)
          props.updateProcess();

          // setBatchDet(apiRes.response.message);
          //openDialog(apiRes.response.message);
          util.resetForm(formData);
        }
      }
    });
  };

  const reloadPage = response => {
    props.updateProcess();
  };

  const showReqBin = e => {
    setDialogTitle('REQUEST TO');
    setDialogType('request'); //UI_Enhancement issue 7
    setDialogMessage('');
    showDialog(true);
  };
  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.mainContainer}>
        <View style={{flexDirection: 'row'}}>
          <View
            style={{flex: 2, backgroundColor: 'white', margin: 5, padding: 5}}>
            <TouchableOpacity
              style={[
                AppStyles.warnButtonContainer,
                {width: '50%', marginBottom: 20},
              ]}
              onPress={e => showReqBin(e)}>
              <Text style={AppStyles.warnButtonTxt}>REQUEST FILLED BIN</Text>
            </TouchableOpacity>
            {/* <View style={{flexDirection:'row',margin:10}}>
              <Text style={AppStyles.filterLabel}>Empty Bin </Text>
              <CustomHeader  title=""></CustomHeader>
            </View> */}
            <View style={{flexDirection: 'column', margin: 10}}>
              <FormGen
                handleChange={handleChange}
                formData={formData}
                labelDataInRow={false}
              />
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                margin: 5,
                marginTop: 20,
              }}>
              <TouchableOpacity
                style={[AppStyles.successBtn, {flexDirection: 'row'}]}
                onPress={e => Validation(e)} //UI_Enhancement issue 7
                disabled={apiStatus}>
                <Text style={AppStyles.successText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{flex: 3, flexDirection: 'row'}}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'white',
                margin: 5,
                padding: 5,
              }}>
              <ProcessInfo
                title="PROCESS DETAILS"
                processEntity={appProcess}
                fields={['forge_machine_id', 'total_rejections']}
              />
            </View>
          </View>
        </View>
        {dialog && dialogType === 'request' ? (
          <CustomModal
            modalVisible={dialog}
            dialogTitle={dialogTitle}
            dialogMessage={dialogMessage}
            container={
              <RequestBin
                processEntity={appProcess}
                closeDialog={closeDialog}
              />
            }
          />
        ) : (
          false
        )}

        {dialog && dialogType === 'update' ? ( //UI_Enhancement issue 7
          <CustomModal
            modalVisible={dialog}
            dialogTitle={dialogTitle}
            // dialogMessage={dialogMessage}
            closeDialog={closeDialog}
            okDialog={handleSubmit}
            container={
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                }}>
                {/* // Confirmation Dialog msg change */}
                <Text style={{color: 'black', fontSize: 20}}>
                  Entered ok component{' '}
                  <Text
                    style={{
                      color: appTheme.colors.cardTitle,
                      fontWeight: 'bold',
                    }}>
                    {' '}
                    {formData[0].value}{' '}
                  </Text>{' '}
                  are adding to process{' '}
                  <Text
                    style={{
                      color: appTheme.colors.cardTitle,
                      fontWeight: 'bold',
                    }}>
                    {' '}
                    {appProcess.process_name}{' '}
                  </Text>
                </Text>
              </View>
            }
          />
        ) : (
          false
        )}
      </View>
    </ScrollView>
  );
});
const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: 'center',
    margin: 10,
  },
  container: {
    // flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    margin: 10,
  },
  successBtn: {
    width: '40%',
    borderRadius: 25,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    backgroundColor: appTheme.colors.warnAction,
  },
  successText: {
    color: appTheme.colors.warnActionTxt,
  },

  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
