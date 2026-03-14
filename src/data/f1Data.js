// ─── 2026 F1 Data — Teams, Drivers, Circuits ─────────────────────────────────
// Sources: F1.com, Wikipedia, Sky Sports, ESPN (March 2026)

export const POWER_UNITS_2026 = {
  mercedes: { name: "Mercedes-AMG HPP",  teams: ["mercedes","mclaren","alpine","williams"], strength: 0.97 },
  ferrari:  { name: "Ferrari",           teams: ["ferrari","haas","cadillac"],              strength: 0.91 },
  rb_ford:  { name: "Red Bull/Ford",     teams: ["red_bull","rb"],                          strength: 0.86 },
  honda:    { name: "Honda",             teams: ["aston"],                                  strength: 0.88 },
  audi:     { name: "Audi",              teams: ["audi"],                                   strength: 0.82 },
};

export const TEAMS_2026 = [
  { id: "mercedes", name: "Mercedes-AMG Petronas",    short: "Mercedes",    color: "#00D2BE", accent: "#C0C0C0", chassis: "W16",      pu: "mercedes" },
  { id: "ferrari",  name: "Scuderia Ferrari",          short: "Ferrari",     color: "#E8002D", accent: "#FFD700", chassis: "SF-26",    pu: "ferrari"  },
  { id: "mclaren",  name: "McLaren Formula 1 Team",    short: "McLaren",     color: "#FF8000", accent: "#0090FF", chassis: "MCL39",    pu: "mercedes" },
  { id: "red_bull", name: "Oracle Red Bull Racing",    short: "Red Bull",    color: "#3671C6", accent: "#CC1E4A", chassis: "RB22",     pu: "rb_ford"  },
  { id: "aston",    name: "Aston Martin Aramco Honda", short: "Aston Martin",color: "#006F62", accent: "#CEDC00", chassis: "AMR26",    pu: "honda"    },
  { id: "williams", name: "Williams Racing",           short: "Williams",    color: "#37BEDD", accent: "#004BA0", chassis: "FW47",     pu: "mercedes" },
  { id: "rb",       name: "Visa Cash App RB",          short: "RB",          color: "#6692FF", accent: "#FF4444", chassis: "VCARB02", pu: "rb_ford"  },
  { id: "haas",     name: "MoneyGram Haas F1 Team",    short: "Haas",        color: "#B6BABD", accent: "#E8002D", chassis: "VF-26",   pu: "ferrari"  },
  { id: "alpine",   name: "BWT Alpine F1 Team",        short: "Alpine",      color: "#0093CC", accent: "#FF69B4", chassis: "A526",    pu: "mercedes" },
  { id: "audi",     name: "Audi F1 Team",              short: "Audi",        color: "#BB3124", accent: "#C8AA6E", chassis: "C46",     pu: "audi"     },
  { id: "cadillac", name: "Cadillac Formula 1 Team",   short: "Cadillac",    color: "#1B4F8A", accent: "#C8AA6E", chassis: "TWO026", pu: "ferrari"  },
];

export const DRIVERS_2026 = [
  { id: "RUS", name: "George Russell",    team: "mercedes", num: 63, nationality: "GBR", age: 27, rating: 91, rookie: false },
  { id: "ANT", name: "Kimi Antonelli",    team: "mercedes", num: 12, nationality: "ITA", age: 18, rating: 80, rookie: true  },
  { id: "LEC", name: "Charles Leclerc",   team: "ferrari",  num: 16, nationality: "MON", age: 28, rating: 93, rookie: false },
  { id: "HAM", name: "Lewis Hamilton",    team: "ferrari",  num: 44, nationality: "GBR", age: 40, rating: 91, rookie: false },
  { id: "NOR", name: "Lando Norris",      team: "mclaren",  num:  4, nationality: "GBR", age: 25, rating: 94, rookie: false },
  { id: "PIA", name: "Oscar Piastri",     team: "mclaren",  num: 81, nationality: "AUS", age: 24, rating: 88, rookie: false },
  { id: "VER", name: "Max Verstappen",    team: "red_bull", num:  1, nationality: "NED", age: 28, rating: 96, rookie: false },
  { id: "LAW", name: "Liam Lawson",       team: "red_bull", num: 30, nationality: "NZL", age: 22, rating: 81, rookie: false },
  { id: "ALO", name: "Fernando Alonso",   team: "aston",    num: 14, nationality: "ESP", age: 44, rating: 89, rookie: false },
  { id: "STR", name: "Lance Stroll",      team: "aston",    num: 18, nationality: "CAN", age: 26, rating: 76, rookie: false },
  { id: "ALB", name: "Alex Albon",        team: "williams", num: 23, nationality: "THA", age: 28, rating: 82, rookie: false },
  { id: "SAI", name: "Carlos Sainz",      team: "williams", num: 55, nationality: "ESP", age: 30, rating: 87, rookie: false },
  { id: "TSU", name: "Yuki Tsunoda",      team: "rb",       num: 22, nationality: "JPN", age: 24, rating: 80, rookie: false },
  { id: "LIN", name: "Arvid Lindblad",    team: "rb",       num:  6, nationality: "GBR", age: 18, rating: 76, rookie: true  },
  { id: "BEA", name: "Oliver Bearman",    team: "haas",     num: 87, nationality: "GBR", age: 19, rating: 78, rookie: false },
  { id: "OCO", name: "Esteban Ocon",      team: "haas",     num: 31, nationality: "FRA", age: 28, rating: 80, rookie: false },
  { id: "GAS", name: "Pierre Gasly",      team: "alpine",   num: 10, nationality: "FRA", age: 28, rating: 82, rookie: false },
  { id: "COL", name: "Franco Colapinto",  team: "alpine",   num: 43, nationality: "ARG", age: 21, rating: 77, rookie: false },
  { id: "BOR", name: "Gabriel Bortoleto", team: "audi",     num:  5, nationality: "BRA", age: 20, rating: 76, rookie: true  },
  { id: "HUL", name: "Nico Hülkenberg",   team: "audi",     num: 27, nationality: "GER", age: 37, rating: 80, rookie: false },
  { id: "PER", name: "Sergio Pérez",      team: "cadillac", num: 11, nationality: "MEX", age: 35, rating: 78, rookie: false },
  { id: "BOT", name: "Valtteri Bottas",   team: "cadillac", num: 77, nationality: "FIN", age: 36, rating: 77, rookie: false },
];

export const CIRCUITS_2026 = [
  { round:1,  name:"Australian Grand Prix",    circuit:"Albert Park Circuit",            country:"AUS", laps:58, type:"balanced",  completed:true  },
  { round:2,  name:"Chinese Grand Prix",       circuit:"Shanghai International Circuit", country:"CHN", laps:56, type:"balanced",  completed:false, sprint:true },
  { round:3,  name:"Japanese Grand Prix",      circuit:"Suzuka Circuit",                 country:"JPN", laps:53, type:"technical", completed:false },
  { round:4,  name:"Bahrain Grand Prix",       circuit:"Bahrain International Circuit",  country:"BHR", laps:57, type:"technical", completed:false },
  { round:5,  name:"Saudi Arabian Grand Prix", circuit:"Jeddah Corniche Circuit",        country:"KSA", laps:50, type:"street",    completed:false },
  { round:6,  name:"Miami Grand Prix",         circuit:"Miami International Autodrome",  country:"USA", laps:57, type:"street",    completed:false, sprint:true },
  { round:7,  name:"Monaco Grand Prix",        circuit:"Circuit de Monaco",              country:"MON", laps:78, type:"street",    completed:false },
  { round:8,  name:"Spanish Grand Prix",       circuit:"Circuit de Barcelona-Catalunya", country:"ESP", laps:66, type:"balanced",  completed:false },
  { round:9,  name:"Canadian Grand Prix",      circuit:"Circuit Gilles Villeneuve",      country:"CAN", laps:70, type:"street",    completed:false, sprint:true },
  { round:10, name:"Madrid Grand Prix",        circuit:"Madrid Street Circuit (IFEMA)",  country:"ESP", laps:55, type:"street",    completed:false },
  { round:11, name:"Austrian Grand Prix",      circuit:"Red Bull Ring",                  country:"AUT", laps:71, type:"high_speed",completed:false },
  { round:12, name:"British Grand Prix",       circuit:"Silverstone Circuit",            country:"GBR", laps:52, type:"high_speed",completed:false, sprint:true },
  { round:13, name:"Belgian Grand Prix",       circuit:"Circuit de Spa-Francorchamps",   country:"BEL", laps:44, type:"high_speed",completed:false },
  { round:14, name:"Hungarian Grand Prix",     circuit:"Hungaroring",                    country:"HUN", laps:70, type:"technical", completed:false },
  { round:15, name:"Dutch Grand Prix",         circuit:"Circuit Zandvoort",              country:"NED", laps:72, type:"technical", completed:false },
  { round:16, name:"Italian Grand Prix",       circuit:"Autodromo Nazionale Monza",      country:"ITA", laps:53, type:"high_speed",completed:false },
  { round:17, name:"Azerbaijan Grand Prix",    circuit:"Baku City Circuit",              country:"AZE", laps:51, type:"street",    completed:false },
  { round:18, name:"Singapore Grand Prix",     circuit:"Marina Bay Street Circuit",      country:"SGP", laps:62, type:"street",    completed:false, sprint:true },
  { round:19, name:"United States Grand Prix", circuit:"Circuit of the Americas",        country:"USA", laps:56, type:"technical", completed:false },
  { round:20, name:"Mexico City Grand Prix",   circuit:"Autodromo Hermanos Rodriguez",   country:"MEX", laps:71, type:"balanced",  completed:false },
  { round:21, name:"São Paulo Grand Prix",     circuit:"Autodromo Jose Carlos Pace",     country:"BRA", laps:71, type:"balanced",  completed:false, sprint:true },
  { round:22, name:"Las Vegas Grand Prix",     circuit:"Las Vegas Street Circuit",       country:"USA", laps:50, type:"street",    completed:false },
  { round:23, name:"Qatar Grand Prix",         circuit:"Lusail International Circuit",   country:"QAT", laps:57, type:"high_speed",completed:false },
  { round:24, name:"Abu Dhabi Grand Prix",     circuit:"Yas Marina Circuit",             country:"UAE", laps:58, type:"balanced",  completed:false },
];

export const POINTS       = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
export const SPRINT_PTS   = [8, 7, 6, 5, 4, 3, 2, 1];
export const OPENF1_BASE  = "https://api.openf1.org/v1";

// driver_number → driver ID mapping (for parsing OpenF1 results)
export const NUM_TO_ID = {
  63:"RUS", 12:"ANT", 16:"LEC", 44:"HAM",  4:"NOR", 81:"PIA",
   1:"VER", 30:"LAW", 14:"ALO", 18:"STR", 23:"ALB", 55:"SAI",
  22:"TSU",  6:"LIN", 87:"BEA", 31:"OCO", 10:"GAS", 43:"COL",
   5:"BOR", 27:"HUL", 11:"PER", 77:"BOT",
};

export const FLAG_MAP = {
  BHR:"🇧🇭", KSA:"🇸🇦", AUS:"🇦🇺", JPN:"🇯🇵", CHN:"🇨🇳", USA:"🇺🇸",
  ITA:"🇮🇹", MON:"🇲🇨", ESP:"🇪🇸", CAN:"🇨🇦", AUT:"🇦🇹", GBR:"🇬🇧",
  BEL:"🇧🇪", HUN:"🇭🇺", NED:"🇳🇱", AZE:"🇦🇿", SGP:"🇸🇬", MEX:"🇲🇽",
  BRA:"🇧🇷", QAT:"🇶🇦", UAE:"🇦🇪",
};

export const NAT_FLAG = {
  NED:"🇳🇱", NZL:"🇳🇿", MON:"🇲🇨", GBR:"🇬🇧", ITA:"🇮🇹", AUS:"🇦🇺",
  ESP:"🇪🇸", CAN:"🇨🇦", FRA:"🇫🇷", JPN:"🇯🇵", THA:"🇹🇭", GER:"🇩🇪",
  BRA:"🇧🇷", ARG:"🇦🇷", FIN:"🇫🇮", MEX:"🇲🇽",
};
