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

    var celldata = HTMLWidgets.dataframeToD3(data.data);

    var columns = Object.getOwnPropertyNames(celldata[0]);
    
    var table_Props = data.tableProps;

    var bgColScales = data.bgColScales;

    var fgColScales = data.fgColScales;
    log("bgColScales");
    log(bgColScales);
    var interaction = data.interaction;

    var tableID = data.tableID;
    
    var showRowNames = data.showRowNames;
    
    var outputID = el.id;
    var inputID = outputID + '_edit';
    var editnumber = 0;
    
    var editColor = data.editColor;
    var errorColor = data.errorColor;
    
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
    
    // mouse click or edit event event
    if(interaction == "edit") {
      cells.attr({contenteditable: true})
        .on("input", debounce(shinyInputEvent, 800));
    };
     
    // debounce
    // from Underscore.js
    function debounce(func, wait, immediate) {
      var timeout, args, context, timestamp, result;
      return function() {
        context = this;
        args = arguments;
        timestamp = new Date();
        var later = function() {
          var last = (new Date()) - timestamp;
          if (last < wait) {
            timeout = setTimeout(later, wait - last);
          } else {
            timeout = null;
            if (!immediate) result = func.apply(context, args);
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

    // this creates a shiny input event, named as the corresponding output element 
    // + "_edit"
    function shinyInputEvent(d, i, j) {
    	var sel = d3.select(this);
      var editID = inputID + editnumber++;
      sel.attr('id', editID)
      .attr("oldcolor", function() {return sel.style("color")})
      .style("color", editColor);
      editnumber++;
      var row = j + 1;
      if(showRowNames) {
        var col = i;
      } else {
        var col = i + 1;
      }
      var edit = {id: editID, row: row, col: col, val: sel.text()};
      Shiny.onInputChange(inputID, edit);
    }    
    
    // server does not accept edit. revert it. signal by transient color 
    Shiny.addCustomMessageHandler("rejectEdit",
        function(message) {
          var cell = d3.select(document.getElementById(message["id"]));
          var oldColor = cell.attr("oldcolor");
                    cell.style("color", errorColor)
                        .transition()
                        .delay(1500)
                        .text(message["value"])
                        .style("color", oldColor)
                        .attr('id', '');
    });
        
    // server accepted edit. confirm by switching back to original color
    // recalculate colour scale 
    Shiny.addCustomMessageHandler("confirmEdit",
        function(message) {
          var cell = d3.select(document.getElementById(message["id"]));
          var oldColor = cell.attr("oldcolor");
          var col = cell[0][0].className;
                    cell.transition()
                        .delay(700)
                        .style("color", oldColor)
                        .attr('id', '')
                        .attr('value', message["value"]);
                        log("cell");
                        // todo: check if there is a d3 syntax to do this
                        cell[0][0].__data__.value = message["value"];
                        debounce(colourCol(col), 1000);
      });
    
    // initialize table filter generator
    // var totRowIndex = tf_Tag(tf_Id(tableID),"tr").length; // for row counter, not yet supported
    var tf1 = setFilterGrid(tableID, table_Props); 

    // apply fg and bg colour scales to column
    colourCol  = function(col) {
      
      if (bgColScales.hasOwnProperty(col)) { 
       d3.selectAll('td.' + col)
            .transition()
            .style("background-color", function(d, i){
            // run the d3 colour scale function defined in the bgColScales list on the R side
        		return bgColScales[col](d.value);
  				});
       }  
      
      if (fgColScales.hasOwnProperty(col)) { 
          d3.selectAll('td.' + col)
          .transition()
          .style("background-color", function(d, i){
            // run the d3 colour scale function defined in the bgColScales list on the R side
          	return bgColScales[col](d.value);
  				});
      }

    }

    // set text or background colour
    // does nothing if length(bgColScales) == 0 and length(fgColScales) == 0
    colourCells = function() {
      log("running colourCells");
    for (var key in bgColScales) { 
       if (bgColScales.hasOwnProperty(key)) { 
       d3.selectAll('td.' + key).style("background-color", function(d, i){
            // run the d3 colour scale function defined in the bgColScales list on the R side
      			return bgColScales[key](d.value);
  				});
       }  
     };
     
    for (var key in fgColScales) { 
       if (fgColScales.hasOwnProperty(key)) { 
       d3.selectAll('td.' + key).style("color", function(d, i){
            // run the d3 colour scale function defined in the fgColScales list on the R side
        		return fgColScales[key](d.value);
  				});
       }  
     };
    };
    // set intial color. Has to run again after table sorting. 
    colourCells();
    
  } // end of renderValue !!

}); // end of HTMLWIDGET !!

// table generation based in part on
// stack overflow post
// http://stackoverflow.com/questions/9268645/creating-a-table-linked-to-a-csv-file



 