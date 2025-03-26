using { ns } from '../db/schema';

service CommonSrv {

    entity Users as projection on ns.Users;

    function getUsers() returns String;
}