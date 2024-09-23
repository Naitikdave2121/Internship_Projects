sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox",
  "sap/ui/unified/FileUploaderParameter"
], function (Controller, MessageBox, FileUploaderParameter) {
  "use strict";

  return Controller.extend("naitik.project1.controller.View1", {

    onInit: function () {
      
  
    },

    onOk: function () {
      var oFileUploader = this.byId("fileUp");
    
      if (oFileUploader.getValue()) {
        var oFile = oFileUploader.oFileUpload.files[0];
        this.readExcelFileAndUpload(oFile);
      } else {
        MessageBox.error("Please select an Excel file");
      }
    },
    
    readExcelFileAndUpload: function (file) {
      var reader = new FileReader();
    
      reader.onload = function (e) {
        var data = e.target.result;
        var workbook = XLSX.read(data, { type: 'binary' });
        var sheetName = workbook.SheetNames[0];
        var excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
        
        var jsonData = excelData.map(function (record) {
          return {
            first_name: record.first_name,
            last_name: record.last_name,
            email: record.email,
            gender: record.gender
          };
        });
    
        console.log("Transformed JSON Data:", jsonData);
    
        this.uploadExcelDataToBackend(jsonData);
      }.bind(this);
    
      reader.readAsBinaryString(file);
    },
    
    uploadExcelDataToBackend: function (excelData) {
      var oModel = this.getView().getModel("mainModel");
      var oBinding = oModel.bindList("/kpilist");
    
      var totalRecords = excelData.length;
      var successfulUploads = 0;
    
      excelData.forEach(function (record) {
        oBinding.create(record, {
          headers: { "Content-Type": "application/json" },
          success: function (oData) {
            console.log("Data uploaded successfully", oData);
            successfulUploads++;
    
           if (successfulUploads === totalRecords) {
              MessageBox.success(oData.message || "All records uploaded successfully");
            }
          },
          error: function (oError) {
            console.error("Error uploading data", oError);
            MessageBox.error("Error uploading data");
          }
        });
      });
    
      console.log("All records processed");
    },
    
     
    
  oncreate: function () {
      var oModel = this.getOwnerComponent().getModel("mainModel");
      var oBinding = oModel.bindList("/Students");

      // Creating a new entry
      var oNewEntryContext = oBinding.create({
        name: this.byId("name").getValue(),
        address: this.byId("add").getValue(),
        mn: this.byId("mn").getValue()
      });
    },

    onSubmit: function () {
      var name = this.byId("name").getValue();
      var address = this.byId("add").getValue();

      // Create a new entry with static data
      var oNewEntry = {
        ID: 1,
        Name: name,
        Address: address
      };

      // Get the OData model
      var oModel = this.getOwnerComponent().getModel("mainModel");

      // Get the binding for creating a new entry
      var oBinding = oModel.bindList("/tbl2");

      // Create a new entry in the binding
      oBinding.create(oNewEntry, {
        // Callback function for a successful creation
        success: function (oData) {
          console.log("Data sent successfully to service", oData);
          MessageBox.success("Data sent successfully to service");
        },
        // Callback function for an unsuccessful creation
        error: function (oError) {
          console.error("Error sending data to service", oError);
          // Optionally, show an error message
          MessageBox.error("Error sending data to service");
        }
      });
    },

    showError: function (message) {
      MessageBox.error(message);
    }

  });
});
