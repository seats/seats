$(function() {
	$.each($('li:not([data-status="null"])'), function() {
		var $this = $(this);
		var row = $this.parent('ul');
		$(this).html(row.data("row") + $this.data("seat"));
	});
	
	if(window.seller){
		$('li:not([data-status="null"])').on('click', function() {
			var $this = $(this);
			if ($this.attr("data-status") === "empty") {
				$(this).attr("data-status", "presold");
				socket.emit('updateseat', {
					seat: $this.html(),
					category: "unknown",
					seller: seller,
					sold: false
				});
				if ($('li[data-status="presold"]').length) {
					$('.ticket-types').show();
					if ($('.ticket-types input').is(':checked')) {
						$('.sell').show();
					} else {
						$('.sell').show().prop('disabled', true);
					}
				} else {
					$('.sell').hide();
				}
			} else if ($this.attr("data-status") === "sold") {
				$this.attr('data-status', 'prereturn');
				if ($('li[data-status="prereturn"]').length) {
					$('.loose').show();
				} else {
					$('.loose').hide();
				}
			} else if ($this.attr("data-status") === "presold") {
				$(this).attr("data-status", "empty");
			} else if ($this.attr("data-status") === "prereturn") {
				$(this).attr("data-status", "sold");
			}
		}).on("mouseenter", function (e) {
			$(".info-card").html(
				[
					"<strong>Koltuk: </strong>" + $(this).html(),
					"<br>",
					"<br>",
					"<strong>Satış Tipi: </strong>" + "bümk (4 TL)",
					"<br>",
					"<br>",
					"<strong>Satış Tarihi: </strong>" + "date",
					"<br>",
					"<br>",
					"<strong>Satıcı: </strong>" + seller
				].join("")).css({
					"position" : "absolute",
					"top" : e.pageY + 10,
					"left" : e.pageX + 10
				}).show();
		}).on("mouseleave", function (e) {
			$(".info-card").hide();
		});

		$('.loose').on('click', function() {
			$(this).hide();
			$('li[data-status="prereturn"]').each(function() {
				var $this = $(this);
				socket.emit('deleteseat', {
					seat: $this.html()
				});
				$(this).attr("data-status", "empty");
			});
		});

		$('.ticket-types input').on('change', function() {
			$('.sell').prop('disabled', false);
		});

		$('.sell').on('click', function() {
			$(this).hide();
			$('li[data-status="presold"]:not([data-seller])').each(function() {
				var $this = $(this);

				socket.emit('updateseat', {
					seat: $this.html(),
					category: document.querySelector('input[name="ticket-type"]:checked').value,
					seller: seller,
					sold: true
				});
				$(this).attr("data-status", "sold");				
			});		
		});

		function markSeats(array) {
			$.each(array, function(index, item) {
				var li = $("li").filter(function() {
					return $(this).html() === item.seat;
				});
				li.attr("data-status", (item.sold) ? "sold" : "empty");
				li.attr("data-category", item.category);
			});
		}
		function markSeat(saleObj){
			var li = $("li").filter(function() {
				return $(this).html() === saleObj.seat;
			});
			li.attr("data-status", (saleObj.sold) ? "sold" : "presold");
			li.attr("data-category", saleObj.category);
			li.attr("data-seller", saleObj.seller);
		}
		function deleteSeat(seat){
			var li = $("li").filter(function() {
				return $(this).html() === seat;
			});
			li.attr("data-status", "empty");
			li.attr("data-category", "");
		}
	}

	var socket = io.connect();
	socket.on('connect', function() {
		//connected
	});

	socket.on('updateseat', function(saledata) {
		markSeat(saledata)
	});

	socket.on('sales', function(sales){
		console.log(sales);
		markSeats(sales);
	});
	
	socket.on('deleteseat', function(seatname) {
		var li = $("li").filter(function() {
			return $(this).html() == seatname;
		});
		deleteSeat(seatname.seat)
	});
});