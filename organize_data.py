import numpy as np
import pandas as pd

"""Read in 2017.csv and world-country-names.tsv
the data in the happiness index files is as so:
#1 "Country"
#2 "Happiness.Rank"
#3 "Happiness.Score"
#4 "Whisker.high"
#5 "Whisker.low"
#6 "Economy..GDP.per.Capita."
#7 "Family","Health..Life.Expectancy."
#8 "Freedom"
#9 "Generosity"
#10 "Trust..Government.Corruption."
#11 "Dystopia.Residual"
"""

#happy_index = pd.read_csv('2017.csv', sep=',', header=0, names=["country", "rank", 
#	"score", "high", "low", "gdp", "family", "health", "freedom", "generosity", "trust","dystopia"])

happy_index = pd.read_csv('2017_pred.csv', sep=',', header=0, names=["country", "rankval", "score", "gdp", "family", "health", "freedom", "generosity", "trust","pred"])


world_country_names = pd.read_csv('world-country-names.tsv', sep='\t', header=0)

print(happy_index.head(5))

world_country_names.name[world_country_names.name == "Russian Federation"] = "Russia"

world_country_names.name[world_country_names.name == "Taiwan, Province of China"] = "Taiwan Province of China"

world_country_names.name[world_country_names.name == "Moldova, Republic of"] = "Moldova"

world_country_names.name[world_country_names.name == "Bolivia, Plurinational State of"] = "Bolivia"

world_country_names.name[world_country_names.name == "Venezuela, Bolivarian Republic of"] = "Venezuela"

world_country_names.name[world_country_names.name == "Macedonia, the former Yugoslav Republic of"] = "Macedonia"

world_country_names.name[world_country_names.name == "Viet Nam"] ="Vietnam"

world_country_names.name[world_country_names.name == "Palestinian Territory, Occupied"] ="Palestinian Territories"

world_country_names.name[world_country_names.name == "Iran, Islamic Republic of"] = "Iran"

world_country_names.name[world_country_names.name == "Syrian Arab Republic"] = "Syria"

world_country_names.name[world_country_names.name == "Northern Cyprus"] ="North Cyprus"

world_country_names.name[world_country_names.name == "Côte d'Ivoire"] ="Ivory Coast"

world_country_names.name[world_country_names.name == "Tanzania, United Republic of"] = "Tanzania"

world_country_names.name[world_country_names.name == "Hong Kong"] = "Hong Kong S.A.R. China"

world_country_names.name[world_country_names.name == "Korea, Republic of"] = "South Korea"

world_country_names.name[world_country_names.name == "Congo, the Democratic Republic of the"] ="Congo (Brazzaville)"

#happy_merged = happy_index.merge(world_country_names, how='left',left_on='country',right_on='name')

happy_merged = happy_index.merge(world_country_names, how='inner',left_on='country',right_on='name')

name_candidates = world_country_names.name.values

orphans = happy_merged[np.isnan(happy_merged.id)].country.values
print("These countries were not matched: ")
for orphan in orphans:
	print("* ", orphan)
	for name in name_candidates:
		if orphan[0:4] in name:
			print( orphan, ", guess: ", name)

world_country_names.name[world_country_names.name == "Congo, the Democratic Republic of the"] ="Congo (Brazzaville)"



f = open('happyController.js', 'w')
f.write("app.controller(\"ctrl1\",function($scope, $log) { $scope.data = {")
for i in range(len(happy_merged)):
	f.write("'" + str(int(happy_merged.loc[i].id)) + "': { country: '" + happy_merged.loc[i].country + "', " +
	 	"rank: " + str(happy_merged.loc[i].rankval) + ", " + 	
		"happy: " + str(happy_merged.loc[i].score) + ", " + 
		"gdp: " + str(happy_merged.loc[i].gdp) + ", " +
		"family: " + str(happy_merged.loc[i].family) + ", " +
		"health: " + str(happy_merged.loc[i].health) + ", " +
		"freedom: " + str(happy_merged.loc[i].freedom) + ", " +
		"generosity: " + str(happy_merged.loc[i].generosity) + ", " +
		"trust: " + str(happy_merged.loc[i].trust) + ", " +
		"pred: " + str(happy_merged.loc[i].pred) +
		"}")
	if i!= len(happy_merged)-1:
		f.write(",")

f.write("};});")
f.close()
