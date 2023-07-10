import { useEffect, useRef } from "react";
import { Card, Container, Row } from "reactstrap";
import Header from "../../components/Headers/Header";
import { isTokenExpired } from "../../services/checkToken";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

const MapWrapper = () => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const navigate = useNavigate();

  const initMap = () => {
    let map = mapRef.current;
    let lat = 10.840903;
    let lng = 106.809889;
    const myLatlng = new window.google.maps.LatLng(lat, lng);
    const mapOptions = {
      zoom: 19,
      center: myLatlng,
      scrollwheel: true,
      zoomControl: true,
      mapTypeId: 'hybrid',
      styles: [
        // map styles
      ],
    };

    map = new window.google.maps.Map(map, mapOptions);

    const marker = new window.google.maps.Marker({
      position: myLatlng,
      map: map,
      animation: window.google.maps.Animation.DROP,
      title: "Bus Station",
    });

    markerRef.current = marker;

    const contentString =
      '<div class="info-window-content"><h2>Bus Station</h2>' +
      `<p>Latitude: ${myLatlng.lat()}</p>` +
      `<p>Longitude: ${myLatlng.lng()}</p>` +
      '</div>';

    const infowindow = new window.google.maps.InfoWindow({
      content: contentString,
    });

    window.google.maps.event.addListener(marker, "click", function () {
      infowindow.open(map, marker);
    });

    window.google.maps.event.addListener(map, "click", function (event) {
      const clickedLatlng = event.latLng;
      marker.setPosition(clickedLatlng);
      infowindow.setContent(
        '<div class="info-window-content"><h2>Bus Station</h2>' +
        `<p>Latitude: ${clickedLatlng.lat()}</p>` +
        `<p>Longitude: ${clickedLatlng.lng()}</p>` +
        '</div>'
      );
    });
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
    } else {
      if (window.google && window.google.maps) {
        initMap();
      } else {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        return () => {
          document.body.removeChild(script);
        };
      }
    }
  }, [navigate]);

  return (
    <>
      <div
        style={{ height: `700px` }}
        className="map-canvas"
        id="map-canvas"
        ref={mapRef}
      ></div>
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
