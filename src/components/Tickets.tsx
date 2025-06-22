
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { getTickets, addTicket, getUserCoins, addCoins } from '@/utils/localStorage';
import { Ticket } from 'lucide-react';

interface TicketBooking {
  id: string;
  userId: string;
  username: string;
  type: 'flight' | 'train' | 'bus' | 'hotel';
  from: string;
  to: string;
  date: string;
  passengers: number;
  price: number;
  status: 'booked' | 'cancelled';
  createdAt: string;
}

const Tickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketBooking[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [type, setType] = useState<'flight' | 'train' | 'bus' | 'hotel'>('flight');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [price, setPrice] = useState(0);

  const loadTickets = () => {
    const allTickets = getTickets();
    setTickets(allTickets);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleBookTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !from.trim() || !to.trim() || !date) return;

    const userCoins = getUserCoins(user.id);
    if (userCoins < price) {
      alert('Insufficient coins to book this ticket!');
      return;
    }

    const newTicket: TicketBooking = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      username: user.username,
      type,
      from: from.trim(),
      to: to.trim(),
      date,
      passengers,
      price,
      status: 'booked',
      createdAt: new Date().toISOString(),
    };

    addTicket(newTicket);
    addCoins(user.id, -price, `${type} ticket booked`);
    
    // Reset form
    setFrom('');
    setTo('');
    setDate('');
    setPassengers(1);
    setPrice(0);
    setShowBookingForm(false);
    loadTickets();
  };

  const getTicketIcon = (ticketType: string) => {
    switch (ticketType) {
      case 'flight': return '✈️';
      case 'train': return '🚂';
      case 'bus': return '🚌';
      case 'hotel': return '🏨';
      default: return '🎫';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'booked' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center space-x-2">
          <Ticket className="h-5 w-5 sm:h-6 sm:w-6" />
          <span>Book Tickets</span>
        </h1>
        <Button onClick={() => setShowBookingForm(!showBookingForm)} className="w-full sm:w-auto">
          {showBookingForm ? 'Cancel' : 'Book New Ticket'}
        </Button>
      </div>

      {showBookingForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Book New Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBookTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ticketType">Type</Label>
                  <select
                    id="ticketType"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="flight">Flight ✈️</option>
                    <option value="train">Train 🚂</option>
                    <option value="bus">Bus 🚌</option>
                    <option value="hotel">Hotel 🏨</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="passengers">Passengers</Label>
                  <Input
                    id="passengers"
                    type="number"
                    min="1"
                    max="10"
                    value={passengers}
                    onChange={(e) => setPassengers(parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from">From</Label>
                  <Input
                    id="from"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="Departure city..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Destination city..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price (Coins)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value))}
                    placeholder="Ticket price in coins..."
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full sm:w-auto">
                Book Ticket ({price} coins)
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                    <AvatarFallback>
                      {ticket.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-xl flex items-center space-x-2">
                      <span>{getTicketIcon(ticket.type)}</span>
                      <span className="capitalize">{ticket.type} Booking</span>
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-gray-500">
                      by {ticket.username} • {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Route</p>
                  <p className="font-medium">{ticket.from} → {ticket.to}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{new Date(ticket.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Passengers</p>
                  <p className="font-medium">{ticket.passengers} {ticket.passengers === 1 ? 'person' : 'people'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-medium text-yellow-600">{ticket.price} coins</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tickets.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 text-base sm:text-lg">No tickets booked yet!</p>
          <p className="text-gray-400 text-sm sm:text-base">Book your first travel ticket to get started.</p>
        </div>
      )}
    </div>
  );
};

export default Tickets;
