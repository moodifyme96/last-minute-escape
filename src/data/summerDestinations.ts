import { Destination } from './types';

export const summerDestinations: Destination[] = [
  {
    id: 's1', name: 'Peniche', country: 'PT', region: 'Atlantic Coast', mode: 'summer',
    flights: { origin: 'TLV', hub: 'LIS', airportTransfer: 45, googleFlightsUrl: '' },
    conditions: { waterTempC: 18, swellHeightM: 1.8, swellPeriodS: 12, windKnots: 8, uvIndex: 8, sunnyDays: 5, rainyDays: 1, safeSeasonFlag: true },
    sentiment: {
      vibeScore: 88,
      summary: 'Supertubos firing on all cylinders. WSL vibes still lingering. Consistent swell window opening up.',
      sources: [
        { platform: 'Surf-Forecast', snippet: 'Supertubos 6ft+ clean, best session of the month' },
        { platform: 'r/surfing', snippet: 'Peniche is pumping, get here now' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 55, activityCostPerDay: 35, clubMedPerNight: 195, clubMedActivityIncluded: true, carRentalPerDay: 25 },
  },
  {
    id: 's2', name: 'Tarifa', country: 'ES', region: 'Mediterranean', mode: 'summer',
    flights: { origin: 'TLV', hub: 'AGP', airportTransfer: 60, googleFlightsUrl: '' },
    conditions: { waterTempC: 20, swellHeightM: 1.2, swellPeriodS: 8, windKnots: 25, uvIndex: 9, sunnyDays: 6, rainyDays: 0, safeSeasonFlag: true },
    sentiment: {
      vibeScore: 82,
      summary: 'Wind capital of Europe delivering again. Kitesurfers paradise. Levante blowing steady 25kts.',
      sources: [
        { platform: 'iKitesurf', snippet: 'Levante wind 25-30kts, perfect kite conditions' },
        { platform: 'Windguru', snippet: 'Consistent easterly pattern through the week' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 65, activityCostPerDay: 45, clubMedPerNight: 220, clubMedActivityIncluded: true, carRentalPerDay: 30 },
  },
  {
    id: 's3', name: 'Dahab', country: 'EG', region: 'Red Sea', mode: 'summer',
    flights: { origin: 'TLV', hub: 'SSH', airportTransfer: 30, googleFlightsUrl: '' },
    conditions: { waterTempC: 26, swellHeightM: 0.5, swellPeriodS: 5, windKnots: 20, uvIndex: 11, sunnyDays: 7, rainyDays: 0, safeSeasonFlag: true },
    sentiment: {
      vibeScore: 90,
      summary: 'Blue Hole diving season at peak. Wind reliable for kite. Budget paradise with Sinai magic intact.',
      sources: [
        { platform: 'r/scuba', snippet: 'Blue Hole visibility 30m+, absolutely unreal' },
        { platform: 'iKitesurf', snippet: 'Dahab lagoon flat water kiting perfection' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 25, activityCostPerDay: 20, clubMedPerNight: 0, clubMedActivityIncluded: false, carRentalPerDay: 15 },
  },
  {
    id: 's4', name: 'Essaouira', country: 'MA', region: 'Atlantic Coast', mode: 'summer',
    flights: { origin: 'TLV', hub: 'ESS', airportTransfer: 15, googleFlightsUrl: '' },
    conditions: { waterTempC: 19, swellHeightM: 1.5, swellPeriodS: 10, windKnots: 22, uvIndex: 9, sunnyDays: 6, rainyDays: 0, safeSeasonFlag: true },
    sentiment: {
      vibeScore: 85,
      summary: 'Trade winds pumping. Medina vibes unreal. Surf + wind combo making this a multi-sport haven.',
      sources: [
        { platform: 'Windguru', snippet: 'Trade winds 20-25kts daily, clockwork reliable' },
        { platform: 'r/surfing', snippet: 'Beach breaks fun and uncrowded, magic place' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 35, activityCostPerDay: 25, clubMedPerNight: 165, clubMedActivityIncluded: true, carRentalPerDay: 20 },
  },
  {
    id: 's5', name: 'Biarritz', country: 'FR', region: 'Atlantic Coast', mode: 'summer',
    flights: { origin: 'TLV', hub: 'BIQ', airportTransfer: 20, googleFlightsUrl: '' },
    conditions: { waterTempC: 21, swellHeightM: 1.6, swellPeriodS: 11, windKnots: 10, uvIndex: 7, sunnyDays: 5, rainyDays: 1, safeSeasonFlag: true },
    sentiment: {
      vibeScore: 80,
      summary: 'Grande Plage postcard-perfect. Surf culture capital of Europe. Basque cuisine elevating the whole trip.',
      sources: [
        { platform: 'Surf-Forecast', snippet: 'Clean 5ft at Côte des Basques, glass off at sunset' },
        { platform: 'r/surfing', snippet: 'Biarritz is the vibe, surf then pintxos' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 100, activityCostPerDay: 40, clubMedPerNight: 275, clubMedActivityIncluded: true, carRentalPerDay: 35 },
  },
  {
    id: 's6', name: 'Ericeira', country: 'PT', region: 'Atlantic Coast', mode: 'summer',
    flights: { origin: 'TLV', hub: 'LIS', airportTransfer: 40, googleFlightsUrl: '' },
    conditions: { waterTempC: 17, swellHeightM: 2.0, swellPeriodS: 13, windKnots: 6, uvIndex: 8, sunnyDays: 6, rainyDays: 0, safeSeasonFlag: true },
    sentiment: {
      vibeScore: 91,
      summary: "World Surf Reserve status well-deserved. Ribeira d'Ilhas pumping. Coxos for experts only right now.",
      sources: [
        { platform: 'Surf-Forecast', snippet: 'Coxos firing 8ft, experts only, perfect barrels' },
        { platform: 'Stab Magazine', snippet: 'Ericeira WSR delivering world-class waves daily' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 60, activityCostPerDay: 30, clubMedPerNight: 210, clubMedActivityIncluded: true, carRentalPerDay: 22 },
  },
  {
    id: 's7', name: 'Fuerteventura', country: 'ES', region: 'Canary Islands', mode: 'summer',
    flights: { origin: 'TLV', hub: 'FUE', airportTransfer: 25, googleFlightsUrl: '' },
    conditions: { waterTempC: 22, swellHeightM: 1.4, swellPeriodS: 10, windKnots: 18, uvIndex: 10, sunnyDays: 7, rainyDays: 0, safeSeasonFlag: true },
    sentiment: {
      vibeScore: 84,
      summary: 'Year-round consistency unmatched. North shore reef breaks world-class. Dry heat very manageable.',
      sources: [
        { platform: 'Windguru', snippet: 'Wind + waves combo every single day this week' },
        { platform: 'r/surfing', snippet: 'North shore reefs are so good and so empty' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 55, activityCostPerDay: 30, clubMedPerNight: 190, clubMedActivityIncluded: true, carRentalPerDay: 20 },
  },
  {
    id: 's8', name: 'Zanzibar', country: 'TZ', region: 'Indian Ocean', mode: 'summer',
    flights: { origin: 'TLV', hub: 'ZNZ', airportTransfer: 20, googleFlightsUrl: '' },
    conditions: { waterTempC: 28, swellHeightM: 0.8, swellPeriodS: 7, windKnots: 16, uvIndex: 12, sunnyDays: 6, rainyDays: 1, safeSeasonFlag: true },
    sentiment: {
      vibeScore: 86,
      summary: 'Kite season absolutely prime. Paje beach living up to the hype. Spice island magic at every corner.',
      sources: [
        { platform: 'iKitesurf', snippet: 'Paje 15-20kts daily, flat water lagoon sessions' },
        { platform: 'TripAdvisor', snippet: 'Zanzibar in June is perfection, no crowds yet' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 45, activityCostPerDay: 35, clubMedPerNight: 250, clubMedActivityIncluded: true, carRentalPerDay: 18 },
  },
  {
    id: 's9', name: 'Hossegor', country: 'FR', region: 'Atlantic Coast', mode: 'summer',
    flights: { origin: 'TLV', hub: 'BIQ', airportTransfer: 30, googleFlightsUrl: '' },
    conditions: { waterTempC: 20, swellHeightM: 2.2, swellPeriodS: 14, windKnots: 5, uvIndex: 7, sunnyDays: 5, rainyDays: 1, safeSeasonFlag: true },
    sentiment: {
      vibeScore: 93,
      summary: 'La Gravière beach break absolutely pumping. Pro-level waves accessible. French surf capital living up to name.',
      sources: [
        { platform: 'Surf-Forecast', snippet: 'La Gravière 8ft barrels, pros in the water' },
        { platform: 'Stab Magazine', snippet: 'Hossegor doing Hossegor things, heavy and hollow' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 85, activityCostPerDay: 35, clubMedPerNight: 260, clubMedActivityIncluded: true, carRentalPerDay: 30 },
  },
  {
    id: 's10', name: 'Sagres', country: 'PT', region: 'Atlantic Coast', mode: 'summer',
    flights: { origin: 'TLV', hub: 'FAO', airportTransfer: 50, googleFlightsUrl: '' },
    conditions: { waterTempC: 18, swellHeightM: 1.7, swellPeriodS: 11, windKnots: 12, uvIndex: 9, sunnyDays: 6, rainyDays: 0, safeSeasonFlag: true },
    sentiment: {
      vibeScore: 79,
      summary: 'End of the world vibes still hit different. Multiple breaks within 10min drive. Uncrowded Algarve gem.',
      sources: [
        { platform: 'Surf-Forecast', snippet: 'Tonel + Beliche both working, choose your adventure' },
        { platform: 'r/surfing', snippet: 'Sagres is the anti-Lagos, quiet and pumping' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 55, activityCostPerDay: 28, clubMedPerNight: 185, clubMedActivityIncluded: true, carRentalPerDay: 22 },
  },
  {
    id: 's11', name: 'Taghazout', country: 'MA', region: 'Atlantic Coast', mode: 'summer',
    flights: { origin: 'TLV', hub: 'AGA', airportTransfer: 20, googleFlightsUrl: '' },
    conditions: { waterTempC: 20, swellHeightM: 1.3, swellPeriodS: 9, windKnots: 8, uvIndex: 10, sunnyDays: 7, rainyDays: 0, safeSeasonFlag: true },
    sentiment: {
      vibeScore: 83,
      summary: 'Anchor Point legendary status confirmed. Surf camp culture thriving. Moroccan hospitality next level.',
      sources: [
        { platform: 'Surf-Forecast', snippet: 'Anchor Point right-hander 4-6ft, perfect lines' },
        { platform: 'r/surfing', snippet: 'Taghazout surf camps are the best value in the world' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 30, activityCostPerDay: 22, clubMedPerNight: 155, clubMedActivityIncluded: true, carRentalPerDay: 15 },
  },
  {
    id: 's12', name: 'Crete', country: 'GR', region: 'Mediterranean', mode: 'summer',
    flights: { origin: 'TLV', hub: 'HER', airportTransfer: 30, googleFlightsUrl: '' },
    conditions: { waterTempC: 24, swellHeightM: 0.6, swellPeriodS: 6, windKnots: 14, uvIndex: 10, sunnyDays: 7, rainyDays: 0, safeSeasonFlag: true },
    sentiment: {
      vibeScore: 76,
      summary: 'Gorge hiking + beach combo unbeatable. Water crystal clear. Greek island vibes with actual substance.',
      sources: [
        { platform: 'TripAdvisor', snippet: 'Samaria Gorge hike then beach swim, perfect day' },
        { platform: 'r/travel', snippet: 'Crete has depth other Greek islands lack' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 65, activityCostPerDay: 25, clubMedPerNight: 230, clubMedActivityIncluded: true, carRentalPerDay: 25 },
  },
  {
    id: 's13', name: 'Sardinia', country: 'IT', region: 'Mediterranean', mode: 'summer',
    flights: { origin: 'TLV', hub: 'CAG', airportTransfer: 35, googleFlightsUrl: '' },
    conditions: { waterTempC: 23, swellHeightM: 0.9, swellPeriodS: 7, windKnots: 12, uvIndex: 9, sunnyDays: 6, rainyDays: 0, safeSeasonFlag: true },
    sentiment: {
      vibeScore: 74,
      summary: 'Costa Smeralda stunning but pricey. South coast more authentic. Windsurf + SUP conditions ideal.',
      sources: [
        { platform: 'Windguru', snippet: 'Porto Pollo windsurf spot 15kts thermal daily' },
        { platform: 'r/travel', snippet: 'Skip the north, south Sardinia is the real deal' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 80, activityCostPerDay: 35, clubMedPerNight: 245, clubMedActivityIncluded: true, carRentalPerDay: 28 },
  },
  {
    id: 's14', name: 'Lanzarote', country: 'ES', region: 'Canary Islands', mode: 'summer',
    flights: { origin: 'TLV', hub: 'ACE', airportTransfer: 20, googleFlightsUrl: '' },
    conditions: { waterTempC: 21, swellHeightM: 1.5, swellPeriodS: 11, windKnots: 15, uvIndex: 10, sunnyDays: 7, rainyDays: 0, safeSeasonFlag: true },
    sentiment: {
      vibeScore: 81,
      summary: 'Volcanic landscape otherworldly. Famara beach left-hander legendary. César Manrique art integrated into nature.',
      sources: [
        { platform: 'Surf-Forecast', snippet: 'Famara 4-5ft lefts, clean morning sessions' },
        { platform: 'r/surfing', snippet: 'Lanzarote feels like another planet, waves are epic' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 60, activityCostPerDay: 30, clubMedPerNight: 200, clubMedActivityIncluded: true, carRentalPerDay: 20 },
  },
  {
    id: 's15', name: 'Split', country: 'HR', region: 'Mediterranean', mode: 'summer',
    flights: { origin: 'TLV', hub: 'SPU', airportTransfer: 15, googleFlightsUrl: '' },
    conditions: { waterTempC: 24, swellHeightM: 0.3, swellPeriodS: 4, windKnots: 10, uvIndex: 9, sunnyDays: 7, rainyDays: 0, safeSeasonFlag: true },
    sentiment: {
      vibeScore: 77,
      summary: "Diocletian's Palace after dark is magical. Island hopping by speedboat game changer. Sea kayaking conditions perfect.",
      sources: [
        { platform: 'TripAdvisor', snippet: 'Hvar + Vis day trip by speedboat, unforgettable' },
        { platform: 'r/travel', snippet: 'Split is the best base for Croatian islands' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    costs: { accommodationPerNight: 60, activityCostPerDay: 30, clubMedPerNight: 210, clubMedActivityIncluded: true, carRentalPerDay: 25 },
  },
];
