library(shiny)
library(htmlwidgets)
library(tableFilter)

shinyUI(fluidPage(
  title = 'Interactive features',
         tabsetPanel(
           tabPanel("Editing and filtering",
            fluidRow(
              column(width = 2,
                     h4("Functions"),
                     wellPanel(
                       radioButtons("editingCol0", "Rownames editing", choices = c("Enable" = TRUE, "Disable" = FALSE), selected = FALSE)
                     ),
                     wellPanel(
                       actionButton("clearfilter", "Clear filters")
                     ),
                     wellPanel(
                       textInput("filterString", "Filter rownames", value = "rgx:^D"),
                       actionButton("dofilter", "Set filter")
                     ),
                     wellPanel(
                       selectInput("cellVal", label = "Merc 240D cylinders", choice = c(4, 6, 8, 10, 12), selected = 4, multiple = FALSE),
                       selectInput("cellVal2", label = "Merc 240D disp", choice = c(100, 200, 300, 400, 400), selected = 4, multiple = FALSE)
                      ),
                     wellPanel(
                       uiOutput("candidateUi"),
                       actionButton("favorite", label = "Make Datsun favorite")
                     )
              ),
  column(width = 5, 
           h4("mtcars"),
           tableFilterOutput('mtcars', height = "2000px")
           ),
   column(width = 5,
          h4("Last edits"),
          tableOutput("edits"),
          h4("Filters"),
          tableOutput("filters"),
          h4("Filter results"),
          tableOutput("filtering"),
          h4("mtcars after filtering and editing"),
          tableOutput("filteredMtcars")
        ) # column
      ) # fluidRow 
    ), # tabPanel
    tabPanel("Row selection",
      fluidRow(column(width = 12, h4("Row selection"))),
      fluidRow(
        column(width = 2,
               
               HTML("Click on the table to select a row. <code>Ctrl</code>  click for multiple selection."),
               wellPanel(
                 helpText("This demonstrates the setRowClass to highlight a specific row using contextual classes from bootstrap. Can also be used to unselect a row"),
                 selectInput("hornetClass", "Set row class on 'Hornet Sportabout'", choices = c("none", "active", "success", "info", 'warning', "danger"), selected = "none")
               )
        ),
        column(width = 5,
               tableFilterOutput('mtcars2', height = "2000px")
        ),
        column(width = 5,
               tableOutput("mtcars2Output")
        )

    )
  ) # tabset panel
)))

