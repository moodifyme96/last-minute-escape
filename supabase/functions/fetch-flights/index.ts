import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FlightRequest {
  origin: string;
  destinations: { id: string; hub: string }[];
  departureDate: string; // YYYY-MM-DD
  returnDate: string;
  adults: number;
}

async function getAmadeusToken(): Promise<string> {
  const key = Deno.env.get("AMADEUS_API_KEY");
  const secret = Deno.env.get("AMADEUS_API_SECRET");
  if (!key || !secret) throw new Error("Amadeus credentials not configured");

  const res = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${key}&client_secret=${secret}`,
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Amadeus token error ${res.status}: ${body}`);
  return JSON.parse(body).access_token;
}

async function searchFlights(
  token: string,
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string
) {
  const res = await fetch(
    "https://test.api.amadeus.com/v2/shopping/flight-offers?" +
      new URLSearchParams({
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate,
        returnDate,
        adults: "1",
        nonStop: "false",
        max: "3",
        currencyCode: "EUR",
      }),
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const body = await res.text();
  if (!res.ok) {
    console.error(`Amadeus flight search error for ${destination}:`, res.status, body);
    return null;
  }
  return JSON.parse(body);
}

function parseFlightOffer(data: any, hub: string) {
  if (!data?.data?.length) return null;

  const offer = data.data[0]; // cheapest
  const outSegments = offer.itineraries?.[0]?.segments || [];
  const retSegments = offer.itineraries?.[1]?.segments || [];

  const outFirst = outSegments[0];
  const outLast = outSegments[outSegments.length - 1];
  const retFirst = retSegments[0];
  const retLast = retSegments[retSegments.length - 1];

  if (!outFirst || !retFirst) return null;

  const totalPrice = parseFloat(offer.price?.total || "0");
  // Split price roughly 50/50 for outbound/return
  const outFare = Math.round(totalPrice / 2);
  const retFare = totalPrice - outFare;

  // Check baggage inclusion from travelerPricings
  const traveler = offer.travelerPricings?.[0];
  const outBaggage = traveler?.fareDetailsBySegment?.[0]?.includedCheckedBags?.weight > 0;
  const retIdx = outSegments.length;
  const retBaggage = traveler?.fareDetailsBySegment?.[retIdx]?.includedCheckedBags?.weight > 0;

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return {
    origin: "TLV" as const,
    hub,
    outbound: {
      airline: outFirst.carrierCode || "Unknown",
      departure: fmtTime(outFirst.departure?.at || ""),
      arrival: fmtTime(outLast.arrival?.at || ""),
      baseFare: outFare,
      baggageIncluded: !!outBaggage,
    },
    returnLeg: {
      airline: retFirst.carrierCode || "Unknown",
      departure: fmtTime(retFirst.departure?.at || ""),
      arrival: fmtTime(retLast.arrival?.at || ""),
      baseFare: retFare,
      baggageIncluded: !!retBaggage,
    },
    baggageFee: outBaggage && retBaggage ? 0 : 35,
    airportTransfer: 50, // default estimate
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { origin, destinations, departureDate, returnDate } =
      (await req.json()) as FlightRequest;

    const token = await getAmadeusToken();
    const results: Record<string, any> = {};

    // Process with small delays to respect Amadeus rate limits
    for (const dest of destinations) {
      try {
        await new Promise((r) => setTimeout(r, 150)); // rate limit
        const data = await searchFlights(token, origin, dest.hub, departureDate, returnDate);
        const parsed = parseFlightOffer(data, dest.hub);
        results[dest.id] = parsed;
      } catch (e) {
        console.error(`Flight search failed for ${dest.id}:`, e);
        results[dest.id] = null;
      }
    }

    return new Response(JSON.stringify({ success: true, data: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-flights error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
