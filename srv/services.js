const cds = require("@sap/cds")
module.exports = async (srv) => {
    
    srv.on("getUsers", async (req) => {
        console.log('Running function getUsers()')
    })
}