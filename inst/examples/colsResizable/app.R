# --------------------------------------------------------
# Shiny app demonstrating column resizing in the D3TableFilter widget

library(shiny)
library(htmlwidgets)
library(D3TableFilter)
data(mtcars)

    # Define table properties. 
    tableProps <- list(
      btn_reset = TRUE,
      on_keyup = TRUE,  
      on_keyup_delay = 800,
      rows_counter = TRUE,  
      rows_counter_text = "Rows: ",
      # alphabetic sorting for the row names column, numeric for all other columns
      col_types = c("string", "number", "number", "number", "none", "none")
      );

    extensions <-  list(
        list(name = "sort"),
        list( name = "colsVisibility",
              text = 'Hide columns: ',
              enable_tick_all =  TRUE
             ),
        list( name = "filtersVisibility",
              visible_at_start =  TRUE)
      );


# ui.R
# --------------------------------------------------------
ui <- fluidPage(
  titlePanel('Resizable Columns in D3TableFilter'),
  sidebarLayout(
    sidebarPanel(
       wellPanel(HTML("This app allows to explore config options for the jQuery
                 <code>colResizable</code> plugin for resizable columns.
                 For more documentation please see <a href=http://www.bacubacu.com/colresizable/#attributes >Customization</a>.")),
       checkboxInput("enableResize", label = "enableResize", value = TRUE),
       radioButtons("resizeMode", "resizeMode",
                      choices = c('fit', 'flex', 'overflow'),
                      selected = "overflow"),
       checkboxInput("liveDrag", label = "liveDrag", value = TRUE),
       checkboxGroupInput("disabledColumns", "disabledColumns", choices = 1:12),
       checkboxInput("postbackSafe", "postbackSafe", value = TRUE),
       checkboxInput("partialRefresh", "partialRefresh", value = TRUE),
       checkboxInput("removePadding", "removePadding", value = FALSE),
       selectizeInput("gripInnerHtml", "gripInnerHtml",
                      choices = c("<div class='rangeGrip'></div>",
                                   "<div class='grip'></div>", ""), selected = ""),
       selectizeInput("draggingClass", "draggingClass",
                      choices = c("rangeDrag",
                                   "dragging", ""), selected = ""),
       checkboxInput("headerOnly", "headerOnly", value = FALSE ),
       numericInput("minWidth", "minWidth", min = 10, value = 15)
    ),
    mainPanel(
      br(),
      d3tfOutput('table1')
    )
))

# server.R
# --------------------------------------------------------
server <- shinyServer(function(input, output, session) {
  output$table1 <- renderD3tf({
    
    colsResizableOpts <- list(resizeMode = input$resizeMode,
                              liveDrag = input$liveDrag,
                              disabledColumns = as.list(as.numeric(input$disabledColumns) - 1),
                              postbackSafe = input$postbackSafe,
                              partialRefresh = input$partialRefresh,
                              removePadding = input$removePadding,
                              gripInnerHtml = input$gripInnerHtml,
                              draggingClass = input$draggingClass,
                              headerOnly = input$headerOnly,
                              minWidth = input$minWidth
                              )
    
    d3tf(mtcars,
         tableProps = tableProps,
         extensions = extensions,
         showRowNames = TRUE,
         tableStyle = "table table-bordered",
         colsResizable = input$enableResize,
         colsResizableOptions = colsResizableOpts)

  })

})

runApp(list(ui = ui, server = server))

