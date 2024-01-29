const ctx = {
  w: 1000,
  h: 400,
  circleRadius: 30,
  circleSpacing: 10,
  bigRadiusCircle: 50,
  summerY: 240,
  summerX: 450,
  winterY: 240,
  winterX: 950,
  selectedSports: new Set(),
  medals: [],
  BUBBLE_DURATION: 1000,
  medalType: "total",
  edition_id: 1,
  zoom: null,
};

function createViz() {
  console.log("Using D3 v" + d3.version);

  // Create SVG for the Olympic rings
  let ringsSvg = d3.select("#rings").append("svg");
  // ringsSvg.attr("width", 300);
  // ringsSvg.attr("height", 200);
  ringsSvg.append("g").attr("id", "ringsG");
  let medalTypesSvg = d3.select("#medalTypes").append("svg");
  medalTypesSvg.append("g").attr("id", "medalTypesG");

  // Create SVG for the map
  let svgMap = d3.select("#map").append("svg");
  svgMap.attr("width", 1000);
  svgMap.attr("height", 600);
  svgMap.append("g").attr("id", "rootGMap");

  let svgTimeline = d3
    .select("#timelineContainer")
    .append("svg")
    // .attr("width", 960)
    .attr("height", 100)
    .attr("class", "w-full");
  svgTimeline.append("g").attr("id", "timeLine");

  // Create SVG for the dropdown
  let svgDropdown = d3.select("#dropDown").append("svg");
  // svgDropdown.attr("width", 1000);
  svgDropdown.attr("class", "w-full");
  svgDropdown.attr("height", 500);

  let rootGDropdown = svgDropdown.append("g").attr("id", "rootGDropdown");

  rootGDropdown.append("g").attr("id", "summer");
  rootGDropdown.append("g").attr("id", "winter");

  loadData();
  console.log("jusssstttt befooorree");
  createVisualisation();
  console.log("jusssstttt afteeeerrr");
}

function createDropDown(sport) {
  let sportsSet = sport ? ctx.winterSportsSet : ctx.summerSportsSet;
  // Sorting the set
  const arrayToSort = Array.from(sportsSet).sort(
    (objA, objB) => -objA.count + objB.count
  );
  sportsSet = new Set(arrayToSort);


  let maxCirclesPerRow = Math.floor(
    ctx.w / (2 * ctx.circleRadius + ctx.circleSpacing)
  );
  let overflow = 0;
  let currentCircle = 0;
  d3.select(sport ? "#winter" : "#summer")
    .append("circle")
    .attr("cx", sport ? ctx.winterX : ctx.summerX)
    .attr("cy", sport ? ctx.winterY : ctx.summerY)
    .attr("r", ctx.bigRadiusCircle)
    .style("fill", sport ? "#54d2d2" : "#f8aa4b")
    .on("mouseover", function () {
      showSmallCircles(sport);
    })
    .on("click", function () {
      const isSelected = d3.select(this).classed("selected");
      if (!isSelected) {
        selectAllSports(sport, sportsSet);
        d3.select(this).classed("selected", true); // Mark as selected
      } else {
        deSelectAllSports(sport, sportsSet);
        d3.select(this).classed("selected", false); // Remove selection
      }
    });
  d3.select(sport ? "#winter" : "#summer")
    .append("text")
    .attr("x", sport ? ctx.winterX : ctx.summerX)
    .attr("y", sport ? ctx.winterY : ctx.summerY)
    .attr("text-anchor", "middle")
    .attr("dy", ".3em")
    .text(sport ? "Winter" : "Summer");

  d3.select(sport ? "#winter" : "#summer")
    .selectAll("g")
    .data(sportsSet)
    .enter()
    .append("g")
    .attr("transform", (d, i) => {
      let bigCircleCY = sport ? ctx.winterY : ctx.summerY;
      let bigCircleCX = sport ? ctx.winterX : ctx.summerX;
      let angle, x, y;
      angle =
        (currentCircle / (maxCirclesPerRow + overflow * 6)) * (2 * Math.PI);

      x =
        bigCircleCX +
        Math.cos(angle) * (ctx.circleRadius * (3.5 + overflow * 1.5)) +
        overflow;
      y =
        bigCircleCY +
        Math.sin(angle) * (ctx.circleRadius * (3.5 + overflow * 1.5)) -
        overflow;

      currentCircle++;
      if (currentCircle >= maxCirclesPerRow + overflow * 6) {
        currentCircle = 0;
        overflow++;
      }
      return `translate(${x},${y})`;
    })
    .each(function (d, i) {
      const group = d3.select(this);
      group
        .append("circle")
        .attr("id", d.name.replace(/\s/g, "_"))
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", (d) => 20)
        .style("fill", sport ? "#54d2d2" : "#f8aa4b");
      group
        .append("image")
        .attr("xlink:href", `icons/${d.name}.png`)
        .attr("x", -ctx.circleRadius + 15)
        .attr("y", -ctx.circleRadius)
        .attr("width", ctx.circleRadius)
        .attr("height", ctx.circleRadius * 2)
        .style("fill", "white");
      group
        .on("mouseover", function (event, d) {
          ctx.tooltip.transition().duration(200).style("opacity", 0.9);
          ctx.tooltip
            .html(d.name + "<br/>")
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px");
        })
        .on("mouseout", function (d) {
          ctx.tooltip.transition().duration(500).style("opacity", 0);
        });
      group.on("click", function () {
        selectSport(d.name);
      });
    })
    .attr("opacity", 0);
}

function selectSport(name) {
  let id = name.replace(/\s/g, "_");
  let selected = ctx.selectedSports.has(name);
  if (selected) {
    ctx.selectedSports.delete(name);
    d3.select(`#${id}`).style("stroke", "none");
    drawMedalCircles();
  } else {
    ctx.selectedSports.add(name);
    d3.select(`#${id}`).style("stroke", "white").style("stroke-width", "1px");
    drawMedalCircles();
  }
  selected = !selected;
}

function selectAllSports(sport, sportsSet) {
  sportsSet.forEach((d) => {
    ctx.selectedSports.add(d.name);
  });
  d3.select(sport ? "#winter" : "#summer")
    .selectAll("g")
    .select("circle")
    .style("stroke", "white")
    .style("stroke-width", "1px");
  drawMedalCircles();
}
function deSelectAllSports(sport, sportsSet) {
  sportsSet.forEach((d) => {
    ctx.selectedSports.delete(d.name);
  });
  d3.select(sport ? "#winter" : "#summer")
    .selectAll("g")
    .select("circle")
    .style("stroke", "none");
  drawMedalCircles();
}
function showSmallCircles(sport) {
  d3.select(sport ? "#winter" : "#summer")
    .selectAll("g")
    .transition()
    .delay((d, i) => i * 10)
    .attr("opacity", 1);
}
function drawMedalTypes() {
  medalsPlotData = [
    { color: "#d4af37", cx: 10, cy: 45, nameMedal: "gold" },
    { color: "#B4B4B4", cx: 55, cy: 45, nameMedal: "silver" },
    { color: "#6A3805", cx: 100, cy: 45, nameMedal: "bronze" },
  ];

  const medalsPlotGroup = d3
    .select("#medalTypesG")
    .append("g")
    .attr("class", "olympic-medals")
    .attr("transform", "translate(90,40) scale(1.5)");

  // Append circles
  let medalsPlots = medalsPlotGroup
    .selectAll("circle")
    .data(medalsPlotData)
    .enter()
    .append("circle")
    .attr("cx", (d) => d.cx)
    .attr("cy", (d) => d.cy)
    .attr("r", 20)
    .attr("fill", (d) => d.color)
    .classed("medal-circle", true)
    .style("opacity", 1);

  medalsPlots.on("click", function (event, d) {
    const isSelected = d3.select(this).classed("selected");
    // Deselect all circles within the group
    d3.selectAll(".medal-circle")
      .classed("selected", false)
      .transition()
      .attr("r", 20);

    // Toggle the selection
    if (!isSelected) {
      d3.select(this).classed("selected", true).transition().attr("r", 25);
      ctx.medalType = d.nameMedal;
    } else {
      d3.select(this).classed("selected", false).transition().attr("r", 20);
      ctx.medalType = "total";
    }
    updateMapCircles();
    drawMedalCircles();
    displayTopThreeCountries();
  });

  // Append text
  medalsPlotGroup
    .selectAll("text")
    .data(medalsPlotData)
    .enter()
    .append("text")
    .attr("x", (d) => d.cx)
    .attr("y", (d) => d.cy)
    .attr("dy", ".3em")
    .attr("text-anchor", "middle")
    .style("fill", "white")
    .text((d) => d.nameMedal);
}

function drawOlympicRings() {
  const ringData = [
    { color: "blue", cx: 50, cy: 50, continent: "Europe" },
    { color: "yellow", cx: 90, cy: 80, continent: "Asia" },
    { color: "black", cx: 130, cy: 50, continent: "Africa" },
    { color: "green", cx: 170, cy: 80, continent: "Oceania" },
    { color: "red", cx: 210, cy: 50, continent: "Americas" },
  ];

  const continentZoomSettings = {
    Europe: { coords: [10, 50], zoomLevel: 4 },
    Asia: { coords: [100, 55], zoomLevel: 2 },
    Africa: { coords: [20, 0], zoomLevel: 3 },
    Oceania: { coords: [150, -30], zoomLevel: 4 },
    Americas: { coords: [-80, 0], zoomLevel: 2 },
  };

  const rings = d3
    .select("#ringsG")
    .append("g")
    .attr("class", "olympic-rings")
    .selectAll("circle")
    .data(ringData)
    .enter()
    .append("circle")
    .attr("cx", (d) => d.cx)
    .attr("cy", (d) => d.cy)
    .attr("r", 30)
    .attr("fill", "none")
    .attr("stroke", (d) => d.color)
    .attr("stroke-width", 6)
    .style("opacity", 1);

  ctx.tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("text-align", "left")
    .style("width", "150")
    .style("padding", "2px")
    .style("font", "10px")
    .style("background", "lightsteelblue")
    .style("border", "0px")
    .style("border-radius", "8px")
    .style("pointer-events", "none");
  rings
    .on("mouseover", function (event, d) {
      d3.select(this).attr("stroke-width", 10);
      ctx.tooltip.transition().duration(200).style("opacity", 0.9);
      ctx.tooltip
        .html(d.continent)
        .style("left", event.pageX + 10 + "px") // Position tooltip to the right of the mouse
        .style("top", event.pageY - 10 + "px"); // Position tooltip above the mouse
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke-width", 6);
      ctx.tooltip.transition().duration(500).style("opacity", 0);
    })
    .on("click", function (event, d) {
      const { coords, zoomLevel } = continentZoomSettings[d.continent];
      d3.select("#ringsG")
        .transition()
        .ease(d3.easeBackOut.overshoot(1.7))
        .duration(750)
        .call(
          ctx.zoom.transform,
          d3.zoomIdentity
            .translate(500, 300)
            .scale(zoomLevel)
            .translate(-ctx.projection(coords)[0], -ctx.projection(coords)[1])
        );
    });
}

function updateMapCircles() {
  medals = ctx.medals.filter((event) => event.edition_id == ctx.edition_id);
  let nameMedal = ctx.medalType || "total";
  let medalColorMapping = {
    total: "#54d2d2",
    gold: "#C9B037",
    silver: "#B4B4B4",
    bronze: "#6A3805",
  };
  console.log(medalColorMapping[nameMedal]);
  let circles = d3
    .select("#gMap")
    .selectAll("circle.medal-circle")
    .data(medals, (d) => d.country)
    .join(
      (enter) => {
        let updatedCircles = enter
          .append("circle")
          .classed("medal-circle", true)
          .attr("cx", (d) => ctx.projection([+d.longitude, +d.latitude])[0])
          .attr("cy", (d) => ctx.projection([+d.longitude, +d.latitude])[1])
          .style("fill", (d) => medalColorMapping[nameMedal])
          .attr("fill-opacity", 0.6);
        updatedCircles
          .transition()
          .duration(ctx.BUBBLE_DURATION / 2)
          .ease(d3.easeCubicIn)
          .style("fill", (d) => medalColorMapping[nameMedal])
          .attr("r", (d) => ctx.scaleCircle(d[nameMedal]));
        updatedCircles
          .on("mouseover", function (event, d) {
            ctx.tooltip.transition().duration(200).style("opacity", 0.9);
            ctx.tooltip
              .html(
                `Country: ${d.country}` + "<br/>" + `Medals: ${d[nameMedal]}`
              )
              .style("left", event.pageX + "px")
              .style("top", event.pageY + "px");
          })
          .on("mouseout", function (d) {
            ctx.tooltip.transition().duration(500).style("opacity", 0);
          });
      },
      (update) => {
        return update.call((update) =>
          update
            .transition()
            .duration(ctx.BUBBLE_DURATION / 2)
            .ease(d3.easeCubicIn)
            .style("fill", (d) => medalColorMapping[nameMedal])
            .attr("r", (d) => ctx.scaleCircle(d[nameMedal]))
        );
      },
      (exit) =>
        exit
          .transition()
          .duration(ctx.BUBBLE_DURATION / 2)
          .ease(d3.easeCubicIn)
          .attr("r", 0)
          .remove()
    );
}

function displayTopThreeCountries() {
  let filteredData = ctx.medals
    .filter((d) => parseInt(d.edition_id) === ctx.edition_id)
    .sort((a, b) => b.total - a.total);

  let container = d3.select("#results");

  container.html("");

  container.append("div");
  if (filteredData.length == 0) {
    container.text(`Olympics were cancelled due to war`);
    return "War";
  }
  let year = filteredData[0].year;
  container
    .append("div")
    .attr("class", "font-semibold text-white my-2 text-3xl")
    .attr("text-anchor", "start")
    .text(`Results of ${year}`);

  let headerRow = container.append("div").attr("class", "row");
  headerRow.append("div").attr("class", "col header").text("Rank");
  headerRow.append("div").attr("class", "col header").text("Country");
  headerRow.append("div").attr("class", "col header").text("Gold");
  headerRow.append("div").attr("class", "col header").text("Silver");
  headerRow.append("div").attr("class", "col header").text("Bronze");
  headerRow.append("div").attr("class", "col header").text("Total");

  filteredData.slice(0, 3).forEach((d, i) => {
    let row = container.append("div").attr("class", "row");
    row
    .append("div")
    .attr("class", "col")
    .text(`${i + 1}.`);
    row
      .append("div")
      .attr("class", "col")
      .text(`${d.country}`);
    row.append("div").attr("class", "col").text(d.gold);
    row.append("div").attr("class", "col").text(d.silver);
    row.append("div").attr("class", "col").text(d.bronze);
    row.append("div").attr("class", "col").text(d.total);
  });
  container.append("div").text(`To learn the medal count for a specific country enter its name below :`);

  let inputRow = container.append("div").attr("class", "row centered-row");
  let input = inputRow.append("input")
    .attr("type", "text")
    .attr("placeholder", "Enter a country...")
    .attr("class", "country-input");

  input.on("keypress", function(event) {
    if (event.key === "Enter") {
      let inputValue = input.property("value");
      let countryData = filteredData.find(d => d.country.toLowerCase() === inputValue.toLowerCase());
      if (countryData) {
        inputRow.selectAll(".col").remove(); 
        inputRow.append("div").attr("class", "col").text(countryData.gold);
        inputRow.append("div").attr("class", "col").text(countryData.silver);
        inputRow.append("div").attr("class", "col").text(countryData.bronze);
        inputRow.append("div").attr("class", "col").text(countryData.total);
      } else {
        alert("Country not found or did not participate in this edition.");
      }
    }
  });
}

function drawMedalCircles() {
  let filteredData = ctx.events_result.filter(
    (d) => d.edition_id == ctx.edition_id
  );
  filteredData = filteredData.filter((d) => ctx.selectedSports.has(d.sport));
  let medalType = ctx.medalType;
  if (medalType && medalType !== "total") {
    filteredData = filteredData.filter(
      (d) => d.medal.toLowerCase() === medalType
    );
  }
  let medalsPerCountry = d3.rollup(
    filteredData,
    (v) => v.length,
    (d) => d.country
  );

  let medalData = Array.from(medalsPerCountry, ([country, count]) => ({
    country,
    count,
  }));

  medalData = medalData.map((d) => {
    const coordinates = findCoordinates(d.country, ctx.gps_country);
    return {
      ...d,
      longitude: coordinates[0],
      latitude: coordinates[1],
    };
  });
  let circles = d3
    .select("#gMap")
    .selectAll("circle.sport-circle")
    .data(medalData, (d) => d.country)
    .join(
      (enter) => {
        let updatedCircles = enter
          .append("circle")
          .classed("sport-circle", true)
          .attr("cx", (d) => ctx.projection([+d.longitude, +d.latitude])[0])
          .attr("cy", (d) => ctx.projection([+d.longitude, +d.latitude])[1])
          .style("fill", "white")
          .style("opacity", 0.6);

        updatedCircles
          .transition()
          .duration(ctx.BUBBLE_DURATION / 2)
          .ease(d3.easeCubicIn)
          .attr("r", (d) => ctx.scaleCircle(d.count));

        updatedCircles
          .on("mouseover", function (event, d) {
            ctx.tooltip.transition().duration(200).style("opacity", 0.9);
            ctx.tooltip
              .html(
                `Country: ${d.country}` +
                  "<br/>" +
                  `Medals: ${d.count}` +
                  "<br/>" +
                  `Sports: ${Array.from(ctx.selectedSports)}`
              )
              .style("left", event.pageX + "px")
              .style("top", event.pageY + "px");
          })
          .on("mouseout", function (d) {
            ctx.tooltip.transition().duration(500).style("opacity", 0);
          });
      },
      (update) => {
        return update.call((update) =>
          update
            .transition()
            .duration(ctx.BUBBLE_DURATION)
            .attr("r", (d) => ctx.scaleCircle(d.count))
        );
      },
      (exit) =>
        exit
          .transition()
          .duration(ctx.BUBBLE_DURATION / 2)
          .ease(d3.easeCubicIn)
          .attr("r", 0)
          .remove()
    );
}

function createWorldMedalMap() {
  medals = ctx.medals.filter((event) => event.edition_id == ctx.edition_id);
  ctx.scaleCircle = d3.scaleLinear().range([0.5, 1]);
  ctx.projection = d3
    .geoMercator()
    .center([0, 15])
    .scale(150)
    .translate([500, 400]);

  let svgMap = d3.select("#rootGMap");
  var path = d3.geoPath().projection(ctx.projection);
  var g = svgMap.append("g").attr("id", "gMap");

  // Draw map
  g.selectAll("path")
    .data(ctx.dataGeo.features)
    .enter()
    .append("path")
    .attr("fill", "#b8b8b8")
    .attr("d", path)
    .style("stroke", "#072448")
    .style("opacity", 0.4);

  updateMapCircles();
  displayTopThreeCountries();
  drawMedalCircles();

  ctx.zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
      g.selectAll("circle.medal-circle").attr(
        "r",
        (d) => ctx.scaleCircle(d[ctx.medalType || "total"]) / event.transform.k
      );

      g.selectAll("circle.sport-circle").attr(
        "r",
        (d) => ctx.scaleCircle(d.count) / event.transform.k
      );
    });

  svgMap.call(ctx.zoom);
}

function updateOlympiadText(edition_id) {
  if ((edition_id == 27) | (edition_id == 28)) {
    return `1916 Olympics were cancelled due to WWI`;
  }
  let olympiad = ctx.olympiads.find(
    (d) => parseInt(d.edition_id) == edition_id
  );

  if (olympiad) {
    if (
      (edition_id == 51) |
      (edition_id == 52) |
      (edition_id == 55) |
      (edition_id == 56) |
      (edition_id == 50)
    ) {
      return `${olympiad.edition}, ${olympiad.city}: Olympics were cancelled due to WWII`;
    } else {
      let str = `${olympiad.edition}, ${olympiad.city}`;
      return str;
    }
  }
}

function onTimelineClick(event, olympiadInfo, innterTimeLine) {
  let x = event.offsetX;

  let clickedEditionId = Math.floor((x - ctx.x) / ctx.yearWidth) + 1;
  if (clickedEditionId >= 1 && clickedEditionId <= 62) {
    ctx.edition_id = clickedEditionId;
    updateMapCircles();
    displayTopThreeCountries();

    drawMedalCircles();
    olympiadInfo.text(updateOlympiadText(ctx.edition_id));
    innterTimeLine.attr("width", ctx.edition_id * ctx.yearWidth);
  }
}

function createTimeline() {
  ctx.yearWidth = 15;
  ctx.x = 50;
  ctx.y = 40;
  let w = 930;
  let h = 20;
  let svg = d3.select("#timeLine");
  const width = 2;
  const arrayRange = (start, stop, step) =>
    Array.from(
      { length: (stop - start) / step + 1 },
      (value, index) => start + index * step
    );
  let xCoords = arrayRange(ctx.x + ctx.yearWidth, 985, ctx.yearWidth);

  let timeLineRect = svg
    .append("rect")
    .attr("x", ctx.x)
    .attr("y", ctx.y)
    .attr("width", w)
    .attr("height", h)
    .attr("stroke", "gray")
    .attr("stroke-width", 1)
    .attr("fill", "#54d2d2");
  svg
    .append("g")
    .selectAll("line")
    .data(xCoords)
    .enter()
    .append("line")
    .attr("x1", (d) => d)
    .attr("y1", ctx.y)
    .attr("x2", (d) => d)
    .attr("y2", ctx.y + 10)
    .attr("stroke", "grey");

  let innerTimeLine = svg
    .append("rect")
    .attr("x", ctx.x)
    .attr("y", ctx.y)
    // .attr("width", width)
    .attr("height", h)
    .attr("stroke", "gray")
    .attr("stroke-width", 1)
    .attr("fill", "#ff6150");
  // Play button
  const playButton = svg
    .append("circle")
    .attr("cx", ctx.x - 15)
    .attr("cy", ctx.y + 10)
    .attr("r", 20)
    .attr("fill", "white")
    .attr("stroke", "grey")
    .style("cursor", "pointer");

  const playIcon = svg
    .append("text")
    .attr("x", ctx.x - 21)
    .attr("y", ctx.y + 17)
    .attr("font-family", "Arial")
    .attr("font-size", "20px")
    .text("▶")
    .style("cursor", "pointer");

  // Stop icon
  const stopIcon = svg
    .append("text")
    .attr("x", ctx.x - 21)
    .attr("y", ctx.y + 14)
    .attr("font-family", "Arial")
    .attr("font-size", "20px")
    .text("■")
    .style("visibility", "hidden")
    .style("cursor", "pointer");
  svg
    .append("text")
    .text("1896")
    .attr("x", ctx.x)
    .attr("y", ctx.y - 10)
    .attr("fill", "white");

  svg
    .append("text")
    .text("2022")
    .attr("x", w + 30)
    .attr("y", ctx.y - 10)
    .attr("fill", "white");
  let olympiadInfo = svg
    .append("text")
    .attr("x", ctx.x)
    .attr("y", ctx.y + h * 2)
    .attr("fill", "white");

  olympiadInfo.text(updateOlympiadText(1));
  // Play button functionality
  let playing = false;
  let timer;

  timeLineRect.on("click", (event) =>
    onTimelineClick(event, olympiadInfo, innerTimeLine)
  );
  innerTimeLine.on("click", (event) =>
    onTimelineClick(event, olympiadInfo, innerTimeLine)
  );

  playButton.on("click", function () {
    playing = !playing;
    if (ctx.edition_id > 62) {
      ctx.edition_id = 1;
      playing = true;
    }
    if (playing) {
      playIcon.style("visibility", "hidden");
      stopIcon.style("visibility", "visible");
      playButton.attr("fill", "#f8aa4b");
      timer = d3.interval(function () {
        if (ctx.edition_id > 62) {
          timer.stop();
          playButton.attr("fill", "white");
          playing = false;
        } else {
          if (!ctx.editions.includes(ctx.edition_id)) {
            ctx.edition_id++;
          } else {
            updateMapCircles();
            displayTopThreeCountries();
            drawMedalCircles();
            innerTimeLine.attr("width", ctx.edition_id * ctx.yearWidth);
            olympiadInfo.text("");
            olympiadInfo.text(updateOlympiadText(ctx.edition_id));
            ctx.edition_id++;
          }
        }
      }, ctx.BUBBLE_DURATION);
    } else {
      playIcon.style("visibility", "visible");
      stopIcon.style("visibility", "hidden");
      playButton.attr("fill", "white");
      timer.stop();
    }
  });
}

function findCoordinates(countryName, countryCoordinates) {
  const country = countryCoordinates.find((c) => c.country === countryName);
  return country ? [country.longitude, country.latitude] : [0, 0];
}
function loadData() {
  let promises = [
    d3.csv("data/new_filtered_medals.csv"),
    d3.csv("data/Olympic_Games_Medal_Tally.csv"),
    d3.json("data/world.geojson"),
    d3.csv(
      "data/world_country_and_usa_states_latitude_and_longitude_values.csv"
    ),
    d3.csv("data/Olympics_Games.csv"),
  ];
  Promise.all(promises)
    .then(function (data) {
      let events = data[0];
      let medals = data[1];
      let mapWorld = data[2];
      let gps_country = data[3];
      let olympiads = data[4];
      ctx.summerSportsSet = new Set();
      ctx.winterSportsSet = new Set();
      let editions = olympiads.map((o) => parseInt(o.edition_id));
      ctx.editions = editions.sort(function (a, b) {
        return a - b;
      });
      ctx.events_result = events.filter(
        (event) =>
          (event.country != "Mixed team") &
          (event.country != "Unified Team") &
          (event.country != "Independent Olympic Athletes")
      );
      ctx.events_result.forEach((event) => {
        let sportName = event.sport;
        let isSummer = event.edition.includes("Summer");
        let isWinter = event.edition.includes("Winter");
        let summerObj = Array.from(ctx.summerSportsSet).find(
          (sport) => sport.name === sportName
        );
        let winterObj = Array.from(ctx.winterSportsSet).find(
          (sport) => sport.name === sportName
        );

        if (summerObj && isSummer) {
          summerObj.count++;
        } else if (isSummer) {
          ctx.summerSportsSet.add({ name: sportName, count: 1 });
        } else if (winterObj && isWinter) {
          winterObj.count++;
        } else if (isWinter) {
          ctx.winterSportsSet.add({ name: sportName, count: 1 });
        }
      });

      createDropDown(true);
      createDropDown(false);
      medals = medals.filter(
        (event) =>
          (event.country != "Mixed team") &
          (event.country != "Unified Team") &
          (event.country != "Independent Olympic Athletes")
      );

      ctx.medals = medals.map((d) => {
        const coordinates = findCoordinates(d.country, gps_country);
        return {
          ...d,
          longitude: coordinates[0],
          latitude: coordinates[1],
        };
      });
      ctx.gps_country = gps_country;

      mapWorld.features = mapWorld.features.filter(
        (c) => c.properties.name != "Antarctica"
      );
      ctx.dataGeo = mapWorld;
      ctx.olympiads = olympiads.filter((o) => o.edition_id <= 62);
      drawMedalTypes();
      displayTopThreeCountries();
      drawOlympicRings();
      createWorldMedalMap();
      createTimeline();
    })

    .catch(function (error) {
      console.log(error);
    });
}
