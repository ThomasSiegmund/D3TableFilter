library(shiny)
library(htmlwidgets)
library(D3TableFilter)

data(mtcars)

shinyServer(function(input, output, session) {
  output$mtcars <- renderD3tf({
    
    # configuration object listing many of TableFilters paramters.
    # There are more in http://tablefilter.free.fr/doc.php
    tableProps <- list(
      # appearence
      btn_reset = TRUE,  
      btn_reset_text = "Clear",
      filters_row_index = 1,
      mark_active_columns = TRUE,
      rows_counter = TRUE,  
      rows_counter_text = "Rows: ",
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
      col_types = c("String", rep("Number", 11)),
      # paging
      paging = TRUE, 
      paging_length = 30,  
      results_per_page = JS("['Rows per page',[30, 60]]"),  
      #column visibility
      showHide_cols_text = 'Hide columns:',
      showHide_enable_tick_all = TRUE,
      # filters
      refresh_filters = FALSE,  # refresh filters is incompatible with col_operations, at least here
      col_8 = "multiple", # checklist doesn't work for me
      col_9 = "multiple",
      col_10 = "multiple",
      col_11 = "multiple",
      # adding a summary row, showing the column means
      rows_always_visible = list(nrow(mtcars) + 2, nrow(mtcars) + 3)
    );
    
    extensions <-  list(
        list(name = "sort"),
        list(name = "colOps",
             id = list("frow_0_fcol_1_tbl_mtcars",
                  "frow_0_fcol_2_tbl_mtcars",
                  "frow_0_fcol_3_tbl_mtcars",
                  "frow_0_fcol_4_tbl_mtcars",
                  "frow_0_fcol_5_tbl_mtcars",
                  "frow_0_fcol_6_tbl_mtcars",
                  "frow_0_fcol_7_tbl_mtcars",
                  "frow_0_fcol_8_tbl_mtcars",
                  "frow_0_fcol_9_tbl_mtcars",
                  "frow_0_fcol_10_tbl_mtcars",
                  "frow_0_fcol_11_tbl_mtcars",
                  "frow_1_fcol_1_tbl_mtcars",
                  "frow_1_fcol_2_tbl_mtcars",
                  "frow_1_fcol_3_tbl_mtcars",
                  "frow_1_fcol_4_tbl_mtcars",
                  "frow_1_fcol_5_tbl_mtcars",
                  "frow_1_fcol_6_tbl_mtcars",
                  "frow_1_fcol_7_tbl_mtcars",
                  "frow_1_fcol_8_tbl_mtcars",
                  "frow_1_fcol_9_tbl_mtcars",
                  "frow_1_fcol_10_tbl_mtcars",
                  "frow_1_fcol_11_tbl_mtcars"
                ),    
              col = as.list(c(1:11, 1:11)),
              operation = as.list(c(rep("mean",11), rep("median", 11))),
              write_method = as.list(rep("innerhtml", 22)),
              exclude_row = list(nrow(mtcars) + 2, nrow(mtcars) + 3),  
              decimal_precision = as.list(rep(1, 22)),
              tot_row_index = list(nrow(mtcars) + 2, nrow(mtcars) + 3)
             ),
        list( name = "colsVisibility",
              at_start =  c(8, 9, 10, 11),
              text = 'Hide columns: ',
              enable_tick_all =  TRUE
             ),
        list( name = "filtersVisibility",
              visible_at_start =  TRUE)
      );
    
    # add a summary row. Can be used to set values statically, but also to 
    # make use of TableFilters "col_operation"
    footData <- data.frame(Rownames = c("Mean", "Median"), mpg = 0, cyl = 0, disp = 0, hp = 0,  drat = 0, wt = 0, qsec = 0, vs = 0, am = 0, gear = 0, carb = 0);
    
    d3tf(mtcars, tableProps = tableProps,
                showRowNames = TRUE,
                tableStyle = "table table-bordered",
                extensions = extensions,
                footData = footData);
  })
})