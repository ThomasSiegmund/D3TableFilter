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

    var celldata = HTMLWidgets.dataframeToD3(data.data);

    var columns = Object.getOwnPropertyNames(celldata[0]);
    
    var table_Props = data.tableProps;

    var bgColScales = data.bgColScales;

    var fgColScales = data.fgColScales;

    var tableID = data.tableID;
  
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
        .append("tr");

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
               return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
//        .on("mouseover", function(){d3.select(this).style("background-color", "aliceblue")})
//        .on("mouseout", function(){d3.select(this).style("background-color", "white")})
        .text(function(d) { return d.value; })
        .attr('class', function(d, i){ return "col_" + i; });
        
    
    var tf1 = setFilterGrid(tableID, table_Props); 

    // set text or background colour
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

    }
});

// table generation based in part on
// stack overflow post
// http://stackoverflow.com/questions/9268645/creating-a-table-linked-to-a-csv-file


