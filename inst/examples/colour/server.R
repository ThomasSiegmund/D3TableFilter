library(shiny)
library(htmlwidgets)
library(D3TableFilter)

shinyServer(function(input, output, session) {
  output$colours <- renderD3tf({
    
    tbl <- data.frame(AutoScale = round(seq(1, 200, length.out = 30), 1));
    tbl$LinearNumeric <- tbl$AutoScale;
    tbl$LinearNumericHCL <- tbl$LinearNumeric;
    tbl$LogScale <- rep(c(1, 2, 3, 10, 20, 30, 100, 200, 300, 1000, 2000, 3000, 10000, 20000, 30000), 2);
    tbl$Divergent <- round(seq(0, 14, length.out = 30), 1);
    tbl$OrdinalScale <- sample(LETTERS[1:10], nrow(tbl), replace = TRUE);
    tbl$ColorBrewer.Set3 <- sample(LETTERS[1:9], nrow(tbl), replace = TRUE);
    
    table_Props <- list(
      # appearence
      btn_reset = TRUE,  
      btn_reset_text = "Clear",
      # behaviour
      on_change = TRUE,  
      btn = FALSE,  
      enter_key = TRUE,  
      on_keyup = TRUE,  
      on_keyup_delay = 1500,
      highlight_keywords = TRUE,  
      loader = TRUE,  
      loader_text = "Filtering data...",
      # sorting
      sort = TRUE,
      sort_config = list(
        sort_types = c("US", "US", "US","US", "US", "String")
      ),
      # paging
      paging = FALSE
      );
    
    # columns are addressed in TableFilter as col_0, col_1, ..., coln
    bgColScales <- list(
      col_0 = "auto:white:green",
      col_1 = JS('function colorScale(tbl, i){
        var color = d3.scale.linear()
        .domain([0, 200])
        .range(["white", "blue"]);
        return color(i);
      }'),
      col_2 = JS('function colorScale(tbl, i){
        var color = d3.scale.linear()
        .domain([0, 200])
        .range(["white", "blue"])
        .interpolate(d3.interpolateHcl);
        return color(i);
      }'),
      # don't include 0 in the range of a log scale
      col_3 = JS('function colorScale(tbl, i){
        var color = d3.scale.log()
        .domain([1, 35000])
        .range(["white", "orangered"]);
        return color(i);
      }'),
      col_4 = JS('function colorScale(tbl, i){
        var color = d3.scale.linear()
        .domain([0, 7, 14])
        .range(["#f8766d", "white", "#00bfc4"]);
        return color(i);
      }'),
      col_5 = JS('function colorScale(tbl, i){
        var color = d3.scale.category10()
        .domain(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]);
        return color(i);
      }'),
      col_6 = JS('function colorScale(tbl, i){
        var color = d3.scale.ordinal()
        .domain(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"])
        .range(colorbrewer.Set3[9]);
        return color(i);
      }')
    );

    # invert font colour at a certain threshold
    # to make it readable on darker background colour
    fgColScales <- list(
      col_1 = JS('function colorScale(tbl, i){
        var color = d3.scale.threshold()
        .domain([130, 130, 200.1])
        .range(["black", "black", "white"]);
        return color(i);
      }'),
      col_2 = JS('function colorScale(tbl, i){
        var color = d3.scale.threshold()
        .domain([130, 130, 200.1])
        .range(["black", "black", "white"]);
        return color(i);
      }') 
    );
        
    d3tf(tbl, table_Props,
                showRowNames = FALSE, tableStyle = "table table-condensed", 
                bgColScales = bgColScales,  fgColScales = fgColScales);
  })
})