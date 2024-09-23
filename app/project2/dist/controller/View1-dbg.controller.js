sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/suite/ui/commons/ChartContainer",
    "sap/suite/ui/commons/ChartContainerContent",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem",
    "sap/ui/model/json/JSONModel",
    "sap/viz/ui5/controls/VizFrame",
    "sap/ui/unified/ColorPicker",
    "sap/ui/unified/ColorPickerPopover",
    "sap/m/MessageToast",
    "sap/base/Log"
],
function (Controller, ChartContainer, ChartContainerContent, FlattenedDataset, FeedItem, JSONModel, VizFrame, ColorPicker, ColorPickerPopover, Log) {
    "use strict";
    var oVizFrame;
    return Controller.extend("project2.project2.controller.View1", {
        onInit: function () {
            var oModel = this.getOwnerComponent().getModel("mainService");
            oModel.read("/Students", {
                success: function (response) {
                    var oJsonModel = new JSONModel();
                    oJsonModel.setData(response.results);
                    this.getView().setModel(oJsonModel, "studentsData");
                }.bind(this),
                error: function(error) {
                    Log.error("Error reading Students data: " + error);
                }
            });

            var ofilter = new sap.ui.model.Filter("Dashboard_Name", "EQ", "dash2");

            oModel.read("/Students", {
                filters: [ofilter],
                success: function (response) {
                    console.log(response.results);
                },
                error: function(error) {
                        console.error("Error reading filtered Students data: " + error);
                }
            });
        },

        onOpenColorPicker: function () {
            var that = this;
            var oColorInput = this.getView().byId("bgColorInput");
        
            var oColorPickerPopover = new sap.ui.unified.ColorPickerPopover({
                colorString: oColorInput.getValue(),
                change: function (oEvent) {
                    var sColor = oEvent.getParameter("colorString");
                    that.onChangeColor(sColor);
                },
                cancel: function () {
                    oColorPickerPopover.close();
                }
            });
        
            oColorPickerPopover.openBy(this.getView().byId("bgColorInput"));
        },
        
        onChangeColor: function (sColor) {
            console.log("Selected color:", sColor); // Print selected color to console
        
        
            var oInput = this.getView().byId("bgColorInput");
            if (oInput) {
                oInput.setValue(sColor);
            } else {
                console.error("bgColorInput not found");
            }
        },
          
        onSave: function() {
            var lp = parseInt(localStorage.getItem('lp')) || 0;
            var currentChartId = lp + 1;
            localStorage.setItem('lp', currentChartId);

            var dashboardNameComboBox = this.getView().byId("dashname");
            var dashname = dashboardNameComboBox.getValue();
            var chartTypeComboBox = this.getView().byId("chartTypeComboBox");
            var selectedKey = chartTypeComboBox.getSelectedKey();
            var chartNameInput = this.getView().byId("chartNameInput").getValue();
            var measuresComboBox = this.getView().byId("measuresComboBox").getSelectedKey();
            var dimensionsComboBox = this.getView().byId("dimensionsComboBox").getSelectedKey();
            var tableNameInput = this.getView().byId("tableNameInput").getValue();
            var bgColorInput=this.getView().byId("bgColorInput").getValue();

            console.log(bgColorInput);
            var chartOptions = {
                chart_Type: selectedKey,
                Dashboard_Name: dashname,
                Measures: measuresComboBox,
                Dimensions: dimensionsComboBox,
                Chart_Name: chartNameInput,
                TableName: tableNameInput,
                Color:bgColorInput
            };

            var oModel = this.getOwnerComponent().getModel("mainService");
            oModel.create("/Students", chartOptions, {
                success: function(odata, response) {
                    console.log("Chart options saved:", odata);
                },
                error: function(error) {
                    Log.error("Error saving chart options: " + error);
                }
            });
            
            this.onPublish(); // Call onPublish without passing selectedText
        },

        onPublish: function() {
            var om = this.getOwnerComponent().getModel("mainService");
            var chartTypeComboBox = this.getView().byId("chartTypeComboBox");
            var selectedKey = chartTypeComboBox.getSelectedKey();
            var dashname = this.getView().byId("dashname").getSelectedItem().getKey();
            var that = this; // Store reference to 'this'

            om.read("/Students", {
                success: function (response) {
                    var rootData = { Root: [] };

                    response.results.forEach(function (student) {
                        if (student.Dashboard_Name === dashname) {
                            var transformationStudent = {
                                "Dashboard_Name": student.Dashboard_Name,
                                "Chart_Name": student.Chart_Name,
                                "chart_Type": student.chart_Type,
                                "Measures": student.Measures,
                                "Dimensions": student.Dimensions,
                                "TableName": student.TableName,
                                "Color":student.Color,
                                data1: null
                            };
                            rootData.Root.push(transformationStudent);
                        }
                    });

                    om.read("/empinfo", {
                        success: function(empresponse) {
                            var empData = empresponse.results.map(function(item) {
                                return {
                                    "Name": item.Name,
                                    "Address": item.Address,
                                    "Salary": item.Salary
                                };  
                            });
                            rootData.Root.forEach(function(entry) {
                                entry.data1 = empData;
                            });

                            var oJsonModel = new JSONModel();
                            oJsonModel.setData({ root1: rootData });
                            var oMainVBox = that.getView().byId("chartBlock");
                            if (!oMainVBox) {
                                Log.error("Main VBox container not found in the view. Please check if the container ID is correct.");
                                return;
                            }

                            var oVBoxChart = new sap.m.VBox().addStyleClass("sapUiSmallMargin");
                            oVizFrame = new sap.viz.ui5.controls.VizFrame({
                                id: "vizfr" + oMainVBox.getItems().length,
                                height: "400px",
                                width: "50%",
                                background: {
                                    color: "#F0F0F0" // Set your desired background color here
                                }
                            });
                            console.log(oVizFrame);

                            // Attach a function to execute after the chart is rendered
                            oVizFrame.attachRenderComplete(function() {
                                // Get the chart container element
                                var oChartContainer = oVizFrame.getDomRef().querySelector('.v-m-root');
                                if (oChartContainer) {
                                    // Set background color for the chart container
                                    oChartContainer.style.background = '#F0F0F0'; // Set your desired background color here
                                }
                            });
                            
                            var chartType1 = oJsonModel.getProperty("/root1/Root/0/chart_Type");
                            var chartName = oJsonModel.getProperty("/root1/Root/0/Chart_Name");
                            var Color=oJsonModel.getProperty("/root1/Root/0/Color");
                            console.log(Color);
                            if (chartType1 === "column" || chartType1 === "bar" || chartType1 === "line" || chartType1 === "donut") {
                                oVizFrame.setDataset(new FlattenedDataset({
                                    dimensions: [{
                                        name: 'Name',
                                        value: "{Name}"
                                    }],
                                    measures: [{
                                        name: 'Salary',
                                        value: "{Salary}"
                                    }],
                                    data: {
                                        path: "/root1/Root/0/data1"
                                    }
                                }));
                                oVizFrame.setModel(oJsonModel);
                                oVizFrame.setVizType(chartType1);

                                oVizFrame.setVizProperties({
                                    plotArea: {
                                        colorPalette: ["#007181"],
                                        gridline: {
                                            visible: false
                                        },
                                      
                                    },
                                    background: { // Set background color for the entire chart area
                                        color: "Skyblue" // Set your desired background color here
                                    },
                                    legend:{
                                        label:{
                                            style:{
                                                color:"Blue"
                                            }
                                        }
                                    },
                                    dataLabel: {
                                        visible: true,
                                        style: {
                                            fontWeight: 'bold'
                                        },
                                        hideWhenOverlap: false
                                    },
                                
                                    seriesStyle: {
                                        "rules": [{
                                            "dataContext": {
                                                "Budget": '*'
                                            },
                                            "properties": {
                                                "dataPoint": {
                                                    "pattern": "noFill"
                                                }
                                            }
                                        }]
                                    },
                                    dataPointStyleMode: "update",
                                    dataPointStyle: {
                                        "rules": [{
                                            "dataContext": [{
                                                Period: {
                                                    in: ["Q1 '18", "Q2 '18"]
                                                },
                                                "Actuals": "*"
                                            }],
                                            "properties": {
                                                "pattern": "diagonalLightStripe"
                                            }
                                        }]
                                    },
                                    title: {
                                        visible: true,
                                        text: chartName,
                                        style: {
                                            color: Color,
                                            fontSize: "18px",
                                            fontWeight: "bold",//for setting background color
                                        }
                                    }
                                });
                              
                                var feedValueAxis = new FeedItem({
                                    'uid': "valueAxis",
                                    'type': "Measure",
                                    'values': ["Salary"]
                                });

                                var feedCategoryAxis = new FeedItem({
                                    'uid': "categoryAxis",
                                    'type': "Dimension",
                                    'values': ["Name"]
                                });

                                oVizFrame.removeAllFeeds();
                                oVizFrame.addFeed(feedValueAxis);
                                oVizFrame.addFeed(feedCategoryAxis);

                                oVBoxChart.addItem(oVizFrame);
                                oMainVBox.addItem(oVBoxChart);
                            }
                        },
                        error: function(error) {
                            Log.error("Error reading empinfo data: " + error);
                        }
                    });
                },
                
                error: function(error) {
                    Log.error("Error reading Students data: " + error);
                }
            });
        },
        handlechange1:function(){
            console.log("live handlechange1 event is there");
            var data=this.getView().byId("chartNameInput").getValue();
            if(oVizFrame){
            oVizFrame.setVizProperties({
                title:{
                    text:data
                }
            })
                }
            else{
                    console.log("vizframe not initialized");
                }
       },
       onChangeBackgroundColor:function(){
        console.log("there is an live change event pressed please brother make sure");
       }
       
    });
});
