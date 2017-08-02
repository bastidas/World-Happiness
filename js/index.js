//styles
var metricButtonTextColor = "black";
var metricButtonBackgroundColor = "#FFFFFF";
var scatterPointColor = "black";
var scatterPointSize = 6;
var ScatterCountryFontSize = "28px"
var ScatterCountryFontOpacity = "0.5"
var globeFontSize = "28px"
var mapColorStart = "#76CC7C";
var mapColorEnd = "#1C6E8C";

var buttonDefaultAlpha = ".25";
var buttonHoverAlpha = "0.9";
var buttonPressedAlpha = "1.0";

var app = angular.module("myapp", []);

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
    var mapColorStart = "#76CC7C";//"#2c7bb6"
    var mapColorEnd = "#1C6E8C";
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
        
        // var background= svg.append("rect")
        //     .attr("id", "backgroundRect")
        //     .attr("width", "100%")
        //     .attr("height", "100%")
        //     .attr("x", 0)
        //     .attr("y", 0)
        //     .attr("fill", metricButtonBackgroundColor)
        //     .attr("postion", "relative")
        //     .attr("overflow", "visible");

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
            .attr("x",function(d,i) {return x0 + (bWidth + bSpace)*i;})
            .attr("y",y0)
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
        mapJson = '/world-110m.json',
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
