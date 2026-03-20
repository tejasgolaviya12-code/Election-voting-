export interface Village { name: string; }
export interface Taluka { name: string; villages: Village[]; }
export interface District { name: string; talukas: Taluka[]; }
export interface State { name: string; districts: District[]; }

export const INDIA_LOCATIONS: State[] = [
  {
    name: "Andhra Pradesh",
    districts: [
      { name: "Visakhapatnam", talukas: [
        { name: "Visakhapatnam", villages: [{ name: "Gajuwaka" }, { name: "Bheemunipatnam" }, { name: "Anakapalle" }, { name: "Bhimunipatnam" }, { name: "Yelamanchili" }] },
        { name: "Atchutapuram", villages: [{ name: "Atchutapuram" }, { name: "Rambilli" }, { name: "Nakkapalli" }] },
        { name: "Pedagantyada", villages: [{ name: "Pedagantyada" }, { name: "Kommadi" }, { name: "Madhurawada" }] },
      ]},
      { name: "Krishna", talukas: [
        { name: "Vijayawada", villages: [{ name: "Ajit Singh Nagar" }, { name: "Gunadala" }, { name: "Moghalrajpuram" }] },
        { name: "Machilipatnam", villages: [{ name: "Machilipatnam" }, { name: "Pedana" }, { name: "Guduru" }] },
      ]},
      { name: "Guntur", talukas: [
        { name: "Guntur", villages: [{ name: "Amaravati" }, { name: "Mangalagiri" }, { name: "Tadepalli" }] },
        { name: "Tenali", villages: [{ name: "Tenali" }, { name: "Bapatla" }, { name: "Repalle" }] },
      ]},
      { name: "Chittoor", talukas: [
        { name: "Tirupati", villages: [{ name: "Tirupati" }, { name: "Renigunta" }, { name: "Tiruchanur" }] },
        { name: "Chittoor", villages: [{ name: "Chittoor" }, { name: "Puttur" }, { name: "Nagari" }] },
      ]},
    ],
  },
  {
    name: "Arunachal Pradesh",
    districts: [
      { name: "Papum Pare", talukas: [
        { name: "Itanagar", villages: [{ name: "Naharlagun" }, { name: "Banderdewa" }, { name: "Nirjuli" }] },
        { name: "Sagalee", villages: [{ name: "Sagalee" }, { name: "Kimin" }] },
      ]},
      { name: "West Siang", talukas: [
        { name: "Along", villages: [{ name: "Along" }, { name: "Pangin" }, { name: "Rumgong" }] },
      ]},
    ],
  },
  {
    name: "Assam",
    districts: [
      { name: "Kamrup Metropolitan", talukas: [
        { name: "Guwahati", villages: [{ name: "Jalukbari" }, { name: "Dispur" }, { name: "Beltola" }, { name: "Maligaon" }] },
        { name: "North Guwahati", villages: [{ name: "Hajo" }, { name: "Sualkuchi" }] },
      ]},
      { name: "Dibrugarh", talukas: [
        { name: "Dibrugarh", villages: [{ name: "Chabua" }, { name: "Naharkatia" }, { name: "Duliajan" }] },
        { name: "Lahowal", villages: [{ name: "Lahowal" }, { name: "Barbarua" }] },
      ]},
      { name: "Jorhat", talukas: [
        { name: "Jorhat", villages: [{ name: "Titabor" }, { name: "Mariani" }, { name: "Teok" }] },
      ]},
    ],
  },
  {
    name: "Bihar",
    districts: [
      { name: "Patna", talukas: [
        { name: "Patna Sadar", villages: [{ name: "Phulwari Sharif" }, { name: "Danapur" }, { name: "Khagaul" }, { name: "Bihta" }] },
        { name: "Patna City", villages: [{ name: "Bankipore" }, { name: "Digha" }, { name: "Kankarbagh" }] },
        { name: "Sampatchak", villages: [{ name: "Sampatchak" }, { name: "Naubatpur" }] },
      ]},
      { name: "Gaya", talukas: [
        { name: "Gaya Sadar", villages: [{ name: "Bodh Gaya" }, { name: "Sherghati" }, { name: "Tekari" }] },
        { name: "Manpur", villages: [{ name: "Manpur" }, { name: "Belaganj" }] },
      ]},
      { name: "Muzaffarpur", talukas: [
        { name: "Muzaffarpur Sadar", villages: [{ name: "Kanti" }, { name: "Motipur" }, { name: "Sitamarhi" }] },
      ]},
      { name: "Bhagalpur", talukas: [
        { name: "Bhagalpur Sadar", villages: [{ name: "Sultanganj" }, { name: "Kahalgaon" }, { name: "Naugachia" }] },
      ]},
    ],
  },
  {
    name: "Chhattisgarh",
    districts: [
      { name: "Raipur", talukas: [
        { name: "Raipur", villages: [{ name: "Abhanpur" }, { name: "Arang" }, { name: "Tilda-Neora" }] },
        { name: "Dharsiwa", villages: [{ name: "Dharsiwa" }, { name: "Mandir Hasaud" }] },
      ]},
      { name: "Durg", talukas: [
        { name: "Durg", villages: [{ name: "Bhilai" }, { name: "Patan" }, { name: "Berla" }] },
      ]},
      { name: "Bilaspur", talukas: [
        { name: "Bilaspur", villages: [{ name: "Ratanpur" }, { name: "Takhatpur" }, { name: "Kota" }] },
      ]},
    ],
  },
  {
    name: "Delhi",
    districts: [
      { name: "Central Delhi", talukas: [
        { name: "Connaught Place", villages: [{ name: "Karol Bagh" }, { name: "Paharganj" }, { name: "Daryaganj" }] },
        { name: "Chandni Chowk", villages: [{ name: "Chandni Chowk" }, { name: "Sadar Bazaar" }, { name: "Khari Baoli" }] },
      ]},
      { name: "North Delhi", talukas: [
        { name: "Civil Lines", villages: [{ name: "Mukherjee Nagar" }, { name: "Shakti Nagar" }, { name: "Burari" }] },
        { name: "Narela", villages: [{ name: "Narela" }, { name: "Alipur" }, { name: "Bawana" }] },
      ]},
      { name: "South Delhi", talukas: [
        { name: "Mehrauli", villages: [{ name: "Chattarpur" }, { name: "Vasant Kunj" }, { name: "Saket" }] },
        { name: "Hauz Khas", villages: [{ name: "Green Park" }, { name: "Malviya Nagar" }, { name: "Greater Kailash" }] },
      ]},
      { name: "East Delhi", talukas: [
        { name: "Preet Vihar", villages: [{ name: "Laxmi Nagar" }, { name: "Patparganj" }, { name: "Mayur Vihar" }] },
      ]},
      { name: "West Delhi", talukas: [
        { name: "Janakpuri", villages: [{ name: "Uttam Nagar" }, { name: "Dwarka" }, { name: "Vikaspuri" }] },
      ]},
      { name: "North West Delhi", talukas: [
        { name: "Rohini", villages: [{ name: "Pitampura" }, { name: "Shalimar Bagh" }, { name: "Ashok Vihar" }] },
      ]},
      { name: "South West Delhi", talukas: [
        { name: "Dwarka", villages: [{ name: "Palam" }, { name: "Kapashera" }, { name: "Najafgarh" }] },
      ]},
      { name: "New Delhi", talukas: [
        { name: "New Delhi", villages: [{ name: "Lutyen's Delhi" }, { name: "Chanakyapuri" }, { name: "RK Puram" }] },
      ]},
      { name: "North East Delhi", talukas: [
        { name: "Seelampur", villages: [{ name: "Jaffrabad" }, { name: "Mustafabad" }, { name: "Gokulpuri" }] },
      ]},
      { name: "Shahdara", talukas: [
        { name: "Vivek Vihar", villages: [{ name: "Prashant Vihar" }, { name: "Anand Vihar" }, { name: "Dilshad Garden" }] },
      ]},
      { name: "South East Delhi", talukas: [
        { name: "Okhla", villages: [{ name: "Jamia Nagar" }, { name: "Sangam Vihar" }, { name: "Badarpur" }] },
      ]},
    ],
  },
  {
    name: "Goa",
    districts: [
      { name: "North Goa", talukas: [
        { name: "Panaji", villages: [{ name: "Panaji" }, { name: "Mapusa" }, { name: "Calangute" }, { name: "Candolim" }] },
        { name: "Bardez", villages: [{ name: "Bardez" }, { name: "Anjuna" }, { name: "Vagator" }] },
        { name: "Pernem", villages: [{ name: "Pernem" }, { name: "Arambol" }, { name: "Querim" }] },
      ]},
      { name: "South Goa", talukas: [
        { name: "Margao", villages: [{ name: "Margao" }, { name: "Navelim" }, { name: "Fatorda" }] },
        { name: "Salcete", villages: [{ name: "Colva" }, { name: "Benaulim" }, { name: "Cavelossim" }] },
      ]},
    ],
  },
  {
    name: "Gujarat",
    districts: [
      { name: "Ahmedabad", talukas: [
        { name: "Ahmedabad City", villages: [{ name: "Satellite" }, { name: "Bopal" }, { name: "Navrangpura" }, { name: "Maninagar" }] },
        { name: "Daskroi", villages: [{ name: "Sanand" }, { name: "Bavla" }, { name: "Bareja" }] },
        { name: "Detroj-Rampura", villages: [{ name: "Detroj" }, { name: "Rampura" }] },
      ]},
      { name: "Surat", talukas: [
        { name: "Surat City", villages: [{ name: "Adajan" }, { name: "Vesu" }, { name: "Udhna" }, { name: "Katargam" }] },
        { name: "Choryasi", villages: [{ name: "Dumas" }, { name: "Sayan" }, { name: "Kim" }] },
      ]},
      { name: "Vadodara", talukas: [
        { name: "Vadodara", villages: [{ name: "Manjalpur" }, { name: "Waghodia" }, { name: "Karjan" }] },
      ]},
      { name: "Rajkot", talukas: [
        { name: "Rajkot", villages: [{ name: "Kotda Sangani" }, { name: "Gondal" }, { name: "Jetpur" }] },
      ]},
    ],
  },
  {
    name: "Haryana",
    districts: [
      { name: "Gurugram", talukas: [
        { name: "Gurugram", villages: [{ name: "DLF City" }, { name: "Sohna" }, { name: "Pataudi" }, { name: "Farukhnagar" }] },
        { name: "Manesar", villages: [{ name: "Manesar" }, { name: "Kherki Daula" }] },
      ]},
      { name: "Faridabad", talukas: [
        { name: "Faridabad", villages: [{ name: "Ballabgarh" }, { name: "Palwal" }, { name: "Tigaon" }] },
      ]},
      { name: "Ambala", talukas: [
        { name: "Ambala City", villages: [{ name: "Ambala Cantonment" }, { name: "Shahzadpur" }] },
        { name: "Barara", villages: [{ name: "Barara" }, { name: "Naraingarh" }] },
      ]},
      { name: "Karnal", talukas: [
        { name: "Karnal", villages: [{ name: "Indri" }, { name: "Nilokheri" }, { name: "Gharaunda" }] },
      ]},
    ],
  },
  {
    name: "Himachal Pradesh",
    districts: [
      { name: "Shimla", talukas: [
        { name: "Shimla Urban", villages: [{ name: "Shimla" }, { name: "Sanjauli" }, { name: "Boileauganj" }] },
        { name: "Rampur", villages: [{ name: "Rampur" }, { name: "Sarahan" }, { name: "Nankhari" }] },
      ]},
      { name: "Kangra", talukas: [
        { name: "Dharamsala", villages: [{ name: "McLeod Ganj" }, { name: "Palampur" }, { name: "Baijnath" }] },
        { name: "Nurpur", villages: [{ name: "Nurpur" }, { name: "Jawali" }] },
      ]},
    ],
  },
  {
    name: "Jharkhand",
    districts: [
      { name: "Ranchi", talukas: [
        { name: "Ranchi Sadar", villages: [{ name: "Hatia" }, { name: "Kanke" }, { name: "Dhurwa" }] },
        { name: "Namkum", villages: [{ name: "Namkum" }, { name: "Bero" }] },
      ]},
      { name: "Dhanbad", talukas: [
        { name: "Dhanbad Sadar", villages: [{ name: "Bokaro" }, { name: "Jharia" }, { name: "Sindri" }] },
      ]},
    ],
  },
  {
    name: "Karnataka",
    districts: [
      { name: "Bengaluru Urban", talukas: [
        { name: "Bengaluru North", villages: [{ name: "Yelahanka" }, { name: "Hebbal" }, { name: "Dasarahalli" }] },
        { name: "Bengaluru South", villages: [{ name: "JP Nagar" }, { name: "Jayanagar" }, { name: "BTM Layout" }] },
        { name: "Bengaluru East", villages: [{ name: "Indiranagar" }, { name: "Whitefield" }, { name: "HAL" }] },
        { name: "Anekal", villages: [{ name: "Anekal" }, { name: "Electronic City" }, { name: "Sarjapura" }] },
      ]},
      { name: "Mysuru", talukas: [
        { name: "Mysuru", villages: [{ name: "Krishnarajanagara" }, { name: "Nanjangud" }, { name: "T. Narasipura" }] },
        { name: "Hunsur", villages: [{ name: "Hunsur" }, { name: "Periyapatna" }] },
      ]},
      { name: "Dakshina Kannada", talukas: [
        { name: "Mangaluru", villages: [{ name: "Ullal" }, { name: "Bajpe" }, { name: "Buntwal" }] },
      ]},
      { name: "Belagavi", talukas: [
        { name: "Belagavi", villages: [{ name: "Gokak" }, { name: "Bailhongal" }, { name: "Raibag" }] },
      ]},
    ],
  },
  {
    name: "Kerala",
    districts: [
      { name: "Thiruvananthapuram", talukas: [
        { name: "Thiruvananthapuram", villages: [{ name: "Kazhakuttam" }, { name: "Nemom" }, { name: "Attingal" }] },
        { name: "Nedumangad", villages: [{ name: "Nedumangad" }, { name: "Varkala" }] },
      ]},
      { name: "Ernakulam", talukas: [
        { name: "Kochi", villages: [{ name: "Fort Kochi" }, { name: "Thripunithura" }, { name: "Kalamassery" }] },
        { name: "Aluva", villages: [{ name: "Aluva" }, { name: "Perumbavoor" }, { name: "Angamaly" }] },
      ]},
      { name: "Kozhikode", talukas: [
        { name: "Kozhikode", villages: [{ name: "Beypore" }, { name: "Feroke" }, { name: "Koyilandy" }] },
      ]},
    ],
  },
  {
    name: "Madhya Pradesh",
    districts: [
      { name: "Bhopal", talukas: [
        { name: "Bhopal", villages: [{ name: "Berasia" }, { name: "Huzur" }, { name: "Phanda" }, { name: "Raisen" }] },
        { name: "Berasia", villages: [{ name: "Berasia" }, { name: "Badkhar" }] },
      ]},
      { name: "Indore", talukas: [
        { name: "Indore", villages: [{ name: "Mhow" }, { name: "Sanwer" }, { name: "Depalpur" }] },
        { name: "Depalpur", villages: [{ name: "Depalpur" }, { name: "Hatod" }] },
      ]},
      { name: "Jabalpur", talukas: [
        { name: "Jabalpur", villages: [{ name: "Mandla" }, { name: "Katni" }, { name: "Sihora" }] },
      ]},
      { name: "Gwalior", talukas: [
        { name: "Gwalior", villages: [{ name: "Morar" }, { name: "Lashkar" }, { name: "Dabra" }] },
      ]},
    ],
  },
  {
    name: "Maharashtra",
    districts: [
      { name: "Mumbai City", talukas: [
        { name: "Kurla", villages: [{ name: "Dharavi" }, { name: "Vidyavihar" }, { name: "Ghatkopar" }] },
        { name: "Andheri", villages: [{ name: "Versova" }, { name: "Jogeshwari" }, { name: "Sahar" }] },
        { name: "Borivali", villages: [{ name: "Kandivali" }, { name: "Malad" }, { name: "Dahisar" }] },
      ]},
      { name: "Mumbai Suburban", talukas: [
        { name: "Bandra", villages: [{ name: "Khar" }, { name: "Santacruz" }, { name: "Ville Parle" }] },
        { name: "Thane", villages: [{ name: "Dombivali" }, { name: "Kalyan" }, { name: "Ulhasnagar" }] },
      ]},
      { name: "Pune", talukas: [
        { name: "Pune City", villages: [{ name: "Hadapsar" }, { name: "Kothrud" }, { name: "Pimpri" }, { name: "Chinchwad" }] },
        { name: "Haveli", villages: [{ name: "Manjari" }, { name: "Khed" }, { name: "Chakan" }] },
        { name: "Maval", villages: [{ name: "Talegaon Dabhade" }, { name: "Lonavala" }, { name: "Khandala" }] },
      ]},
      { name: "Nashik", talukas: [
        { name: "Nashik", villages: [{ name: "Ozar" }, { name: "Deolali" }, { name: "Sinnar" }] },
        { name: "Niphad", villages: [{ name: "Niphad" }, { name: "Lasalgaon" }] },
      ]},
      { name: "Nagpur", talukas: [
        { name: "Nagpur City", villages: [{ name: "Kamptee" }, { name: "Hingna" }, { name: "Parseoni" }] },
      ]},
    ],
  },
  {
    name: "Manipur",
    districts: [
      { name: "Imphal West", talukas: [
        { name: "Imphal", villages: [{ name: "Langol" }, { name: "Singjamei" }, { name: "Lamphel" }] },
      ]},
      { name: "Imphal East", talukas: [
        { name: "Imphal East", villages: [{ name: "Porompat" }, { name: "Heingang" }] },
      ]},
    ],
  },
  {
    name: "Meghalaya",
    districts: [
      { name: "East Khasi Hills", talukas: [
        { name: "Shillong", villages: [{ name: "Laban" }, { name: "Mawlai" }, { name: "Nongthymmai" }] },
      ]},
      { name: "West Garo Hills", talukas: [
        { name: "Tura", villages: [{ name: "Tura" }, { name: "Dalu" }] },
      ]},
    ],
  },
  {
    name: "Mizoram",
    districts: [
      { name: "Aizawl", talukas: [
        { name: "Aizawl", villages: [{ name: "Bungkawn" }, { name: "Chaltlang" }, { name: "Ramhlun" }] },
      ]},
    ],
  },
  {
    name: "Nagaland",
    districts: [
      { name: "Kohima", talukas: [
        { name: "Kohima", villages: [{ name: "Kohima Village" }, { name: "Dzükou" }, { name: "Jotsoma" }] },
      ]},
      { name: "Dimapur", talukas: [
        { name: "Dimapur", villages: [{ name: "Purana Bazaar" }, { name: "Medziphema" }] },
      ]},
    ],
  },
  {
    name: "Odisha",
    districts: [
      { name: "Khordha", talukas: [
        { name: "Bhubaneswar", villages: [{ name: "Aiginia" }, { name: "Patia" }, { name: "Chandrasekharpur" }] },
        { name: "Jatni", villages: [{ name: "Jatni" }, { name: "Bolagarh" }] },
      ]},
      { name: "Cuttack", talukas: [
        { name: "Cuttack Sadar", villages: [{ name: "Jagatpur" }, { name: "Choudwar" }, { name: "Niali" }] },
      ]},
    ],
  },
  {
    name: "Punjab",
    districts: [
      { name: "Ludhiana", talukas: [
        { name: "Ludhiana East", villages: [{ name: "Sahnewal" }, { name: "Doraha" }, { name: "Malerkotla" }] },
        { name: "Ludhiana West", villages: [{ name: "Jagraon" }, { name: "Raikot" }, { name: "Khanna" }] },
      ]},
      { name: "Amritsar", talukas: [
        { name: "Amritsar North", villages: [{ name: "Majitha" }, { name: "Jandiala Guru" }] },
        { name: "Amritsar South", villages: [{ name: "Attari" }, { name: "Ajnala" }] },
      ]},
      { name: "Jalandhar", talukas: [
        { name: "Jalandhar", villages: [{ name: "Phagwara" }, { name: "Nawanshahr" }, { name: "Nakodar" }] },
      ]},
      { name: "Patiala", talukas: [
        { name: "Patiala", villages: [{ name: "Rajpura" }, { name: "Nabha" }, { name: "Sangrur" }] },
      ]},
    ],
  },
  {
    name: "Rajasthan",
    districts: [
      { name: "Jaipur", talukas: [
        { name: "Jaipur", villages: [{ name: "Sanganer" }, { name: "Amer" }, { name: "Chaksu" }, { name: "Kotputli" }] },
        { name: "Bassi", villages: [{ name: "Bassi" }, { name: "Muhana" }] },
        { name: "Dudu", villages: [{ name: "Dudu" }, { name: "Phagi" }] },
      ]},
      { name: "Jodhpur", talukas: [
        { name: "Jodhpur", villages: [{ name: "Mandore" }, { name: "Phalodi" }, { name: "Osian" }] },
      ]},
      { name: "Udaipur", talukas: [
        { name: "Udaipur", villages: [{ name: "Haldighati" }, { name: "Nathdwara" }, { name: "Rajsamand" }] },
      ]},
      { name: "Kota", talukas: [
        { name: "Kota", villages: [{ name: "Bundi" }, { name: "Ramganj Mandi" }, { name: "Digod" }] },
      ]},
    ],
  },
  {
    name: "Sikkim",
    districts: [
      { name: "East Sikkim", talukas: [
        { name: "Gangtok", villages: [{ name: "Gangtok" }, { name: "Ranipool" }, { name: "Pakyong" }] },
      ]},
    ],
  },
  {
    name: "Tamil Nadu",
    districts: [
      { name: "Chennai", talukas: [
        { name: "Chennai North", villages: [{ name: "Tondiarpet" }, { name: "Royapuram" }, { name: "Tiruvottiyur" }] },
        { name: "Chennai South", villages: [{ name: "Adyar" }, { name: "Tambaram" }, { name: "Sholinganallur" }] },
        { name: "Mambalam-Guindy", villages: [{ name: "T. Nagar" }, { name: "Saidapet" }, { name: "Guindy" }] },
      ]},
      { name: "Coimbatore", talukas: [
        { name: "Coimbatore North", villages: [{ name: "Peelamedu" }, { name: "Ganapathy" }, { name: "Singanallur" }] },
        { name: "Pollachi", villages: [{ name: "Pollachi" }, { name: "Valparai" }, { name: "Anaimalai" }] },
      ]},
      { name: "Madurai", talukas: [
        { name: "Madurai North", villages: [{ name: "Melur" }, { name: "Thiruparankundram" }, { name: "Sholavandan" }] },
        { name: "Madurai South", villages: [{ name: "Tirumangalam" }, { name: "Usilampatti" }] },
      ]},
      { name: "Tiruchirappalli", talukas: [
        { name: "Tiruchirappalli", villages: [{ name: "Srirangam" }, { name: "Lalgudi" }, { name: "Manachanallur" }] },
      ]},
    ],
  },
  {
    name: "Telangana",
    districts: [
      { name: "Hyderabad", talukas: [
        { name: "Secunderabad", villages: [{ name: "Trimulgherry" }, { name: "Bowenpally" }, { name: "Malkajgiri" }] },
        { name: "Charminar", villages: [{ name: "Falaknuma" }, { name: "Chandrayangutta" }, { name: "Karwan" }] },
        { name: "Khairatabad", villages: [{ name: "Banjara Hills" }, { name: "Jubilee Hills" }, { name: "Panjagutta" }] },
      ]},
      { name: "Rangareddy", talukas: [
        { name: "Serilingampally", villages: [{ name: "Gachibowli" }, { name: "Madhapur" }, { name: "Kondapur" }] },
        { name: "Rajendranagar", villages: [{ name: "Attapur" }, { name: "Shamshabad" }] },
      ]},
      { name: "Warangal", talukas: [
        { name: "Warangal Urban", villages: [{ name: "Hanmakonda" }, { name: "Kazipet" }, { name: "Subedari" }] },
      ]},
    ],
  },
  {
    name: "Tripura",
    districts: [
      { name: "West Tripura", talukas: [
        { name: "Agartala", villages: [{ name: "Agartala" }, { name: "Mohanpur" }, { name: "Majlishpur" }] },
      ]},
    ],
  },
  {
    name: "Uttar Pradesh",
    districts: [
      { name: "Lucknow", talukas: [
        { name: "Lucknow Sadar", villages: [{ name: "Hazratganj" }, { name: "Gomti Nagar" }, { name: "Aliganj" }] },
        { name: "Mohanlalganj", villages: [{ name: "Mohanlalganj" }, { name: "Malihabad" }] },
        { name: "Bakshi Ka Talab", villages: [{ name: "Bakshi Ka Talab" }, { name: "Gosainganj" }] },
      ]},
      { name: "Kanpur Nagar", talukas: [
        { name: "Kanpur Sadar", villages: [{ name: "Armapur" }, { name: "Panki" }, { name: "Govind Nagar" }] },
        { name: "Ghatampur", villages: [{ name: "Ghatampur" }, { name: "Bhitargaon" }] },
      ]},
      { name: "Agra", talukas: [
        { name: "Agra Sadar", villages: [{ name: "Fatehpur Sikri" }, { name: "Kiraoli" }, { name: "Bah" }] },
        { name: "Etmadpur", villages: [{ name: "Etmadpur" }, { name: "Pinahat" }] },
      ]},
      { name: "Varanasi", talukas: [
        { name: "Varanasi Sadar", villages: [{ name: "Sarnath" }, { name: "Ramnagar" }, { name: "Chiraigaon" }] },
      ]},
      { name: "Prayagraj", talukas: [
        { name: "Prayagraj Sadar", villages: [{ name: "Naini" }, { name: "Phulpur" }, { name: "Meja" }] },
      ]},
    ],
  },
  {
    name: "Uttarakhand",
    districts: [
      { name: "Dehradun", talukas: [
        { name: "Dehradun", villages: [{ name: "Rishikesh" }, { name: "Doiwala" }, { name: "Vikasnagar" }] },
        { name: "Chakrata", villages: [{ name: "Chakrata" }, { name: "Kalsi" }] },
      ]},
      { name: "Haridwar", talukas: [
        { name: "Haridwar", villages: [{ name: "Roorkee" }, { name: "Laksar" }, { name: "Manglaur" }] },
      ]},
    ],
  },
  {
    name: "West Bengal",
    districts: [
      { name: "Kolkata", talukas: [
        { name: "Kolkata", villages: [{ name: "Dum Dum" }, { name: "Jadavpur" }, { name: "Behala" }, { name: "Garden Reach" }] },
        { name: "Metiabruz", villages: [{ name: "Metiabruz" }, { name: "Maheshtala" }] },
      ]},
      { name: "Howrah", talukas: [
        { name: "Howrah Sadar", villages: [{ name: "Liluah" }, { name: "Bally" }, { name: "Uluberia" }] },
        { name: "Uluberia", villages: [{ name: "Uluberia" }, { name: "Bagnan" }, { name: "Amta" }] },
      ]},
      { name: "North 24 Parganas", talukas: [
        { name: "Barasat", villages: [{ name: "Madhyamgram" }, { name: "Rajarhat" }, { name: "Basirhat" }] },
        { name: "Bongaon", villages: [{ name: "Bongaon" }, { name: "Gaighata" }] },
      ]},
    ],
  },
  // Union Territories
  {
    name: "Andaman and Nicobar Islands",
    districts: [
      { name: "South Andaman", talukas: [
        { name: "Port Blair", villages: [{ name: "Port Blair" }, { name: "Bambooflat" }, { name: "Wandoor" }] },
      ]},
    ],
  },
  {
    name: "Chandigarh",
    districts: [
      { name: "Chandigarh", talukas: [
        { name: "Chandigarh", villages: [{ name: "Sector 17" }, { name: "Sector 22" }, { name: "Industrial Area" }, { name: "Manimajra" }] },
      ]},
    ],
  },
  {
    name: "Dadra and Nagar Haveli and Daman and Diu",
    districts: [
      { name: "Daman", talukas: [
        { name: "Daman", villages: [{ name: "Nani Daman" }, { name: "Moti Daman" }] },
      ]},
      { name: "Dadra and Nagar Haveli", talukas: [
        { name: "Silvassa", villages: [{ name: "Silvassa" }, { name: "Naroli" }] },
      ]},
    ],
  },
  {
    name: "Jammu and Kashmir",
    districts: [
      { name: "Srinagar", talukas: [
        { name: "Srinagar", villages: [{ name: "Dal Lake" }, { name: "Hazratbal" }, { name: "Sopore" }] },
      ]},
      { name: "Jammu", talukas: [
        { name: "Jammu", villages: [{ name: "Jammu City" }, { name: "Satwari" }, { name: "Akhnoor" }] },
      ]},
    ],
  },
  {
    name: "Ladakh",
    districts: [
      { name: "Leh", talukas: [
        { name: "Leh", villages: [{ name: "Leh Town" }, { name: "Nubra" }, { name: "Khaltsi" }] },
      ]},
      { name: "Kargil", talukas: [
        { name: "Kargil", villages: [{ name: "Kargil Town" }, { name: "Zanskar" }] },
      ]},
    ],
  },
  {
    name: "Lakshadweep",
    districts: [
      { name: "Lakshadweep", talukas: [
        { name: "Kavaratti", villages: [{ name: "Kavaratti" }, { name: "Agatti" }, { name: "Minicoy" }] },
      ]},
    ],
  },
  {
    name: "Puducherry",
    districts: [
      { name: "Puducherry", talukas: [
        { name: "Puducherry", villages: [{ name: "Ariyankuppam" }, { name: "Mannadipet" }, { name: "Nettapakkam" }] },
      ]},
      { name: "Karaikal", talukas: [
        { name: "Karaikal", villages: [{ name: "Karaikal" }, { name: "Thirunallar" }] },
      ]},
    ],
  },
];

export function getStates(): string[] {
  return INDIA_LOCATIONS.map(s => s.name).sort();
}

export function getDistricts(stateName: string): string[] {
  const state = INDIA_LOCATIONS.find(s => s.name === stateName);
  return state ? state.districts.map(d => d.name).sort() : [];
}

export function getTalukas(stateName: string, districtName: string): string[] {
  const state = INDIA_LOCATIONS.find(s => s.name === stateName);
  if (!state) return [];
  const district = state.districts.find(d => d.name === districtName);
  return district ? district.talukas.map(t => t.name).sort() : [];
}

export function getVillages(stateName: string, districtName: string, talukaName: string): string[] {
  const state = INDIA_LOCATIONS.find(s => s.name === stateName);
  if (!state) return [];
  const district = state.districts.find(d => d.name === districtName);
  if (!district) return [];
  const taluka = district.talukas.find(t => t.name === talukaName);
  return taluka ? taluka.villages.map(v => v.name).sort() : [];
}
