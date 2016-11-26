#' d3tf Generate a HTML table widget with advanced filtering, sorting and 
#' colouring.
#' 
#' R interface to Max Guglielmi's \href{http://tablefilter.free.fr/ }{HTML Table
#' Filter Generator} JavaScript library. Provides advanced filtering and 
#' sorting. Columns can be formatted using D3 functions.
#' 
#' @section Configuration: The D3TableFilter widget can be highly customized. 
#'   See the website of the JavaScript library 
#'   \href{http://tablefilter.free.fr/}{HTML Table Filter Generator} for 
#'   details. Configuration is passed as a list of key value pairs to the 
#'   JavaScript engine. A shiny app demonstrating many useful features in one 
#'   table can be found in the inst/examples/feature directory of this package.
#'   
#' @section Extensions: Some of the TableFilter functions are beeing provided as
#'   extensions, in particular \itemize{ \item ColsVisibility: Visibility of 
#'   columns can be adjusted by configuration or interactively \item 
#'   ColumnsResizer: Interactive resizing of column width \item 
#'   FiltersRowVisibility: Interactively show or hide the filter row. } To 
#'   activate these extensions simply define them as a character vector in the 
#'   extensions parameter, e.g. \code{extensions = c("ColsVisibility", 
#'   "ColumnsResizer", "FiltersRowVisibility")}. This takes care of enabling and
#'   basic configuration of the extensions. For further customization use the 
#'   tableProps parameter.
#'   
#' @section Editing: The whole table (\code{edit = TRUE}) or selected columns 
#'   (\code{edit = c("col_1", "col_3")}) can set to be editable. An editable 
#'   table provides an input element named like the corresponding output element
#'   + "_edit". Here each (debounced) edit event in a table cell is visible as a
#'   list of row (\code{row}), column (\code{col}) and new value (\code{val}). 
#'   See examples/interaction for a Shiny app demonstrating this feature.
#'   
#' @section Colouring: Table columns can be colored based on their cells value 
#'   using D3.js colour scales. Table background and foreground (text) can be 
#'   coloured independently. Colour definitions are passed to the JavaScript 
#'   engine as D3 scale functions. This allows for a variety of scales for 
#'   different purposes. See 
#'   \href{https://github.com/mbostock/d3/wiki/Scales}{D3 scale documentation} 
#'   and examples below for details. As a shortcut a linear scale over the full 
#'   value range of a column can be defined as \code{col_n = 
#'   "auto:startcolour:endcolour"} (n is the column number, starting with 0).
#'   For better mapping from numeric values to perceived intensity a HCL colour 
#'   interpolation is used. An example Shiny app showing various colour scales
#'   can be found in the inst/examples/colour/ directory of this package.
#'   
#' @section Row selection: If \code{selectableRows} is set to \code{"single"} or
#'   to \code{"multi"}, the widget provides a shiny input named outputid + 
#'   "_select". On (\code{ctrl-}) mouse click the input delivers an array of 1 
#'   based row coordinates. Selected rows are highligthed using the "info" 
#'   Bootstrap class. \code{setRowClass} can be used to set or to unset this 
#'   class from the server. See the "interaction" shiny app in the 
#'   inst/examples/ directory of this package for an example.
#'   
#' @section Sparklines: Table columns containing a comma separated series of 
#'   numbers (\code{"1,3,5,7,11"}) can be turned into sparkline visualizations.
#'   For example, \code{sparklines = list(col_0 = list(type = "line"))} will
#'   turn the cells of the first column into a minature line chart. See the
#'   "sparklines" shiny app in the inst/examples/sparklines directory of this
#'   package for an example.
#'   
#' @param df Data frame or matrix to display as html table
#' @param enableTf Enable the features for the "HTML table filter generator"
#' @param tableProps A list object describing appearence and function of the 
#'   table
#' @param showRowNames Add the R row names as first column to the table
#' @param colNames Named character list to display as column names
#' @param extensions List of table filter extensions to load. See
#'   inst/examples/feature/server.R
#' @param selectableRows Enable row selection on (\code{cltr-}) mouse click. If 
#'   \code{"multi"} multiple rows will be selectable using (\code{cltr click}), 
#'   if  \code{"single"}  only a single line will be selectable.
#' @param selectableRowsClass CSS class of selected row. Could be "active", 
#'   "success", "info", "warning", or "danger" from Bootstrap3. Default: "info."
#' @param tableStyle List css classes to apply to a table. Bootstrap3 provides 
#'   \code{table}, \code{table-striped}, \code{table-bordered}, 
#'   \code{table-hover}, and \code{table-condensed}. The \code{table-hover} 
#'   class is applied automatically if \code{selectableRows} is active. If 
#'   \code{tableStyle} is not NULL, the normal CSS styling of TableFilter is 
#'   automatically cut down by appending \code{stylesheet = 
#'   "tablefilter-2.5/filtergridBS.css"} to the tableProps.
#' @param rowStyles Character vector of Bootstrap classes to apply to rows. 
#'   Could be used to pre-select rows when using the \code{selectableRows} 
#'   interface.
#' @param bgColScales List of background colour scales to apply to the columns
#' @param fgColScales List of text colour scales to apply to the columns
#' @param edit Set whole table or selected columns editable. See details.
#' @param radioButtons Turn logical columns into radio buttons 
#'   (\code{radioButtons = "col_4"}).
#' @param checkBoxes Turn logical columns into checkboxes (\code{checkBoxes = 
#'   "col_3"}).
#' @param cellFunctions Run D3 functions to format a column. Can be used to 
#'   generate D3 graphics in cells.
#' @param filterInput Generate an input element named outputid + "_filter" 
#'   listing filter settings and valid rows
#' @param initialFilters List of initial filter settings filter settings and 
#'   valid rows
#' @param footData Data frame or matrix to append as footer to the table. Column
#'   names must match the colnames of the main table. Cells in the footer will 
#'   get an id attribute (e.g. first footer row, second column in "mtcars" 
#'   output is named "frow_0_fcol_1_tbl_mtcars") allowing them to be used with 
#'   the "col_operation" option of TableFilter.
#' @param footCellFunctions Run D3 functions to format a footer column. Can be 
#'   used to format table footer or to generate D3 graphics in cells.
#' @param  sparklines List of per column options to turn cell values into 
#'   sparkline visulizations.
#' @param key Vector of unique row identifiers for crosstalk
#' @param group Scoping group for crosstalk widget to widget communication
#' @example inst/examples/basic/server.R
#' @seealso \code{\link[DT]{datatable}}.
#' @examples
#' # ------------------------------------------------------------------------------
#' # colour definition: apply a white to blue linear scale to the background of the 
#' # first column ("col_0") over a range of values from 0 to 200 
#' # ------------------------------------------------------------------------------ 
#' bgColScales <- list(
#' col_0 = JS('function colorScale(i){
#'         var color = d3.scale.linear()
#'         .domain([0, 200])
#'         .range(["white", "blue"]);
#'         return color(i);
#'      }'));
#' # ----------------------------------------------------------------------------    
#' # simplified colour definition: first column, linear scale from white to green
#' # ----------------------------------------------------------------------------
#' bgColScales <- list(
#'  col_0 = "auto:white:green"
#' )
#' 
#' 
#' @import gtools
#' @import htmlwidgets
#' @import crosstalk
#' @export JS
#' @export
d3tf <- function(df, enableTf = TRUE, tableProps = NULL, showRowNames = FALSE, colNames = NULL, extensions = list(), selectableRows = NULL, selectableRowsClass = "info", tableStyle = "table", rowStyles = NULL, bgColScales = list(), fgColScales = list(), edit = FALSE, radioButtons = NULL, checkBoxes = NULL, cellFunctions = list(), filterInput = FALSE, initialFilters = list(), footData = NULL, footCellFunctions = list(), sparklines = list(), key = row.names(df), group = NULL, width = NULL, height = NULL) {
  
  if(is.matrix(df)) {
    df <- as.data.frame(df);
  }
  
  if(showRowNames) {
    df <- cbind(rownames(df), df);
    colnames(df)[1] <- "Rownames";  
  }
  
  if(is.null(tableProps)) {
    tableProps <- list();
  }
  
#  if(is.null(tableProps$base_path)) {
#    tableProps <- c(tableProps, base_path = 'tablefilter-2.5/');
#  }
  
#   if(!is.null(tableStyle)) {
#     tableProps <- c(tableProps, stylesheet = "tablefilter-2.5/filtergridBS.css");
#   }
  # if(!is.null(tableStyle)) {
  #   tableProps <- c(tableProps, stylesheet = "style/tablefilter.css");
  # }
  # 
  if(!is.null(height)) {
    tableProps <- c(tableProps, grid_height = paste0(height, 'px' ), fixed_headers = TRUE);
  }
  
  if(length(extensions) > 0) {
    tableProps$extensions <- extensions;
  }
  
  # turn "auto:white:red" in a linear d3 colour scale function
  autoColScale <- function(colScales) {
    if(length(colScales) == 0) {
      return(colScales);
    }
    cols <- names(colScales);
    for(i in 1:length(colScales)) {
      if(! "JS_EVAL" %in% class(colScales[[i]]) )  {
        clrs <- unlist(strsplit(colScales[[i]], ':', fixed = TRUE));
        startColour <- clrs[2];
        endColour <- clrs[3];
        scale <- JS(paste0('function colorScale(tbl, i){
                           var color = d3.scale.linear()
                           .domain(colExtent(tbl, "', cols[i] ,'"))
                           .range(["', startColour, '", "', endColour, '"])
                           .interpolate(d3.interpolateHcl);
                           return color(i);
      }'));
     colScales[cols[i]] <- list(scale);
    }
    }
    return(colScales);
    }
  
  bgColScales <- autoColScale(bgColScales);
  fgColScales <- autoColScale(fgColScales);
  
  # make edit a d3 select string
  if (is.character(edit)) {
    edit <- paste0('.',  edit, collapse = ', ');
  }
  
  # prepare mixed sort order. have already a rownames column if showRownames == TRUE
  sortKeys = NULL;
  if (!is.null(tableProps)) {
    if (!is.null(tableProps$col_types)) {
      mixedCols <- grep("mixed", tableProps$col_types, ignore.case = TRUE);
      if (length(mixedCols) > 0) {
        sortKeys <- lapply(mixedCols, function(x) {
          index <- 1:nrow(df);
          order <- gtools::mixedorder(as.character(df[ , x]));
          index[order] <- 1:length(order);
          return(index);
        });
        names(sortKeys) <- paste0('col_', mixedCols - 1);
        tableProps$col_types <- gsub('mixed', 'number', tableProps$col_types, ignore.case = TRUE);
      }
    }
  }
  
  x <- list(
    data = df,
    columns = colnames(df),
    enableTf = enableTf,
    tableProps = tableProps,
    selectableRows = selectableRows,
    selectableRowsClass = selectableRowsClass,
    tableStyle = tableStyle,
    rowStyles = rowStyles,
    bgColScales = bgColScales,
    fgColScales = fgColScales,
    cellFunctions = cellFunctions,
    footCellFunctions = footCellFunctions,
    sparklines = sparklines,
    edit = edit,
    radioButtons = radioButtons,
    checkBoxes = checkBoxes,
    showRowNames = showRowNames,
    colNames = colNames,
    filterInput = filterInput,
    initialFilters = initialFilters,
    footData = footData,
    sortKeys = sortKeys,
    key = key,
    group = group
  )
  
  # create the widget
  htmlwidgets::createWidget("D3TableFilter", x, width = width, 
                            height = height, sizingPolicy = htmlwidgets::sizingPolicy(
                              viewer.padding = 0,
                              viewer.paneHeight = 800,
                              browser.fill = TRUE
                            ))
  }

#' Shiny bindings for tableFilter
#' 
#' Output and render functions for using tableFilter within Shiny 
#' applications and interactive Rmd documents.
#' 
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{"100\%"},
#'   \code{"400px"}, \code{"auto"}) or a number, which will be coerced to a
#'   string and have \code{"px"} appended.
#' @param expr An expression that generates tableFilter object
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This 
#'   is useful if you want to save an expression in a variable.
#'   
#' @name tableFilter-shiny
#' @export
d3tfOutput <- function(outputId, width = "100%", height = "400px") {
  shinyWidgetOutput(outputId, "D3TableFilter", width, height, package = "D3TableFilter")
}
#' @rdname tableFilter-shiny
#' @export
renderD3tf <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, d3tfOutput, env, quoted = TRUE)
}

#' Give feedback in case of validaton failure.
#' 
#' For each input event in a tableFilter widget a message is sent via a shiny 
#' input. After input validation \code{rejectEdit} can be used to give visual feedback
#' to the user in case of a validation failure.
#' 
#' In edit mode the a tableFilter widget creates a shiny input element. The name
#' of this input is the name of the corresponding output element followed by 
#' "_edit". For each edit event in the html table this input receives a list 
#' giving a unique ID of the edit event ("id"), the row ("row"), the column 
#' ("col") and the new value ("val") of the cell. Row and column numbers are in 
#' R coordinates. If \code{showRowNames} is \code{TRUE}, the column number of 
#' the rownames is 0.
#' @param session Shiny session object.
#' @param tbl Name of the table beeing edited.
#' @param row Row number as received via edit input.
#' @param col Column number as received via edit input.
#' @param id Unique identifier of the edit event, received via the edit input
#' @param color Text colour of a failed edit. 
#' @param value Reset the input to this value if not null.
#' @export 
rejectEdit <- function(session, tbl, row, col, id, value = NULL, color = "red") {
  message <- list(tbl = tbl, row = row, col = col, action = "reject", id = id, value = value, color = color, feedback = FALSE);
  session$sendCustomMessage(type = "setCellValue", message);
}

#' Give feedback in case of validaton success
#' 
#' For each input event in a tableFilter widget a message is sent via a shiny 
#' input. After input validation \code{confirmEdit} can be used to give visual feedback
#' to the user.
#' 
#' In edit mode the a tableFilter widget creates a shiny input element. The name
#' of this input is the name of the corresponding output element followed by 
#' "_edit". For each edit event in the html table this input receives a list 
#' giving a unique ID of the edit event ("id"), the row ("row"), the column 
#' ("col") and the new value ("val") of the cell. Row and column numbers are in 
#' R coordinates. If \code{showRowNames} is \code{TRUE}, the column number of 
#' the rownames is 0.
#' @param session Shiny session object.
#' @param tbl Name of the table beeing edited.
#' @param row Row number as received via edit input.
#' @param col Column number as received via edit input.
#' @param id Unique identifier of the edit event, received via the edit input
#' @param color Transient text colour to indicate success
#' @param value Value to set text to after confirmation. Can be used to format input.
#' @export 
confirmEdit <- function(session, tbl, row, col, id, value = NULL, color = "green") {
  message <- list(tbl = tbl, row = row, col = col, action = "confirm", id = id, value = value, color = color, feedback = FALSE);
  session$sendCustomMessage(type = "setCellValue", message);
}

#' Set cell value
#' @param Session Shiny session object.
#' @param tbl Name of the table.
#' @param row Row number (one-based).
#' @param col Column number (one-based). If \code{showRowNames == TRUE}, the rownames column is number zero.
#' @param value Cell value to set.
#' @param feedback Send edit event back to server.
#' 
#' @examples
#' setCellValue(session, "mtcars", row = 8, col = 3, val = 8)
#' @export 
setCellValue <- function(session, tbl, row, col, value, feedback = FALSE) {
  message <- list(tbl = tbl, row = row, col = col, action = "edit", value = value, feedback = feedback, foot = FALSE);
  session$sendCustomMessage(type = "setCellValue", message);
}

#' Set foot cell value
#' @param Session Shiny session object.
#' @param tbl Name of the table.
#' @param row Footer row number (one-based).
#' @param col Footer olumn number (one-based). If \code{showRowNames == TRUE}, the rownames column is number zero.
#' @param value Cell value to set.
#' 
#' @examples
#' setFootCellValue(session, "mtcars", row = 1, col = 1, val = 8)
#' @export 
setFootCellValue <- function(session, tbl, row, col, value, feedback = FALSE) {
  message <- list(tbl = tbl, row = row, col = col, action = "edit", value = value, feedback = FALSE, foot = TRUE);
  session$sendCustomMessage(type = "setCellValue", message);
}

#' Enable editing of a tableFilter widget
#' @param Session Shiny session object.
#' @param tbl Name of the table to be edited.
#' @param cols editing of single column (\code{"col_0"}) or multiple columns (\code{c("col_0", "col_1")}).
#' 
#' @examples
#' enableEdit(session, "mtcars", c("col_1", "col_2"))
#' @export
enableEdit <- function(session, tbl, cols = NULL) {
  if (is.character(cols)) {
    cols <- paste0('.',  cols, collapse = ', ');
  }
  session$sendCustomMessage(type = "enableEdit", list(tbl = tbl, cols = cols));
}

#' Disable editing of a tableFilter widget
#' @param Session Shiny session object.
#' @param tbl Name of the table to disable editing.
#' @param cols Disable editing of single column (\code{"col_0"}) or multiple columns (\code{c("col_0", "col_1")}).
#' 
#' @examples
#' disableEdit(session, "mtcars", c("col_1", "col_2"))
#' @export 
disableEdit <- function(session, tbl, cols = NULL) {
  if (is.character(cols)) {
    cols <- paste0('.',  cols, collapse = ', ');
  }
  session$sendCustomMessage(type = "disableEdit", list(tbl = tbl, cols = cols));
}

#' Set filter on a column
#' @param Session Shiny session object.
#' @param tbl Name of the table to filter.
#' @param col Set filter on column (\code{"col_0"}).
#' @param doFilter Activate the filter after setting it.
#' 
#' @examples
#' setFilter(session, "mtcars", col = "col_1", filter = ">20")
#' @export 
setFilter <- function(session, tbl, col, filterString, doFilter = TRUE) {
  col <- sub('col_', '', col);
  message <- list(tbl = tbl, col = col, filterString = filterString, doFilter = doFilter);
  session$sendCustomMessage(type = "setFilter", message);
}

#' Clear all filters from a table
#' @param Session Shiny session object.
#' @param tbl Name of the table to clear.
#' @param doFilter Unfilter the table after clearing the filter strings.
#'  
#' @examples
#' clearFilters(session, "mtcars")
#' @export 
clearFilters <- function(session, tbl, doFilter = TRUE) {
  message <- list(tbl = tbl, doFilter = doFilter);
  session$sendCustomMessage(type = "clearFilters", message);
}

#' Highlight a row using bootstrap classes
#' @param Session Shiny session object.
#' @param tbl Name of the table.
#' @param row Number of the row to color.
#' @param class Bootstrap contextual class (\code{"active"}, \code{"info"}, \code{"success"}, \code{"warning"}, or \code{"danger"}). \code{"none"} removes the highlighting. \code{"info"} is reserved for selected rows.
#' 
#' @examples
#' setRowClass(session, "mtcars", 3, "success")
#' @export 
setRowClass <- function(session, tbl, row, class) {
  message <- list(tbl = tbl, row = row, class = class);
  session$sendCustomMessage(type = "rowClass", message);
}


#' Reset a D3tf input element
#' @param Session Shiny session object.
#' @param tbl Name of the input (output name  + "_edit").
#' 
#' @examples
#' resetInput(session, "mtcars_edit")
#' @export 
resetInput <- function(session, input) {
      session$sendCustomMessage(type = "resetD3tfValue",
                                message = input)
}

