# ------------------------------------------------------
# Minimal shiny app demonstrating the tableFilter widget
# server.R
# ------------------------------------------------------
library(shiny)
library(htmlwidgets)
library(D3TableFilter)

data(mtcars);

shinyServer(function(input, output, session) {
  output$mtcars <- renderD3tf({
    
    # Define table properties. See http://tablefilter.free.fr/doc.php
    # for a complete reference
    tableProps <- list(
      alternate_rows = TRUE,
      btn_reset = TRUE,
      sort = TRUE,
      sort_config = list(
        # alphabetic sorting for the row names column, numeric for all other columns
        sort_types = c("String", rep("Number", ncol(mtcars)))
      )
    );
    
    d3tf(mtcars, tableProps, showRowNames = TRUE);
  })
})
