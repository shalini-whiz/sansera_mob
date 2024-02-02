
import React, {Component, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {BatchBoard} from './BatchBoard';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {FifoBoard} from '../process/FifoBoard';
import {appTheme} from '../../lib/Themes';

const FifoHome = () => {
  const [Fifo, setFifo] = useState('Batch');
  return (
    <View style={styles.container}>
      <View style={styles.buttonsWrapper}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            padding: 8,
            borderRadius: Fifo === 'Batch' ? 15 : 0,
            backgroundColor:
              Fifo === 'Batch' ? appTheme.colors.cardTitle : 'white',
          }}
          onPress={() => {
            setFifo('Batch');
          }}>
          <Text
            style={[
              styles.filterText,
              {
                fontFamily:
                  Fifo === 'Batch'
                    ? appTheme.fonts.bold
                    : appTheme.fonts.regular,
                color: Fifo === 'Batch' ? 'white' : appTheme.colors.cardTitle,
              },
            ]}>
            BATCH FIFO
          </Text>
        </TouchableOpacity>
        <Text style={{padding: 5}}> / </Text>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            padding: 8,
            borderRadius: Fifo === 'Process' ? 15 : 0,
            backgroundColor:
              Fifo === 'Process' ? appTheme.colors.cardTitle : 'white',
          }}
          onPress={() => {
            setFifo('Process');
          }}>
          <Text
            style={[
              styles.filterText,
              {
                fontFamily:
                  Fifo === 'Process'
                    ? appTheme.fonts.bold
                    : appTheme.fonts.regular,
                color: Fifo === 'Process' ? 'white' : appTheme.colors.cardTitle,
              },
            ]}>
            PROCESS FIFO
          </Text>
        </TouchableOpacity>
      </View>

      {Fifo && Fifo === 'Batch' ? <BatchBoard /> : <FifoBoard />}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonsWrapper: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  text: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'black',
  },
});

export default FifoHome;
