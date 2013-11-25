$(function() {
	$.each($('li[data-status="empty"]'), function() {
		var $this = $(this);
		var row = $this.parent('ul');
		$(this).html(row.data("row") + $this.data("seat"));
	});
	$('li[data-status="empty"]').on('click', function() {
		var $this = $(this);
		if ($this.attr("data-status") === "empty") {
			$(this).toggleClass("about-to-sold");
			if ($('.about-to-sold').length) {
				$('.ticket-types').show();
				if ($('.ticket-types input').is(':checked')) {
					$('.sell').show();
				} else {
					$('.sell').show().prop('disabled', true);
				}

				$.ajax({
					type: "POST",
					url: '/sales',
					data: {
						seat: $this.html(),
						category: "unknown",
						seller: seller,
						sold: false
					}
				}).error(function(err) {
					console.log(err);
					alert('Error');
				});

			} else {
				$('.sell').hide();
			}
		} else if ($this.attr("data-status") === "sold") {
			$this.toggleClass('about-to-loose');
			if ($('.about-to-loose').length) {
				$('.loose').show();
			} else {
				$('.loose').hide();
			}
		}
	});
	$('.loose').on('click', function() {
		$(this).hide();
		$('.about-to-loose').each(function() {
			var $this = $(this);
			console.log($this.html());
			$(this).removeClass().addClass("empty");
			$.ajax({
				type: "DELETE",
				url: '/sales',
				data: {
					seat: $this.html()
				}
			}).error(function(err) {
				console.log(err);
				alert('Error');
			});
		});
	});
	$('.ticket-types input').on('change', function() {
		$('.sell').prop('disabled', false);
	});
	$('.sell').on('click', function() {
		$(this).hide();
		$('.about-to-sold').each(function() {
			var $this = $(this);

			$.ajax({
				type: "POST",
				url: '/sales',
				data: {
					seat: $this.html(),
					category: document.querySelector('input[name="ticket-type"]:checked').value,
					seller: seller,
					sold: true
				}
			}).error(function(err) {
				console.log(err);
				alert('Error');
			});

			$this.attr('data-status', 'sold');
		});
	});

	function markSeats(array, status) {
		$.each(array, function(index, item) {
			var li = $("li").filter(function() {
				return $(this).html() === item;
			});
			li.attr("data-status", status);
		});
	}
});


var socket = io.connect();
socket.on('connect', function() {
	//connected
});

socket.on('updateseat', function(saledata) {
	console.log(saledata);
});
socket.on('deleteseat', function(seatname) {
	console.log(seatname);
});