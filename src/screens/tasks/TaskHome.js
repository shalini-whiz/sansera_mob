import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {Badge} from 'react-native-paper';
import UserContext from '../UserContext';
import {useIsFocused} from '@react-navigation/native';
import {appTheme} from '../../lib/Themes';
import {EmptyBinContext} from '../../context/EmptyBinContext';
import {EmptyBin} from './EmptyBin';
import {BinTask} from './BinTask';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default TaskHome = React.memo(props => {
  const isFocused = useIsFocused();
  const [tab, setTab] = useState('emptyBin');
  const [stage, setStage] = useState('');

  const {unReadEmptyBin, unReadFilledBin, appProcess} =
    React.useContext(EmptyBinContext);

  useEffect(async () => {
    if (isFocused) {
      const Stage = await AsyncStorage.getItem('stage');
      setStage(Stage);
      if (Stage === 'Dispatch') {
        setTab('filledBin');
      }
    }
  }, [isFocused, appProcess]);

  console.log('Stage++++', stage);

  const tabChange = value => {
    setTab(value);
  };
  const reloadPage = response => {
    props.updateProcess();
  };

  // console.log(JSON.stringify(appProcess.process));

  return (
    <View style={styles.mainContainer}>
      <View
        style={{flexDirection: 'row', backgroundColor: 'white', padding: 10}}>
        {stage && stage !== 'Dispatch' ? ( //UI_Enhancement issue 15
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              padding: 8,
              borderRadius: 15,
              backgroundColor:
                tab === 'emptyBin'
                  ? appTheme.colors.cardTitle
                  : appTheme.colors.inactiveTab,
            }}
            onPress={e => tabChange('emptyBin')}>
            <Text
              style={[
                styles.filterText,
                {
                  fontFamily: appTheme.fonts.bold,
                  color:
                    tab === 'emptyBin' ? 'white' : appTheme.colors.cardTitle,
                },
              ]}>
              Empty Bin Request
            </Text>
            {/* {unReadEmptyBin && unReadEmptyBin !== "0" ?               
            <Badge style={{ color: 'white',position:'absolute',top:-10,left:150 }}
              containerStyle={{ top: -25, left: 40 }}>{unReadEmptyBin}</Badge>  : false} */}
          </TouchableOpacity>
        ) : (
          false
        )}

        {stage && (stage === 'Dispatch' || stage === 'Shearing') ? ( //UI_Enhancement issue 15
          false
        ) : (
          <Text style={{padding: 8}}> / </Text>
        )}

        {stage && stage !== 'Shearing' ? ( //UI_Enhancement issue 15
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              padding: 8,
              borderRadius: 15,
              backgroundColor:
                tab === 'filledBin'
                  ? appTheme.colors.cardTitle
                  : appTheme.colors.inactiveTab,
            }}
            onPress={e => tabChange('filledBin')}>
            <Text
              style={[
                styles.filterText,
                {
                  fontFamily: appTheme.fonts.bold,
                  color:
                    tab === 'filledBin' ? 'white' : appTheme.colors.cardTitle,
                },
              ]}>
              Filled Bin Request
            </Text>

            {/* {unReadFilledBin && unReadFilledBin !== "0" ?
            <Badge style={{ color: 'white', position: 'absolute', top: -8, left: 140 }}
              containerStyle={{ top: -25, left: 40 }}>{unReadFilledBin}</Badge> : false} */}
          </TouchableOpacity>
        ) : (
          false
        )}
      </View>
      {tab === 'emptyBin' ? <EmptyBin reloadPage={reloadPage} /> : false}
      {tab === 'filledBin' ? <BinTask reloadPage={reloadPage} /> : false}
    </View>
  );
});

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: 'center',
    margin: 10,
  },
});
