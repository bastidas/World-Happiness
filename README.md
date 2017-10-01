# World-Happiness

An interactive visual exploration of the state of global happiness including six factors – economic production, social support, life expectancy, freedom, absence of corruption, and generosity  – that strongly contribute to making life evaluations higher.

 * [See the live website here.](http://www.alexanderbastidasfry.com/happy)

 * To recreate the data analysis run all of learn.ipynb in a python 3.0 ipython notebook. This will load data from 2017.csv then create linear_trend.json (however, note that linear_trend is not loaded by the final webpage, it needs to be pasted into index.js as the trendData variable) and 2017_pred.csv as new files. Then run organize_data.py which will load 2016_pred.csv and world-country-names.tsv and then create happyController.js which is the Agile data controller.  
 
 * To serve the page locally you could use the command 'http-server' in this repo's directory. 
