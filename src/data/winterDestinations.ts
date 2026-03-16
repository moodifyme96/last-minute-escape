import { Destination } from './types';

export const winterDestinations: Destination[] = [
  {
    id: 'w1', name: 'Val Thorens', country: 'FR', region: 'Alps', mode: 'winter',
    flights: {
      origin: 'TLV', hub: 'GVA',
      outbound: { airline: 'Transavia', departure: '06:15', arrival: '10:30', baseFare: 189, baggageIncluded: false },
      returnLeg: { airline: 'EasyJet', departure: '18:00', arrival: '23:45', baseFare: 215, baggageIncluded: false },
      baggageFee: 45, airportTransfer: 85,
    },
    conditions: { snowDepthBase: 180, snowDepthPeak: 320, freshSnow48h: 40, tempC: -8, freezeLevel: 800, recentStorm: true, stormDaysAgo: 1, liftStatus: 'full', altitude: 2300 },
    sentiment: {
      vibeScore: 95,
      summary: 'Epic powder day reports flooding r/skiing. Multiple sources confirm 40cm dump overnight. Lifts fully operational.',
      sources: [
        { platform: 'r/skiing', snippet: '40cm overnight, best day of the season' },
        { platform: 'Snow-Forecast', snippet: 'Heavy snowfall confirmed above 1800m' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 95, activityCostPerDay: 72, clubMedPerNight: 285, clubMedActivityIncluded: true },
  },
  {
    id: 'w2', name: 'Innsbruck (Nordkette)', country: 'AT', region: 'Alps', mode: 'winter',
    flights: {
      origin: 'TLV', hub: 'INN',
      outbound: { airline: 'Austrian', departure: '07:00', arrival: '10:15', baseFare: 245, baggageIncluded: true },
      returnLeg: { airline: 'Austrian', departure: '16:30', arrival: '21:00', baseFare: 230, baggageIncluded: true },
      baggageFee: 0, airportTransfer: 25,
    },
    conditions: { snowDepthBase: 120, snowDepthPeak: 250, freshSnow48h: 0, tempC: -5, freezeLevel: 1200, recentStorm: false, liftStatus: 'full', altitude: 1800 },
    sentiment: {
      vibeScore: 68,
      summary: 'Conditions solid but not exceptional. Groomed runs in great shape. Off-piste getting tracked out quickly.',
      sources: [
        { platform: 'Snowheads FB', snippet: 'Groomers are mint but off-piste is done by 10am' },
        { platform: 'Bergfex', snippet: 'Stable conditions, no new snow expected' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 85, activityCostPerDay: 56, clubMedPerNight: 260, clubMedActivityIncluded: true },
  },
  {
    id: 'w3', name: 'Chamonix', country: 'FR', region: 'Alps', mode: 'winter',
    flights: {
      origin: 'TLV', hub: 'GVA',
      outbound: { airline: 'EasyJet', departure: '05:45', arrival: '09:50', baseFare: 175, baggageIncluded: false },
      returnLeg: { airline: 'Transavia', departure: '19:15', arrival: '23:30', baseFare: 199, baggageIncluded: false },
      baggageFee: 45, airportTransfer: 95,
    },
    conditions: { snowDepthBase: 150, snowDepthPeak: 380, freshSnow48h: 25, tempC: -10, freezeLevel: 600, recentStorm: true, stormDaysAgo: 2, liftStatus: 'partial', altitude: 2400 },
    sentiment: {
      vibeScore: 88,
      summary: 'Vallée Blanche open and in prime condition. Avalanche risk moderate above 2800m. Expert terrain firing.',
      sources: [
        { platform: 'Chamonix Meteo', snippet: 'Avalanche risk 3/5 above 2800m, good below' },
        { platform: 'r/snowboarding', snippet: 'Vallée Blanche run was life-changing today' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 115, activityCostPerDay: 68, clubMedPerNight: 310, clubMedActivityIncluded: true },
  },
  {
    id: 'w4', name: 'Zermatt', country: 'CH', region: 'Alps', mode: 'winter',
    flights: {
      origin: 'TLV', hub: 'ZRH',
      outbound: { airline: 'Swiss', departure: '08:30', arrival: '12:00', baseFare: 310, baggageIncluded: true },
      returnLeg: { airline: 'Swiss', departure: '14:00', arrival: '19:30', baseFare: 295, baggageIncluded: true },
      baggageFee: 0, airportTransfer: 120,
    },
    conditions: { snowDepthBase: 140, snowDepthPeak: 290, freshSnow48h: 0, tempC: -12, freezeLevel: 500, recentStorm: false, liftStatus: 'full', altitude: 2600 },
    sentiment: {
      vibeScore: 82,
      summary: 'Matterhorn views spectacular. Snow coverage above average for season. High altitude guarantee delivers.',
      sources: [
        { platform: 'Pistenbericht', snippet: 'All 360km of pistes open, excellent grooming' },
        { platform: 'TripAdvisor', snippet: 'Expensive but worth every franc' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 170, activityCostPerDay: 85, clubMedPerNight: 380, clubMedActivityIncluded: true },
  },
  {
    id: 'w5', name: 'St. Anton', country: 'AT', region: 'Alps', mode: 'winter',
    flights: {
      origin: 'TLV', hub: 'INN',
      outbound: { airline: 'Wizz Air', departure: '06:00', arrival: '09:30', baseFare: 155, baggageIncluded: false },
      returnLeg: { airline: 'Wizz Air', departure: '17:45', arrival: '22:15', baseFare: 165, baggageIncluded: false },
      baggageFee: 35, airportTransfer: 55,
    },
    conditions: { snowDepthBase: 160, snowDepthPeak: 310, freshSnow48h: 15, tempC: -7, freezeLevel: 900, recentStorm: true, stormDaysAgo: 3, liftStatus: 'full', altitude: 1800 },
    sentiment: {
      vibeScore: 78,
      summary: 'Arlberg connection fully open. Party scene active. Good snow but warming trend expected next week.',
      sources: [
        { platform: 'Snowheads FB', snippet: 'Après is back to full force, powder was decent' },
        { platform: 'Snow-Forecast', snippet: 'Warming trend from Thursday, enjoy it now' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 95, activityCostPerDay: 62, clubMedPerNight: 270, clubMedActivityIncluded: true },
  },
  {
    id: 'w6', name: 'Bansko', country: 'BG', region: 'Balkans', mode: 'winter',
    flights: {
      origin: 'TLV', hub: 'SOF',
      outbound: { airline: 'Wizz Air', departure: '09:00', arrival: '11:30', baseFare: 89, baggageIncluded: false },
      returnLeg: { airline: 'Wizz Air', departure: '12:30', arrival: '15:00', baseFare: 95, baggageIncluded: false },
      baggageFee: 30, airportTransfer: 65,
    },
    conditions: { snowDepthBase: 40, snowDepthPeak: 210, freshSnow48h: 0, tempC: -3, freezeLevel: 1400, recentStorm: false, liftStatus: 'full', altitude: 1400 },
    sentiment: {
      vibeScore: 62,
      summary: 'Budget king still delivers. Snow machines working overtime. Nightlife rivals après in the Alps.',
      sources: [
        { platform: 'r/skiing', snippet: 'You get what you pay for but the beer is €1.50' },
        { platform: 'OnTheSnow', snippet: 'Artificial snow keeping main runs open' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 35, activityCostPerDay: 59, clubMedPerNight: 155, clubMedActivityIncluded: true },
  },
  {
    id: 'w7', name: 'Livigno', country: 'IT', region: 'Alps', mode: 'winter',
    flights: {
      origin: 'TLV', hub: 'BGY',
      outbound: { airline: 'Ryanair', departure: '07:15', arrival: '10:00', baseFare: 125, baggageIncluded: false },
      returnLeg: { airline: 'Ryanair', departure: '20:30', arrival: '01:15', baseFare: 135, baggageIncluded: false },
      baggageFee: 35, airportTransfer: 75,
    },
    conditions: { snowDepthBase: 130, snowDepthPeak: 240, freshSnow48h: 35, tempC: -9, freezeLevel: 700, recentStorm: true, stormDaysAgo: 1, liftStatus: 'full', altitude: 1800 },
    sentiment: {
      vibeScore: 85,
      summary: 'Tax-free shopping a huge bonus. Snowpark in world-class condition. Fresh dump has everyone stoked.',
      sources: [
        { platform: 'r/snowboarding', snippet: 'Park is insane right now, kickers freshly shaped' },
        { platform: 'Snow-Forecast', snippet: '35cm in 48h, more expected Friday' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 75, activityCostPerDay: 48, clubMedPerNight: 220, clubMedActivityIncluded: true },
  },
  {
    id: 'w8', name: 'Gudauri', country: 'GE', region: 'Caucasus', mode: 'winter',
    flights: {
      origin: 'TLV', hub: 'TBS',
      outbound: { airline: 'Georgian Air', departure: '23:55', arrival: '03:30', baseFare: 165, baggageIncluded: true },
      returnLeg: { airline: 'Georgian Air', departure: '04:30', arrival: '06:00', baseFare: 155, baggageIncluded: true },
      baggageFee: 0, airportTransfer: 45,
    },
    conditions: { snowDepthBase: 200, snowDepthPeak: 350, freshSnow48h: 55, tempC: -11, freezeLevel: 400, recentStorm: true, stormDaysAgo: 0, liftStatus: 'full', altitude: 2200 },
    sentiment: {
      vibeScore: 92,
      summary: 'Hidden gem blowing up on socials. Freeride paradise with zero crowds. Currently dumping hard.',
      sources: [
        { platform: 'r/skiing', snippet: 'Best kept secret in Europe, waist deep today' },
        { platform: 'Gudauri.info', snippet: '55cm in 48h, all lifts spinning' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 40, activityCostPerDay: 20, clubMedPerNight: 0, clubMedActivityIncluded: false },
  },
  {
    id: 'w9', name: 'Verbier', country: 'CH', region: 'Alps', mode: 'winter',
    flights: {
      origin: 'TLV', hub: 'GVA',
      outbound: { airline: 'EasyJet', departure: '05:45', arrival: '09:50', baseFare: 195, baggageIncluded: false },
      returnLeg: { airline: 'Swiss', departure: '15:00', arrival: '20:30', baseFare: 280, baggageIncluded: true },
      baggageFee: 50, airportTransfer: 110,
    },
    conditions: { snowDepthBase: 110, snowDepthPeak: 270, freshSnow48h: 0, tempC: -6, freezeLevel: 1100, recentStorm: false, liftStatus: 'full', altitude: 2200 },
    sentiment: {
      vibeScore: 75,
      summary: 'Mont Fort open with stunning views. Expensive but quality unmatched. Expert terrain in good nick.',
      sources: [
        { platform: 'Snowheads FB', snippet: 'Mont Fort couloirs tracked but still fun' },
        { platform: 'SRF Meteo', snippet: 'High pressure settled, no snow until next week' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 185, activityCostPerDay: 78, clubMedPerNight: 395, clubMedActivityIncluded: true },
  },
  {
    id: 'w10', name: 'Grandvalira (Soldeu)', country: 'AD', region: 'Pyrenees', mode: 'winter',
    flights: {
      origin: 'TLV', hub: 'TLS',
      outbound: { airline: 'Transavia', departure: '06:30', arrival: '10:45', baseFare: 145, baggageIncluded: false },
      returnLeg: { airline: 'Transavia', departure: '17:00', arrival: '22:30', baseFare: 160, baggageIncluded: false },
      baggageFee: 40, airportTransfer: 70,
    },
    conditions: { snowDepthBase: 90, snowDepthPeak: 200, freshSnow48h: 0, tempC: -4, freezeLevel: 1600, recentStorm: false, liftStatus: 'partial', altitude: 1710 },
    sentiment: {
      vibeScore: 58,
      summary: 'Grandvalira link working well. Tax-free Andorra deals on gear. Snow cannons keeping things rideable.',
      sources: [
        { platform: 'OnTheSnow', snippet: 'Snow cannons doing heavy lifting below 2000m' },
        { platform: 'r/skiing', snippet: 'Gear is so cheap here, bought new boots tax-free' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 70, activityCostPerDay: 52, clubMedPerNight: 235, clubMedActivityIncluded: true },
  },
  {
    id: 'w11', name: 'Tignes', country: 'FR', region: 'Alps', mode: 'winter',
    flights: {
      origin: 'TLV', hub: 'GVA',
      outbound: { airline: 'EasyJet', departure: '06:15', arrival: '10:30', baseFare: 185, baggageIncluded: false },
      returnLeg: { airline: 'EasyJet', departure: '18:30', arrival: '23:00', baseFare: 205, baggageIncluded: false },
      baggageFee: 45, airportTransfer: 90,
    },
    conditions: { snowDepthBase: 170, snowDepthPeak: 340, freshSnow48h: 20, tempC: -9, freezeLevel: 700, recentStorm: true, stormDaysAgo: 2, liftStatus: 'full', altitude: 2100 },
    sentiment: {
      vibeScore: 86,
      summary: 'Grande Motte glacier skiing superb. Espace Killy in full swing. Altitude guarantees snow late season.',
      sources: [
        { platform: 'Snow-Forecast', snippet: '20cm fresh on the glacier, more coming' },
        { platform: 'Pistehors', snippet: 'Espace Killy 100% open, rare for this date' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 90, activityCostPerDay: 68, clubMedPerNight: 290, clubMedActivityIncluded: true },
  },
  {
    id: 'w12', name: 'Kitzbühel', country: 'AT', region: 'Alps', mode: 'winter',
    flights: {
      origin: 'TLV', hub: 'SZG',
      outbound: { airline: 'Austrian', departure: '07:30', arrival: '10:45', baseFare: 235, baggageIncluded: true },
      returnLeg: { airline: 'Austrian', departure: '16:00', arrival: '21:00', baseFare: 220, baggageIncluded: true },
      baggageFee: 0, airportTransfer: 40,
    },
    conditions: { snowDepthBase: 100, snowDepthPeak: 220, freshSnow48h: 0, tempC: -4, freezeLevel: 1300, recentStorm: false, liftStatus: 'full', altitude: 1600 },
    sentiment: {
      vibeScore: 65,
      summary: 'Hahnenkamm legacy palpable. Charming medieval town. Snow at lower altitudes thinning, upper fine.',
      sources: [
        { platform: 'Bergfex', snippet: 'Lower slopes showing grass, stick above 1400m' },
        { platform: 'TripAdvisor', snippet: 'Town is gorgeous, skiing is decent not amazing' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 110, activityCostPerDay: 60, clubMedPerNight: 275, clubMedActivityIncluded: true },
  },
  {
    id: 'w13', name: 'Borovets', country: 'BG', region: 'Balkans', mode: 'winter',
    flights: {
      origin: 'TLV', hub: 'SOF',
      outbound: { airline: 'Wizz Air', departure: '09:00', arrival: '11:30', baseFare: 79, baggageIncluded: false },
      returnLeg: { airline: 'Wizz Air', departure: '12:30', arrival: '15:00', baseFare: 85, baggageIncluded: false },
      baggageFee: 30, airportTransfer: 55,
    },
    conditions: { snowDepthBase: 70, snowDepthPeak: 160, freshSnow48h: 0, tempC: -2, freezeLevel: 1500, recentStorm: false, liftStatus: 'partial', altitude: 1300 },
    sentiment: {
      vibeScore: 45,
      summary: 'Ultra budget option delivering decent value. Night skiing available. Good for beginners and intermediates.',
      sources: [
        { platform: 'OnTheSnow', snippet: 'Night skiing is the highlight, daytime slushy' },
        { platform: 'r/skiing', snippet: 'Cheapest week of skiing in Europe, no contest' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 30, activityCostPerDay: 28, clubMedPerNight: 140, clubMedActivityIncluded: true },
  },
  {
    id: 'w14', name: 'Cervinia', country: 'IT', region: 'Alps', mode: 'winter',
    flights: {
      origin: 'TLV', hub: 'TRN',
      outbound: { airline: 'Ryanair', departure: '06:45', arrival: '10:15', baseFare: 145, baggageIncluded: false },
      returnLeg: { airline: 'Ryanair', departure: '19:00', arrival: '23:30', baseFare: 155, baggageIncluded: false },
      baggageFee: 35, airportTransfer: 80,
    },
    conditions: { snowDepthBase: 140, snowDepthPeak: 280, freshSnow48h: 30, tempC: -8, freezeLevel: 600, recentStorm: true, stormDaysAgo: 1, liftStatus: 'full', altitude: 2500 },
    sentiment: {
      vibeScore: 90,
      summary: 'Matterhorn Italian side delivers amazing terrain. Linked to Zermatt for mega domain. Fresh snow stacking up.',
      sources: [
        { platform: 'Snow-Forecast', snippet: '30cm fresh, Plateau Rosa fully open' },
        { platform: 'r/snowboarding', snippet: 'Zermatt link gives you 360km of riding' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 90, activityCostPerDay: 62, clubMedPerNight: 265, clubMedActivityIncluded: true },
  },
  {
    id: 'w15', name: 'Jasná', country: 'SK', region: 'Carpathians', mode: 'winter',
    flights: {
      origin: 'TLV', hub: 'BTS',
      outbound: { airline: 'Wizz Air', departure: '10:00', arrival: '12:15', baseFare: 99, baggageIncluded: false },
      returnLeg: { airline: 'Wizz Air', departure: '13:30', arrival: '16:00', baseFare: 105, baggageIncluded: false },
      baggageFee: 30, airportTransfer: 50,
    },
    conditions: { snowDepthBase: 110, snowDepthPeak: 230, freshSnow48h: 18, tempC: -6, freezeLevel: 800, recentStorm: true, stormDaysAgo: 2, liftStatus: 'full', altitude: 1900 },
    sentiment: {
      vibeScore: 80,
      summary: 'Slovakia dark horse rising fast. Incredible value, uncrowded slopes. Freeride scene growing rapidly.',
      sources: [
        { platform: 'r/skiing', snippet: 'Best value freeride in Europe right now' },
        { platform: 'Snow-Forecast', snippet: '18cm fresh, north face untouched' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 45, activityCostPerDay: 38, clubMedPerNight: 175, clubMedActivityIncluded: true },
  },
];
