import React, { useState } from "react";
import { Alert, Modal, StyleSheet, Text, Pressable, View,TouchableOpacity } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { appTheme } from "../lib/Themes";

const CustomModal = (props) => {
  const [modalVisible, setModalVisible] = useState(props.modalVisible);
  
  return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={[styles.centeredView,{width:'100%'}]}>
            <View style={[styles.modalView,{}]}>
            <Text style={[styles.modalTitle,{}]}>{props.dialogTitle}</Text>
          {props.dialogMessage ? 
          <Text style={[styles.modalMessage, {  }]}>{props.dialogMessage}</Text>
 : false}

            <View style={{}}>
            {props.container}
            </View>


          {props.okDialog && props.closeDialog ?
            <View style={{
              flexDirection: 'row', display: 'flex', marginRight: 20, marginLeft: 20,
              alignSelf: 'center',marginBottom:10
            }}>
              <TouchableOpacity
                style={[styles.canButtonContainer, { flexDirection: 'row' }]}
                onPress={(e) => props.closeDialog(e)} >
                <Text style={styles.canButtonTxt}>CANCEL</Text>
                {/* <SvgCss xml={CancelIcon(appTheme.colors.cancelActionTxt)} width={15} height={15} style={{ margin: 2 }} /> */}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sucButtonContainer, { flexDirection: 'row', backgroundColor: appTheme.colors.successAction }]}
                disabled={false} activeOpacity={.5} onPress={(e) => props.okDialog(e)} >
                <Text style={styles.sucButtonText}>{props.okTitle ? props.okTitle : 'OK'}</Text>
                {/* <SvgCss xml={TickIcon(appTheme.colors.successActionTxt)} width={20} height={20} style={{ margin: 2 }} /> */}

              </TouchableOpacity>
            </View> : false}

          {props.okDialog && !props.closeDialog ? <View style={{
            flexDirection: 'row', display: 'flex', marginRight: 20, marginLeft: 20,
            alignSelf: 'center', marginBottom: 10,width:'50%'
          }}>
            
            <TouchableOpacity
              style={[styles.sucButtonContainer, { flexDirection: 'row', backgroundColor: appTheme.colors.successAction }]}
              disabled={false} activeOpacity={.5} onPress={(e) => props.okDialog(e)} >
              <Text style={styles.sucButtonText}>OK</Text>
            </TouchableOpacity>
          </View> : false }
          

          {!props.okDialog && props.closeDialog ? <View style={{
            flexDirection: 'row', display: 'flex', marginRight: 20, marginLeft: 20,
            alignSelf: 'center', marginBottom: 10, width: '50%',
          }}>

            <TouchableOpacity
              style={[styles.sucButtonContainer, { flexDirection: 'row', backgroundColor: appTheme.colors.successAction }]}
              disabled={false} activeOpacity={.5} onPress={(e) => props.closeDialog(e)} >
              <Text style={styles.sucButtonText}>OK</Text>
            </TouchableOpacity>
          </View> : false}
          </View>
          </View>
      </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    width:'100%',
    justifyContent: "flex-end",
    alignItems: "center",
    //marginTop: 12,
    marginBottom:10,
  
  },
  modalView: {
    margin: 1,
    backgroundColor: "white",
    borderTopLeftRadius:30,
    borderTopRightRadius:30,
    padding: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width:'90%',
    //height:''
  },
  modalTitle: {
    padding: 20,
    fontSize: 28,
    textAlign: 'center',
    color: appTheme.colors.cardTitle,
    fontFamily: appTheme.fonts.bold
  },
  modalMessage:{
    padding: 20,
    fontSize: 18,
    textAlign: 'center',
    color: appTheme.colors.message,
    fontFamily:appTheme.fonts.regular
  },
  sucButtonContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 25,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    backgroundColor: appTheme.colors.successAction,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 3,
  },
  canButtonContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 25,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    backgroundColor: appTheme.colors.cancelAction,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 3,
  },
  canButtonTxt: {
    color: appTheme.colors.cancelActionTxt,
    fontSize: 14,
    margin: 5,
    fontFamily: appTheme.fonts.bold

  },
  sucButtonText: {
    color: appTheme.colors.successActionTxt,
    fontSize: 14,
    margin: 5,
    fontFamily: appTheme.fonts.bold
  },

});

export default CustomModal;