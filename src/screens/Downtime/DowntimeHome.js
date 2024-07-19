import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {appTheme} from '../../lib/Themes';
import StartDowntime from './StartDowntime';
import EndDowntime from './EndDowntime';

export default DowntimeHome = React.memo(props => {
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const [tab, setTab] = useState('');

  useEffect(() => {
    if (isFocused) {
      if (tab === '') setTab('start');
    }
    return () => {};
  }, [isFocused]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, []);

  const tabChange = value => {
    setTab(value);
  };

  return (
    <View style={{flexDirection: 'column', flex: 1}}>
      <View
        style={{flexDirection: 'row', backgroundColor: 'white', padding: 10}}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            padding: 8,
            borderRadius: 15,
            backgroundColor:
              tab === 'start'
                ? appTheme.colors.cardTitle
                : appTheme.colors.inactiveTab,
          }}
          onPress={e => tabChange('start')}>
          <Text
            style={[
              styles.filterText,
              {
                fontFamily: appTheme.fonts.bold,
                color:
                  tab === 'start'
                    ? 'white'
                    : appTheme.colors.cardTitle,
              },
            ]}>
           Start Downtime{' '}
          </Text>
        </TouchableOpacity>
        <Text style={{padding: 8}}> / </Text>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            padding: 8,
            borderRadius: 15,
            backgroundColor:
              tab === 'end'
                ? appTheme.colors.cardTitle
                : appTheme.colors.inactiveTab,
          }}
          onPress={e => tabChange('end')}>
          <Text
            style={[
              styles.filterText,
              {
                fontFamily: appTheme.fonts.bold,
                color: tab === 'end' ? 'white' : appTheme.colors.cardTitle,
              },
            ]}>
            End Downtime{' '}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.mainContainer, {flex: 4}]}>
        {tab === 'start' ? <StartDowntime /> : false}
        {/* Inventory and FIFO board SWAP. */}
        {tab === 'end' ? <EndDowntime /> : false}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: 'center',
    margin: 10,
  },
});
