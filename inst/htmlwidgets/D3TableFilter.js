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
    
    var columns = data.columns;
    
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

    // need these global variables for server side edits
    window.D3TableFilter = window.D3TableFilter || {};
    window.D3TableFilter["bgColScales_" + outputID] = data.bgColScales;
    window.D3TableFilter["fgColScales_" + outputID] = data.fgColScales;
    window.D3TableFilter["cellFunctions_" + outputID] = data.cellFunctions;
    window.D3TableFilter["footCellFunctions_" + outputID] = data.footCellFunctions;
    window.D3TableFilter["sparklines_" + outputID] = data.sparklines;

    var edit = data.edit;

    // have a unique id for each edit
    var editCounter = 0;
    
    var radioButtons = data.radioButtons;
    var checkBoxes = data.checkBoxes;

    var tableID = el.id + '_tbl';
    var tfName = 'tf_' + el.id;
    var inputID = outputID + '_edit';
        
    //  generate a filter input?
//    var filterInput = data.filterInput;
//    if(filterInput) {
//      data.tableProps["on_after_filter"] = function(o) {updateFilterInput(o)};
//    }
    var initialFilters = data.initialFilters;
    
    var sortKeys = data.sortKeys;
    
    // need to update colour after table sorting
    data.tableProps["on_after_sort"] = function(o) {colourCellsWrapper(o)};

    // remove existing table including table filter objects
    var table = d3tf.select(el).select("table").remove();
    var loader = d3tf.select(el).selectAll(".loader").remove();
    var inf = d3tf.select(el).selectAll(".inf").remove();
    
    // create new table
    table = d3tf.select(el)
                  .append("table");
                  
    var  thead = table.append("thead");
    var  tbody = table.append("tbody");
    
    table.attr("id", tableID)
         .classed({'table-condensed': true});
            
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
        .attr('id', function(d, i) {return 'row_' + i})
        .attr('class', 'tbl_' + outputID);
     if(data.key) {
      rows.attr("key", function(d,i) { return (data.key[i]) ;});
    }
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
        .attr('class', function(d, i){ 
          var j = this.parentNode.getAttribute("id");
          return "col_" + i + ' ' +  j + ' ' + 'tbl_' + outputID;
        });
    
    // create a table footer 
    var  tfoot = table.append("tfoot");
    
    // create a row for each object in the data
    var footrows = tfoot.selectAll("tr")
        .data(footdata)
        .enter()
        .append("tr")
        .attr('id', function(d, i) {return 'row_' + i})
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
        .attr('id', function(d, i){ 
          var j = this.parentNode.getAttribute("id");
          return j + '_col_' + i + '_' +  'tbl_' + outputID;
          
        })
        .attr('class', function(d, i){
          var j = this.parentNode.getAttribute("id");
          return "col_" + i + ' ' +  j + ' ' + 'tbl_' + outputID;
        });
    
    // make table bootstrap styled
    if(data.tableStyle !== null) {
      table.classed(data.tableStyle, true);
      tfoot.classed(data.tableStyle, true);
      thead.classed(data.tableStyle, true);
     }

    // apply row styles and add rows with style "info" to preselected
    var rowStyles = data.rowStyles;
    var selected = [];
    if(rowStyles != null) {
      rows.each(
        function(d, i, j) {
          
            var elt = d3tf.select(this);
            elt.classed(rowStyles[i], true);
            
            if(rowStyles[i] == data.selectableRowsClass){
              selected.push(i + 1)
            }
        }
      ) 
    }
    var inputID = outputID + "_select";
    if(window.HTMLWidgets.shinyMode) {
        Shiny.onInputChange(inputID, selected);
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
      var sel = d3tf.select(this);
      
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
        var cell = d3tf.select('#' + tbl)
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
    function checkRadio (name) {
      var tbl = name.replace(/_.*/g, '');
      var col = name.replace(/.*_col/, 'col');
      var editID = "edit_" + editCounter++;;
      var inputID = tbl + '_edit';
      var radio = d3tf.selectAll('#' + tbl)
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
      
      var cell = d3tf.selectAll('#' + tbl)
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
    
    // allow to reset an input value
   if(window.HTMLWidgets.shinyMode) {
   Shiny.addCustomMessageHandler('resetD3tfValue', function(variableName) {
        Shiny.onInputChange(variableName, null);
      });
   }
    // update data for D3
    function setCellData(cell, val, tbl, col) {
     var child = cell.select(":first-child");
     if(child.empty()) {
       var type = "other";
     } else {
       var type = child.attr("type");
     }
          if(type == "radio") {
              // uncheck other buttons in group
              var radio = d3tf.selectAll('#' + tbl)
                       .selectAll('td' + col)
                       .selectAll("input")
                       .property("checked", false);
              cell.selectAll("input").property("checked", val);
            } else if (type == "checkbox") {
              cell.selectAll("input").property("checked", val);
            } else if (cell.classed("sparklines")) {
              cell = cell.attr('value', val)
                         .html(val);
              setSparkline(tbl, cell, col.substr(1));
            } else {
              if(cell.selectAll("text").empty()) {
              // simple cell, update text directly
              cell = cell.attr('value', val)
                         .html(val);
              } else {
              // cell styled using cellfunctions, look for text element within
              cell = cell.attr('value', val)
                  .selectAll("text")
                  .html(val);
              }
            }

    }
    
    
    // turn cell content into sparklines
    function setSparklines(tbl) {
      var sparklines = window.D3TableFilter["sparklines_" + tbl];
      for (var key in sparklines) { 
         if (sparklines.hasOwnProperty(key)) { 
         table = tbl; 
         var sparkCell = d3tf.selectAll('#' + tbl)
           .selectAll('tbody')
           .selectAll('td.' + key)
           .classed("sparklines", true);
          setSparkline(tbl, sparkCell, key);
  			}
       }  
     };

    function setSparkline(tbl, cell, key) {
      var sparklines = window.D3TableFilter["sparklines_" + tbl];
      $(cell._groups[0]).sparkline('html', sparklines[key])
    }

    // server side edit, confirm or reject
    if(window.HTMLWidgets.shinyMode) {
      Shiny.addCustomMessageHandler("setCellValue",
          function(message) {
  
            var row = '#row_' + (Number(message["row"]) - 1);
            if(data.showRowNames) {
              var col = '.col_' + message["col"];
            } else  {
              var col = '.col_' + (message["col"] - 1);
            }
            var tbl = message["tbl"];
  
            if(message["foot"]) {
              var cell = d3tf.select('#' + tbl)
                           .selectAll('tfoot')
                           .select(row)
                           .select(col);
            } else {
              var cell = d3tf.select('#' + tbl)
                           .selectAll('tbody')
                           .select(row)
                           .select(col);
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
    }
    // format cells or turn cell content in graphics
    function runCellFunctions(tbl, col, foot) {
      if(foot == true) {
        var selector = "tfoot";
        var cellFunctions =  window.D3TableFilter["footCellFunctions_" + tbl];
      } else {
        var selector = "tbody"
        var cellFunctions = window.D3TableFilter["cellFunctions_" + tbl] ;
      }
      if(col == null) {
        // check whole table
        for (var key in cellFunctions) {
           if (cellFunctions.hasOwnProperty(key)) { 
             table = tbl; // strange. this makes it accessible inside of the select
             var cells = d3tf.selectAll('#' + table)
                           .selectAll(selector)
                           .selectAll('td.' + key);
                 cells.call(cellFunctions[key], tbl, key);
        			};
        }
      } else {
        // only selected column
        if (cellFunctions.hasOwnProperty(col)) {
          var cells = d3tf.selectAll('#' + tbl)
                        .selectAll(selector)
                        .selectAll('td.' + col);
              cells.call(cellFunctions[col], tbl, col);
        }
      }
    };


    // enable editing of a table 
    if(window.HTMLWidgets.shinyMode) {
      Shiny.addCustomMessageHandler("enableEdit",
          function(message) {
              var cells = d3tf.selectAll('#' + message["tbl"])
                            .selectAll('tbody');
              if(message["cols"] !== null) {
                  cells = cells.selectAll(message["cols"]);
              } else {
                  cells = cells.selectAll('td');
              }
              cells.attr("contenteditable", true);
              cells.on("input", debounce(shinyInputEvent, 800));
      });
    }
    // disable editing of a table
    if(window.HTMLWidgets.shinyMode) {
      Shiny.addCustomMessageHandler("disableEdit",
          function(message) {
              var cells = d3tf.selectAll('#' + message["tbl"])
                            .selectAll('tbody');
              if(message["cols"] !== null) {
                  cells = cells.selectAll(message["cols"]);
              } else {
                  cells = cells.selectAll('td');
              }
              cells.attr("contenteditable", false)
                      .on("input", null);
      });
    }
    // set filter
    if(window.HTMLWidgets.shinyMode) {
      Shiny.addCustomMessageHandler("setFilter",
          function(message) {
            var tfName = 'tf_' + message["tbl"];
            window[tfName].setFilterValue(message["col"], message["filterString"]);
            if(message["doFilter"]) {
              window[tfName].filter();
            }
  
      });
    }

    // highlight a table row
    if(window.HTMLWidgets.shinyMode) {
    Shiny.addCustomMessageHandler("rowClass",
        function(message) {
          var clss = message["class"];
          var tbl = message["tbl"];
          
          var rows = d3tf.selectAll('#' + tbl)
                .selectAll('tbody')
                .selectAll('tr');
                
          // radio button behavior: clear selectableRowsClass from all rows
          // restore previous class
          if (data.selectTableRows == "single" && clss == data.selectTableRows ) {
              rows.classed(data.selectableRowsClass, false);
              rows.classed(data.rowStyles, true);
          }

          // current row
          var row = d3tf.selectAll('#' +  tbl)
                      .select('#row_' + (Number(message["row"]) - 1));
              row.classed({"active": false,  "success": false, "info": false, "warning": false, "danger": false});
          if(clss != "none") {
            row.classed(clss, true);
          }
          
          // now update selected rows input
          if(window.HTMLWidgets.shinyMode) {
            var selected = [];
            rows.each(function(d, i) {
              if($(this).hasClass(data.selectableRowsClass)) {
                selected.push(Number(this.id.replace('row_', '')) + 1);
              }
            })
            var inputID = tbl + '_select';
            Shiny.onInputChange(inputID, selected);
          }
      });
    }
    
    // handler for selectableRows
    // create a shiny input event, named like 
    //  the corresponding output element + "_select"
    // also sends message to crosstalk
    if(typeof crosstalk != "undefined") {
      var ct_sel = new crosstalk.SelectionHandle(data.group);
      var ct_filter = new crosstalk.FilterHandle(data.group);
    }
    function shinyRowClickEvent(d, i, j) {
      
      log("rowclickevent");
      var regex = /tbl_(\w+)/;
      
      var tbl = regex.exec(this.className)[1];
      var rows = d3tf.selectAll('#' + tbl)
                  .selectAll('tbody')
                  .selectAll('tr');
      
      var inputID = tbl + '_select';
      var sel = d3tf.select(this);
     if (!d3tf.event.ctrlKey || data.selectableRows == "single" ) {
          rows.classed(data.selectableRowsClass, false);
      }
      if($(this).hasClass(data.selectableRowsClass)) {
        sel.classed(data.selectableRowsClass, false);
      } else {
        sel.classed(data.selectableRowsClass, true);
      }
      
      var selected = [];
      var selectedKeys = [];
      rows.each(function(d, i) {
        if($(this).hasClass(data.selectableRowsClass)) {
          selected.push(Number(this.id.replace('row_', '')) + 1);
          selectedKeys.push((String($(this).attr("key"))));
        }
      })
      if(typeof crosstalk != "undefined") {
        ct_sel.set(selectedKeys, {
          // Attach a sender property to the event
          sender: el
        });
      }
      if(window.HTMLWidgets.shinyMode) {
        Shiny.onInputChange(inputID, selected);
      }
    }

    // crosstalk selection handling
    if(typeof crosstalk != "undefined") {
      ct_sel.on("change", function(e) {
        if (e.sender === el) {
          return;
        }
        var rows = d3tf.select(el).selectAll('tbody')
                     .selectAll('tr')
                     .classed(data.selectableRowsClass, function(d) {
                        if($.inArray(String($(this).attr("key")), e.value) == -1) {
                          return false;
                       } else {
                         return true;
                       }
                       });
        });
    }

    // listen to crosstalk filter events
    if(typeof crosstalk != "undefined") {
      ct_filter.on("change", function(e) {
        if (e.sender === el) {
          return;
        };
        var rows = d3tf.select(el).selectAll('tbody')
                     .selectAll('tr')
                     .style("display", function(d) {
                        if($.inArray(String($(this).attr("key")), e.value) == -1) {
                          return "none";
                       } else {
                         return "table-row";
                       }
                       });
        });
     }

    // clear filters from table
    /* not supporte in TableFilter ?
    Shiny.addCustomMessageHandler("clearFilters",
        function(message) {
          var tfName = 'tf_' + message["tbl"];
          log("window[tfName]");
          log(window[tfName]);
          window[tfName].ClearFilters();
          if(message["doFilter"]) {
            window[tfName].filter();
          }
    });
*/

    // calculate min / max / extent per column. Can be used from R for
    // dynamic colour scale range  
    colExtent = function(tbl, col) {
      var colVals = d3tf.selectAll('#' + tbl)
                      .selectAll("tbody")
                      .selectAll('td.' + col)
                      .data();
      var colExtent = d3tf.extent(colVals, function(d) { return d.value; });
      return(colExtent);
    }
    colMin = function (tbl, col){
      var colVals = d3tf.selectAll('#' + tbl)
                      .selectAll("tbody")
                      .selectAll('td.' + col)
                      .data();
      var colMin = d3tf.min(colVals, function(d) { return d.value; })
      return(colMin);
    }
    colMax = function(tbl, col) {
      var colVals = d3tf.selectAll('#' + tbl)
                      .selectAll("tbody")
                      .selectAll('td.' + col)
                      .data();
      var colMax = d3tf.max(colVals, function(d) { return d.value; })
      return(colMax);
    }
    
    // apply fg and bg colour scales to column
    function colourCol(tbl, col) { 
      var bgColScales = window.D3TableFilter["bgColScales_" + tbl];
      if (bgColScales.hasOwnProperty(col)) {
      table = tbl; 
       var col2Color = d3tf.selectAll('#' + tbl)
                         .selectAll("tbody")
                         .selectAll('td.' + col)
                         .transition("bgcolor") 

          // run the d3 colour scale function defined in the bgColScales list on the R side
          col2Color.style("background-color", function(d, i){
        		return bgColScales[col](tbl, d.value);
  				});
       } 
      var fgColScales = window.D3TableFilter["fgColScales_" + tbl];
      if (fgColScales.hasOwnProperty(col)) {
          table = tbl; 
          d3tf.selectAll('#' + tbl)
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
    function colourCellsWrapper(o) {
      tbl = o['id'].replace(/_tbl/, '');
      colourCells(tbl);
    }
    
    // set background color for whole table
    // does nothing if length(bgColScales) == 0 and length(fgColScales) == 0
    function colourCells(tbl) {
    var bgColScales = window.D3TableFilter["bgColScales_" + tbl];
    for (var key in bgColScales) {
       if (bgColScales.hasOwnProperty(key)) { 
         table = tbl; // strange. this makes it accessible inside of the select
         d3tf.selectAll('#' + table)
           .selectAll('tbody')
           .selectAll('td.' + key)
           .style("background-color", function(d, i){
             // run the d3 colour scale function defined in the bgColScales list on the R side
      			return bgColScales[key](tbl, d.value);
  				});
       }  
     };

    // set text color for whole table
    var fgColScales = window.D3TableFilter["fgColScales_" + tbl];
    for (var key in fgColScales) { 
       if (fgColScales.hasOwnProperty(key)) { 
       table = tbl; // strange. this makes it accessible inside of the select
       d3tf.selectAll('#' + tbl)
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
    // additinally set crosstalk filter
    function updateFilterInput(tbl) {
      
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
      validKeys = [];
      d3tf.selectAll('#' + tbl['id'])
        .selectAll('tbody')
        .selectAll('tr')
        .each(function(d, i) {
        if(this.style["display"] !== "none") {
          // add 1 to match R row numbers
         validRows.push(Number(this.id.replace('r','')) + 1);
         validKeys.push($(this).attr("key"));
        } 
      });
      
      if(typeof ct_filter != "undefined") {
       ct_filter.set(validKeys);
      }
      
      var filters = tbl.getFiltersValue();
      var filterSettings = [];
      var i = 1;
      filters.forEach(function(x) {
        var column = 'col_' + i;
        var value = x;
        filterSettings.push({column: column, value: value}); 
        i++;
      });

      var filterInputID = tblID + '_filter';

      filters = {filterSettings: filterSettings, validRows: validRows};
      Shiny.onInputChange(filterInputID, filters);
    }
    
    // make table rows selectable
    if(data.selectableRows == "single" || data.selectableRows == "multi") {
      table.classed({'table-hover': true})
      rows.attr("clickable", true)
        .on("click", shinyRowClickEvent);
    }
    
    // make cells editable
    if(edit === true) {
      cells.attr("contenteditable", true)
        .on("input", debounce(shinyInputEvent, 800));
    } else if (typeof(edit) == "string") {
        rows.selectAll(edit)
            .attr("contenteditable", true);
        rows.selectAll(edit)   
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
              .attr('class', function(d, i){
                var j = this.parentNode.parentNode.getAttribute("id");
                return col + ' ' + j + ' ' + 'tbl_' + outputID;
              })
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
              .attr('class', function(d, i){
                var j = this.parentNode.parentNode.getAttribute("id");
                return col + ' ' + j + ' ' + 'tbl_' + outputID;
              })
              .property("checked", function(d, i) { return d.value; })
              .on("change", shinyInputEvent);
        })
     }
    
    // run d3 functions to format cells
    runCellFunctions(outputID);
    runCellFunctions(outputID, col = null, foot = true);
    
    // set intial color. Has to run again after table sorting. 
    colourCells(outputID);
    
    // apply sparkline 
    setSparklines(outputID);


 //   $(function() {
//        /** This code runs when everything has been loaded on the page */
//        /* Inline sparklines take their values from the contents of the tag */
//        $('.inlinesparkline').sparkline(); 
//
//    });


    // for mixed sorting give TableFilter a custom sort key generated by gtools::mixedsort
    for (var key in sortKeys) {
       if (sortKeys.hasOwnProperty(key)) { 
          d3tf.selectAll('#' + outputID)
           .selectAll('tbody')
           .selectAll('td.' + key)
           .data(sortKeys[key])
           .attr("data-tf-sortKey", function(d) { return(d);})
    }};
    
    // initialize table filter generator
    if(data.enableTf == true) {
//      window[tfName] = setFilterGrid(tableID, data.tableProps);
      window[tfName] = new TableFilter(tableID, data.tableProps);
      window[tfName].init();

      // initial filter settings
      for (var key in initialFilters) {
           if (initialFilters.hasOwnProperty(key)) {
              var col = Number(key.replace(/col_/, ''));
              window[tfName].setFilterValue(col, initialFilters[key]);
            };
      };
      window[tfName].filter();
      
      // crosstalk filter handling
      window[tfName].emitter.on(['after-filtering'], function(tf){ 
        console.log(tf.getValidRows());
        updateFilterInput(tf);
      });

    }
    
    // make thead and info row bootstrap styled
    // TODO: find a working solution for info row
    if(data.tableStyle != null) {
      thead.selectAll("tr").classed("active", true);
    }
    
  } // end of renderValue !!

}); // end of HTMLWIDGET !!
