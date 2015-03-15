# D3TableFilter - Features

This is a Shiny app demonstrating the most basic features of the D3TableFilter library. It displays an R data frame as formatted html table using the [HTML Table Filter Generator](http://tablefilter.free.fr/)  (*TableFilter*) JavaScript library. TableFilter sorts the table on click on the column headers and can filter the data. See the question mark in the top row for help on filtering. 

In addition to the [basic example](https://thomassiegmund.shinyapps.io/basic/) this version has a row counter and  highlights filtered columns. It allows to resize columns and to hide columns. A cookie based mechanism restores filter settings after a page reload. There is also a table footer providing basic statistics on the diplayed rows.

You can find more information about the D3TableFilter widget on [github](https://github.com/ThomasSiegmund/D3TableFilter). For the full range of customizaton options and functions please visit the [documentation of TableFilter](http://tablefilter.free.fr/doc.php).
