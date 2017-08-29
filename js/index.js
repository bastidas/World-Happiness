//styles
var metricButtonTextColor = "black";
var metricButtonBackgroundColor = "#FFFFFF";
var scatterPointColor = "black";
var scatterPointSize = 6;
var ScatterCountryFontSize = "28px"
var ScatterCountryFontOpacity = "0.5"
var globeFontSize = "28px"
//var mapColorStart = "#EE55AA";
var mapColorStart = "#76CC7C";
var mapColorEnd = "#1C6E8C";


var buttonDefaultAlpha = ".35";
var buttonHoverAlpha = "0.8";
var buttonPressedAlpha = "1.0";

var app = angular.module("myapp", []);

var radarColor = [];

var margin = {top: 50, right: 50, bottom: 50, left: 50},
                width = Math.min(400, window.innerWidth - 10) - margin.left - margin.right,
                height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

var radarColor = [];
var radarData = [];            
var radarChartOptions = {
              w: width,
              h: height,
              margin: margin,
              maxValue: 1.0,
              levels: 2,
              roundStrokes: true,
              color: radarColor
            };


app.directive("globe", function() {
    return {
        restrict   : 'E',
        scope      : {
            data: '=?'
        },
    template:
    '<div class="globe-wrapper">' +
    '<div class="globe"></div></div>' +
    '<div class="info"><div class="infoTextDiv"></div>' +
    '<div class="scatterDiv"></div>' +
    '</div>',
    link: link
    };


function link(scope, element, attrs) {
    //scale
    var mapDomainStart = 2;
    var mapDomainEnd = 7.5;
    var colorScale = d3.scale.linear()
        .domain([mapDomainStart,mapDomainEnd])
        .range([mapColorStart,mapColorEnd]);
    //scatter plot sizing
    var scatterPadding = 30;
    var scatterHeight = 500;
    var scatterWidth = 500;
    var scatterStatus = 0;
    var xScale = d3.scale.linear()
        .domain([0,1.0])
        .range([scatterPadding, scatterWidth - scatterPadding]);
    var yScale = d3.scale.linear()
        .domain([mapDomainStart,mapDomainEnd])
        .range([scatterHeight, scatterPadding]);

    var selectedId = 0;
    var metrics = ['family', 'gdp', 'freedom', 'health', 'generosity', 'trust'];
    var trendData =[{"family": {"x": 0.03, "y": 1.9555924322274807}, "gdp": {"x": 0.03, "y": 3.3233203762355301}, "freedom": {"x": 0.03, "y": 3.6808981935036487}, "health": {"x": 0.03, "y": 3.4024557129400494}, "generosity": {"x": 0.03, "y": 5.0468818250755891}, "trust": {"x": 0.03, "y": 4.8173577812963897}},{"family": {"x": 0.99, "y": 6.5625635066118964}, "gdp": {"x": 0.99, "y": 7.257318829981636}, "freedom": {"x": 0.99, "y": 6.3962441297648454}, "health": {"x": 0.99, "y": 6.8082088003907977}, "generosity": {"x": 0.99, "y": 6.1356300637099945}, "trust": {"x": 0.99, "y": 6.9810854147248236}}];

function radarChart(id, x, radarData, options) {
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer  VisualCinnamon.com ///////////////////

    var data = radarData;

    data.push([
                        {axis:"happy",value: .1*scope.data[x.id].happy },
                        {axis:"gdp",value: scope.data[x.id].gdp },
                        {axis:"health",value: scope.data[x.id].health },
                        {axis:"trust",value: scope.data[x.id].trust },
                        {axis:"freedom",value: scope.data[x.id].freedom },
                        {axis:"generosity",value: scope.data[x.id].generosity },
                        {axis:"family",value: scope.data[x.id].family }     
                      ])

    var cfg = {
     w: 300,                //Width of the circle
     h: 300,                //Height of the circle
     margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
     levels: 3,             //How many levels or inner circles should there be drawn
     maxValue: 0,           //What is the value that the biggest circle will represent
     labelFactor: 1.25,     //How much farther than the radius of the outer circle should the labels be placed
     wrapWidth: 60,         //The number of pixels after which a label needs to be given a new line
     opacityArea: 0.35,     //The opacity of the area of the blob
     dotRadius: 4,          //The size of the colored circles of each blog
     opacityCircles: 0.1,   //The opacity of the circles of each blob
     strokeWidth: 2,        //The width of the stroke around each blob
     roundStrokes: false,   //If true the area and stroke will follow a round path (cardinal-closed)
     color: d3.scale.category10()   //Color function
    };
    
    //Put all of the options into a variable called cfg
    if('undefined' !== typeof options){
      for(var i in options){
        if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
      }//for i
    }//if

    cfg.color.push(colorScale(scope.data[x.id].happy));

    //If the supplied maxValue is smaller than the actual one, replace by the max in the data
    var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
        
    var allAxis = (data[0].map(function(i, j){return i.axis})), //Names of each axis
        total = allAxis.length,                 //The number of different axes
        radius = Math.min(cfg.w/2, cfg.h/2),    //Radius of the outermost circle
        Format = d3.format('%'),                //Percentage formatting
        angleSlice = Math.PI * 2 / total;       //The width in radians of each "slice"
    
    //Scale for the radius
    var rScale = d3.scale.linear()
        .range([0, radius])
        .domain([0, maxValue]);
        
    //Remove whatever chart with the same id/class was present before
    d3.select(id).select("svg").remove();
    
    //Initiate the radar chart SVG
    var svg = d3.select(id).append("svg")
            .attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
            .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
            .attr("class", "radar"+id);
    //Append a g element        
    var g = svg.append("g")
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
        .append("circle")
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
        .attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
        .attr("class", "line")
        .style("stroke", "white")
        .style("stroke-width", "2px");

    //Append the labels at each axis
    axis.append("text")
        .attr("class", "legend")
        .style("font-size", "11px")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
        .text(function(d){return d})
        .call(wrap, cfg.wrapWidth);
    
    //The radial line function
    var radarLine = d3.svg.line.radial()
        .interpolate("linear-closed")
        .radius(function(d) { return rScale(d.value); })
        .angle(function(d,i) {  return i*angleSlice; });
        
    if(cfg.roundStrokes) {
        radarLine.interpolate("cardinal-closed");
    }
                
    //Create a wrapper for the blobs    
    var blobWrapper = g.selectAll(".radarWrapper")
    //var blobWrapper = g.select(".radarWrapper")
        .data(data)
        .enter().append("g")
        .attr("class", "radarWrapper");
        //.attr("id", x.id);

    //Append the backgrounds    
    blobWrapper
        .append("path")
        .attr("class", "radarArea")
        .attr("d", function(d,i) { return radarLine(d); })
        .style("fill", function(d,i) {
            return cfg.color[i]; })
        .style("fill-opacity", cfg.opacityArea)
        .on('mouseover', function (d,i){
            //Dim all blobs
            d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", 0.1); 
            //Bring back the hovered over blob
            d3.select(this)
                .transition().duration(200)
                .style("fill-opacity", 0.7);    
        })
        .on('mouseout', function(){
            //Bring back all blobs
            d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", cfg.opacityArea);
        });
        
    //Create the outlines   
    blobWrapper.append("path")
        .attr("class", "radarStroke")
        .attr("d", function(d,i) { return radarLine(d); })
        .style("stroke-width", cfg.strokeWidth + "px")
        .style("stroke", function(d,i) { return cfg.color[i]; })
        .style("fill", "none")
        .style("filter" , "url(#glow)");        
    
    //Append the circles
    blobWrapper.selectAll(".radarCircle")
        .data(function(d,i) { return d; })
        .enter().append("circle")
        .attr("class", "radarCircle")
        .attr("r", cfg.dotRadius)
        .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
        .style("fill", function(d,i,j) { return cfg.color[j]; })
        .style("fill-opacity", 0.8);
    
    //Wrapper for the invisible circles on top
    var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
        .data(data)
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
        .on("mouseover", function(d,i) {
            newX =  parseFloat(d3.select(this).attr('cx')) - 10;
            newY =  parseFloat(d3.select(this).attr('cy')) - 10;
                    
            tooltip
                .attr('x', newX)
                .attr('y', newY)
                .text(Format(d.value))
                .transition().duration(200)
                .style('opacity', 1);
        })
        .on("mouseout", function(){
            tooltip.transition().duration(200)
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
          }
        }
      });
    }
    
}   

    function buttonSelector() {

        var buttonBoxWidth = 450;
        var buttonBoxHeight = 92;

        var svg = d3.select(element[0])
            .select(".globe")
            .append("svg")
            .attr("width", buttonBoxWidth)
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
            .on("mouseover", function() {
                if (d3.select(this).attr("opacity") != buttonPressedAlpha) { 
                    d3.select(this)
                        .attr("opacity", buttonHoverAlpha)};
                    })
            .on("mouseout", function(){
                if (d3.select(this).attr("opacity") != buttonPressedAlpha) { 
                    d3.select(this)
                        .attr("opacity", buttonDefaultAlpha)};
                    })
             .attr("opacity", function(d,i) { //setting inital opactiy when page is loaded
                    if (i == "1") {
                            return buttonPressedAlpha;
                            }
                    else {return buttonDefaultAlpha}             
                    });

        var bWidth= 75; 
        var bHeight= 65; 
        var bSpace= 10;
        var x0= -15;
        var y0= 10;

        buttonGroups.append("svg:image")
            .attr("x", function(d,i) {return x0 + (bWidth + bSpace)*i;})
            .attr("y", y0)
            .attr('width', 60)
            .attr('height', 60)
            .attr("xlink:href", function(i) {return "imgs/" + i + ".png";});

        buttonGroups.append("text")
            .attr("class","buttonText")
            .attr("x",function(d,i) {
                return 10 + (bWidth + bSpace)*i - d.length*3;
                    })
                .attr("y",y0 + bHeight/.95)
                .attr("text-anchor", "bottom")
                .attr("dominant-baseline", "central")
                //.attr("opactiy", buttonDefaultAlpha)
                .attr("fill", metricButtonTextColor)
                .text(function(d) {return d;})
        }

        
    var width = 500,
        height = 550, //width*1.05, 
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
            
    svg = d3.select(element[0]).select('.globe')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
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
            
    zoom = d3.geo.zoom()
        .projection(projection)
        .scaleExtent([projection.scale() * 1.0, projection.scale() * 4])
        .on('zoom.redraw', function(){
            if (d3.event.sourceEvent  != null) {
                d3.event.sourceEvent.preventDefault();
                svg.selectAll('path').attr('d',path);
                }
            });
            
    d3.json(mapJson, function(error, world) {
        countries = topojson.feature(world, world.objects.countries).features;
        countrySet = drawFeatureSet('country', countries);
        scatterPlot = drawScatter('country', countries, 1);
        d3.selectAll('path').call(zoom);
        });

    buttonSelector();

    function drawScatter(className, featureSet) {

        var scatter_svg = d3.select(element[0]).select('.scatterDiv')
            .append("svg")
            .attr("height", '550px')
            .attr("width", '100%')
            .attr('viewBox', '0, 0, ' + scatterWidth + ', ' + scatterHeight);
                        //.attr("overflow", "visible");

        var line = d3.svg.line()
            .x(function(d) { 
                return xScale(d.gdp.x); 
                })
            .y(function(d) { 
                return yScale(d.gdp.y); 
                });

        scatter_svg.append("path")
            .attr("d", line(trendData))
            .attr("class", "trend");

        scatter_svg.selectAll("circle")
            .data(countries)
            .enter()
            .append("circle")
            .attr("fill", scatterPointColor)
            .style("cursor","pointer")
            .attr("cx", function(d) {
                //
                return xScale((typeof scope.data[d.id] !== 'undefined')
                    ? scope.data[d.id].gdp
                    : 666);
                })
            .attr("cy", function(d) {
                return yScale((typeof scope.data[d.id] !== 'undefined')
                    ? scope.data[d.id].happy
                    : 666);
                })
            .attr("r", function(d) {
                return scatterPointSize;
                })
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .attr('id', function(d) {
                return "s" + d.id;
                })
            .on('click', function(d) {
                if (d.id != null) {
                    d3.select(this).attr({fill: colorScale(scope.data[d.id].happy), r: scatterPointSize * 2});
                    selectedId = d.id; 
                    updateInfo(d);
                    radarChart(".radarChart", d, radarData, radarChartOptions);
                    rotateToFocusOn(d);
                    }
                }); 

        function handleMouseOver(d, i) {
            d3.select(this).attr({fill: colorScale(scope.data[d.id].happy), r: scatterPointSize * 2});
            scatter_svg.append("text")
            .attr({id: "scatterTextId",  // Create an id for text so we can select it later for removing on mouseout
                class: "scatterAxis",
                x: function() {return scatterPadding + 10; },
                y: function() {return scatterPadding*1.5; }
                })
            .text(function() {
                return scope.data[d.id].country;
                })
            .attr("font-size", ScatterCountryFontSize)
            .attr("opacity", ScatterCountryFontOpacity);
            }

        function handleMouseOut() {
            if (d3.select(this).attr("id") !=  "s" + selectedId) {
                d3.select(this).attr( {fill: scatterPointColor})
                }
            d3.select(this).attr( {r: scatterPointSize })
            scatter_svg.selectAll("#scatterTextId")
            .remove();
            };

        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(5);

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(5);
            //.attr("overflow", "visible");

        scatter_svg.append("g")
            .attr("class", "scatterAxis")
            .attr("transform", "translate(0," + (scatterHeight - scatterPadding) + ")")
            .call(xAxis);

        scatter_svg.append("g")
            .attr("class", "scatterAxis")
            .attr("transform", "translate(" + scatterPadding + "," + (-scatterPadding) + ")")
            .call(yAxis);
            //.attr("overflow", "visible");

        scatter_svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (scatterPadding*.2) + ","+ (scatterHeight/2) + ")rotate(-90)")  
            .text("Happy Index")
            .attr("class", "scatterAxis");
            //.attr("overflow", "visible");

        scatter_svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (scatterWidth/2) + "," + (scatterHeight) + ")") 
            .attr("class", "scatterAxis")
            .text("GDP")
            .attr('id', function(d) {return "xAxisLabel";});
    }

    function drawFeatureSet(className, featureSet) {

    //color bar
    var defs = svg.append("defs");
    var linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");

    linearGradient.selectAll("stop") 
        .data(colorScale.range())                  
        .enter().append("stop")
        .attr("offset", function(d,i) { return i/(colorScale.range().length - 1); })
        .attr("stop-color", function(d) { return d; });

    var colorBarX = 15;
    var colorBarY = 530;
    var colorBarWidth = 15;
    var colorBarHeight = 150;

    svg.append("rect")
        .attr("width", colorBarHeight)
        .attr("height", colorBarWidth)
        .attr("transform", "translate(" + colorBarWidth + "," + colorBarY +")rotate(0)") 
        .style("fill", "url(#linear-gradient)");

    var colorScaleText = d3.scale.linear()
        .domain([mapDomainStart,mapDomainEnd])
        .range(["0",colorBarHeight]);

    var colorAxis = d3.svg.axis()
        .scale(colorScaleText)
        .orient("left")
        .ticks(5)
        .innerTickSize(colorBarWidth)
        .outerTickSize(0);

    svg.append("g")
        .attr("class", "colorAxis")
        .attr("transform", "translate(" + colorBarX + "," + colorBarY +")rotate(-90)")
        .call(colorAxis)
        .selectAll("text")
        .attr("transform", "translate(" + 8 + "," + colorBarX +")rotate(90)")
        .style("text-anchor", "start");

    //end color bar
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + 80 + "," + 35 +")") 
        .attr("class", "colorAxis")
        .text("Happy Index")
        .attr("font-size", globeFontSize)
        .attr('id', function(d) {return "colorLabel";});

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
            .on('click', function(d) {
                if (typeof scope.data[d.id] !== 'undefined') {
                    selectedId = d.id; 
                    updateInfo(d);
                    radarChart(".radarChart", d, radarData, radarChartOptions);
                    rotateToFocusOn(d);
                    }
                }) 
                return set;
    }

    function updateScatter(c, cx, i) {
        
    var scatter_svg = d3.select(element[0]).select('.scatterDiv');

    scatter_svg.selectAll("circle")
        .transition()
        .duration(1000)
        .attr("cx", function(d) {
            switch(i) {
                case 0:
                    return xScale((typeof scope.data[d.id] !== 'undefined' ? scope.data[d.id].family : 0));
                case 1:
                    return xScale((typeof scope.data[d.id] !== 'undefined' ? scope.data[d.id].gdp : 0));
                case 2:  
                    return xScale((typeof scope.data[d.id] !== 'undefined' ? scope.data[d.id].freedom : 0));
                case 3:
                    return xScale((typeof scope.data[d.id] !== 'undefined' ? scope.data[d.id].health : 0)); 
                case 4: 
                    return xScale((typeof scope.data[d.id] !== 'undefined' ? scope.data[d.id].generosity : 0)); 
                case 5: 
                    return xScale((typeof scope.data[d.id] !== 'undefined' ? scope.data[d.id].trust : 0));
                    }
                })

    var line = d3.svg.line()
        .x(function(d) { 
            switch(i){
                case 0:
                    return xScale(d.family.x);
                case 1:  
                    return xScale(d.gdp.x);
                case 2:  
                    return xScale(d.freedom.x);
                case 3:  
                    return xScale(d.health.x);
                case 4:  
                    return xScale(d.generosity.x);
                case 5:  
                    return xScale(d.trust.x);
                } 
            })
        .y(function(d) { 
            switch(i){
                case 0:
                    return yScale(d.family.y);
                case 1:  
                    return yScale(d.gdp.y);
                case 2:  
                    return yScale(d.freedom.y);
                case 3:  
                    return yScale(d.health.y);
                case 4:  
                    return yScale(d.generosity.y);
                case 5:  
                    return yScale(d.trust.y);
                }
            });

    scatter_svg.select("path")
        .transition()
        .duration(1000)
        .attr("d", line(trendData))

    var get_xLabel = function() { return metrics[i] };
            
    d3.select(element[0]).select('.scatterDiv')
        .select("#xAxisLabel")
        .text(get_xLabel());
    }

 
    function updateInfo(x) {
    var countryName = (scope.data[x.id].country) ? scope.data[x.id].country : 'Unknown';

    d3.select(element[0])
        .select('.infoTextDiv')
        .text( function (d) {
             if (scope.data[x.id].rank <= 39) {
                return countryName + " is in the top quartile of happy countries.";
                 }
            if (scope.data[x.id].rank <= 78 && scope.data[x.id].rank > 39) {
                return countryName + " is in the upper middle quartile of most happy countries.";
                 }  
            if (scope.data[x.id].rank <= 117 && scope.data[x.id].rank > 78) {
                return countryName + " is in the bottom middle of happy countries.";
                 }  
            if (scope.data[x.id].rank > 117) {
                return countryName + " is in the bottom quartile of happy countries.";
                 }


        })

    d3.select(element[0])
        .select('.infoTextDiv')
        .append('p')
        .text( function (d) {
            if (scope.data[x.id].happy - scope.data[x.id].pred >= .1) { //the mean absolute error is .2
            // if (delta >= .2) {
                return "It has a happiness that is greater than would be predicted given all the measures here.";
                 }
            if (scope.data[x.id].happy - scope.data[x.id].pred >= -.1) { //the mean absolute error is .2
            // if (delta >= .2) {
                return "It has a happiness that is less than would be predicted given all the measures here.";
                 }
            // if (scope.data[x.id].rank <= 78 && scope.data[x.id].rank > 39) {
            //     return countryName + " is in the upper middle quartile of most happy countries.";
            //      }  
            // if (scope.data[x.id].rank <= 117 && scope.data[x.id].rank > 78) {
            //     return countryName + " is in the bottom middle of happy countries.";
            //      }  
            // if (scope.data[x.id].rank > 117) {
            //     return countryName + " is in the bottom quartile of happy countries.";
            //      }  

        })

    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
            });
        };
                    
        d3.select(element[0]).select('.scatterDiv')
             .selectAll("circle")
             .attr("fill", scatterPointColor)
             .transition()
             .duration(2000)
             .attr("r", function(d) {
                 return scatterPointSize;
                 });
 
        d3.select(element[0]).select('.scatterDiv')
            .select("#s" + x.id)
            .moveToFront()
            .attr("fill", function(d) { 
                return colorScale(scope.data[x.id].happy);
                })    
            .attr("r", function(d) {
                return scatterPointSize*2;
                });
        }

    function rotateToFocusOn(x) {        
    var coords = d3.geo.centroid(x);
    coords[0] = -coords[0];
    coords[1] = -coords[1];
                
    d3.transition()
        .duration(2000)
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
