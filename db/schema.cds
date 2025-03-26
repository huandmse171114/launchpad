namespace ns;

using {
    Country ,
    Currency ,
    Language ,
    User ,
    cuid ,
    managed ,
    temporal
} from '@sap/cds/common';

entity  Users: cuid, managed {
    username: String(10);
    email: String(50);
}
