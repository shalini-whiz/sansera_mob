const HexaStageSingle = (color, name) => `<svg xmlns="http://www.w3.org/2000/svg"  width="250" height="300" >
  <polygon fill="white" stroke=${color}  
  points="60 13, 110 38, 110 85,60 110, 13 85, 13 35" 
  stroke-width="6"/>
      <text x="62" y="65" text-anchor="middle" fill="#10297e" font-size="16">${name}</text>
</svg>`



const HexaStageDouble = (color, name1, name2) => `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="350" >
  <polygon fill="white" stroke=${color}  points="60 13, 110 38, 110 85,60 110, 13 85, 13 35" 
  stroke-width="6"/>
      <text x="52" y="55" text-anchor="middle" fill="#10297e" font-size="16">
        <tspan x="62" y="42" dy="15">${name1}</tspan>
        <tspan x="60" y="50" dy="25">${name2}</tspan></text>
</svg>
`



export {HexaStageSingle, HexaStageDouble }