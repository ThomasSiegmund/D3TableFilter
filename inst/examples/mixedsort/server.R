# --------------------------------------------------------
# Minimal shiny app mixed sorting the D3TableFilter widget
# server.R
# --------------------------------------------------------
library(shiny)
library(htmlwidgets)
library(D3TableFilter)
library(gtools)

Treatment <- c("Control", "Asprin 10mg/day", "Asprin 50mg/day",
               "Asprin 100mg/day", "Acetomycin 100mg/day",
               "Acetomycin 1000mg/day");

Dosing <- c("AA 0.50 ml", "AA 500 ml", "AA 1500 ml", "AA 1e3 ml", "AA 1.5 ml", "1e2");

Index <- 1:length(Treatment);

rownames <- c("Test1", "Test100", "Test20", "Test50", "Test", "Test0")

df <- data.frame(Index, Treatment, Dosing, row.names = rownames);

shinyServer(function(input, output, session) {
  output$mtcars <- renderD3tf({
    
    # Define table properties. See http://tablefilter.free.fr/doc.php
    # for a complete reference
    tableProps <- list(
      btn_reset = TRUE,
      sort = TRUE,
      sort_config = list(
         sort_types = c("Mixed", "Number", "Mixed", "Mixed")
      )
    );
    
    d3tf(df,
         tableProps = tableProps,
         showRowNames = TRUE,
         tableStyle = "table table-bordered");
  })
})
