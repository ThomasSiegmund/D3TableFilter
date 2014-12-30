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

//    var $j = jQuery.noConflict();

    // name ouf the output widget
    var outputID = el.id;

    var celldata = HTMLWidgets.dataframeToD3(data.data);

    var columns = Object.getOwnPropertyNames(celldata[0]);
    
    var table_Props = data.tableProps;
    
    // need to access this from shiny custom message functions
    // and to have it available for multiple tables in one document
    window["bgColScales_" + outputID] = data.bgColScales;
    window["fgColScales_" + outputID] = data.fgColScales;

    // have a unique id for each edit
    window["editCounter"] = 0;
    
    var interaction = data.interaction;
    
    var showRowNames = data.showRowNames;
    
    var tableID = el.id + '_tbl';
    var tfName = 'tf_' + el.id;
    var inputID = outputID + '_edit';

    //  generate a filter input?
    var filterInput = data.filterInput;
    if(filterInput) {
      table_Props["on_after_filter"] = function(o) {updateFilterInput(o)};
    }
    
    // need to update colour after table sorting
    table_Props["on_after_sort"] = function(o) {colourCellsWrapper(o)};

    // remove existing table including table filter objects
    var table = d3.select(el).select("table").remove();
    var loader = d3.select(el).selectAll(".loader").remove();
    var inf = d3.select(el).selectAll(".inf").remove();
    
    // create new table
    var table = d3.select(el).append("table").attr("id", tableID)
            thead = table.append("thead"),
            tbody = table.append("tbody");

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
        .attr('id', function(d, i) {return i});

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column, i, j) {
               return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
        .text(function(d) { return d.value; })
        // address columns table filter style
        .attr('class', function(d, i){ return "col_" + i; });
    
    // debounce from Underscore.js
    // modified to allow rapid editing of multiple cells
    // if args are different between subsequent calls, 
    // fire the previous call immediately.
    function debounce(func, wait, immediate) {
       var timeout, args, context, timestamp, result;
      return function() {
        if(args != null && args != arguments) {
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
      var editID = "edit_" + window["editCounter"]++;
      sel.attr('id', editID);
      var row = j + 1;
      if(showRowNames) {
        var col = i;
      } else {
        var col = i + 1;
      }
      var edit = {id: editID, row: row, col: col, val: sel.text()};
      log("sending edit event " + editID);
      Shiny.onInputChange(inputID, edit);
    }    
    
    // server doesn't accept edit. revert it. indicate by color change, revert if value
    // is given by server
    try {
      Shiny.addCustomMessageHandler("rejectEdit",
          function(message) {
            var cell = d3.select('#' + message["tbl"]).select('#' + message["id"]);
            // store color in attr so we can reset to it in subsequent edits
            cell.attr("oldcolor", function() {return cell.style("color")});
            var oldColor = cell.attr("oldcolor");
            cell.style("color", message["color"]);
            // if sever sends value, reset input to it and transition
            // color back to previous
            if(message["value"] !== null) {
                cell.transition()
                .duration(1500)
                .text(message["value"])
                .style("color", oldColor)
                .attr('id', '')
                .attr('oldcolor', '');
            }
      });
    } catch (err) {
      ; // already installed
    }
    
    // server accepted edit. confirm by switching back to original color
    // recalculate colour scale 
    try {
      Shiny.addCustomMessageHandler("confirmEdit",
          function(message) {
            var cell = d3.select('#' + message["tbl"]).select('#' + message["id"]);
            if(cell.attr("oldcolor")) {
              // if previous validation failed
              var oldColor = cell.attr("oldcolor");
            } else {
              var oldColor = cell.style("color");
            }
            var col = cell[0][0].className;
            if(message["color"]) {
                      cell.style("color", message["color"])
                          .transition()
                          .duration(1500)
                          .style("color", oldColor)
                          .attr('oldcolor', '');
            }
            if(message["value"] !== null) {
              var val = message["value"];
            } else {
              var val = cell.text();
            }
            cell.attr('value', val)
                .text(val);
            // todo: check if there is a d3 syntax to do this
            cell[0][0].__data__.value = val;
            colourCol(message["tbl"], col);
      });
    } catch (err) {
      ; // already installed
    }
    
    // enable editing of a table 
    try {
      Shiny.addCustomMessageHandler("enableEdit",
          function(message) {
              var cells = d3.selectAll('#' + message["tbl"]);
              if(message["col"] !== null) {
                cells = cells.selectAll('td.' + message["col"]);
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
            var cells = d3.selectAll('#' + message["tbl"]);
              if(message["col"] !== null) {
                cells = cells.selectAll('td.' + message["col"]);
              } else {
                cells = cells.selectAll('td');
              }
              cells.attr({contenteditable: false})
                      .on("input", null);
      });
    } catch (err) {
       ; // already installed
    }
    
    
    // calculate min / max / extent per column. Can be used from R for
    // dynamic colour scale range  
    colExtent = function(tbl, col) {
      var colVals = d3.selectAll('#' + tbl)
                      .selectAll('td.' + col)
                      .data();
      var colExtent = d3.extent(colVals, function(d) { return d.value; });
      return(colExtent);
    }
    colMin = function(tbl, col) {
      var colVals = d3.selectAll('#' + tbl)
                      .selectAll('td.' + col)
                      .data();
      var colMin = d3.min(colVals, function(d) { return d.value; })
      return(colMin);
    }
    colMax = function(tbl, col) {
      var colVals = d3.selectAll('#' + tbl)
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
                         .selectAll('td.' + col)
//            .transition() // running this transition cancels text colour transition

          // run the d3 colour scale function defined in the bgColScales list on the R side
          col2Color.style("background-color", function(d, i){
        		return bgColScales[col](tbl, d.value);
  				});
       } 
      var fgColScales = window["fgColScales_" + tbl];
      if (fgColScales.hasOwnProperty(col)) {
          table = tbl; 
          d3.selectAll('#' + tbl)
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
    
    // set text or background color for whole table
    // does nothing if length(bgColScales) == 0 and length(fgColScales) == 0
    colourCells = function(tbl) {
    var bgColScales = window["bgColScales_" + tbl];
    for (var key in bgColScales) {
       if (bgColScales.hasOwnProperty(key)) { 
         table = tbl; // strange. this makes it accessible inside of the select
         d3.selectAll('#' + table).selectAll('td.' + key)
           .style("background-color", function(d, i){
             // run the d3 colour scale function defined in the bgColScales list on the R side
      			return bgColScales[key](tbl, d.value);
  				});
       }  
     };
     
    var fgColScales = window["fgColScales_" + tbl];
    for (var key in fgColScales) { 
       if (fgColScales.hasOwnProperty(key)) { 
       table = tbl; // strange. this makes it accessible inside of the select
       d3.selectAll('#' + tbl).selectAll('td.' + key).style("color", function(d, i){
            // run the d3 colour scale function defined in the fgColScales list on the R side
        		return fgColScales[key](tbl, d.value);
  				});
       }  
     };
    };
    
    // generate a shiny input listing the filter settings and
    // the displayed rows index
    updateFilterInput = function(tbl) {
      log("updateFilterInput called");
      
      // extract table id from tablefiler object
      tblID = tbl['id'].replace(/_tbl/, '');
      tfName = "tf_" + tblID;
      
      // get the row index. don't use tablefilter validRows because
      // it depends on sorting
      validRows = [];
      d3.selectAll('#' + tbl['id']).selectAll('tbody').selectAll('tr').each(function(d, i) {
        if(this.style["display"] !== "none") {
          // add 1 to match R row numbers
          validRows.push(Number(this.id) + 1);
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
    
    // mouse click or edit event event
    if(interaction == "edit") {
      cells.attr({contenteditable: true})
        .on("input", debounce(shinyInputEvent, 800));
    };
     
    // initialize table filter generator
    window[tfName] = setFilterGrid(tableID, table_Props); 

    // set intial color. Has to run again after table sorting. 
    colourCells(outputID);

  } // end of renderValue !!

}); // end of HTMLWIDGET !!

// table generation based in part on
// stack overflow post
// http://stackoverflow.com/questions/9268645/creating-a-table-linked-to-a-csv-file



 