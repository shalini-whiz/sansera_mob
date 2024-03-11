import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  Pressable,
} from 'react-native';
import {appTheme} from '../../lib/Themes';
import {ApiService} from '../../httpservice';
import {useIsFocused} from '@react-navigation/native';
import ErrorModal from '../../components/ErrorModal';
import {dateUtil} from '../../commons';
import UserContext from '../UserContext';
import Icon from 'react-native-vector-icons/FontAwesome5';

export const BatchBoard = React.memo(props => {
  const flatlistRef = useRef();
  const isFocused = useIsFocused();
  const [apiError, setApiError] = useState('');
  const [apiStatus, setApiStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [process, setProcess] = useState([]);
  const [index, setIndex] = useState(0);
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
      op: 'list_raw_material_by_status',
      status: ['NEW', 'APPROVED', 'REJECTED'],
      unit_num: userState.user.unit_number,
      sort_by: 'status',
      // sort_order: 'DSC',
    };
    // apiData.sort_by = 'updated_on'
    //apiData.sort_order = 'DSC'
    setRefreshing(false);
    setProcess([]);
    ApiService.getAPIRes(apiData, 'POST', 'batch').then(apiRes => {
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

  const errOKAction = () => {
    setApiError('');
  };

  const renderItem = ({item, index}) => {
    {/* //UI_Enhancement issue 3 */}

    let color;
    if (item.status === 'NEW') {
      color = '#ce8807';
    } else if (item.status === 'APPROVED') {
      color = 'green';
    } else color = 'red';

    {/* //UI_Enhancement issue 3 */}
    return (
      <View style={[styles.tableData, {flexDirection: 'row'}]} key={index}>
        <Text style={[styles.tableDataCell, {borderLeftWidth: 0.5}]}>
          {item.batch_num}
        </Text>
        <Text style={[styles.tableDataCell, {}]}>{item.heat_num}</Text>
        <Text style={[styles.tableDataCell, {}]}>{item.supplier}</Text>
        <Text style={[styles.tableDataCell, {}]}>{item.total_weight}</Text>
        <Text style={[styles.tableDataCell, {}]}>
          {dateUtil.toFormat(item.created_on, 'DD MMM YYYY')}
        </Text>
        <Text
          style={[
            styles.tableDataCell,
            {
              color: color,
            },
          ]}>
          {item.status && item.status === 'NEW' ? 'HOLD' : item.status}
          {/* //UI_Enhancement issue 3 */}
        </Text>
      </View>
    );
  };

  let minIndex = 0;
  let maxIndex = process.length - 1;

  const onPressFunctionTop = () => {
    setIndex(minIndex);
    console.log(index);
    flatlistRef.current?.scrollToIndex({index: index});
  };
  const onPressFunctionUp = () => {
    index > minIndex ? setIndex(index - 1) : setIndex(index);
    console.log(index);
    flatlistRef.current?.scrollToIndex({index: index});
  };
  const onPressFunctionDown = () => {
    index < maxIndex ? setIndex(index + 1) : setIndex(index);
    console.log(index);
    flatlistRef.current?.scrollToIndex({index: index});
  };
  const onPressFunctionBottom = () => {
    setIndex(maxIndex);
    console.log(index);
    flatlistRef.current?.scrollToIndex({index: index});
  };

  return (
    // <ScrollView
    //   contentContainerStyle={styles.scrollView}
    //   refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> }
    // >
    <View style={styles.container}>
      {/* {process.length ? (
        <View style={{padding: 5, margin: 0, justifyContent: 'space-between'}}>
          <Pressable
            style={{transform: [{rotate: '-90deg'}]}}
            onPress={onPressFunctionTop}>
            <Icon
              name="step-forward"
              size={35}
              color={appTheme.colors.gradientColor1}
            />
          </Pressable>
          <Pressable onPress={onPressFunctionUp}>
            <Icon
              name="angle-up"
              size={50}
              color={appTheme.colors.gradientColor1}
            />
          </Pressable>
          <Pressable onPress={onPressFunctionDown}>
            <Icon
              name="angle-down"
              size={50}
              color={appTheme.colors.gradientColor1}
            />
          </Pressable>
          <Pressable
            style={{transform: [{rotate: '90deg'}]}}
            onPress={onPressFunctionBottom}>
            <Icon
              name="step-forward"
              size={35}
              color={appTheme.colors.gradientColor1}
            />
          </Pressable>
        </View>
      ) : (
        false
      )} */}

      <View style={{flex: 1}}>
        {process.length ? (
          <View style={{backgroundColor: 'white', margin: 2, padding: 5}}>
            <FlatList
              ref={flatlistRef}
              data={process}
              horizontal={false}
              renderItem={renderItem}
              keyExtractor={item => item._id}
              onRefresh={() => onRefresh()}
              refreshing={refreshing}
              ListHeaderComponent={index => {
                return (
                  <View style={styles.tableHeader} key={index}>
                    <Text
                      style={[styles.tableHeaderCell, {borderLeftWidth: 0.5}]}>
                      Batch
                    </Text>
                    <Text style={[styles.tableHeaderCell, {}]}>
                      Heat Number
                    </Text>
                    <Text style={[styles.tableHeaderCell, {}]}>Supplier</Text>
                    <Text style={[styles.tableHeaderCell, {}]}>
                      Total Weight
                    </Text>
                    <Text style={[styles.tableHeaderCell, {}]}>
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

        {apiError && apiError.length ? (
          <ErrorModal msg={apiError} okAction={errOKAction} />
        ) : (
          false
        )}
      </View>
    </View>
  );
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 5,
    flexDirection: 'row',
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
    textAlign: 'center',
    fontSize: 16,
    fontFamily: appTheme.fonts.regular,
    color: appTheme.colors.filterText,
    borderColor: 'grey',
    color: 'black',
  },
});
