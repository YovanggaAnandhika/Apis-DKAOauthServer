import {MariaDB} from "@dkaframework/database";


export const DB = new MariaDB({
    host : "localhost",
    user : "developer",
    password : "Cyberhack2010",
    database : "dka",
    checkDuplicate : false
});