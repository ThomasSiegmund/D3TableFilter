library(shiny)
library(htmlwidgets)
library(tableFilter)

shinyUI(fluidPage(
  title = 'Interactive features',
  fluidRow(
    column(width = 2,
           wellPanel(
            radioButtons("editing", "Mtcars table editing", choices = c("Enable" = TRUE, "Disable" = FALSE), selected = TRUE),
            radioButtons("editingCol0", "Rownames editing", choices = c("Enable" = TRUE, "Disable" = FALSE), selected = TRUE)
           )
    ),
    column(width = 5, 
           h4("mtcars"),
           tableFilterOutput('mtcars')),
   column(width = 5,
          h4("Last edits"),
          tableOutput("edits"),
          h4("Filters"),
          tableOutput("filters"),
          h4("Filter results"),
          tableOutput("filtering"),
          h4("mtcars after filtering and editing"),
          tableOutput("filteredMtcars")
         ,
         h4("test second table"), 
         tableFilterOutput('iris')
  )
)))
