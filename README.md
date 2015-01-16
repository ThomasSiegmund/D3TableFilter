---
title: "README.md"
output:
  html_document:
    keep_md: yes
---

# Overview

[HTML Table Filter Generator](http://tablefilter.free.fr/) (*TableFilter*) by Max Guglielmi is a JavaScript library to enhance HTML tables. It it provides a number of useful features:

* Advanced filtering
    + numeric (```> 0```)
    + logical (```black || white```)
    + regular expressions
* Sorting
* Pagination
* Column resizing
* Column visibility

The R package *tableFilter* provided here packages the TableFilter JavaScript library as an easy to use widget for [Shiny](http://www.rstudio.com/products/shiny/). It can be used in [RStudio](http://www.rstudio.com/products/RStudio/) and in Shiny applications. The package is based on the [htmlwidgets](https://github.com/ramnathv/htmlwidgets) library which allows to integrate JavaScript libraries into R and Shiny. Filters can be set within the widget but also via R functions. Filter settings and filter results can be retrieved from the widget for use on the server.

In addition to the impressive feature set of the *TableFilter* library the tableFilter R widget provides some additional functions:

* Coloring. Similar to conditional formatting in spreadsheet applications text and cell background can be colorized based on cell values. The [D3.js](http://d3js.org/) visualization library is used to generate the colour scales. This allows for a broad range of available scales.
    + linear
    + logarithmic
    + threshold
    + categorical
    + ColourBrewer
    + ...

* In cell graphics. Can turn cell values into SVG graphics using D3.js functions.

* Row selection. Single cell selection (radiobutton like) or multiple row selection using the ctrl key is possible. Selection can also be set or reset by the server.

* Editing. The tableFilter widget can provide simple table editing features. Via a custom shiny input element each editing event in the table gets sent to the shiny app. After server side validation feedback can be given to the user within the widget. Logical columns can be presented as radio boxes or as checkbox input elements.

It should be noted though that Max provides an extension [ezEditTable](http://codecanyon.net/item/-ezedittable-enhance-html-tables/2425123) which gives more extensive editing capabilities. Since ezEditTable is not free software it is out of the scope of the tableFilter R library.

# Installation

# First steps
Generating a table with filtering and sorting options in a Shiny app using the tableFilter library is very simple. First your have to declare a tableFilterOutput in your user interface definition. 

# ------------------------------------------------------
# Minimal shiny app demonstrating the tableFilter widget
# ui.R
# ------------------------------------------------------
shinyUI(fluidPage(
  title = 'Basic usage of TableFilter in Shiny',
  fluidRow(
    column(width = 12, tableFilterOutput('mtcars'))
  )
))

In server.R you load the shiny, htmlwidgets and tableFilter libraries and you define the corresponding output function. The tableFilter function needs two arguments: df, the data.frame or matrix which will be transformed into a html table.

tableProps is a list of options to define the look and feel of the table. In the example below, a very simple table is generated. It shows white/grey stripes, it has a reset button, and it can be sorted. Sorting is alphabetical for the row names and numeric for all other rows. 

# ------------------------------------------------------
# Minimal shiny app demonstrating the tableFilter widget
# server.R
# ------------------------------------------------------
library(shiny)
library(htmlwidgets)
library(tableFilter)

data(mtcars);

shinyServer(function(input, output, session) {
  output$mtcars <- renderTableFilter({
    
    # Define table properties. See http://tablefilter.free.fr/doc.php
    # for a complete reference
    tableProps <- list(
      alternate_rows = TRUE,
      btn_reset = TRUE,
      sort = TRUE,
      sort_config = list(
        # alphabetic sorting for the row names column, numeric for all other columns
        sort_types = c("String", rep("Number", ncol(mtcars)))
      )
    );
    
    tableFilter(mtcars, tableProps, showRowNames = TRUE, rowNamesColumn = "Model");
  })
})

Two optional parameters for tableFilter, "showRowNames" and "rowNamesColumn" enable the display of the row names as first Column ("Model").

Running this app generates a window filling table which can be filtered for strings, numbers, numeric expressions and regular expressions. There is a reset button for the filters in the upper rigth corner, and small help popup behind the question mark also in the upper right. The table can be sorted by mouseclick on the column headers. 

# Customizing the table
The Table Filter JavaScript library provides a huge number of configuration options which define the appearance and behaviour of the table. It can for example do client side paging. It can provied a control to hide selected columns. It can provide checkbox and lists controls for filtering. And many more. A complete discussion of the features of Table Filter is beyond the scope of this document. Please see [HTML Table Filter Generator](http://tablefilter.free.fr/) for examples and documentation. In the examples directory of this package is a Shiny app demonstrating quite a few TableFilter features in a single table.

Some of the TableFilter functions are beeing provided as separate modules, in particular

    + ColsVisibility: Visibility of columns can be adjusted by configuration or interactively
    + ColumnsResizer: Interactive resizing of column width
    + FiltersRowVisibility: Interactively show or hide the filter row.

To activate these extensions simply define them as a character vector in the extensions parameter, e.g. extensions = c("ColsVisibility", "ColumnsResizer", "FiltersRowVisibility"). This takes care of enabling and basic configuration of the extensions. For further customization use the tableProps parameter.


