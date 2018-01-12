# Loading the libraries used
library(tidyverse)
library(plyr)

# data from https://www.kaggle.com/starbucks/store-locations/data
starbucks <- read.csv("starbucks.csv")

# data from https://github.com/jasonong/List-of-US-States
states <- read.csv("states.csv")

# Cleaning by filtering out the locations that are not in the US
starbucksUS <- starbucks[starbucks$Country == "US",]

# Removing unnecessary data for this project
starbucksUS$Brand <- NULL
starbucksUS$Store.Name <- NULL
starbucksUS$Store.Name <- NULL
starbucksUS$Ownership.Type <- NULL
starbucksUS$Street.Address <- NULL
starbucksUS$Postcode <- NULL
starbucksUS$Phone.Number <- NULL
starbucksUS$Timezone <- NULL
starbucksUS$Country <- NULL

# Creating a new data frame that shows how many locations are in each state
freqCount <- count(starbucksUS, "State.Province")

# Renaming the columns
colnames(freqCount) <- c("Abbreviation", "Value")

# Looping through the vector of abbreviations and finding the full name of the state
stateFull <- character()
stateAbbredviated <- as.vector(t(freqCount[1]))
for(state in stateAbbredviated){
  rowNum <- which(grepl(state, states$Abbreviation))
  state <- as.character(states$State[rowNum])
  stateFull <- append(stateFull, state)
}

# Creating the third column
freqCount["Full"] <- stateFull

# Getting rid of abbreviations and renaming the columns
freqCount <- freqCount[c("Full", "Value")]
colnames(freqCount) <- c("state", "value")

# Sorting the data frame alphabetically 
freqCount <- freqCount[order(freqCount$state),]

# Export to CSV
write.csv(freqCount, file = "final-starbucks-us.csv")

