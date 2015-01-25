HTMLWidgets.widget({

  name: "tableFilter",

  type: "output",

  renderValue: function(el, data) {

    function log(message){
          if(typeof console == "object"){
          	console.log(message);
        	}
        }

    var $el = $(el);

    // name ouf the output widget
    var outputID = el.id;

    var celldata = HTMLWidgets.dataframeToD3(data.data);
    
    var footdata = HTMLWidgets.dataframeToD3(data.footData);
    
    var columns = Object.getOwnPropertyNames(celldata[0]);
    var allCols = [];
    var i;
    for (i = 0; i < columns.length; ++i) {
      allCols.push('col_' + i);
    }
    
    window["table_Props_" + outputID] = data.tableProps;
    
    // need to access this from shiny custom message functions
    // and to have it available for multiple tables in one document
    window["bgColScales_" + outputID] = data.bgColScales;
    window["fgColScales_" + outputID] = data.fgColScales;
    window["cellFunctions_" + outputID] = data.cellFunctions;
    window["footCellFunctions_" + outputID] = data.footCellFunctions;
    // have a unique id for each edit
    var edit = data.edit;
    window["selectableRows_" + outputID] = data.selectableRows;
    window["selectableRowsClass_" + outputID] = data.selectableRowsClass;
    
    var radioButtons = data.radioButtons;
    var checkBoxes = data.checkBoxes;
    window["showRowNames_" + outputID] = data.showRowNames;
    
    var tableID = el.id + '_tbl';
    var tfName = 'tf_' + el.id;
    var inputID = outputID + '_edit';

    //  generate a filter input?
    var filterInput = data.filterInput;
    if(filterInput) {
      window["table_Props_" + outputID]["on_after_filter"] = function(o) {updateFilterInput(o)};
    }
    var initialFilters = data.initialFilters;
    
    // need to update colour after table sorting
    window["table_Props_" + outputID]["on_after_sort"] = function(o) {colourCellsWrapper(o)};

    // remove existing table including table filter objects
    var table = d3.select(el).select("table").remove();
    var loader = d3.select(el).selectAll(".loader").remove();
    var inf = d3.select(el).selectAll(".inf").remove();
    
    // create new table
    var table = d3.select(el)
                  .append("table")
                  .attr("id", tableID)
                  .classed({'table-condensed': true});

    var  thead = table.append("thead");
    var  tbody = table.append("tbody");
            
     thead.append("tr")
            .selectAll("th")
            .data(columns)
            .enter()
            .append("th")
            .text(function(column) { return column; });
            
    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(celldata)
        .enter()
        .append("tr")
        .attr('id', function(d, i) {return 'r' + i})
        .attr('class', 'tbl_' + outputID);

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
               return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
        .text(function(d) { return d.value; })
        // address columns table filter style
        .attr('class', function(d, i, j){ return "col_" + i + ' ' + 'row_' + j + ' ' + 'tbl_' + outputID; });
    
    // create a table footer 
    var  tfoot = table.append("tfoot");
    
    // create a row for each object in the data
    var footrows = tfoot.selectAll("tr")
        .data(footdata)
        .enter()
        .append("tr")
        .attr('id', function(d, i) {return 'fr' + i})
        .attr('class', 'tbl_' + outputID);
    
    // create a cell in each row for each column of the footer
    var footcells = footrows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
               return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
        .text(function(d) { return d.value; })
        // set an id to use for tablefilter "col_operations"
        .attr('id', function(d, i, j){ return 'frow_' + j + '_fcol_' + i + '_' +  'tbl_' + outputID; })
        .attr('class', function(d, i, j){ return "col_" + i + ' ' + 'row_' + j + ' ' + 'tbl_' + outputID; });

    // debounce from Underscore.js
    // modified to allow rapid editing of multiple cells
    // if args are different between subsequent calls, 
    // fire the previous call immediately.
    function debounce(func, wait, immediate) {
       var timeout, args, context, timestamp, result;
      return function() {
        // simply testing args != arguments doesnt work (timestamp in args[0]?)
        if(args != null && (args[1] != arguments[1] || args[2] != arguments[2])) {
          // called rapidly twice with different args.
          // execute previous call immediately
          func.apply(context, args);
        }
        context = this;
        args = arguments;
        timestamp = new Date();
        var later = function() {
          var last = (new Date()) - timestamp;
          if (last < wait) {
            timeout = setTimeout(later, wait - last);
          } else {
            timeout = null;
            if (!immediate) {
              result = func.apply(context, args);
              // Normal exit after timeout.
              // Set args null to have a clean start again.
              args = null;
            }
          }
        };
        var callNow = immediate && !timeout;
        if (!timeout) {
          timeout = setTimeout(later, wait);
        }
        if (callNow) result = func.apply(context, args);
        return result;
      };
    };


    // create a shiny input event, named as 
    //  the corresponding output element + "_edit"
    function shinyInputEvent(d, i, j) {
      var sel = d3.select(this);
      var regex = /col_(\d+)/;
      var col = Number(regex.exec(this.className)[1]);
      var regex = /row_(\d+)/;
      var row = Number(regex.exec(this.className)[1]) + 1;
      var regex = /tbl_(\w+)/;
      var tbl = regex.exec(this.className)[1];
      var showRowNames = window["showRowNames_" + tbl];
      var inputID = tbl + '_edit';
      var editID = "edit_" + tbl + '_' + window["editCounter"]++;
      sel.attr('id', editID);
      if(showRowNames) {
        col = col;
      } else {
        col = col + 1;
      }
      var val;
      if(this.type == "checkbox") {
        if(this.checked) {
          val = true;
        } else {
          val = false;
        }
      } else {
        var val = sel.text();
      }
      var edit = {id: editID, row: row, col: col, val: val};
      Shiny.onInputChange(inputID, edit);
    }
    
    // generate shiny input from radio buttons
    // get event from button group, need to find out which
    // button is selected
    checkRadio = function(name) {
      var tbl = name.replace(/_.*/g, '');
      var col = name.replace(/.*_col/, 'col');
      var editID = "edit_" + window["editCounter"]++;;
      var inputID = tbl + '_edit';
      var showRowNames = window["showRowNames_" + tbl];
      var radio = d3.selectAll('#' + tbl)
                       .selectAll('td.' + col)
                       .selectAll("input");
      var row;
      var states = radio.each(function(d, i, j) 
                        { if(this.checked) { 
                             var regex = /row_(\d+)/;
                             row = Number(regex.exec(this.className)[1]);
                             d.value = true;                                            
                            } else {
                              d.value = false;
                            }
                          });
      
      var cell = d3.selectAll('#' + tbl)
                       .selectAll('td.' + col + ' ' + '.row_' + row)
                       .attr('id', editID);
      
      col = Number(col.replace(/col_/, ''));
      if(!showRowNames) {
        col = col + 1;
      }
      row = row + 1;
      var edit = {id: editID, row: row, col: col, val: true};
      Shiny.onInputChange(inputID, edit);
     }


    // server side edit, confirm or reject
    try {
      Shiny.addCustomMessageHandler("setCellValue",
          function(message) {
            var row = 'row_' + (Number(message["row"]) - 1);
            var col = 'col_' + message["col"];
            var tbl = message["tbl"];
            var selector = '.' + row + '.' + col;
            if(message["foot"]) {
              var cell = d3.select('#' + tbl)
                           .selectAll('tfoot')
                           .select(selector);
            } else {
              var cell = d3.select('#' + tbl)
                           .selectAll('tbody')
                           .select(selector);
            }

            if(message["action"] == "confirm" || message["action"] == "reject") {

              // only do something if cell id matches message
              cell = cell.filter('#' + message["id"]);
              if(cell.empty()) {
                return(null);
              }
              
              // signal reject by transient text colour change
              if(message["action"] == "reject") {
                // store color in attr so we can reset to it in subsequent edits
                cell.attr("oldcolor", function() {return cell.style("color")});
                var oldColor = cell.attr("oldcolor");
                cell.style("color", message["color"]);
                // if sever sends value, reset input to it and transition
                // color back to previous
                if(message["value"] !== null) {
                    cell.transition("textcolor")
                    .duration(1500)
                    .style("color", oldColor)
                    .attr('id', '')
                    .attr('oldcolor', '');
                }
              } else if (message["action"] == "confirm") {
                // confirm edit by transient colour change
                if(cell.attr("oldcolor")) {
                // previous validation failed
                var oldColor = cell.attr("oldcolor");
                } else {
                  var oldColor = cell.style("color");
                }
                if(message["color"]) {
                  cell.style("color", message["color"])
                      .transition("textcolor")
                      .duration(1500)
                      .style("color", oldColor)
                      .attr('oldcolor', '');
                }
              }
              
            } // confirm or reject
            
            // no new value, no further action
            if(message["value"] === null) {
              return(null)
            }
            

            var val = message["value"];
            // todo: check if there is a d3 syntax to do this
            cell[0][0].__data__.value = val;
            
            if(cell[0][0].firstChild.type == "radio") {
              // uncheck other buttons in group
              var radio = d3.selectAll('#' + tbl)
                       .selectAll('td.' + col)
                       .selectAll("input")
                       .property("checked", false);
            } else if(cell[0][0].firstChild.type == "checkbox" || cell[0][0].firstChild.type == "radio") {
              cell.selectAll("input").property("checked", val);
            } else {
              
              if(cell.selectAll("text").empty()) {
                // simple cell, update text directly
              cell = cell.attr('value', val)
                         .text(val);
              } else {
                // cell styled using cellfunctions, look for text element within
              cell = cell.attr('value', val)
                  .selectAll("text").text(val);
              }

              colourCol(tbl, col);
              if(message["foot"]) {
                runCellFunctions(tbl, col, foot = true);
              } else {
                runCellFunctions(tbl, col);
              }
            }
            
            // send confirmation back to server
            // cell gets labeled with a unique edit id. 
            // this way a confirmation or reject from the server will find
            // only the most recent edit
            if(message["feedback"]) {
              var editID = "edit_" + tbl + '_' + window["editCounter"]++;
              var inputID = tbl + '_edit';
              cell.attr('id', editID);
              var edit = {id: editID, row: message["row"], col:  message["col"], val: val};
              Shiny.onInputChange(inputID, edit);
            }
      });
    } catch (err) {
      ; // already installed
    }

    // format cells or turn cell content in graphics
    runCellFunctions = function(tbl, col, foot) {
      if(foot == true) {
        var selector = "tfoot";
        var cellFunctions = window["footCellFunctions_" + tbl];
      } else {
        var selector = "tbody"
        var cellFunctions = window["cellFunctions_" + tbl];
      }
      if(col == null) {
        // check whole table
        for (var key in cellFunctions) {
           if (cellFunctions.hasOwnProperty(key)) { 
             table = tbl; // strange. this makes it accessible inside of the select
             var cells = d3.selectAll('#' + table)
                           .selectAll(selector)
                           .selectAll('td.' + key);
                 cells.call(cellFunctions[key]);
        			};
        }
      } else {
        // only selected column
        if (cellFunctions.hasOwnProperty(col)) {
          var cells = d3.selectAll('#' + tbl)
                        .selectAll(selector)
                        .selectAll('td.' + col);
              cells.call(cellFunctions[col]);
        }
      }
    };


    // enable editing of a table 
    try {
      Shiny.addCustomMessageHandler("enableEdit",
          function(message) {
              var cells = d3.selectAll('#' + message["tbl"])
                            .selectAll('tbody');
              if(message["cols"] !== null) {
                  cells = cells.selectAll(message["cols"]);
              } else {
                  cells = cells.selectAll('td');
              }
              cells.attr({contenteditable: true})
                      .on("input", debounce(shinyInputEvent, 800));
      });
    } catch (err) {
       ; // already installed
    }

    // disable editing of a table
    try {
      Shiny.addCustomMessageHandler("disableEdit",
          function(message) {
              var cells = d3.selectAll('#' + message["tbl"])
                            .selectAll('tbody');
              if(message["cols"] !== null) {
                  cells = cells.selectAll(message["cols"]);
              } else {
                  cells = cells.selectAll('td');
              }
              cells.attr({contenteditable: false})
                      .on("input", null);
      });
    } catch (err) {
       ; // already installed
    }
    
    // set filter
    try {
      Shiny.addCustomMessageHandler("setFilter",
          function(message) {
            var tfName = 'tf_' + message["tbl"];
            window[tfName].SetFilterValue(message["col"], message["filterString"]);
            if(message["doFilter"]) {
              window[tfName].Filter();
            }

      });
    } catch (err) {
      ; // already installed
    }
    
    // highlight a table row
    try {
      Shiny.addCustomMessageHandler("rowClass",
          function(message) {
            var clss = message["class"];
            var tbl = message["tbl"];
            
            var rows = d3.selectAll('#' + tbl)
                  .selectAll('tbody')
                  .selectAll('tr');
                  
            // radio button behavior: clear selectableRowsClass from all rows
            if (window["selectableRows_" + tbl] == "single" && clss == window["selectableRowsClass_" + tbl] ) {
                rows.classed(window["selectableRowsClass_" + tbl], false);
            }
            
            // current row
            var row = d3.selectAll('#' +  tbl)
                        .select('#r' + (Number(message["row"]) - 1));
                row.classed({"active": false,  "success": false, "info": false, "warning": false, "danger": false});
            if(clss != "none") {
              row.classed(clss, true);
            }
            
            // now update selected rows input
            var selected = [];
            rows.each(function(d, i) {
              if($(this).hasClass(window["selectableRowsClass_" + tbl])) {
                selected.push(Number(this.id.replace('r', '')) + 1);
              }
            })
            var inputID = tbl + '_select';
            Shiny.onInputChange(inputID, selected);
        });
    } catch (err) {
      ; // already installed
    }

    // handler for selectableRows
    // create a shiny input event, named like 
    //  the corresponding output element + "_select"
    function shinyRowClickEvent(d, i, j) {
      var regex = /tbl_(\w+)/;
      
      var tbl = regex.exec(this.className)[1];
      var rows = d3.selectAll('#' + tbl)
                  .selectAll('tbody')
                  .selectAll('tr');
      
      var inputID = tbl + '_select';
      var sel = d3.select(this);
     if (!d3.event.ctrlKey || window["selectableRows_" + tbl] == "single" ) {
          rows.classed(window["selectableRowsClass_" + tbl], false);
      }
      if($(this).hasClass(window["selectableRowsClass_" + tbl])) {
        sel.classed(window["selectableRowsClass_" + tbl], false);
      } else {
        sel.classed(window["selectableRowsClass_" + tbl], true);
      }
      
      var selected = [];
      rows.each(function(d, i) {
        if($(this).hasClass(window["selectableRowsClass_" + tbl])) {
          selected.push(Number(this.id.replace('r', '')) + 1);
        }
      })
      Shiny.onInputChange(inputID, selected);
    }

    // clear filters from table
    try {
      Shiny.addCustomMessageHandler("clearFilters",
          function(message) {
            var tfName = 'tf_' + message["tbl"];
            window[tfName].ClearFilters();
            if(message["doFilter"]) {
              window[tfName].Filter();
            }
      });
    } catch (err) {
      ; // already installed
    }

    // calculate min / max / extent per column. Can be used from R for
    // dynamic colour scale range  
    colExtent = function(tbl, col) {
      var colVals = d3.selectAll('#' + tbl)
                      .selectAll("tbody")
                      .selectAll('td.' + col)
                      .data();
      var colExtent = d3.extent(colVals, function(d) { return d.value; });
      return(colExtent);
    }
    colMin = function(tbl, col) {
      var colVals = d3.selectAll('#' + tbl)
                      .selectAll("tbody")
                      .selectAll('td.' + col)
                      .data();
      var colMin = d3.min(colVals, function(d) { return d.value; })
      return(colMin);
    }
    colMax = function(tbl, col) {
      var colVals = d3.selectAll('#' + tbl)
                      .selectAll("tbody")
                      .selectAll('td.' + col)
                      .data();
      var colMax = d3.max(colVals, function(d) { return d.value; })
      return(colMax);
    }
    
    // apply fg and bg colour scales to column
    colourCol  = function(tbl, col) {  
      var bgColScales = window["bgColScales_" + tbl];
      if (bgColScales.hasOwnProperty(col)) {
      table = tbl; 
       var col2Color = d3.selectAll('#' + tbl)
                         .selectAll("tbody")
                         .selectAll('td.' + col)
                         .transition("bgcolor") 

          // run the d3 colour scale function defined in the bgColScales list on the R side
          col2Color.style("background-color", function(d, i){
        		return bgColScales[col](tbl, d.value);
  				});
       } 
      var fgColScales = window["fgColScales_" + tbl];
      if (fgColScales.hasOwnProperty(col)) {
          table = tbl; 
          d3.selectAll('#' + tbl)
            .selectAll("tbody")
            .selectAll('td.' + col)
//          .transition()

        // run the d3 colour scale function defined in the bgColScales list on the R side
        .style("background-color", function(d, i){
          	return fgColScales[col](tbl, d.value);
  				});
      }
    }
    
    // called from TableFilter. get table name from table filter object
    colourCellsWrapper = function(o) {
      tbl = o['id'].replace(/_tbl/, '');
      colourCells(tbl);
    }
    
    // set background color for whole table
    // does nothing if length(bgColScales) == 0 and length(fgColScales) == 0
    colourCells = function(tbl) {
    var bgColScales = window["bgColScales_" + tbl];
    for (var key in bgColScales) {
       if (bgColScales.hasOwnProperty(key)) { 
         table = tbl; // strange. this makes it accessible inside of the select
         d3.selectAll('#' + table)
           .selectAll('tbody')
           .selectAll('td.' + key)
           .style("background-color", function(d, i){
             // run the d3 colour scale function defined in the bgColScales list on the R side
      			return bgColScales[key](tbl, d.value);
  				});
       }  
     };

    // set text color for whole table
    var fgColScales = window["fgColScales_" + tbl];
    for (var key in fgColScales) { 
       if (fgColScales.hasOwnProperty(key)) { 
       table = tbl; // strange. this makes it accessible inside of the select
       d3.selectAll('#' + tbl)
         .selectAll('tbody')
         .selectAll('td.' + key)
         .style("color", function(d, i){
            // run the d3 colour scale function defined in the fgColScales list on the R side
        		return fgColScales[key](tbl, d.value);
  				});
       }  
     };
    };
    
    // generate a shiny input listing the filter settings and
    // the displayed rows index
    updateFilterInput = function(tbl) {
      // extract table id from tablefiler object
      tblID = tbl['id'].replace(/_tbl/, '');
      tfName = "tf_" + tblID;
      
      // get the row index. don't use tablefilter validRows because
      // it depends on sorting
      validRows = [];
      d3.selectAll('#' + tbl['id'])
        .selectAll('tbody')
        .selectAll('tr')
        .each(function(d, i) {
        if(this.style["display"] !== "none") {
          // add 1 to match R row numbers
          validRows.push(Number(this.id.replace('r','')) + 1);
        } 
      });
      var filterids = window[tfName].GetFiltersId();
      
      var re = /^flt(\d+)/;
      var filterNumbers = [];
      filterids.forEach(function(x) { filterNumbers.push(x.match(re)[1]); });
      
      var filterSettings = [];
      filterNumbers.forEach(function(x) {
        var column = 'col_' + x;
        var value = window[tfName].GetFilterValue(x);
        filterSettings.push({column: column, value: value});         
      });
      
      var filterInputID = tblID + '_filter';

      filters = {filterSettings: filterSettings, validRows: validRows};
      Shiny.onInputChange(filterInputID, filters);
    }
    
    // make table rows selectable
    if(window["selectableRows_" + outputID] == "single" || window["selectableRows_" + outputID] == "multi") {
      table.classed({'table': true,  'table-hover': true})
      rows.attr({clickable: true})
        .on("click", shinyRowClickEvent);
    }
    
    // make cells editable
    if(edit === true) {
      cells.attr({contenteditable: true})
        .on("input", debounce(shinyInputEvent, 800));
    } else if (typeof(edit) == "string") {
        rows.selectAll(edit)
            .attr({contenteditable: true})
            .on("input", debounce(shinyInputEvent, 800));
    };
    
     // create radio buttons
     if (typeof(radioButtons) == "string") {
       radioButtons = [radioButtons];
     }
     if (typeof(radioButtons) == "object" && radioButtons != null) {
       radioButtons.forEach(function(col) {
        var btns = rows.selectAll('.' + col) 
              .text("")
              .append("input")
              .attr("type", "radio")
              .attr("name", outputID + "_"  + col)
              .attr('class', function(d, i, j){ return col + ' ' + 'row_' + j + ' ' + 'tbl_' + outputID; })
              .property("checked", function(d, i) { return d.value; });
       // event for the radio button group        
       $("input[name=" + outputID + "_"  + col + "]:radio")
                       .change(function () {checkRadio(this.name)})
       })
     }
     
     // create checkboxes
     if (typeof(checkBoxes) == "string") {
       checkBoxes = [checkBoxes];
     }
     if (typeof(checkBoxes) == "object" && checkBoxes != null) {
       checkBoxes.forEach(function(col) {
       var btns = rows.selectAll('.' + col)
              .text("")
              .append("input")
              .attr("type", "checkbox")
              .attr('class', function(d, i, j){ return col + ' ' + 'row_' + j + ' ' + 'tbl_' + outputID; })
              .property("checked", function(d, i) { return d.value; })
              .on("change", shinyInputEvent);
        })
     }
    
    // run d3 functions to format cells
    runCellFunctions(outputID);
    runCellFunctions(outputID, col = null, foot = true);
    
    // set intial color. Has to run again after table sorting. 
    colourCells(outputID);
    
    // initialize table filter generator
    window[tfName] = setFilterGrid(tableID, window["table_Props_" + outputID]);
    
    // initial filter settings
    for (var key in initialFilters) {
         if (initialFilters.hasOwnProperty(key)) {
            var col = Number(key.replace(/col_/, ''));
            window[tfName].SetFilterValue(col, initialFilters[key]);
          };
    };
    window[tfName].Filter();
    
  } // end of renderValue !!

}); // end of HTMLWIDGET !!

// table generation based in part on
// stack overflow post
// http://stackoverflow.com/questions/9268645/creating-a-table-linked-to-a-csv-file



 