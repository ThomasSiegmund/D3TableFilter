# ----------------------------------------------------------------------
# Shiny app demonstrating interactive features of the tableFilter widget
# ----------------------------------------------------------------------
library(shiny)
library(htmlwidgets)
library(tableFilter)

data(mtcars);
mtcars <- mtcars[, 1:2];
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
          rejectEdit(session, tbl = "mtcars", id = id, value = oldval);
          revals$edits["Fail", "Row"] <- row;
          revals$edits["Fail", "Column"] <- col;
          revals$edits["Fail", "Value"] <- val;
          return(NULL);
        }
      } else if (col %in% c(1, 2)){
        # numeric columns
        if(is.na(suppressWarnings(as.numeric(val)))) {
          oldval <- revals$mtcars[row, col];
          # reset to the old value
          # input will turn red briefly, than fade to previous color while
          # text returns to previous value
          rejectEdit(session, tbl = "mtcars", id = id, value = oldval);
          revals$edits["Fail", "Row"] <- row;
          revals$edits["Fail", "Column"] <- col;
          revals$edits["Fail", "Value"] <- val;
          return(NULL);
        } 
      } else if (col == 3) {
        ; #nothing to validate for logical columns
      }
      
      # accept edits
      if(col == 0) {
        rownames(revals$mtcars)[row] <- val;
      } else if (col %in% c(1, 2, 3)) {
        revals$mtcars[row, col] <- val;
        val = round(as.numeric(val), 1)
      } else if (col == 4) {
        # radio buttons. There is no uncheck event
        # so we need to set the whole column to FALSE here
        revals$mtcars[, "favorite"] <- FALSE;
        revals$mtcars[row, col] <- val;
      }
      confirmEdit(session, tbl = "mtcars", id = id, value = val);
      revals$edits["Success", "Row"] <- row;
      revals$edits["Success", "Column"] <- col;
      revals$edits["Success", "Value"] <- val;
    })
    
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
      sort_config = list(
        # alphabetic sorting for the row names column, numeric for all other columns
        sort_types = c("String", "Number", "Number", "none", "none")
      ),
      col_3 = "none",
      col_4 = "none"
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
    # turning cell values into scaled SVG graphics
    cellFunctions <- list(
      col_2 = JS('function makeGraph(selection){
        // remove text
        selection.text(null)

        // create svg element
        var svg = selection.append("svg")
              .attr("width", 24)
              .attr("height", 24);
              
              // create a circle with a radius ("r") scaled to the 
              // value of the cell ("d.value")
              svg.append("circle")
              .attr("cx", 12)
              .attr("cy", 12)
              .attr("r", function(d) { return Math.sqrt(d.value) * 4.242641; })
              .style("fill", "orange")
              .attr("stroke","none");
              
              // place the text within the circle
              svg.append("text")
              .style("fill", "black")
              .attr("x", 12)
              .attr("y", 12)
              .attr("dy", ".35em")
              .attr("text-anchor", "middle")
              .text(function (d) { return d.value; });
      }')
    );
      
    initialFilters = list(col_1 = ">20");

    tableFilter(mtcars, tableProps,
                showRowNames = TRUE,
                rowNamesColumn = "Model",
                edit = c("col_1"),
                checkBoxes = "col_3",
                radioButtons = "col_4",
                cellFunctions = cellFunctions,
                bgColScales = bgColScales,
                filterInput = TRUE,
                initialFilters = initialFilters, height = 2000);
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
  
  observe({
    setRowClass(session, tbl = "mtcars2", row = 5, class = input$hornetClass);
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
      filters_row_index = 1
    );

    tableFilter(mtcars[ , 1:2],
                tableProps, showRowNames = TRUE, 
                selectableRows = "multi",
                selectableRowsClass = "success",
                filterInput = TRUE, height = 500);
  })
  
  # for a output object "mtcars2" tableFilter generates an input
  # "mtcars2_edit". 
  output$mtcars2Output <- renderTable({
    if(is.null(input$mtcars2_select)) return(NULL);
    mtcars[input$mtcars2_select, 1:2];
  })
  
  
  
})
