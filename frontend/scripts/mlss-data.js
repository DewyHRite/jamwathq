(function() {
    const mlssAgencyDataset = [
        {
            name: "10881 Entertainment Agency",
            aliases: ["10881 Entertainment Agency"],
            status: "approved",
            contact: "876-314-2564, 876-671-7705",
            email: "10881agency@gmail.com",
            address: "Door #6, 63 Dumbarton Avenue, Kingston 10, St. Andrew",
            location: "Kingston 10, St. Andrew, Jamaica",
            services: "J-1, H-2B",
            personnel: "Elvey Johnson"
        },
        {
            name: "Access to Success Business Solutions Limited",
            aliases: ["Access to Success Business Solutions Limited", "Access to Success Business Solution"],
            status: "approved",
            contact: "876-929-3633, 876-815-7494",
            email: "accessemployment2019@gmail.com",
            address: "Shop #3, Biscayne Plaza, 51 Slipe Road, Kingston 5",
            location: "Kingston 5, St. Andrew, Jamaica",
            services: "H-2B",
            personnel: "Michelle Bryan-Ford"
        },
        {
            name: "Agency For Cultural Exchange Program Company Limited",
            aliases: ["Agency for Cultural Exchange Program Company Limited"],
            status: "approved",
            contact: "876-402-8302",
            email: null,
            address: "Suite #13, 3 Cargil Avenue, Kingston 10, St. Andrew",
            location: "Kingston 10, St. Andrew, Jamaica",
            services: "J-1",
            personnel: "Casandra Chisholm"
        },
        {
            name: "Akey1 Limited",
            aliases: ["Akey1 Limited"],
            status: "approved",
            contact: "876-484-6100, 876-622-5648",
            email: null,
            address: "Shop #50, Little Premier Plaza, Kingston 10, St. Andrew",
            location: "Kingston 10, St. Andrew, Jamaica",
            services: "J-1",
            personnel: "Dianne Strachan"
        },
        {
            name: "A-Rize Work & Travel",
            aliases: ["A-Rize Work & Travel", "A-Rize Work & Travel Services"],
            status: "approved",
            contact: "876-491-9482, 876-987-8592, 876-990-6427",
            email: "arizeworkandtravel1@yahoo.com",
            address: "12 Wiltshire Complex, Spaulding P.O., Clarendon",
            location: "Spaulding, Clarendon, Jamaica",
            services: "J-1, H-2B",
            personnel: "Pierre Bennet"
        },
        {
            name: "Adnil Services",
            aliases: ["Adnil Services"],
            status: "approved",
            contact: "876-963-5480",
            email: null,
            address: "Market Street, Whitehouse, Westmoreland",
            location: "Whitehouse, Westmoreland, Jamaica",
            services: "H-2B",
            personnel: "Dennis Turner"
        },
        {
            name: "Atlantic International Travel Services",
            aliases: ["Atlantic International Travel Services"],
            status: "approved",
            contact: "876-700-8819, 876-325-5235",
            email: null,
            address: "3A Green Vale Road, Mandeville, Manchester",
            location: "Mandeville, Manchester, Jamaica",
            services: "H-2B",
            personnel: "Wendy Elliot"
        },
        {
            name: "ATSED Employment Agency",
            aliases: ["ATSED Employment Agency"],
            status: "approved",
            contact: "876-310-1869",
            email: null,
            address: "Rose Heights, Montego Bay, St. James",
            location: "Montego Bay, St. James, Jamaica",
            services: "H-2B",
            personnel: "Desta Simms"
        },
        {
            name: "Beadle's & Associates",
            aliases: ["Beadle's & Associates", "Beadles & Associates"],
            status: "approved",
            contact: "876-489-1621",
            email: null,
            address: "Shop #9, Four Paths Shopping Centre, Clarendon",
            location: "Clarendon, Jamaica",
            services: "H-2B",
            personnel: "Trevoline Beadle"
        },
        {
            name: "Checkin Work and Travel",
            aliases: ["Checkin Work and Travel"],
            status: "approved",
            contact: "876-436-4181",
            email: null,
            address: "22B Old Hope Road, Kingston 5, St. Andrew",
            location: "Kingston 5, St. Andrew, Jamaica",
            services: "J-1",
            personnel: "Dwight Sommers"
        },
        {
            name: "Creative Staffing Agency",
            aliases: ["Creative Staffing Agency"],
            status: "approved",
            contact: "876-530-2468, 876-690-5455",
            email: "info@creative-staffings.com",
            address: "6 Strand Street, Montego Bay, St. James",
            location: "Montego Bay, St. James, Jamaica",
            services: "J-1",
            personnel: "Jacqueline Tummings"
        },
        {
            name: "Dallas Employment Agency",
            aliases: ["Dallas Employment Agency"],
            status: "approved",
            contact: "876-793-8032, 876-781-2260, 876-508-0954",
            email: null,
            address: "Pink Plaza, Tower Isle, St. Mary",
            location: "Tower Isle, St. Mary, Jamaica",
            services: "H-2B",
            personnel: "Novelette Dallas"
        },
        {
            name: "Cape Cod Workers",
            aliases: ["Cape Cod Workers"],
            status: "approved",
            contact: "876-351-0982",
            email: null,
            address: "14 Winchester Business Centre, 15 Hope Road, Kingston 10",
            location: "Kingston 10, St. Andrew, Jamaica",
            services: "H-2B",
            personnel: "Violet Sheppard-Rose"
        },
        {
            name: "Deloris Documents & Photo Services",
            aliases: ["Deloris Documents & Photo Services"],
            status: "approved",
            contact: "876-971-7288, 876-369-6050",
            email: "dcs1jamaica@gmail.com",
            address: "122 Barnett Street, Montego Bay, St. James",
            location: "Montego Bay, St. James, Jamaica",
            services: "H-2B",
            personnel: "Nadia Bennett"
        },
        {
            name: "Destin VIP Employment Services",
            aliases: ["Destin VIP Employment Services"],
            status: "approved",
            contact: "876-476-6357",
            email: null,
            address: "Shop #19, Screen Dat Plaza, Porus P.O., Manchester",
            location: "Porus, Manchester, Jamaica",
            services: "H-2B",
            personnel: "Advira Turner"
        },
        {
            name: "E-Recruit Employment & Travel Agency",
            aliases: ["E-Recruit Employment & Travel Agency", "E Recruit Employment & Travel Agency"],
            status: "approved",
            contact: "876-232-5424, 876-715-3098",
            email: null,
            address: "Race Course, Oracabessa P.O., St. Mary",
            location: "Oracabessa, St. Mary, Jamaica",
            services: "H-2B",
            personnel: "Tamar Laing"
        },
        {
            name: "Explore Work & Travel International Limited",
            aliases: ["Explore Work & Travel International Limited", "Explore Work & Travel Int'l Ltd"],
            status: "approved",
            contact: "876-428-1600, 876-238-5112",
            email: null,
            address: "120 Main Street, Ocho Rios, St. Ann",
            location: "Ocho Rios, St. Ann, Jamaica",
            services: "J-1",
            personnel: "Jafari Reid"
        },
        {
            name: "Faith Placement Services",
            aliases: ["Faith Placement Services"],
            status: "approved",
            contact: "876-926-9138, 876-754-6412",
            email: null,
            address: "18 Chisholm Avenue, Kingston 13, St. Andrew",
            location: "Kingston 13, St. Andrew, Jamaica",
            services: "H-2B",
            personnel: "Indiana Hutchinson"
        },
        {
            name: "Evans Solutions Limited",
            aliases: ["Evans Solutions Limited"],
            status: "approved",
            contact: "876-428-4501",
            email: null,
            address: "Lot #30 B, Daniel Town Road, Falmouth, Trelawny",
            location: "Falmouth, Trelawny, Jamaica",
            services: "H-2B",
            personnel: "Dannine Evans"
        },
        {
            name: "Flyer Zone Placement Services",
            aliases: ["Flyer Zone Placement Services"],
            status: "approved",
            contact: "876-926-9138, 876-754-6412",
            email: null,
            address: "Brooks Avenue, May Pen, Clarendon",
            location: "May Pen, Clarendon, Jamaica",
            services: "J-1",
            personnel: "Brendalyn Sewell-James"
        },
        {
            name: "Global Insight International Exchange Ltd",
            aliases: ["Global Insight International Exchange Ltd", "Global Insight International Exchange"],
            status: "approved",
            contact: "876-433-2544, 876-779-4634",
            email: "globalinsightqueries@gmail.com",
            address: "Suite #2, 35 Hope Road, Kingston 6, St. Andrew",
            location: "Kingston 6, St. Andrew, Jamaica",
            services: "J-1",
            personnel: "Georgia Cobran"
        },
        {
            name: "Golden Luxe Travel and Employment Agency",
            aliases: ["Golden Luxe Travel and Employment Agency"],
            status: "approved",
            contact: "876-334-5786",
            email: null,
            address: "Shop #7, Glamorous Plaza, Chudleigh P.A., Christiana, Manchester",
            location: "Christiana, Manchester, Jamaica",
            services: "H-2B",
            personnel: "Ashneak Russell"
        },
        {
            name: "HR Elite Limited",
            aliases: ["HR Elite Limited"],
            status: "approved",
            contact: "876-622-9628",
            email: null,
            address: "7 Oxford Park Avenue, Kingston",
            location: "Kingston, Jamaica",
            services: "J-1, H-2B",
            personnel: "Cavalee Freeman"
        },
        {
            name: "Integrity International Placement Services",
            aliases: ["Integrity International Placement Services"],
            status: "approved",
            contact: "876-826-5501",
            email: null,
            address: "Charley's Plaza, Browns Town, St. Ann",
            location: "Browns Town, St. Ann, Jamaica",
            services: "J-1, H-2B",
            personnel: "Violet Williams"
        },
        {
            name: "GTG Recruiting Agency Limited",
            aliases: ["GTG Recruiting Agency Limited", "GTG Recruiting Agency Ltd"],
            status: "approved",
            contact: "876-317-3219",
            email: "pennyroyal920@gmail.com",
            address: "Shop #16, 2 School Street, Black River, St. Elizabeth",
            location: "Black River, St. Elizabeth, Jamaica",
            services: "J-1, H-2B",
            personnel: "Patricia Clarke"
        },
        {
            name: "International Recruiting Staffing Solutions Inc. Ltd",
            aliases: ["International Recruiting Staffing Solutions Inc. Ltd", "International Recruiting Staffing Solutions Inc. Ltd (I.R.S.S)", "I.R.S.S"],
            status: "approved",
            contact: "876-754-1832, 876-754-1836",
            email: null,
            address: "3 Paisley Avenue, Kingston 5 / Shop #3, Moms Village Plaza, St. Ann",
            location: "Kingston 5 & St. Ann, Jamaica",
            services: "J-1, H-2B",
            personnel: "Sherrian Thomas"
        },
        {
            name: "International Career Development & Exchange Ltd",
            aliases: ["International Career Development & Exchange Ltd", "International Career Development & Exchange Limited (ICDE)"],
            status: "approved",
            contact: "876-412-3997",
            email: null,
            address: "22B Old Hope Road, Kingston 5",
            location: "Kingston 5, St. Andrew, Jamaica",
            services: "J-1",
            personnel: "Sonya Muschett"
        },
        {
            name: "Island Plus Multi-Services Limited",
            aliases: ["Island Plus Multi-Services Limited"],
            status: "approved",
            contact: "876-754-6558, 876-368-8588",
            email: "islandplusplacements@gmail.com",
            address: "Shop #11, 2B Rousseau Road, Kingston",
            location: "Kingston, Jamaica",
            services: "J-1, H-2B, Q-1",
            personnel: "Denise Mohan-Daley"
        },
        {
            name: "Joyst Youth Exchange International Limited",
            aliases: ["Joyst Youth Exchange International Limited"],
            status: "approved",
            contact: "876-968-7176",
            email: null,
            address: "5 Melmac Avenue, Kingston 5, St. Andrew",
            location: "Kingston 5, St. Andrew, Jamaica",
            services: "J-1",
            personnel: "Charmaine Hutchinson"
        },
        {
            name: "Laconic Cultural Work & Travel Limited",
            aliases: ["Laconic Cultural Work & Travel Limited"],
            status: "approved",
            contact: "876-439-1276, 876-491-9845",
            email: null,
            address: "Unit #1, 70 1/2 Molynes Road, Kingston 10, St. Andrew",
            location: "Kingston 10, St. Andrew, Jamaica",
            services: "J-1, H-2B",
            personnel: "Laika Blake"
        },
        {
            name: "Journey Abroad Services",
            aliases: ["Journey Abroad Services"],
            status: "approved",
            contact: "876-280-0909",
            email: null,
            address: "22B Old Hope Road, Kingston 5",
            location: "Kingston 5, St. Andrew, Jamaica",
            services: "H-2B",
            personnel: "Roy Pinnock"
        },
        {
            name: "Len-Claire Recruiting Agency",
            aliases: ["Len-Claire Recruiting Agency"],
            status: "approved",
            contact: "876-318-0140, 876-882-7601",
            email: null,
            address: "23 Williams Avenue, May Pen, Clarendon",
            location: "May Pen, Clarendon, Jamaica",
            services: "H-2B",
            personnel: "Elsie Douglas-Sinclair"
        },
        {
            name: "Lil's Travel Agency Recruitment Services",
            aliases: ["Lil's Travel Agency Recruitment Services"],
            status: "approved",
            contact: "876-508-4720, 876-918-9291",
            email: null,
            address: "New Green Island Square, Green Island, Hanover",
            location: "Green Island, Hanover, Jamaica",
            services: "J-1, H-2B",
            personnel: "Lelith Callam-Andrews"
        },
        {
            name: "M & H International Employment Agency",
            aliases: ["M & H International Employment Agency"],
            status: "approved",
            contact: "876-885-1080",
            email: null,
            address: "22B Old Hope Road, Kingston 5, St. Andrew",
            location: "Kingston 5, St. Andrew, Jamaica",
            services: "H-2B",
            personnel: "Tina Miller"
        },
        {
            name: "Max J Employment Services",
            aliases: ["Max J Employment Services"],
            status: "approved",
            contact: "876-431-6097",
            email: null,
            address: "32 Courtney Walsh Drive, Kingston 10, St. Andrew",
            location: "Kingston 10, St. Andrew, Jamaica",
            services: "J-1, H-2B",
            personnel: "Annette Maxwell"
        },
        {
            name: "May'Fos Work & Travel Employment Agency",
            aliases: ["May'Fos Work & Travel Employment Agency", "May'Fos Work & Travel Employment"],
            status: "approved",
            contact: "876-979-1457, 876-335-2118, 876-419-3720",
            email: null,
            address: "46 Market Street, U.I. Plaza, Montego Bay, St. James",
            location: "Montego Bay, St. James, Jamaica",
            services: "J-1",
            personnel: "Dwayne Muirhead"
        },
        {
            name: "Mare Staffing & Consulting Limited",
            aliases: ["Mare Staffing & Consulting Limited"],
            status: "approved",
            contact: "876-395-1495",
            email: null,
            address: "2 Halart Drive, Kingston 6, St. Andrew",
            location: "Kingston 6, St. Andrew, Jamaica",
            services: "H-2B",
            personnel: "Chavoy Reid"
        },
        {
            name: "McLean's Travel Agency For Students Limited",
            aliases: ["McLean's Travel Agency For Students Limited"],
            status: "approved",
            contact: "876-835-0673, 876-430-7493",
            email: null,
            address: "67 Old Hope Road, Kingston 5, St. Andrew",
            location: "Kingston 5, St. Andrew, Jamaica",
            services: "J-1",
            personnel: "Kirk McLean"
        },
        {
            name: "Mek$ense Experience Limited",
            aliases: ["Mek$ense Experience Limited", "Meksense Experience Limited"],
            status: "approved",
            contact: "876-573-8730, 876-486-6859",
            email: "meksenseexperience@gmail.com",
            address: "117 Maxfield Avenue, Kingston 6, St. Andrew",
            location: "Kingston 6, St. Andrew, Jamaica",
            services: "H-2B",
            personnel: "Teo Campbell"
        },
        {
            name: "Meklinx Travel and Employment Services Agency",
            aliases: ["Meklinx Travel and Employment Services Agency"],
            status: "approved",
            contact: "876-233-5156",
            email: null,
            address: "Unit #49, Winchester Business Centre, 15 Hope Road, Kingston 10, St. Andrew",
            location: "Kingston 10, St. Andrew, Jamaica",
            services: "J-1, H-2B, TFWP (CAN)",
            personnel: "Chantal Beckford"
        },
        {
            name: "OFIT Limited",
            aliases: ["OFIT Limited"],
            status: "approved",
            contact: "876-997-4036",
            email: null,
            address: "Suite #5, HR-13 Professional Suites, 13 Haining Road, Kingston 5, St. Andrew",
            location: "Kingston 5, St. Andrew, Jamaica",
            services: "J-1",
            personnel: "Yordania Young"
        },
        {
            name: "Overseas Work & Travel",
            aliases: ["Overseas Work & Travel"],
            status: "approved",
            contact: "876-283-8834",
            email: null,
            address: "Suite #5, 137 Maxfield Avenue, Kingston 10, St. Andrew",
            location: "Kingston 10, St. Andrew, Jamaica",
            services: "J-1",
            personnel: "Euel Morgan"
        },
        {
            name: "Melissa Travel Service",
            aliases: ["Melissa Travel Service", "Melissa Travel Services"],
            status: "approved",
            contact: "876-868-4984",
            email: "melissatravelservice@gmail.com",
            address: "Shop #4, Unipap Plaza, 208 Old Hope Road, Kingston",
            location: "Kingston, Jamaica",
            services: "H-2B",
            personnel: "Phylecia Leslie"
        },
        {
            name: "Patriots Travel Limited",
            aliases: ["Patriots Travel Limited"],
            status: "approved",
            contact: "876-818-9641, 876-907-3288",
            email: null,
            address: "25 Cumberland Road, Spanish Town, St. Catherine",
            location: "Spanish Town, St. Catherine, Jamaica",
            services: "J-1, H-2B, TFWP (CAN)",
            personnel: "Sandor Martin"
        },
        {
            name: "Platinum Employment Agency & Internet Café",
            aliases: ["Platinum Employment Agency & Internet Café", "Platinum Employment Agency & Internet Cafe"],
            status: "approved",
            contact: "876-541-0553",
            email: null,
            address: "Wynter's Pen Road, Spanish Town, St. Catherine",
            location: "Spanish Town, St. Catherine, Jamaica",
            services: "H-2B",
            personnel: "Andrine Lewis"
        },
        {
            name: "Polaris Travel & Placement Services",
            aliases: ["Polaris Travel & Placement Services"],
            status: "approved",
            contact: "876-320-1441",
            email: null,
            address: "Shop #19, Brumalia Town Centre, 2 Perth Road, Mandeville, Manchester",
            location: "Mandeville, Manchester, Jamaica",
            services: "J-1",
            personnel: "Steven Bramwell"
        },
        {
            name: "Seaview Employment Solutions Limited",
            aliases: ["Seaview Employment Solutions Limited"],
            status: "approved",
            contact: "876-446-0556",
            email: null,
            address: "Seaview Shopping Complex, Market Street, Whitehouse P.O., Westmoreland",
            location: "Whitehouse, Westmoreland, Jamaica",
            services: "H-2B",
            personnel: "Nicole Samuels-Ewart"
        },
        {
            name: "Skilled Staffing Solutions",
            aliases: ["Skilled Staffing Solutions"],
            status: "approved",
            contact: "876-974-8452, 876-974-7509, 876-838-2220",
            email: null,
            address: "182 Main Street, Ocho Rios, St. Ann",
            location: "Ocho Rios, St. Ann, Jamaica",
            services: "H-2B",
            personnel: "Nadine Gayle-Ramsay"
        },
        {
            name: "Regional Staffing Professionals",
            aliases: ["Regional Staffing Professionals"],
            status: "approved",
            contact: "876-427-7850, 876-955-7205, 876-401-2949",
            email: null,
            address: "Station Road, Little London, Westmoreland",
            location: "Little London, Westmoreland, Jamaica",
            services: "J-1, H-2B",
            personnel: "Albert Brown"
        },
        {
            name: "Skills Acquisition Services",
            aliases: ["Skills Acquisition Services"],
            status: "approved",
            contact: "876-883-4142",
            email: null,
            address: "22B Old Hope Road, Kingston 5, St. Andrew",
            location: "Kingston 5, St. Andrew, Jamaica",
            services: "J-1, H-2B",
            personnel: "Mahalia Campbell-Myers"
        },
        {
            name: "STEEP International Limited",
            aliases: ["STEEP International Limited"],
            status: "approved",
            contact: "876-370-1315",
            email: "steepinternational@gmail.com",
            address: "34-36 Old Hope Road, Kingston 5, St. Andrew",
            location: "Kingston 5, St. Andrew, Jamaica",
            services: "J-1",
            personnel: "Denise Minott"
        },
        {
            name: "Student Overseas Recruiting Agency (S.O.R.A)",
            aliases: ["Student Overseas Recruiting Agency (S.O.R.A)", "Students Overseas Recruiting Agency (S.O.R.A)"],
            status: "approved",
            contact: "876-665-0213, 876-618-3661",
            email: null,
            address: "Suite #21, Papine Plaza, 216 Old Hope Road, Kingston 6",
            location: "Kingston 6, St. Andrew, Jamaica",
            services: "J-1",
            personnel: "Jason Harvey"
        },
        {
            name: "Summer Choice Work & Travel",
            aliases: ["Summer Choice Work & Travel"],
            status: "approved",
            contact: "876-422-8556, 876-820-2844",
            email: null,
            address: "Shop #7, Jerkies Plaza, Runaway Bay, St. Ann",
            location: "Runaway Bay, St. Ann, Jamaica",
            services: "J-1",
            personnel: "Craig Edwards"
        },
        {
            name: "SWAT Productions Limited",
            aliases: ["SWAT Productions Limited"],
            status: "approved",
            contact: "876-445-2700, 876-581-0933, 876-348-7855, 876-328-7855, 876-534-2254",
            email: null,
            address: "UWI Mona, Kingston 7, St. Andrew",
            location: "Kingston 7, St. Andrew, Jamaica",
            services: "J-1",
            personnel: "Mark Foster"
        },
        {
            name: "Student Networking Opportunities Worldwide (S.N.O.W)",
            aliases: ["Student Networking Opportunities Worldwide (S.N.O.W)"],
            status: "approved",
            contact: "876-299-9629, 876-615-5245",
            email: null,
            address: "11 Melmac Avenue, Kingston 5",
            location: "Kingston 5, St. Andrew, Jamaica",
            services: "J-1",
            personnel: "Dorlan Hunter"
        },
        {
            name: "Tander Travels",
            aliases: ["Tander Travels"],
            status: "approved",
            contact: "876-408-6675, 876-415-5248",
            email: null,
            address: "8 Mountain View Avenue, Kingston 2",
            location: "Kingston 2, Kingston, Jamaica",
            services: "J-1",
            personnel: "Tricia Anderson"
        },
        {
            name: "The Passport Work & Travel Services Limited",
            aliases: ["The Passport Work & Travel Services Limited"],
            status: "approved",
            contact: "876-552-9449, 876-440-3849, 876-671-9392",
            email: null,
            address: "Unit #8, 18 Balmoral Avenue, Kingston",
            location: "Kingston, Jamaica",
            services: "J-1",
            personnel: "Andre Heslop"
        },
        {
            name: "The Visa Staffing Agency Limited",
            aliases: ["The Visa Staffing Agency Limited"],
            status: "approved",
            contact: "876-715-5646",
            email: null,
            address: "Unit #3, NOL Business Complex, 25 Retirement Road, Kingston 5",
            location: "Kingston 5, St. Andrew, Jamaica",
            services: "H-2B",
            personnel: "Rosalee Gage-Grey"
        },
        {
            name: "Travelaire Employment Services",
            aliases: ["Travelaire Employment Services"],
            status: "approved",
            contact: "876-631-1518, 876-545-8386",
            email: null,
            address: "Shop #48, 74 Main Street, Ocho Rios, St. Ann",
            location: "Ocho Rios, St. Ann, Jamaica",
            services: "H-2B",
            personnel: "Willious Reid"
        },
        {
            name: "Trevor Hamilton & Associates-Centre for Excellence",
            aliases: ["Trevor Hamilton & Associates-Centre for Excellence", "Trevor Hamilton & Associates - Centre for Excellence"],
            status: "approved",
            contact: "876-631-9675",
            email: null,
            address: "17A Farringdon Heights, Jackson Hill, Kingston 6",
            location: "Kingston 6, St. Andrew, Jamaica",
            services: "H-2B",
            personnel: "Trevor Hamilton"
        },
        {
            name: "Trailes Hospitality Training, Events & Consultancy Services",
            aliases: ["Trailes Hospitality Training, Events & Consultancy Services", "Trailes Hospitality Training, Events & Consultant Services"],
            status: "approved",
            contact: "876-810-3846",
            email: null,
            address: "14 Trelawny Street, Falmouth, Trelawny",
            location: "Falmouth, Trelawny, Jamaica",
            services: "H-2B",
            personnel: "Ricordo Traile"
        },
        {
            name: "Work Abroad Jamaica Limited",
            aliases: ["Work Abroad Jamaica Limited", "Work Abroad Jamaica"],
            status: "approved",
            contact: "876-507-3148, 876-665-7999",
            email: null,
            address: "Shop #3, 7 Eureka Crescent, Kingston 5",
            location: "Kingston 5, St. Andrew, Jamaica",
            services: "J-1",
            personnel: "Collin Coley"
        },
        {
            name: "Z & M Global Recruitment Limited",
            aliases: ["Z & M Global Recruitment Limited"],
            status: "approved",
            contact: "876-456-1794",
            email: null,
            address: "9 Portland Road, Port Antonio P.O., Portland",
            location: "Port Antonio, Portland, Jamaica",
            services: "H-2B",
            personnel: "Samanta Russell-Morsby"
        },
        {
            name: "Alphanso Agency Limited",
            aliases: ["Alphanso Agency Limited"],
            status: "pending",
            contact: "876-667-7194, 876-285-8062",
            email: null,
            address: "30A Constant Spring Road, Kingston 10, St. Andrew",
            location: "Kingston 10, St. Andrew, Jamaica",
            services: "H-2B",
            personnel: "Antoinette Osbourne"
        },
        {
            name: "Dorryus Recruiting & Employment Agency",
            aliases: ["Dorryus Recruiting & Employment Agency"],
            status: "pending",
            contact: "876-425-0616, 876-728-3425",
            email: "j1coor@dorryus.com",
            address: "674 Half Moon Road, Coral Gardens, Rose Hall, St. James",
            location: "Rose Hall, St. James, Jamaica",
            services: "J-1, H-2B",
            personnel: "Jahraski Young"
        },
        {
            name: "Dako Global Services",
            aliases: ["Dako Global Services"],
            status: "pending",
            contact: "876-469-9969, 876-589-1908, 876-492-1604",
            email: "dakotravel.jm@gmail.com",
            address: "Suite #1, Oxford Place, 22G Old Hope Road, Kingston 5",
            location: "Kingston 5, St. Andrew, Jamaica",
            services: "J-1, H-2B",
            personnel: "Oral Rose"
        },
        {
            name: "International Travel & Cultural Exchange (I.T.C.E)",
            aliases: ["International Travel & Cultural Exchange (I.T.C.E)", "International Travel & Cultural Exchange"],
            status: "pending",
            contact: "876-631-9852, 876-378-3876",
            email: null,
            address: "Suite 1A, 11 Ardene Road, Kingston 10, St. Andrew",
            location: "Kingston 10, St. Andrew, Jamaica",
            services: "J-1",
            personnel: "Poye Robinson"
        },
        {
            name: "J.D. & Associates",
            aliases: ["J.D. & Associates", "J.D & Associates"],
            status: "pending",
            contact: "876-704-5100, 876-899-4502",
            email: null,
            address: "3 Beechwood Avenue, Kingston 10",
            location: "Kingston 10, St. Andrew, Jamaica",
            services: "J-1, H-2B",
            personnel: "Dezrene Jones"
        },
        {
            name: "J & H Recruiting",
            aliases: ["J & H Recruiting"],
            status: "pending",
            contact: null,
            email: null,
            address: "Suite #5, Sagicor Commercial Centre, Howard Cooke Boulevard, Montego Bay, St. James",
            location: "Montego Bay, St. James, Jamaica",
            services: "H-2B",
            personnel: "Henry Duncan"
        }
    ];

    function normalizeName(name) {
        return (name || "")
            .toLowerCase()
            .replace(/&amp;|&/g, "and")
            .replace(/[’']/g, "")
            .replace(/[^a-z0-9]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    const mlssDataMap = new Map();
    mlssAgencyDataset.forEach(entry => {
        const aliases = [entry.name].concat(entry.aliases || []);
        aliases.forEach(alias => {
            mlssDataMap.set(normalizeName(alias), entry);
        });
    });

    function buildFieldValue(value, options = {}) {
        const fallback = options.fallback || "Not provided";
        if (!value) return fallback;

        switch (options.type) {
            case "email":
                return `<a href="mailto:${value}">${value}</a>`;
            case "location":
                return `<span class="location-tag">${value}</span>`;
            case "html":
                return value;
            default:
                return value;
        }
    }

    function updateSection(container, label, value, options = {}) {
        if (!container) return;
        const targetLabel = label.toLowerCase();
        const sections = Array.from(container.querySelectorAll('section'));
        const section = sections.find(sec => {
            const strong = sec.querySelector('strong');
            if (!strong) return false;
            return strong.textContent.replace(':', '').trim().toLowerCase() === targetLabel;
        });

        const formatted = buildFieldValue(value, options);
        const html = `<strong>${label}:</strong> ${formatted}`;

        if (section) {
            section.innerHTML = html;
        } else {
            const newSection = document.createElement('section');
            newSection.innerHTML = html;
            container.appendChild(newSection);
        }
    }

    function applyMlssData() {
        const cards = document.querySelectorAll('.agency-info.compact');
        cards.forEach(card => {
            const header = card.querySelector('header h3');
            if (!header) return;

            const normalized = normalizeName(header.textContent);
            const data = mlssDataMap.get(normalized);
            const infoContainer = card.querySelector('.info-container');

            if (data) {
                if (header.textContent.trim() !== data.name) {
                    header.textContent = data.name;
                }

                updateSection(infoContainer, 'Contact', data.contact, { fallback: 'Not provided' });
                updateSection(infoContainer, 'Email', data.email, { type: 'email', fallback: 'Not provided' });
                updateSection(infoContainer, 'Address', data.address, { fallback: 'Not provided' });
                updateSection(infoContainer, 'Location', data.location, { type: 'location', fallback: 'Not provided' });
                updateSection(infoContainer, 'Services', data.services, { fallback: 'Not provided' });
                updateSection(infoContainer, 'Personnel', data.personnel ? `Operated by: ${data.personnel}` : null, { type: 'html', fallback: 'Not provided' });

                const validStatuses = ['approved', 'pending', 'exception'];
                const status = validStatuses.includes(data.status) ? data.status : 'unlisted';
                card.dataset.mlssStatus = status;
                card.classList.remove('unapproved');
                if (status === 'unlisted') {
                    card.classList.add('unapproved');
                }
            } else {
                card.dataset.mlssStatus = 'unlisted';
                card.classList.add('unapproved');
            }
        });
    }

    window.MLSSData = {
        apply: applyMlssData,
        normalizeName,
        get statusMap() {
            return mlssDataMap;
        }
    };
})();
