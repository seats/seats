$(function() {
	$.each($('li:not(.null,.sold)'), function() {
		var $this = $(this);
		var row = $this.parent('ul');
		$(this).html(row.data("row") + $this.data("seat"));
	});
	$('.empty').on('click', function() {
		var $this = $(this);
		if ($this.hasClass("empty")) {
			$(this).toggleClass("about-to-sold");
			if ($('.about-to-sold').length) {
				$('.ticket-types').show();
				if($('.ticket-types input').is(':checked')){
					$('.sell').show();
				}else{
					$('.sell').show().prop('disabled',true);				
				}
			} else {
				$('.sell').hide();
			}
		} else if ($this.hasClass("sold")) {
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
		})
	});
	$('.ticket-types input').on('change', function () {
		$('.sell').prop('disabled',false);
	});
	$('.sell').on('click', function() {
		$(this).hide();
		$('.about-to-sold').each(function() {
			var $this = $(this);
			console.log($this.html());
			$this.removeClass().addClass('sold');
		});
	})
});