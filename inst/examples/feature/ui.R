library(shiny)
library(htmlwidgets)
library(D3TableFilter)

shinyUI(fluidPage(
  title = 'Full featured TableFilter example',
  fluidRow(
    column(width = 12, D3TableFilterOutput('mtcars'))
  )
))