namespace srv;
using db from '../db/schema';


service Catalog{
   entity kpilist as projection on db.productlist;
    action UPLOAD(file: String);
}