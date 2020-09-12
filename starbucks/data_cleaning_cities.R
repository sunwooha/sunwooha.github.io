library(tidyverse)
library(dplyr)

# data from https://www.kaggle.com/starbucks/store-locations/data
starbucks <- read.csv("starbucks.csv")

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
starbucksUS$Store.Number <- NULL

# Funtion to turn cities into proper case
capwords <- function(s, strict = TRUE) {
  cap <- function(s) paste(toupper(substring(s, 1, 1)),
                           {s <- substring(s, 2); if(strict) tolower(s) else s},
                           sep = "", collapse = " " )
  sapply(strsplit(s, split = " "), cap, USE.NAMES = !is.null(names(s)))
}

# Making sure all cities are in proper case
city_proper <- character()
for (city in starbucksUS$City){
  city <- capwords(city)
  city_proper <- append(city_proper, city)
}

# Creating dataset by finding the mean of long and lat for each city and finding the count
starbucksUS["City Proper"] <- city_proper
starbucksUS <- starbucksUS[c("City Proper", "State.Province", "Longitude", "Latitude")]
colnames(starbucksUS) <- c("city","state", "long", "lat")
geolocation <- 
  starbucksUS %>%
    group_by(city, state) %>%
     summarise(long = mean(long), lat = mean(lat), value = n())

# Export to CSV
write.csv(geolocation, file = "starbucks-cities.csv")



