library(shiny)
library(htmlwidgets)
library(tableFilter)

shinyUI(fluidPage(
  title = 'Full featured TableFilter example',
  fluidRow(
    column(width = 12, tableFilterOutput('mtcars'))
  )
))