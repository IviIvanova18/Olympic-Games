const cte = {
//dataFile: "sampled_df.csv",
dataFile: "data/hajar_data/OGathletes.csv",

h: 700,
w: 750,
mapHeight: 700,
mapWidth: 750,
duration: 1000,

    
};
const countryNameToCode = {
    "France": "FRA",
    "Japan": "JPN",
    "United States": "USA",
    "Yugoslavia": "YUG",  //  hasn't dissolved? 
    "Greece": "GRC",
    "Austria": "AUT",
    "China": "CHN",
    "United Kingdom": "GBR",
    "Brazil": "BRA",
    "Australia": "AUS",
    "Norway": "NOR",
    "South Korea": "KOR",
    "Canada": "CAN",
    "Germany": "DEU",
    "Switzerland": "CHE",
    "Italy": "ITA",
    "Russia": "RUS",  // For Russian Federation
    "Sweden": "SWE",
    "Belgium": "BEL"
    };

let yearCounts={};
let countryCounts= {};
const colorScale = d3.scaleSequential(d3.interpolateGreens);

let timer;  
let globalGeojson;
let margin, width, height, xScale, yScale;
let yearsArray = []; 
let currentYearIndex = 0; 
// helper functions
let isVisualizationRunning = false;

function processCountryData(data) {
    let countryCounts = {};
    let maxEventCount = 0;

    data.forEach(d => {
        if (d.sex === 'Female') {
            let countryCode = countryNameToCode[d.host_country];
            if (countryCode) {
                countryCounts[countryCode] = (countryCounts[countryCode] || 0) + 1;
                maxEventCount = Math.max(maxEventCount, countryCounts[countryCode]);
            }
        }
    });
    colorScale.domain([0, maxEventCount]); 
    return countryCounts;
}
function transitionPath(path) {
    path.transition()
        .duration(cte.duration) 
        .attrTween("stroke-dasharray", function() {
            const length = this.getTotalLength();
            return function(t) {
                return `${length * t},${length}`;
            };
        });
}

function setupScales() {
    margin = { top: 40, right: 20, bottom: 70, left: 80 };
    width = cte.w - margin.left - margin.right;
    height = cte.h - margin.top - margin.bottom;

    xScale = d3.scaleBand()
                .domain(Object.keys(yearCounts)) 
                .range([0, width])
                .padding(0.1);

    const maxPercentage = d3.max(Object.values(yearCounts), d => d.percentage);

    yScale = d3.scaleLinear()
                .domain([0, maxPercentage]) // Dynamic Y scale based on data
                .range([height, 0]);
}




function createVisualisation() {
    
    loadingData().then(function(data) {
        setupScales();
        let svgGraph = d3.select("#main").append("svg")
                    .attr("width", cte.w)
                    .attr("height", cte.h);

        let svgMap = d3.select("#map-container").append("svg")
                    .attr("width", cte.mapWidth)
                    .attr("height", cte.mapHeight);
        
            

        initializeLineGraph(svgGraph);
        initializeMap(svgMap);
    }).catch(function(error) {
        console.error("Error in createVisualisation: ", error);
    });
}

function initializeLineGraph(svg) {

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);


    svg.append("g")
        .attr("class", "x-axis") 
        .attr("transform", `translate(${margin.left}, ${height + margin.top})`)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .style("font-weight", "bold")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(yAxis)
        .style("font-weight", "bold");

    svg.selectAll(".x-axis path, .x-axis line, .y-axis path, .y-axis line")
    .style("stroke", "gray") 
    .style("stroke-width", "2px");

    svg.append("text")
        .attr("transform", `translate(${width / 2 + margin.left}, ${height + margin.top + 50})`)
        .style("text-anchor", "middle")
        .style("font-family", "Arial")
        .style("font-size", "16px")
        .style("fill", "gray")
        .style("font-weight", "bold")
        .text("Year");



    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -3)
        .attr("x", 0 - (height / 2 + margin.top))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-family", "Arial")
        .style("font-size", "16px")
        .style("fill", "gray")
        .style("font-weight", "bold")
        .text("Percentage of Female Participants (%)");

    svg.selectAll(".x-axis text, .y-axis text")
        .style("fill", "gray"); 

    // Main Title
    svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", margin.top / 2) 
        .attr("text-anchor", "middle") 
        .style("font-family", "Arial")
        .style("font-size", "24px") 
        .style("font-weight", "bold") 
        .style("fill", "gray")
        .text("Women's Participation in Olympic Games (1896-2022)"); 
    
}

function initializeMap(svg) {
    const margin = { top: 40, right: 20, bottom: 70, left: 80 },
            width = cte.mapWidth - margin.left - margin.right,
            height = cte.mapHeight - margin.top - margin.bottom;

    d3.json("data/hajar_data/custom.geo.json").then(geojson => {
        let projection = d3.geoMercator()
                            .fitSize([width, height], geojson);
                            
    
        let path = d3.geoPath().projection(projection);
    
        svg.selectAll("path")
            .data(geojson.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", "lightgray")
            .attr("stroke", "white")
            .append("title")
            .text(d => d.properties.name);

        // Main Title
        svg.append("text")
            .attr("x", cte.mapWidth / 2)
            .attr("y", margin.top/2) 
            .attr("text-anchor", "middle")
            .style("font-family", "Arial")
            .style("font-size", "24px")
            .style("font-weight", "bold")
            .style("fill", "gray")
            .text("Female Participation in Olympic Host Nations");

        globalGeojson = geojson;

        
    });
    
}




function restartVisualization() {
   
    clearTimeout(timer);
    currentYearIndex = 3; 
    resetMapAndGraph();
    updateVisualization(); 
}

function startVisualization() {
   
    currentYearIndex = 3; 
    updateVisualization();
    isVisualizationRunning = true;
}

function updateVisualization() {
    let svgGraph = d3.select("#main svg");
    let svgMap = d3.select("#map-container svg");

    if (yearCounts && countryCounts && globalGeojson) {
        if (currentYearIndex < yearsArray.length) {
            let currentYear = yearsArray[currentYearIndex - 1]; 

            lineGraph(svgGraph, currentYear);
            updateMapColors(svgMap);

            currentYearIndex++; 
        }
    } else {
        console.error("Data not loaded or processed correctly");
    }

    if (currentYearIndex < yearsArray.length) {
        timer = setTimeout(updateVisualization, cte.duration);
    } else {
        isVisualizationRunning = false; 
    }
}

function resetMapAndGraph() {

    d3.select("#main svg").remove();
    let svgGraph = d3.select("#main").append("svg")
                        .attr("width", cte.w)
                        .attr("height", cte.h);
    initializeLineGraph(svgGraph);

    
    d3.select("#map-container svg").remove();
    let svgMap = d3.select("#map-container").append("svg")
                    .attr("width", cte.mapWidth)
                    .attr("height", cte.mapHeight);
    initializeMap(svgMap);
}
    
function loadingData() {
    return d3.csv(cte.dataFile).then(function(data) {
        let yearData = {};

        data.forEach(function(d) {
            var year = d.year;
            var isFemale = d.sex === 'Female';

            if (!yearData[year]) {
                yearData[year] = { total: 0, female: 0 };
            }

            yearData[year].total += 1;
            if (isFemale) {
                yearData[year].female += 1;
            }
        });

        // Convert counts to percentages
        for (let year in yearData) {
            let data = yearData[year];
            data.percentage = (data.female / data.total) * 100;
        }

        yearCounts = yearData;
        

        countryCounts = processCountryData(data);
      

        const uniqueYears = new Set(data.map(d => d.year));
    
        yearsArray = Array.from(uniqueYears).sort((a, b) => a - b);
        
        return data;
        

    }).catch(function(error) {
        console.error("Error loading data: ", error);
    });
}




let lastDrawnLength = 0; 

function lineGraph(svg, upToYear) {
   
    const filteredData = Object.entries(yearCounts)
                              .filter(([year, _]) => year <= upToYear)
                              .map(([year, data]) => ({ year, percentage: data.percentage }));


    xScale.domain(filteredData.map(d => d.year));
    const maxPercentage = d3.max(filteredData, d => d.percentage);
    yScale.domain([0, maxPercentage]);

 
    svg.select(".x-axis")
       .transition()
       .duration(cte.duration)
       .call(d3.axisBottom(xScale))
       .selectAll("text")
       .style("text-anchor", "end")
       .attr("dx", "-.8em")
       .attr("dy", ".15em")
       .attr("transform", "rotate(-45)");

    svg.select(".y-axis")
       .transition()
       .duration(cte.duration)
       .call(d3.axisLeft(yScale));


    const lineGenerator = d3.line()
                            .curve(d3.curveMonotoneX) 
                            .x(d => xScale(d.year))
                            .y(d => yScale(d.percentage));

    
    let path = svg.selectAll(".line-path").data([filteredData]);


    path.enter()
        .append("path")
        .attr("class", "line-path")
        .merge(path)
        .attr("d", lineGenerator)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 5)
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

   
    path = svg.select(".line-path");
    const totalLength = svg.select(".line-path").node().getTotalLength();

    
    const currentLength = lineGenerator(filteredData).length;

   
    svg.select(".line-path")
        .transition()
        .duration(cte.duration)
        .ease(d3.easeElasticOut) 
        .attrTween("stroke-dashoffset", function() {
            const interpolate = d3.interpolate(lastDrawnLength, totalLength - currentLength);
            return function(t) {
                return interpolate(t);
            };
        });

    lastDrawnLength = totalLength - currentLength;
}



function updateMapColors(svg) {
    if (globalGeojson) {
        globalGeojson.features.forEach(feature => {
            let countryName = feature.properties.adm0_a3;
            let isHostCountry = countryName in countryCounts; 

            svg.selectAll("path")
                .filter(d => d.properties.adm0_a3 === countryName)
                .transition()
                .duration(cte.duration * 5)
                .attr("fill", isHostCountry ? colorScale(countryCounts[countryName]) : "transparent"); 
        });
    }
}


document.addEventListener('DOMContentLoaded', (event) => {

    document.getElementById('startButton').addEventListener('click', function() {
        if (isVisualizationRunning) {
            restartVisualization();
        } else {
            startVisualization();
            isVisualizationRunning = true;
        }
    });
});



