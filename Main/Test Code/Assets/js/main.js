/*
	Escape Velocity by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body');

	// Breakpoints.
		breakpoints({
			xlarge:  [ '1281px',  '1680px' ],
			large:   [ '981px',   '1280px' ],
			medium:  [ '737px',   '980px'  ],
			small:   [ null,      '736px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Dropdowns.
		$('#nav > ul').dropotron({
			mode: 'fade',
			noOpenerFade: true,
			alignment: 'center',
			detach: false
		});

	// Nav.

		// Title Bar.
			$(
				'<div id="titleBar">' +
					'<a href="#navPanel" class="toggle"></a>' +
					'<span class="title">' + $('#logo h1').html() + '</span>' +
				'</div>'
			)
				.appendTo($body);

		// Panel.
			$(
				'<div id="navPanel">' +
					'<nav>' +
						$('#nav').navList() +
					'</nav>' +
				'</div>'
			)
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'left',
					target: $body,
					visibleClass: 'navPanel-visible'
				});

})(jQuery);

/*
	Define the colors to randomize
*/
const colors = ["yellow", "green", "black"];

/*
	Function to randomize colors
*/
function randomizeColors() {
    // Get all the spans by their IDs
    const words = [
        "word1", "word2", "word3", "word4", "word5",
        "tagline1", "tagline2", "tagline3", "tagline4",
        "tagline5", "tagline6", "tagline7", "tagline8"
    ];

    // Loop through each span and assign a random color
    words.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            element.style.color = randomColor;
        }
    });
}

// Call the function on page load
window.onload = randomizeColors;