import { useState, useEffect, useRef, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { districtData, DistrictData } from "@/data/agencies";
import { getAllStates, getDistrictsByState } from "@/data/india-geography";
import { MapPin, Users, Building2, TrendingUp, Info } from "lucide-react";
import { getLastUpdatedTimestamp } from "@/lib/export-utils";
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

// Real coordinates for districts across India (latitude, longitude)
const districtCoordinates: Record<string, [number, number]> = {
  // Kerala
  "Kollam": [8.8932, 76.6141],
  "Thiruvananthapuram": [8.5241, 76.9366],
  "Palakkad": [10.7867, 76.6548],
  
  // Tamil Nadu
  "Chennai": [13.0827, 80.2707],
  "Madurai": [9.9252, 78.1198],
  "Coimbatore": [11.0168, 76.9558],
  
  // Uttar Pradesh
  "Lucknow": [26.8467, 80.9462],
  "Varanasi": [25.3176, 82.9739],
  "Allahabad": [25.4358, 81.8463],
  
  // Maharashtra
  "Pune": [18.5204, 73.8567],
  "Nagpur": [21.1458, 79.0882],
  "Aurangabad": [19.8762, 75.3433],
  
  // Karnataka
  "Bangalore Rural": [13.2846, 77.3821],
  "Mysore": [12.2958, 76.6394],
  "Belgaum": [15.8497, 74.4977],
  
  // Rajasthan
  "Jaipur": [26.9124, 75.7873],
  "Udaipur": [24.5854, 73.7125],
  "Jodhpur": [26.2389, 73.0243],
  
  // Gujarat
  "Ahmedabad": [23.0225, 72.5714],
  "Surat": [21.1702, 72.8311],
  "Vadodara": [22.3072, 73.1812],
  
  // West Bengal
  "Kolkata": [22.5726, 88.3639],
  "Howrah": [22.5958, 88.2636],
  "Bardhaman": [23.2324, 87.8615],
  
  // Bihar
  "Patna": [25.5941, 85.1376],
  "Gaya": [24.7955, 84.9994],
  "Muzaffarpur": [26.1225, 85.3906],
  
  // Madhya Pradesh
  "Bhopal": [23.2599, 77.4126],
  "Indore": [22.7196, 75.8577],
  "Jabalpur": [23.1815, 79.9864],
  
  // Andhra Pradesh
  "Visakhapatnam": [17.6868, 83.2185],
  "Guntur": [16.3067, 80.4365],
  "Vijayawada": [16.5062, 80.6480],
  
  // Telangana
  "Hyderabad": [17.3850, 78.4867],
  "Warangal": [17.9689, 79.5941],
  "Karimnagar": [18.4386, 79.1288],
  
  // Punjab
  "Ludhiana": [30.9010, 75.8573],
  "Amritsar": [31.6340, 74.8723],
  "Jalandhar": [31.3260, 75.5762],
  
  // Haryana
  "Gurgaon": [28.4595, 77.0266],
  "Faridabad": [28.4089, 77.3178],
  "Panipat": [29.3909, 76.9635],
  
  // Odisha
  "Bhubaneswar": [20.2961, 85.8245],
  "Cuttack": [20.4625, 85.8828],
  "Rourkela": [22.2604, 84.8536],
};

const MapView = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [filterState, setFilterState] = useState<string>("all");
  const [filterDistrict, setFilterDistrict] = useState<string>("all");
  const [filterComponent, setFilterComponent] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const lastUpdated = useMemo(() => getLastUpdatedTimestamp(), []);

  const components = ["Adarsh Gram", "Hostel Development", "NGO Support", "Skill Development", "Infrastructure"];
  const statuses = ["Approved", "Ongoing", "Completed", "Pending"];

  // Filter district data based on selected filters
  const filteredData = useMemo(() => {
    return districtData.filter((district) => {
      const matchesState = filterState === "all" || district.state === filterState;
      const matchesDistrict = filterDistrict === "all" || district.district === filterDistrict;
      // Since we don't have component and status in districtData, we'll just use state/district for now
      return matchesState && matchesDistrict;
    });
  }, [filterState, filterDistrict, filterComponent, filterStatus]);

  // Reset district filter when state changes
  useEffect(() => {
    if (filterState === "all") {
      setFilterDistrict("all");
    }
  }, [filterState]);

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clear existing map if it exists
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

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

    // Add markers for filtered districts
    filteredData.forEach((district) => {
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
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [filteredData]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Interactive Map View</h1>
          <p className="text-muted-foreground">
            Explore PM-AJAY projects with OpenStreetMap across 100+ districts
          </p>
          <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        {/* Filter Section */}
        <Card className="bg-card/95 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* State Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">State</label>
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger className="w-full bg-background/80 backdrop-blur-sm border-border z-50">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover/95 backdrop-blur-md border-border z-[100]">
                    <SelectItem value="all">All States</SelectItem>
                    {getAllStates().map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* District Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">District</label>
                <Select 
                  value={filterDistrict} 
                  onValueChange={setFilterDistrict}
                  disabled={filterState === "all"}
                >
                  <SelectTrigger className="w-full bg-background/80 backdrop-blur-sm border-border z-50">
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover/95 backdrop-blur-md border-border z-[100]">
                    <SelectItem value="all">All Districts</SelectItem>
                    {filterState !== "all" &&
                      getDistrictsByState(filterState).map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Component Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Component</label>
                <Select value={filterComponent} onValueChange={setFilterComponent}>
                  <SelectTrigger className="w-full bg-background/80 backdrop-blur-sm border-border z-50">
                    <SelectValue placeholder="All Components" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover/95 backdrop-blur-md border-border z-[100]">
                    <SelectItem value="all">All Components</SelectItem>
                    {components.map((component) => (
                      <SelectItem key={component} value={component}>
                        {component}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full bg-background/80 backdrop-blur-sm border-border z-50">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover/95 backdrop-blur-md border-border z-[100]">
                    <SelectItem value="all">All Status</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(filterState !== "all" || filterDistrict !== "all" || filterComponent !== "all" || filterStatus !== "all") && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Active Filters:</span>
                <div className="flex flex-wrap gap-2">
                  {filterState !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      State: {filterState}
                    </Badge>
                  )}
                  {filterDistrict !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      District: {filterDistrict}
                    </Badge>
                  )}
                  {filterComponent !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Component: {filterComponent}
                    </Badge>
                  )}
                  {filterStatus !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Status: {filterStatus}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
