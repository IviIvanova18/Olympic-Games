// createBarChart.js

let ANIMATION_DURATION = 2500;

function createBarChart() {
    // load 'Olympic_Athlete_Event_Results.csv'
    d3.csv("data/Olympic_Athlete_Event_Results.csv").then(function (data) {
        // at the end we need to return the data in the following format
        //     {
        //         'year': XXXX,
        //             'sports': [
        //                 { 'name': 'Athletics', 'popularity': 14 },
        //                 ...
        //             ]
        //     },

        // Each line of the csv has an 'Edition' column, which is the year of the olympics
        // Sport column is the name of the sport
        // Popularity is the number of athletes in that sport in that year

        var groupedData = {};
        data.forEach(function (row) {
            // Edition is something like '2000 Summer', so we need to extract the year
            var year = parseInt(row.edition.split(' ')[0]);
            var sport = row.sport;

            // if the second word is not 'Summer'
            if (row.edition.split(' ')[1] !== 'Summer') {
                // skip this row
                return;
            }

            // Initialize the year in the grouped data if not already present
            if (!groupedData[year]) {
                groupedData[year] = {
                    'year': year,
                    'sports': []
                };
            }

            // Find the sport in the current year's data
            var sportEntry = groupedData[year].sports.find(s => s.name === sport);

            if (sportEntry) {
                // If the sport is already in the list, increment its popularity
                sportEntry.popularity += 1;
            } else {
                // If the sport is not in the list, add it with a popularity of 1
                groupedData[year].sports.push({ 'name': sport, 'popularity': 1 });
            }
        });

        const margin = { top: 30, right: 30, bottom: 40, left: 150 };
        const width = 1200 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const svg = d3.select("#chart-container").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        // get all sports names
        const sportNames = [];
        Object.values(groupedData).forEach(yearData => {
            yearData.sports.forEach(sport => {
                if (!sportNames.includes(sport.name)) {
                    sportNames.push(sport.name);
                }
            });
        });


        const colorScale = d3.scaleOrdinal()
            .domain(sportNames)
            .range(d3.schemeCategory10);

        const x = d3.scaleLinear().range([0, width - 150]);
        const y = d3.scaleBand().range([height - 20, 0]).padding(0.1);

        const xAxisCall = d3.axisBottom();
        const xAxis = svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")");

        // under the x-axis put the label 'Number of Athletes'
        svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", (width - 200) / 2)
            .attr("y", height + 35)
            .attr("font-size", "0.7em")
            .attr("fill", "white")
            .text("Number of Athletes");

        const yAxisCall = d3.axisLeft();
        const yAxis = svg.append("g")

        const yearText = svg.append("text")
            .attr("class", "year-text")
            .attr("text-anchor", "end")
            .attr("x", 1000)
            .attr("y", margin.top)
            .attr("font-size", "2em")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .text("1896");

        var lastPopularity = {};

        function update(yearData) {
            console.log(yearData);
            // Sort sports by popularity
            var topSports = yearData.sports.sort((a, b) => b.popularity - a.popularity).slice(0, 10);

            // revere the list
            topSports.reverse();

            // Set the scale domains
            x.domain([0, d3.max(topSports, d => d.popularity)]);
            y.domain(topSports.map(d => d.name));

            const yearText = svg.selectAll(".year-text").data([yearData.year]);

            yearText.enter()
                .append("text")
                .attr("class", "year-text")
                .merge(yearText)
                .attr("text-anchor", "end")
                .attr("x", 1000)
                .attr("y", margin.top)
                .attr("font-size", "2em")
                .attr("font-weight", "bold")
                .attr("fill", "white")
                .text(d => d); // Set the text to the current year


            // Update the x-axis
            xAxisCall.scale(x);
            xAxis.transition()
            svg.select(".x-axis")
                .transition()
                .duration(ANIMATION_DURATION)
                .call(xAxisCall);
            // remove the right border of the x-axis
            svg.select(".domain").remove();

            // Bind data to bars

            const bars = svg.selectAll(".bar")
                .data(topSports, d => d.name);

            // Exit
            bars.exit()
                .transition()
                .duration(ANIMATION_DURATION)
                .attr("y", d => height + 100)
                .attr("fill-opacity", 0)
                .remove();

            topSports.forEach(sport => {
                lastPopularity[sport.name] = sport.popularity;
            });


            // Enter + Update
            bars.enter().append("rect")
                .attr("class", "bar")
                .attr("x", 0)
                .attr("y", d => height + 100)
                .attr("fill-opacity", 0.2)
                .attr("width", d => x(lastPopularity[d.name]))
                .attr("height", y.bandwidth())
                .merge(bars) // Merge with existing bars
                .transition()
                .duration(ANIMATION_DURATION)
                .attr("fill-opacity", 1)
                .attr("width", d => x(d.popularity))
                .attr("y", d => y(d.name)) // Update y position based on new sorting
                .attr("fill", d => colorScale(d.name))
                .attr("stroke", "black");

            // Bind data to text labels
            const labels = svg.selectAll(".label")
                .data(topSports, d => d.name);

            // Exit
            labels.exit()
                .transition()
                .duration(ANIMATION_DURATION)
                .attr("y", d => height + 100)
                .attr("fill-opacity", 0)
                .remove();

            // Enter + Update
            labels.enter().append("text")
                .attr("class", "label")
                .attr("x", d => -125) // Position text slightly right of the bar end
                .attr("y", d => height + 100)
                .attr("dy", ".35em")
                .attr("fill", "white")
                .attr("fill-opacity", 0.2)
                .merge(labels) // Merge with existing labels
                .transition()
                .duration(ANIMATION_DURATION)
                .attr("fill-opacity", 1)
                .attr("x", d => -125)
                .attr("y", d => y(d.name) + y.bandwidth() / 2)
                .text(d => {
                    // if the name is longer than 20 characters, truncate it and add '...'
                    if (d.name.length > 15) {
                        return d.name.substring(0, 15) + '.';
                    }
                    return d.name;
                });
        }


        function animate() {
            while (year < 2021) {
                var yearData = groupedData[year];
                year += 4;
                if (yearData) {
                    break;
                }
            }

            update(yearData);

            setTimeout(animate, ANIMATION_DURATION); // Change data every 1.5 seconds
        }

        let year = 1896;
        animate();
    }
    );
}



document.addEventListener("DOMContentLoaded", () => {
    createBarChart();
});