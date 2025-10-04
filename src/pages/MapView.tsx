import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { districtData, DistrictData } from "@/data/agencies";
import { MapPin, Users, Building2, TrendingUp } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Approximate coordinates for districts (latitude, longitude)
const districtCoordinates: Record<string, [number, number]> = {
  "Kollam": [8.8932, 76.6141],
  "Chennai": [13.0827, 80.2707],
  "Lucknow": [26.8467, 80.9462],
  "Jaipur": [26.9124, 75.7873],
  "Pune": [18.5204, 73.8567],
};

const MapView = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered on India
    const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);

    // Add OpenStreetMap tiles (open standard)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom icon for high SC population areas
    const highPopIcon = L.icon({
      iconUrl: markerIcon2x,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const normalIcon = L.icon({
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      iconSize: [20, 33],
      iconAnchor: [10, 33],
      popupAnchor: [1, -28],
      shadowSize: [33, 33],
    });

    // Add markers for each district with real data
    districtData.forEach((district) => {
      const coords = districtCoordinates[district.district];
      if (!coords) return;

      const isHighPop = district.scPopulation > 35000;
      const marker = L.marker(coords, {
        icon: isHighPop ? highPopIcon : normalIcon,
      }).addTo(map);

      // Create popup content with real data
      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-lg mb-2">${district.district}</h3>
          <p class="text-sm text-gray-600 mb-2">${district.state}</p>
          <div class="space-y-1 text-sm">
            <p><strong>SC Population:</strong> ${district.scPopulation.toLocaleString()}</p>
            <p><strong>Projects:</strong> ${district.projects}</p>
            <p><strong>Villages:</strong> ${district.villages.length}</p>
            <p><strong>Funds Allocated:</strong> ${formatCurrency(district.fundsAllocated)}</p>
            <p><strong>Funds Utilized:</strong> ${formatCurrency(district.fundsUtilized)}</p>
          </div>
          ${isHighPop ? '<p class="mt-2 text-xs text-red-600 font-semibold">⚠️ High SC Population Area</p>' : ''}
        </div>
      `;

      marker.bindPopup(popupContent);

      // Handle marker click
      marker.on("click", () => {
        setSelectedDistrict(district);
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Interactive Map View</h1>
          <p className="text-muted-foreground">
            Real-time PM-AJAY projects mapped across India using OpenStreetMap
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>India - PM-AJAY Projects Map</CardTitle>
              <CardDescription>
                Click on markers to view district details • Red markers indicate high SC population areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                ref={mapContainerRef} 
                className="w-full h-[500px] rounded-lg border-2 border-border overflow-hidden"
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            {selectedDistrict ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {selectedDistrict.district}
                    </CardTitle>
                    <CardDescription>{selectedDistrict.state}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">SC Population:</span>
                        <span className="font-semibold">
                          {selectedDistrict.scPopulation.toLocaleString()}
                        </span>
                        {selectedDistrict.scPopulation > 35000 && (
                          <Badge variant="destructive" className="ml-auto">High Priority</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Projects:</span>
                        <span className="font-semibold">{selectedDistrict.projects}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Funds Allocated:</span>
                        <span className="font-semibold">
                          {formatCurrency(selectedDistrict.fundsAllocated)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-muted-foreground">Funds Utilized:</span>
                        <span className="font-semibold text-success">
                          {formatCurrency(selectedDistrict.fundsUtilized)}
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="text-xs text-muted-foreground mb-1">Utilization Rate</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-primary h-full transition-all"
                              style={{ 
                                width: `${(selectedDistrict.fundsUtilized / selectedDistrict.fundsAllocated) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold">
                            {((selectedDistrict.fundsUtilized / selectedDistrict.fundsAllocated) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Eligible Villages</CardTitle>
                    <CardDescription>
                      {selectedDistrict.villages.length} villages in focus
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedDistrict.villages.map((village) => (
                        <li key={village} className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span>{village}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Implementing Agencies</CardTitle>
                    <CardDescription>
                      {selectedDistrict.agencies.length} agencies involved
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedDistrict.agencies.map((agency) => (
                        <Badge key={agency} variant="outline">
                          {agency}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Select a marker on the map</p>
                    <p className="text-sm mt-2">Click any location to view district details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Map Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-8 bg-blue-500 rounded-sm" />
                <span className="text-sm">Standard Priority Districts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-10 bg-blue-700 rounded-sm" />
                <span className="text-sm">High SC Population (Priority)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-sm">Active PM-AJAY Project Location</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MapView;
