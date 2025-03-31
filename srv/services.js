const cds = require("@sap/cds")
module.exports = async (srv) => {

    srv.on("getUsersLaunchpadTiles", async (req) => {
        //Define all of the launchpad applications here
        let mockApps = [
            {
                appId: "prdedicated-4a1685dctrial-dev!t406116",
                title: "Purchase Requisition",
                url: "https://4a1685dctrial-dev-prdedicated.cfapps.us10-001.hana.ondemand.com/",
                icon: "sap-icon://documents",
                roleCollections: []
            }
        ];

        //Connect to UXSUAA API
        const xsuaa = await cds.connect.to("xsuaa");

        //Get current user 
        const { username } = req.data;

        //If request does not contain username parameter
        if (!username) {
            return {
                username: undefined,
                status: 400, //Bad Request
                message: "Please provide username parameter",
                tiles: undefined
            }
        }

        //Get user data on XSUAA
        const { resources } = await xsuaa.get(`/Users?filter=username eq "${username}"`);

        if (resources.length === 1) {
            // Get user SCIM groups list (list of role collections)
            const userGroups = resources[0].groups;
            // Get list of role collections name
            const userGroupsName = userGroups.map((group) => group.value);

            for (const [index, mockApp] of mockApps.entries()) {
                let rolesByAppId;
                let appNotFound = false;

                try {
                    // Get list of Roles based on Application ID
                    rolesByAppId = await xsuaa.get(`/sap/rest/authorization/v2/apps/${mockApp.appId}/roles`);
                } catch (e) {
                    console.log(e)
                    //Application ID is not found
                    appNotFound = true;
                }

                if (appNotFound) {
                    //Remove not found application from the list
                    mockApps = [...mockApps.slice(0, index), ...mockApps.slice(index + 1)]
                } else {
                    // Get list of Role Collections if the Application is required roles
                    // If not, just remain empty list
                    if (rolesByAppId) {
                        for (const [roleIndex, role] of rolesByAppId.entries()) {
                            let roleCollectionsByRole;
                            try {
                                roleCollectionsByRole = await xsuaa.get(
                                    `/sap/rest/authorization/v2/rolecollections/roles/${mockApp.appId}/${role.roleTemplateName}/${role.name}`
                                );
                            } catch (e) {
                                console.log(e)
                            }

                            // Merge the roleCollections returned into the mockApp's roleCollections array
                            mockApp.roleCollections = [...mockApp.roleCollections, ...roleCollectionsByRole];
                        }

                        if (!mockApp.roleCollections) {
                            //Application requires roles, but there is no role collection exist for specific roles
                            //=> User cannot access to the application => remove empty role collections 
                            //application from the list
                            mockApps = [...mockApps.slice(0, index), ...mockApps.slice(index + 1)]
                        }
                        //Remove duplicate role collections in the list
                        mockApp.roleCollections = mockApp.roleCollections.filter((item, index, self) =>
                            index === self.findIndex((t) => t.name === item.name)
                        );
                    }
                }

            }

            //Loop at the mockApps list, if the mock app that is required no role (empty role collections list) 
            //or has the roleCollections in the list userGroups base on roleCollections.name and userGroupsName, 
            //then get that mock app, otherwise remove from the list
            mockApps = mockApps.filter(app =>
                app.roleCollections.some(rc => userGroupsName.includes(rc.name)) || app.roleCollections.length === 0
            );
        } else {
            return {
                username: username,
                status: 404, //Not Found
                message: `User ${username}'s data is not found`,
                tiles: undefined
            }
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
            tiles: tiles,
            status: tiles ? 200 : 204,
            message: tiles ? `Found ${tiles.length} tiles for user ${username}` : `No tile found for user ${username}`
        };

    })
}