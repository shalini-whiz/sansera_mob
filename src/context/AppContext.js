import React from 'react';

export default React.createContext({
  userEntity:{},
  processStage: '',
  appProcess:'',
  taskCount:0,
  emptyBinCount: 0,
  filledBinCount:0,
  setUserEntity:(user) => {},
  setProcessStage : (stage) => {console.log("stage 123 "+stage)
  
  },
  setAppProcess: (process) => { },
  setTaskCount:(count) => {},
  setEmptyBinCount:(count) => {},
  setFilledBinCount:(count) => {},
 
});