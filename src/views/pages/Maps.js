import { useEffect, useRef, useState } from "react";
import { Card, Container, Row } from "reactstrap";
import Header from "../../components/Headers/Header";
import { isTokenExpired } from "../../services/checkToken";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";

const MapWrapper = () => {
  const markerRef = useRef(null);
  const navigate = useNavigate();
  const [address, setAddress] = useState(null);
  const [markerPosition, setMarkerPosition] = useState({ lat: 10.840903, lng: 106.809889 });

  
  const handleMarkerMove = (e) => {
    const { lat, lng } = e.target.getLatLng();
    setMarkerPosition({ lat, lng });
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user == null || !user || isTokenExpired()) {
      toast.info("You need to log in to continue!", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        onClose: () => {
          navigate("/auth/login");
          if (isTokenExpired()) {
            localStorage.removeItem('user');
          }
        },
      });
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${markerPosition.lat}&lon=${markerPosition.lng}&zoom=18&addressdetails=1`
        );
        if (response.status === 200) {
          const { address } = response.data;
          setAddress(address);
          console.log(address);

        }
      } catch (error) {
        console.log("Error:", error);
      }
    };

    fetchAddress();
  }, [markerPosition]);

  return (
    <>
      <MapContainer
        center={[markerPosition.lat, markerPosition.lng]}
        zoom={19}
        scrollWheelZoom={true}
        zoomControl={true}
        style={{ height: "700px", borderRadius: "5px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        />
        <Marker
          position={[markerPosition.lat, markerPosition.lng]}
          draggable={true}
          eventHandlers={{
            dragend: handleMarkerMove,
          }}
          ref={markerRef}
        >
          <Popup>
            <div className="info-window-content">
              <h2>Bus Station</h2>
              {address && (
                <>
                  <p>{address.amenity}</p>
                  <p>Address: {address.house_number}, {address.road}, {address.suburb}, {address.city} </p>
                </>
              )}
              <p>Latitude: {markerPosition.lat}</p>
              <p>Longitude: {markerPosition.lng}</p>

            </div>
          </Popup>
        </Marker>        
      </MapContainer>
    </>
  );
};

const Maps = () => {
  return (
    <>
      <Header />
      <ToastContainer />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow border-0">
              <MapWrapper />
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Maps;