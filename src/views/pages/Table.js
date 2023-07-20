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

const Test = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [stationList, setStationList] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showToggleStatus, setShowToggleStatus] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const markerRef = useRef(null);
  const [display_name, setDisplay_name] = useState(null);
  const [markerPosition, setMarkerPosition] = useState({ lat: 10.840903, lng: 106.809889 });
  const [markerDraggable, setMarkerDraggable] = useState(false);
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
      return;
    } else {
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
    }

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
    if (isTokenExpired()) {
      toast("You need to log in again to continue!", {
        autoClose: 1000,
        onClose: () => {
          navigate("/auth/login");
        },
      });
    } else {
      await fetchStationDetails(id);
      setShowDetails(true); // Show the modal
    }
  }

  // --UPDATE FUNCTIONS
  const handleUpdateClose = () => {
    setShowUpdate(false);
    setNewMarkerPosition(null);
  }

  const handleUpdateShow = async (station) => {
    if (isTokenExpired()) {
      toast("You need to log in again to continue!", {
        autoClose: 1000,
        onClose: () => {
          navigate("/auth/login");
        },
      });
    } else {
      await fetchStationDetails(station.id); // fetch old data
      setShowUpdate(true); // show update modal
    }
  };

  const updateStationData = () => {
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
        if (e.response && e.response.status === 401) {
          toast.error("You need to log in again to continue!", {
            autoClose: 1000,
          });
          navigate("/auth/login");
        } else {
          toast.error("Failed to update the station!", {
            autoClose: 1000,
          });
          setShowUpdate(true);
        }
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
      .catch((e) => {
        if (e.response && e.response.status === 401) {
          toast.error("You need to log in again to continue!", {
            autoClose: 1000,
          });
          navigate("/auth/login");
        } else {
          toast.error("Failed to enable/disable status!", {
            autoClose: 1000,
          });
          setShowToggleStatus(false);
        }
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
      .catch((e) => {
        if (e.response && e.response.status === 401) {
          toast.error("You need to log in again to continue!", {
            autoClose: 1000,
          });
          navigate("/auth/login");
        } else {
          toast.error("Failed to delete the station!", {
            autoClose: 1000,
          });
        }
      });
  }
  // END DELETE FUNCTIONS

  // ADD
  const handleAddStation = () => {
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
        if (e.response && e.response.status === 401) {
          toast.error("You need to log in again to continue!", {
            autoClose: 1000,
          });
          navigate("/auth/login");
        } else {
          toast.error("Failed to add this station!", {
            autoClose: 1000,
          });
          setShowAdd(true);
        }
      });
  };
  const handleAddClose = () => {
    setShowAdd(false);
    setNewMarkerPosition(null);
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
    })
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
    setShowAdd(true);
  };
  // END ADD

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
  const handleShowNewMap = () => {
    if (isTokenExpired()) {
      toast("You need to log in again to continue!", {
        autoClose: 1000,
        onClose: () => {
          navigate("/auth/login");
        },
      });
    } else {
      setMarkerPosition({ lat: 10.840903, lng: 106.809889 });
      setShowMap(true);
    }
  }

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${markerPosition.lat}&lon=${markerPosition.lng}&zoom=18&addressdetails=1`
        );
        if (response.status === 200) {
          const display_name = response.data.display_name;
          // setAddress(response.data);
          setDisplay_name(display_name)

        }
      } catch (error) {
        console.log("Error:", error);
      }
    };

    fetchAddress();
  }, [markerPosition]);

  const createCustomIcon = (name, image) =>
    L.divIcon({
      className: "custom-icon",
      iconAnchor: [15, 30],
      html: `
      <div class="${highlightedMarker === name ? 'highlighted' : ''}">
        <h1>${name}</h1>        
        <img src="${image || defaultStation}" alt="${name}" class="custom-icon-img">        
      </div>
    `,
    });




  // Calculate the center point of all markers in the current displayed stations
  const calculateCenter = () => {
    if (stationList.length === 0) {
      return [10.840903, 106.809889]; // Default center if no markers
    }

    const latSum = stationList.reduce((sum, station) => sum + station.latitude, 0);
    const lngSum = stationList.reduce((sum, station) => sum + station.longitude, 0);
    const centerLat = latSum / stationList.length;
    const centerLng = lngSum / stationList.length;

    return [centerLat, centerLng];
  };

  const [map, setMap] = useState(null);
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

  // Use useEffect to update the map's center and bounds whenever the stationList changes
  useEffect(() => {
    if (map && stationList.length > 0) {
      const markersBounds = L.latLngBounds(stationList.map((station) => [station.latitude, station.longitude]));
      map.fitBounds(markersBounds);
    }
  }, [map, stationList]);

  const mapRef = useRef(null);
  const handleMapCenterAndZoom = (latitude, longitude) => {
    if (mapRef.current) {
      mapRef.current.setView([latitude, longitude], 14);
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
          console.log(result)
          setListPlace(result);
        })
        .catch((err) => console.log("err: ", err));
    }

  }

  const handleSelectLocation = (item) => {
    // Set the marker position to the selected location
    setMarkerPosition({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    });
    // Close the search results list
    setListPlace([]);
  };

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
        <Row className="mt-5">
          <div className="col">
            <Card className=" card-container shadow">
              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Manager Stations</h3>
              </CardHeader>
              <CardBody>
                <Modal dialogClassName="modal-map" show={showMap} backdrop="static" onHide={() => setShowMap(false)} animation={true}>
                  <Modal.Header>
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
                        draggable={true} // Set draggable to true to enable marker movement
                        eventHandlers={{
                          dragend: handleMarkerMove, // Call handleMarkerMove function when the marker is dragged
                        }}
                        ref={markerRef}
                        icon={createCustomIcon(formData.name, formData.image)}
                      />
                      <ResetCenterView selectPosition={newMarkerPosition || markerPosition} />
                    </MapContainer>
                    <Button className="button" variant="primary" onClick={handleConfirmLocation}>
                      Confirm
                    </Button>
                    <Button className="button" variant="secondary" onClick={() => setShowMap(false)}>
                      Close
                    </Button>
                  </Modal.Body>
                </Modal>

                {/* Add model */}
                <Modal show={showAdd} onHide={handleAddClose}>
                  <Modal.Header >
                    <Modal.Title>Add station</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="code">
                        <Form.Label>Code</Form.Label>
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
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          placeholder="Name"
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              name: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="addressNumber">
                        <Form.Label>Address Number</Form.Label>
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
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="street">
                        <Form.Label>Street</Form.Label>
                        <Form.Control
                          type="text"
                          name="street"
                          placeholder="Street"
                          autoFocus
                          required
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              street: e.target.value
                            });
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="ward">
                        <Form.Label>Ward</Form.Label>
                        <Form.Control
                          type="text"
                          name="ward"
                          placeholder="Ward"
                          autoFocus
                          required
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              ward: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="district">
                        <Form.Label>District</Form.Label>
                        <Form.Control
                          type="text"
                          name="district"
                          placeholder="District"
                          autoFocus
                          required
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              district: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="city">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          placeholder="City"
                          autoFocus
                          required
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              city: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" >
                        <Button variant="primary" size="sm" onClick={() => { handleShowNewMap(); setMarkerDraggable(true); }}>
                          Add Location
                        </Button>
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="latitude">
                        <Form.Label>Latitude</Form.Label>
                        <Form.Control
                          type="number"
                          name="latitude"
                          placeholder="Latitude"
                          value={formData.latitude}
                          readOnly
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              latitude: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="longitude">
                        <Form.Label>Longitude</Form.Label>
                        <Form.Control
                          type="number"
                          name="longitude"
                          placeholder="Longitude"
                          value={formData.longitude}
                          readOnly
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              longitude: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
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
              </CardBody>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Test;