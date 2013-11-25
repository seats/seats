$(function() {
	$.each($('li:not([data-status="null"])'), function() {
		var $this = $(this);
		var row = $this.parent('ul');
		$(this).html(row.data("row") + $this.data("seat"));
	});
	$('li').on('click', function() {
		var $this = $(this);
		if ($this.attr("data-status") === "empty") {
			$(this).attr("data-status", "presold");
			if ($('li[data-status="presold"]').length) {
				$('.ticket-types').show();
				if ($('.ticket-types input').is(':checked')) {
					$('.sell').show();
				} else {
					$('.sell').show().prop('disabled', true);
				}

				socket.emit('updateseat', {
					seat: $this.html(),
					category: "unknown",
					seller: seller,
					sold: false
				});

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
		$('li[data-status="presold"]').each(function() {
			var $this = $(this);

			socket.emit('updateseat', {
				seat: $this.html(),
				category: document.querySelector('input[name="ticket-type"]:checked').value,
				seller: seller,
				sold: true
			});

			$this.attr('data-status', 'sold');
		});
	});

	function markSeats(array) {
		$.each(array, function(index, item) {
			var li = $("li").filter(function() {
				return $(this).html() === item;
			});
			li.attr("data-status", (item.sold) ? "sold" : "empty");
			li.attr("data-category", item.category);
		});
	}
});

var socket = io.connect();
socket.on('connect', function() {
	//connected
});

socket.on('updateseat', function(saledata) {
	var li = $("li").filter(function() {
		return $(this).html() == saledata.seat;
	});
	li.trigger("click");
});
socket.on('deleteseat', function(seatname) {
	var li = $("li").filter(function() {
		return $(this).html() == seatname;
	});
	li.trigger("click");
});