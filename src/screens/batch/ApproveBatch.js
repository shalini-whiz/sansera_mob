import React, {useState, useEffect} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  NativeModules,
  Button,
  Dimensions,
} from 'react-native';
import {util} from '../../commons';
import {appTheme} from '../../lib/Themes';
import {Picker} from '@react-native-picker/picker';
import {ApiService} from '../../httpservice';
import BatchDetails from './BatchDetails';
import CustomModal from '../../components/CustomModal';
import {RadioButton} from 'react-native-paper';
import UserContext from '../UserContext';
import {useIsFocused} from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import CustomHeader from '../../components/CustomHeader';
import AppStyles from '../../styles/AppStyles';
import ErrorModal from '../../components/ErrorModal';
import DocumentPicker from 'react-native-document-picker';
// import PSPDFKitView from 'react-native-pspdfkit';
import Pdf from 'react-native-pdf';
import RNFetchBlob from 'rn-fetch-blob';
import {BinIndicator} from '../../svgs/BinIcon';
import {SvgCss} from 'react-native-svg';
import {green100} from 'react-native-paper/lib/typescript/styles/colors';

export default function ApproveBatch({navigation}) {
  const userState = React.useContext(UserContext);
  const isFocused = useIsFocused();

  const [apiError, setApiError] = useState('');
  const [apiStatus, setApiStatus] = useState(false);
  const [apiIndicator, setApiIndicator] = useState(true);
  //Font&AlignmentChanges 2
  const [batchNum, setBatchNum] = useState('');
  const [status, setStatus] = useState('NEW');
  const [reason, setReason] = useState('');
  const [reasonId, setReasonId] = useState('');
  const [batchDet, setBatchDet] = useState({});
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [action, setAction] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [doc, setDoc] = useState(null);
  const [docDetails, setDocDetails] = useState(null);
  const [batchOptions, setBatchOptions] = useState({
    keyName: '_id',
    valueName: 'batch_num',
    options: [],
  });
  const [statusOptions, setStatusOptions] = useState({
    keyName: '_id',
    valueName: 'value',
    options: [
      {_id: 'NEW', value: 'Hold'},
      {_id: 'APPROVED', value: 'Approved'},
      {_id: 'REJECTED', value: 'Rejected'},
    ],
  });
  const [reasonOptions, setReasonOptions] = useState({
    keyName: '_id',
    valueName: 'rejection_reason',
    options: [],
  });
  useEffect(() => {
    if (isFocused) {
      loadBatches();
      setAction('');
      loadReasons();
    }
    return () => {};
  }, [navigation, isFocused, status, batchDet]);

  //Font&AlignmentChanges 2
  useEffect(() => {
    setTimeout(() => {
      setApiIndicator(false);
    }, 5000);
  }, [status]);

  const loadBatches = () => {
    let apiData = {
      op: 'list_raw_material_by_status',
      unit_num: userState.user.unit_number,
    };
    apiData.status = status.length ? status : 'NEW';
    (apiData.sort_by = 'created_on'), (apiData.sort_order = 'DSC');
    ApiService.getAPIRes(apiData, 'POST', 'list_raw_material_by_status').then(
      apiRes => {
        setApiStatus(false);
        setRefreshing(false);

        if (apiRes && apiRes.status) {
          if (apiRes.response.message && apiRes.response.message.length) {
            let bOptions = {...batchOptions};

            bOptions.options = apiRes.response.message;
            setBatchOptions(bOptions);
            let index = -1;
            if (batchNum.length)
              index = apiRes.response.message.findIndex(
                item => item._id === batchNum,
              );

            if (bOptions.options[0] && (batchNum === '' || index === -1)) {
              setBatchNum(bOptions.options[0]._id);
              setBatchDet(bOptions.options[0]);
            }
          } else {
            let bOptions = {...batchOptions};
            bOptions.options = [];
            setBatchOptions(bOptions);
            setBatchNum('');
            setBatchDet({});
          }
        } else if (apiRes && apiRes.response.message)
          setApiError(apiRes.response.message);
      },
    );
  };

  const loadReasons = () => {
    let apiData = {op: 'get_batch_reasons'};

    ApiService.getAPIRes(apiData, 'POST', 'get_batch_reason').then(apiRes => {
      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.length) {
          let reasonObj = {...reasonOptions};
          reasonObj.options = apiRes.response.message;
          setReasonOptions(reasonObj);
          setReasonId(reasonObj.options[0]._id);
          setReason(reasonObj.options[0].rejection_reason);
        } else {
          let reasonObj = {...reasonOptions};
          reasonObj.options = [];
          setReasonOptions(reasonObj);
          setReasonId('');
          setReason();
        }
      } else if (apiRes && apiRes.response.message)
        setApiError(apiRes.response.message);
    });
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadBatches();
    loadReasons();
  });

  const handleStatusChange = value => {
    setBatchNum('');
    setApiIndicator(true);
    //Font&AlignmentChanges 2
    setBatchDet({});
    setStatus(value);
    setDoc(null);
    setDocDetails(null);
  };

  const handleChange = name => (value, index) => {
    if (name === 'batchNum') {
      let bOptions = [...batchOptions.options];
      if (bOptions.length) {
        let bIndex = bOptions.findIndex(item => item._id === value);
        if (bIndex > -1) {
          let bDet = bOptions[bIndex];
          setBatchDet(bDet);
          setBatchNum(value);
          setDoc(null);
          setDocDetails(null);
        }
      } else {
        setBatchDet({});
        setBatchNum('');
      }
    } else if (name === 'action') setAction(value);
    else if (name === 'reason') {
      setReason(value);
    }
  };

  const closeDialog = () => {
    showDialog(false);
    setDialogTitle('');
    setDialogMessage('');
  };
  const openDialog = () => {
    let batchDetails = {...batchDet};
    if (batchDet.fifo && batchDet.fifo.length && action === 'approved') {
      showDialog(true);
      let dialogTitle = '';
      let dialogMessage = '';

      if (action === 'approved') {
        dialogTitle = 'Approve Batch';
        dialogMessage =
          'Are you sure you wish to APPROVE ' + batchDetails.batch_num;
      }

      setDialogTitle(dialogTitle);
      setDialogMessage(dialogMessage);
    } else if (action === 'rejected' || action === 'new') {
      showDialog(true);
      let dialogTitle = '';
      let dialogMessage = '';
      if (action === 'rejected') {
        dialogTitle = 'Reject Batch';
        dialogMessage =
          'Are you sure you wish to REJECT ' + batchDetails.batch_num;
      }
      if (action === 'new') {
        dialogTitle = 'Hold Batch';
        dialogMessage =
          'Are you sure you wish to HOLD ' + batchDetails.batch_num;
      }
      setDialogTitle(dialogTitle);
      setDialogMessage(dialogMessage);
    } else {
      setApiError('Racks are empty');
    }
  };

  const updateBatch = async () => {
    let apiData = {};
    if (action === 'rejected') apiData.material_reject_reason = reasonId;
    let batchDetails = {...batchDet};

    apiData.batch_num = batchDetails.batch_num;
    apiData.status = action.toUpperCase();
    //apiData.approved_by = userState.user.id;
    apiData.op = 'update_raw_material';
    if (action === 'rejected') apiData.reject_weight = 0;

    if (action === 'approved') {
      if (doc === null) {
        Alert.alert('Please upload pdf document');
        showDialog(false);
        return;
      }
      let fileData = await RNFetchBlob.fs.readFile(doc, 'base64');
      apiData.appr_certificate = 'data:application/pdf;base64,' + fileData;
    }

    setApiStatus(true);

    ApiService.getAPIRes(apiData, 'POST', 'batch').then(apiRes => {
      let msg;
      if (action === 'new') msg = 'HOLDED';
      if (action === 'approved') msg = 'APPROVED';
      if (action === 'rejected') msg = 'REJECTED';

      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message) {
          Alert.alert('BATCH ' + msg); 
          closeDialog();
          loadBatches();
          setAction('');
          setDoc(null);
          setDocDetails(null);
        }
      } else if (apiRes && apiRes.response.message) {
        setApiError(apiRes.response.message);
      }
    });
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
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: 'white',
            margin: 5,
            padding: 5,
          }}>
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            <Text style={AppStyles.filterLabel}>Select Batch</Text>
            <Picker
              selectedValue={batchNum}
              onValueChange={handleChange('batchNum')}
              mode="dialog"
              style={{backgroundColor: '#ECF0FA', flex: 1}}
              itemStyle={{}}
              dropdownIconColor={appTheme.colors.cardTitle}>
              {batchOptions.options &&
                batchOptions.options.map((pickerItem, pickerIndex) => {
                  let labelV =
                    batchOptions.keyName && pickerItem[batchOptions.keyName]
                      ? pickerItem[batchOptions.keyName]
                      : pickerItem.key
                      ? pickerItem.key
                      : '';
                  let label =
                    batchOptions.valueName && pickerItem[batchOptions.valueName]
                      ? pickerItem[batchOptions.valueName]
                      : pickerItem.value
                      ? pickerItem.value
                      : '';
                  return (
                    <Picker.Item
                      style={{backgroundColor: '#ECF0FA'}}
                      label={label}
                      value={labelV}
                      key={pickerIndex}
                    />
                  );
                })}
            </Picker>
          </View>
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            <FontAwesome5
              name="filter"
              size={20}
              style={{margin: 2, padding: 5, marginLeft: 10}}></FontAwesome5>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                padding: 5,
                borderRadius: status === 'NEW' ? 15 : 0,
                paddingLeft: 10,
                paddingRight: 10,
                backgroundColor:
                  status === 'NEW' ? appTheme.colors.cardTitle : 'white',
              }}
              onPress={e => handleStatusChange('NEW')}>
              <Text
                style={[
                  styles.filterText,
                  {
                    fontFamily:
                      status === 'NEW'
                        ? appTheme.fonts.bold
                        : appTheme.fonts.regular,
                    color:
                      status === 'NEW' ? 'white' : appTheme.colors.cardTitle,
                  },
                ]}>
                Hold
              </Text>
            </TouchableOpacity>
            <Text style={{}}> / </Text>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                padding: 5,
                borderRadius: status === 'APPROVED' ? 15 : 0,
                backgroundColor:
                  status === 'APPROVED' ? appTheme.colors.cardTitle : 'white',
              }}
              onPress={e => handleStatusChange('APPROVED')}>
              <Text
                style={[
                  styles.filterText,
                  {
                    fontFamily:
                      status === 'APPROVED'
                        ? appTheme.fonts.bold
                        : appTheme.fonts.regular,
                    color:
                      status === 'APPROVED'
                        ? 'white'
                        : appTheme.colors.cardTitle,
                  },
                ]}>
                Approved
              </Text>
            </TouchableOpacity>
            <Text style={{}}> / </Text>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                padding: 5,
                backgroundColor:
                  status === 'REJECTED' ? appTheme.colors.cardTitle : 'white',
                borderRadius: status === 'REJECTED' ? 15 : 0,
              }}
              onPress={e => handleStatusChange('REJECTED')}>
              <Text
                style={[
                  styles.filterText,
                  {
                    color: appTheme.colors.cancelAction,
                    fontFamily:
                      status === 'REJECTED'
                        ? appTheme.fonts.bold
                        : appTheme.fonts.regular,
                    color:
                      status === 'REJECTED'
                        ? 'white'
                        : appTheme.colors.cardTitle,
                  },
                ]}>
                Rejected
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {apiStatus ? (
          <ActivityIndicator size="large" animating={apiStatus} />
        ) : (
          false
        )}
        {batchDet && batchDet._id ? (
          <View style={{flexDirection: 'row', margin: 1, padding: 1}}>
            <View
              style={{
                flex: 1,
                margin: 5,
                backgroundColor: 'white',
                flexDirection: 'column',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  margin: 10,
                  marginTop: 20,
                  borderColor: 'grey',
                  borderWidth: 0.5,
                  padding: 10,
                  borderRadius: 10,
                }}>
                <View style={{flexDirection: 'column'}}>
                  <CustomHeader title={'Rack Numbers'} size={18} style={{}} />
                  <View style={{flexDirection: 'row'}}>
                    {batchDet &&
                      batchDet.fifo &&
                      batchDet.fifo.map((fifoItem, fifoIndex) => {
                        let fifoRack =
                          fifoIndex === 0
                            ? fifoItem.element_num
                            : '  |   ' + fifoItem.element_num;
                        return (
                          <Text
                            style={{
                              fontSize: 14,
                              color: 'black',
                            }}
                            key={fifoIndex}>
                            {fifoRack}
                          </Text>
                        );
                      })}
                  </View>
                </View>
              </View>
              {batchNum && batchNum.length ? (
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <RadioButton.Group
                    onValueChange={handleChange('action')}
                    value={action}
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      backgroundColor: 'red',
                      color: 'blue',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      {batchDet && batchDet.status !== 'NEW' ? (
                        <>
                          <RadioButton value="new" />
                          <Text
                            style={[
                              //UI_Enhancement issue 22
                              styles.radioText,
                              {
                                color: '#ff7b00',
                                marginRight: 20,
                                marginTop: 1,
                                fontFamily:
                                  action === 'new'
                                    ? appTheme.fonts.bold
                                    : appTheme.fonts.regular,
                              },
                            ]}>
                            HOLD
                          </Text>
                        </>
                      ) : (
                        false
                      )}

                      {batchDet && batchDet.status !== 'APPROVED' ? (
                        <>
                          <RadioButton value="approved" />
                          <Text
                            style={[
                              //UI_Enhancement issue 22
                              styles.radioText,
                              {
                                color: 'green',
                                marginRight: 20,
                                marginTop: 1,
                                fontFamily:
                                  action === 'approved'
                                    ? appTheme.fonts.bold
                                    : appTheme.fonts.regular,
                              },
                            ]}>
                            APPROVE
                          </Text>
                        </>
                      ) : (
                        false
                      )}

                      {batchDet.status !== 'REJECTED' ? (
                        <>
                          <RadioButton value="rejected" />
                          <Text
                            style={[
                              //UI_Enhancement issue 22
                              styles.radioText,
                              {
                                color: 'red',
                                marginRight: 20,
                                marginTop: 1,
                                fontFamily:
                                  action === 'rejected'
                                    ? appTheme.fonts.bold
                                    : appTheme.fonts.regular,
                              },
                            ]}>
                            REJECT
                          </Text>
                        </>
                      ) : (
                        false
                      )}
                    </View>
                  </RadioButton.Group>
                </View>
              ) : (
                false
              )}
              {action === 'rejected' ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    margin: 5,
                  }}>
                  <Text style={AppStyles.filterLabel}>Select Reason</Text>
                  <Picker
                    selectedValue={reason}
                    onValueChange={handleChange('reason')}
                    mode="dialog"
                    style={{backgroundColor: '#ECF0FA', flex: 1}}
                    itemStyle={{}}
                    dropdownIconColor={appTheme.colors.cardTitle}>
                    {reasonOptions.options.map((pickerItem, pickerIndex) => {
                      let labelV =
                        reasonOptions.keyName &&
                        pickerItem[reasonOptions.keyName]
                          ? pickerItem[reasonOptions.keyName]
                          : pickerItem.key
                          ? pickerItem.key
                          : '';
                      let label =
                        reasonOptions.valueName &&
                        pickerItem[reasonOptions.valueName]
                          ? pickerItem[reasonOptions.valueName]
                          : pickerItem.value
                          ? pickerItem.value
                          : '';
                      return (
                        <Picker.Item
                          style={{backgroundColor: '#ECF0FA'}}
                          label={label}
                          value={labelV}
                          key={pickerIndex}
                        />
                      );
                    })}
                  </Picker>
                </View>
              ) : (
                false
              )}
              {action === 'approved' ? (
                doc == null ? (
                  <View style={styles.container}>
                    <Button
                      onPress={async () => {
                        try {
                          const file = await DocumentPicker.pick({
                            type: [DocumentPicker.types.pdf],
                            copyTo: 'documentDirectory',
                          });
                          setDoc(
                            decodeURI(
                              file[0].fileCopyUri.replace('file://', ''),
                            ),
                          );
                          setDocDetails(file[0]);
                        } catch (error) {
                          if (DocumentPicker.isCancel(error)) {
                            // The user canceled the document picker.
                          } else {
                            throw error;
                          }
                        }
                      }}
                      title="Upload PDF Document"
                    />
                  </View>
                ) : (
                  <>
                    {docDetails ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          margin: 15,
                        }}>
                        <Text
                          onPress={async () => {
                            try {
                              const file = await DocumentPicker.pick({
                                type: [DocumentPicker.types.pdf],
                                copyTo: 'documentDirectory',
                              });
                              setDoc(
                                decodeURI(
                                  file[0].fileCopyUri.replace('file://', ''),
                                ),
                              );
                              setDocDetails(file[0]);
                            } catch (error) {
                              if (DocumentPicker.isCancel(error)) {
                                // The user canceled the document picker.
                              } else {
                                throw error;
                              }
                            }
                          }}
                          title="Upload PDF Document"
                          style={{
                            fontSize: 20,
                            fontWeight: 'bold',
                            color: appTheme.colors.cardTitle,
                            fontFamily: appTheme.fonts.bold,
                            backgroundColor: 'white',
                            maxWidth: '95%',
                          }}>
                          {docDetails.name}
                        </Text>
                        <TouchableOpacity onPress={() => setDoc(null)}>
                          <MaterialCommunityIcons
                            name="close"
                            size={30}
                            color={appTheme.colors.cancelAction}
                            style={{marginLeft: 10}}
                          />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      false
                    )}
                  </>
                )
              ) : (
                false
              )}
              <View
                style={{
                  flex: 1,
                  marginTop: 40,
                  justifyContent: 'center',
                  padding: 20,
                }}>
                {batchNum && batchNum.length && action.length ? (
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity
                      style={[
                        AppStyles.successBtn,
                        {flexDirection: 'row', width: '60%', padding: 10},
                      ]}
                      onPress={e => openDialog(e)}>
                      <Text style={AppStyles.successText}>SAVE</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  false
                )}
              </View>
            </View>
            <View style={[styles.sectionContainer, {flex: 1}]}>
              <BatchDetails
                pdf={true}
                content={batchDet}
                editMode={false}
                _id={batchDet._id}
                title="BATCH DETAILS"
              />
            </View>

            {dialog ? (
              <CustomModal
                modalVisible={dialog}
                dialogTitle={dialogTitle}
                dialogMessage={dialogMessage}
                closeDialog={closeDialog}
                okDialog={updateBatch}
              />
            ) : (
              false
            )}
          </View>
        ) : (
          <View style={{flexDirection: 'row', margin: 1, padding: 1}}>
            <View
              style={{
                flex: 1,
                margin: 5,

                flexDirection: 'column',
                margin: 100,
              }}>
              {/* Font&AlignmentChanges 2 */}
              {apiIndicator ? (
                <ActivityIndicator size="large" animating={apiIndicator} />
              ) : (
                false
              )}
              <View style={{margin: 90, flex: 1, backgroundColor: 'white'}}>
                <Text
                  style={{
                    margin: 10,
                    padding: 40,
                    textAlign: 'center',
                    fontSize: 20,
                  }}>
                  No Batch Found
                </Text>
              </View>
            </View>
          </View>
        )}
        {apiError && apiError.length ? (
          <ErrorModal msg={apiError} okAction={errOKAction} />
        ) : (
          false
        )}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 5,
  },
  sectionContainer: {
    backgroundColor: 'white',
    margin: 5,
    padding: 5,
  },
  radioText: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 16,
    fontFamily: appTheme.fonts.regular,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
