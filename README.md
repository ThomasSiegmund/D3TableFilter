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

In addition to the impressive feature set of the *TableFilter* library the tableFilter R widget provides two additional functions:

* Coloring. Similar to conditional formatting in spreadsheet applications text and cell background can be colorized based on cell values. The [D3.js](http://d3js.org/) visualization library is used to generate the colour scales. This allows for a broad range of available scales.
    + linear
    + logarithmic
    + threshold
    + categorical
    + ColourBrewer
    + ...

* In cell graphics. Can turn table values into SVG graphics using D3.js functions.

* Editing. The tableFilter widget can provide simple table editing features. Via a custom shiny input element each editing event in the table gets sent to the shiny app. After server side validation feedback can be given to the user within the widget. Logical columns can be presented as radio boxes or as checkboxes.

It should be noted though that Max provides an extension [ezEditTable](http://codecanyon.net/item/-ezedittable-enhance-html-tables/2425123) which gives more extensive editing capabilities. Since ezEditTable is not free software it is out of the scope of the tableFilter R library.

# Installation

# First steps



