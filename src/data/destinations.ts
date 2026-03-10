export type TravelMode = 'winter' | 'summer';

export interface WinterEnv {
  snowDepthBase: number;
  snowDepthPeak: number;
  tempC: number;
  recentStorm: boolean;
  stormDaysAgo?: number;
}

export interface SummerEnv {
  waterTempC: number;
  swellHeightM: number;
  sunnyDays: number;
  rainyDays: number;
}

export interface FlightLeg {
  airline: string;
  departure: string;
  arrival: string;
  baseFare: number;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  code: string;
  mode: TravelMode;
  env: WinterEnv | SummerEnv;
  sentiment: string;
  outbound: FlightLeg;
  returnFlight: FlightLeg;
  baggageFee: number;
  airportTransfer: number;
  accommodationPerNight: number;
  activityCostPerDay: number; // skipass or surf rental per day
  clubMedPerNight: number;
  clubMedActivityIncluded: boolean;
}

const winterDestinations: Destination[] = [
  {
    id: 'w1', name: 'Val Thorens', country: 'FR', code: 'GVA', mode: 'winter',
    env: { snowDepthBase: 180, snowDepthPeak: 320, tempC: -8, recentStorm: true, stormDaysAgo: 1 },
    sentiment: 'Epic powder day reports flooding r/skiing. Multiple sources confirm 40cm dump overnight. Lifts fully operational.',
    outbound: { airline: 'Transavia', departure: '06:15', arrival: '10:30', baseFare: 189 },
    returnFlight: { airline: 'EasyJet', departure: '18:00', arrival: '23:45', baseFare: 215 },
    baggageFee: 45, airportTransfer: 85, accommodationPerNight: 95, activityCostPerDay: 62, clubMedPerNight: 285, clubMedActivityIncluded: true,
  },
  {
    id: 'w2', name: 'Innsbruck', country: 'AT', code: 'INN', mode: 'winter',
    env: { snowDepthBase: 120, snowDepthPeak: 250, tempC: -5, recentStorm: false },
    sentiment: 'Conditions solid but not exceptional. Groomed runs in great shape. Off-piste getting tracked out quickly.',
    outbound: { airline: 'Austrian', departure: '07:00', arrival: '10:15', baseFare: 245 },
    returnFlight: { airline: 'Austrian', departure: '16:30', arrival: '21:00', baseFare: 230 },
    baggageFee: 40, airportTransfer: 25, accommodationPerNight: 80, activityCostPerDay: 58, clubMedPerNight: 260, clubMedActivityIncluded: true,
  },
  {
    id: 'w3', name: 'Chamonix', country: 'FR', code: 'GVA', mode: 'winter',
    env: { snowDepthBase: 150, snowDepthPeak: 380, tempC: -10, recentStorm: true, stormDaysAgo: 2 },
    sentiment: 'Vallée Blanche open and in prime condition. Avalanche risk moderate above 2800m. Expert terrain firing.',
    outbound: { airline: 'EasyJet', departure: '05:45', arrival: '09:50', baseFare: 175 },
    returnFlight: { airline: 'Transavia', departure: '19:15', arrival: '23:30', baseFare: 199 },
    baggageFee: 45, airportTransfer: 95, accommodationPerNight: 110, activityCostPerDay: 65, clubMedPerNight: 310, clubMedActivityIncluded: true,
  },
  {
    id: 'w4', name: 'Zermatt', country: 'CH', code: 'ZRH', mode: 'winter',
    env: { snowDepthBase: 140, snowDepthPeak: 290, tempC: -12, recentStorm: false },
    sentiment: 'Matterhorn views spectacular. Snow coverage above average for season. High altitude guarantee delivers.',
    outbound: { airline: 'Swiss', departure: '08:30', arrival: '12:00', baseFare: 310 },
    returnFlight: { airline: 'Swiss', departure: '14:00', arrival: '19:30', baseFare: 295 },
    baggageFee: 55, airportTransfer: 120, accommodationPerNight: 165, activityCostPerDay: 75, clubMedPerNight: 380, clubMedActivityIncluded: true,
  },
  {
    id: 'w5', name: 'St. Anton', country: 'AT', code: 'INN', mode: 'winter',
    env: { snowDepthBase: 160, snowDepthPeak: 310, tempC: -7, recentStorm: true, stormDaysAgo: 3 },
    sentiment: 'Arlberg connection fully open. Party scene active. Good snow but warming trend expected next week.',
    outbound: { airline: 'Wizz Air', departure: '06:00', arrival: '09:30', baseFare: 155 },
    returnFlight: { airline: 'Wizz Air', departure: '17:45', arrival: '22:15', baseFare: 165 },
    baggageFee: 35, airportTransfer: 55, accommodationPerNight: 90, activityCostPerDay: 58, clubMedPerNight: 270, clubMedActivityIncluded: true,
  },
  {
    id: 'w6', name: 'Bansko', country: 'BG', code: 'SOF', mode: 'winter',
    env: { snowDepthBase: 80, snowDepthPeak: 180, tempC: -3, recentStorm: false },
    sentiment: 'Budget king still delivers. Snow machines working overtime. Nightlife rivals après in the Alps.',
    outbound: { airline: 'Wizz Air', departure: '09:00', arrival: '11:30', baseFare: 89 },
    returnFlight: { airline: 'Wizz Air', departure: '12:30', arrival: '15:00', baseFare: 95 },
    baggageFee: 30, airportTransfer: 65, accommodationPerNight: 35, activityCostPerDay: 30, clubMedPerNight: 155, clubMedActivityIncluded: true,
  },
  {
    id: 'w7', name: 'Livigno', country: 'IT', code: 'BGY', mode: 'winter',
    env: { snowDepthBase: 130, snowDepthPeak: 240, tempC: -9, recentStorm: true, stormDaysAgo: 1 },
    sentiment: 'Tax-free shopping a huge bonus. Snowpark in world-class condition. Fresh dump has everyone stoked.',
    outbound: { airline: 'Ryanair', departure: '07:15', arrival: '10:00', baseFare: 125 },
    returnFlight: { airline: 'Ryanair', departure: '20:30', arrival: '01:15', baseFare: 135 },
    baggageFee: 35, airportTransfer: 75, accommodationPerNight: 70, activityCostPerDay: 45, clubMedPerNight: 220, clubMedActivityIncluded: true,
  },
  {
    id: 'w8', name: 'Gudauri', country: 'GE', code: 'TBS', mode: 'winter',
    env: { snowDepthBase: 200, snowDepthPeak: 350, tempC: -11, recentStorm: true, stormDaysAgo: 0 },
    sentiment: 'Hidden gem blowing up on socials. Freeride paradise with zero crowds. Currently dumping hard.',
    outbound: { airline: 'Georgian Air', departure: '23:55', arrival: '03:30', baseFare: 165 },
    returnFlight: { airline: 'Georgian Air', departure: '04:30', arrival: '06:00', baseFare: 155 },
    baggageFee: 30, airportTransfer: 45, accommodationPerNight: 40, activityCostPerDay: 18, clubMedPerNight: 0, clubMedActivityIncluded: false,
  },
  {
    id: 'w9', name: 'Verbier', country: 'CH', code: 'GVA', mode: 'winter',
    env: { snowDepthBase: 110, snowDepthPeak: 270, tempC: -6, recentStorm: false },
    sentiment: 'Mont Fort open with stunning views. Expensive but quality unmatched. Expert terrain in good nick.',
    outbound: { airline: 'EasyJet', departure: '05:45', arrival: '09:50', baseFare: 195 },
    returnFlight: { airline: 'Swiss', departure: '15:00', arrival: '20:30', baseFare: 280 },
    baggageFee: 50, airportTransfer: 110, accommodationPerNight: 180, activityCostPerDay: 72, clubMedPerNight: 395, clubMedActivityIncluded: true,
  },
  {
    id: 'w10', name: 'Soldeu', country: 'AD', code: 'TLS', mode: 'winter',
    env: { snowDepthBase: 90, snowDepthPeak: 200, tempC: -4, recentStorm: false },
    sentiment: 'Grandvalira link working well. Tax-free Andorra deals on gear. Snow cannons keeping things rideable.',
    outbound: { airline: 'Transavia', departure: '06:30', arrival: '10:45', baseFare: 145 },
    returnFlight: { airline: 'Transavia', departure: '17:00', arrival: '22:30', baseFare: 160 },
    baggageFee: 40, airportTransfer: 70, accommodationPerNight: 65, activityCostPerDay: 48, clubMedPerNight: 235, clubMedActivityIncluded: true,
  },
  {
    id: 'w11', name: 'Tignes', country: 'FR', code: 'GVA', mode: 'winter',
    env: { snowDepthBase: 170, snowDepthPeak: 340, tempC: -9, recentStorm: true, stormDaysAgo: 2 },
    sentiment: 'Grande Motte glacier skiing superb. Espace Killy in full swing. Altitude guarantees snow late season.',
    outbound: { airline: 'EasyJet', departure: '06:15', arrival: '10:30', baseFare: 185 },
    returnFlight: { airline: 'EasyJet', departure: '18:30', arrival: '23:00', baseFare: 205 },
    baggageFee: 45, airportTransfer: 90, accommodationPerNight: 88, activityCostPerDay: 62, clubMedPerNight: 290, clubMedActivityIncluded: true,
  },
  {
    id: 'w12', name: 'Kitzbühel', country: 'AT', code: 'SZG', mode: 'winter',
    env: { snowDepthBase: 100, snowDepthPeak: 220, tempC: -4, recentStorm: false },
    sentiment: 'Hahnenkamm legacy palpable. Charming medieval town. Snow at lower altitudes thinning, upper fine.',
    outbound: { airline: 'Austrian', departure: '07:30', arrival: '10:45', baseFare: 235 },
    returnFlight: { airline: 'Austrian', departure: '16:00', arrival: '21:00', baseFare: 220 },
    baggageFee: 40, airportTransfer: 40, accommodationPerNight: 105, activityCostPerDay: 56, clubMedPerNight: 275, clubMedActivityIncluded: true,
  },
  {
    id: 'w13', name: 'Borovets', country: 'BG', code: 'SOF', mode: 'winter',
    env: { snowDepthBase: 70, snowDepthPeak: 160, tempC: -2, recentStorm: false },
    sentiment: 'Ultra budget option delivering decent value. Night skiing available. Good for beginners and intermediates.',
    outbound: { airline: 'Wizz Air', departure: '09:00', arrival: '11:30', baseFare: 79 },
    returnFlight: { airline: 'Wizz Air', departure: '12:30', arrival: '15:00', baseFare: 85 },
    baggageFee: 30, airportTransfer: 55, accommodationPerNight: 30, activityCostPerDay: 25, clubMedPerNight: 140, clubMedActivityIncluded: true,
  },
  {
    id: 'w14', name: 'Cervinia', country: 'IT', code: 'TRN', mode: 'winter',
    env: { snowDepthBase: 140, snowDepthPeak: 280, tempC: -8, recentStorm: true, stormDaysAgo: 1 },
    sentiment: 'Matterhorn Italian side delivers amazing terrain. Linked to Zermatt for mega domain. Fresh snow stacking up.',
    outbound: { airline: 'Ryanair', departure: '06:45', arrival: '10:15', baseFare: 145 },
    returnFlight: { airline: 'Ryanair', departure: '19:00', arrival: '23:30', baseFare: 155 },
    baggageFee: 35, airportTransfer: 80, accommodationPerNight: 85, activityCostPerDay: 55, clubMedPerNight: 265, clubMedActivityIncluded: true,
  },
  {
    id: 'w15', name: 'Jasná', country: 'SK', code: 'BTS', mode: 'winter',
    env: { snowDepthBase: 110, snowDepthPeak: 230, tempC: -6, recentStorm: true, stormDaysAgo: 2 },
    sentiment: 'Slovakia dark horse rising fast. Incredible value, uncrowded slopes. Freeride scene growing rapidly.',
    outbound: { airline: 'Wizz Air', departure: '10:00', arrival: '12:15', baseFare: 99 },
    returnFlight: { airline: 'Wizz Air', departure: '13:30', arrival: '16:00', baseFare: 105 },
    baggageFee: 30, airportTransfer: 50, accommodationPerNight: 45, activityCostPerDay: 35, clubMedPerNight: 175, clubMedActivityIncluded: true,
  },
];

const summerDestinations: Destination[] = [
  {
    id: 's1', name: 'Peniche', country: 'PT', code: 'LIS', mode: 'summer',
    env: { waterTempC: 18, swellHeightM: 1.8, sunnyDays: 5, rainyDays: 1 },
    sentiment: 'Supertubos firing on all cylinders. WSL vibes still lingering. Consistent swell window opening up.',
    outbound: { airline: 'TAP', departure: '06:00', arrival: '10:30', baseFare: 165 },
    returnFlight: { airline: 'TAP', departure: '19:00', arrival: '01:30', baseFare: 180 },
    baggageFee: 50, airportTransfer: 45, accommodationPerNight: 55, activityCostPerDay: 35, clubMedPerNight: 195, clubMedActivityIncluded: true,
  },
  {
    id: 's2', name: 'Tarifa', country: 'ES', code: 'AGP', mode: 'summer',
    env: { waterTempC: 20, swellHeightM: 1.2, sunnyDays: 6, rainyDays: 0 },
    sentiment: 'Wind capital of Europe delivering again. Kitesurfers paradise. Levante blowing steady 25kts.',
    outbound: { airline: 'Vueling', departure: '07:30', arrival: '12:00', baseFare: 135 },
    returnFlight: { airline: 'Vueling', departure: '17:30', arrival: '23:00', baseFare: 150 },
    baggageFee: 40, airportTransfer: 60, accommodationPerNight: 65, activityCostPerDay: 45, clubMedPerNight: 220, clubMedActivityIncluded: true,
  },
  {
    id: 's3', name: 'Dahab', country: 'EG', code: 'SSH', mode: 'summer',
    env: { waterTempC: 26, swellHeightM: 0.5, sunnyDays: 7, rainyDays: 0 },
    sentiment: 'Blue Hole diving season at peak. Wind reliable for kite. Budget paradise with Sinai magic intact.',
    outbound: { airline: 'Israir', departure: '08:00', arrival: '09:00', baseFare: 95 },
    returnFlight: { airline: 'Israir', departure: '10:00', arrival: '11:00', baseFare: 89 },
    baggageFee: 25, airportTransfer: 30, accommodationPerNight: 25, activityCostPerDay: 20, clubMedPerNight: 0, clubMedActivityIncluded: false,
  },
  {
    id: 's4', name: 'Essaouira', country: 'MA', code: 'ESS', mode: 'summer',
    env: { waterTempC: 19, swellHeightM: 1.5, sunnyDays: 6, rainyDays: 0 },
    sentiment: 'Trade winds pumping. Medina vibes unreal. Surf + wind combo making this a multi-sport haven.',
    outbound: { airline: 'Ryanair', departure: '06:30', arrival: '12:00', baseFare: 110 },
    returnFlight: { airline: 'Ryanair', departure: '13:00', arrival: '18:30', baseFare: 120 },
    baggageFee: 35, airportTransfer: 15, accommodationPerNight: 35, activityCostPerDay: 25, clubMedPerNight: 165, clubMedActivityIncluded: true,
  },
  {
    id: 's5', name: 'Biarritz', country: 'FR', code: 'BIQ', mode: 'summer',
    env: { waterTempC: 21, swellHeightM: 1.6, sunnyDays: 5, rainyDays: 1 },
    sentiment: 'Grande Plage postcard-perfect. Surf culture capital of Europe. Basque cuisine elevating the whole trip.',
    outbound: { airline: 'Transavia', departure: '07:00', arrival: '11:30', baseFare: 195 },
    returnFlight: { airline: 'Transavia', departure: '18:00', arrival: '23:30', baseFare: 210 },
    baggageFee: 45, airportTransfer: 20, accommodationPerNight: 95, activityCostPerDay: 40, clubMedPerNight: 275, clubMedActivityIncluded: true,
  },
  {
    id: 's6', name: 'Ericeira', country: 'PT', code: 'LIS', mode: 'summer',
    env: { waterTempC: 17, swellHeightM: 2.0, sunnyDays: 6, rainyDays: 0 },
    sentiment: 'World Surf Reserve status well-deserved. Ribeira d\'Ilhas pumping. Coxos for experts only right now.',
    outbound: { airline: 'EasyJet', departure: '06:15', arrival: '10:45', baseFare: 155 },
    returnFlight: { airline: 'TAP', departure: '20:00', arrival: '02:30', baseFare: 175 },
    baggageFee: 45, airportTransfer: 40, accommodationPerNight: 60, activityCostPerDay: 30, clubMedPerNight: 210, clubMedActivityIncluded: true,
  },
  {
    id: 's7', name: 'Fuerteventura', country: 'ES', code: 'FUE', mode: 'summer',
    env: { waterTempC: 22, swellHeightM: 1.4, sunnyDays: 7, rainyDays: 0 },
    sentiment: 'Year-round consistency unmatched. North shore reef breaks world-class. Dry heat very manageable.',
    outbound: { airline: 'Wizz Air', departure: '05:30', arrival: '10:00', baseFare: 125 },
    returnFlight: { airline: 'Wizz Air', departure: '11:00', arrival: '17:30', baseFare: 140 },
    baggageFee: 35, airportTransfer: 25, accommodationPerNight: 50, activityCostPerDay: 30, clubMedPerNight: 190, clubMedActivityIncluded: true,
  },
  {
    id: 's8', name: 'Zanzibar', country: 'TZ', code: 'ZNZ', mode: 'summer',
    env: { waterTempC: 28, swellHeightM: 0.8, sunnyDays: 6, rainyDays: 1 },
    sentiment: 'Kite season absolutely prime. Paje beach living up to the hype. Spice island magic at every corner.',
    outbound: { airline: 'Turkish', departure: '01:00', arrival: '12:00', baseFare: 385 },
    returnFlight: { airline: 'Turkish', departure: '14:00', arrival: '23:00', baseFare: 410 },
    baggageFee: 55, airportTransfer: 20, accommodationPerNight: 45, activityCostPerDay: 35, clubMedPerNight: 250, clubMedActivityIncluded: true,
  },
  {
    id: 's9', name: 'Hossegor', country: 'FR', code: 'BIQ', mode: 'summer',
    env: { waterTempC: 20, swellHeightM: 2.2, sunnyDays: 5, rainyDays: 1 },
    sentiment: 'La Gravière beach break absolutely pumping. Pro-level waves accessible. French surf capital living up to name.',
    outbound: { airline: 'Transavia', departure: '07:00', arrival: '11:30', baseFare: 185 },
    returnFlight: { airline: 'Transavia', departure: '18:00', arrival: '23:30', baseFare: 200 },
    baggageFee: 45, airportTransfer: 30, accommodationPerNight: 80, activityCostPerDay: 35, clubMedPerNight: 260, clubMedActivityIncluded: true,
  },
  {
    id: 's10', name: 'Sagres', country: 'PT', code: 'FAO', mode: 'summer',
    env: { waterTempC: 18, swellHeightM: 1.7, sunnyDays: 6, rainyDays: 0 },
    sentiment: 'End of the world vibes still hit different. Multiple breaks within 10min drive. Uncrowded Algarve gem.',
    outbound: { airline: 'Ryanair', departure: '06:45', arrival: '11:00', baseFare: 140 },
    returnFlight: { airline: 'Ryanair', departure: '12:00', arrival: '17:30', baseFare: 155 },
    baggageFee: 35, airportTransfer: 50, accommodationPerNight: 50, activityCostPerDay: 28, clubMedPerNight: 185, clubMedActivityIncluded: true,
  },
  {
    id: 's11', name: 'Taghazout', country: 'MA', code: 'AGA', mode: 'summer',
    env: { waterTempC: 20, swellHeightM: 1.3, sunnyDays: 7, rainyDays: 0 },
    sentiment: 'Anchor Point legendary status confirmed. Surf camp culture thriving. Moroccan hospitality next level.',
    outbound: { airline: 'Ryanair', departure: '08:00', arrival: '13:00', baseFare: 105 },
    returnFlight: { airline: 'Ryanair', departure: '14:00', arrival: '19:30', baseFare: 115 },
    baggageFee: 35, airportTransfer: 20, accommodationPerNight: 30, activityCostPerDay: 22, clubMedPerNight: 155, clubMedActivityIncluded: true,
  },
  {
    id: 's12', name: 'Crete', country: 'GR', code: 'HER', mode: 'summer',
    env: { waterTempC: 24, swellHeightM: 0.6, sunnyDays: 7, rainyDays: 0 },
    sentiment: 'Gorge hiking + beach combo unbeatable. Water crystal clear. Greek island vibes with actual substance.',
    outbound: { airline: 'Aegean', departure: '06:30', arrival: '09:30', baseFare: 155 },
    returnFlight: { airline: 'Aegean', departure: '10:30', arrival: '13:30', baseFare: 165 },
    baggageFee: 40, airportTransfer: 30, accommodationPerNight: 60, activityCostPerDay: 25, clubMedPerNight: 230, clubMedActivityIncluded: true,
  },
  {
    id: 's13', name: 'Sardinia', country: 'IT', code: 'CAG', mode: 'summer',
    env: { waterTempC: 23, swellHeightM: 0.9, sunnyDays: 6, rainyDays: 0 },
    sentiment: 'Costa Smeralda stunning but pricey. South coast more authentic. Windsurf + SUP conditions ideal.',
    outbound: { airline: 'Ryanair', departure: '07:00', arrival: '10:00', baseFare: 145 },
    returnFlight: { airline: 'Ryanair', departure: '11:00', arrival: '15:30', baseFare: 160 },
    baggageFee: 35, airportTransfer: 35, accommodationPerNight: 75, activityCostPerDay: 35, clubMedPerNight: 245, clubMedActivityIncluded: true,
  },
  {
    id: 's14', name: 'Lanzarote', country: 'ES', code: 'ACE', mode: 'summer',
    env: { waterTempC: 21, swellHeightM: 1.5, sunnyDays: 7, rainyDays: 0 },
    sentiment: 'Volcanic landscape otherworldly. Famara beach left-hander legendary. César Manrique art integrated into nature.',
    outbound: { airline: 'Wizz Air', departure: '05:30', arrival: '10:00', baseFare: 130 },
    returnFlight: { airline: 'Wizz Air', departure: '11:00', arrival: '17:30', baseFare: 145 },
    baggageFee: 35, airportTransfer: 20, accommodationPerNight: 55, activityCostPerDay: 30, clubMedPerNight: 200, clubMedActivityIncluded: true,
  },
  {
    id: 's15', name: 'Split', country: 'HR', code: 'SPU', mode: 'summer',
    env: { waterTempC: 24, swellHeightM: 0.3, sunnyDays: 7, rainyDays: 0 },
    sentiment: 'Diocletian Palace after dark is magical. Island hopping by speedboat game changer. Sea kayaking conditions perfect.',
    outbound: { airline: 'Wizz Air', departure: '06:00', arrival: '08:30', baseFare: 115 },
    returnFlight: { airline: 'Wizz Air', departure: '09:30', arrival: '12:00', baseFare: 125 },
    baggageFee: 30, airportTransfer: 15, accommodationPerNight: 55, activityCostPerDay: 30, clubMedPerNight: 210, clubMedActivityIncluded: true,
  },
];

export const getDestinations = (mode: TravelMode): Destination[] => {
  return mode === 'winter' ? winterDestinations : summerDestinations;
};

export const calculateDIYTotal = (dest: Destination, days: number, addLuggage: boolean): number => {
  const flights = dest.outbound.baseFare + dest.returnFlight.baseFare;
  const baggage = addLuggage ? dest.baggageFee * 2 : 0;
  const transfers = dest.airportTransfer * 2;
  const accommodation = dest.accommodationPerNight * (days - 1);
  const activity = dest.activityCostPerDay * days;
  return flights + baggage + transfers + accommodation + activity;
};

export const calculateClubMedTotal = (dest: Destination, days: number, addLuggage: boolean): number => {
  if (dest.clubMedPerNight === 0) return 0;
  const flights = dest.outbound.baseFare + dest.returnFlight.baseFare;
  const baggage = addLuggage ? dest.baggageFee * 2 : 0;
  const transfers = dest.airportTransfer * 2;
  const clubMed = dest.clubMedPerNight * (days - 1);
  return flights + baggage + transfers + clubMed;
};
