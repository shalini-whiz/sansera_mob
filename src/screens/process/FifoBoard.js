import React, {useState, useEffect} from 'react';
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
  Touchable,
  FlatList,
} from 'react-native';
import {SvgCss} from 'react-native-svg';
import {appTheme} from '../../lib/Themes';
import {ApiService} from '../../httpservice';
import CustomModal from '../../components/CustomModal';
import {useIsFocused} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ErrorModal from '../../components/ErrorModal';
import {dateUtil} from '../../commons';
import {BinInIcon} from '../../svgs/BinIcon';
import {ProcessFifo} from './ProcessFifo';
import UserContext from '../UserContext';

export const FifoBoard = React.memo(props => {
  const isFocused = useIsFocused();
  const [apiError, setApiError] = useState('');
  const [apiStatus, setApiStatus] = useState(false);
  const [batchDet, setBatchDet] = useState({});
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [process, setProcess] = useState([]);
  const [processDet, setProcessDet] = useState({});
  const userState = React.useContext(UserContext);

  useEffect(() => {
    if (isFocused) {
      setApiStatus(true);
      loadProcess();
    }
    return () => {};
  }, [isFocused]);

  const loadProcess = () => {
    let apiData = {
      op: 'get_process',
      unit_num: userState.user.unit_number,
    };
    apiData.sort_by = 'status';
    apiData.sort_order = 'DSC';
    setRefreshing(false);
    setProcess([]);
    ApiService.getAPIRes(apiData, 'POST', 'process').then(apiRes => {
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.length) {
          setProcess(apiRes.response.message);
        }
      } else if (apiRes && apiRes.response.message) {
        setApiError(apiRes.response.message);
        setProcess([]);
      }
    });
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadProcess();
  }, []);

  const closeDialog = () => {
    showDialog(false);
    setDialogTitle('');
    setDialogMessage('');
  };
  const openDialog = (type, item) => {
    showDialog(true);
    let dialogTitle = '';
    let dialogMessage = '';
    let dialogType = '';
    dialogType = type;
    if (type === 'processFifo') {
      dialogTitle = 'Process : ' + item.process_name; ////UI_Enhancement issue 19
    }

    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
    setDialogType(dialogType);
    setProcessDet(item);
  };

  const updateFifo = () => {
    closeDialog();
    loadProcess();
  };
  const errOKAction = () => {
    setApiError('');
  };

  const renderItem = ({item, index}) => {
    let color;
    if (item.status === 'CREATED') color = '#2b96d4';
    if (item.status === 'HOLD') color = '#ce8807';
    if (item.status === 'RUNNING') color = 'green';
    if (item.status === 'FINISHED') color = 'red';

    return (
      <View style={[styles.tableData, {flexDirection: 'row'}]} key={index}>
        <View
          style={[
            styles.tableDataCell,
            {borderLeftWidth: 0.5, flexDirection: 'row', minWidth: 50},
          ]}>
          <Text
            style={[
              //UI_Enhancement issue 16
              {
                flex: 1,
                textAlign: 'left',
                fontSize: 16,
                fontFamily: appTheme.fonts.regular,
                color: appTheme.colors.filterText,
                color: 'black',
                marginLeft: 20,
              },
            ]}>
            {item.batch_num}
          </Text>
          <TouchableOpacity
            style={[{marginHorizontal: 15}]}
            onPress={e => openDialog('processFifo', item)}>
            <SvgCss
              xml={BinInIcon('green')} //UI_Enhancement issue 9 , //UI_Enhancement issue 21
              // xml={BinInIcon(appTheme.colors.cardTitle)}
              width={30}
              height={30}
            />

            {/* <MaterialIcons name="edit" size={22} style={{ marginLeft: 10 }} color="green" ></MaterialIcons> */}
          </TouchableOpacity>
        </View>
        <Text style={[styles.tableDataCell, {}]}>{item.heat_num}</Text>
        <Text style={[styles.tableDataCell, {}]}>{item.supplier}</Text>
        <Text
          style={[
            styles.tableDataCell,
            {fontWeight: 'bold', color: appTheme.colors.cardTitle}, //UI_Enhancement issue 6
          ]}>
          {item.process_name}
        </Text>
        <Text style={[styles.tableDataCell, {}]}>{item.component_count}</Text>
        <Text style={[styles.tableDataCell, {}]}>
          {item.process[6].ok_component}
        </Text>
        {/* Target count and Finished Count */}
        <Text
          style={[
            styles.tableDataCell,
            {minWidth: 80}, //UI_Enhancement issue 17
          ]}>
          {dateUtil.toFormat(item.created_on, 'DD MMM YYYY')}
        </Text>
        <Text style={[styles.tableDataCell, {color:color}]}>{item.status}</Text>
      </View>
    );
  };

  return (
    // <ScrollView
    //   contentContainerStyle={styles.scrollView}
    //   refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> }
    // >
    <View style={styles.container}>
      {/* {apiStatus ? (
        <ActivityIndicator size="large" animating={apiStatus} />
      ) : (
        false
      )}         by Rakshith               */}
      {process.length ? (
        <View style={{backgroundColor: 'white', margin: 2, padding: 5}}>
          <FlatList
            data={process}
            horizontal={false}
            renderItem={renderItem}
            keyExtractor={item => item.process_name}
            onRefresh={() => onRefresh()}
            refreshing={refreshing}
            ListHeaderComponent={() => {
              return (
                <View style={styles.tableHeader}>
                  <Text
                    style={[
                      styles.tableHeaderCell,
                      {borderLeftWidth: 0.5, minWidth: 50}, //UI_Enhancement issue 16
                    ]}>
                    Batch
                  </Text>
                  <Text style={[styles.tableHeaderCell, {}]}>Heat Number</Text>
                  <Text style={[styles.tableHeaderCell, {}]}>Supplier</Text>
                  <Text style={[styles.tableHeaderCell, {}]}>Process</Text>
                  <Text style={[styles.tableHeaderCell, {}]}>Target Count</Text>
                  <Text style={[styles.tableHeaderCell, {}]}>
                    Finished Count
                  </Text>
                  {/* Target count and Finished Count */}
                  <Text style={[styles.tableHeaderCell, {minWidth: 80}]}>
                    Received Date
                  </Text>
                  <Text style={[styles.tableHeaderCell, {}]}>Status</Text>
                </View>
              );
            }}></FlatList>
        </View>
      ) : (
        <ActivityIndicator size="large" />
      )}
      {dialog && dialogType === 'processFifo' ? (
        <CustomModal
          modalVisible={dialog}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          height={'80%'}
          container={
            <ProcessFifo
              processDet={processDet}
              closeDialog={closeDialog}
              okDialog={updateFifo}
            />
          }
        />
      ) : (
        false
      )}
      {apiError && apiError.length ? (
        <ErrorModal msg={apiError} okAction={errOKAction} />
      ) : (
        false
      )}
    </View>
  );
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 5,
  },
  processContainer: {
    flexDirection: 'column',
    margin: 8,
    backgroundColor: 'white',
    padding: 10,
  },
  successBtn: {
    width: '40%',
    borderRadius: 25,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    //marginTop: 40,
    backgroundColor: appTheme.colors.warnAction,
  },
  successText: {
    color: appTheme.colors.warnActionTxt,
  },
  radioText: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 16,
    fontFamily: appTheme.fonts.regular,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: appTheme.fonts.regular,
    padding: 5,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    color: appTheme.colors.cardTitle,
    fontFamily: appTheme.fonts.bold,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    //fontWeight: "bold",
    fontFamily: appTheme.fonts.regular,
    color: appTheme.colors.cardTitle,
  },
  tableContent: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: appTheme.fonts.regular,
  },
  tableHeader: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: 'grey',
  },
  tableHeaderCell: {
    textAlign: 'center',
    flex: 1,
    borderRightWidth: 0.5,
    padding: 5,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: appTheme.fonts.regular,
    color: appTheme.colors.cardTitle,
    borderColor: 'grey',
  },
  tableData: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: 'grey',
  },
  tableDataCell: {
    textAlign: 'center',
    flex: 1,
    borderRightWidth: 0.5,
    padding: 5,
    // textAlign: 'center',
    fontSize: 16,
    fontFamily: appTheme.fonts.regular,
    // color: appTheme.colors.filterText,
    borderColor: 'grey',
    color: 'black',
  },
});
