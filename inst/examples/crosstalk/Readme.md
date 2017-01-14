# D3TableFilter - Crosstalk demo

This is a minimal [Shiny](http://shiny.rstudio.com/) app demonstrating the crosstalk function of the D3TableFilter widget. [crosstalk](https://github.com/rstudio/crosstalk/) is an experimental library to allow communication between [htmlwidgets](https://github.com/ramnathv/htmlwidgets). To showcase this, the app links a dot plot (based on the [d3scatter](https://github.com/jcheng5/d3scatter/)) and two table widgets. 

Selecting dots in the plot via brushing hightlights the corresponding rows in the table. Rows selected in the table via (Ctrl-) click highlight the corresponding data points in the plot.

Filtering rows in one of the tables using the filter bar removes the corresponding dots from the graph and the corresponding rows from the second table.

Please check also the other D3TableFilter demo apps:

* [Basic features](https://thomassiegmund.shinyapps.io/basic/)
* [Advance TableFilter features](https://thomassiegmund.shinyapps.io/features/)
* [Interactive features](https://thomassiegmund.shinyapps.io/interaction/)
* [Mixed sorting](https://thomassiegmund.shinyapps.io/mixedsort/)
* [Performance](https://thomassiegmund.shinyapps.io/performance/)

You can find more information about the D3TableFilter widget on [github](https://github.com/ThomasSiegmund/D3TableFilter).