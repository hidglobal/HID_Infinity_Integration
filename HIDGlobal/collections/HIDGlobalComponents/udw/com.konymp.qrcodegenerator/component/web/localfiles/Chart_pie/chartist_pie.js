/**
 * Created by Team Kony.
 * Copyright (c) 2017 Kony Inc. All rights reserved.
 */
konymp = {};
konymp.charts = konymp.charts || {};

konymp.charts.pie = function(){
  	
};

konymp.charts.pie.prototype.createClass = function(name, rules) {
  	var style = document.createElement('style');
    style.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(style);
    if(!(style.sheet||{}).insertRule) 
        (style.styleSheet || style.sheet).addRule(name, rules);
    else
        style.sheet.insertRule(name+"{"+rules+"}",0);
};

konymp.charts.pie.prototype.createPieChart = function(id,labels,series,options,opacity){
  var chart = new Chartist.Pie(id, {
    labels:labels,
    series: series[0]

  }, options, [
    ['screen and (min-width: 640px)', {
      chartPadding: 60,
      labelOffset: 40,
      labelDirection: 'implode',
      labelInterpolationFnc: function(value) {
        return value;
      }
    }],
    ['screen and (min-width: 1024px)', {
      labelOffset: 40,
      chartPadding: 20
    }]
  ]);

  chart.on('draw', function (data) {
	if(data.type==='label')
      {
    	var wid = document.getElementById('pie1').offsetHeight;
        
        data.element.attr({
        style: 'font-size:'+parseInt(0.07*wid)+'px;'
      });
      }
    
    if (data.type === 'slice') {     
      var pathLength = data.element._node.getTotalLength();
    }
  });
  window.chartCreated = chart;
}; 

konymp.charts.pie.prototype.UI_createpieCharts = function(lbls,srs,legends)
{
  var myNode = document.getElementById("legends");
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }
	var sum = function(a, b) { return a + b;};
  var offset  = document.getElementById('pie1').offsetWidth;
  this.createPieChart.call(this,'#pie1',lbls,srs,{
    showLabel:true,
    
    labelInterpolationFnc: function(srs,sum,value, idx) {
      var val = (srs[0][idx] /  srs[0].reduce(sum) * 100).toFixed(1);
      val = (val%5===0||val%2===0||val%3===0||val%7===0||val%11===0||val%13===0||val%17===0||val%19===0||val%23===0||val%29===0||val%31===0||val%37===0||val%41===0||val%43===0||val%47===0||val%49===0)?parseInt(val):val;
      return  val + '%';
    }.bind(this,srs,sum),
    plugins:legends===true? [
      Chartist.plugins.legend( {
        horizontalAlign: "right",
        clickable:false,
        position: document.getElementById('legends')
      })
    ]:[],
    labelPosition: 'inside',
    labelOffset:offset/20,
    chartPadding:offset/20,
    labelDirection: 'neutral',
  },0.9);
};

konymp.charts.pie.prototype.Updatecss = function(colors)
{
  var regColorcode = /^(#)?([0-9a-fA-F]{3})([0-9a-fA-F]{3})?$/;
  for(var i in colors)
    {
      if(colors[i]!==""&&regColorcode.test(colors[i]))
      {  
       this.createClass('.ct-legend .ct-series-'+i+':before',"  background-color:"+colors[i]+"; border-color:"+colors[i]+";");
        var _char = String.fromCharCode(parseInt(97+Number(i)));
        this.createClass('.ct-series-'+_char+' .ct-slice-pie',"fill:"+colors[i]+";");
      }
    }
};

konymp.charts.pie.prototype.setProperties = function(properties){
    this.createClass(".ct-legend.ct-legend-inside","position: absolute;top: 0;left: 0;margin-left:0px;"+
                 "font-family :Helvetica;"+
		         " font-size : "+parseInt(properties._legendFontSize)*10+"%; color : "+properties._legendFontColor+";"
                );
};

konymp.charts.pie.prototype.Generate_PieChart = function(title,labels,data,colors,properties){
  if(document.readyState === "complete")
  {
   this.setProperties(properties);
   document.getElementById('lblTitle').style.color = properties._titleFontColor;
   document.getElementById('lblTitle').style.fontSize = parseInt(properties._titleFontSize)*10+'%'; 
   document.getElementById('lblTitle').style.fontFamily = 'Helvetica';
   document.getElementById('lblTitle').innerHTML = title;
   document.body.style.backgroundColor = properties._bgColor;
    this.Updatecss(colors);
      this.UI_createpieCharts(labels,[data],properties._enableLegend);
    return true;
  }
  else
  {
    return false;
  }
 
};

window.onload = function(){
  console.log(navigator.userAgent);
  	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    	return true;
	}
  var x = new konymp.charts.pie();
   var data = [
                            {
                                "colorCode": "#1B9ED9",
                                "label": "Data1",
                                "value": "40"
                            },
                            {
                                "colorCode": "#E8672B",
                                "label": "data2",
                                "value": "20"
                            },
                            {
                                "colorCode": "#76C044",
                                "label": "data3",
                                "value": 20
                            },
                            {
                                "colorCode": "#FFC522",
                                "label": "data4",
                                "value": 10
                            },
                            {
                                "colorCode": "#97CDED",
                                "label": "data5",
                                "value": 10               
                            }
                        ];
  
  var Data = data.map(function(obj){
          return Number(obj.Value||obj.value);
        });
        var labels = data.map(function(obj){
          return obj.label;
        });
        var colors = data.map(function(obj){
          return obj.colorCode;
        });
  var properties = {_titleFontSize:12,
                    _titleFontColor:"#000000",
                    _enableLegend:true,
                    _legendFontSize:10,
                    _legendFontColor:"#000000",
                    _bgColor:"#ffffff",
    
  };
  x.Generate_PieChart("Pie Chart",labels,Data,colors,properties);
  
};
window.addEventListener("DOMContentLoaded", function() {
 setTimeout(onbodyload, 0);
}.bind(this), false);


onbodyload = function(){
 if(kony) {
   kony.evaluateJavaScriptInNativeContext("chart_pie_defined_global('ready')");
 }
}.bind(this);
