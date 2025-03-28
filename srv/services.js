const cds = require("@sap/cds")
module.exports = async (srv) => {

    srv.on("getUsersLaunchpadTiles", async (req) => {
        console.log('Running function getUsers()');

        let mockApps = [
            {
                appId: "prdedicated-4a1685dctrial-dev!t406116",
                title: "Purchase Requisition Dedicated",
                url: "https://4a1685dctrial-dev-prdedicated.cfapps.us10-001.hana.ondemand.com/",
                icon: "sap-icon://documents",
                roleCollections: []
            }
        ];

        const xsuaa = await cds.connect.to("xsuaa");
        const { username } = req.data;

        const { resources } = await xsuaa.get(`/Users?filter=username eq "${username}"`);

        if (resources.length === 1) {
            // Get user SCIM groups list (list of role collections)
            const userGroups = resources[0].groups;
            // Get list of role collections name (if needed)
            const userGroupsName = userGroups.map((group) => group.value);
            console.log("a");

            // Use a for…of loop instead of forEach for sequential execution
            for (const [index, mockApp] of mockApps.entries()) {
                console.log(index + "a");
                const rolesByAppId = await xsuaa.get(`/sap/rest/authorization/v2/apps/${mockApp.appId}/roles`);

                // Process roles sequentially using for…of
                for (const [roleIndex, role] of rolesByAppId.entries()) {
                    console.log(roleIndex + "b");
                    const roleCollectionsByRole = await xsuaa.get(
                        `/sap/rest/authorization/v2/rolecollections/roles/${mockApp.appId}/${role.roleTemplateName}/${role.name}`
                    );
                    // Merge the roleCollections returned into the mockApp's roleCollections array
                    mockApp.roleCollections = [...mockApp.roleCollections, ...roleCollectionsByRole];
                }
                console.log("b");
                mockApp.roleCollections = mockApp.roleCollections.filter((item, index, self) =>
                    index === self.findIndex((t) => t.name === item.name)
                  );
            }
            console.log("c");
            console.log(mockApps)
            console.log(userGroups)

            //loop at the mockApps list, if the mock app has the roleCollections in the list
            //userGroups base on roleCollections.name and userGroupsName, then get that mock 
            //app, otherwise remove from the list
            mockApps = mockApps.filter(app => 
                app.roleCollections.some(rc => userGroupsName.includes(rc.name))
            );
        }

        const tiles = mockApps.map((app, index) => {
            return {
                id: `App${index}`,
                tileType: "sap.ushell.ui.tile.StaticTile",
                properties: {
                    title: app.title,
                    targetURL: `#app${index}-display`,
                    icon: app.icon
                },
                inbound: {
                    semanticObject: `app${index}`,
                    action: "display",
                    title: app.title,
                    signature: {
                        parameters: {},
                        additionalParameters: "allowed"
                    },
                    navigationMode: "explace",
                    resolutionResult: {
                        applicationType: "URL",
                        url: app.url
                    }
                }
            }
        })

        return {
            username: username,
            tiles: tiles
        };

        // Calling App Router API to get current user.
        // App Router only works on deployment, not setup for local testing yet
        // const mockCurrentUser = {
        //     firstname: "Huan",
        //     lastname: "Dinh",
        //     email: "minhhuan0507@gmail.com",
        //     name: "minhhuan0507@gmail.com",
        //     scopes: [
        //       "openid"
        //     ],
        //     displayName: "Huan Dinh (minhhuan0507@gmail.com)"
        //   }

        // const mockApp = [{
        //     appId: "prdedicated-4a1685dctrial-dev!t406116"
        // }]

        // // var apps = await xsuaa.get("/sap/rest/authorization/v2/apps")
        // var roleCollections = await xsuaa.get("/sap/rest/authorization/v2/rolecollections")

        // // Getting current user data on XSUAA - contains user specific list of SCIM groups (role collections)
        // var { resources } = await xsuaa.get(`/Users?filter=username eq "${mockCurrentUser.name}"`)
        // // Return exactly one current user
        // if (resources.length === 1) {
        //     // Get user SCIM groups list (list of role collections)
        //     var userGroups = resources[0].groups;
        //     // Get list of role collections name
        //     var userGroupsName = userGroups.map((group) => group.value)

        //     mockApp.forEach(async (mockApp) => {
        //         var rolesByAppId = await xsuaa.get(`/sap/rest/authorization/v2/apps/${mockApp.appId}/roles`)

        //     })

        // }

    })
}