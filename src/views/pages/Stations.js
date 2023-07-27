import { useEffect, useRef, useState } from "react";
import { Button, Form, Modal, Table } from 'react-bootstrap';
import "../../style/Manager.css"
import defaultStation from '../../assets/img/station.png'
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  FormGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  InputGroup,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  CardFooter,
  Pagination,
  PaginationItem,
  PaginationLink,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import Header from "../../components/Headers/Header";
import {
  addStationAPI,
  updateStationAPI,
  getSingleStation,
  getMultiStationsAPI,
  getAllStations,
  deleteStationAPI,
  toggleStatusAPI,
} from "../../services/station";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateStation } from "../../redux/reducer";
import { isTokenExpired } from "../../services/checkToken";
import caution from '../../assets/img/caution.png'


const Stations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [stationList, setStationList] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showToggleStatus, setShowToggleStatus] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const markerRef = useRef(null);
  // const [display_name, setDisplay_name] = useState(null);
  const [markerPosition, setMarkerPosition] = useState({ lat: 10.84215, lng: 106.80963 });
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    addressNumber: "",
    street: "",
    ward: "",
    district: "",
    city: "",
    image: "",
    longitude: "",
    latitude: "",
  });

  // Check accessToken
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true);
      return;
    }
    getAllStations(user.accessToken)
      .then((res) => {
        if (res && res.data && res.data.data) {
          setStationList(res.data.data);
        } else {
          alert("Error: Invalid response data");
          return;
        }
      })
      .catch((error) => {
        alert("Error: " + error.message);
      });
  }, [navigate])

  // Fetch detail information and pass to detail form
  const fetchStationDetails = async (id) => {
    await getSingleStation(id)
      .then((res) => {
        setFormData(res.data);
        const { latitude, longitude } = res.data;
        setMarkerPosition({ lat: latitude, lng: longitude });
      });
  };

  // Fetch list of Station and pass to table
  const fetchStations = async () => {
    if (currentSearchStation !== "") {
      await getMultiStationsAPI({
        code: currentSearchStation,
      }).then((res) => {
        // console.log(res.data.data)
        if (res.data.data != null) {
          dispatch(updateStation(res.data.data))
        } else {
          dispatch(updateStation([]))
          setStationList([]);
        }
      })
    } else {
      await getAllStations()
        .then((res) => setStationList(res.data.data))
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handleShowDetails = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    await fetchStationDetails(id);
    setShowDetails(true); // Show the modal
  }

  // --UPDATE FUNCTIONS
  const handleUpdateClose = () => {
    setShowUpdate(false);
    setErrors({});
    setNewMarkerPosition(null);
  }

  const handleUpdateShow = async (station) => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    await fetchStationDetails(station.id); // fetch old data
    setShowUpdate(true); // show update modal
    setIsUpdated(false);
    setErrors({});
  };

  const updateStationData = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    if (!isUpdated) {
      toast.info("Nothing has been changed!", {
        autoClose: 1000,
      });
      setShowUpdate(true);
      return;
    }
    updateStationAPI(formData, formData.id)
      .then((res) => {
        // console.log(res);
        if (res.status === 200) {
          toast.success("Station update successfully!", {
            autoClose: 1000,
          });
        }
        setShowUpdate(false);
        fetchStations();
      })
      .catch((e) => {
        if (e.response.data.errors) {
          setErrors(e.response.data.errors);
        }
        toast.error("Failed to update the station!", {
          autoClose: 1000,
        });
        setShowUpdate(true);

      })
  }
  // END UPDATE FUNCTIONS

  // TOGGLE STATUS FUNCTION
  const [oldStatus, setOldStatus] = useState("");
  const [toggleStationId, setToggleStationId] = useState(null);
  const handleToggleStatus = (station) => {
    setOldStatus(station.status)
    setToggleStationId(station.id)
    setShowToggleStatus(true);
  }
  const toggleStatus = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    let status = "INACTIVE";
    if (oldStatus === "INACTIVE") {
      status = "ACTIVE"
    }
    toggleStatusAPI(toggleStationId, status)
      .then((res) => {
        toast.success("Successull to enable/disable status!", {
          autoClose: 1000,
        });
        setShowToggleStatus(false);
        fetchStations()
      })
      .catch(() => {
        toast.error("Failed to enable/disable status!", {
          autoClose: 1000,
        });
        setShowToggleStatus(false);
      });
  }
  // END TOGGLE STATUS

  // DELETE FUNCTIONS
  const [deleteStationId, setDeleteStationId] = useState();
  const handleDeleteStation = (id) => {
    setDeleteStationId(id)
    setShowDelete(true)
  };
  const deleteStation = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    deleteStationAPI(deleteStationId)
      .then((res) => {
        if (res.status === 200) {
          // console.log(res)
          toast.success("Station deleted successfully!", {
            autoClose: 1000,
          });
        }
        setShowDelete(false);
        fetchStations();
      })
      .catch(() => {
        toast.error("Failed to delete the station!", {
          autoClose: 1000,
        });
      });
  }
  // END DELETE FUNCTIONS

  // ADD
  const handleAddStation = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    addStationAPI(formData)
      .then((res) => {
        // console.log(res);
        if (res.status === 200) {
          toast.success("Station has been add successfully!", {
            autoClose: 1000,
          });
          fetchStations()
          setShowAdd(false);
        }
      })
      .catch((e) => {
        if (e.response.data.errors) {
          setErrors(e.response.data.errors);
        }
        toast.error("Failed to add this station!", {
          autoClose: 1000,
        });
        setShowAdd(true);
      });
  };
  const handleAddClose = () => {
    setShowAdd(false);
    setNewMarkerPosition(null);
    setErrors({});
  }
  const handleAddOpen = () => {
    setFormData({
      name: "",
      code: "",
      addressNumber: "",
      street: "",
      ward: "",
      district: "",
      city: "",
      image: "",
      longitude: "",
      latitude: "",
    });
    setMarkerPosition({ lat: 10.84215, lng: 106.80963 });
    setShowAdd(true);
    setErrors({});
  };
  // END ADD

  // EXPIRED
  const handleLogoutClose = () => {
    navigate("/auth/login");
    localStorage.removeItem('user');
    toast.success("Logout successful", {
      autoClose: 1000,
    });
    setShowBackdrop(false);
  }

  // PAGING
  const itemsPerPage = 5;
  const [currentStationList, setCurrentStationList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setTotalPages(Math.ceil(stationList.length / itemsPerPage));
    setStartIndex((currentPage - 1) * itemsPerPage);
  }, [stationList, currentPage]);

  useEffect(() => {
    setEndIndex(startIndex + itemsPerPage);
    setCurrentStationList(stationList.slice(startIndex, endIndex));
  }, [stationList, startIndex, endIndex]);

  useEffect(() => {
    setCurrentPage(1);
  }, [stationList.length]);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // END PAGING

  // REDUX
  const stations = useSelector((state) => state.stations.value);
  const currentSearchStation = useSelector((state) => state.stations.currentSearchStation);
  useEffect(() => {
    setStationList(stations)
  }, [stations])
  // END REDUX

  //MAPPING

  const handleShowMap = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    } else {
      setShowMap(true);
    }
  }

  const fetchAddress = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (response.status === 200) {
        // setDisplay_name(response.data.display_name);
        setFormData((prevFormData) => ({
          ...prevFormData,
          city: response.data.address.city,
          street: response.data.address.road,
          ward: response.data.address.suburb,
          district: response.data.address.state,
        }));
        console.log(response.data);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const createCustomIcon = (name, image) =>
    L.divIcon({
      className: "custom-icon",
      iconAnchor: [15, 30],
      html: `
      <div class="${highlightedMarker === name ? 'highlighted' : ''}">
        <h1 style="background-color: #aad3df; border-radius: 8px; padding: 3px; border: 1px solid rgba(0, 0, 0, 0.2);">${name}</h1>        
        <img src="${defaultStation}" alt="${name}" class="custom-icon-img">        
      </div>
    `,
    });

  const [mapCenter, setMapCenter] = useState({ lat: 10.840903, lng: 106.809889 });

  // Function to calculate the center and zoom level of the map to fit all markers
  const calculateCenterAndZoom = (markers) => {
    if (markers.length === 0) {
      setMapCenter({ lat: 10.840903, lng: 106.809889 }); // Default center if no markers
      return;
    }

    let minLat = markers[0].latitude;
    let maxLat = markers[0].latitude;
    let minLng = markers[0].longitude;
    let maxLng = markers[0].longitude;

    markers.forEach((marker) => {
      minLat = Math.min(minLat, marker.latitude);
      maxLat = Math.max(maxLat, marker.latitude);
      minLng = Math.min(minLng, marker.longitude);
      maxLng = Math.max(maxLng, marker.longitude);
    });

    const centerLat = (maxLat + minLat) / 2;
    const centerLng = (maxLng + minLng) / 2;

    setMapCenter({ lat: centerLat, lng: centerLng });
  };

  // Use useEffect to calculate the center and zoom level whenever the stationList changes
  useEffect(() => {
    calculateCenterAndZoom(stationList);
  }, [stationList]);

  // const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add an async function to fetch data
  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || isTokenExpired()) {
        setLoading(false);
        return;
      }

      const response = await getAllStations(user.accessToken);
      if (response && response.data && response.data.data) {
        setStationList(response.data.data);
      } else {
        alert("Error: Invalid response data");
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Use useEffect to fetch data and update map instance
  useEffect(() => {
    fetchData();
  }, []);


  const mapRef = useRef(null);
  const handleMapCenterAndZoom = (latitude, longitude) => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    if (mapRef.current) {
      mapRef.current.setView([latitude, longitude], 13);
      const container = mapRef.current.getContainer();
      const containerRect = container.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const yOffset = containerRect.top + scrollTop - 100;
      window.scrollTo({
        top: yOffset,
        behavior: "smooth",
      });
    }
  };

  const [highlightedMarker, setHighlightedMarker] = useState(null);
  const handleMarkerClick = (name) => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    setHighlightedMarker(name);
    setTimeout(() => {
      setHighlightedMarker(null);
    }, 3000);
  };

  const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search?";
  const [listPlace, setListPlace] = useState([]);

  const handleSearchLocation = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const searchString = e.target.value;
      const params = {
        q: searchString,
        format: "json",
        addressdetails: 1,
        polygon_geojson: 0,
      };
      const queryString = new URLSearchParams(params).toString();
      const requestOptions = {
        method: "GET",
        redirect: "follow",
      };
      fetch(`${NOMINATIM_BASE_URL}${queryString}`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
          if (result && result.length > 0) {
            setListPlace(result);
          } else {
            toast.warn("Can not find this location", {
              autoClose: 1000,
            });
          }
        })
        .catch((err) => console.log("err: ", err));
    }

  }

  const [searchedLocation, setSearchedLocation] = useState(null);

  // Function to handle the user selecting a location from the search results
  const handleSelectLocation = (item) => {
    // Update both searchedLocation and markerPosition states
    setSearchedLocation({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    });
    setListPlace([]);
    fetchAddress(parseFloat(item.lat), parseFloat(item.lon));
  };

  useEffect(() => {
    if (searchedLocation) {
      setNewMarkerPosition({
        lat: parseFloat(searchedLocation.lat),
        lng: parseFloat(searchedLocation.lng),
      });
    }
  }, [searchedLocation]);

  function ResetCenterView(props) {
    const { selectPosition } = props;
    const map = useMap();

    useEffect(() => {
      if (selectPosition) {
        map.setView(L.latLng(selectPosition.lat, selectPosition.lng), map.getZoom(), {
          animate: true,
        });
      }
    }, [selectPosition, map]);

    return null;
  }

  const [newMarkerPosition, setNewMarkerPosition] = useState(null);

  // Function to handle marker movement
  const handleMarkerMove = (e) => {
    const { lat, lng } = e.target.getLatLng();
    setNewMarkerPosition({ lat, lng }); // Store the new position in a separate state
    fetchAddress(lat, lng);
  };



  // Function to confirm the new location and update the marker position
  const handleConfirmLocation = () => {
    if (newMarkerPosition) {
      setMarkerPosition(newMarkerPosition); // Update the markerPosition state with the new position
      setFormData((prevFormData) => ({
        ...prevFormData,
        latitude: newMarkerPosition.lat,
        longitude: newMarkerPosition.lng,
      }));
    }
    setShowConfirm(false)
    setShowMap(false); // Close the map modal
  };

  // Add a new useEffect hook to listen for changes in the formData state and update the markerPosition state
  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      setMarkerPosition({ lat: formData.latitude, lng: formData.longitude });
    }
  }, [formData]);
  const activeStations = stationList.filter((station) => station.status === 'ACTIVE');

  //END MAPPING


  return (
    <>
      <Header />
      <ToastContainer />
      <Container className="mt--7" fluid>
        <Row >
          <div className="col">
            <Card className=" card-container shadow">
              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Manager Stations</h3>
              </CardHeader>
              <CardBody>
                <Modal dialogClassName="modal-map" show={showMap} backdrop="static" onHide={() => setShowMap(false)} animation={true}>
                  <Modal.Header>
                    <h3 className="mb-0">Map For Station</h3>
                    <Form className="navbar-search navbar-search-dark form-inline mr-3 d-none d-md-flex ml-lg-auto ">
                      <FormGroup className="mb-0">
                        <InputGroup className="input-group-alternative bg-default shadow">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="fas fa-search" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input placeholder="Search" type="text" onKeyPress={handleSearchLocation} />
                        </InputGroup>
                      </FormGroup>
                    </Form>
                    <ListGroup className="search-results" style={{ position: "absolute", zIndex: 999, width: "314.2px", marginTop: "82px", right: 35 }}>
                      {listPlace.map((item) => (
                        <ListGroupItem
                          color="success"
                          key={item?.place_id}
                          tag="a"
                          action
                          style={{ cursor: "pointer" }}
                          onClick={() => handleSelectLocation(item)}
                        >
                          {item?.display_name}
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  </Modal.Header>
                  <Modal.Body className="modal-map-body">
                    <MapContainer
                      center={newMarkerPosition || markerPosition}
                      zoom={15}
                      scrollWheelZoom={true}
                      zoomControl={true}
                      style={{ height: "calc(80vh)", borderRadius: "5px" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                      />
                      <Marker
                        position={[newMarkerPosition?.lat || markerPosition.lat, newMarkerPosition?.lng || markerPosition.lng]}
                        draggable={true}
                        eventHandlers={{
                          dragend: handleMarkerMove, // Call handleMarkerMove function when the marker is dragged
                        }}
                        ref={markerRef}
                        icon={createCustomIcon(formData.name, formData.image)}
                      >
                      </Marker>
                      <ResetCenterView selectPosition={newMarkerPosition || markerPosition} />
                    </MapContainer>
                    <Button className="button" variant="primary" onClick={() => setShowConfirm(true)}>
                      Continue
                    </Button>
                  </Modal.Body>
                </Modal>

                <Modal show={showConfirm} onHide={() => setShowConfirm(false)} animation={true}>
                  <Modal.Body>
                    <h2>Are you sure you want to choose this location?</h2>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={handleConfirmLocation}>
                      Confirm
                    </Button>
                  </Modal.Footer>
                </Modal>

                <Modal
                  show={showBackdrop}
                  onHide={() => setShowBackdrop(false)}
                  animation={true}
                  dialogClassName="modal-logout"
                  backdrop="static"
                >
                  <Modal.Body className="modal-logout-body">
                    <h2>YOUR LOGIN TIMEOUT HAS EXPIRED,<br />PLEASE LOGIN AGAIN TO CONTINUE!</h2>
                    <img className="img" src={caution} alt="" />

                    <Button className="button" color="primary" onClick={handleLogoutClose}>
                      OK
                    </Button>
                  </Modal.Body>
                </Modal>

                <Modal show={showToggleStatus} onHide={() => setShowToggleStatus(false)} animation={true}>
                  <Modal.Header >
                    <Modal.Title>Enable/Disable station</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to enable/disable this station?</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowToggleStatus(false)}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={toggleStatus}>
                      Enable/Disable
                    </Button>
                  </Modal.Footer>
                </Modal>

                <Modal show={showDelete} onHide={() => setShowDelete(false)} animation={true}>
                  <Modal.Header >
                    <Modal.Title>Delete station</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to delete this station?</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDelete(false)}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={() => deleteStation()}>
                      Delete
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Add model */}
                <Modal size="lg" show={showAdd} onHide={handleAddClose}>
                  <Modal.Header >
                    <Modal.Title>Add Station</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" >
                        <Button variant="primary" size="sm" onClick={() => handleShowMap()}>
                          Add Location
                        </Button>
                      </Form.Group>
                      <Row>
                        <Col>
                          <Form.Group className="mb-3" controlId="latitude">
                            <Form.Label>Latitude</Form.Label>
                            {errors && errors.Latitude && (
                              <span style={{ color: "red", float: "right" }}>*{errors.Latitude[0]}</span>
                            )}
                            <Form.Control
                              type="number"
                              name="latitude"
                              placeholder="Latitude"
                              value={formData.latitude}
                              readOnly
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3" controlId="longitude">
                            <Form.Label>Longitude</Form.Label>
                            {errors && errors.Longitude && (
                              <span style={{ color: "red", float: "right" }}>*{errors.Longitude[0]}</span>
                            )}
                            <Form.Control
                              type="number"
                              name="longitude"
                              placeholder="Longitude"
                              value={formData.longitude}
                              readOnly
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <Form.Group className="mb-3" controlId="ward">
                            <Form.Label>Ward</Form.Label>
                            {errors && errors.Ward && (
                              <span style={{ color: "red", float: "right" }}>*{errors.Ward[0]}</span>
                            )}
                            <Form.Control
                              type="text"
                              name="ward"
                              placeholder="Ward"
                              readOnly
                              value={formData.ward}
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3" controlId="street">
                            <Form.Label>Street</Form.Label>
                            {errors && errors.Street && (
                              <span style={{ color: "red", float: "right" }}>*{errors.Street[0]}</span>
                            )}
                            <Form.Control
                              type="text"
                              name="street"
                              placeholder="Street"
                              readOnly
                              value={formData.street}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <Form.Group className="mb-3" controlId="city">
                            <Form.Label>City</Form.Label>
                            {errors && errors.City && (
                              <span style={{ color: "red", float: "right" }}>*{errors.City[0]}</span>
                            )}
                            <Form.Control
                              type="text"
                              name="city"
                              placeholder="City"
                              readOnly
                              value={formData.city}
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3" controlId="image">
                            <Form.Label>Image</Form.Label>
                            <Form.Control
                              type="file"
                              name="image"
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  image: e.target.files[0] // Store the selected file in the form data
                                });
                              }}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <Form.Group className="mb-3" controlId="code">
                            <Form.Label>Code</Form.Label>
                            {errors && errors.Code && (
                              <span style={{ color: "red", float: "right" }}>*{errors.Code[0]}</span>
                            )}
                            <Form.Control
                              type="text"
                              name="code"
                              placeholder="Code"
                              autoFocus
                              required
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  code: e.target.value
                                });
                                setErrors({
                                  ...errors,
                                  Code: null
                                });
                              }}
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3" controlId="name">
                            <Form.Label>Name</Form.Label>
                            {errors && errors.Name && (
                              <span style={{ color: "red", float: "right" }}>*{errors.Name[0]}</span>
                            )}
                            <Form.Control
                              type="text"
                              name="name"
                              placeholder="Name"
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  name: e.target.value
                                });
                                setErrors({
                                  ...errors,
                                  Name: null
                                });
                              }}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={7}>
                          <Form.Group className="mb-3" controlId="addressNumber">
                            <Form.Label>Address Number</Form.Label>
                            {errors && errors.AddressNumber && (
                              <span style={{ color: "red", float: "right" }}>*{errors.AddressNumber[0]}</span>
                            )}
                            <Form.Control
                              type="text"
                              name="addressNumber"
                              placeholder="Address Number"
                              autoFocus
                              required
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  addressNumber: e.target.value
                                });
                                setErrors({
                                  ...errors,
                                  AddressNumber: null
                                });
                              }}
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={5}>
                          <Form.Group className="mb-3" controlId="district">
                            <Form.Label>District</Form.Label>
                            {errors && errors.District && (
                              <span style={{ color: "red", float: "right" }}>*{errors.District[0]}</span>
                            )}
                            <Form.Control
                              type="text"
                              name="district"
                              placeholder="District"
                              autoFocus
                              required
                              value={formData.district}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  district: e.target.value
                                });
                                setErrors({
                                  ...errors,
                                  District: null
                                });
                              }}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleAddClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={handleAddStation}>
                      Add +
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Detail model */}
                <Modal size="lg" show={showDetails} onHide={() => setShowDetails(false)}>
                  <Modal.Header>
                    <Modal.Title>Station detail</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Container>
                      <Form>
                        <Form.Group className="mb-3 d-flex justify-content-center align-items-center" >
                          {formData.image ? (
                            <img className="station-img" src={formData.image} alt="" />
                          ) : null
                          }
                        </Form.Group>
                        <Row>
                          <Col>
                            <Form.Group className="mb-3" controlId="code">
                              <Form.Label>Code</Form.Label>
                              <Form.Control type="text" name="code" placeholder="Code" readOnly value={formData.code} />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mb-3" controlId="name">
                              <Form.Label>Name</Form.Label>
                              <Form.Control type="text" name="name" placeholder="Name" readOnly value={formData.name} />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Form.Group className="mb-3" controlId="addressNumber">
                              <Form.Label>Address Number</Form.Label>
                              <Form.Control type="text" name="addressNumber" placeholder="Address Number" readOnly value={formData.addressNumber} />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mb-3" controlId="street">
                              <Form.Label>Street</Form.Label>
                              <Form.Control type="text" name="street" placeholder="Street" readOnly value={formData.street} />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Form.Group className="mb-3" controlId="ward">
                              <Form.Label>Ward</Form.Label>
                              <Form.Control type="text" name="ward" placeholder="Ward" readOnly value={formData.ward} />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mb-3" controlId="district">
                              <Form.Label>District</Form.Label>
                              <Form.Control type="text" name="district" placeholder="District" readOnly value={formData.district} />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Form.Group className="mb-3" controlId="city">
                              <Form.Label>City</Form.Label>
                              <Form.Control type="text" name="city" placeholder="City" readOnly value={formData.city} />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mb-3" controlId="latitude">
                              <Form.Label>Latitude</Form.Label>
                              <Form.Control type="number" name="latitude" placeholder="Latitude" readOnly value={formData.latitude} />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mb-3" controlId="longitude">
                              <Form.Label>Longitude</Form.Label>
                              <Form.Control type="number" name="longitude" placeholder="Longitude" readOnly value={formData.longitude} />
                            </Form.Group>
                          </Col>
                        </Row>

                      </Form>
                    </Container>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetails(false)}>
                      Close
                    </Button>
                  </Modal.Footer>
                </Modal>



                {/* Update model */}
                <Modal size="lg" show={showUpdate} onHide={handleUpdateClose}>
                  <Modal.Header >
                    <Modal.Title>Update station</Modal.Title>

                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" >
                        <Button variant="primary" size="sm" onClick={() => {handleShowMap(); setIsUpdated(true)}}>
                          Change Location
                        </Button>
                      </Form.Group>
                      <Row>
                        <Col>
                          <Form.Group className="mb-3" controlId="latitude">
                            <Form.Label>Latitude</Form.Label>
                            {errors && errors.Latitude && (
                              <span style={{ color: "red", float: "right" }}>*{errors.Latitude[0]}</span>
                            )}
                            <Form.Control
                              type="number"
                              name="latitude"
                              placeholder="Latitude"
                              value={formData.latitude}
                              readOnly
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3" controlId="longitude">
                            <Form.Label>Longitude</Form.Label>
                            {errors && errors.Longitude && (
                              <span style={{ color: "red", float: "right" }}>*{errors.Longitude[0]}</span>
                            )}
                            <Form.Control
                              type="number"
                              name="longitude"
                              placeholder="Longitude"
                              value={formData.longitude}
                              readOnly
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <Form.Group className="mb-3" controlId="ward">
                            <Form.Label>Ward</Form.Label>
                            {errors && errors.Ward && (
                              <span style={{ color: "red", float: "right" }}>*{errors.Ward[0]}</span>
                            )}
                            <Form.Control
                              type="text"
                              name="ward"
                              placeholder="Ward"
                              readOnly
                              value={formData.ward}
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3" controlId="street">
                            <Form.Label>Street</Form.Label>
                            {errors && errors.Street && (
                              <span style={{ color: "red", float: "right" }}>*{errors.Street[0]}</span>
                            )}
                            <Form.Control
                              type="text"
                              name="street"
                              placeholder="Street"
                              readOnly
                              value={formData.street}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <Form.Group className="mb-3" controlId="city">
                            <Form.Label>City</Form.Label>
                            {errors && errors.City && (
                              <span style={{ color: "red", float: "right" }}>*{errors.City[0]}</span>
                            )}
                            <Form.Control
                              type="text"
                              name="city"
                              placeholder="City"
                              readOnly
                              value={formData.city}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  city: e.target.value
                                });
                                setErrors({
                                  ...errors,
                                  City: null
                                });
                              }}
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3" controlId="image">
                            <Form.Label>Image</Form.Label>
                            <Form.Control
                              type="file"
                              name="image"
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  image: e.target.files[0] // Store the selected file in the form data
                                });
                                setIsUpdated(true);
                              }}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <Form.Group className="mb-3" controlId="code">
                            <Form.Label>Code</Form.Label>
                            {errors && errors.Code && (
                              <span style={{ color: "red", float: "right" }}>*{errors.Code[0]}</span>
                            )}
                            <Form.Control
                              type="text"
                              name="code"
                              placeholder="Code"
                              autoFocus
                              required
                              value={formData.code}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  code: e.target.value
                                });
                                setErrors({
                                  ...errors,
                                  Code: null
                                });
                                setIsUpdated(true);
                              }}
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3" controlId="name">
                            <Form.Label>Name</Form.Label>
                            {errors && errors.Name && (
                              <span style={{ color: "red", float: "right" }}>*{errors.Name[0]}</span>
                            )}
                            <Form.Control
                              type="text"
                              name="name"
                              placeholder="Name"
                              value={formData.name}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  name: e.target.value
                                });
                                setErrors({
                                  ...errors,
                                  Name: null
                                });
                                setIsUpdated(true);
                              }}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={7}>
                          <Form.Group className="mb-3" controlId="addressNumber">
                            <Form.Label>Address Number</Form.Label>
                            {errors && errors.AddressNumber && (
                              <span style={{ color: "red", float: "right" }}>*{errors.AddressNumber[0]}</span>
                            )}
                            <Form.Control
                              type="text"
                              name="addressNumber"
                              placeholder="Address Number"
                              autoFocus
                              required
                              value={formData.addressNumber}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  addressNumber: e.target.value
                                });
                                setErrors({
                                  ...errors,
                                  AddressNumber: null
                                });
                                setIsUpdated(true);
                              }}
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={5}>
                          <Form.Group className="mb-3" controlId="district">
                            <Form.Label>District</Form.Label>
                            {errors && errors.District && (
                              <span style={{ color: "red", float: "right" }}>*{errors.District[0]}</span>
                            )}
                            <Form.Control
                              type="text"
                              name="district"
                              placeholder="District"
                              autoFocus
                              required
                              value={formData.district}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  district: e.target.value
                                });
                                setErrors({
                                  ...errors,
                                  District: null
                                });
                                setIsUpdated(true);
                              }}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleUpdateClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={updateStationData}>
                      Confirm
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Table list */}
                <div className="list">
                  <Button variant="primary" onClick={handleAddOpen} className="add_button">Add Station +</Button>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Code</th>
                        <th>Name</th>
                        <th>District</th>
                        <th>City</th>
                        <th>Status</th>
                        <th>More Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStationList.map((station, index) => (
                        <tr key={index}>
                          <td>
                            <span>{station.id ? station.id : "none"}</span>
                          </td>
                          <td>
                            <span className="link-style" onClick={(e) => {
                              e.preventDefault()
                              handleMapCenterAndZoom(station.latitude, station.longitude);
                              handleMarkerClick(station.name)
                            }}>{station.code ? station.code : "none"}</span>

                          </td>
                          <td>
                            <span className="link-style" onClick={(e) => {
                              e.preventDefault()
                              handleMapCenterAndZoom(station.latitude, station.longitude);
                              handleMarkerClick(station.name)
                            }}>{station.name ? station.name : "none"}</span>
                          </td>
                          <td>
                            <span className="link-style" onClick={(e) => {
                              e.preventDefault()
                              handleMapCenterAndZoom(station.latitude, station.longitude);
                              handleMarkerClick(station.name)
                            }}>{station.district ? station.district : "none"}</span>
                          </td>
                          <td>
                            <span className="link-style" onClick={(e) => {
                              e.preventDefault()
                              handleMapCenterAndZoom(station.latitude, station.longitude);
                              handleMarkerClick(station.name)
                            }}>{station.city ? station.city : "none"}</span>
                          </td>
                          <td>
                            <span className={`status ${station.status === 'ACTIVE' ? 'active' : station.status === 'INACTIVE' ? 'inactive' : ''}`}>
                              {station.status}
                            </span>
                          </td>
                          <td className="registration">
                            <UncontrolledDropdown>
                              <DropdownToggle
                                className="btn-icon-only text-light"
                                role="button"
                                size="sm"
                                color=""
                              >
                                <i className="fas fa-ellipsis-v" />
                              </DropdownToggle>
                              <DropdownMenu className="dropdown-menu-arrow" >
                                <DropdownItem
                                  className="update-dropdown-item"
                                  onClick={() => handleUpdateShow(station)}
                                >
                                  Update
                                </DropdownItem>
                                <DropdownItem
                                  className="disable-enable-dropdown-item"
                                  onClick={() => {
                                    handleToggleStatus(station)
                                  }}
                                >
                                  Enable/Disable
                                </DropdownItem>
                                <DropdownItem
                                  className="delete-dropdown-item"
                                  onClick={() => handleDeleteStation(station.id)}
                                >
                                  Delete
                                </DropdownItem>
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
              <CardFooter className="py-4">
                <nav aria-label="...">
                  <Pagination
                    className="pagination justify-content-end mb-0"
                    listClassName="justify-content-end mb-0"
                  >
                    <PaginationItem disabled={currentPage === 1}>
                      <PaginationLink
                        href=""
                        onClick={() => handlePageClick(currentPage - 1)}
                        tabIndex="-1"
                      >
                        <i className="fas fa-angle-left" />
                        <span className="sr-only">Previous</span>
                      </PaginationLink>
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, index) => (
                      <PaginationItem
                        key={index + 1}
                        active={currentPage === index + 1}
                      >
                        <PaginationLink
                          href=""
                          onClick={() => handlePageClick(index + 1)}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem disabled={currentPage === totalPages}>
                      <PaginationLink
                        href=""
                        onClick={() => handlePageClick(currentPage + 1)}
                      >
                        <i className="fas fa-angle-right" />
                        <span className="sr-only">Next</span>
                      </PaginationLink>
                    </PaginationItem>
                  </Pagination>
                </nav>
              </CardFooter>
            </Card>
          </div>
        </Row>
        <Row className="mt-5">
          <div className="col">
            <Card className=" card-container shadow">
              <CardBody>
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <MapContainer
                    ref={mapRef}
                    center={mapCenter}
                    zoom={13}
                    scrollWheelZoom={false}
                    zoomControl={true}
                    style={{ height: "calc(80vh)", borderRadius: "5px" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                    />

                    {activeStations.map((station) => (
                      <Marker
                        key={station.id}
                        position={[station.latitude, station.longitude]}
                        icon={createCustomIcon(station.name, station.image)}
                        ref={markerRef}
                      >
                        <Popup>
                          <div className="station-popup">
                            <h3>Click to see detail</h3>
                            <button className="custom-popup-button" onClick={() => handleShowDetails(station.id)}>OPEN</button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                )}
              </CardBody>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Stations;