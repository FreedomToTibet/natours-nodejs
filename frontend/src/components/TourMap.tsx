import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Tour } from '../services';

// You'll need to get your own Mapbox access token from https://mapbox.com
// For now, I'm using a placeholder - replace with your actual token
const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A';

interface TourMapProps {
  tour: Tour;
}

const TourMap = ({ tour }: TourMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Set Mapbox access token
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy',
      scrollZoom: false,
      interactive: true
    });

    // Use tour locations
    const locations = tour.locations || [];

    if (locations.length > 0) {
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

        // Add marker to map
        new mapboxgl.Marker({
          element: markerEl,
          anchor: 'bottom'
        })
          .setLngLat(loc.coordinates)
          .addTo(map.current!);

        // Add popup that's always visible (not on click/hover)
        new mapboxgl.Popup({
          offset: 35,
          closeButton: false,
          focusAfterOpen: false,
          closeOnClick: false
        })
          .setLngLat(loc.coordinates)
          .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
          .addTo(map.current!);
      });
    } else {
      // Default center if no locations
      map.current.setCenter([-80.5, 25.2]);
      map.current.setZoom(7);
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [tour]);

  return (
    <section className="section-map">
      <div 
        id="map" 
        ref={mapContainer}
        data-locations={JSON.stringify(tour.locations || [])}
      />
    </section>
  );
};

export default TourMap;