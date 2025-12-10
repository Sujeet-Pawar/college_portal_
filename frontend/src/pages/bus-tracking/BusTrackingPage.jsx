import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Bus, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import './BusTrackingPage.css';

// Sample data - replace with API call
const busData = {
  route: 'Route 5',
  eta: '8 min',
  nextStop: 'College Gate',
  stops: [
    { name: 'College Gate', eta: '8 min', distance: '2.5 km' },
    { name: 'Main Square', eta: '15 min', distance: '5 km' },
    { name: 'City Center', eta: '25 min', distance: '8 km' },
  ],
};

export const BusTrackingPage = () => {
  return (
    <div className="bus-tracking-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bus-tracking-header"
      >
        <div>
          <h1 className="bus-tracking-title">Bus Tracking</h1>
          <p className="bus-tracking-subtitle">Track your bus in real-time</p>
        </div>
      </motion.div>

      <div className="bus-tracking-main">
        <Card className="bus-tracking-card">
          <CardHeader>
            <CardTitle className="bus-tracking-card-title">Current Bus Status</CardTitle>
          </CardHeader>
          <CardContent className="bus-tracking-card-content">
            <div className="bus-tracking-info">
              <div className="bus-tracking-icon-wrapper">
                <Bus className="bus-tracking-icon" />
              </div>
              <div className="bus-tracking-details">
                <p className="bus-tracking-route">{busData.route}</p>
                <p className="bus-tracking-eta">
                  <Clock className="bus-eta-icon" />
                  ETA: {busData.eta}
                </p>
                <p className="bus-tracking-next-stop">
                  <MapPin className="bus-stop-icon" />
                  Next Stop: {busData.nextStop}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bus-stops-card">
          <CardHeader>
            <CardTitle>Upcoming Stops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bus-stops-list">
              {busData.stops.map((stop, index) => (
                <div key={index} className="bus-stop-item">
                  <div className="bus-stop-marker">
                    <div className="bus-stop-dot"></div>
                    {index < busData.stops.length - 1 && <div className="bus-stop-line"></div>}
                  </div>
                  <div className="bus-stop-info">
                    <p className="bus-stop-name">{stop.name}</p>
                    <p className="bus-stop-details">
                      ETA: {stop.eta} • {stop.distance}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

