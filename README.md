# Data Visualization Project Report on the Olympic Games

## Introduction
The Olympic Games, a symbol of unity and excellence in sports, have been a cornerstone of interna-
tional athletics since their modern inception in 1896 in Athens. With the excitement building for the
upcoming Olympics in Paris, this data visualization project aims to capture the spirit and history of
the Games through an in-depth analysis of its rich history. Spanning from the first Olympics in 1896
to the 2022 edition, this project utilizes comprehensive datasets to illuminate the achievements and
global impact of the Games.
## Datasets
The foundation of this project is a diverse and clean dataset1. A significant preprocessing step involved
focusing exclusively on athletes who have won medals, necessitating the removal of entries where the
medal column was ’NaN’. This was achieved by filtering the ’OlympicAthleteEventResults’ dataset
and subsequently merging it with a ’Country Coordinates’ table.
A notable challenge arose in reconciling the country codes between the Olympics dataset, which used
three-letter codes, and the two-letter codes in the ’world.geojson’ used for plotting the world map.
This discrepancy required a binding process based on country names, leading to complications when
names did not match exactly, such as ”People’s Republic of China” versus ”China.”
## Technical Description
The project uses D3.js, a powerful JavaScript library, for data visualization, providing an interactive
and dynamic user experience. The preprocessing of data was adeptly handled using the Pandas library
in Python, allowing for efficient manipulation and preparation of the dataset for the visualization stage.
