'use strict'
// client.js 

$(document).ready(function() {

	// prod / sandbox or custom domain logon click
	$("a[class='logon-link']").click(function() {

		console.log('we have been clicked ['+JSON.stringify(this.id)+']');
	});

	$("#custom_domain").change(function(){
			console.log('changing function');
		$("#custom_domain_elements").toggle();
		$("#logon_buttons").toggle();
		$("#custom").toggle();
	});

	$(".cardHeader").click(function() {
		$(this).next().toggle();
	})

	$("input[class='datepicker']").datepicker();
});
