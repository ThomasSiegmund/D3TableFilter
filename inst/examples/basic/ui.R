library(shiny)
library(htmlwidgets)
library(tableFilter)

shinyUI(fluidPage(
  title = 'Basic usage of TableFilter in Shiny',
  fluidRow(
    column(width = 12, tableFilterOutput('mtcars'))
  )
))
