using {ns} from '../db/schema';

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
    tiles    : many Tile;
}

service Users {

    entity Users as projection on ns.Users;
    function getUsersLaunchpadTiles(username: String) returns LaunchpadTilesResponse;

}
