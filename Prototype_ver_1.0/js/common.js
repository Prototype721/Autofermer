 /* 
 * Школа №2072 Предпрофессиональная олимпиада "ИТ профиль"
 */


$(function() {
    $('#slide1').click(function(e) {

		if($('#temp_table:visible').length) {
			$("#temp_table").fadeOut()
			setTimeout(() => { $('#temp_chart').removeAttr( "style" ).fadeIn(); }, 1000);	
		}
		else {
			$("#temp_chart").fadeOut()
			setTimeout(() => { $('#temp_table').removeAttr( "style" ).fadeIn(); }, 1000);	
		}
    });
});

 // Описание глобальных переменных
 var DIMENSION = 10;
 
 class autofermer {
	constructor(){
		this.temperature = [];
		this.humidity = [];
		this.humidity_poliv = [];
		this.fortochka = new Boolean(false)
		this.h_air = new Boolean(false)
	}
	console_data() {
		console.log(this.temperature);
//		console.log(this.humidity);		
	}
	set_temp(val){
		if(this.temperature.length < DIMENSION) {
			this.temperature.push(val);
		}
		else {
			this.temperature.splice(0, 1);
			this.temperature.push(val);
		}
	}
	set_humidity(val){
		if(this.humidity.length < DIMENSION) {
			this.humidity.push(val);
		}
		else {
			this.humidity.splice(0, 1);
			this.humidity.push(val);
		}
	}	
 }
 
fermer = new autofermer();
	
function get_all_value() {

	console.log("время");
	(async () => {
		for(var i=1; i < 2;i++){
			const res = await fetch("https://dt.miet.ru/ppo_it/api/temp_hum/"+i);
			const json = await res.json();
			console.log(json);
			fermer.set_temp(json.temperature);
			fermer.set_temp(json.humidity);
		}
	})();
	(async () => {
		for(var i=1; i < 2;i++){
			const res = await fetch("https://dt.miet.ru/ppo_it/api/hum/"+i);
			const json = await res.json();
			fermer.set_temp(json.humidity_poliv);
//			console.log(json);
		}
	})();
//	fermer.console_data();

	var xhr = new XMLHttpRequest();
	xhr.open("PATCH", "https://dt.miet.ru/ppo_it/api/total_hum?state=1");

	xhr.setRequestHeader("Accept", "application/json");
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onreadystatechange = function () {
	   if (xhr.readyState === 4) {
		  console.log(xhr.status);
		  console.log(xhr.responseText);
	   }};

	var data = `{“state”: 1}`;
	xhr.send(data);
//	fermer.console_data();
/*
	for(var i=1; i < 5;i++){
		var x = new XMLHttpRequest();		
		x.open("GET", "https://dt.miet.ru/ppo_it/api/temp_hum/"+i, true);
		x.onload = function (){
			console.log("датчик №"+i, x.responseText);
		}
		x.send(null);
	}
	for(var i=1; i < 7;i++){
		var x = new XMLHttpRequest();		
		x.open("GET", "https://dt.miet.ru/ppo_it/api/hum/"+i, true);
		x.onload = function (){
			console.log( x.responseText);
		}
		x.send(null);
	}	

	for(var i=0; i <15; i++) {
		fermer.set_temp(i);
		$("#informer").text(i);
	}
	fermer.console_data();
*/
}

// https://codyshop.ru/litechart-library-for-chart-creation/
document.addEventListener("DOMContentLoaded", function(){
	let timerId = setTimeout(function tick() {
		get_all_value();

		timerId = setTimeout(tick, 2000);
	}, 2000);
/*
	// Create liteChart.js Object
	settings = {
		padding: {
			top: 10,
			right: 10,
			bottom: 10,
			left: 10,
		},
		point: {
			show: true,
			radius: 2,
			strokeWidth: 3,
			stroke: "#ffffff", // null or color by hex/rgba
		}
	};
	let d = new liteChart("chart", settings);

	// Set labels
	d.setLabels(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);

	// Set legends and values
	d.addLegend({"name": "Temp", "stroke": "#CDDC39", "fill": "#fff", "values": [25, 26, 25.5, 27, 28, 29, 25, 30, 32, 33]});

	// Inject chart into DOM object
	let div = document.getElementById("temp_chart");
	d.inject(div);

	// Draw
	d.draw();
*/	
var smoothie = new SmoothieChart();
smoothie.streamTo(document.getElementById("temp_chart"), 450);
// Data
var line1 = new TimeSeries();
var line2 = new TimeSeries();

// Add a random value to each line every second
setInterval(function() {
  line1.append(Date.now(), Math.random());
  line2.append(Date.now(), Math.random());
}, 1000);

// Add to SmoothieChart
smoothie.addTimeSeries(line1);
smoothie.addTimeSeries(line2);	
	
});