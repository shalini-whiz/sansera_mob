import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, ScrollView, RefreshControl} from 'react-native';
import {appTheme} from '../../lib/Themes';
import {ApiService} from '../../httpservice';
import {useIsFocused} from '@react-navigation/native';
import UserContext from '../UserContext';
import {ActivityIndicator} from 'react-native';

export default function RejectionData(props) {
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);
  const [rejectionData, setRejectionData] = useState([]);
  const [processData, setProcessData] = useState([]);
  const userState = React.useContext(UserContext);

  useEffect(() => {
    if (isFocused) {
      getProcess();
      loadRejectionData();
    }
    return () => {};
  }, [isFocused]);

  const loadRejectionData = () => {
    let apiData = {};
    apiData.op = 'get_rejection_summary';
    apiData.process_name = props.processEntity.process_name;
    apiData.unit_num = userState.user.unit_number;

    setRefreshing(false);
    setRejectionData([]);
    ApiService.getAPIRes(apiData, 'POST', 'rejection').then(apiRes => {
      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.rejections)
          setRejectionData(apiRes.response.message.rejections);
        // console.log(JSON.stringify(apiRes.response.message));
      } else if (apiRes && apiRes.response.message) {
      }
    });
  };

  const getProcess = () => {
    let apiData = {};
    apiData.op = 'get_process';
    apiData.process_name = props.processEntity.process_name;
    apiData.unit_num = userState.user.unit_number;

    setRefreshing(false);
    setRejectionData([]);
    ApiService.getAPIRes(apiData, 'POST', 'process').then(apiRes => {
      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message)
          // console.log(JSON.stringify(apiRes.response.message.process));
          setProcessData(apiRes.response.message.process);
        //  processData
        //    .filter(
        //      item =>
        //        item.stage_name !== 'Rework' &&
        //        item.stage_name !== 'Under heat' &&
        //        item.stage_name !== 'Billet punching',
        //    )
        //    .map(data => console.log(data));
      } else if (apiRes && apiRes.response.message) {
      }
    });
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadRejectionData();
  }, []);

  const closeDialog = () => {
    showDialog(false);
    setDialogTitle('');
    setDialogMessage('');
  };
  const openDialog = () => {
    showDialog(true);
    setDialogTitle('Confirm Clear Inventory');
    let batchDetails = {...batchDet};
    let message =
      'The racks associated with batch number ' +
      batchDetails.batch_num +
      ' will be deleted';
    setDialogMessage(message);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={[styles.container]}>
        {/* <ActivityIndicator size="large" animating={apiStatus} /> */}
        <View style={[styles.dataContainer, {}]}>
          {processData && processData.length ? (
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                flex: 1,
                justifyContent: 'center',
              }}>
              {processData
                .filter(
                  item =>
                    item.stage_name !== 'Rework' &&
                    item.stage_name !== 'Under heat' &&
                    item.stage_name !== 'Dispatch' &&
                    item.stage_name !== 'Billet punching',
                )
                .map((item, index) => {
                  return (
                    <View
                      style={{
                        flexDirection: 'column',
                        borderWidth: 0.5,
                        borderColor: 'grey',
                        padding: 8,
                      }}
                      key={index}>
                      <Text
                        style={[
                          styles.tableHeader,
                          {
                            marginBottom: 1,
                            flex: 1,
                            padding: 5,
                            width: '100%',
                            borderBottomColor: 'grey',
                            borderBottomWidth: 0.5,
                          },
                        ]}>
                        {item.stage_name}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          {marginTop: 1, flex: 1, padding: 5},
                        ]}>
                        {item.ok_component}
                      </Text>
                    </View>
                  );
                })}
            </View>
          ) : (
            <ActivityIndicator size="large" />
          )}

          <View
            style={{
              width: '100%',
              flex: 1,
              justifyContent: 'center',
              marginTop: 80,
            }}>
            <Text style={styles.title}>Rejection Data</Text>

            {rejectionData && rejectionData.length ? (
              <View
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  flex: 1,
                  justifyContent: 'center',
                }}>
                {rejectionData.map((item, index) => {
                  return (
                    <View
                      style={{
                        flexDirection: 'column',
                        borderWidth: 0.5,
                        borderColor: 'grey',
                        padding: 8,
                      }}
                      key={index}>
                      <Text
                        style={[
                          styles.tableHeader,
                          {
                            marginBottom: 1,
                            flex: 1,
                            padding: 5,
                            width: '100%',
                            borderBottomColor: 'grey',
                            borderBottomWidth: 0.5,
                          },
                        ]}>
                        {item.stage_name}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          {marginTop: 1, flex: 1, padding: 5},
                        ]}>
                        {item.total_rejections}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <ActivityIndicator size="large" />
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 5,
  },
  title: {
    textAlign: 'center',
    fontSize: 30,
    color: appTheme.colors.cardTitle,
    fontFamily: appTheme.fonts.bold,
    marginBottom: 20,
  },
  dataContainer: {
    backgroundColor: 'white',
    padding: 10,
  },
  tableHeader: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: appTheme.fonts.bold,
  },
  tableCell: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: appTheme.fonts.regular,
  },
});
