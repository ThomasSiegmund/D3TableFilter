library(shiny)
library(htmlwidgets)
library(D3TableFilter)

shinyUI(fluidPage(
  title = 'Colourful tables',
  fluidRow(
    column(width = 12, d3tfOutput('colours'))
  )
))