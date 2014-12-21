# ------------------------------------------------------
# Minimal shiny app demonstrating the tableFilter widget
# ------------------------------------------------------
library(shiny)
library(htmlwidgets)
library(tableFilter)

data(mtcars);

shinyServer(function(input, output, session) {
  output$mtcars <- renderTableFilter({
    
    # define table properties. See http://tablefilter.free.fr/doc.php
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
    tableFilter(mtcars, tableProps, showRowNames = TRUE, rowNamesColumn = "Model");
  })
})
