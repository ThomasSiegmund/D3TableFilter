#' tableFilter Generate a HTML table widget with advanced filtering, sorting and colouring.
#'
#' R interface to Max Guglielmi's \href{http://tablefilter.free.fr/ }{HTML Table
#' Filter Generator} JavaScript library. Provides advanced filtering and
#' sorting. Columns can be coloured based on displayed values using D3 colour
#' scales.
#' 
#' @section Configuration: The tableFilter widget can be highly customized. See 
#'   the website of the JavaScript library
#'   \href{http://tablefilter.free.fr/}{HTML Table Filter Generator}
#'   for details. Configuration is passed as a
#'   list of key value pairs to the JavaScript engine. A shiny app demonstrating
#'   many useful features in one table can be found in the inst/examples/feature
#'   directory of this package.
#'
#' @section Extensions: Some of the TableFilter functions are beeing provided as
#'   extensions, in particular \itemize{ \item ColsVisibility: Visibility of
#'   columns can be adjusted by configuration or interactively \item
#'   ColumnsResizer: Interactive resizing of columnd width \item
#'   FiltersRowVisibility: Interactively show or hide the filter row. }
#' To activate these extensions simply define them as a character vector in the 
#' extensions parameter, e.g. \code{extensions = c("ColsVisibility", 
#' "ColumnsResizer", "FiltersRowVisibility")}. This takes care of enabling and 
#' basic configuration of the extensions. For further customization use the
#' tableProps object.
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
#'   interpolation is used. An example shiny app showing various colour scales
#'   can be found in the inst/examples/colour/ directory of this package.
#'      
#' @param df Data frame or matrix to be displayed as html table
#' @param tableProps A list object describing appearence and function of the table
#' @param showRowNames Add the R row names as first column to the table
#' @param rowNamesColumn column title for the row names column
#' @param extensions Vector of table filter exentsions to load
#' @param bgColScales List of background colour scales to apply to the columns
#' @param fgColScales List of text colour scales to apply to the columns
#' @param interaction Mode of interaction, "edit" or "none"
#' @param filterInput Generate an input element named outputid + "_filter" listing
#' filter settings and valid rows
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
#' @import htmlwidgets
#' @export JS
#' @export
tableFilter <- function(df, tableProps, showRowNames = FALSE, rowNamesColumn = "Rownames", extensions = c(), bgColScales = list(), fgColScales = list(), interaction = "none", filterInput = FALSE) {
  
  if(is.matrix(df)) {
    df <- as.data.frame(df);
  }
  
  if(showRowNames) {
    df <- cbind(rownames(df), df);
    colnames(df)[1] <- rowNamesColumn;  
  }

if(is.null(tableProps$base_path)) {
  tableProps <- c(tableProps, base_path = 'tablefilter-2.5/');
}

if(length(extensions) > 0) {
  ext <- list(name = list(), src = list(), description = list(), initialize = list());
  if("ColsVisibility" %in% extensions) {
      ext$name[length(ext$name) + 1] = 'ColsVisibility';
      ext$src[length(ext$src) + 1] = 'tablefilter-2.5/TFExt_ColsVisibility/TFExt_ColsVisibility.js';
      ext$description[length(ext$description) + 1] = 'Columns visibility manager';
      ext$initialize[length(ext$initialize) + 1] = list(JS('function(o){o.SetColsVisibility();}'));
  } 
  if("ColumnsResizer" %in% extensions) {
    ext$name[length(ext$name) + 1] = 'ColumnsResizer';
    ext$src[length(ext$src) + 1] = 'tablefilter-2.5/TFExt_ColsResizer/TFExt_ColsResizer.js';
    ext$description[length(ext$description) + 1] = 'Columns Resizing';
    ext$initialize[length(ext$initialize) + 1] = list(JS('function(o){o.SetColsResizer();}'));
  } 
  if("FiltersRowVisibility" %in% extensions) {
    ext$name[length(ext$name) + 1] = 'FiltersRowVisibility';
    ext$src[length(ext$src) + 1] = 'tablefilter-2.5/TFExt_FiltersRowVisibility/TFExt_FiltersRowVisibility.js';
    ext$description[length(ext$description) + 1] = 'Expand/Collapse filters row';
    ext$initialize[length(ext$initialize) + 1] = list(JS('function(o){o.SetFiltersRowVisibility();}'));
  } 
  tableProps$extensions <- ext;
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

#.interpolate(d3.interpolateHcl)

bgColScales <- autoColScale(bgColScales);
fgColScales <- autoColScale(fgColScales);

# need to update colour after table sorting
tableProps <- c(tableProps, on_after_sort = list(JS('function(o) {colourCells()}')));

# if(filterInput) {
#   tableProps <- c(tableProps, on_after_filter = list(JS('function(o) {updateFilterInput()}')));
# }

x <- list(
    data = df,
    tableProps = tableProps,
    bgColScales = bgColScales,
    fgColScales = fgColScales,
    interaction = interaction,
    showRowNames = showRowNames,
    filterInput = filterInput
)

  # create the widget
  htmlwidgets::createWidget("tableFilter", x)
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
tableFilterOutput <- function(outputId, width = "100%", height = "400px") {
  shinyWidgetOutput(outputId, "tableFilter", width, height, package = "tableFilter")
}
#' @rdname tableFilter-shiny
#' @export
renderTableFilter <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, tableFilterOutput, env, quoted = TRUE)
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
#' @param Session Shiny session object.
#' @param tbl Name of the table beeing edited.
#' @param id Unique identifier of the edit event, received via the edit input
#' @param colour Text colour of a failed edit. 
#' @param value Reset the input to this value if not null.
#' @export 
rejectEdit <- function(session, tbl, id, value = NULL, color = "red") {
        session$sendCustomMessage(type = "rejectEdit", list(tbl = tbl, id = id, value = value, color = color));
}

#' Give feedback in case of validaton failure.
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
#' @param Session Shiny session object.
#' @param tbl Name of the table beeing edited.
#' @param id Unique identifier of the edit event, received via the edit input
#' @param colour Transient text colour to indicate success
#' @param value Value to set text to after confirmation. Can be used to format input.
#' @export 
confirmEdit <- function(session, tbl, id, value = NULL, color = "green") {
  session$sendCustomMessage(type = "confirmEdit", list(tbl = tbl, id = id, value = value, color = color));
}
