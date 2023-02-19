 /* 
 * Школа №2072 Предпрофессиональная олимпиада "ИТ профиль"
 */
 // Описание глобальных переменных
 
var T = 20; 	// Порог по средней температуре воздуха
var H = 60; 	// Порог по средней влажности в теплице
var Hb = 70; 	// Порог по средней влажности в борозде

var DIMENSION = 10;
var N_AIR = 4;
var N_GROUND = 6;
var EMERGENCY = false;
var COUNTER = 0;

var storage = chrome.storage.sync; // переменная для работы с глобальным хранилищем

 class autofermer {
	constructor(){
		this.timer = []; 		// значение времени опроса - массив значений		
		this.temperature = []; 		// температура воздуха - двумерный массив значений
		for (var i = 0; i < N_AIR; i++) { this.temperature[i] = new Array(); }	
		this.humidity = [];			// влажность воздуха - двумерный массив значений
		for (var i = 0; i < N_AIR; i++) { this.humidity[i] = new Array(); }			
		this.humidity_furrow = [];	// влажность борозды №... - массив датчиков
		for (var i = 0; i < N_GROUND; i++) { this.humidity_furrow[i] = new Array(); }
		this.watering_furrow = [];	// включение полива грядки №...
		for (var i = 0; i < N_GROUND; i++) { this.watering_furrow[i] = false; }		
		this.fortochka = false; 	// включение открытия/закрытия форточки
		this.h_air = false;		// включение/выключение увлажнения воздуха
		this.AVG_temperature = []; 		// средняя температура воздуха - массив значений
		this.AVG_humidity = []; 		// средняя влажность воздуха - массив значений
		this.AVG_humidity_furrow = []; 		// средняя влажность борозды №... - массив значений
		for (var i = 0; i < N_GROUND; i++) { this.AVG_humidity_furrow[i] = new Array(); }
	}
	set_Temperature_Humidity(n, temperature, humidity){
		var id = n-1;
		if(this.temperature[id].length < DIMENSION) {
			this.temperature[id].push(temperature);
		}
		else {
			this.temperature[id].splice(0, 1);
			this.temperature[id].push(temperature);
		}
		if(this.humidity[id].length < DIMENSION) {
			this.humidity[id].push(humidity);
		}
		else {
			this.humidity[id].splice(0, 1);
			this.humidity[id].push(humidity);
		}
	}
	set_Humidity_furrow(n, val){
		var id = n-1;
		if(this.humidity_furrow[id].length < DIMENSION) {
			this.humidity_furrow[id].push(val);
		}
		else {
			this.humidity_furrow[id].splice(0, 1);
			this.humidity_furrow[id].push(val);
		}
	}
	set_Time(t) { // запоминание времени опроса датчиков
		if(this.timer.length < DIMENSION) {
			this.timer.push(t);
		}
		else {
			this.timer.splice(0, 1);
			this.timer.push(t);
		}
	}
	reduce_AVG_parametrs() { // расчет средних значений измеряемых параметров
		var AVG;
		for(var i=0, AVG = 0; i < N_AIR;i++) // средняя температура воздуха в теплице - расчитывается по 4-м датчикам
			AVG += this.temperature[i][this.temperature[i].length?this.temperature[i].length-1:0];
		AVG /= N_AIR;
		if(this.AVG_temperature.length < DIMENSION) {
			this.AVG_temperature.push(AVG);
		}
		else {
			this.AVG_temperature.splice(0, 1);
			this.AVG_temperature.push(AVG);
		}
		
		for(var i=0, AVG = 0; i < N_AIR;i++) // средняя влажность воздуха в теплице - расчитывается по 4-м датчикам
			AVG += this.humidity[i][this.humidity[i].length?this.humidity[i].length-1:0];
		AVG /= N_AIR;
		if(this.AVG_humidity.length < DIMENSION) {
			this.AVG_humidity.push(AVG);
		}
		else {
			this.AVG_humidity.splice(0, 1);
			this.AVG_humidity.push(AVG);
		}

		for(var i=0; i < N_GROUND;i++) { // проход по всем бороздам и вычисление среднего значения по каждой в отдельности
			AVG = 0;
			for(var j=0; j < this.humidity_furrow[i].length;j++) {	
				AVG += this.humidity_furrow[i][j];
			}
			AVG = AVG/this.humidity_furrow[i].length;
			if(this.AVG_humidity_furrow[i].length < DIMENSION) {
				this.AVG_humidity_furrow[i].push(AVG);
			}
			else {
				this.AVG_humidity_furrow[i].splice(0, 1);
				this.AVG_humidity_furrow[i].push(AVG);
			}
		}
	}
	
	toggle_Watering(id) { // передача PATCH запроса на Включение/выключение полива грядки №
		this.watering_furrow[id] = !this.watering_furrow[id];
		var xhr = new XMLHttpRequest();
		xhr.open("PATCH", "https://dt.miet.ru/ppo_it/api/watering?id="+(id+1)+"&state="+(this.watering_furrow[id]?1:0));
		xhr.setRequestHeader("Accept", "application/json"); xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onreadystatechange = function () {
		   if (xhr.readyState === 4) {
			console.log("Полив борозды № ",id+1," ",xhr.responseText);
		   }};
		var data = `{“id”: id, “state”: (this.watering_furrow[id+1]?1:0)}`;
		xhr.send(data);	
	}
	toggle_H_air() { // передача PATCH запроса на Включение/выключение общего увлажнения
		this.h_air = !this.h_air;
		var xhr = new XMLHttpRequest();
		xhr.open("PATCH", "https://dt.miet.ru/ppo_it/api/total_hum?&state="+(this.h_air?1:0));
		xhr.setRequestHeader("Accept", "application/json"); xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onreadystatechange = function () {
		   if (xhr.readyState === 4) {
			console.log("Включение/выключение общего увлажнения", xhr.responseText);
		   }};
		var data = `{“state”: (this.h_air?1:0)}`;
		xhr.send(data);			
	}
	toggle_Fortochka() { // передача PATCH запроса на открытие/закрытие форточки
		this.fortochka = !this.fortochka;
		var xhr = new XMLHttpRequest();
		xhr.open("PATCH", "https://dt.miet.ru/ppo_it/api/fork_drive?&state="+(this.h_air?1:0));
		xhr.setRequestHeader("Accept", "application/json");
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onreadystatechange = function () {
		   if (xhr.readyState === 4) {
			console.log("Открытие/закрытие форточки", xhr.responseText);
		   }};
		var data = `{“state”: (this.fortochka?1:0)}`;
		xhr.send(data);
	}	
	console_data() {
		console.log("Температура:");
		for(var i=0; i < N_AIR;i++) {
			console.log("Температура №", i+1, this.temperature[i]);
			console.log("Влажность №", i+1, this.humidity[i]);
		}
		for(var i=0; i < N_GROUND;i++)
			console.log("Влажность грядки №", i+1, this.humidity_ground[i]);
	}	
 }
fermer = new autofermer();

function get_all_value() { // функция периодического опроса датчиков
	var AVG_temperature = 0, AVG_humidity = 0;
	let date = new Date();
	fermer.set_Time(date.toLocaleTimeString());	// заполнение массива времени снятия значений датчиков
	console.log(fermer);

	for(var i=0; i < N_AIR;i++){
		fetch("https://dt.miet.ru/ppo_it/api/temp_hum/"+(i+1))
		  .then(response => response.json())
		  .then(commits => {
					fermer.set_Temperature_Humidity(commits.id, commits.temperature, commits.humidity);

				});
	}
	for(var i=0; i < N_GROUND;i++){	
		fetch("https://dt.miet.ru/ppo_it/api/hum/"+(i+1))
		  .then(response => response.json())
		  .then(commits => fermer.set_Humidity_furrow(commits.id, commits.humidity));
	}
	fermer.reduce_AVG_parametrs();
// вычисление ограничений по параметрам теплицы
	if(EMERGENCY) { // Нажата кнопка чрезвычайной ситуации - все разблокирется
		$("input").prop("disabled", false);
	}
	else {
		if(fermer.AVG_temperature[fermer.AVG_temperature.length?fermer.AVG_temperature.length-1:0] < T) { // средняя температура в теплице больше Т градусов
			console.log("открытие форточек заблокировано"); 
			$("#slide3").prop("disabled", true);
		}
		else {
			console.log("открытие форточек разрешено"); 
			$("#slide3").prop("disabled", false);		
		}
		if(fermer.AVG_humidity[fermer.AVG_humidity.length?fermer.AVG_humidity.length-1:0] > H) { // средняя влажность в теплице больше H градусов
			console.log("Включение увлажнения заблокировано"); 
			$("#slide4").prop("disabled", true);
		}
		else {
			console.log("Включение увлажнения разрешено"); 
			$("#slide4").prop("disabled", false);		
		}
	}
// Запись содержимого объекта fermer в хранилище Google	
	if ($('#Save_option').is(':checked')){
		console.log("Запись идет");
		storage.set({fermer:fermer});		
	}
// Рисуем таблицы

}

// https://codyshop.ru/litechart-library-for-chart-creation/
document.addEventListener("DOMContentLoaded", function(){
	let timerId = setTimeout(function tick() {
		get_all_value();
		COUNTER++;
		if(COUNTER > 4) 
			fill_table(0, fermer.temperature[0], fermer.timer);
		timerId = setTimeout(tick, 1000);
	}, 1000);
// заполнение полей настроек системы

	$('#T_option').val(T);
	$('#T_option').on('input', function() {T = $('#T_option').val();console.log(T, H, Hb);});
	$('#H_option').val(H);
	$('#H_option').on('input', function() {H = $('#H_option').val();console.log(T, H, Hb);});
	$('#Hb_option').val(Hb);
	$('#Hb_option').on('input', function() {Hb = $('#Hb_option').val();console.log(T, H, Hb);});	

// Создаем графики
	settings = {
		padding: {
			top: 10, right: 10, bottom: 10, left: 10},
		point: {
			show: true, radius: 2, strokeWidth: 3, stroke: "#ffffff"},
		axisX: {
			show: true,	color: "#e9edf1", width: 2,	value: "", minValue: 0,	maxValue: 0},
		axisY: {
			show: true, color: "#e9edf1", width: 2, value: "", minValue: 0, maxValue: 0},
		legends: {
			table: {
				show: true,	position: {x: "center",	y: 83,},
				direction: "horizontal",
			},
			fill: "#c5c6d0",
		}
	};
// Создаем график для температуры
	let t = new liteChart("chart", settings);
	t.setLabels(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
	t.addLegend({"name": "Температура", "stroke": "#CDDC39", "fill": "#fff", "values": [32.2, 28.19, 30.25, 28.21, 26.62, 26.18, 28.49, 31.99, 29.96, 31.09]});
	t.addLegend({"name": "Среднее", "stroke": "#3b95f7", "fill": "#fff", "values": [29.372500000000002, 29.099999999999998, 29.7925, 28.237499999999997, 29.787499999999998, 29.95, 30.7175, 28.902500000000003, 28.9225, 29.455]});
	let div_t = document.getElementById("temp_chart");
	t.inject(div_t);
	t.draw();
/*
// Создаем график для влажности
	let h = new liteChart("chart", settings);
	h.setLabels(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
	h.addLegend({"name": "Влажность", "stroke": "#CDDC39", "fill": "#fff", "values": [52.2, 78.2, 80.91, 80.62, 70, 68.35, 52.91, 61.89, 67.42, 72]});
	h.addLegend({"name": "Среднее", "stroke": "#3b95f7", "fill": "#fff", "values": [9.7225, 60.7375, 54.29, 72.4525, 64.95750000000001, 64.4425, 64.26499999999999, 67.41499999999999, 59.557500000000005, 65.525]});
	let div_h = document.getElementById("hum_chart");
	h.inject(div_h);
	h.draw();
*/
});
function fill_table(id, arr, timer) {
	console.log('Генерация таблиц');
	const tbl = document.createElement('table');
	tbl.style.width = '100px';
	tbl.style.border = '1px solid black';
	const tr = tbl.insertRow();
	for (let i = 0; i < DIMENSION; i++) {
		const td = tr.insertCell();
		td.appendChild(document.createTextNode(`${i}`));
	}
	for (let i = 0; i < DIMENSION; i++) {
		const td = tr.insertCell();
		td.appendChild(document.createTextNode(`${arr[id][i]}`));
//		td.setAttribute('title', "Yrllk");
		td.style.border = '1px solid black';
	}
	document.body.appendChild(tbl);		
}
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
// Обработчик переключения select с номером борозды
	$( "#select_furrow").change(function() {
		n_select = $('#select_furrow').val();
		$('#n_fullow_h').text(n_select);
		$('#n_fullow_w').text(n_select);
		$('#slide6').prop('checked', fermer.watering_furrow[n_select-1]);
	});
// Обработчики переключателей
	$('#slide3').click(function(e) {
		console.log("Нажат переключатель форточек");
		fermer.toggle_Fortochka();
	});	
	$('#slide4').click(function(e) {
		console.log("Нажат переключатель общего увлажнения");
		fermer.toggle_H_air();
	});		
	$('#slide6').click(function(e) {
		console.log("Нажат переключатель полива борозды");
		fermer.toggle_Watering($('#select_furrow').val()-1);
	});	
// Нажата кнопка EMERGENCY
	$('#emergency').click(function(e) {
		console.log("Нажата/отпущена кнопка EMERGENCY");
		EMERGENCY = !EMERGENCY;
		$('.btn-connection').toggleClass('connected', EMERGENCY);
	});	
});