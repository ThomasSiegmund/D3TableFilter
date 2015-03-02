# --------------------------------------------------------
# Minimal shiny app demonstrating the D3TableFilter widget
# ui.R
# --------------------------------------------------------
shinyUI(fluidPage(
  title = 'Basic usage of D3TableFilter in Shiny',
  fluidRow(
    column(width = 12, d3tfOutput('mtcars'))
  )
))
