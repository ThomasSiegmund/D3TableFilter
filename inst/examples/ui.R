library(shiny)
library(htmlwidgets)
library(tableFilter)

shinyUI(fluidPage(
  title = 'Use the TableFilter package in shiny',
  fluidRow(
    column(width = 12, tableFilterOutput('mtcars'))
  )
))