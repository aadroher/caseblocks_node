const Caseblocks = require('./index')
Caseblocks.setup("http://localhost:8888", "3moqKdEXNVs-N_P_3DM8");

Caseblocks.Bucket.get(7, 'claims').then((bucket) => {
  bucket.cases().then((cases) => {
    console.log("no. of cases", cases.length)
  }).catch((err) => console.error(err)) 
}).catch((err) => console.error(err)) 

Caseblocks.Bucket.get(7, 'claims', 'current_state', 'Rejected').then((bucket) => {
  bucket.cases().then((cases) => {
    console.log("no. of cases", cases.length)
  }).catch((err) => console.error(err)) 
}).catch((err) => console.error(err)) 
