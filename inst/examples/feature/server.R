library(shiny)
library(htmlwidgets)
library(tableFilter)

data(mtcars)

shinyServer(function(input, output, session) {
  output$mtcars <- renderTableFilter({
    
    # configuration object listing many of TableFilters paramters.
    # There are more in http://tablefilter.free.fr/doc.php
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
      paging = TRUE,  
      paging_length = 20,  
      rows_counter = TRUE,  
      rows_counter_text = "Rows:",
      results_per_page = JS("['Rows per page',[20,40,60]]"),  
      #column visibility
      showHide_cols_text = 'Hide columns:',
      showHide_enable_tick_all = TRUE,
      col_8 = "checklist",
      col_9 = "checklist",
      col_10 = "multiple",
      col_11 = "multiple"
    );

    tableFilter(mtcars, table_Props,
                showRowNames = TRUE,
                extensions = c('ColsVisibility', 'ColumnsResizer', 'FiltersRowVisibility'),
                rowNamesColumn = "Model");
  })
})