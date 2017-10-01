//styles
var metricButtonTextColor = "black";
var metricButtonBackgroundColor = "#FFFFFF";
var scatterPointColor = "black";
var scatterPointSize = 6;
var selectedFillOpacity = .7;
var countryFontSize = "28px"
var countryFontOpacity = "0.9"
var countryFontHoverOpacity = "0.2"
var globeFontSize = "16px"
var mapColorStart = "#cc0000";
var mapColorEnd = "#1C6E8C";
var scatterStatus = 0;
var modeStatus = 0;
var predictionMode = false;
var buttonDefaultAlpha = ".35";
var buttonHoverAlpha = "0.8";
var buttonPressedAlpha = "1.0";

var buttonBoxHeight = 68;
var showRadarMultiple = false;

var bWidth= 50; 
var bHeight= 50; 
var bSpace= 15;
var x0= 0;
var y0= 0;


var radarWidth = 380;
var radarHeight = 380;
var radarMargin = {top: 60, right: 60, bottom: 5, left: 65},
    width = Math.min(radarWidth, window.innerWidth - 10) - radarMargin.left - radarMargin.right,
    height = Math.min(radarHeight, window.innerHeight - radarMargin.top - radarMargin.bottom - 20);

var selectedRadarIds = [];
var radarCountryId = [];
var radarColor = [];
var radarData = [];            

var radarChartOptions = {
    w: radarWidth,
    h: radarHeight,
    margin: radarMargin, //{top: 20, right: 20, bottom: 20, left: 30},
    maxValue: 1.0, //What is the value that the biggest circle will represent
    labelFactor: 1.2,     //How much farther than the radius of the outer circle should the labels be placed
    wrapWidth: 60,         //The number of pixels after which a label needs to be given a new line
    opacityArea: 0.35,     //The opacity of the area of the blob
    dotRadius: 6,          //The size of the colored circles of each blog
    opacityCircles: 0.1,   //The opacity of the circles of each blob
    strokeWidth: 2,        //The width of the stroke around each blob
    levels: 4,
    roundStrokes: true, //If true the area and stroke will follow a round path (cardinal-closed)
    color: radarColor
    };

//scatter plot scale
var mapDomainStart = 0.0;
var mapDomainEnd = 1.0;

var colorScale = d3.scale.linear()
    .domain([mapDomainStart, .2,.4,.6,.8, mapDomainEnd])
    .range([
'#d53e4f',
'#f46d43',
'#fdae61',
'#abdda4',
'#66c2a5',
'#3288bd']);

var scatterMargin = {top: 15, right: 25, bottom: 35, left: 55};
var scatterWidth = 520;// - scatterMargin.left - scatterMargin.right;
var scatterHeight = 520;// - scatterMargin.top - scatterMargin.bottom;

var xScale = d3.scale.linear()
    .domain([0,1.0])
    .range([scatterMargin.left, scatterWidth - scatterMargin.right]);

var yScale = d3.scale.linear()
    .domain([mapDomainStart,mapDomainEnd])
    .range([scatterHeight - scatterMargin.bottom, scatterMargin.top]);

var selectedId = 0;
var metrics = ['gdp', 'health', 'family', 'freedom', 'generosity', 'trust'];
var scatterButtonText = ['economic production', 'life expectancy', 'social support', 'freedom', 'generosity', 'absence of corruption'];

var trendData = [{"family": {"x": 0.03, "y": -0.16114577322807189}, "gdp": {"x": 0.03, "y": 0.13771722698313174}, "freedom": {"x": 0.03, "y": 0.19385022340720828}, "health": {"x": 0.03, "y": 0.1449102798209366}, "generosity": {"x": 0.03, "y": 0.4622831394921143}, "trust": {"x": 0.03, "y": 0.43740109364034913}},{"family": {"x": 0.99, "y": 0.79779990255437661}, "gdp": {"x": 0.99, "y": 0.94724520414798952}, "freedom": {"x": 0.99, "y": 0.77578394648940319}, "health": {"x": 0.99, "y": 0.85635149202827043}, "generosity": {"x": 0.99, "y": 0.78474449144773484}, "trust": {"x": 0.99, "y": 0.90127344573029378}}];
var app = angular.module("myapp", []);
app.directive("scoped", function() {
    return {
        restrict   : 'E',
        scope      : {
        data: '=?'
        },
    template:
    '<div class="leftDiv"><h1>World Happiness</h1><h3> by Alexander Bastidas Fry with data from the World Happiness Report</h3></div>' +
    '<div class="rightDiv">' +
        '<div class="modeSelectors"></div>' +
        '</div>',
    link: link
    };


function link(scope, element, attrs) {

function pushRadarData(x, xar) {

    if (x != 0){
        xar.push(x);
        }

    if ((showRadarMultiple == false)) {
        while (xar.length > 1) {
            xar.splice(0,1);
        }
    }
    else {
        while (xar.length > 3) {
            xar.splice(0,1);
        }
    }
}

function prepareRadarData(x) {
    radarData = [];
    radarColor = [];
    radarCountryId = [];
    var radarAxisNames = ['happiness', 'economic production', 'life expectancy', 'social support', 'freedom', 'generosity', 'absence of corruption'];

    if (x != 0 ) {
        var radarIds = selectedRadarIds.concat([x]);
    }
    else {
        var radarIds = selectedRadarIds.concat([]);
    }

    if (radarIds.length == 0) {
            radarData.push([
                {axis: radarAxisNames[0],value: 0},
                {axis: radarAxisNames[1],value: 0}, 
                {axis: radarAxisNames[2],value: 0},
                {axis: radarAxisNames[3],value: 0},
                {axis: radarAxisNames[4],value: 0},
                {axis: radarAxisNames[5],value: 0},
                {axis: radarAxisNames[6],value: 0}  
                ]);
            radarCountryId.push(0);
            radarColor.push("none");
            radarIds.push(0);
    }
    else {
    for (var i in radarIds) {
        if (predictionMode == true ) {
            radarData.push([
            {axis: radarAxisNames[0],value: scope.data[radarIds[i]].pred  },
            {axis: radarAxisNames[1],value: scope.data[radarIds[i]].gdp },
            {axis: radarAxisNames[2],value: scope.data[radarIds[i]].health },
            {axis: radarAxisNames[3],value: scope.data[radarIds[i]].family },
            {axis: radarAxisNames[4],value: scope.data[radarIds[i]].freedom },
            {axis: radarAxisNames[5],value: scope.data[radarIds[i]].generosity },
            {axis: radarAxisNames[6],value: scope.data[radarIds[i]].trust }    
            ]);
            radarCountryId.push((-radarIds[i]));
            radarColor.push("grey");
        }

        radarData.push([
            {axis: radarAxisNames[0],value: scope.data[radarIds[i]].happy  },
            {axis: radarAxisNames[1],value: scope.data[radarIds[i]].gdp },
            {axis: radarAxisNames[2],value: scope.data[radarIds[i]].health },
            {axis: radarAxisNames[3],value: scope.data[radarIds[i]].family },
            {axis: radarAxisNames[4],value: scope.data[radarIds[i]].freedom },
            {axis: radarAxisNames[5],value: scope.data[radarIds[i]].generosity },
            {axis: radarAxisNames[6],value: scope.data[radarIds[i]].trust }    
            ]);
            radarCountryId.push(radarIds[i]);
            radarColor.push(colorScale(scope.data[radarIds[i]].happy));
    }
}
    


}


function radarChart(radarData, radarCountryId, options) {
    // The Radar Chart Function
    //Written by Nadieh idBremer  VisualCinnamon.com
    
    d3.select(element[0]).select('.rightDiv').selectAll("svg").remove();
    modeButtons();

    var len = 0;
    var cfg = {};

    for(var i in options){
        if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
        }

    //If the supplied maxValue is smaller than the actual one, replace by the max in the data
    var maxValue = Math.max(cfg.maxValue, d3.max(radarData, function(i){return d3.max(i.map(function(o){return o.value;}))}));
        
    var allAxis = (radarData[0].map(function(i, j){return i.axis})), //Names of each axis
        total = allAxis.length,                 //The number of different axes
        radius = Math.min(cfg.w/2, cfg.h/2),    //Radius of the outermost circle
        Format = d3.format('%'),                //Percentage formatting
        angleSlice = Math.PI * 2 / total;       //The width in radians of each "slice"
    
    //Scale for the radius
    var rScale = d3.scale.linear()
        .range([0, radius])
        .domain([0, maxValue]);

    //Initiate the radar chart SVG
    var radarSvg = d3.select('.rightDiv').append("svg")
        .attr("class", "radarSvg")
        .attr('viewBox', '0, 0, ' + scatterWidth + ', ' + scatterHeight);

    //Append a g element        
    var g = radarSvg.append("g")
            .attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");
    
    //Filter for the outside glow
    var filter = g.append('defs').append('filter').attr('id','glow'),
        feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
        feMerge = filter.append('feMerge'),
        feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
        feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

    //Wrapper for the grid & axes
    var axisGrid = g.append("g").attr("class", "axisWrapper");
    
    //Draw the background circles
    axisGrid.selectAll(".levels")
       .data(d3.range(1,(cfg.levels+1)).reverse())
       .enter()
        //      .transition().duration(radarDuration)
        .append("circle")
        //.transition().duration(radarDuration)
        .attr("class", "gridCircle")
        .attr("r", function(d, i){return radius/cfg.levels*d;})
        .style("fill", "#CDCDCD")
        .style("stroke", "#CDCDCD")
        .style("fill-opacity", cfg.opacityCircles)
        .style("filter" , "url(#glow)");

    //Text indicating at what % each level is
    axisGrid.selectAll(".axisLabel")
       .data(d3.range(1,(cfg.levels+1)).reverse())
       .enter().append("text")
       .attr("class", "axisLabel")
       .attr("x", 4)
       .attr("y", function(d){return -d*radius/cfg.levels;})
       .attr("dy", "0.4em")
       .style("font-size", "10px")
       .attr("fill", "#737373")
       .text(function(d,i) { return Format(maxValue * d/cfg.levels); });

    //Create the straight lines radiating outward from the center
    var axis = axisGrid.selectAll(".axis")
        .data(allAxis)
        .enter()
        .append("g")
        .attr("class", "axis");
    //Append the lines
    axis.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2",
         function(d, i){return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("y2", function(d, i){return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
        .attr("class", "line")
        .style("stroke", "white")
        .style("stroke-width", "2px");

    //Append the labels at each axis
    axis.append("text")
        .attr("class", "legend")
        .style("font-size", "11px")
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em")
        .attr("x", function(d, i){ return .001 + rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
        .text(function(d){return d})
        .call(wrap, cfg.wrapWidth);
    
    var radarDuration = 700;
    //The radial line function
    var radarLine = d3.svg.line.radial()
        .interpolate("linear-closed")
                     //   .transition().duration(radarDuration)
        .radius(function(d) { return rScale(d.value); })
          //            .transition().duration(radarDuration)
        .angle(function(d,i) {  return i*angleSlice; });
        
    if(cfg.roundStrokes) {
        radarLine.interpolate("cardinal-closed");
    }
                
    var blobWrapper = g.selectAll(".radarWrapper")
        .data(radarData)
        .enter().append("g")
        .attr("class", "radarWrapper");

    //Append the backgrounds    
    blobWrapper.append("path")
        .attr("class", "radarArea")
        .attr("d", function(d,i) { return radarLine(d); })
       .style("fill", function(d, i, j) { 
            if (radarCountryId[i] > 0) {
                return radarColor[i]; 
            }
            else {
                return "none";
            } 
       })
        .style("fill-opacity", cfg.opacityArea)
        .on('mouseover', function (d,i){
            d3.selectAll(".radarArea")
                .transition().duration(100)
                .style("fill-opacity", 0.1);
            d3.select(this)
                .transition().duration(100)
                .style("fill-opacity", 0.5);    
        })
        .on('mouseout', function(){
            d3.selectAll(".radarArea")
                .transition().duration(1000)
                .style("fill-opacity", cfg.opacityArea);
        });
        
    //Create the outlines   
    blobWrapper.append("path")
        .attr("class", "radarStroke")
        .attr("d", function(d,i) { return radarLine(d); })
        .style("stroke-width", cfg.strokeWidth + "px")
        .style("fill", function(d,i,j) { return radarColor[j]; })
        .style("stroke", function(d,i) { return radarColor[i]; })
        .style("fill", "none")
        .style("filter" , "url(#glow)");    

    //Append the circles
    blobWrapper.selectAll(".radarCircle")
        .data(function(d,i) { return d; })
        .enter().append("circle")
        .style("fill", function(d,i,j) { return radarColor[j]; })
        //.transition().duration(radarDuration)
        .attr("class", "radarCircle")
        .attr("r", cfg.dotRadius)
        .attr("cx", function(d,i){  return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
        .style("fill-opacity", 0.8);
    
    //Wrapper for the invisible circles on top
    var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
        .data(radarData)
        .enter().append("g")
        .attr("class", "radarCircleWrapper");
        
    //Append a set of invisible circles on top for the mouseover pop-up
    blobCircleWrapper.selectAll(".radarInvisibleCircle")
        .data(function(d,i) { return d; })
        .enter().append("circle")
        .attr("class", "radarInvisibleCircle")
        .attr("r", cfg.dotRadius*1.5)
        .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function(d,i, j) {
            newX =  parseFloat(d3.select(this).attr('cx')) + 10;
            newY =  parseFloat(d3.select(this).attr('cy')) - 5;
            tooltip
                .attr('x', newX)
                .attr('y', newY)
        .attr("text-anchor", "right")
        .attr("dy", "0.3em")
                .text(function() { 
                    if (radarCountryId[j] > 0) {
                        return scope.data[radarCountryId[j]].country + ", " + d.axis + ": " + Format(d.value);
                        }
                    else {
                        return scope.data[(0-radarCountryId[j])].country + " prediction, " + d.axis + ": " + Format(d.value);
                        } 
                })
                .style('opacity', 1)
                .call(wrap, 115);
        })
        .on("mouseout", function(){
            tooltip.transition().duration(700)
                .style("opacity", 0);
        });
        
    //Set up the small tooltip for when you hover over a circle
    var tooltip = g.append("text")
        .attr("class", "tooltip")
        .style("opacity", 0);

    //Taken from http://bl.ocks.org/mbostock/7555321
    //Wraps SVG text    
    function wrap(text, width) {
        text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.4, // ems
            y = text.attr("y"),
            x = text.attr("x"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
            
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }}
        });}    
    
    // bug: the blob when selectedId = 0 or  = 0 returns error on hover

    radarButtons();
    }   


function modeButtons() {
    var buttonBoxWidth = 250;

    var svg = d3.select(element[0])
        .select(".rightDiv .modeSelectors")
        .append("svg")
        .attr("width", "100%")
        .attr("height", buttonBoxHeight)
        .attr('viewBox', '0, 0, ' + buttonBoxWidth + ', ' + buttonBoxHeight)
        .attr("overflow", "visible");
        //.style("align-content", "center");

    var toggleButtons = ['scatter', 'radar', 'info', 'reset'];

    var toggleText = ['scatter plot', 'radar plot', 'information', 'reset'];

    var modeButtons = svg.append("g")
        .attr("id", "modeButtons")
        .selectAll("g.modeButton")
        .data(toggleButtons)
        .enter()
        .append("g")
        .attr("class", "modeButton")
        .style("cursor", "pointer")
        .on("click", function(d, i) {
            d3.selectAll("g.modeButton")
            .attr("opacity", buttonDefaultAlpha);
            d3.select(this).attr("opacity", buttonPressedAlpha);

            if (i == 0) { // scatter
                d3.selectAll('.rightDiv .infoTextDiv').remove();
                modeStatus = 0;
                drawScatter();
                labelScatterCountry(selectedId, countryFontOpacity)
            }
            if (i == 1 ) { // radar plot
                d3.selectAll('.rightDiv .infoTextDiv').remove();
                modeStatus = 1;
                pushRadarData(selectedId, selectedRadarIds)
                prepareRadarData(0)
                radarChart(radarData, radarCountryId, radarChartOptions);
            }
            if (i == 2) { // info
                modeStatus = 2;
                d3.select('.rightDiv .scatterSvg')
                    .remove();

                d3.select('.rightDiv .radarSvg')
                    .remove();

                d3.select('.rightDiv .scatterButtons')
                    .remove();

                d3.select('.rightDiv .radarButtons')
                    .remove();

                d3.selectAll('.rightDiv .infoTextDiv').remove();

                d3.select('.rightDiv')
                    .append('div')
                    .attr('class', 'infoTextDiv')
                .text("This globe shows the happiness of countries in the world using "+
                    "Gallup World Poll data. The scatter plot shows the happiness score compared " +
                    "to one of six measured factors – economic production, social support, life expectancy, " +
                    "freedom, absence of corruption, and generosity. The radar chart shows all six of the measured factors simultaneously for the selected country. In addition by selectecing the thinking head icon a prediction of the country's happiness based off all of these factors is shown; for most countries the predicted happiness is extremely close to the measured value which indicates that happiness is strongly determined by these indicators.");
            }
            if (i == 3) { // reset
                window.location.reload();
            }
            
        })
        .on("mouseover", function(d,i) {
            d3.select("#modeText" + i)
            .style("opacity", 1);
            if (d3.select(this).attr("opacity") != buttonPressedAlpha) { 
                d3.select(this).attr("opacity", buttonHoverAlpha)};

        })
        .on("mouseout", function(){

            modeButtons.select('.buttonText')
            .style("opacity", 0);


            if (d3.select(this).attr("opacity") != buttonPressedAlpha) { 
                d3.select(this).attr("opacity", buttonDefaultAlpha)};
        })
        .attr("opacity", function(d,i) { //setting inital opactiy when page is loaded
            if (i == modeStatus) {return buttonPressedAlpha;}
            else {return buttonDefaultAlpha}});

    modeButtons.append("text")
        .attr("class","buttonText")
        .attr("id", function(d, i) {return "modeText" + i;})
        .attr("x",function(d,i) {
            return 20 + (bWidth + bSpace)*i - toggleText[i].length*3;})
        .attr("y", bHeight + 8)
        .attr("text-anchor", "bottom")
        .attr("dominant-baseline", "central")
        .attr("fill", metricButtonTextColor)
        .style("opacity", 0)
        .text(function(d, i ) {return toggleText[i];});

    modeButtons.append("svg:image")
        .attr("x", function(d,i) {return x0 + (bWidth + bSpace)*i;})
        .attr("y", y0)
        .attr('width', bWidth)
        .attr('height', bHeight)
        .attr("xlink:href", function(i) {return "imgs/" + i + ".png";});
}


function radarButtons() {
    var buttonBoxWidth = 200;

    var radarButtonSvg = d3.select(element[0])
        .select('.rightDiv')
        .append("svg")
        .attr("class", "radarButtons")
        .attr("width", "100%")
        .attr("height", buttonBoxHeight)
        .attr('viewBox', '0, 0, ' + buttonBoxWidth + ', ' + buttonBoxHeight)
        .attr("overflow", "visible");

    radarButtonImgs = ['guess', 'multiple', 'reset'];
    radarButtonsText = ['show predictions', 'show multiple', 'reset']

    var radarButtons = radarButtonSvg.append("g")
        .attr("id", "radarButtons")
        .selectAll("g.radarButton")
        .data(radarButtonImgs)
        .enter()
        .append("g")
        .attr("class", "radarButton")
        .style("cursor", "pointer")
        .on("click", function(d, i) {

            if (i == 0) {
                if (predictionMode == false) {
                    predictionMode = true;
                    d3.select(this).attr("opacity", buttonPressedAlpha);
                                        pushRadarData(0, selectedRadarIds)
                    prepareRadarData(0)
                    radarChart(radarData, radarCountryId, radarChartOptions);
                }
                else {
                    predictionMode = false;
                    d3.select(this).attr("opacity", buttonDefaultAlpha);
                                        pushRadarData(0, selectedRadarIds)
                    prepareRadarData(0)
                    radarChart(radarData, radarCountryId, radarChartOptions);
                }
            }

            if (i == 1 ) { 
                if (showRadarMultiple == false) {
                    showRadarMultiple = true;
                    d3.select(this).attr("opacity", buttonPressedAlpha);
                }
                else {
                    d3.select(this).attr("opacity", buttonDefaultAlpha);
                    showRadarMultiple = false;
                    pushRadarData(0, selectedRadarIds)
                    prepareRadarData(0)
                    radarChart(radarData, radarCountryId, radarChartOptions);
                }
            }
            if (i == 2) {
                selectedRadarIds = [];
                prepareRadarData(0)
                radarChart(radarData, radarCountryId, radarChartOptions);
            }
        })
        .on("mouseover", function(d,i) {
            d3.select("#radarText" + i)
            .style("opacity", 1);

            if (d3.select(this).attr("opacity") != buttonPressedAlpha) { 
                d3.select(this).attr("opacity", buttonHoverAlpha)};
        
        })
        .on("mouseout", function(){
            radarButtons.select('.radarText')
            .style("opacity", 0);

            if (d3.select(this).attr("opacity") != buttonPressedAlpha) { 
                d3.select(this).attr("opacity", buttonDefaultAlpha)};
        })
        .attr("opacity", function(d,i) { //setting inital opactiy when radarChart is activated
            if ((i==0) && (predictionMode == true)) {return buttonPressedAlpha;}

            if ((i==1) && (showRadarMultiple == true)) {return buttonPressedAlpha;}

            else {return buttonDefaultAlpha;}
        });


    radarButtons.append("text")
        .attr("class","radarText")
        .attr("id", function(d, i) {return "radarText" + i;})
        .attr("x",function(d,i) {
            return 20 + (bWidth + bSpace)*i - radarButtonsText[i].length*3;
        })
        .attr("y", bHeight + 8)
        .attr("text-anchor", "bottom")
        .attr("dominant-baseline", "central")
        .attr("fill", metricButtonTextColor)
        .style("opacity", 0)
        .text(function(d, i ) {return radarButtonsText[i];});

    radarButtons.append("svg:image")
        .attr("x", function(d,i) {return 0 + (bWidth + bSpace)*i;})
        .attr("y", y0)
        .attr('width', bWidth)
        .attr('height', bHeight)
        .attr("xlink:href", function(i) {return "imgs/" + i + ".png";});
}



function scatterButtons() {
    var buttonBoxWidth = 460;

    var svg = d3.select(element[0])
        .select('.rightDiv')
        .append("svg")
        .attr("class", "scatterButtons")
        .attr("width", "100%")
        .attr("height", buttonBoxHeight)
        .attr('viewBox', '0, 0, ' + buttonBoxWidth + ', ' + buttonBoxHeight)
        .attr("overflow", "visible");

        var allButtons = svg.append("g")
            .attr("id", "allButtons") 

        var buttonGroups = allButtons.selectAll("g.button")
            .data(metrics)
            .enter()
            .append("g")
            .attr("class", "button")
            .style("cursor", "pointer")
            .on("click", function(d, scatterStatus) {
                d3.selectAll("g.button")
                    .attr("opacity", buttonDefaultAlpha);
                d3.select(this).attr("opacity", buttonPressedAlpha)
                d3.select("#numberToggle").text(scatterStatus)
                updateScatter('country', countries, scatterStatus);
                })
            .on("mouseover", function(d, i) {
                d3.select("#scatterButtonText" + i)
                .style("opacity", 1);


                if (d3.select(this).attr("opacity") != buttonPressedAlpha) { 
                    d3.select(this)
                        .attr("opacity", buttonHoverAlpha)};
                    })
            .on("mouseout", function(d, i){
                d3.select("#scatterButtonText" + i)
                    .style("opacity", 0);

                if (d3.select(this).attr("opacity") != buttonPressedAlpha) { 
                    d3.select(this)
                        .attr("opacity", buttonDefaultAlpha)};
                    })
             .attr("opacity", function(d,i) { //setting inital opactiy when page is loaded
                    if (i == "0") {
                            return buttonPressedAlpha;
                            }
                    else {return buttonDefaultAlpha}             
                    });

    buttonGroups.append("svg:image")
            .attr("x", function(d,i) {return x0 + (bWidth + bSpace)*i;})
            .attr("y", y0)
            .attr('width', bWidth)
            .attr('height', bHeight)
            .attr("xlink:href", function(i) {return "imgs/" + i + ".png";});

    buttonGroups.append("text")
        .attr("class","scatterButtonTexts")
        .attr("id", function(d, i) {return "scatterButtonText" + i;})
        .attr("x",function(d,i) {
            return 25 + (bWidth + bSpace)*i - scatterButtonText[i].length*3.5;
                })
        .attr("y", bHeight + 8)
        .attr("text-anchor", "bottom")
        .attr("dominant-baseline", "central")
        .attr("fill", metricButtonTextColor)
        .style("opacity", 0)
        .text(function(d, i) {return scatterButtonText[i];});

}


function drawScatter() {

    d3.select(element[0]).select('.rightDiv').selectAll("svg").remove();
    modeButtons();

    var scatterSvg = d3.select(element[0]).select('.rightDiv')
        .append("svg")
        .attr('class', 'scatterSvg')
        .attr('viewBox', '0, 0, ' + scatterWidth + ', ' + scatterHeight)
        .attr('overflow', 'visible');

    var line = d3.svg.line()
        .x(function(d) { 
            return xScale(d.gdp.x);})
        .y(function(d) { 
            return yScale(d.gdp.y);});

    scatterSvg.append("path")
        .attr("d", line(trendData))
        .attr("class", "trend");

    scatterSvg.selectAll("circle")
        .data(countries)
        .enter()
        .append("circle")
        .style("stroke", scatterPointColor)
        .style("fill", scatterPointColor)
        .style("stroke-width", 2)
        .style("fill-opacity", .05)
        .style("stroke-opacity", .1)
        .style("cursor","pointer")
        .attr("cx", function(d) {
            return xScale((typeof scope.data[d.id] !== 'undefined')
                ? scope.data[d.id].gdp: 666);})
        .attr("cy", function(d) {
            return yScale((typeof scope.data[d.id] !== 'undefined')
                ? scope.data[d.id].happy: 666);})
        .attr("r", function(d) {
            return scatterPointSize;})
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .attr('id', function(d) {
            return "s" + d.id;
            })
        .on('click', function(d) {
            if (d.id != null) {
                selectedId = d.id;

                updateInfo(d);
                
                rotateToFocusOn(d);
                
                d3.select(element[0]).select('.rightDiv')
                .select("#s" + selectedId)
                .style("stroke", colorScale(scope.data[d.id].happy))
                .style("fill", colorScale(scope.data[d.id].happy))
                .style("fill-opacity", .5)
                .style("stroke-opacity", 1)
                .attr("r", scatterPointSize * 2);

                labelScatterCountry(selectedId,countryFontOpacity);
            }
        }); 

    function handleMouseOver(d, i) {
        scatterSvg.selectAll("#scatterTextId")
            .remove();

        d3.select(this)
            .style("fill-opacity", .5)
            .style("stroke-opacity", 1)
            .attr("r", scatterPointSize * 2)
                        .style("stroke", colorScale(scope.data[d.id].happy))
            .style("fill", colorScale(scope.data[d.id].happy));

        labelScatterCountry(d.id, countryFontHoverOpacity);
    };

    function handleMouseOut() {
        if (d3.select(this).attr("id") ==  "s" + selectedId) {
            d3.select(this)
                .transition()
                .duration(1000)
                .style("stroke", colorScale(scope.data[selectedId].happy))
                .style("fill", colorScale(scope.data[selectedId].happy))
                .style("fill-opacity", selectedFillOpacity)
                .style("stroke-opacity", 1)
                .attr("r", scatterPointSize);    
        }
        else {
            d3.select(this)
                .transition()
                .duration(1000)
                .style("stroke", scatterPointColor)
                .style("fill", scatterPointColor)
                .style("fill-opacity", .05)
                .style("stroke-opacity", .1)
                .attr("r", scatterPointSize);
        }
                scatterSvg.selectAll("#scatterTextId")
            .remove();

        labelScatterCountry(selectedId, countryFontOpacity);
    };

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(5);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(5);

    scatterSvg.append("g")
        .attr("class", "scatterAxis")
        .attr("stroke-width", 2)
        .attr("transform", "translate(" +0 + "," + (scatterHeight - scatterMargin.bottom ) + ")")
        .call(xAxis);

    scatterSvg.append("g")
        .attr("class", "scatterAxis")
        .attr("stroke-width", 2)
        .attr("transform", "translate(" + scatterMargin.left + "," + 0 + ")")
        .call(yAxis);

    scatterSvg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (scatterMargin.left*.3) + ","+ (scatterHeight/2) + ")rotate(-90)")  
        .text("Happiness")
        .attr("class", "scatterAxis");

    scatterSvg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (scatterWidth/2) + "," + (scatterHeight) + ")") 
        .attr("class", "scatterAxis")
        .text(scatterButtonText[0])
        .attr('id', function(d) {return "xAxisLabel";});


//    console.log(selectedId + ' s id scatter');


    if (selectedId != 0) {
        scatterSvg.append("circle")
        .attr('class', "featuredPoint")
        .attr('fill', "none")
        .attr("stroke", colorScale(scope.data[selectedId].happy))
        .attr("stroke-width", 2)
        .attr("cx", d3.select("#s" + selectedId).attr("cx"))
        .attr("cy", d3.select("#s" + selectedId).attr("cy"))
        .attr("r", scatterPointSize*2);

        d3.select(element[0]).select('.rightDiv')
            .select("#s" + selectedId)
            .style("stroke", colorScale(scope.data[selectedId].happy))
            .style("fill", colorScale(scope.data[selectedId].happy))
            .style("fill-opacity", selectedFillOpacity)
            .style("stroke-opacity", 1);
    }

    scatterButtons();
}


function labelScatterCountry(x, op) {
    if (x != 0) {
        d3.select('.rightDiv .scatterSvg') 
        .append("text")
            .attr({id: "scatterTextId",
                class: "scatterAxis",
                x: function() {return 58; },
                y: function() {return 25; }
                })
        .text(function() {
            return scope.data[x].country;
        })
        .attr("font-size", countryFontSize)
        .attr("opacity", op);
    }
};


    var width = 500,
        height = 550,
        projection,
        path,
        svg,
        features,
        graticule,
        mapJson = 'world-110m.json',
        countries,
        countrySet,
        zoom;

    projection = d3.geo.orthographic()
        .translate([width / 2, height / 2])
        .scale(250)
        .clipAngle(90)
        .precision(0.1)
        .rotate([0, -30]);
            
    path = d3.geo.path()
        .projection(projection);
            
    svg = d3.select(element[0]).select('.leftDiv')
        .append('svg')
        .attr('width', "98%")
        .attr('viewBox', '0, 0, ' + width + ', ' + height);

    features = svg.append('g');
            
    features.append('path')
        .datum({type: 'Sphere'})
        .attr('class', 'background')
        .attr('d', path);
            
    graticule = d3.geo.graticule();

    features.append('path')
        .datum(graticule)
        .attr('class', 'graticule')
        .attr('d', path);


    // bug in firefox if user double clicks https://github.com/d3/d3/issues/2771 
    // unable to fix, don't doubleclick on the globe in firefox!            
    zoom = d3.geo.zoom()
        .projection(projection)
        .scaleExtent([projection.scale() * 1, projection.scale() * 4])
        .on('zoom.redraw', function(){
            if ((d3.event.sourceEvent  != null)) {// && (d3.event.sourceEvent  == "[object WheelEvent]")) {
                d3.event.sourceEvent.preventDefault();
                svg.selectAll('path').attr('d',path);
                }
            });

    d3.json(mapJson, function(error, world) {
        countries = topojson.feature(world, world.objects.countries).features;
        countrySet = drawFeatureSet('country', countries);
        d3.selectAll('path').call(zoom);
        drawScatter();
        });

function drawFeatureSet(className, featureSet) {

    //color bar
    var defs = svg.append("defs");
    var linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");

    linearGradient.selectAll("stop") 
        .data( colorScale.range() )                  
        .enter().append("stop")
        .attr("offset", function(d,i) { return i/(colorScale.range().length-1); })
        .attr("stop-color", function(d) { return d; });

    var colorBarX = 15;
    var colorBarY = 520;
    var colorBarWidth = 20;
    var colorBarHeight = 150;

    svg.append("rect")
        .attr("width", colorBarHeight)
        .attr("height", colorBarWidth)
        .attr("transform", "translate(" + colorBarWidth + "," + colorBarY +")rotate(0)") 
        .style("fill", "url(#linear-gradient)");

    svg.append("text")
        //.attr("text-anchor", "middle")
        .attr("transform", "translate(" + (colorBarX + 5) +  "," + (colorBarY + 16) +")") 
        .attr("class", "colorAxis")
        .text("Happiness")
        .attr("font-size", globeFontSize);

    function handleMouseOver(d, i) {
         if (scope.data[d.id]) {
 
            if (modeStatus == 0) {
                d3.select(this).attr("opacity",  .9);         

            svg.append("text")
            .attr({id: "globeTextId",  // Create an id for text so we can select it later for removing on mouseout
                class: "globeAxis",
                x: function() {return 5; },
                y: function() {return 20; }
                })
            .text(function() {
                if (scope.data[d.id]) {
                    return scope.data[d.id].country;
                    }
                })
            .attr("font-size", countryFontSize)
            .attr("opacity", countryFontHoverOpacity);
            
            d3.select('.rightDiv .scatterSvg').selectAll("#scatterTextId")
            .remove();

            labelScatterCountry(d.id, countryFontHoverOpacity);

                d3.select(element[0]).select('.rightDiv')
                    .select("#s" + d.id)
                    //.moveToFront()
                    .style("stroke", colorScale(scope.data[d.id].happy))
                    .style("fill", colorScale(scope.data[d.id].happy))
                    .style("fill-opacity", selectedFillOpacity)
                    .style("stroke-opacity", 1)
                    .attr("r", scatterPointSize * 2);
                }

            if (modeStatus == 1) {
                pushRadarData(0, selectedRadarIds)
                prepareRadarData(d.id)

                radarChart(radarData, radarCountryId, radarChartOptions);
            }
        }
    };

    function handleMouseOut(d) {
        d3.select(this).attr("opacity",  1.0); 
        svg.selectAll("#globeTextId")
            .remove();
          
            
        d3.select('.rightDiv .scatterSvg').selectAll("#scatterTextId")
            .remove();

            labelScatterCountry(selectedId, countryFontOpacity);

        if (modeStatus == 1) {
            pushRadarData(0, selectedRadarIds)
            prepareRadarData(0)
            radarChart(radarData, radarCountryId, radarChartOptions);
            }


        if (d.id != selectedId) {
            d3.select(element[0]).select('.rightDiv')
                .select("#s" + d.id)
                .transition()
                .duration(1000)
                .style("fill", scatterPointColor)
                .style("fill-opacity", .05)
                .style("stroke-opacity", .1)
                .attr("r", scatterPointSize);
        }

        if (d.id == selectedId) {
            d3.select(element[0]).select('.rightDiv')
                .select("#s" + d.id)
                .transition()
                .duration(1000)
                .style("fill-opacity", selectedFillOpacity)
                .style("stroke-opacity", 1)
                .attr("r", scatterPointSize);
        }
    };

    var set  = features.selectAll('.' + className)
        .data(featureSet)
        .enter()
        .append('g')
        .attr('class', className)
        .attr('data-name', function(d) {return d.properties.name;})
        .attr('data-id', function(d) {return d.id;});
                
    set.append('path')
        .attr('class', 'land')
        .attr('d', path);
                
    set.append('path')
        .attr('class', 'overlay')
        .attr('d', path)
        .attr('style', function(d) {
            if (scope.data[d.id]) {
                return "fill: " +  colorScale(scope.data[d.id].happy);
            }
            else {
                return "fill: " +  'grey';
            }
        })
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on('click', function(d) {
            if (typeof scope.data[d.id] !== 'undefined') {
                selectedId = d.id; 
                updateInfo(d);
                if (modeStatus == 1) {
                    //prepareRadarData(0);
                    pushRadarData(d.id, selectedRadarIds)
                    prepareRadarData(0)
                    radarChart(radarData, radarCountryId, radarChartOptions);
                }
                rotateToFocusOn(d);
            }
        }); 
    
    return set;
}

function updateScatter(c, cx, i) {
    // update the scatter plot's points and axis after a button selector is clicked
    var scatterSvg = d3.select(element[0]).select('.rightDiv .scatterSvg');

    if (selectedId != 0) {
        scatterSvg.selectAll(".featuredPoint")
        .remove();

    var selectedIdX = function() {
                switch(i) {
                case 0:
                    return xScale((selectedId != 0 ? scope.data[selectedId].gdp : 0));
                case 1:
                    return xScale((selectedId != 0 ? scope.data[selectedId].health : 0));
                case 2:  
                    return xScale((selectedId != 0 ? scope.data[selectedId].family : 0));
                case 3:
                    return xScale((selectedId != 0 ? scope.data[selectedId].freedom : 0)); 
                case 4: 
                    return xScale((selectedId != 0 ? scope.data[selectedId].generosity : 0)); 
                case 5: 
                    return xScale((selectedId != 0 ? scope.data[selectedId].trust : 0));
                    }};
    }

    scatterSvg.selectAll("circle")
        .transition()
        .duration(1000)
        .attr("cx", function(d) {
            switch(i) {
                case 0:
                    return xScale((typeof scope.data[d.id] !== 'undefined' ? scope.data[d.id].gdp : 0));
                case 1:
                    return xScale((typeof scope.data[d.id] !== 'undefined' ? scope.data[d.id].health : 0));
                case 2:  
                    return xScale((typeof scope.data[d.id] !== 'undefined' ? scope.data[d.id].family : 0));
                case 3:
                    return xScale((typeof scope.data[d.id] !== 'undefined' ? scope.data[d.id].freedom : 0)); 
                case 4: 
                    return xScale((typeof scope.data[d.id] !== 'undefined' ? scope.data[d.id].generosity : 0)); 
                case 5: 
                    return xScale((typeof scope.data[d.id] !== 'undefined' ? scope.data[d.id].trust : 0));
                    }
                })

    if (selectedId != 0) {
    scatterSvg.append("circle")
        .attr('class', "featuredPoint")
        .attr('fill', "none")
        .attr("stroke", colorScale(scope.data[selectedId].happy))
        .attr("stroke-width", 2)
        .attr("cx", d3.select("#s" + selectedId).attr("cx"))
        .attr("cy", d3.select("#s" + selectedId).attr("cy"))
        .attr("r", scatterPointSize*2);

    scatterSvg.select(".featuredPoint")
        .transition()
        .duration(1050)
        .attr("cx", selectedIdX)
        .attr("cy", d3.select("#s" + selectedId).attr("cy"))
    }

    var line = d3.svg.line()
        .x(function(d) { 
            switch(i){
                case 0:
                    return xScale(d.gdp.x);
                case 1:  
                    return xScale(d.health.x);
                case 2:  
                    return xScale(d.family.x);
                case 3:  
                    return xScale(d.freedom.x);
                case 4:  
                    return xScale(d.generosity.x);
                case 5:  
                    return xScale(d.trust.x);
                } 
            })
        .y(function(d) { 
            switch(i){
                case 0:
                    return yScale(d.gdp.y);
                case 1:  
                    return yScale(d.health.y);
                case 2:  
                    return yScale(d.family.y);
                case 3:  
                    return yScale(d.freedom.y);
                case 4:  
                    return yScale(d.generosity.y);
                case 5:  
                    return yScale(d.trust.y);
                }
            });

    scatterSvg.select("path")
        .transition()
        .duration(1000)
        .attr("d", line(trendData))

    var get_xLabel = function() { return scatterButtonText[i] };
            
    scatterSvg.select("#xAxisLabel")
        .text(get_xLabel());
    }

 
function updateInfo(x) {
// update infoTextDiv and rightDiv plot after clicking the map or point

    if (modeStatus == 2) {
    var countryName = (scope.data[x.id].country) ? scope.data[x.id].country : 'Unknown';

    d3.select('.rightDiv .infoTextDiv')
        .selectAll("p")
        .remove();

    d3.select('.rightDiv .infoTextDiv')
        .select('svg')
        .remove();

    d3.select('.rightDiv .infoTextDiv')
        .append('svg')
        .attr("width", "100%")
        .attr("viewBox", "0 0 100 10")
        .append("line")
        .attr("x1", 15)
        .attr("x2", 85)
        .attr("y1", 5)
        .attr("y2", 5)
        .attr("stroke-width", ".4")
        .attr("stroke","black");

    var newText = ''

    if (scope.data[x.id].rank <= 39) {
        newText += countryName + " has a happiness of " + (scope.data[x.id].happy).toFixed(2) + " and is in the top quartile of happy countries.";
    }
    if (scope.data[x.id].rank <= 78 && scope.data[x.id].rank > 39) {
        newText += countryName + " has a happiness of " + (scope.data[x.id].happy).toFixed(2) + " and is in the upper middle quartile of most happy countries.";
    }  
    if (scope.data[x.id].rank <= 117 && scope.data[x.id].rank > 78) {
        newText += countryName + " has a happiness of " + (scope.data[x.id].happy).toFixed(2) + " and is in the bottom middle of happy countries.";
    }  
    if (scope.data[x.id].rank > 117) {
        newText += countryName + " has a happiness of " + (scope.data[x.id].happy).toFixed(2) + " and is in the bottom quartile of happy countries.";
    }

    if (scope.data[x.id].happy - scope.data[x.id].pred >= .04) { //the mean absolute error is ~.2 (non normalized), and .037 normalized 
        newText += " It has a happiness that is greater than the prediction (" + (scope.data[x.id].pred).toFixed(2) + ") given all the measures here.";
    }
    else if (scope.data[x.id].happy - scope.data[x.id].pred <= -.04) { 
        newText +=" It has a happiness that is less than the prediction (" + (scope.data[x.id].pred).toFixed(2) + ") given all the measures here.";
    }  
    else {
        newText +=" It has a happiness that is about equal to the prediction (" + (scope.data[x.id].pred).toFixed(2) + ") given all the measures here.";
    }  

    d3.select('.rightDiv .infoTextDiv')
        .append("p")
        .text( function (d) { return newText;});
    }

    if (modeStatus == 0) {
        d3.select('.rightDiv .scatterSvg') 
            .selectAll(".featuredPoint")
            .remove();

        d3.select('.rightDiv .scatterSvg') 
            .selectAll("circle")
            .attr("fill", scatterPointColor)
            .style("fill-opacity", .05)
            .style("stroke-opacity", .1)
            .transition()
            .duration(2000)
            .attr("r", scatterPointSize);
 
        d3.select('.rightDiv .scatterSvg')
            .select("#s" + x.id)
            //.moveToFront()
            .style("stroke", colorScale(scope.data[x.id].happy))
            .style("fill", colorScale(scope.data[x.id].happy))
            .style("fill-opacity", selectedFillOpacity)
            .style("stroke-opacity", 1)
            .attr("r", scatterPointSize * 2);

        d3.select('.rightDiv .scatterSvg') 
            .append("circle")
            .attr('class', "featuredPoint")
            .attr('fill', "none")
            .attr("stroke", colorScale(scope.data[x.id].happy))
            .attr("stroke-width", 2)
            .attr("cx", d3.select("#s" + x.id).attr("cx"))
            .attr("cy", d3.select("#s" + x.id).attr("cy"))
            .attr("r", scatterPointSize*2);
    }
}

function rotateToFocusOn(x) {        
    var coords = d3.geo.centroid(x);
    coords[0] = -coords[0];
    coords[1] = -coords[1];
              
    d3.transition()
        .duration(1000)
        .tween('rotate', function() { 
            var r = d3.interpolate(projection.rotate(), coords);
            return function(t) {
                projection.rotate(r(t));
                svg.selectAll('path').attr('d', path);
            };
        })
    .transition();
}

}});

app.run();