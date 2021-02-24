const fs = require('fs');

const universities = require('./universities.json').slice(0,1)
const DATA = universities.map((u,i)=>({...u,ID:i}))
let data = JSON.stringify(DATA);

fs.writeFileSync('uni_core_ids.json', data);
console.log(DATA.length)

