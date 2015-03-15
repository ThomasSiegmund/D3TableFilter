# D3TableFilter - Interaction

[D3TableFilter](https://github.com/ThomasSiegmund/D3TableFilter) provides a highly interactive widget. In the Shiny enviroment it can provide no only a table output, but also several input elements:

* Filters: Filter strings as entered by the user and filtered rows.

* Selected rows: there is a special mode to select single or multipe rows by mouse click.

* Edits: Tables can be editable, either by text input or by checkboxes or radio buttons. The edit input reports each edit event (row, column, and value) to the server. As developer of a shiny app you can validate the input in R and send feedback to the user (try to enter a non numeric value in the "Miles per gallon" column!).

At run time cell values and filters can be (re)-set without re-sending the complete table.

As D3TableFilter is based on [D3.js](http://d3js.org/) it allows you to style the table using D3 functions. This includes in this example the text formatting and styling of the table footer. You can also colorize cells based on their values (see also the [colors demo app](https://thomassiegmund.shinyapps.io/colour/)). If you want even more eye candy you can turn table data into inline graphics as demonstrated with the orange circles and the blue bars. Both the circles and the bars do not interfere with sorting and filtering. The "Miles per gallon" and the "Displacement" colomns are editible. Please try it out and watch smooth, D3.js generated transitions of the visualizations.

Please check also the other D3TableFilter demo apps:

* [Basic features](https://thomassiegmund.shinyapps.io/basic/)
* [Advance TableFilter features](https://thomassiegmund.shinyapps.io/features/)
* [Colorful tables](https://thomassiegmund.shinyapps.io/colour/)
* [Mixed sorting](https://thomassiegmund.shinyapps.io/mixedsort/)

Learn more about the D3TableFilter widget on [github](https://github.com/ThomasSiegmund/D3TableFilter). 