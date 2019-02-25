type = ['','info','success','warning','danger'];


demo = {
    initPickColor: function(){
        $('.pick-class-label').click(function(){
            var new_class = $(this).attr('new-class');
            var old_class = $('#display-buttons').attr('data-class');
            var display_div = $('#display-buttons');
            if(display_div.length) {
            var display_buttons = display_div.find('.btn');
            display_buttons.removeClass(old_class);
            display_buttons.addClass(new_class);
            display_div.attr('data-class', new_class);
            }
        });
    },

    checkScrollForTransparentNavbar: debounce(function() {
            $navbar = $('.navbar[color-on-scroll]');
            scroll_distance = $navbar.attr('color-on-scroll') || 500;

            if($(document).scrollTop() > scroll_distance ) {
                if(transparent) {
                    transparent = false;
                    $('.navbar[color-on-scroll]').removeClass('navbar-transparent');
                    $('.navbar[color-on-scroll]').addClass('navbar-default');
                }
            } else {
                if( !transparent ) {
                    transparent = true;
                    $('.navbar[color-on-scroll]').addClass('navbar-transparent');
                    $('.navbar[color-on-scroll]').removeClass('navbar-default');
                }
            }
    }, 17),


	showSuccessNotification: function(from, align){
    	color = Math.floor((0.4544301516656526 * 4) + 1);

    	$.notify({
        	icon: "pe-7s-bell",
        	message: "Profile Successfully Updated ."

        },{
            type: type[color],
            timer: 4000,
            placement: {
                from: from,
                align: align
            }
        });
	},

    showErrorNotification: function(from, align){
        color = Math.floor((0.7820680091203112 * 4) + 1);

        $.notify({
            icon: "pe-7s-bell",
            message: "Error while Updating profile. Please try again later."

        },{
            type: type[color],
            timer: 4000,
            placement: {
                from: from,
                align: align
            }
        });
    },

    showSuccessMessage : function(from, align,msg){
        color = Math.floor((0.4544301516656526 * 4) + 1);

        $.notify({
            icon: "pe-7s-bell",
            message: msg

        },{
            type: type[color],
            timer: 4000,
            placement: {
                from: from,
                align: align
            }
        });
    },

    showErrorMessage: function(from, align, msg){
        color = Math.floor((0.7820680091203112 * 4) + 1);

        $.notify({
            icon: "pe-7s-bell",
            message: msg

        },{
            type: type[color],
            timer: 4000,
            placement: {
                from: from,
                align: align
            }
        });
    }


}
