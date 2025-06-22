
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getItineraries, addItinerary, addCoins } from '@/utils/localStorage';

interface Destination {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
}

interface Itinerary {
  id: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  destinations: Destination[];
  startDate: string;
  endDate: string;
  isPublic: boolean;
  createdAt: string;
}

const Itineraries: React.FC = () => {
  const { user } = useAuth();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [destinations, setDestinations] = useState<Omit<Destination, 'id'>[]>([{
    name: '',
    description: '',
    date: '',
    location: ''
  }]);

  const loadItineraries = () => {
    const allItineraries = getItineraries();
    setItineraries(allItineraries);
  };

  useEffect(() => {
    loadItineraries();
  }, []);

  const handleCreateItinerary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !description.trim()) return;

    const newItinerary: Itinerary = {
      id: `itinerary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      username: user.username,
      title: title.trim(),
      description: description.trim(),
      destinations: destinations
        .filter(dest => dest.name.trim())
        .map(dest => ({
          ...dest,
          id: `dest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })),
      startDate,
      endDate,
      isPublic: true,
      createdAt: new Date().toISOString(),
    };

    addItinerary(newItinerary);
    addCoins(user.id, 15, 'Itinerary created');
    
    // Reset form
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setDestinations([{ name: '', description: '', date: '', location: '' }]);
    setShowCreateForm(false);
    loadItineraries();
  };

  const addDestination = () => {
    setDestinations([...destinations, { name: '', description: '', date: '', location: '' }]);
  };

  const updateDestination = (index: number, field: keyof Omit<Destination, 'id'>, value: string) => {
    const updated = destinations.map((dest, i) => 
      i === index ? { ...dest, [field]: value } : dest
    );
    setDestinations(updated);
  };

  const removeDestination = (index: number) => {
    setDestinations(destinations.filter((_, i) => i !== index));
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Travel Itineraries</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : 'Create Itinerary'}
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Itinerary</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateItinerary} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Trip Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Summer Europe Trip"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of your trip"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Destinations</Label>
                  <Button type="button" size="sm" onClick={addDestination}>
                    Add Destination
                  </Button>
                </div>
                
                {destinations.map((destination, index) => (
                  <div key={index} className="border p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Destination {index + 1}</h4>
                      {destinations.length > 1 && (
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="destructive"
                          onClick={() => removeDestination(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        placeholder="Destination name"
                        value={destination.name}
                        onChange={(e) => updateDestination(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Location"
                        value={destination.location}
                        onChange={(e) => updateDestination(index, 'location', e.target.value)}
                      />
                      <Input
                        type="date"
                        value={destination.date}
                        onChange={(e) => updateDestination(index, 'date', e.target.value)}
                      />
                      <Input
                        placeholder="Description"
                        value={destination.description}
                        onChange={(e) => updateDestination(index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button type="submit">Create Itinerary (+15 coins)</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {itineraries.map((itinerary) => (
          <Card key={itinerary.id} className="animate-fade-in hover-scale">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{itinerary.title}</CardTitle>
                <Badge variant="secondary">
                  {itinerary.destinations.length} stops
                </Badge>
              </div>
              <p className="text-sm text-gray-500">by {itinerary.username}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">{itinerary.description}</p>
              
              {itinerary.startDate && itinerary.endDate && (
                <div className="text-sm text-gray-600">
                  📅 {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
                </div>
              )}

              {itinerary.destinations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Destinations:</h4>
                  <div className="space-y-1">
                    {itinerary.destinations.slice(0, 3).map((destination) => (
                      <div key={destination.id} className="text-sm bg-gray-50 p-2 rounded">
                        <div className="font-medium">{destination.name}</div>
                        {destination.location && (
                          <div className="text-gray-600">📍 {destination.location}</div>
                        )}
                      </div>
                    ))}
                    {itinerary.destinations.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{itinerary.destinations.length - 3} more destinations
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {itineraries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No itineraries yet!</p>
          <p className="text-gray-400">Create your first travel itinerary.</p>
        </div>
      )}
    </div>
  );
};

export default Itineraries;
