import React, { useEffect, useRef } from "react";
import { Card, Container, Row } from "reactstrap";
import Header from "../../components/Headers/Header";
import { isTokenExpired } from "../../services/checkToken";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

const MapWrapper = () => {
  const mapRef = useRef(null); // Move mapRef declaration inside the component
  const navigate = useNavigate();

  const initMap = () => {
    let map = mapRef.current;
    let lat = "10.840903";
    let lng = "106.809889";
    const myLatlng = new window.google.maps.LatLng(lat, lng);
    const mapOptions = {
      zoom: 19,
      center: myLatlng,
      scrollwheel: true,
      zoomControl: true,
      mapTypeId: 'hybrid',
      styles: [
        {
          featureType: "administrative",
          elementType: "labels.text.fill",
          stylers: [{ color: "#444444" }],
        },
        {
          featureType: "landscape",
          elementType: "all",
          stylers: [{ color: "#f2f2f2" }],
        },
        {
          featureType: "poi",
          elementType: "all",
          stylers: [{ visibility: "on" }],
        },
        {
          featureType: "road",
          elementType: "all",
          stylers: [{ saturation: -100 }, { lightness: 45 }],
        },
        {
          featureType: "road.highway",
          elementType: "all",
          stylers: [{ visibility: "simplified" }],
        },
        {
          featureType: "road.arterial",
          elementType: "labels.icon",
          stylers: [{ visibility: "on" }],
        },
        {
          featureType: "transit",
          elementType: "all",
          stylers: [{ visibility: "on" }],
        },
        {
          featureType: "water",
          elementType: "all",
          stylers: [{ color: "#5e72e4" }, { visibility: "off" }],
        },
      ],
    };

    map = new window.google.maps.Map(map, mapOptions);

    const marker = new window.google.maps.Marker({
      position: myLatlng,
      map: map,
      animation: window.google.maps.Animation.DROP,
      title: "Light Bootstrap Dashboard PRO React!",
    });

    const contentString =
      '<div class="info-window-content"><h2>Light Bootstrap Dashboard PRO React</h2>' +
      "<p>A premium Admin for React-Bootstrap, Bootstrap, React, and React Hooks.</p></div>";

    const infowindow = new window.google.maps.InfoWindow({
      content: contentString,
    });

    window.google.maps.event.addListener(marker, "click", function () {
      infowindow.open(map, marker);
    });
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user == null || !user || isTokenExpired()) {
      toast.info("You need to log in to continue!", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
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
      /// Check if the Google Maps API is already loaded
      if (window.google && window.google.maps){
        initMap(); // Call initMap directly
      } else {
        // Load the Google Maps JavaScript API asynchronously with a callback
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDudh0vzjI3X6lW92fBtW36F0PZRoezun4&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        // Clean up the script tag after the component is unmounted
        return () => {
          document.body.removeChild(script);
        };
      }
    }
  }, []);

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
