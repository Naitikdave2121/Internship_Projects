const cds=require("@sap/cds");
;

const handeler=require('./handeler');

module.exports=cds.service.impl(srv=>{
    srv.on('READ','tbl',handeler._getKpidetail);
    srv.on('CREATE','tbl2',handeler.postkpidetail);
    srv.on('POST','ExcelUpload',handeler.Postdata);
    srv.on('CREATE','Students',handeler.Poststudent)
    srv.on('READ','Students',handeler.getstudent)
    srv.on('CREATE','kpilist',handeler.Postkpidata);
    srv.on('READ','Department',handeler.insertdeprt);
    srv.on('READ','empinfo',handeler.employee)
    srv.on("READ",'s1',handeler.stu);
    srv.on("READ",'e1',handeler.s1);
})
