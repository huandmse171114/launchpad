import { fetchUser } from './fioriSandboxUser.js'

(async function () {
  "use strict";
  const customHost = document.cookie.match('(^|;)\\s*' + 'x-custom-host' + '\\s*=\\s*([^;]+)')?.pop() || ''
  await fetchUser()

  await fetch(`/odata/v4/users/getUsersLaunchpadTiles(username='${window.currentUser.name}')`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.tiles) {
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
      }
    })
    .catch(error => {
      console.error("Error fetching unbound function:", error);
    });

}());