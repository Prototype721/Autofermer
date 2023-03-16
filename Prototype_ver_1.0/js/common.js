 /* 
 * Школа №2072 Предпрофессиональная олимпиада "ИТ профиль"
 */
 // Описание глобальных переменных
 
var T = 20; 	// Порог по средней температуре воздуха
var H = 60; 	// Порог по средней влажности в теплице
var Hb = 70; 	// Порог по средней влажности в борозде

var DEBUG = false;
var DIMENSION = 10;
var N_AIR = 4;
var N_GROUND = 6;
var EMERGENCY = false;
var COUNTER = 0;
var TIMER = 1000;
arr_name = ["temp", "hum", "hum_furrow"];
arr_char = ["T", "H", "Hb"];
var options = {
  showPoint: true, lineSmooth: false,
  axisX: {showGrid: true, showLabel: true}
};
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
		this.grafics = []; 				// массив ссылок на графики
		this.grafics_data = [];			// массив данных для графиков
		for (var i = 0; i < 3; i++)
			this.grafics_data[i] = {labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],  series: []};
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
		AVG = AVG / N_AIR;
		if(this.AVG_temperature.length < DIMENSION) {
			this.AVG_temperature.push(AVG);
		}
		else {
			this.AVG_temperature.splice(0, 1);
			this.AVG_temperature.push(AVG);
		}
		
		for(var i=0, AVG = 0; i < N_AIR;i++) // средняя влажность воздуха в теплице - расчитывается по 4-м датчикам
			AVG += this.humidity[i][this.humidity[i].length?this.humidity[i].length-1:0];
		AVG = AVG / N_AIR;
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

function get_all_value() { // функция выбора режима: штатный или unit-тестирование
	if(DEBUG)
		get_all_value_gebug();
	else 
		get_all_value_nogebug();
}
function get_all_value_gebug() { // функция unit-тестирования
	for(var i=1; i <= N_AIR;i++)
		fermer.set_Temperature_Humidity(i, i, i);
	for(var i=1; i <= N_GROUND;i++)	
		fermer.set_Humidity_furrow(i, i);
	fermer.reduce_AVG_parametrs();	
}
function get_all_value_nogebug() { // функция периодического опроса датчиков
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
//			console.log("открытие форточек заблокировано"); 
			$("#slide5").prop("disabled", true);
		}
		else {
//			console.log("открытие форточек разрешено"); 
			$("#slide5").prop("disabled", false);		
		}
		if(fermer.AVG_humidity[fermer.AVG_humidity.length?fermer.AVG_humidity.length-1:0] > H) { // средняя влажность в теплице больше H градусов
//			console.log("Включение увлажнения заблокировано"); 
			$("#slide4").prop("disabled", true);
		}
		else {
//			console.log("Включение увлажнения разрешено"); 
			$("#slide4").prop("disabled", false);		
		}
		n_select = $('#select_furrow').val();
		if(fermer.AVG_humidity_furrow[n_select-1][fermer.AVG_humidity.length?fermer.AVG_humidity.length-1:0] > Hb) { // средняя влажность в теплице больше H градусов
//			console.log("Включение полива борозды "+n_select+" заблокировано"); 
			$("#slide6").prop("disabled", true);
		}
		else {
//			console.log("Включение полива борозды "+n_select+" разрешено"); 
			$("#slide6").prop("disabled", false);		
		}		
	}
// Запись содержимого объекта fermer в хранилище Google	
	if ($('#Save_option').is(':checked')){
		console.log("Запись идет");
		storage.set({fermer:fermer});		
	}
// Рисуем таблицы

}
// инициализация после загрузки страницы
document.addEventListener("DOMContentLoaded", function(){
// Создаем графики

// создание массива данных для графиков
	for(let i=0; i < 3; i++) {
		fermer.grafics[i] = new Chartist.Line('#'+arr_name[i]+'_chart', fermer.grafics_data[i], options);
	}
	let timerId = setTimeout(function tick() { // включение таймера на запрос данных
		get_all_value();
		i = $('#select_temp').val();
		fill_table(arr_name[0], fermer.temperature[i-1], fermer.AVG_temperature, arr_char[0], fermer.timer);
		fermer.grafics_data[0].series = [fermer.temperature[i-1],fermer.AVG_temperature];
		fermer.grafics[0].update(fermer.grafics_data[0], options);
		i = $('#select_hum').val();		
		fill_table(arr_name[1], fermer.humidity[i-1], fermer.AVG_humidity, arr_char[1], fermer.timer);
		fermer.grafics_data[1].series = [fermer.humidity[i-1],fermer.AVG_humidity];
		fermer.grafics[1].update(fermer.grafics_data[1], options);
		i = $('#select_furrow').val();		
		fill_table(arr_name[2], fermer.humidity_furrow[i-1], fermer.AVG_humidity_furrow[i-1], arr_char[2],fermer.timer);
		fermer.grafics_data[2].series = [fermer.humidity_furrow[i-1],fermer.AVG_humidity_furrow[i-1]];
		fermer.grafics[2].update(fermer.grafics_data[2], options);
		
		timerId = setTimeout(tick, TIMER);
	}, TIMER);
// заполнение полей настроек системы
	$('#T_option').val(T);
	$('#T_option').on('input', function() {T = $('#T_option').val();console.log(T, H, Hb);});
	$('#H_option').val(H);
	$('#H_option').on('input', function() {H = $('#H_option').val();console.log(T, H, Hb);});
	$('#Hb_option').val(Hb);
	$('#Hb_option').on('input', function() {Hb = $('#Hb_option').val();console.log(T, H, Hb);})	
});
function fill_table(id, arr, AVG_arr, ch, timer) {
	const tbl = document.createElement('table');
	const div = document.getElementById(id+"_table");
	tbl.className += "table_dark";
	tbl.style.width = '100px';
	tbl.style.border = '1px solid black';
	const tr1 = tbl.insertRow();
	td = tr1.insertCell();
	td.appendChild(document.createTextNode("t"));
	td.setAttribute('title', "Момент времени");
	td.style.weight = 'bold';
	for (let i = 1; i <= arr.length; i++) {
		const td = tr1.insertCell();
		td.appendChild(document.createTextNode(`${i}`));
		td.setAttribute('title', timer[i-1]);
	}
	const tr2 = tbl.insertRow();
	td = tr2.insertCell();
	td.appendChild(document.createTextNode(ch));
	td.style.weight = 'bold';
	for (let i = 0; i < arr.length; i++) {
		td = tr2.insertCell();
		td.appendChild(document.createTextNode(arr[i].toFixed(2)));
	}
	const tr3 = tbl.insertRow();
	td = tr3.insertCell();
	td.appendChild(document.createTextNode("μ"));
	td.setAttribute('title', "Среднее значение");
	td.style.weight = 'bold';
	for (let i = 0; i < arr.length; i++) {
		td = tr3.insertCell();
		td.appendChild(document.createTextNode(AVG_arr[i].toFixed(2)));
	}
	div.innerHTML = '';
	div.appendChild(tbl);		
}
$(function() {
	for(let i=1; i <=3; i++) { // код для переключения таблица/график
		$('#slide'+i).click(function(e) {
			if($('#'+arr_name[i-1]+'_table').css( "visibility") == 'visible') {
				$('#'+arr_name[i-1]+'_table').css( "visibility", "hidden");
				$('#'+arr_name[i-1]+'_chart').css( "visibility", "visible");	
			}
			else {
				$('#'+arr_name[i-1]+'_chart').css( "visibility", "hidden");
				$('#'+arr_name[i-1]+'_table').css( "visibility", "visible");
			}
		});
	}
// Обработчик переключения select с датчиков
	$( "#select_temp").change(function() {
		i = $('#select_temp').val();
		fill_table(arr_name[0], fermer.temperature[i-1], fermer.AVG_temperature, arr_char[0], fermer.timer);
		fermer.grafics_data[0].series = [fermer.temperature[i-1],fermer.AVG_temperature];
		fermer.grafics[0].update(fermer.grafics_data[0], options);
	});	
	$( "#select_hum").change(function() {
		i = $('#select_hum').val();
		fill_table(arr_name[1], fermer.humidity[i-1], fermer.AVG_humidity, arr_char[1], fermer.timer);
		fermer.grafics_data[1].series = [fermer.humidity[i-1],fermer.AVG_humidity];
		fermer.grafics[1].update(fermer.grafics_data[1], options);
	});	

// Обработчик переключения select с номером борозды
	$( "#select_furrow").change(function() {
		n_select = $('#select_furrow').val();
		$('#n_fullow_h').text(n_select);
		$('#n_fullow_w').text(n_select);
		$('#slide6').prop('checked', fermer.watering_furrow[n_select-1]);
		fill_table(arr_name[2], fermer.humidity_furrow[i-1], fermer.AVG_humidity_furrow[i-1], arr_char[2], fermer.timer);
		fermer.grafics_data[2].series = [fermer.humidity_furrow[i-1],fermer.AVG_humidity_furrow];
		fermer.grafics[2].update(fermer.grafics_data[2], options);		
	});
// Обработчики переключателей
	$('#slide5').click(function(e) {
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