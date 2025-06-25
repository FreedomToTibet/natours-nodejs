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

    // Initialize map with enhanced controls
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy',
      scrollZoom: true, // Enable scroll zoom
      interactive: true,
      doubleClickZoom: true, // Enable double-click to zoom
      touchZoomRotate: true, // Enable touch zoom and rotate
      dragRotate: false, // Disable rotation for cleaner UX
      pitchWithRotate: false
    });

    // Add navigation controls (zoom in/out buttons)
    map.current.addControl(new mapboxgl.NavigationControl({
      showCompass: false, // Hide compass for cleaner look
      showZoom: true // Show zoom buttons
    }), 'top-right');

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

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

        // Create interactive popup with close button
        const popup = new mapboxgl.Popup({
          offset: 35,
          closeButton: true, // Enable close button
          focusAfterOpen: false,
          closeOnClick: false,
          closeOnMove: false, // Prevent closing when map moves
          className: 'tour-popup' // Custom class for styling
        })
          .setLngLat(loc.coordinates)
          .setHTML(`
            <div class="popup-content">
              <h4>Day ${loc.day}</h4>
              <p>${loc.description}</p>
            </div>
          `);

        // Add marker to map with popup interaction
        new mapboxgl.Marker({
          element: markerEl,
          anchor: 'bottom'
        })
          .setLngLat(loc.coordinates)
          .addTo(map.current!);

        // Initially show all popups
        popup.addTo(map.current!);

        // Add click event to marker to toggle popup
        markerEl.addEventListener('click', () => {
          if (popup.isOpen()) {
            popup.remove();
          } else {
            popup.addTo(map.current!);
          }
        });

        // Style the marker for better interaction feedback
        markerEl.style.cursor = 'pointer';
        markerEl.title = `Day ${loc.day}: ${loc.description}`;
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