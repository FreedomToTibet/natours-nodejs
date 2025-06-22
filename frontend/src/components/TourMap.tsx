import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

// You'll need to get your own Mapbox access token from https://mapbox.com
// For now, I'm using a placeholder - replace with your actual token
const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A';

interface Location {
  type: string;
  coordinates: [number, number];
  description: string;
  day: number;
  _id: string;
  id?: string;
}

const TourMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    // Static location data from your example - will be replaced with MongoDB data later
    const locations: Location[] = [
      {
        type: "Point",
        coordinates: [-80.128473, 25.781842],
        description: "Lummus Park Beach",
        day: 1,
        _id: "5c88fa8cf4afda39709c2959",
        id: "5c88fa8cf4afda39709c2959"
      },
      {
        type: "Point", 
        coordinates: [-80.647885, 24.909047],
        description: "Islamorada",
        day: 2,
        _id: "5c88fa8cf4afda39709c2958",
        id: "5c88fa8cf4afda39709c2958"
      },
      {
        type: "Point",
        coordinates: [-81.0784, 24.707496], 
        description: "Sombrero Beach",
        day: 3,
        _id: "5c88fa8cf4afda39709c2957",
        id: "5c88fa8cf4afda39709c2957"
      },
      {
        type: "Point",
        coordinates: [-81.768719, 24.552242],
        description: "West Key", 
        day: 5,
        _id: "5c88fa8cf4afda39709c2956",
        id: "5c88fa8cf4afda39709c2956"
      }
    ];

    if (!mapContainer.current) return;

    // Set Mapbox access token
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy',
      scrollZoom: false,
      // Center and zoom to fit all locations
      center: [-80.5, 25.2],
      zoom: 7,
      interactive: true
    });

    // Calculate bounds to fit all locations
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach(loc => bounds.extend(loc.coordinates));

    map.current.fitBounds(bounds, {
      padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100
      }
    });

    // Add markers for each location
    locations.forEach(loc => {
      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'marker';

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 30,
        closeButton: false,
        focusAfterOpen: false
      }).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`);

      // Add marker to map
      new mapboxgl.Marker({
        element: markerEl,
        anchor: 'bottom'
      })
        .setLngLat(loc.coordinates)
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <section className="section-map">
      <div 
        id="map" 
        ref={mapContainer}
        data-locations={JSON.stringify([
          {"type":"Point","coordinates":[-80.128473,25.781842],"description":"Lummus Park Beach","day":1,"_id":"5c88fa8cf4afda39709c2959","id":"5c88fa8cf4afda39709c2959"},
          {"type":"Point","coordinates":[-80.647885,24.909047],"description":"Islamorada","day":2,"_id":"5c88fa8cf4afda39709c2958","id":"5c88fa8cf4afda39709c2958"},
          {"type":"Point","coordinates":[-81.0784,24.707496],"description":"Sombrero Beach","day":3,"_id":"5c88fa8cf4afda39709c2957","id":"5c88fa8cf4afda39709c2957"},
          {"type":"Point","coordinates":[-81.768719,24.552242],"description":"West Key","day":5,"_id":"5c88fa8cf4afda39709c2956","id":"5c88fa8cf4afda39709c2956"}
        ])}
      />
    </section>
  );
};

export default TourMap;
