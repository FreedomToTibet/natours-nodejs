import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Tour } from '../services';

// Mapbox access token from environment variables
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Fallback map styles to try if the primary one fails
const MAP_STYLES = [
  'mapbox://styles/mapbox/outdoors-v12',
  'mapbox://styles/mapbox/streets-v12',
  'mapbox://styles/mapbox/satellite-streets-v12'
];

interface TourMapProps {
  tour: Tour;
}

const TourMap = ({ tour }: TourMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const showFallbackContent = () => {
    if (!mapContainer.current) return;
    
    const locations = tour.locations || [];
    mapContainer.current.innerHTML = `
      <div class="map-fallback">
        <div class="map-fallback__header">
          <h3>🗺️ Tour Locations</h3>
          <p>Interactive map is temporarily unavailable. Here are the tour locations:</p>
        </div>
        <div class="map-fallback__locations">
          ${locations.map(loc => `
            <div class="location-item">
              <div class="location-item__day">Day ${loc.day}</div>
              <div class="location-item__description">${loc.description}</div>
              <div class="location-item__coords">📍 ${loc.coordinates[1].toFixed(4)}, ${loc.coordinates[0].toFixed(4)}</div>
              <a href="https://www.google.com/maps?q=${loc.coordinates[1]},${loc.coordinates[0]}" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="location-item__link">
                View on Google Maps →
              </a>
            </div>
          `).join('')}
        </div>
        <div class="map-fallback__footer">
          <p><small>💡 To enable the interactive map, please set up a Mapbox token following the instructions in MAPBOX_SETUP.md</small></p>
        </div>
      </div>
    `;
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Check if we have a valid Mapbox token
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'fallback_token') {
      console.warn('No valid Mapbox token found. Showing fallback content.');
      showFallbackContent();
      return;
    }

    // Set Mapbox access token
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    // Suppress terrain warnings in development/private browsing
    if (typeof window !== 'undefined') {
      // This reduces console noise from terrain/hillshade warnings
      const originalWarn = console.warn;
      console.warn = (...args) => {
        if (args[0]?.includes?.('Terrain and hillshade are disabled')) return;
        originalWarn.apply(console, args);
      };
    }

    // Initialize map with enhanced controls and error handling
    let mapInitialized = false;
    
    for (const style of MAP_STYLES) {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: style,
          scrollZoom: true,
          interactive: true,
          doubleClickZoom: true,
          touchZoomRotate: true,
          dragRotate: false,
          pitchWithRotate: false,
          // Disable telemetry to reduce console noise
          trackResize: true,
          preserveDrawingBuffer: false,
          antialias: true
        });

        // Add error handler for map loading
        map.current.on('error', (e) => {
          console.error('Mapbox map error:', e);
          if (!mapInitialized) {
            showFallbackContent();
          }
        });

        // Add load handler to confirm successful initialization
        map.current.on('load', () => {
          mapInitialized = true;
          console.log('Mapbox map loaded successfully');
        });

        break; // If we get here, map was created successfully
      } catch (error) {
        console.error(`Failed to initialize map with style ${style}:`, error);
        continue; // Try next style
      }
    }

    // If no map style worked, show fallback
    if (!map.current) {
      console.error('All map styles failed. Showing fallback content.');
      showFallbackContent();
      return;
    }

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