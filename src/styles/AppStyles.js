import { StyleSheet } from "react-native";
import { appTheme } from "../lib/Themes";


export default StyleSheet.create({
  successBtn: {
    width: "30%",
    borderRadius: 15,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appTheme.colors.warnAction,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
  successText: {
    color: appTheme.colors.warnActionTxt,
    fontFamily: appTheme.fonts.bold
  },
  canButtonContainer: {
    width: "30%",
    borderRadius: 15,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appTheme.colors.cancelAction,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 3,
  },
  canButtonTxt: {
    color: appTheme.colors.cancelActionTxt,
    fontFamily: appTheme.fonts.bold
  },
  warnButtonContainer: {
    width: "30%",
    borderRadius: 15,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appTheme.colors.warnAction,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 3,
  },
  warnButtonTxt: {
    color: appTheme.colors.warnActionTxt,
    fontFamily: appTheme.fonts.bold
  },
  radioText: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 16,
    backgroundColor: "#ECF0FA",

   fontFamily: appTheme.fonts.regular
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: appTheme.fonts.regular,
    padding: 5,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: appTheme.fonts.regular,
  },
  subtitle:{
    fontSize: 16,
    fontFamily: appTheme.fonts.regular,
  },
  error: {
    color: "red",
    fontSize: 14
  },
});