library(shiny)
library(htmlwidgets)
library(D3TableFilter)

shinyUI(fluidPage(
  title = 'Test tableFilter performance',
  fluidRow(
    column(width = 2,
           selectInput("rows", "Rows", choices = c(100, 500, 1000, 5000, 10000, 30000, 53940), selected = 500, multiple = FALSE),
           radioButtons("coloring", "Coloring", choices = c("Yes" = TRUE, "No" = FALSE), selected = FALSE)),
    column(width = 10, d3tfOutput('diamonds'))
  )
))