HTMLWidgets.widget({

  name: "D3TableFilter",

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
    
    // set TF base path depending on mode
    var url = window.HTMLWidgets.getAttachmentUrl(id="tablefilter", key = 1);
    url = url.replace(/TF_Themes.*/, '');
    data.tableProps["base_path"] = url;
    
    // adjust path for tablefilter extensions
    if(data.tableProps.hasOwnProperty("extensions")) {
     if(data.tableProps.extensions.hasOwnProperty("src")) {
       for(var i = 0; i < data.tableProps.extensions.src.length; i++) {
         data.tableProps.extensions.src[i] = url + data.tableProps.extensions.src[i];
       }
      }
    }

    var edit = data.edit;
    
    // have a unique id for each edit
    var editCounter = 0;
    
    var radioButtons = data.radioButtons;
    var checkBoxes = data.checkBoxes;

    var tableID = el.id + '_tbl';
    var tfName = 'tf_' + el.id;
    var inputID = outputID + '_edit';

    //  generate a filter input?
    var filterInput = data.filterInput;
    if(filterInput) {
      data.tableProps["on_after_filter"] = function(o) {updateFilterInput(o)};
    }
    var initialFilters = data.initialFilters;
    
    var sortKeys = data.sortKeys;
    
    // need to update colour after table sorting
    data.tableProps["on_after_sort"] = function(o) {colourCellsWrapper(o)};

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
            .text(function(column) { var name = (data.colNames != null && data.colNames.hasOwnProperty(column)) ? data.colNames[column] : column; return name; });    

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
        .html(function(d) { return d.value; })
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
        .html(function(d) { return d.value; })
        // set an id to use for tablefilter "col_operations"
        .attr('id', function(d, i, j){ return 'frow_' + j + '_fcol_' + i + '_' +  'tbl_' + outputID; })
        .attr('class', function(d, i, j){ return "col_" + i + ' ' + 'row_' + j + ' ' + 'tbl_' + outputID; });
    
    // make table bootstrap styled
    if(data.tableStyle != null) {
      table.classed(data.tableStyle, true);
      tfoot.classed(data.tableStyle, true);
      thead.classed(data.tableStyle, true);
     }

    // apply row styles
    var rowStyles = data.rowStyles;
    if(rowStyles != null) {
      log("setting rowstyles")
      rows.each(
        function(d, i, j) {
            var elt = d3.select(this);
            elt.classed(rowStyles[i], true);
        }
      ) 
    }
        
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
      var regex = /tbl_(\S+)/;
      var tbl = regex.exec(this.className)[1];
      var inputID = tbl + '_edit';
      var editID = "edit_" + tbl + '_' + editCounter++;
      sel.attr('id', editID);
      if(data.showRowNames) {
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
      if(window.HTMLWidgets.shinyMode) {
        var edit = {id: editID, row: row, col: col, val: val};
        Shiny.onInputChange(inputID, edit);
      } else {
        row = 'row_' + (row - 1);
        col = 'col_' + col;
        var selector = '.' + row + '.' + col;
        var cell = d3.select('#' + tbl)
                     .selectAll('tbody')
                     .select(selector);
        setCellData(cell, val, tbl, col);
        runCellFunctions(tbl, col);
        runCellFunctions(tbl, col, foot = true);
        colourCol(tbl, col);
      }
    }
    
    // generate shiny input from radio buttons
    // get event from button group, need to find out which
    // button is selected
    checkRadio = function(name) {
      var tbl = name.replace(/_.*/g, '');
      var col = name.replace(/.*_col/, 'col');
      var editID = "edit_" + editCounter++;;
      var inputID = tbl + '_edit';
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
      if(window.HTMLWidgets.shinyMode) {
        col = Number(col.replace(/col_/, ''));
        if(!data.showRowNames) {
          col = col + 1;
        }
        row = row + 1;
        var edit = {id: editID, row: row, col: col, val: true};
        Shiny.onInputChange(inputID, edit);
      }
     }
    
    // update data for D3
    setCellData = function(cell, val, tbl, col) {
                  // todo: check if there is a d3 syntax to do this
            cell[0][0].__data__.value = val;
            
            if(cell[0][0].firstChild.type == "radio") {
              // uncheck other buttons in group
              var radio = d3.selectAll('#' + tbl)
                       .selectAll('td.' + col)
                       .selectAll("input")
                       .property("checked", false);
            } 
            if(cell[0][0].firstChild.type == "checkbox" || cell[0][0].firstChild.type == "radio") {
              cell.selectAll("input").property("checked", val);
            } else {
              if(cell.selectAll("text").empty()) {
                // simple cell, update text directly
              cell = cell.attr('value', val)
                         .html(val);
              } else {
                // cell styled using cellfunctions, look for text element within
              cell = cell.attr('value', val)
                  .selectAll("text").html(val);
              }
            }

    }
    
    // server side edit, confirm or reject
    try {
      Shiny.addCustomMessageHandler("setCellValue",
          function(message) {
            var row = 'row_' + (Number(message["row"]) - 1);
            if(data.showRowNames) {
              var col = 'col_' + message["col"];
            } else  {
              var col = 'col_' + (Number(message["col"]) - 1);
            }
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
                    log("running color transition")
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
            setCellData(cell, val, tbl, col);

            colourCol(tbl, col);
            if(message["foot"]) {
              runCellFunctions(tbl, col, foot = true);
            } else {
              runCellFunctions(tbl, col);
            }
            
            if(window.HTMLWidgets.shinyMode) {
            // send confirmation back to server
            // cell gets labeled with a unique edit id. 
            // this way a confirmation or reject from the server will find
            // only the most recent edit
              if(message["feedback"]) {
                var editID = "edit_" + tbl + '_' + editCounter++;
                var inputID = tbl + '_edit';
                cell.attr('id', editID);
                var edit = {id: editID, row: message["row"], col:  message["col"], val: val};
                Shiny.onInputChange(inputID, edit);
              }
            }
      });
    } catch (err) {
      ; // already installed
    }

    // format cells or turn cell content in graphics
    runCellFunctions = function(tbl, col, foot) {
      if(foot == true) {
        var selector = "tfoot";
        var cellFunctions =  data.footCellFunctions;
      } else {
        var selector = "tbody"
        var cellFunctions = data.cellFunctions;
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
            // restore previous class
            if (data.selectTableRows == "single" && clss == data.selectTableRows ) {
                rows.classed(data.selectableRowsClass, false);
                rows.classed(data.rowStyles, true);
            }

            // current row
            var row = d3.selectAll('#' +  tbl)
                        .select('#r' + (Number(message["row"]) - 1));
                row.classed({"active": false,  "success": false, "info": false, "warning": false, "danger": false});
            if(clss != "none") {
              row.classed(clss, true);
            }
            
            // now update selected rows input
            if(window.HTMLWidgets.shinyMode) {
              var selected = [];
              rows.each(function(d, i) {
                if($(this).hasClass(data.selectableRowsClass)) {
                  selected.push(Number(this.id.replace('r', '')) + 1);
                }
              })
              var inputID = tbl + '_select';
              Shiny.onInputChange(inputID, selected);
            }
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
     if (!d3.event.ctrlKey || data.selectableRows == "single" ) {
          rows.classed(data.selectableRowsClass, false);
      }
      if($(this).hasClass(data.selectableRowsClass)) {
        sel.classed(data.selectableRowsClass, false);
      } else {
        sel.classed(data.selectableRowsClass, true);
      }
      
      if(window.HTMLWidgets.shinyMode) {
      var selected = [];
        rows.each(function(d, i) {
          if($(this).hasClass(data.selectableRowsClass)) {
            selected.push(Number(this.id.replace('r', '')) + 1);
          }
        })
        Shiny.onInputChange(inputID, selected);
      }
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
      var bgColScales = data.bgColScales;
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
      var fgColScales =data.fgColScales;
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
    var bgColScales = data.bgColScales;
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
    var fgColScales = data.fgColScales;
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
      
      // only in shiny mode
      if(!window.HTMLWidgets.shinyMode) {
        return(null);
      }

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
    if(data.selectableRows == "single" || data.selectableRows == "multi") {
      table.classed({'table-hover': true})
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
    
    // for mixed sorting give TableFilter a custom sort key generated by gtools::mixedsort
    for (var key in sortKeys) {
       if (sortKeys.hasOwnProperty(key)) { 
          d3.selectAll('#' + outputID)
           .selectAll('tbody')
           .selectAll('td.' + key)
           .data(sortKeys[key])
           .attr("_sortKey", function(d) { return(d);})
    }};
    
    // initialize table filter generator
    if(data.enableTf == true) {
      window[tfName] = setFilterGrid(tableID, data.tableProps);
      
      // initial filter settings
      for (var key in initialFilters) {
           if (initialFilters.hasOwnProperty(key)) {
              var col = Number(key.replace(/col_/, ''));
              window[tfName].SetFilterValue(col, initialFilters[key]);
            };
      };
      window[tfName].Filter();
    }
    
    // make thead and info row bootstrap styled
    // TODO: find a working solution for info row
    if(data.tableStyle != null) {
      thead.selectAll("tr").classed("active", true);
      var infDiv = d3.select(el)
      .selectAll("#inf_" + outputID + "_tbl")
      .classed({"active": true})
      .style("width", "auto");
    }
    
  } // end of renderValue !!

}); // end of HTMLWIDGET !!
