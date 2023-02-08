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
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
	var data = google.visualization.arrayToDataTable([
	  ['Year', 'Sales', 'Expenses'],
	  ['2004',  1000,      400],
	  ['2005',  1170,      460],
	  ['2006',  660,       1120],
	  ['2007',  1030,      540]
	]);

	var options = {
	  title: 'Company Performance',
	  curveType: 'function',
	  legend: { position: 'bottom' }
	};

	var chart = new google.visualization.LineChart(document.getElementById('temp_chart'));

	chart.draw(data, options);
  }