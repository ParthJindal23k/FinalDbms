import TrackShipment from "./pages/TrackShipment";

function App() {
  return (
    <Routes>
      {/* Existing routes */}
      <Route path="/track-shipments" element={<TrackShipment />} />
    </Routes>
  );
} 