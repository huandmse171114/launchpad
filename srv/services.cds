

type Tile {
    id            : String;
    titleType     : String;
    properties    : {
        title     : String;
        targetURL : String;
        icon      : String;
    };
    inbound       : Inbound;
}

type Inbound {
    semanticObject           : String;
    action                   : String;
    title                    : String;
    signature                : {
        parameters           : {};
        additionalParameters : String;
    };
    navigationMode           : String;
    resolutionResult         : {
        applicationType      : String;
        url                  : String;
    }
}

type LaunchpadTilesResponse {
    username :      String;
    status   :      Int16;
    message  :      String;
    tiles    : many Tile;
}

service Users {
    function getUsersLaunchpadTiles(username : String) returns LaunchpadTilesResponse;
}
