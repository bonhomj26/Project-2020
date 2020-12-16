// Winery

// Code for Chart is Wrapped Inside a Function That Automatically Resizes the Chart
function makeResponsive() {

  // If SVG Area is not Empty When Browser Loads, Remove & Replace with a Resized Version of Chart
  var svgArea = d3.select("body").select("svg");

  // Height and Width Using d3 function for page responsiveness

  var svgWidth = parseInt(d3.select("#scatter").style("Width"));
  var svgHeight = svgWidth - svgWidth / 3.9 // Ratio for Height and Width of svg tag

  // Clear SVG if Not Empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // Setup Chart Parameters/Dimensions

  // var svgWidth = 980;
  // var svgHeight = 600;

  // Set SVG Margins
  var margin = {
    top: 20,
    right: 40,
    bottom: 90,
    left: 100
  };

  // Define Dimensions of the Chart Area
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG Element/Wrapper - Select Body, Append SVG Area & Set the Dimensions
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Append Group Element & Set Margins - Shift (Translate) by Left and Top Margins Using Transform
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
  var chosenXAxis = "price";
  var chosenYAxis = "winery";

  // Function for Updating xScale Upon Click on Axis Label
  function xScale(acsData, chosenXAxis) {
    // Create Scale Functions for the Chart (chosenXAxis)
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(acsData, d => d[chosenXAxis]) * 0.8,
      d3.max(acsData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
    return xLinearScale;
  }

  // Function for Updating yScale Upon Click on Axis Label
  function yScale(acsData, chosenYAxis) {
    // Create Scale Functions for the Chart (chosenYAxis)
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(acsData, d => d[chosenYAxis]) * 0.8,
      d3.max(acsData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
    return yLinearScale;
  }

  // Function for Updating xAxis Upon Click on Axis Label
  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
    return xAxis;
  }

  // Function for Updating yAxis Upon Click on Axis Label
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
  }

  // Function for Updating Circles Group with a Transition to New Circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
  }

  // Function for Updating Text Group with a Transition to New Text
  function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]))
      .attr("text-anchor", "middle");

    return textGroup;
  }

  // Function for Updating Circles Group with New Tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {

    if (chosenXAxis === "price") {
      var xLabel = "Price (Average)";
    }
    else if (chosenXAxis === "points") {
      var xLabel = "Points (Average)";
    }
    else {
      var xLabel = "Regions";
    }
    if (chosenYAxis === "winery") {
      var yLabel = "Finest Wineries";
    }
    else if (chosenYAxis === "province") {
      var yLabel = "Province";
    }
    else {
      var yLabel = "World Wineries";
    }

    // Initialize Tool Tip
    var toolTip = d3.tip()
      .attr("class", "tooltip d3-tip")
      .offset([90, 90])
      .html(function (d) {
        return (`<strong>${d.abbr}</strong><br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
      });
    // Create Circles Tooltip in the Chart
    circlesGroup.call(toolTip);
    // Create Event Listeners to Display and Hide the Circles Tooltip
    circlesGroup.on("mouseover", function (data) {
      toolTip.show(data, this);
    })
      // onmouseout Event
      .on("mouseout", function (data) {
        toolTip.hide(data);
      });
    // Create Text Tooltip in the Chart
    textGroup.call(toolTip);
    // Create Event Listeners to Display and Hide the Text Tooltip
    textGroup.on("mouseover", function (data) {
      toolTip.show(data, this);
    })
      // onmouseout Event
      .on("mouseout", function (data) {
        toolTip.hide(data);
      });
    return circlesGroup;
  }

  // Import Data from the data.csv File & Execute Everything Below
  d3.csv("Vizualization/assets/data/wine_data.csv")
    .then(function (acsData) {

      //Format or Parse the Data (Cast as Numbers)
      acsData.forEach(function (data) {
        data.price = +data.price;
        data.points = +data.points;
        data.lat = +data.lat;
        data.winery = +data.winery;
        data.province = +data.province;
        data.lng = +data.lng;
      });

      // Create xLinearScale & yLinearScale Functions for the Chart
      var xLinearScale = xScale(acsData, chosenXAxis);
      var yLinearScale = yScale(acsData, chosenYAxis);

      // Create Axis Functions for the Chart
      var bottomAxis = d3.axisBottom(xLinearScale);
      var leftAxis = d3.axisLeft(yLinearScale);

      // Append xAxis to the Chart
      var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

      // Append yAxis to the Chart
      var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

      // Create & Append Initial Circles
      var circlesGroup = chartGroup.selectAll(".stateCircle")
        .data(acsData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("class", "stateCircle")
        .attr("r", 15)
        .attr("opacity", ".75");

      // Append Text to Circles
      var textGroup = chartGroup.selectAll(".stateText")
        .data(acsData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis] * .98))
        .text(d => (d.abbr))
        .attr("class", "stateText")
        .attr("font-size", "12px")
        .attr("text-anchor", "middle")
        .attr("fill", "white");

      // Create Group for 3 xAxis Labels
      var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
      // Append xAxis
      var priceLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "price") // Value to Grab for Event Listener
        .classed("active", true)
        .text("Price");

       var pointsLabel = xLabelsGroup.append("text")
      
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "points") // Value to Grab for Event Listener
        .classed("inactive", true)
        .text("Points (Average)");

      // var latLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "lat") // Value to Grab for Event Listener
        .classed("inactive", true)
        .text("Regions");

      // Create Group for 3 yAxis Labels
     
      var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(-25, ${height / 2})`);

      //Append yAxis
      var wineryLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -30)
        .attr("x", 0)
        .attr("value", "winery")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("active", true)
        .text("Finest Wineries");
     
        var provinceLabel = yLabelsGroup.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -30)
          .attr("x", 0)
          .attr("value", "province")
          .attr("dy", "1em")
          .classed("axis-text", true)
          .classed("active", true)
          .text("Province");

      var lngLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", 0)
        .attr("value", "lng")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("inactive", true)
        .text("World Wineries");

      // updateToolTip Function
      var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

      // xAxis Labels Event Listener
      xLabelsGroup.selectAll("text")
        .on("click", function () {
          // Get Value of Selection
          var value = d3.select(this).attr("value");
          if (value !== chosenXAxis) {
            // Replaces chosenXAxis with Value
            chosenXAxis = value;
            // Updates xScale for New Data
            xLinearScale = xScale(acsData, chosenXAxis);
            // Updates xAxis with Transition
            xAxis = renderXAxes(xLinearScale, xAxis);
            // Updates Circles with New Values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            // Updates Text with New Values
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
            // Updates Tooltips with New Information
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
            // Changes Classes to Change Bold Text
            if (chosenXAxis === "price") {
              priceLabel
                .classed("active", true)
                .classed("inactive", false);
              pointsLabel
                .classed("active", false)
                .classed("inactive", true);
              latLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenXAxis === "points") {
              priceLabel
                .classed("active", false)
                .classed("inactive", true);
              pointsLabel
                .classed("active", true)
                .classed("inactive", false);
              latLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
              priceLabel
                .classed("active", false)
                .classed("inactive", true);
              pointsLabel
                .classed("active", false)
                .classed("inactive", true);
              latLabel
                .classed("active", true)
                .classed("inactive", false);
            }
          }
        });

      // yAxis Labels Event Listener
      yLabelsGroup.selectAll("text")
        .on("click", function () {
          // Get Value of Selection
          var value = d3.select(this).attr("value");
          if (value !== chosenYAxis) {
            // Replaces chosenYAxis with Value
            chosenYAxis = value;
            // Updates yScale for New Data
            yLinearScale = yScale(acsData, chosenYAxis);
            // Updates yAxis with Transition
            yAxis = renderYAxes(yLinearScale, yAxis);
            // Updates Circles with New Values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            // Updates Text with New Values
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
            // Updates Tooltips with New Information
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

            // Changes Classes to Change Bold Text
            if (chosenYAxis === "winery") {
              wineryLabel
                .classed("active", true)
                .classed("inactive", false);
              provinceLabel
                .classed("active", false)
                .classed("inactive", true);
              lngLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenYAxis === "province") {
              wineryLabel
                .classed("active", false)
                .classed("inactive", true);
              provinceLabel
                .classed("active", true)
                .classed("inactive", false);
              lngLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
              wineryLabel
                .classed("active", false)
                .classed("inactive", true);
              provinceLabel
                .classed("active", false)
                .classed("inactive", true);
              lngLabel
                .classed("active", true)
                .classed("inactive", false);
            }
          }
        });
    });
}
// When Browser Loads, makeResponsive() is Called
makeResponsive();

// When Browser Window is Resized, makeResponsive() is Called
d3.select(window).on("resize", makeResponsive);