const cds = require("@sap/cds")
module.exports = async (srv) => {
    
    srv.on("getUsers", async (req) => {
        console.log('Running function getUsers()')
        const xsuaa = await cds.connect.to("xsuaa")
        console.log(xsuaa)

        const apps = await xsuaa.get("/sap/rest/authorization/v2/apps")
        const { resources } = await xsuaa.get("/Users")
        const rolesByAppId = await xsuaa.get("/sap/rest/authorization/v2/apps/prdedicated-4a1685dctrial-dev!t406116/roles")
        const roleCollections = await xsuaa.get("/sap/rest/authorization/v2/rolecollections")
    })
}