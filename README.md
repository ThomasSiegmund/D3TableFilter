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

The R package *tableFilter* provided here packages the TableFilter library as an easy to use widget for [Shiny](http://www.rstudio.com/products/shiny/). It can be used in [RStudio](http://www.rstudio.com/products/RStudio/) and in Shiny applications. The package is based on the [htmlwidgets](https://github.com/ramnathv/htmlwidgets) library which allows to integrate JavaScript libraries into R and Shiny.

In addition to the impressive feature set of the *TableFilter* library the tableFilter R widget provides two additional not unimportant features:

* Colouring. Similar to conditional formatting in spreadsheet applications text and cell background can be colorized based on cell values. The [D3.js](http://d3js.org/) visualization library is used to generate the colour scales. This allows for a broad range of available scales
    + linear
    + logarithmic
    
* Editing. The tableFilter widget can provide simple table editing features using a custom shiny input element. After validation in the shiny app feedback can be given to the user. It should be noted though that Max provides an extension [ezEditTable](http://codecanyon.net/item/-ezedittable-enhance-html-tables/2425123) which gives more extensive editing capabilities. Since ezEditTable is not free software it is out of the scope of the tableFilter R library.
