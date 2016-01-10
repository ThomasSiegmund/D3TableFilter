library(shiny)
library(d3scatter)
library(D3TableFilter)

ui <- fluidPage(
  d3scatterOutput("scatter1", height = 400),
  d3tfOutput("tbl1", height = "auto")
)

server <- function(input, output, session) {
  
  jitter_by <- 0.1
  # jittered <- reactive({
  #   on.exit(invalidateLater(1000))
  #   iris$Sepal.Length <- jitter(iris$Sepal.Length, amount = jitter_by)
  #   iris$Sepal.Width <- jitter(iris$Sepal.Width, amount = jitter_by)
  #   iris$Petal.Length <- jitter(iris$Petal.Length, amount = jitter_by)
  #   iris$Petal.Width <- jitter(iris$Petal.Width, amount = jitter_by)
  #   iris
  # })
  
  output$scatter1 <- renderD3scatter({
    d3scatter(iris,
      ~Sepal.Length, ~Sepal.Width,
      ~toupper(Species),
      x_lim = ~grDevices::extendrange(iris$Sepal.Length, f = jitter_by),
      y_lim = ~grDevices::extendrange(iris$Sepal.Width, f = jitter_by),
      group = "A"
    )
  })
  output$tbl1 <- renderD3tf({
    d3tf(iris, enableTf = FALSE, selectableRows = "multi", group = "A")
  })
}

shinyApp(ui, server)