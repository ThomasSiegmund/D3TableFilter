
# Shiny app demonstrating the "sparkline" function of the D3TableFilter widget

library(shiny)
library(htmlwidgets)
library(D3TableFilter)

startLength <- 20;
rows = 20;

shinyServer(function(input, output, session) {
  
  startVector <- sapply(1:rows, FUN = function(x) {paste(as.character(round(runif(startLength, min = -20, max = 20))), collapse = ',')}); 
  startChange <- gsub('\\d+', '0', startVector);
  
  tbl <- data.frame(Line = startVector,  Bar = startVector, Boxplot = startVector, Tristate = startChange, stringsAsFactors = FALSE);
  
  revals <- reactiveValues();
  revals$vector <- startVector;
  revals$changes <- startChange;
  
  output$sparks1 <- renderD3tf({

    # define four different sparklines for four columns
    sparklines = list(col_0 = list(  type = "line",
                                     width = "120px",
                                     height = "24px",
                                     lineColor = "black",
                                     fillColor = FALSE,
                                     spotColor = "#F8766D",
                                     minSpotColor = "#00BFC4",
                                     maxSpotColor = "#00BFC4",
                                     spotRadius = 2,
                                     normalRangeMax = 15,
                                     normalRangeMin = -15,
                                     normalRangeColor = "#E7E8EA"
                                   ),
                      col_1 = list(  type = "bar",
                                     barColor = "#00BFC4",
                                     negBarColor = "#F8766D",
                                     width = "120px",
                                     height = "24px"
                                   ),
                      col_2 = list(  type = "box",
                                     width = "120px",
                                     height = "24px"
                                  ),
                      col_3 = list(type = "tristate",
                                     posBarColor = "#00BA38",
                                     negBarColor = "#F8766D",
                                     width = "120px",
                                     height = "24px"
                                   )
                      )

    d3tf(tbl, 
         sparklines = sparklines,
         enableTf = FALSE);
  })

  # generate a pseudo-ticker by appending a new random value per second into each table cell
  observe({
    invalidateLater(1000, session);
    isolate({
      for (i in 1:length(revals$vector)) {
        old <- revals$vector[i]
        oldVals <- as.numeric(unlist((strsplit(old, ','))));
        lastVal <- oldVals[length(oldVals)]
        change <- round(runif(1, min = -3, max = 3))
        oldChanges <- unlist(strsplit(revals$changes[i], ','));
        changeVector <- paste(c(oldChanges[-1], as.character(change)), collapse = ',')
        revals$changes[i] <- changeVector
        newVal <-  paste(as.character(c(oldVals[-1], lastVal + change)), collapse = ',')
        revals$vector[i] <- newVal;
        # could update the complete table in one go. performance would likely be better.
        # this is to demonstrate the update of single cells.
        setCellValue(session, "sparks1", row = i, col = 1, value = newVal)
        setCellValue(session, "sparks1", row = i, col = 2, value = newVal)
        setCellValue(session, "sparks1", row = i, col = 3, value = newVal)
        setCellValue(session, "sparks1", row = i, col = 4, value = changeVector)
      }
    })
  })

})

