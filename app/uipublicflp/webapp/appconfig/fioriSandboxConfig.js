(async function () {
  "use strict";

  let currentUser;

  try {
    const res = await fetch('/user-api/currentUser');

    // Handle non-OK responses
    if (!res.ok) {
      if (res.status === 401) {
        window.open(window.location.href, "_self");
        return;
      }
      throw new Error(res.statusText);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      window.open(window.location.href, "_self");
      return;
    }
    currentUser = await res.json();

  } catch (error) {
    console.warn("Error: User infos could not be fetched");
    console.warn(`Error: ${error}`);

    //Setup demo user for local testing
    currentUser = {
      firstname: "Demo",
      lastname: "User",
      email: "minhhuan0507@gmail.com",
      name: "minhhuan0507@gmail.com",
      scopes: [
        "openid"
      ],
      displayName: "Huan Dinh (minhhuan0507@gmail.com)"
    }
  }

  if (currentUser) {
    console.log(currentUser);

    await fetch(`/odata/v4/users/getUsersLaunchpadTiles(username='${currentUser.name}')`)
      .then(response => {
        if (!response.ok) {
          console.log(response)
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.status === 200) {
          console.log(data.tiles);
          const inbounds = data.tiles.reduce((acc, item) => {
            acc[item.id] = item.inbound;
            return acc;
          }, {});

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
                    firstName: currentUser.firstname,
                    lastName: currentUser.lastname,
                    fullName: `${currentUser.firstname} ${currentUser.lastname}`,
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
                          const { inbound, ...userTile } = tile;
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
          console.log(data);
        }
      })
      .catch(error => {
        console.error("Error fetching unbound function:", error);
        console.log(error)
      });
  } else {
    console.error("Error: User infos empty");
  }

  // Now that the configuration is ready, dynamically load the UI5 bootstrap script
  const script = document.createElement("script");
  script.id = "sap-ui-bootstrap";
  script.src = "https://sapui5.hana.ondemand.com/1.132.1/resources/sap-ui-core.js";
  script.setAttribute("data-sap-ui-theme", "sap_horizon");
  script.setAttribute("data-sap-ui-resourceroots", '{"uipublicflp": "./"}');
  script.setAttribute("data-sap-ui-language", "en");
  script.setAttribute("data-sap-ui-oninit", "module:sap/ui/core/ComponentSupport");
  script.setAttribute("data-sap-ui-compatVersion", "edge");
  script.setAttribute("data-sap-ui-async", "true");
  script.setAttribute("data-sap-ui-frameOptions", "trusted");
  document.head.appendChild(script);

}());
