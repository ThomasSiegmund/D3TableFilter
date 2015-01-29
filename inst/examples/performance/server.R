library(shiny);
library(htmlwidgets);
library(D3TableFilter);
library(ggplot2);

data(diamonds)

shinyServer(function(input, output, session) {
  output$diamonds <- renderD3tf({
    
    diamonds <- diamonds[1:input$rows, ];
    
    # configuration object listing many of TableFilters paramters.
    # There are more in http://tablefilter.free.fr/doc.php
    table_Props <- list(
      # appearence
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
        sort_types = c("US","String", "String", "String", rep("US", 6))
      ),
      # paging
      paging = FALSE,  
      paging_length = 30,  
      rows_counter = TRUE,  
      rows_counter_text = "Rows:",
      results_per_page = JS("['Rows per page',[30,100,1000, 10000, 100000]]"),  
      #column visibility
      showHide_cols_text = 'Hide columns:',
      showHide_enable_tick_all = TRUE,
      col_1 = "select",
      col_2 = "select",
      col_3 = "select"
    );
    if(input$coloring) {
      bgColScales <- list(
        col_7 = "auto:white:red",
        col_8 = "auto:white:green",
        col_9 = "auto:white:blue")
      } else {
        bgColScales <- list();
      }
     
    d3tf(diamonds, table_Props,
                showRowNames = FALSE,
                extensions = c('ColsVisibility', 'ColumnsResizer', 'FiltersRowVisibility'),
                tableStyle = "table table-bordered table-striped",
                bgColScales = bgColScales);
  })  
})