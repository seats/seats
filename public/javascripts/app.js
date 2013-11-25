$(function() {
	$.each($('li:not([data-status="null"])'), function() {
		var $this = $(this);
		var row = $this.parent('ul');
		$(this).html(row.data("row") + $this.data("seat"));
	});
<<<<<<< HEAD
	$('li').on('click', function() {
		var $this = $(this);
		if ($this.attr("data-status") === "empty") {
			$(this).attr("data-status", "presold");
			if ($('li[data-status="presold"]').length) {
				$('.ticket-types').show();
				if ($('.ticket-types input').is(':checked')) {
					$('.sell').show();
=======
	if(window.seller){
		$('li:not([data-status="null"])').on('click', function() {

			var $this = $(this);
			if ($this.attr("data-status") === "empty") 
			{
				$(this).attr("data-status","presold");
				if ($('li[data-status="presold"]').length) {
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

>>>>>>> efc6c7539699d8d384a88c364df88aec9059a017
				} else {
					$('.sell').hide();
				}
<<<<<<< HEAD

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
=======
			} 
			else if ($this.attr("data-status") === "sold") 
			{
				$this.attr('data-status','prereturn');
				if ($('li[data-status="prereturn"]').length) {
					$('.loose').show();
				} else {
					$('.loose').hide();
				}
			}
			else if($this.attr("data-status") === "presold")
			{
				$(this).attr("data-status","empty");
			}
			else if($this.attr("data-status") === "prereturn")
			{
				$(this).attr("data-status","sold");
			}
		});
		$('li:not([data-status="null"])').on("mouseenter", function (e) {
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
					"<strong>Satıcı: </strong>" + "seller"
				].join("")).css({
					"position" : "absolute",
					"top" : e.pageY + 10,
					"left" : e.pageX + 10
				}).show();
				console.log(e);
		}).on("mouseleave", function (e) {
			$(".info-card").hide();
		});
		$('.loose').on('click', function() {
			$(this).hide();
			$('li[data-status="prereturn"]').each(function() {
				var $this = $(this);
				console.log($this.html());
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
				$(this).attr("data-status","empty");
			});
		});
		$('.ticket-types input').on('change', function() {
			$('.sell').prop('disabled', false);
		});
		$('.sell').on('click', function() {
			$(this).hide();
			$('li[data-status="presold"]').each(function() {
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
>>>>>>> efc6c7539699d8d384a88c364df88aec9059a017
			});
		});		
	}

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