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

// Call the function on page load without overriding other listeners
window.addEventListener('load', randomizeColors);

/**
 * Auto-apply .btn-standard to button-like elements for consistent styling.
 *
 * IMPORTANT: This is a FALLBACK enhancement. Always prefer adding .btn-standard
 * directly in HTML to ensure styling works even if JavaScript fails to load.
 *
 * Enhancement Strategy:
 * - Scans the DOM on page load (DOMContentLoaded)
 * - Applies .btn-standard to any button-like element missing the class
 * - Respects .btn-standard-ignore to exclude specific elements
 * - Preserves existing variant classes (btn-primary, btn-danger, etc.)
 *
 * Targeted Elements:
 * - <button> elements
 * - <a> with class="button" or class*="btn"
 * - <input type="button|submit|reset">
 * - Any element with role="button"
 *
 * @since 2025-10-16
 * @author JamWatHQ Development Team
 */
function applySharedButtonClass() {
	const selectors = [
		'button:not(.btn-standard-ignore)',
		'a.button:not(.btn-standard-ignore)',
		'a[href][role="button"]:not(.btn-standard-ignore)',
		'a[href][class*="btn"]:not(.btn-standard-ignore)',
		'input[type="button"]:not(.btn-standard-ignore)',
		'input[type="submit"]:not(.btn-standard-ignore)',
		'input[type="reset"]:not(.btn-standard-ignore)',
		'.btn:not(.btn-standard-ignore)'
	];

	const elements = document.querySelectorAll(selectors.join(', '));

	let appliedCount = 0;

	elements.forEach((element) => {
		// Skip if element explicitly has the ignore class
		if (element.classList.contains('btn-standard-ignore')) {
			return;
		}

		// Skip if element already has .btn-standard
		if (element.classList.contains('btn-standard')) {
			return;
		}

		// Apply .btn-standard class
		element.classList.add('btn-standard');
		appliedCount++;
	});

	// Log result for debugging (can be removed in production)
	if (appliedCount > 0) {
		console.log(`[Button Standardization] Applied .btn-standard to ${appliedCount} element(s)`);
	}
}

// Apply on DOM ready
document.addEventListener('DOMContentLoaded', applySharedButtonClass);

/**
 * Auto-enhance Report Problem links
 * Automatically adds current page URL to report-problem.html links
 * so the form can auto-detect where the user came from
 */
function enhanceReportProblemLinks() {
	// Find all links to report-problem.html
	const reportLinks = document.querySelectorAll('a[href="report-problem.html"], a[href*="report-problem.html"]');

	reportLinks.forEach(link => {
		// Add click handler to append current page URL
		link.addEventListener('click', function(e) {
			e.preventDefault();

			// Get current page URL (without query params)
			const currentPage = window.location.href.split('?')[0];

			// Build report URL with 'from' parameter
			const reportUrl = 'report-problem.html?from=' + encodeURIComponent(currentPage);

			// Navigate to report page
			window.location.href = reportUrl;
		});
	});

	console.log(`[Report Links] Enhanced ${reportLinks.length} report-problem link(s)`);
}

// Apply on DOM ready
document.addEventListener('DOMContentLoaded', enhanceReportProblemLinks);