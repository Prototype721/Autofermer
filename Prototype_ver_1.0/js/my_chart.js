// https://codyshop.ru/litechart-library-for-chart-creation/
document.addEventListener("DOMContentLoaded", function(){
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
});
