import { fetchUser } from './fioriSandboxUser.js'

(async function () {
  "use strict";
  const customHost = document.cookie.match('(^|;)\\s*' + 'x-custom-host' + '\\s*=\\s*([^;]+)')?.pop() || ''
  await fetchUser()

  const currentUser = window.currentUser

  await fetch(`/odata/v4/users/getUsersLaunchpadTiles(username='${currentUser.name}')`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.status === 200) {
        console.log(data.tiles)
        const inbounds = data.tiles.reduce((acc, item) => {
          acc[item.id] = item.inbound;
          return acc;
        }, {})

        window["sap-ushell-config"] = {
          defaultRenderer: "fiori2",
          renderers: {
            fiori2: {
              componentData: {
                config: {
                  enableSearch: true,
                  rootIntent: "Shell-home"
                },
              },
            },
          },

          services: {
            Container: {
              adapter: {
                config: {
                  id: currentUser.id,
                  firstName: currentUser.firstName,
                  lastName: currentUser.lastName,
                  fullName: currentUser.fullName,
                  email: currentUser.email
                }
              }
            },
            LaunchPage: {
              adapter: {
                config: {
                  catalogs: [],
                  groups: [
                    {
                      id: "MyHome",
                      title: "Custom Launchpad",
                      isPreset: false,
                      isVisible: true,
                      isGroupLocked: false,
                      tiles: []
                    },
                    {
                      id: "InternalSubaccount",
                      title: "Applications",
                      isPreset: false,
                      isVisible: true,
                      isGroupLocked: false,
                      tiles: data.tiles.map(tile => {
                              const { inbound, ...userTile } = tile
                              return userTile;
                            })
                    }
                  ]
                }
              }
            },
            NavTargetResolution: {
              config: {
                enableClientSideTargetResolution: true
              }
            },
            ClientSideTargetResolution: {
              adapter: {
                config: {
                  inbounds: inbounds
                }
              }
            }
          }
        };
      } else {
        console.log(data)
      }
    })
    .catch(error => {
      console.error("Error fetching unbound function:", error);
    });
}());