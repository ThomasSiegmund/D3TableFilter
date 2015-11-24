
# --------------------------------------------------------
# Shiny app demonstrating the "sparkline" function of the D3TableFilter widget
library(shiny)
library(htmlwidgets)
library(D3TableFilter)

# ui.R
# --------------------------------------------------------
shinyUI(fluidPage(
  title = 'Usage of Sparkline.js in D3TableFilter',
  fluidRow(
    column(width = 12, d3tfOutput('sparks1', height = "auto"))
  )
))

