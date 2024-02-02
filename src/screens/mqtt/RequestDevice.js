import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {appTheme} from '../../lib/Themes';
import UserContext from '../UserContext';
import {useIsFocused} from '@react-navigation/native';
import {default as AppStyles} from '../../styles/AppStyles';
import {ApiService} from '../../httpservice';
import {RadioButton} from 'react-native-paper';
import {Picker} from '@react-native-picker/picker';

export default function RequestDevice(props) {
  const [apiError, setApiError] = useState('');
  const [apiStatus, setApiStatus] = useState(false);
  const [binErr, setBinErr] = useState('');
  const [requestType, setRequestType] = useState('all');
  const userState = React.useContext(UserContext);
  const [allDevice, setAllDevice] = useState([]);
  const [device, setDevice] = useState('');

  const closeDialog = () => {
    props.closeDialog();
  };

  const openDialog = e => {
    props.openDialog(e, 'batteryStatus');
  };

  const handleSubmit = async () => {
    if (requestType.length == 0) setBinErr('Please select Devices');
    else if (requestType === 'all') openDialog();
    else if (requestType === 'rack' || requestType === 'bin')
      openDialog(device);
  };

  const handleChange = name => async (value, index) => {
    if (name === 'device') {
      setDevice(value);
    }
  };

  const handleRequestType = name => value => {
    setRequestType(value);
    if (value === 'bin' || value === 'rack') {
      let apiData = {
        op: 'get_device',
        type: value,
        unit_num: userState.user.unit_number,
      };
      ApiService.getAPIRes(apiData, 'POST', 'mqtt').then(apiRes => {
        if (apiRes && apiRes.status) {
          if (apiRes.response.message && apiRes.response.message.length) {
            setAllDevice(apiRes.response.message);
          }
        } else if (apiRes.response.message)
          setApiError(apiRes.response.message);
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View
        style={[
          styles.container,
          {alignItems: 'center', flexDirection: 'column'},
        ]}>
        <View style={{flexDirection: 'row', margin: 5, padding: 5}}>
          <RadioButton.Group
            onValueChange={handleRequestType('requestType')}
            value={requestType}
            style={{flexDirection: 'row', color: 'blue'}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
              }}>
              <RadioButton value={'all'} />
              <Text
                style={[
                  AppStyles.radioText,
                  {color: appTheme.colors.warnAction, marginRight: 15},
                ]}>
                All Devices
              </Text>
              <RadioButton value={'bin'} />
              <Text
                style={[
                  AppStyles.radioText,
                  {color: appTheme.colors.warnAction, marginRight: 15},
                ]}>
                Bins
              </Text>
              <RadioButton value={'rack'} />
              <Text
                style={[
                  AppStyles.radioText,
                  {color: appTheme.colors.warnAction},
                ]}>
                Racks
              </Text>
            </View>
          </RadioButton.Group>
        </View>
        {requestType === 'bin' || requestType === 'rack' ? (
          <View style={{flexDirection: 'row', width: '25%'}}>
            <Picker
              selectedValue={device}
              onValueChange={handleChange('device')}
              mode="dialog"
              style={{backgroundColor: '#ECF0FA', flex: 2}}
              itemStyle={{}}
              dropdownIconColor={appTheme.colors.cardTitle}>
              {allDevice && allDevice.length
                ? allDevice
                    .sort((a, b) => a.element_num > b.element_num)
                    .map((pickerItem, pickerIndex) => {
                      return (
                        <Picker.Item
                          style={{backgroundColor: '#ECF0FA'}}
                          label={pickerItem.element_num}
                          value={pickerItem.device_id}
                          key={pickerIndex}
                        />
                      );
                    })
                : false}
            </Picker>
          </View>
        ) : (
          false
        )}
        {apiError && apiError.length ? (
          <Text style={{color: 'red', fontSize: 12, padding: 2, margin: 10}}>
            {' '}
            {apiError}{' '}
          </Text>
        ) : (
          false
        )}
        <View
          style={{
            flexDirection: 'row',
            width: '50%',
            flex: 1,
            margin: 10,
            marginTop: 60,
          }}>
          <TouchableOpacity
            style={[AppStyles.canButtonContainer, {flex: 1, marginRight: 10}]}
            onPress={e => closeDialog(e)}>
            <Text style={AppStyles.canButtonTxt}>CANCEL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[AppStyles.successBtn, {flex: 1}]}
            onPress={e => handleSubmit(e)}
            disabled={apiStatus}>
            <Text style={AppStyles.successText}>OK</Text>
          </TouchableOpacity>
        </View>
        {binErr && binErr.length ? (
          <Text style={{color: 'red', fontSize: 12, padding: 2, margin: 10}}>
            {' '}
            {binErr}{' '}
          </Text>
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    margin: 1,
  },
});
