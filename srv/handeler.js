// handeler.js
const cds = require("@sap/cds");
const execute = require("@sap/cds/libx/_runtime/hana/execute");
const req = require("express/lib/request");
const xlsx = require('xlsx');

module.exports.getstudent=async function(req){
    const {Students}=cds.entities();
    const tx=cds.transaction(req);
    const select=await tx.run(SELECT.from(Students));
    console.log(select);
    return select;
},
module.exports.stu=async function(req){
    const {Students}=cds.entities();
    const tx=cds.transaction(req);
    const s1=await tx.run(SELECT.from(Students));
    console.log(s1);
    return s1;
}
module.exports.s1=async function(req){
    const {empinfo}=cds.entities();
    const tx=cds.transaction(req);
    const s2=await tx.run(SELECT.from(empinfo));
    console.log(s2);
    return s2;
},
module.exports.employee=async function(req){
    const {empinfo}=cds.entities();
    const tx=cds.transaction();
    const select1=await tx.run(SELECT.from(empinfo));
    console.log(select1);
    return select1;
}
module.exports.Poststudent = async function (req) {
    console.log("handling POST request for Students");
    const {Students}=cds.entities();
    const {chart_Type,Dashboard_Name,Measures,Dimensions,Chart_Name,TableName,Color}=req.data;
    const tx = cds.transaction(req);
    const insertResult = await tx.run(INSERT.into(Students).entries([{chart_Type,Dashboard_Name,Measures, Dimensions,Chart_Name,TableName,Color}]));
    console.log("insert result", insertResult);
    // Check if values array exists and log the inserted data
    if (insertResult.values && insertResult.values.length > 0) {
        const insertedData = insertResult.values[0];
        console.log("inserted data", insertedData);
    }

    return insertResult;

    
    

};
module.exports._getKpidetail = async function (req) {
    console.log("executed select statement");
    const { tbl1 } = cds.entities();
    const tx = cds.transaction(req);
    const read_data = await tx.run(SELECT.from(tbl1));
    console.log("read data", read_data);
    return read_data;
};

module.exports.postkpidetail = async function (req) {
    console.log("post request executed");

    const { tbl1 } = cds.entities();
    const tx = cds.transaction(req);
    const { ID, Name, Address } = req.data;
    const insertResult = await tx.run(INSERT.into(tbl1).entries([{ Name, Address }]));

    console.log("insert result", insertResult);

    // Check if values array exists and log the inserted data
    if (insertResult.values && insertResult.values.length > 0) {
        const insertedData = insertResult.values[0];
        console.log("inserted data", insertedData);
    }
    return insertResult;
};

module.exports.Postdata = async function (req) {
    console.log("successfully connected frontend and backend");
};

module.exports.Postkpidata = async function (req) {
    console.log("welcome excel file uploading please");
};

module.exports.insertexceldata = async function (req) {
    console.log("execute");
};

module.exports.insertdeprt=async function(req){
    const {Department}=cds.entities();
    const tx = cds.transaction(req);
    const read_data = await tx.run(SELECT.from(Department));
    console.log("read data", read_data);
    return read_data;

}
module.exports.Postkpidata = async function (req) {
    const { kpilist } = cds.entities();
    const { first_name, last_name, email,gender } = req.data;
    
    const tx = cds.transaction(req);

    try {
        const insertResult = await tx.run(
            INSERT.into(kpilist).columns('first_name', 'last_name', 'email','gender').values(first_name, last_name, email,gender)
        );

        if (insertResult) {
            return { success: true, message: "Data uploaded successfully" };
        }
    } catch (error) {
        console.error("Error uploading data", error);

        // Send error response to the client with an error message
        return { success: false, message: "Error uploading data", error: error.message };

};
module.exports.Poststudent=async function(req){
    console.log("welcome naitik in the service");
}
}




