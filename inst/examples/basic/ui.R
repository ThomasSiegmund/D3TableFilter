# ------------------------------------------------------
# Minimal shiny app demonstrating the tableFilter widget
# ui.R
# ------------------------------------------------------
shinyUI(fluidPage(
  title = 'Basic usage of TableFilter in Shiny',
  fluidRow(
    column(width = 12, D3TableFilterOutput('mtcars'))
  )
))
