# ----------------------------------------------------------------------
# test script for interactive features of the d3tf widget outside of shiny
# ----------------------------------------------------------------------
library(htmlwidgets)
library(D3TableFilter)
library(magrittr)

data(mtcars);
mtcars <- mtcars[, 1:3];
mtcars$candidates <- FALSE;
mtcars$favorite <- FALSE;
myCandidates <- sample(nrow(mtcars), 5);
myFavorite <- sample(myCandidates, 1);
mtcars[myFavorite, "favorite"] <- TRUE;
mtcars[myCandidates, "candidates"] <- TRUE;

    # define table properties. See http://tablefilter.free.fr/doc.php
    # for a complete reference
    tableProps <- list(
      btn_reset = TRUE,
      sort = TRUE,
      on_keyup = TRUE,  
      on_keyup_delay = 800,
      rows_counter = TRUE,  
      rows_counter_text = "Rows: ",
      col_number_format= c(NULL, "US", "US", "US", NULL, NULL), 
      sort_config = list(
        # alphabetic sorting for the row names column, numeric for all other columns
        sort_types = c("String", "Number", "Number", "Number", "none", "none")
      ),
      col_4 = "none",
      col_5 = "none",
      # exclude the summary row from filtering
      rows_always_visible = list(nrow(mtcars) + 2)
    );
    
    # columns are addressed in TableFilter as col_0, col_1, ..., coln
    # the "auto" scales recalculate the data range after each edit
    # to get the same behaviour with manually defined colour scales
    # you can use the "colMin", "colMax", or "colExtent" functions,
    # e.g .domain(colExtent("col_1")) or .domain([0, colMax(col_1)])
    bgColScales <- list(
      col_1 = "auto:white:green"
    );
    
    # apply D3.js functions to a column,
    # e.g. to turn cell values into scaled SVG graphics
    cellFunctions <- list(
      col_2 = JS('function makeGraph(selection){
                 
                 // find out wich table and column
                 var regex = /(col_\\d+)/;
                 var col = regex.exec(this[0][0].className)[0];
                 var regex = /tbl_(\\S+)/;
                 var tbl = regex.exec(this[0][0].className)[1];
                 
                 // create a scaling function
                 var domain = colExtent(tbl, col);
                 var rScale = d3.scale.sqrt()
                 .domain(domain)
                 .range([8, 14]);
                 
                 // column has been initialized before, update function
                 if(tbl + "_" + col + "_init" in window) {
                 var sel = selection.selectAll("svg")
                 .selectAll("circle")
                 .transition().duration(500)
                 .attr("r", function(d) { return rScale(d.value)});
                 return(null);
                 }
                 
                 // remove text. will be added later within the svg
                 selection.text(null)
                 
                 // create svg element
                 var svg = selection.append("svg")
                 .attr("width", 28)
                 .attr("height", 28);
                 
                 // create a circle with a radius ("r") scaled to the 
                 // value of the cell ("d.value")
                 var circle = svg.append("g")
                 .append("circle").attr("class", "circle")
                 .attr("cx", 14)
                 .attr("cy", 14)
                 .style("fill", "orange")
                 .attr("stroke","none")
                 .attr("r", domain[0])
                 .transition().duration(400)
                 .attr("r", function(d) { return rScale(d.value); }); 
                 
                 // place the text within the circle
                 var text = svg.append("g")
                 .append("text").attr("class", "text")
                 .style("fill", "black")
                 .attr("x", 14)
                 .attr("y", 14)
                 .attr("dy", ".35em")
                 .attr("text-anchor", "middle")
                 .text(function (d) { return d.value; });
                 window[tbl + "_" + col + "_init"] = true;
                 
  }'),
      col_3 = JS('function makeGraph(selection){
                 
                 // find out wich table and column
                 var regex = /(col_\\d+)/;
                 var col = regex.exec(this[0][0].className)[0];
                 var regex = /tbl_(\\S+)/;
                 var tbl = regex.exec(this[0][0].className)[1];
                 var innerWidth = 117;
                 var innerHeight = 14;
                 
                 // create a scaling function
                 var max = colMax(tbl, col);
                 var min = colMin(tbl, col);
                 var wScale = d3.scale.linear()
                 .domain([0, max])
                 .range([0, innerWidth]);
                 
                 // text formatting function
                 var textformat = d3.format(".1f");
                 
                 // column has been initialized before, update function
                 if(tbl + "_" + col + "_init" in window) {
                 var sel = selection.selectAll("svg")
                 .selectAll("rect")
                 .transition().duration(500)
                 .attr("width", function(d) { return wScale(d.value)});
                 var txt = selection
                 .selectAll("text")
                 .text(function(d) { return textformat(d.value); });
                 return(null);
                 }
                 
                 // can remove padding here, but still cant position text and box independently
                 this.style("padding", "5px 5px 5px 5px");
                 
                 // remove text. will be added back later
                 selection.text(null);
                 
                 var svg = selection.append("svg")
                 .style("position",  "absolute")
                 .attr("width", innerWidth)
                 .attr("height", innerHeight);
                 
                 var box = svg.append("rect")
                 .style("fill", "lightblue")
                 .attr("stroke","none")
                 .attr("height", innerHeight)
                 .attr("width", min)
                 .transition().duration(500)
                 .attr("width", function(d) { return wScale(d.value); });
                 
                 // format number and add text back
                 var textdiv = selection.append("div");
                 textdiv.style("position",  "relative")
                 .attr("align", "right");
                 
                 textdiv.append("text")
                 .text(function(d) { return textformat(d.value); });
                 window[tbl + "_" + col + "_init"] = true;
      }')
    );
    
    # apply D3.js functions to footer columns,
    # e.g. to format them or to turn cell values into scaled SVG graphics
    footCellFunctions <- list(
      col_0 = JS('function makeGraph(selection){
                 selection.style("font-weight", "bold")
}'),
      col_1 = JS('function makeGraph(selection){
                 // text formatting function
                 var textformat = d3.format(".1f");
                 selection.style("font-weight", "bold")
                 .text(function(d) { return textformat(d.value); });
      }'),
      col_2 = JS('function makeGraph(selection){
                 // text formatting function
                 var textformat = d3.format(".1f");
                 selection.style("font-weight", "bold")
                 .text(function(d) { return textformat(d.value); });
      }'),
      col_3 = JS('function makeGraph(selection){
                 // text formatting function
                 var textformat = d3.format(".1f");
                 // make cell text right aligned
                 selection.classed("text-right", true)
                 .style("font-weight", "bold")
                 .text(function(d) { return textformat(d.value); });
      }')
    );
    initialFilters = list(col_1 = ">20");
    
    colNames = c(Rownames = "Model", mpg = "Miles per gallon",	cyl = "Cylinders",	disp = "Displacement",	candidates = "Candidates",	favorite = "My favorite");
    
    # add a summary row. Can be used to set values statically, but also to 
    # make use of TableFilters "col_operation"
    footData <- data.frame(Rownames = "Mean", mpg = mean(mtcars$mpg), cyl = mean(mtcars$cyl), disp = mean(mtcars$disp));
    
    # the mtcars table output
    d3tf(mtcars, tableProps = tableProps,
         showRowNames = TRUE,
         colNames = colNames,
         edit = c("col_1", "col_3"),
         checkBoxes = "col_4",
         radioButtons = "col_5",
         cellFunctions = cellFunctions,
         tableStyle = "table table-bordered",
         bgColScales = bgColScales,
         filterInput = TRUE,
         initialFilters = initialFilters,
         footData = footData,
         footCellFunctions = footCellFunctions,
         height = 2000) %>%
        saveWidget(file = "test.html", selfcontained = FALSE)
  
