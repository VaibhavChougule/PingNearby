import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MessageCircle, Users, MapPin, Wifi, WifiOff, X, Minimize2, Maximize2, Menu, Navigation, Search, Bell, Clock, User } from 'lucide-react';
import ChatBox from './components/ChatBox.jsx';
// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color = '#3b82f6', isCurrentUser = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="relative">
      <div class="w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center" style="background-color: ${color}">
        ${isCurrentUser ? '<div class="w-3 h-3 bg-white rounded-full animate-pulse"></div>' : '<div class="w-2 h-2 bg-white rounded-full"></div>'}
      </div>
      ${isCurrentUser ? '<div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-blue-500"></div>' : ''}
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Create search area marker
const createSearchIcon = () => {
  return L.divIcon({
    className: 'search-marker',
    html: `<div class="relative">
      <div class="w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center bg-orange-500">
        <div class="w-4 h-4 bg-white rounded-full flex items-center justify-center">
          <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
        </div>
      </div>
      <div class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Map click handler component
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// Simple ChatBox component placeholder
// function ChatBox({ neighbour, onClose, wsRef, clientID, incomingMsg, draggable }) {
//   return (
//     <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border z-[2000]">
//       <div className="bg-blue-500 text-white p-3 rounded-t-lg flex justify-between items-center">
//         <span>Chat with {neighbour}</span>
//         <button onClick={onClose} className="text-white hover:bg-blue-600 p-1 rounded">
//           <X size={16} />
//         </button>
//       </div>
//       <div className="p-4">
//         <div className="text-sm text-gray-600 mb-2">
//           From: {incomingMsg.from}
//         </div>
//         <div className="text-sm">
//           {incomingMsg.msg}
//         </div>
//       </div>
//     </div>
//   );
// }

// Waiting List Component
function WaitingList({ waitingList, onAcceptChat, onRejectChat, showWaitingList, onClose }) {
  if (!showWaitingList || waitingList.length === 0) return null;

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="absolute bottom-4 right-4 z-[1500] bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={18} />
          <h3 className="font-semibold">Waiting Messages ({waitingList.length})</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="overflow-y-auto max-h-80">
        {waitingList.map((msg, index) => (
          <div
            key={index}
            className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {msg.from ? msg.from.toString().slice(-2) : '??'}
                </div>
                <div>
                  <div className="font-medium text-gray-800">User {msg.from}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(msg.timestamp || Date.now())}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-sm text-gray-700 line-clamp-3">
                {msg.msg}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onAcceptChat(msg)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
              >
                <MessageCircle size={14} />
                Accept
              </button>
              <button
                onClick={() => onRejectChat(msg, index)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>

      {waitingList.length > 0 && (
        <div className="p-3 bg-gray-50 border-t text-xs text-gray-600 text-center">
          💬 New messages from users while you were chatting
        </div>
      )}
    </div>
  );
}

function App() {
  const [locations, setLocations] = useState([]);
  const [myLocation, setMyLocation] = useState({ lat: 20.5937, lng: 78.9629 });
  const [clientID, setClientID] = useState("Connecting...");
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const wsRef = useRef();
  const [neighbour, setNeighbour] = useState(null);
  const neighbourRef = useRef(null);
  const [chatbox, setChatBox] = useState(false);
  const [showLocationPanel, setShowLocationPanel] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [incomingMsg, setIncomingMsg] = useState({ type: 'incoming', msg: 'Now you can send message....' });
  const [waitingList, setWaitingList] = useState([]);
  const [showWaitingList, setShowWaitingList] = useState(false);

  // New states for area-based search
  const [searchLocation, setSearchLocation] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [showNearbyPanel, setShowNearbyPanel] = useState(false);
  const [searchRadius, setSearchRadius] = useState(50); // km

  useEffect(() => {
    const ws = new WebSocket('wss://pingnearby.onrender.com');
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus('connected');
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationData = {
              type: 'location',
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            setMyLocation({ lat: locationData.latitude, lng: locationData.longitude });
            ws.send(JSON.stringify(locationData));
          },
          (error) => {
            console.error('Error getting location:', error);
            setConnectionStatus('error');
            ws.send(JSON.stringify({ type: 'error', message: 'Location access denied' }));
          }
        );
      } else {
        console.error('Geolocation not supported');
        setConnectionStatus('error');
        ws.send(JSON.stringify({ type: 'error', message: 'Geolocation not supported' }));
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'all_locations') {
        setLocations(data.locations);
      } else if (data.type === 'clientID') {
        setClientID(data.clientID);
      } else if (data.type === 'incoming_msg') {
        console.log("here:", data);

        // Add timestamp to the message
        const messageWithTimestamp = {
          ...data,
          timestamp: Date.now()
        };

        if (neighbourRef.current != null && neighbourRef.current !== data.from) {
          setWaitingList(prev => [...prev, messageWithTimestamp]);
        } else {
          if (neighbourRef.current == null) {
            setNeighbour(data.from);
            neighbourRef.current = data.from;
          }
          setChatBox(true);
          setIncomingMsg(messageWithTimestamp);
        }

      }
      else if (data.type === 'offline_error') {
        console.error("Offline error:", data);
        setIncomingMsg({ type: 'error', msg: data.msg, from: data.from });
      }
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
    };

    ws.onerror = () => {
      setConnectionStatus('error');
    };

    return () => {
      ws.close();
    };
  }, []);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Handle map click to search for nearby users
  const handleMapClick = (latlng) => {
    const clickedLocation = { lat: latlng.lat, lng: latlng.lng };
    setSearchLocation(clickedLocation);

    // Find nearby users within the search radius
    const nearby = locations.filter(user => {
      if (user.clientID === clientID) return false; // Exclude current user
      const distance = calculateDistance(
        clickedLocation.lat,
        clickedLocation.lng,
        user.latitude,
        user.longitude
      );
      return distance <= searchRadius;
    }).map(user => ({
      ...user,
      distance: calculateDistance(
        clickedLocation.lat,
        clickedLocation.lng,
        user.latitude,
        user.longitude
      )
    })).sort((a, b) => a.distance - b.distance);

    setNearbyUsers(nearby);
    setShowNearbyPanel(true);
    setShowLocationPanel(false); // Close all users panel if open
  };

  function handleChatClick(user) {
    setNeighbour(user.clientID);
    setChatBox(true);
    setShowNearbyPanel(false);
  }

  // Handle accepting a waiting chat
  const handleAcceptChat = (msg) => {
    setNeighbour(msg.from);
    neighbourRef.current = msg.from;
    setIncomingMsg(msg);
    setChatBox(true);
    setShowWaitingList(false);

    // Remove this message from waiting list
    setWaitingList(prev => prev.filter(m => m !== msg));
  };

  // Handle rejecting a waiting chat
  const handleRejectChat = (msg, index) => {
    setWaitingList(prev => prev.filter((_, i) => i !== index));
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="text-green-500" size={20} />;
      case 'connecting':
        return <Wifi className="text-yellow-500 animate-pulse" size={20} />;
      default:
        return <WifiOff className="text-red-500" size={20} />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Connection Error';
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100">
      {/* Mobile Responsive Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg z-50 relative">
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <MapPin className="text-blue-200" size={20} />
            <h1 className="text-lg font-bold truncate">PingNearby</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Waiting List Button for Mobile */}
            {waitingList.length > 0 && (
              <button
                onClick={() => setShowWaitingList(!showWaitingList)}
                className="relative p-2 hover:bg-black/20 rounded-lg transition-colors"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {waitingList.length}
                </span>
              </button>
            )}

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-black/20 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <MapPin className="text-blue-200" size={24} />
            <h1 className="text-xl font-bold">PingNearby</h1>
            <div className="text-sm bg-black/20 px-2 py-1 rounded">
              Click on map to find nearby users
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Waiting List Button */}
            {waitingList.length > 0 && (
              <button
                onClick={() => setShowWaitingList(!showWaitingList)}
                className="relative flex items-center gap-2 bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded-full transition-colors"
              >
                <Bell size={16} />
                <span className="text-sm font-medium">Messages</span>
                <span className="bg-white text-purple-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {waitingList.length}
                </span>
              </button>
            )}

            {/* Search Radius Control */}
            <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
              <Search size={16} />
              <span className="text-sm">Radius:</span>
              <select
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="bg-transparent text-white text-sm border-none outline-none"
              >
                <option value={10} className="text-black">10km</option>
                <option value={25} className="text-black">25km</option>
                <option value={50} className="text-black">50km</option>
                <option value={100} className="text-black">100km</option>
              </select>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
              {getConnectionIcon()}
              <span className="text-sm font-medium">{getConnectionText()}</span>
            </div>

            {/* User Count */}
            <button
              onClick={() => setShowLocationPanel(!showLocationPanel)}
              className="flex items-center gap-2 bg-black/20 hover:bg-black/30 px-3 py-1 rounded-full transition-colors"
            >
              <Users size={18} />
              <span className="text-sm font-medium">{locations.length} Total</span>
            </button>

            {/* Client ID */}
            <div className="bg-black/20 px-3 py-1 rounded-full">
              <span className="text-sm font-bold">ID: {clientID}</span>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-blue-700 border-t border-blue-500 px-4 py-3 space-y-3">
            <div className="text-sm text-blue-100">Click on map to find nearby users</div>

            {/* Search Radius */}
            <div className="flex items-center gap-2">
              <Search size={16} />
              <span className="text-sm">Search Radius:</span>
              <select
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="bg-black/20 text-white text-sm px-2 py-1 rounded border-none outline-none"
              >
                <option value={10} className="text-black">10km</option>
                <option value={25} className="text-black">25km</option>
                <option value={50} className="text-black">50km</option>
                <option value={100} className="text-black">100km</option>
              </select>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              <span className="text-sm font-medium">{getConnectionText()}</span>
            </div>

            {/* User Count */}
            <button
              onClick={() => {
                setShowLocationPanel(!showLocationPanel);
                setShowMobileMenu(false);
              }}
              className="flex items-center gap-2 w-full text-left py-2"
            >
              <Users size={18} />
              <span className="text-sm font-medium">{locations.length} Total Users</span>
            </button>

            {/* Client ID */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Your ID:</span>
              <span className="text-sm font-bold bg-black/20 px-2 py-1 rounded">{clientID}</span>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 relative">
        {/* Map Container */}
        <MapContainer
          center={[myLocation.lat, myLocation.lng]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          className="z-10"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onMapClick={handleMapClick} />

          {/* Current User Marker */}
          <Marker
            position={[myLocation.lat, myLocation.lng]}
            icon={createCustomIcon('#22c55e', true)}
          >
            <Popup className="custom-popup">
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <strong className="text-green-700">You are here</strong>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>ID:</strong> {clientID} <br />
                  <strong>Lat:</strong> {myLocation.lat.toFixed(6)} <br />
                  <strong>Lng:</strong> {myLocation.lng.toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Search Location Marker */}
          {searchLocation && (
            <Marker
              position={[searchLocation.lat, searchLocation.lng]}
              icon={createSearchIcon()}
            >
              <Popup className="custom-popup">
                <div className="p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                    <strong className="text-orange-700">Search Area</strong>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Radius:</strong> {searchRadius}km <br />
                    <strong>Found:</strong> {nearbyUsers.length} users
                  </div>
                  <button
                    onClick={() => setShowNearbyPanel(true)}
                    className="w-full bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                  >
                    View Nearby Users
                  </button>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Show only nearby users when search is active */}
          {/* {nearbyUsers.map((user, index) => (
            <Marker
              key={`nearby-${index}`}
              position={[user.latitude, user.longitude]}
              icon={createCustomIcon('#3b82f6', false)}
            >
              <Popup className="custom-popup">
                <div className="p-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <strong className="text-blue-700">User {user.clientID}</strong>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <strong>Distance:</strong> {user.distance.toFixed(1)}km <br />
                    <strong>Lat:</strong> {user.latitude.toFixed(6)} <br />
                    <strong>Lng:</strong> {user.longitude.toFixed(6)}
                  </div>
                  <button
                    onClick={() => handleChatClick(user)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
                  >
                    <MessageCircle size={16} />
                    Start Chat
                  </button>
                </div>
              </Popup>
            </Marker>
          ))} */}
        </MapContainer>

        {/* Waiting List Component */}
        <WaitingList
          waitingList={waitingList}
          onAcceptChat={handleAcceptChat}
          onRejectChat={handleRejectChat}
          showWaitingList={showWaitingList}
          onClose={() => setShowWaitingList(false)}
        />

        {/* All Users Panel */}
        {showLocationPanel && (
          <div className="absolute top-4 left-4 right-4 md:right-auto z-[1000] bg-white rounded-lg shadow-xl border border-gray-200 md:w-80 max-h-96 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Users size={18} />
                All Users ({locations.length})
              </h3>
              <button
                onClick={() => setShowLocationPanel(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3 bg-yellow-50 border-b text-sm text-yellow-800">
              💡 Click on the map to search for users in a specific area
            </div>
            <div className="overflow-y-auto max-h-80">
              {locations.map((loc, index) => (
                <div
                  key={index}
                  className={`p-3 border-b border-gray-100 ${loc.clientID === clientID ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                    } transition-colors`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${loc.clientID === clientID ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {loc.clientID === clientID ? 'You' : `User ${loc.clientID}`}
                        </div>
                        {/* <div className="text-xs text-gray-500">
                          {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                        </div> */}
                      </div>
                    </div>
                    {loc.clientID === clientID && (
                      <span className="text-xs text-green-600 font-medium">Current User</span>
                    )}
                    {loc.clientID !== clientID && (
                      <button
                        onClick={() => handleChatClick({clientID: loc.clientID})}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <MessageCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Users Panel */}
        {showNearbyPanel && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto z-[1000] bg-white rounded-lg shadow-xl border border-gray-200 md:w-80 max-h-96 overflow-hidden">
            <div className="bg-orange-50 px-4 py-3 border-b border-orange-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Navigation size={18} className="text-orange-600" />
                Nearby Users ({nearbyUsers.length})
              </h3>
              <button
                onClick={() => setShowNearbyPanel(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3 bg-blue-50 border-b text-sm text-blue-800">
              📍 Within {searchRadius}km of your search point
            </div>
            <div className="overflow-y-auto max-h-80">
              {nearbyUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Navigation size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No users found in this area</p>
                  <p className="text-sm">Try increasing the search radius or clicking elsewhere</p>
                </div>
              ) : (
                nearbyUsers.map((user, index) => (
                  <div
                    key={index}
                    className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div>
                          <div className="font-medium text-gray-800">User {user.clientID}</div>
                          <div className="text-xs text-gray-500">
                            {user.distance.toFixed(1)}km away
                          </div>
                          {/* <div className="text-xs text-gray-400">
                            {user.latitude.toFixed(4)}, {user.longitude.toFixed(4)}
                          </div> */}
                        </div>
                      </div>
                      <button
                        onClick={() => handleChatClick(user)}
                        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <MessageCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat Box */}
        {chatbox && (
          <ChatBox
            neighbour={neighbour}
            onClose={() => setChatBox(false)}
            wsRef={wsRef}
            clientID={clientID}
            incomingMsg={incomingMsg}
            draggable={true}
          />
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        
        .custom-marker, .search-marker {
          background: transparent;
          border: none;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default App;