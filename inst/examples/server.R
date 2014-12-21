library(shiny)
library(htmlwidgets)
library(tableFilter)
library(nycflights13)
data(airports)
data(flights)
data(mtcars)

shinyServer(function(input, output, session) {
  output$mtcars <- renderTableFilter({
    
    table_Props <- list(
      # appearence
      alternate_rows = TRUE,
      btn_reset = TRUE,  
      btn_reset_text = "Clear",
      filters_row_index = 1,
      mark_active_columns = TRUE,
      # behaviour
      on_change = TRUE,  
      btn = FALSE,  
      enter_key = TRUE,  
      on_keyup = TRUE,  
      on_keyup_delay = 1500,
      remember_grid_values = TRUE,
      remember_page_number = TRUE,
      remember_page_length = TRUE,
      highlight_keywords = TRUE,  
      loader = TRUE,  
      loader_text = "Filtering data...",
      # sorting
      sort = TRUE,
      sort_config = list(
        sort_types = c("String", rep("Number", 11))
      ),
      # paging
      paging = FALSE,  
      paging_length = 20,  
      rows_counter = TRUE,  
      rows_counter_text = "Rows:",
      results_per_page = JS("['Rows per page',[20,40,60]]"),  
      #column visibility
      showHide_cols_text = 'Hide columns:',
      showHide_enable_tick_all = TRUE,
      col_6 = "select"
    );

    bgColScales <- list(
      col_1 = JS('function colorScale(i){
        var color = d3.scale.linear()
        .domain([40, 10])
        .range(["orangered", "white"]);
        return color(i);
      }'),
      col_3 = JS('function colorScale(i){
        var color = d3.scale.linear()
        .domain([500, 0])
        .range(["blue", "white"]);
        return color(i);
      }'),
      col_5 = JS('function colorScale(i){
        var color = d3.scale.linear()
        .domain([4, 2])
        .range(["green", "white"]);
        return color(i);
      }') 
    );

    fgColScales <- list(
      col_2 = JS('function colorScale(i){
        var color = d3.scale.linear()
        .domain([4, 8])
        .range(["orangered", "grey"]);
        return color(i);
      }'),
      col_4 = JS('function colorScale(i){
        var color = d3.scale.linear()
        .domain([50, 400])
        .range(["blue", "grey"]);
        return color(i);
      }'),
      col_6 = JS('function colorScale(i){
        var color = d3.scale.linear()
        .domain([0, 6])
        .range(["green", "grey"]);
        return color(i);
      }') 
    );
        
    tableFilter(mtcars, table_Props,
                showRowNames = TRUE,
                extensions = c('ColsVisibility', 'ColumnsResizer', 'FiltersRowVisibility'),
                rowNamesColumn = "Model", bgColScales = bgColScales,  fgColScales = fgColScales);
    
  })
})