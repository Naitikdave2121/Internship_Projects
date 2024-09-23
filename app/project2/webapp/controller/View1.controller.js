sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/VizFrame",
    "sap/ui/model/json/JSONModel",
    "sap/base/Log",
    "sap/ui/core/dnd/DropPosition",
    "sap/m/VBox",
    "sap/viz/ui5/controls/common/feeds/FeedItem",
    "sap/ui/core/dnd/DragInfo",
    "sap/f/dnd/GridDropInfo"

], function(Controller, FlattenedDataset, VizFrame, JSONModel, Log, DropPosition, VBox, FeedItem, DragInfo, GridDropInfo) {
    "use strict";
    var oVizFrame;

    return Controller.extend("project2.project2.controller.View1", {
        onInit: function() {
            // Initialize model and fetch initial data
            var oModel = this.getOwnerComponent().getModel("mainService");
            oModel.read("/Students", {
                success: function(response) {
                    var uniqueDashboardNames = [];
                    response.results.forEach(function(item) {
                        if (!uniqueDashboardNames.includes(item.Dashboard_Name)) {
                            uniqueDashboardNames.push(item.Dashboard_Name);
                        }
                    });
                    console.log("Unique Dashboard Names:", uniqueDashboardNames);
                    var oJsonModel = new JSONModel();
                    oJsonModel.setProperty("/dashboardNames", uniqueDashboardNames);
                    this.getView().setModel(oJsonModel, "sdata");
                }.bind(this),
                error: function(error) {
                    Log.error("Error reading Students data: " + error);
                }
            });
        },

        onOpenColorPicker: function() {
            var that = this;
            var oColorInput = this.getView().byId("bgColorInput");

            var oColorPickerPopover = new sap.ui.unified.ColorPickerPopover({
                colorString: oColorInput.getValue(),
                change: function(oEvent) {
                    var sColor = oEvent.getParameter("colorString");
                    that.onChangeColor(sColor);
                },
                cancel: function() {
                    oColorPickerPopover.close();
                }
            });

            oColorPickerPopover.openBy(this.getView().byId("bgColorInput"));
        },

        onChangeColor: function(sColor) {
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
            var bgColorInput = this.getView().byId("bgColorInput").getValue();

            console.log(bgColorInput);
            var chartOptions = {
                chart_Type: selectedKey,
                Dashboard_Name: dashname,
                Measures: measuresComboBox,
                Dimensions: dimensionsComboBox,
                Chart_Name: chartNameInput,
                TableName: tableNameInput,
                Color: bgColorInput
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
        },

        onPublish: function(oEvent) {
            var om = this.getOwnerComponent().getModel("mainService");
            var dashname = this.getView().byId("dashname").getSelectedItem().getKey();
            console.log(dashname);
            var rootData = {
                Root: []
            };

            // Fetch dashboard and chart data
            om.read("/Students", {
                success: function(response) {
                    var dashboardEntry = {
                        "Dashboard": dashname,
                        "Charts": []
                    };
                    response.results.forEach(function(student) {
                        if (student.Dashboard_Name === dashname) {
                            var chartEntry = {
                                "ChartName": student.Chart_Name,
                                "Chart_Type": student.chart_Type,
                                "Dimensions": student.Dimensions,
                                "Measures": student.Measures,
                                "Color": student.Color
                            };
                            dashboardEntry.Charts.push(chartEntry);
                        }
                    });
                    rootData.Root.push(dashboardEntry);

                    om.read("/empinfo", {
                        success: function(empresponse) {
                            // Iterate over each dashboard entry to add employee data
                            rootData.Root.forEach(function(entry) {
                                var employeeData = [];
                                empresponse.results.forEach(function(employee) {
                                    if (entry.Dashboard === dashname) {
                                        var empData = {
                                            "Salary": employee.Salary,
                                            "Name": employee.Name,
                                            "Address": employee.Address
                                        };
                                        employeeData.push(empData);
                                    }
                                });
                                entry.data = employeeData; // Store the employee data in the dashboard entry
                            });

                            // Create JSON model with updated data
                            var oJsonModel = new JSONModel();
                            oJsonModel.setData({
                                "root1": rootData
                            });
                            console.log(JSON.stringify(oJsonModel.getProperty("/root1"), null, 4));

                            // Get chart configurations from JSON model
                            var charts = oJsonModel.getProperty("/root1/Root/0/Charts");
                            console.log(charts)
                            // Access the main VBox container
                            var oMainVBox = this.getView().byId("chartBlock");
                            if (!oMainVBox) {
                                Log.error("Main VBox container not found in the view. Please check if the container ID is correct.");
                                return;
                            }

                            // Loop through each chart configuration and create VizFrames
                            charts.forEach(function(chart) {
                                var chart_Type = chart.Chart_Type;
                                var Color = chart.Color;
                                var chartname = chart.ChartName;
                                console.log(chart_Type)
                                console.log(Color);
                                if (chart_Type === "column" || chart_Type === "bar" || chart_Type === "line" || chart_Type === "donut"|| chart_Type === "scatter" ) {
                                    var oVBoxChart = new VBox({
                                        backgroundColor: "red"
                                    }).addStyleClass("sapUiSmallMargin");
                                    oVizFrame = new VizFrame({
                                        id: "vizfr" + oMainVBox.getItems().length,
                                        height: "400px",
                                        width: "100%",
                                        uiConfig: {
                                            applicationSet: "fiori"
                                        }
                                    });
                                    var dimensions = [{
                                        name: chart.Dimensions,
                                        value: "{" + chart.Dimensions + "}"
                                    }];
                                    var measures = [{
                                        name: chart.Measures,
                                        value: "{" + chart.Measures + "}"
                                    }];

                                    // Set up dataset, model, type, and properties for the VizFrame
                                    oVizFrame.setDataset(new FlattenedDataset({
                                        dimensions: dimensions,
                                        measures: measures,
                                        data: {
                                            path: "/root1/Root/0/data"
                                        }
                                    }));
                                    oVizFrame.setModel(oJsonModel);
                                    oVizFrame.setVizType(chart_Type);

                                    oVizFrame.setVizProperties({
                                        interaction: {
                                            zoom: {
                                                enablement: "enabled" // Enable zoom functionality
                                            }
                                        },
                                  
                                        plotArea: {
                                            colorPalette: ["#007181"],
                                            gridline: {
                                                visible: false
                                            },
                                        },
                                        background: {
                                            color: "Skyblue"
                                        },
                                        legend: {
                                            label: {
                                                style: {
                                                    color: "Blue",
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
                                            text: chartname,
                                            layout: {
                                                position: "right"
                                            },
                                            legend: {
                                                title: {
                                                    visible: false
                                                },
                                            },
                                            legendGroup: {
                                                layout: {
                                                    position: "right"
                                                }
                                            },
                                            style: {
                                                color: Color,
                                                fontSize: "20",
                                                fontWeight: "bold",
                                            },
                                        }
                                    });

                                    // Create feed items for VizFrame
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

                                    // Add feeds to VizFrame
                                    oVizFrame.addFeed(feedValueAxis);
                                    oVizFrame.addFeed(feedCategoryAxis);

                                    // Add VizFrame to VBox
                                    oVBoxChart.addItem(oVizFrame);

                                    oMainVBox.addItem(oVBoxChart);
                                }
                            }.bind(this));
                        }.bind(this),
                        error: function(error) {
                            Log.error("Error reading empinfo data: " + error);
                        }
                    });
                }.bind(this),
                error: function(error) {
                    console.error("Error reading Students data: " + error);
                }
            });
            console.log("vizframe is the", oVizFrame);
            oVizFrame.addDragDropConfig(new DragInfo({
                sourceAggregation: "items"
            }));

            oVizFrame.addDragDropConfig(new GridDropInfo({
                targetAggregation: "items",
                dropPosition: DropPosition.Between,
                dropLayout: DropLayout.Horizontal,
                drop: function(oInfo) {
                    var oDragged = oInfo.getParameter("draggedControl"),
                        oDropped = oInfo.getParameter("droppedControl"),
                        sInsertPosition = oInfo.getParameter("dropPosition"),
                        iDragPosition = oVizFrame.indexOfItem(oDragged),
                        iDropPosition = oVizFrame.indexOfItem(oDropped);

                    oVizFrame.removeItem(oDragged);
                    if (iDragPosition < iDropPosition) {
                        iDropPosition--;
                    }
                    oVizFrame.insertItem(oDragged, iDropPosition);
                    oVizFrame.focusItem(iDropPosition);
                }
            }));

        },

        handlechange1: function() {
            console.log("live handlechange1 event is there");
            var data = this.getView().byId("chartNameInput").getValue();
            if (oVizFrame) {
                oVizFrame.setVizProperties({
                    title: {
                        text: data
                    }
                })
            } else {
                console.log("vizframe not initialized");
            }
        },

        onChangeBackgroundColor: function() {
            console.log("there is a live change event pressed please brother make sure");
        }
    });
});
