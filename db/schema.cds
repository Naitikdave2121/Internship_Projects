namespace db;

entity tbl1{
    ID : Integer;
    Name : String(30);
    Address : String(40);
}
entity Naitik3{
  Id:Integer;
  Name:String(30);
}

entity dave2{
  Name:Integer;
  Address:String(40);
}
entity tb43{
  Name:String(34);
  Add:String(50);
}
entity tbl3{
  ID:Integer;
  Name:String(40);
  Add:String(40)
}
entity Students{
  Dashboard_Id:Integer;
  Dashboard_Name:String(23);
  Chart_Id:Integer;
  Chart_Name:String(23);
  chart_Type:String(24);
  Measures:String(30);
  Dimensions:String(32);
  TableName:String(32);
  Color:String(25);

}

entity empinfo
{
    Emp_Id:Integer; 
    Name:String(28);
    Address:String(34);
    Salary:String(32);
}
entity shubham2{
  Shu_id:Integer;
  Name:String(30)
}

entity kpilist{
  first_name: String(50);
  last_name : String(60);
  email : String(70);
  gender : String(20);
  }

entity productlist{
  Name:String(50);
  Address:String(60);
  Location : String(70);
}

entity Department{
  Name:String(70);
  EmpCount:Integer64;
}
