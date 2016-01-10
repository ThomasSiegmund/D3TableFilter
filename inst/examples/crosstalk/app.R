library(shiny)
library(d3scatter)
library(D3TableFilter)

ui <- fluidPage(
  d3scatterOutput("scatter1", height = 400),
  d3tfOutput("tbl1", height = "auto")
)

server <- function(input, output, session) {
  
  output$scatter1 <- renderD3scatter({
    d3scatter(iris,
      ~Sepal.Length, ~Sepal.Width,
      ~toupper(Species),
      x_lim = ~grDevices::extendrange(iris$Sepal.Length),
      y_lim = ~grDevices::extendrange(iris$Sepal.Width),
      group = "A"
    )
  })
  
  output$tbl1 <- renderD3tf({
    tableProps <- list(
      btn_reset = TRUE,
      sort = TRUE,
      sort_config = list(
        sort_types = c(rep("Number", 4), "String")
      )
    )
    d3tf(iris, tableProps = tableProps, enableTf = TRUE, selectableRows = "multi", group = "A")
  })
}

shinyApp(ui, server)