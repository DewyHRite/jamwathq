/**
 * Share Experience Page - Main Application Logic
 * Extracted from inline scripts for CSP compliance
 */

// ========================================
			// CONFIGURATION
			// ========================================

			// Backend API base URL is already defined in auth-client.js
			// No need to redeclare it here

			// ========================================
			// OAUTH AUTHENTICATION
			// ========================================

			// Store pending review data for TOS confirmation
			let pendingReviewData = null;

			// User authentication status
			let isUserLoggedIn = false;

			// Current user info from Google OAuth
			let currentUser = {
				firstName: '',
				profilePic: '',
				email: '',
				googleId: ''
			};

			// Check if user is already logged in from server session
			async function checkExistingSession() {
				try {
					const status = await window.authManager.checkAuthStatus();
					if (status.authenticated && status.user) {
						isUserLoggedIn = true;
						currentUser = {
							firstName: status.user.firstName || '',
							profilePic: status.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(status.user.firstName || 'User')}&background=ffee00&color=000`,
							email: status.user.email || '',
							userId: status.user._id || status.user.id || ''
						};
						console.log('User session restored from server:', currentUser);
					} else {
						isUserLoggedIn = false;
						currentUser = {
							firstName: '',
							profilePic: '',
							email: '',
							userId: ''
						};
						console.log('No active session on server');
					}
					// updateHUD() call removed - now using Profile Hub instead
				} catch (error) {
					console.error('Error checking session:', error);
					isUserLoggedIn = false;
				}
			}

			// Handle OAuth login redirect - use centralized auth manager
			function initiateGoogleLogin() {
				window.authManager.loginWithGoogle();
			}

			function initiateFacebookLogin() {
				window.authManager.loginWithFacebook();
			}

			// Logout function - use centralized auth manager
			function logout() {
				window.authManager.logout();
			}
			// OLD updateHUD() function removed - now using Profile Hub instead


			// Login Modal Functions
			function openLoginModal() {
				const modal = document.getElementById("loginModal");
				modal.style.display = "block";
				// Focus first focusable element (Google sign-in button)
				setTimeout(() => {
					const focusableElement = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
					if (focusableElement) focusableElement.focus();
				}, 100);
			}

			function closeLoginModal() {
				const modal = document.getElementById("loginModal");
				modal.style.display = "none";
			}

			// TOS Modal Functions
			function openTOSModal() {
				const modal = document.getElementById("tosModal");
				const checkbox = document.getElementById("tosCheckbox");
				checkbox.checked = false;
				toggleTOSAcceptButton();
				modal.style.display = "block";
				// Focus checkbox for accessibility
				setTimeout(() => {
					if (checkbox) checkbox.focus();
				}, 100);
			}

			function closeTOSModal() {
				const modal = document.getElementById("tosModal");
				modal.style.display = "none";
			}

			function toggleTOSAcceptButton() {
				const checkbox = document.getElementById("tosCheckbox");
				const acceptBtn = document.getElementById("tosAcceptBtn");
				acceptBtn.disabled = !checkbox.checked;
			}

			function acceptTOS() {
				closeTOSModal();

				if (!pendingReviewData) {
					alert("No pending experience data found.");
					return;
				}

				// Execute the actual submit function
				submitExperienceConfirmed(pendingReviewData);
				pendingReviewData = null;
			}

			function declineTOS() {
				closeTOSModal();
				pendingReviewData = null;
				alert('Experience submission cancelled. Your experience has not been saved.');
			}

			// U.S. Legal Modal Functions
			function openUSLegalModal(event) {
				if (event) event.preventDefault();
				const modal = document.getElementById("usLegalModal");
				modal.style.display = "block";
				// Focus close button for accessibility
				setTimeout(() => {
					const closeBtn = modal.querySelector('.close-modal-btn');
					if (closeBtn) closeBtn.focus();
				}, 100);
			}

			function closeUSLegalModal() {
				const modal = document.getElementById("usLegalModal");
				modal.style.display = "none";
			}

			// ========================================
			// STATE SELECTION & FORM
			// ========================================

			// Simpler approach using list-based selection
			const usStates = [
				'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
				'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
				'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
				'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
				'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
				'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
				'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
			];

			// US State to Cities mapping - Comprehensive city list for J-1 programs
			const stateToCities = {
				'Alabama': ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa', 'Hoover', 'Dothan', 'Auburn', 'Decatur', 'Madison'],
				'Alaska': ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan', 'Wasilla', 'Kenai', 'Kodiak', 'Bethel', 'Palmer'],
				'Arizona': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert', 'Tempe', 'Peoria', 'Surprise', 'Yuma', 'Flagstaff', 'Sedona', 'Lake Havasu City'],
				'Arkansas': ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro', 'North Little Rock', 'Conway', 'Rogers', 'Pine Bluff', 'Bentonville'],
				'California': ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside', 'Stockton', 'Irvine', 'Chula Vista', 'Fremont', 'San Bernardino', 'Modesto', 'Fontana', 'Oxnard', 'Moreno Valley', 'Huntington Beach', 'Glendale', 'Santa Clarita', 'Garden Grove', 'Oceanside', 'Rancho Cucamonga', 'Santa Rosa', 'Ontario', 'Lancaster', 'Elk Grove', 'Corona', 'Palmdale', 'Salinas', 'Pomona', 'Hayward', 'Escondido', 'Torrance', 'Sunnyvale', 'Orange', 'Fullerton', 'Pasadena', 'Thousand Oaks', 'Visalia', 'Simi Valley', 'Concord', 'Roseville', 'Victorville', 'Santa Clara', 'Vallejo', 'Berkeley', 'El Monte', 'Downey', 'Costa Mesa', 'Inglewood', 'Carlsbad', 'San Buenaventura (Ventura)', 'Fairfield', 'West Covina', 'Murrieta', 'Richmond', 'Norwalk', 'Antioch', 'Temecula', 'Burbank', 'Daly City', 'Rialto', 'Santa Maria', 'El Cajon', 'San Mateo', 'Clovis', 'Compton', 'Jurupa Valley', 'Vista', 'South Gate', 'Mission Viejo', 'Vacaville', 'Carson', 'Hesperia', 'Santa Monica', 'Westminster', 'Redding', 'Santa Barbara', 'Chico', 'Newport Beach', 'San Marcos', 'Whittier', 'Hawthorne', 'Citrus Heights', 'Tracy', 'Alhambra', 'Livermore', 'Buena Park', 'Menifee', 'Hemet', 'Lakewood', 'Merced', 'Chino', 'Indio', 'Redwood City', 'Lake Forest', 'Napa', 'Tustin', 'Bellflower', 'Mountain View', 'Chino Hills', 'Baldwin Park', 'Alameda', 'Upland', 'San Ramon', 'Folsom', 'Pleasanton', 'Union City', 'Perris', 'Manteca', 'Lynwood', 'Apple Valley', 'Redlands', 'Turlock', 'Milpitas', 'Redondo Beach', 'Rancho Cordova', 'Yorba Linda', 'Palo Alto', 'Davis', 'Camarillo', 'Walnut Creek', 'Pittsburg', 'South San Francisco', 'Yuba City', 'San Clemente', 'Laguna Niguel', 'Pico Rivera', 'Montebello', 'Lodi', 'Madera', 'Santa Cruz', 'La Habra', 'Encinitas', 'Monterey Park', 'Tulare', 'Cupertino', 'Gardena', 'National City', 'Rocklin', 'Petaluma', 'Huntington Park', 'San Rafael', 'La Mesa', 'Arcadia', 'Fountain Valley', 'Diamond Bar', 'Woodland', 'Santee', 'Lake Elsinore', 'Porterville', 'Paramount', 'Eastvale', 'Rosemead', 'Hanford', 'Highland', 'Brentwood', 'Novato', 'Colton', 'Cathedral City', 'Delano', 'Yucaipa', 'Watsonville', 'Placentia', 'Glendora', 'Gilroy', 'Palm Desert', 'Cerritos', 'West Sacramento', 'Aliso Viejo', 'Poway', 'La Mirada', 'Rancho Santa Margarita', 'Cypress', 'Dublin', 'Covina', 'Azusa', 'La Puente', 'Gardena', 'Monrovia', 'Millbrae'],
				'Colorado': ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Arvada', 'Westminster', 'Pueblo', 'Centennial', 'Boulder', 'Greeley', 'Longmont', 'Loveland', 'Grand Junction', 'Broomfield', 'Castle Rock', 'Commerce City', 'Parker', 'Littleton', 'Northglenn'],
				'Connecticut': ['Bridgeport', 'New Haven', 'Stamford', 'Hartford', 'Waterbury', 'Norwalk', 'Danbury', 'New Britain', 'Bristol', 'Meriden', 'Milford', 'West Haven', 'Middletown', 'Norwich', 'Shelton'],
				'Delaware': ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna', 'Milford', 'Seaford', 'Georgetown', 'Elsmere', 'New Castle'],
				'Florida': ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Port St. Lucie', 'Cape Coral', 'Tallahassee', 'Fort Lauderdale', 'Pembroke Pines', 'Hollywood', 'Miramar', 'Coral Springs', 'Clearwater', 'Miami Gardens', 'Palm Bay', 'West Palm Beach', 'Pompano Beach', 'Lakeland', 'Davie', 'Miami Beach', 'Sunrise', 'Plantation', 'Boca Raton', 'Deltona', 'Largo', 'Deerfield Beach', 'Palm Coast', 'Melbourne', 'Boynton Beach', 'Lauderhill', 'Weston', 'Fort Myers', 'Kissimmee', 'Homestead', 'Tamarac', 'Delray Beach', 'Daytona Beach', 'North Miami', 'Wellington', 'North Port', 'Jupiter', 'Ocala', 'Port Orange', 'Margate', 'Coconut Creek', 'Sanford', 'Sarasota', 'Pensacola', 'Bradenton', 'Palm Beach Gardens', 'Pinellas Park', 'Coral Gables', 'Doral', 'Bonita Springs', 'Apopka', 'Titusville', 'North Miami Beach', 'Oakland Park', 'Fort Pierce', 'North Lauderdale', 'Cutler Bay', 'Altamonte Springs', 'St. Cloud', 'Greenacres', 'Ormond Beach', 'Ocoee', 'Hallandale Beach', 'Winter Garden', 'Aventura', 'Winter Springs', 'Key West', 'Key Largo', 'Marathon', 'Islamorada', 'Naples', 'Panama City Beach', 'Destin', 'Fort Walton Beach', 'Cocoa Beach', 'Vero Beach', 'St. Augustine', 'Amelia Island'],
				'Georgia': ['Atlanta', 'Columbus', 'Augusta', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell', 'Macon', 'Johns Creek', 'Albany', 'Warner Robins', 'Alpharetta', 'Marietta', 'Valdosta', 'Smyrna', 'Dunwoody', 'Rome', 'East Point', 'Milton', 'Gainesville', 'Hinesville', 'Peachtree Corners', 'Newnan', 'Duluth', 'Brookhaven'],
				'Hawaii': ['Honolulu', 'Pearl City', 'Hilo', 'Kailua', 'Waipahu', 'Kaneohe', 'Mililani', 'Kahului', 'Ewa Gentry', 'Kihei', 'Mililani Town', 'Makakilo', 'Wahiawa', 'Schofield Barracks', 'Halawa', 'Waikiki', 'Lahaina', 'Kona', 'Waimea', 'Princeville', 'Kaanapali', 'Wailea', 'Poipu'],
				'Idaho': ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello', 'Caldwell', 'Coeur d\'Alene', 'Twin Falls', 'Lewiston', 'Post Falls', 'Rexburg', 'Eagle', 'Moscow', 'Kuna', 'Ammon'],
				'Illinois': ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield', 'Elgin', 'Peoria', 'Champaign', 'Waukegan', 'Cicero', 'Bloomington', 'Arlington Heights', 'Evanston', 'Decatur', 'Schaumburg', 'Bolingbrook', 'Palatine', 'Skokie', 'Des Plaines', 'Orland Park', 'Tinley Park', 'Oak Lawn', 'Berwyn', 'Mount Prospect', 'Normal', 'Wheaton', 'Hoffman Estates', 'Oak Park', 'Downers Grove', 'Elmhurst', 'Glenview', 'DeKalb', 'Lombard', 'Belleville', 'Moline', 'Buffalo Grove', 'Bartlett', 'Urbana', 'Quincy', 'Crystal Lake', 'Plainfield', 'Streamwood', 'Carol Stream', 'Romeoville', 'Rock Island', 'Hanover Park', 'Carpentersville', 'Wheeling', 'Park Ridge', 'Addison', 'Calumet City'],
				'Indiana': ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers', 'Bloomington', 'Hammond', 'Gary', 'Muncie', 'Lafayette', 'Terre Haute', 'Kokomo', 'Anderson', 'Noblesville', 'Greenwood', 'Elkhart', 'Mishawaka', 'Lawrence', 'Jeffersonville', 'Columbus', 'Portage'],
				'Iowa': ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City', 'Waterloo', 'Council Bluffs', 'Ames', 'West Des Moines', 'Dubuque', 'Ankeny', 'Urbandale', 'Cedar Falls', 'Marion', 'Bettendorf'],
				'Kansas': ['Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Topeka', 'Lawrence', 'Shawnee', 'Manhattan', 'Lenexa', 'Salina', 'Hutchinson', 'Leavenworth', 'Leawood', 'Dodge City', 'Garden City'],
				'Kentucky': ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington', 'Richmond', 'Georgetown', 'Florence', 'Elizabethtown', 'Hopkinsville', 'Nicholasville', 'Henderson', 'Jeffersontown', 'Frankfort', 'Paducah'],
				'Louisiana': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles', 'Kenner', 'Bossier City', 'Monroe', 'Alexandria', 'Houma', 'New Iberia', 'Slidell', 'Prairieville', 'Central', 'Ruston'],
				'Maine': ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn', 'Biddeford', 'Sanford', 'Augusta', 'Saco', 'Westbrook', 'Waterville', 'Presque Isle', 'Brewer', 'Bath', 'Caribou'],
				'Maryland': ['Baltimore', 'Columbia', 'Germantown', 'Silver Spring', 'Waldorf', 'Glen Burnie', 'Ellicott City', 'Frederick', 'Dundalk', 'Rockville', 'Bethesda', 'Gaithersburg', 'Towson', 'Bowie', 'Aspen Hill', 'Wheaton', 'Potomac', 'Catonsville', 'Severn', 'Odenton'],
				'Massachusetts': ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton', 'Quincy', 'Lynn', 'New Bedford', 'Fall River', 'Newton', 'Lawrence', 'Somerville', 'Framingham', 'Haverhill', 'Waltham', 'Malden', 'Brookline', 'Plymouth', 'Medford', 'Taunton', 'Chicopee', 'Weymouth', 'Revere', 'Peabody', 'Methuen', 'Barnstable', 'Pittsfield', 'Attleboro', 'Arlington'],
				'Michigan': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Flint', 'Dearborn', 'Livonia', 'Clinton Township', 'Canton Township', 'Westland', 'Troy', 'Farmington Hills', 'Macomb Township', 'Kalamazoo', 'Shelby Township', 'Wyoming', 'Southfield', 'Rochester Hills', 'Taylor', 'St. Clair Shores', 'Pontiac', 'Royal Oak', 'Novi', 'Dearborn Heights', 'Battle Creek', 'Saginaw', 'Kentwood', 'East Lansing', 'Roseville', 'Portage', 'Midland', 'Lincoln Park', 'Muskegon', 'Traverse City', 'Holland', 'Bay City', 'Jackson', 'Marquette', 'Alpena', 'Petoskey', 'Mackinaw City', 'Escanaba', 'Sault Ste. Marie'],
				'Minnesota': ['Minneapolis', 'St. Paul', 'Rochester', 'Duluth', 'Bloomington', 'Brooklyn Park', 'Plymouth', 'St. Cloud', 'Eagan', 'Woodbury', 'Maple Grove', 'Eden Prairie', 'Coon Rapids', 'Burnsville', 'Blaine', 'Lakeville', 'Minnetonka', 'Apple Valley', 'Edina', 'St. Louis Park', 'Moorhead', 'Mankato', 'Shakopee', 'Maplewood', 'Cottage Grove'],
				'Mississippi': ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi', 'Meridian', 'Tupelo', 'Olive Branch', 'Greenville', 'Horn Lake', 'Pearl', 'Clinton', 'Madison', 'Ridgeland', 'Starkville'],
				'Missouri': ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence', 'Lee\'s Summit', 'O\'Fallon', 'St. Joseph', 'St. Charles', 'St. Peters', 'Blue Springs', 'Florissant', 'Joplin', 'Chesterfield', 'Jefferson City', 'Cape Girardeau', 'Oakville', 'Wildwood', 'University City', 'Ballwin', 'Raytown', 'Liberty', 'Wentzville', 'Nixa', 'Mehlville'],
				'Montana': ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte', 'Helena', 'Kalispell', 'Havre', 'Anaconda', 'Miles City', 'Belgrade', 'Livingston', 'Laurel', 'Whitefish', 'Lewistown'],
				'Nebraska': ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney', 'Fremont', 'Hastings', 'Norfolk', 'Columbus', 'Papillion', 'North Platte', 'La Vista', 'Scottsbluff', 'South Sioux City', 'Beatrice'],
				'Nevada': ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City', 'Fernley', 'Elko', 'Mesquite', 'Boulder City', 'Fallon', 'Winnemucca', 'West Wendover', 'Ely', 'Yerington'],
				'New Hampshire': ['Manchester', 'Nashua', 'Concord', 'Derry', 'Dover', 'Rochester', 'Salem', 'Merrimack', 'Hudson', 'Londonderry', 'Keene', 'Bedford', 'Portsmouth', 'Goffstown', 'Laconia'],
				'New Jersey': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Woodbridge', 'Lakewood', 'Toms River', 'Hamilton Township', 'Trenton', 'Clifton', 'Camden', 'Brick Township', 'Cherry Hill', 'Passaic', 'Union City', 'Old Bridge', 'Gloucester Township', 'East Orange', 'Bayonne', 'Franklin Township', 'North Bergen', 'Vineland', 'Union', 'Piscataway', 'New Brunswick', 'Jackson Township', 'Wayne', 'Irvington', 'Parsippany-Troy Hills', 'Howell', 'Perth Amboy', 'Hoboken', 'Plainfield', 'West New York', 'Washington Township', 'Hackensack', 'Sayreville', 'Kearny', 'Linden', 'Atlantic City'],
				'New Mexico': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell', 'Farmington', 'South Valley', 'Clovis', 'Hobbs', 'Alamogordo', 'Carlsbad', 'Gallup', 'Deming', 'Los Lunas', 'Chaparral'],
				'New York': ['New York City (Manhattan, Brooklyn, Queens, Bronx, Staten Island)', 'Buffalo', 'Yonkers', 'Rochester', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon', 'Schenectady', 'Utica', 'White Plains', 'Hempstead', 'Troy', 'Niagara Falls', 'Binghamton', 'Freeport', 'Valley Stream', 'Long Beach', 'Spring Valley', 'Poughkeepsie', 'West Seneca', 'Glens Falls', 'Rome', 'Ithaca', 'North Tonawanda', 'Jamestown'],
				'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington', 'High Point', 'Concord', 'Greenville', 'Asheville', 'Gastonia', 'Jacksonville', 'Chapel Hill', 'Rocky Mount', 'Burlington', 'Wilson', 'Huntersville', 'Kannapolis', 'Apex', 'Hickory', 'Goldsboro', 'Indian Trail', 'Mooresville'],
				'North Dakota': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo', 'Williston', 'Dickinson', 'Mandan', 'Jamestown', 'Wahpeton', 'Devils Lake', 'Valley City', 'Grafton', 'Watford City', 'Lincoln'],
				'Ohio': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton', 'Youngstown', 'Lorain', 'Hamilton', 'Springfield', 'Kettering', 'Elyria', 'Lakewood', 'Cuyahoga Falls', 'Middletown', 'Euclid', 'Newark', 'Mansfield', 'Mentor', 'Beavercreek', 'Cleveland Heights', 'Strongsville', 'Dublin', 'Fairfield', 'Warren', 'Findlay', 'Lancaster', 'Lima', 'Huber Heights', 'Westerville', 'Marion', 'Grove City'],
				'Oklahoma': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Edmond', 'Lawton', 'Moore', 'Midwest City', 'Enid', 'Stillwater', 'Muskogee', 'Bartlesville', 'Owasso', 'Shawnee', 'Ponca City', 'Ardmore', 'Duncan', 'Bixby', 'Del City', 'Yukon'],
				'Oregon': ['Portland', 'Eugene', 'Salem', 'Gresham', 'Hillsboro', 'Beaverton', 'Bend', 'Medford', 'Springfield', 'Corvallis', 'Albany', 'Tigard', 'Lake Oswego', 'Keizer', 'Grants Pass', 'Oregon City', 'McMinnville', 'Redmond', 'Tualatin', 'West Linn'],
				'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem', 'Lancaster', 'Harrisburg', 'Altoona', 'York', 'State College', 'Wilkes-Barre', 'Chester', 'Williamsport', 'Easton', 'Lebanon', 'Hazleton', 'New Castle', 'Johnstown', 'McKeesport', 'Hermitage', 'Greensburg', 'Lower Merion', 'Monroeville'],
				'Rhode Island': ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence', 'Woonsocket', 'Coventry', 'Cumberland', 'North Providence', 'South Kingstown', 'West Warwick', 'Johnston', 'North Kingstown', 'Bristol', 'Westerly'],
				'South Carolina': ['Columbia', 'Charleston', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville', 'Summerville', 'Sumter', 'Goose Creek', 'Hilton Head Island', 'Florence', 'Spartanburg', 'Myrtle Beach', 'Aiken', 'Anderson', 'Greer', 'Mauldin', 'Greenwood', 'North Augusta', 'Easley'],
				'South Dakota': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown', 'Mitchell', 'Yankton', 'Pierre', 'Huron', 'Vermillion', 'Box Elder', 'Spearfish', 'Brandon', 'Sturgis', 'Harrisburg'],
				'Tennessee': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin', 'Jackson', 'Johnson City', 'Bartlett', 'Hendersonville', 'Kingsport', 'Collierville', 'Smyrna', 'Cleveland', 'Brentwood', 'Germantown', 'Columbia', 'Spring Hill', 'La Vergne'],
				'Texas': ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Laredo', 'Lubbock', 'Garland', 'Irving', 'Amarillo', 'Grand Prairie', 'Brownsville', 'Pasadena', 'McKinney', 'Mesquite', 'McAllen', 'Killeen', 'Frisco', 'Waco', 'Carrollton', 'Denton', 'Midland', 'Abilene', 'Beaumont', 'Round Rock', 'Odessa', 'Wichita Falls', 'Richardson', 'Lewisville', 'Tyler', 'College Station', 'Pearland', 'San Angelo', 'Allen', 'League City', 'Sugar Land', 'Edinburg', 'Longview', 'Mission', 'Bryan', 'Baytown', 'Pharr', 'Temple', 'Missouri City', 'Flower Mound', 'Harlingen', 'North Richland Hills', 'Victoria', 'Conroe', 'New Braunfels', 'Mansfield', 'Cedar Park', 'Rowlett', 'Port Arthur', 'Euless', 'Georgetown', 'Pflugerville', 'DeSoto', 'San Marcos', 'Grapevine', 'Bedford', 'Galveston', 'Cedar Hill', 'Texas City', 'Wylie', 'Haltom City', 'Keller', 'Coppell', 'Rockwall', 'Huntsville', 'Duncanville', 'Sherman', 'The Colony', 'Burleson', 'Hurst', 'Lancaster', 'Texarkana', 'Friendswood', 'Weslaco'],
				'Utah': ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy', 'Ogden', 'St. George', 'Layton', 'Taylorsville', 'South Jordan', 'Lehi', 'Logan', 'Murray', 'Draper', 'Bountiful', 'Riverton', 'Roy', 'Spanish Fork', 'Pleasant Grove'],
				'Vermont': ['Burlington', 'Essex', 'South Burlington', 'Colchester', 'Rutland', 'Bennington', 'Brattleboro', 'Hartford', 'Milton', 'Barre', 'Montpelier', 'Middlebury', 'St. Albans', 'Winooski', 'Williston'],
				'Virginia': ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria', 'Hampton', 'Roanoke', 'Portsmouth', 'Suffolk', 'Lynchburg', 'Harrisonburg', 'Leesburg', 'Charlottesville', 'Blacksburg', 'Danville', 'Manassas', 'Petersburg', 'Fredericksburg', 'Winchester', 'Salem', 'Staunton', 'Herndon', 'Waynesboro', 'Christiansburg'],
				'Washington': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Spokane Valley', 'Federal Way', 'Yakima', 'Bellingham', 'Kennewick', 'Auburn', 'Pasco', 'Marysville', 'Lakewood', 'Redmond', 'Shoreline', 'Richland', 'Kirkland', 'Burien', 'Sammamish', 'Olympia', 'Lacey', 'Edmonds', 'Bremerton', 'Puyallup', 'Pullman', 'Wenatchee'],
				'West Virginia': ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling', 'Weirton', 'Fairmont', 'Beckley', 'Martinsburg', 'Clarksburg', 'South Charleston', 'St. Albans', 'Vienna', 'Bluefield', 'Bridgeport'],
				'Wisconsin': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha', 'Eau Claire', 'Oshkosh', 'Janesville', 'West Allis', 'La Crosse', 'Sheboygan', 'Wauwatosa', 'Fond du Lac', 'New Berlin', 'Wausau', 'Brookfield', 'Greenfield', 'Beloit', 'Franklin', 'Oak Creek', 'Manitowoc', 'West Bend', 'Sun Prairie'],
				'Wyoming': ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs', 'Sheridan', 'Green River', 'Evanston', 'Riverton', 'Jackson', 'Cody', 'Rawlins', 'Lander', 'Torrington', 'Powell']
			};

			// Currently selected state
			let selectedState = null;
			let selectedRating = 0;

			// State review data (sample data - in production this would come from a database)
			let stateReviews = {};

			// Initialize with zero data (no reviews yet)
			function initializeStateData() {
				usStates.forEach(state => {
					stateReviews[state] = {
						reviewCount: 0,
						avgRating: 0,
						avgWage: 0,
						totalRating: 0
					};
				});
			
			// Render scoreboard immediately with initial data
			renderScoreboard();
			}

			// Initialize the state grid
			function initializeMap() {
				const grid = document.getElementById('states-grid');

				usStates.forEach(stateName => {
					const button = document.createElement('div');
					button.className = 'state-button';
					button.textContent = stateName;
					button.setAttribute('data-state', stateName);

					button.addEventListener('click', function() {
						openModal(stateName);
					});

					grid.appendChild(button);
				});
			}

			// Populate city dropdown based on selected state
			function populateCityDropdown(stateName) {
				const citySelect = document.getElementById('city');
				const cities = stateToCities[stateName] || [];

				// Clear existing options
				citySelect.innerHTML = '';

				// Add placeholder option
				const placeholderOption = document.createElement('option');
				placeholderOption.value = '';
				placeholderOption.disabled = true;
				placeholderOption.selected = true;
				placeholderOption.textContent = cities.length > 0 ? 'Select a city...' : 'No cities available';
				citySelect.appendChild(placeholderOption);

				// Add city options
				cities.forEach(city => {
					const option = document.createElement('option');
					option.value = city;
					option.textContent = city;
					citySelect.appendChild(option);
				});

				// Add "Other" option to allow custom input
				const otherOption = document.createElement('option');
				otherOption.value = 'Other';
				otherOption.textContent = 'Other (not listed)';
				citySelect.appendChild(otherOption);
			}

			// Modal functions
			function openModal(stateName) {
				selectedState = stateName;
				const modal = document.getElementById('reviewModal');
				const modalTitle = document.getElementById('modalTitle');
				modalTitle.textContent = `Share Your Experience in ${stateName}`;
				modal.classList.add('show');

				// Populate city dropdown for this state
				populateCityDropdown(stateName);

				// Highlight selected state button
				document.querySelectorAll('.state-button').forEach(button => {
					button.classList.remove('selected');
				});
				const selectedButton = document.querySelector(`.state-button[data-state="${stateName}"]`);
				if (selectedButton) {
					selectedButton.classList.add('selected');
				}
			}

			function closeModal() {
				const modal = document.getElementById('reviewModal');
				modal.classList.remove('show');
				resetForm();
			}

			// Star rating function
			function setRating(rating) {
				selectedRating = rating;
				document.getElementById('rating').value = rating;

				const stars = document.querySelectorAll('.star-rating i');
				stars.forEach((star, index) => {
					if (index < rating) {
						star.classList.remove('far');
						star.classList.add('fas', 'active');
					} else {
						star.classList.remove('fas', 'active');
						star.classList.add('far');
					}
				});
			}

			// Form submission - Step 1: Validate and check login
			async function submitExperience(event) {
				event.preventDefault();

				// STEP 1: Validate rating is selected
				if (selectedRating === 0) {
					alert('Please select a rating before submitting.');
					return;
				}

				// STEP 2: Check if user is logged in
				if (!isUserLoggedIn) {
					console.log('User not logged in - showing login modal');

					// Store pending review data
					const formData = {
						state: selectedState,
						jobTitle: document.getElementById('jobTitle').value,
						employer: document.getElementById('employer').value,
						city: document.getElementById('city').value,
						wages: document.getElementById('wages').value,
						hoursPerWeek: document.getElementById('hoursPerWeek').value,
						rating: selectedRating,
						usageFrequency: document.getElementById('usageFrequency').value,
						experience: document.getElementById('experience').value
					};

					pendingReviewData = formData;

					// Store in sessionStorage to persist through OAuth redirect
					sessionStorage.setItem('pendingReviewData', JSON.stringify(formData));

					// Show login modal
					openLoginModal();
					return;
				}

				// STEP 3: User is logged in, collect form data
				const formData = {
					state: selectedState,
					jobTitle: document.getElementById('jobTitle').value,
					employer: document.getElementById('employer').value,
					city: document.getElementById('city').value,
					wages: document.getElementById('wages').value,
					hoursPerWeek: document.getElementById('hoursPerWeek').value,
					rating: selectedRating,
					usageFrequency: document.getElementById('usageFrequency').value,
					experience: document.getElementById('experience').value
				};

				// Store pending review data for TOS confirmation
				pendingReviewData = formData;

				// Show TOS modal - user must accept before submission
				openTOSModal();
			}

			// Form submission - Step 2: Actually submit after TOS acceptance
			async function submitExperienceConfirmed(formData) {
				try {
					// Add user info and TOS acceptance to formData
					const submissionData = {
						state: formData.state,
						jobTitle: formData.jobTitle,
						employer: formData.employer,
						city: formData.city,
						wages: formData.wages,
						hoursPerWeek: formData.hoursPerWeek,
						rating: formData.rating,
						experience: formData.experience,
						timesUsed: parseInt(formData.usageFrequency),
						tosAccepted: true  // User accepted TOS in modal
					};

					console.log('Submitting experience to backend:', submissionData);

					// Get CSRF token first
					const csrfResponse = await fetch(`${API_BASE_URL}/api/csrf-token`, {
						method: 'GET',
						credentials: 'include'
					});
					const csrfData = await csrfResponse.json();
					const csrfToken = csrfData.csrfToken;

					// Submit to backend API
					const response = await fetch(`${API_BASE_URL}/api/reviews`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'CSRF-Token': csrfToken
						},
						credentials: 'include',
						body: JSON.stringify(submissionData)
					});

					const result = await response.json();

					if (result.success) {
						// Extract numeric wage value for local update
						const wageValue = parseFloat(formData.wages.replace(/[^0-9.]/g, '')) || 0;

						// Update local scoreboard
						updateStateReview(selectedState, selectedRating, wageValue);

						alert(`Thank you for sharing your experience in ${selectedState}! Your experience has been submitted successfully.`);
						closeModal();

						// Reload stats from server
						await loadStatsFromServer();
					} else {
						alert(`Failed to submit experience: ${result.message || 'Please try again.'}`);
					}
				} catch (error) {
					console.error('Error submitting experience:', error);
					alert('An error occurred while submitting your experience. Please check your internet connection and try again.');
				}
			}

			// Hourly wage input validation and formatting
			function formatWageInput(event) {
				const input = event.target;
				let value = input.value;

				// Remove all non-numeric characters except period and dollar sign
				value = value.replace(/[^0-9.]/g, '');

				// Ensure only one decimal point
				const parts = value.split('.');
				if (parts.length > 2) {
					value = parts[0] + '.' + parts.slice(1).join('');
				}

				// Limit to 2 decimal places
				if (parts.length === 2 && parts[1].length > 2) {
					value = parts[0] + '.' + parts[1].substring(0, 2);
				}

				// Add dollar sign prefix if there's a value
				if (value && !value.startsWith('$')) {
					value = '$' + value;
				}

				input.value = value;
			}

			// Prevent non-numeric keypress on wage input
			function validateWageKeyPress(event) {
				const char = String.fromCharCode(event.which);
				// Allow: numbers, period, backspace, delete, tab, arrow keys
				if (!/[0-9.]/.test(char) && event.which !== 8 && event.which !== 46 && event.which !== 9 && !(event.which >= 37 && event.which <= 40)) {
					event.preventDefault();
					return false;
				}
				return true;
			}

			// Reset form
			function resetForm() {
				document.getElementById('experienceForm').reset();
				selectedRating = 0;
				document.querySelectorAll('.star-rating i').forEach(star => {
					star.classList.remove('fas', 'active');
					star.classList.add('far');
				});
				document.querySelectorAll('.state-button').forEach(button => {
					button.classList.remove('selected');
				});
			}

			// Close modal when clicking outside
			window.onclick = function(event) {
				const modal = document.getElementById('reviewModal');
				if (event.target == modal) {
					closeModal();
				}
			}

			// Load stats from server
			async function loadStatsFromServer() {
				try {
					// Fetch stats from backend API
					const response = await fetch(`${API_BASE_URL}/api/reviews/stats`, {
						method: 'GET',
						credentials: 'include'
					});

					if (!response.ok) {
						throw new Error('Failed to fetch stats');
					}

					const data = await response.json();

					if (data.success && data.stats) {
						// Update local stateReviews with server data
						data.stats.forEach(stat => {
							if (stateReviews[stat.state]) {
								stateReviews[stat.state] = {
									reviewCount: stat.reviewCount,
									avgRating: parseFloat(stat.avgRating),
									avgWage: parseFloat(stat.avgWage),
									totalRating: stat.avgRating * stat.reviewCount
								};
							}
						});
					}

					// Render scoreboard with updated data
					renderScoreboard();
				} catch (error) {
					console.error('Error loading stats from server:', error);
					// Fall back to local data
					renderScoreboard();
				}
			}

			// Load analytics from server (visitor count and average revisit)
			async function loadAnalyticsFromServer() {
				try {
					const response = await fetch(`${API_BASE_URL}/api/reviews/analytics`, {
						method: 'GET',
						credentials: 'include'
					});

					if (!response.ok) {
						throw new Error('Failed to fetch analytics');
					}

					const data = await response.json();

					if (data.success && data.analytics) {
						// Store analytics data globally for display
						window.stateAnalytics = {};
						data.analytics.forEach(analytic => {
							window.stateAnalytics[analytic.state] = {
								totalVisitors: analytic.totalVisitors,
								avgRevisit: analytic.avgRevisit
							};
						});

						// Re-render scoreboard with analytics data
						renderScoreboard();
					}
				} catch (error) {
					console.error('Error loading analytics from server:', error);
					window.stateAnalytics = {};
				}
			}

			// Render scoreboard with ALL 50 US states (10x5 grid) ranked by rating
			function renderScoreboard() {
				const container = document.getElementById('scoreboard-container');

				// Sort states: reviewed states by rating (descending), then unreviewed states alphabetically
				const sortedStates = Object.entries(stateReviews)
					.sort((a, b) => {
				const [stateA, dataA] = a;
				const [stateB, dataB] = b;

				// If both have reviews, sort by rating (descending)
				if (dataA.reviewCount > 0 && dataB.reviewCount > 0) {
					return dataB.avgRating - dataA.avgRating;
				}

				// If only one has reviews, prioritize it
				if (dataA.reviewCount > 0) return -1;
				if (dataB.reviewCount > 0) return 1;

				// If neither has reviews, sort alphabetically
				return stateA.localeCompare(stateB);
			});
			// Showing ALL 50 states (no slice limit)

				const scoreboardHTML = `
					<div class="scoreboard-list">
						${sortedStates.map((entry, index) => {
							const [state, data] = entry;
							const rank = index + 1;
							const isTop3 = rank <= 3;

							// Get analytics data if available
							const analytics = window.stateAnalytics && window.stateAnalytics[state];
							const visitorInfo = analytics
								? `<div style="color: #28a745; font-size: 0.9em; margin-top: 0.3em;">
									<i class="fas fa-users"></i> ${analytics.totalVisitors} visitors |
									<i class="fas fa-redo"></i> Avg. ${analytics.avgRevisit}x revisit
								   </div>`
								: '';

							// Generate star display
							const fullStars = Math.floor(data.avgRating);
							const hasHalfStar = data.avgRating % 1 >= 0.5;
							let starsHTML = '';

							for (let i = 0; i < fullStars; i++) {
								starsHTML += '<i class="fas fa-star"></i>';
							}
							if (hasHalfStar) {
								starsHTML += '<i class="fas fa-star-half-alt"></i>';
							}
							for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
								starsHTML += '<i class="far fa-star"></i>';
							}

							return `
								<div class="scoreboard-item" onclick="openReviewsPopup('${state}')" style="cursor: pointer;" role="button" tabindex="0" aria-label="View reviews for ${state}">
									<div class="scoreboard-rank ${isTop3 ? 'top3' : ''}">#${rank}</div>
									<div class="scoreboard-state">${state}</div>
									<div class="scoreboard-stats">
										<div class="scoreboard-rating">
											<span class="scoreboard-stars">${starsHTML}</span>
											<span>${data.avgRating.toFixed(1)}</span>
										</div>
										<div class="scoreboard-reviews">${data.reviewCount} reviews</div>
									</div>
									<div class="scoreboard-avg-wage">Avg. Wage: $${data.avgWage}/hr</div>
									${visitorInfo}
								</div>
							`;
						}).join('')}
					</div>
				`;

				// SECURITY FIX: Sanitize HTML before injection to prevent XSS
				if (typeof DOMPurify !== 'undefined') {
					container.innerHTML = DOMPurify.sanitize(scoreboardHTML);
				} else {
					console.warn('DOMPurify not loaded, rendering without sanitization');
					container.innerHTML = scoreboardHTML;
				}
			}

			// Update state data when new review is submitted
			function updateStateReview(state, rating, wage) {
				if (stateReviews[state]) {
					const data = stateReviews[state];
					const totalRating = (data.avgRating * data.reviewCount) + rating;
					const totalWage = (data.avgWage * data.reviewCount) + parseFloat(wage);

					data.reviewCount += 1;
					data.avgRating = totalRating / data.reviewCount;
					data.avgWage = totalWage / data.reviewCount;
				}

				// Re-render scoreboard with updated data
				renderScoreboard();
			}

			// ========================================
			// REVIEW POPUP FUNCTIONALITY
			// ========================================

			// State for review popup
			let currentPopupState = null;
			let currentPage = 1;
			const reviewsPerPage = 10;
			let allStateReviews = [];

			// Gender icon mapping
			function getGenderIcon(gender) {
				switch (gender) {
					case 'male':
						return '<i class="fas fa-mars"></i>';
					case 'female':
						return '<i class="fas fa-venus"></i>';
					case 'other':
						return '<i class="fas fa-transgender"></i>';
					default:
						return '<i class="fas fa-user"></i>';
				}
			}

			// Open reviews popup for a state
			async function openReviewsPopup(stateName) {
				currentPopupState = stateName;
				currentPage = 1;

				// Update modal title
				document.getElementById('reviewsStateName').textContent = stateName;

				// Show modal
				const modal = document.getElementById('reviewsPopupModal');
				modal.classList.add('show');

				// Fetch reviews for this state
				await fetchStateReviews(stateName);
			}

			// Close reviews popup
			function closeReviewsPopup() {
				const modal = document.getElementById('reviewsPopupModal');
				modal.classList.remove('show');
				currentPopupState = null;
				currentPage = 1;
				allStateReviews = [];
			}

			// Fetch reviews for a specific state
			async function fetchStateReviews(stateName) {
				try {
					const response = await fetch(`${API_BASE_URL}/api/reviews/state/${encodeURIComponent(stateName)}`, {
						method: 'GET',
						credentials: 'include'
					});

					if (!response.ok) {
						throw new Error('Failed to fetch reviews');
					}

					const data = await response.json();

					if (data.success) {
						allStateReviews = data.reviews;
						renderReviews();
					} else {
						showNoReviewsMessage();
					}
				} catch (error) {
					console.error('Error fetching state reviews:', error);
					showNoReviewsMessage();
				}
			}

			// Render reviews with pagination
			function renderReviews() {
				const container = document.getElementById('reviewsListContainer');

				if (allStateReviews.length === 0) {
					showNoReviewsMessage();
					return;
				}

				// Calculate pagination
				const totalPages = Math.ceil(allStateReviews.length / reviewsPerPage);
				const startIndex = (currentPage - 1) * reviewsPerPage;
				const endIndex = startIndex + reviewsPerPage;
				const pageReviews = allStateReviews.slice(startIndex, endIndex);

				// Render reviews
				const reviewsHTML = pageReviews.map(review => {
					// Format date
					const date = new Date(review.createdAt);
					const formattedDate = date.toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					});

					// Generate star rating
					const stars = Array.from({ length: 5 }, (_, i) =>
						i < review.rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>'
					).join('');

					return `
						<div class="review-item">
							<div class="review-header">
								<div class="review-user-icon">
									${getGenderIcon(review.userGender)}
								</div>
								<div class="review-user-info">
									<div class="review-user-name">${review.userFirstName}</div>
									<div class="review-metadata">${review.jobTitle}${review.employer ? ' at ' + review.employer : ''} • ${formattedDate}</div>
								</div>
								<div class="review-rating">
									${stars}
								</div>
							</div>
							<div class="review-details">
								<div class="review-detail-item">
									<div class="review-detail-label">Location</div>
									<div class="review-detail-value">${review.city || 'Not specified'}</div>
								</div>
								<div class="review-detail-item">
									<div class="review-detail-label">Hourly Wage</div>
									<div class="review-detail-value">$${review.wages.toFixed(2)}</div>
								</div>
								<div class="review-detail-item">
									<div class="review-detail-label">Hours/Week</div>
									<div class="review-detail-value">${review.hoursPerWeek} hrs</div>
								</div>
								<div class="review-detail-item">
									<div class="review-detail-label">Times Visited</div>
									<div class="review-detail-value">${review.timesUsed}x</div>
								</div>
								<div class="review-detail-item">
									<div class="review-detail-label">Overall Rating</div>
									<div class="review-detail-value">${review.rating}/5 stars</div>
								</div>
							</div>
							<div class="review-experience-text">
								<span class="review-experience-label">Experience:</span>
								${review.experience}
							</div>
						</div>
					`;
				}).join('');

				// SECURITY FIX: Sanitize review content to prevent XSS attacks
				container.innerHTML = DOMPurify.sanitize(reviewsHTML);

				// Update pagination
				updatePagination(totalPages);
			}

			// Update pagination controls
			function updatePagination(totalPages) {
				const paginationContainer = document.getElementById('paginationContainer');
				const prevBtn = document.getElementById('prevPageBtn');
				const nextBtn = document.getElementById('nextPageBtn');
				const paginationInfo = document.getElementById('paginationInfo');

				if (totalPages <= 1) {
					paginationContainer.style.display = 'none';
					return;
				}

				paginationContainer.style.display = 'flex';
				paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;

				// Enable/disable buttons
				prevBtn.disabled = currentPage === 1;
				nextBtn.disabled = currentPage === totalPages;
			}

			// Change page
			function changePage(direction) {
				const totalPages = Math.ceil(allStateReviews.length / reviewsPerPage);
				const newPage = currentPage + direction;

				if (newPage >= 1 && newPage <= totalPages) {
					currentPage = newPage;
					renderReviews();
					// Scroll to top of reviews container
					document.getElementById('reviewsListContainer').scrollTop = 0;
				}
			}

			// Show no reviews message
			function showNoReviewsMessage() {
				const container = document.getElementById('reviewsListContainer');
				container.innerHTML = `
					<div class="no-reviews-message">
						<i class="fas fa-inbox"></i>
						<p>No reviews yet for ${currentPopupState}.</p>
						<p>Be the first to share your experience!</p>
					</div>
				`;
				document.getElementById('paginationContainer').style.display = 'none';
			}

			// Keyboard accessibility - Escape key closes modals (except TOS which requires explicit action)
			document.addEventListener('keydown', function(event) {
				if (event.key === 'Escape' || event.keyCode === 27) {
					const loginModal = document.getElementById('loginModal');
					const reviewsPopup = document.getElementById('reviewsPopupModal');
					const usLegalModal = document.getElementById('usLegalModal');

					// Close U.S. Legal modal with Escape
					if (usLegalModal && usLegalModal.style.display === 'block') {
						closeUSLegalModal();
						return;
					}

					// Close reviews popup with Escape
					if (reviewsPopup && reviewsPopup.classList.contains('show')) {
						closeReviewsPopup();
						return;
					}

					// Only close login modal with Escape - TOS requires explicit decline
					if (loginModal && loginModal.style.display === 'block') {
						closeLoginModal();
						pendingReviewData = null; // Clear pending data when user cancels
					}
				}
			});

			// Initialize map when page loads
			document.addEventListener('DOMContentLoaded', async function() {
				// Check URL parameters for auth status
				const urlParams = new URLSearchParams(window.location.search);
				const authStatus = urlParams.get('auth');

				// Restore pending review data from sessionStorage
				const savedPendingData = sessionStorage.getItem('pendingReviewData');
				if (savedPendingData) {
					try {
						pendingReviewData = JSON.parse(savedPendingData);
						console.log('Restored pending review data');
					} catch (error) {
						console.error('Error restoring pending data:', error);
						sessionStorage.removeItem('pendingReviewData');
					}
				}

				if (authStatus === 'success') {
					// Clear URL parameter
					window.history.replaceState({}, document.title, window.location.pathname);
					// Show success message after checking session
				} else if (authStatus === 'failed') {
					alert('Login failed. Please try again.');
					window.history.replaceState({}, document.title, window.location.pathname);
					// Clear pending data on auth failure
					sessionStorage.removeItem('pendingReviewData');
					pendingReviewData = null;
				}

				// Check for existing login session
				await checkExistingSession();
				// OLD updateHUD() call removed - Profile Hub handles this automatically

				// Ensure state selector and scoreboard are always visible on this page
				const stateSelection = document.getElementById('state-selection');
				if (stateSelection) {
					stateSelection.style.display = 'block';
				}

				if (isUserLoggedIn) {
					console.log('User is logged in:', currentUser.firstName);

					// If user just logged in and has pending data, show TOS modal
					if (authStatus === 'success' && pendingReviewData) {
						alert(`Welcome, ${currentUser.firstName}! You are now logged in.`);
						// Clear from storage since we're about to process it
						sessionStorage.removeItem('pendingReviewData');
						openTOSModal();
					}
				} else {
					console.log('User is not logged in');
				}

				// Initialize local data
				initializeStateData();
				initializeMap();

				// Load stats and analytics from server
				await loadStatsFromServer();
				await loadAnalyticsFromServer();

				// Add wage input validation event listeners
				const wagesInput = document.getElementById('wages');
				if (wagesInput) {
					// Format on input (as user types)
					wagesInput.addEventListener('input', formatWageInput);
					// Prevent non-numeric on keypress
					wagesInput.addEventListener('keypress', validateWageKeyPress);
					// Format on blur (when field loses focus)
					wagesInput.addEventListener('blur', function(event) {
						const input = event.target;
						let value = input.value.replace(/[^0-9.]/g, '');
						if (value) {
							// Ensure 2 decimal places
							const numValue = parseFloat(value);
							if (!isNaN(numValue)) {
								input.value = '$' + numValue.toFixed(2);
							}
						}
					});
				}
			});

// ========================================
// EVENT DELEGATION FOR CSP COMPLIANCE
// Event delegation for data-action attributes (replaces inline onclick handlers)
// ========================================

document.addEventListener('click', function(event) {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;

    switch(action) {
        case 'open-us-legal-modal':
            event.preventDefault();
            openUSLegalModal(event);
            break;

        case 'close-us-legal-modal':
            closeUSLegalModal();
            break;

        case 'close-modal':
            closeModal();
            break;

        case 'close-reviews-popup':
            closeReviewsPopup();
            break;

        case 'set-rating':
            const rating = parseInt(target.dataset.rating);
            if (rating >= 1 && rating <= 5) {
                setRating(rating);
            }
            break;

        case 'accept-tos':
            acceptTOS();
            break;

        case 'decline-tos':
            declineTOS();
            break;

        case 'change-page':
            const direction = parseInt(target.dataset.direction);
            changePage(direction);
            break;

        case 'google-login':
            initiateGoogleLogin();
            break;

        case 'facebook-login':
            initiateFacebookLogin();
            break;

        default:
            console.warn('Unknown data-action:', action);
    }
});
