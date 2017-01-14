# This is a minimal app demonstrating the crosstalk  function of the D3TableFilter
# widget.
# Needs crosstalk (https://github.com/rstudio/crosstalk/)
# and d3scatter (https://github.com/jcheng5/d3scatter/)

library(shiny)
library(htmltools)
library(crosstalk)
library(d3scatter)
library(htmlwidgets)
library(D3TableFilter)
library(dplyr)

ui <- fluidPage(
  d3scatterOutput("scatter1", height = 400),
  d3tfOutput("tbl1", height = "auto"),
  d3tfOutput("tbl2", height = "auto")
)

server <- function(input, output, session) {
  
  sd <- crosstalk::SharedData$new(iris %>% tibble::rownames_to_column())
  
  output$scatter1 <- renderD3scatter({
    d3scatter(sd,
      ~Sepal.Length, ~Sepal.Width,
      ~toupper(Species),
      x_lim = ~grDevices::extendrange(iris$Sepal.Length),
      y_lim = ~grDevices::extendrange(iris$Sepal.Width)
    )
  })
  
  output$tbl1 <- renderD3tf({
    tableProps <- list(
      btn_reset = TRUE,
      col_types = c(rep("number", 4), "string")
    )

    extensions <-  list(
        list(name = "sort")
    );

    d3tf(sd,
         enableTf = TRUE,
         tableProps = tableProps,
         extensions = extensions,
         selectableRows = "multi")
  })
  output$tbl2 <- renderD3tf({
    tableProps <- list(
      btn_reset = TRUE,
      col_types = c(rep("number", 4), "string")
    )

    extensions <-  list(
        list(name = "sort")
    );

    d3tf(sd,
         enableTf = TRUE,
         tableProps = tableProps,
         extensions = extensions,
         selectableRows = "multi")
  })
  
  
  
}

shinyApp(ui, server)

