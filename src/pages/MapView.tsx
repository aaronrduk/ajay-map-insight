import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { districtData, DistrictData } from "@/data/agencies";
import { MapPin, Users, Building2, TrendingUp } from "lucide-react";

const MapView = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Interactive Map View</h1>
          <p className="text-muted-foreground">
            Explore PM-AJAY projects across states and districts
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>India Map - District Selection</CardTitle>
              <CardDescription>Click on a district to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <MapPin className="h-16 w-16 text-primary mx-auto" />
                    <p className="text-muted-foreground">
                      Interactive map visualization would be displayed here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Click on districts below to view details
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {districtData.map((district) => (
                    <button
                      key={district.district}
                      onClick={() => setSelectedDistrict(district)}
                      className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                        selectedDistrict?.district === district.district
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{district.district}</p>
                          <p className="text-sm text-muted-foreground">{district.state}</p>
                        </div>
                        <Badge
                          className={
                            district.scPopulation > 35000
                              ? "bg-destructive text-destructive-foreground"
                              : "bg-primary text-primary-foreground"
                          }
                        >
                          {district.scPopulation > 35000 ? "High SC Pop" : "SC Pop"}
                        </Badge>
                      </div>
                      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                        <span>{district.projects} projects</span>
                        <span>{district.villages.length} villages</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
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
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Funds Utilized:</span>
                        <span className="font-semibold">
                          {formatCurrency(selectedDistrict.fundsUtilized)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Eligible Villages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedDistrict.villages.map((village) => (
                        <li key={village} className="flex items-center gap-2">
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
                    <p>Select a district to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MapView;
