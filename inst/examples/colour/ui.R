library(shiny)
library(htmlwidgets)
library(tableFilter)

shinyUI(fluidPage(
  title = 'Colourful tables',
  fluidRow(
    column(width = 12, tableFilterOutput('colours'))
  )
))