# ----------------------------------------------------------------------
# Shiny app demonstrating interactive features of the tableFilter widget
# ----------------------------------------------------------------------
library(shiny)
library(htmlwidgets)
library(tableFilter)

data(mtcars);
mtcars <- mtcars[, 1:3];
mtcars$candidates <- FALSE;
mtcars$favorite <- FALSE;
myCandidates <- sample(nrow(mtcars), 5);
myFavorite <- sample(myCandidates, 1);
mtcars[myFavorite, "favorite"] <- TRUE;
mtcars[myCandidates, "candidates"] <- TRUE;

edits <- data.frame(Row = c("", ""), Column = (c("", "")), Value = (c("", "")), stringsAsFactors = FALSE);
rownames(edits) <- c("Fail", "Success");

filtering <- data.frame(Rows = c(nrow(mtcars), nrow(mtcars)), Indices = c(paste(1:nrow(mtcars), collapse = ', '), paste(1:nrow(mtcars), collapse = ', ')), stringsAsFactors = FALSE);
rownames(filtering) <- c("Before", "After")

shinyServer(function(input, output, session) {
  
  revals <- reactiveValues();
  
  revals$mtcars <- mtcars;
  revals$edits <- edits;
  revals$filtering <- filtering;
  revals$filters <- NULL;
  revals$rowIndex <- 1:nrow(mtcars);
  revals$filters <- data.frame(Column = character(), Filter = character(), stringsAsFactors = FALSE);
  
  observe({
    if(is.null(input$mtcars_filter)) return(NULL);
    revals$rowIndex <- unlist(input$mtcars_filter$validRows);
    revals$filtering["After", "Rows"] <- length(revals$rowIndex);
    revals$filtering["After", "Indices"] <- paste(revals$rowIndex, collapse = ', ');
    
    filterSettings <-input$mtcars_filter$filterSettings;
    tmp <- lapply(filterSettings, function(x) data.frame(Column = x$column, Filter = x$value, stringsAsFactors = FALSE));
    revals$filters <- do.call("rbind", tmp);
  })
  
  # for a output object "mtcars" tableFilter generates an input
  # "mtcars_edit"
  # this observer does a simple input validation and sends a confirm or reject message after each edit.
  observe({
    if(is.null(input$mtcars_edit)) return(NULL);
     edit <- input$mtcars_edit;

    isolate({
      # need isolate, otherwise this observer would run twice
      # for each edit
      id <- edit$id;
      row <- as.integer(edit$row);
      col <- as.integer(edit$col);
      val <- edit$val;
      
      # validate input 
      if(col == 0) {
        # rownames
        oldval <- rownames(mtcars)[row];
        if(grepl('^\\d', val)) {
          rejectEdit(session, tbl = "mtcars", row = row, col = col,  id = id, value = oldval);
          revals$edits["Fail", "Row"] <- row;
          revals$edits["Fail", "Column"] <- col;
          revals$edits["Fail", "Value"] <- val;
          return(NULL);
        }
      } else if (col %in% c(1, 2, 3)){
        # numeric columns
        if(is.na(suppressWarnings(as.numeric(val)))) {
          oldval <- revals$mtcars[row, col];
          # reset to the old value
          # input will turn red briefly, than fade to previous color while
          # text returns to previous value
          rejectEdit(session, tbl = "mtcars", row = row, col = col, id = id, value = oldval);
          revals$edits["Fail", "Row"] <- row;
          revals$edits["Fail", "Column"] <- col;
          revals$edits["Fail", "Value"] <- val;
          return(NULL);
        } 
      } else if (col %in% c(4, 5)) {
        ; #nothing to validate for logical columns
      }
      
      # accept edits
      if(col == 0) {
        rownames(revals$mtcars)[row] <- val;
      } else if (col %in% c(1, 2, 3)) {
        revals$mtcars[row, col] <- as.numeric(val);
        val = round(as.numeric(val), 1)
      } else if (col == 4) {
        # radio buttons. There is no uncheck event
        # so we need to set the whole column to FALSE here
        revals$mtcars[, "favorite"] <- FALSE;
        revals$mtcars[row, col] <- val;
      }
      # confirm edits
      confirmEdit(session, tbl = "mtcars", row = row, col = col, id = id, value = val);
      revals$edits["Success", "Row"] <- row;
      revals$edits["Success", "Column"] <- col;
      revals$edits["Success", "Value"] <- val;
    })
    
   })
  
  # update summary row. calculate mean/median of displayed row for cols 1:3
  observe({
    for (col in c(1, 2, 3)) {
      if(input$summaryRow == "mean") {
        setFootCellValue(session, tbl = "mtcars", row = 1, col = 0, value = "Mean");
        value = round(mean(revals$mtcars[revals$rowIndex, col]), 1);
      } else {
        setFootCellValue(session, tbl = "mtcars", row = 1, col = 0, value = "Median");
        value = round(median(revals$mtcars[revals$rowIndex, col]), 1);
      }
      setFootCellValue(session, tbl = "mtcars", row = 1, col = col, value = value);
    }
  })
  
  output$edits <- renderTable({
    if(is.null(revals$edits)) return(invisible());
    revals$edits;
  });
  
  output$filtering <- renderTable({
    if(is.null(revals$filtering)) return(invisible());
    revals$filtering;
  });

  output$filters <- renderTable({
      if(nrow(revals$filters) == 0) return(invisible());
      revals$filters;
    });
  
  output$filteredMtcars <- renderTable({
      if(is.null(revals$rowIndex)) return(invisible());    
      if(is.null(revals$mtcars)) return(invisible());
      revals$mtcars[revals$rowIndex, ];
    });
  
  output$mtcars <- renderTableFilter({
    
    # define table properties. See http://tablefilter.free.fr/doc.php
    # for a complete reference
    tableProps <- list(
      alternate_rows = FALSE,
      btn_reset = TRUE,
      sort = TRUE,
      on_keyup = TRUE,  
      on_keyup_delay = 800,
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
    
    # add a summary row. Can be used to set values statically, but also to 
    # make use of TableFilters "col_operation"
    footData <- data.frame(Model = "Mean", mpg = mean(mtcars$mpg), cyl = mean(mtcars$cyl), disp = mean(mtcars$disp));

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
        var regex = /tbl_(\\w+)/;
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
        var regex = /tbl_(\\w+)/;
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
        
        // can remove padding here, but still cant fill whole cell with svg 
        this.style("padding", "0px 5px 0px 5px");

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

    # the mtcars table output
    tableFilter(mtcars, tableProps,
                showRowNames = TRUE,
                rowNamesColumn = "Model",
                edit = c("col_1", "col_3"),
                checkBoxes = "col_4",
                radioButtons = "col_5",
                cellFunctions = cellFunctions,
                bgColScales = bgColScales,
                filterInput = TRUE,
                initialFilters = initialFilters,
                footData = footData,
                footCellFunctions = footCellFunctions,
                height = 2000);
  })
    
  observe({
    if(input$editingCol0) {
      enableEdit(session, "mtcars", "col_0");
    } else {
      disableEdit(session, "mtcars", "col_0");
    }
  })
  
  observe({
      input$dofilter;
      isolate({
        setFilter(session, tbl = "mtcars", col = "col_0", filterString = input$filterString, doFilter = TRUE);
      })
    })
  
  observe({
    input$clearfilter;
       clearFilters(session, tbl = "mtcars", doFilter = TRUE);
  })
  
  # server side editing of a cell value
  observe({
    # Row address is based on the complete, unfiltered and unsorted table
    # Column address is one based. In this case showRowNames is TRUE,
    # rownames column is col 0, "cylinders" is col 2.
    setCellValue(session, tbl = "mtcars", row = 8, col = 2, value = input$cellVal, feedback = TRUE);
  })
  
  # server side editing of checkbox
  output$candidateUi <- renderUI({
    radioButtons("candidate", "Make Datsun candidate", choices = c("yes" = TRUE, "no" = FALSE, selected = mtcars["Datsun 710", "candidate"]))
  })
  
  # server side editing of checkbox
  observe({
    if(is.null(input$candidate)) return(NULL);
    # why do I get string values and not logicals here? Shiny bug?
    if(input$candidate == "TRUE") {
      candidate = TRUE;
    } else if (input$candidate == "FALSE") {
      candidate = FALSE;
    } else {
      candidate = input$candidate;
    }
    setCellValue(session, tbl = "mtcars", row = 3, col = 4, value = candidate, feedback = TRUE);
  })
  
  # server side editing of radio button
  observe({
    input$favorite;
    setCellValue(session, tbl = "mtcars", row = 3, col = 5, value = TRUE, feedback = TRUE);
  })
  
  ## demonstrate selectable rows interface
  output$mtcars2 <- renderTableFilter({
    
    # define table properties. See http://tablefilter.free.fr/doc.php
    # for a complete reference
    tableProps <- list(
      btn_reset = TRUE,
      sort = TRUE,
      on_keyup = TRUE,  
      on_keyup_delay = 800,
      sort_config = list(
        sort_types = c("Number", "Number")
      ),
      filters_row_index = 1,
      # adding a summary row, showing the column means
      rows_always_visible = list(nrow(mtcars) + 2),
      col_operation = list( 
        id = list("frow_0_fcol_1_tbl_mtcars2","frow_0_fcol_2_tbl_mtcars2"),    
        col = list(1,2),    
        operation = list("mean","mean"),
        write_method = list("innerhtml",'innerhtml'),  
        exclude_row = list(nrow(mtcars) + 2),  
        decimal_precision = list(1, 1)
      )
    );
    
    # add a summary row. Can be used to set values statically, but also to 
    # make use of TableFilters "col_operation"
    footData <- data.frame(Rownames = "Mean", mpg = 0, cyl = 0);
    
    tableFilter(mtcars[ , 1:2],
                tableProps, showRowNames = TRUE, 
                selectableRows = "multi",
                selectableRowsClass = "info",
                filterInput = TRUE,
                footData = footData,
                height = 500);
  })
  
  
  # for a output object "mtcars2" tableFilter generates an input
  # "mtcars2_edit". 
  output$mtcars2Output <- renderTable({
    if(is.null(input$mtcars2_select)) return(NULL);
    mtcars[input$mtcars2_select, 1:2];
  })
  
  # set class on a row
  observe({
    setRowClass(session, tbl = "mtcars2", row = 5, class = input$hornetClass);
  })
  
  
  
})
