import { useEffect, useRef, useState } from "react";
import { Button, Form, Modal, Table } from 'react-bootstrap';
import "../../style/Manager.css"
import defaultStation from '../../assets/img/station.png'
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";

import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  CardFooter,
  Pagination,
  PaginationItem,
  PaginationLink,
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
  const markerRef = useRef(null);
  const [address, setAddress] = useState(null);
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
      toast("You need to log in to continue!", {
        autoClose: 1000,
        onClose: () => {
          navigate("/auth/login");
        },
      });
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
  const fetchStationDetails = (id) => {
    getSingleStation(id)
      .then((res) => {
        setFormData(res.data);
        const { latitude, longitude } = res.data;
        setMarkerPosition({ lat: latitude, lng: longitude });
      });
  };

  // Fetch list of Station and pass to table
  const fetchStations = () => {
    if (currentSearchStation !== "") {
      getMultiStationsAPI({
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
      getAllStations()
        .then((res) => setStationList(res.data.data))
        .catch((error) => {
          console.log(error);
        });
    }
  };


  // --UPDATE FUNCTIONS
  const handleUpdateClose = () => {
    setShowUpdate(false);
  }
  const handleUpdateShow = (station) => {
    if (isTokenExpired()) {
      toast("You need to log in again to continue!", {
        autoClose: 1000,
        onClose: () => {
          navigate("/auth/login");
        },
      });
    } else {
      fetchStationDetails(station.id); // fetch old data
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
  const handleMarkerMove = (e) => {
    const { lat, lng } = e.target.getLatLng();
    setMarkerPosition({ lat, lng });
    setFormData(prevFormData => ({
      ...prevFormData,
      latitude: lat,
      longitude: lng
    }));
  };
  const handleShowCurrentMap = (id) => {
    if (isTokenExpired()) {
      toast("You need to log in again to continue!", {
        autoClose: 1000,
        onClose: () => {
          navigate("/auth/login");
        },
      });
    } else {
      fetchStationDetails(id);
      setTimeout(() => {
        setShowMap(true);
      }, 500);
    }
  }


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
      setTimeout(() => {
        setShowMap(true);
      }, 500);
    }
  }


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
          const display_name = response.data.display_name;
          setAddress(response.data);
          setDisplay_name(display_name)

        }
      } catch (error) {
        console.log("Error:", error);
      }
    };

    fetchAddress();
  }, [markerPosition]);
  //END MAPPING


  return (
    <>
      <Header />
      <ToastContainer />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className=" card-container shadow">
              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Manager Stations</h3>
              </CardHeader>
              <CardBody>
                <Modal show={showMap} backdrop="static" onHide={() => setShowMap(false)} size="lg" animation={true}>
                  {/* <Modal.Header > */}
                  {/* </Modal.Header> */}
                  <Modal.Body >
                    <MapContainer
                      center={markerPosition}
                      zoom={15}
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
                        draggable={markerDraggable}
                        eventHandlers={
                          markerDraggable
                            ? {
                              dragend: handleMarkerMove,
                            }
                            :
                            {
                              click: () => setShowDetails(true),
                            }
                        }
                        ref={markerRef}
                      >
                        {markerDraggable && ( // Show the popup only when markerDraggable is true
                          <Popup>
                            <div className="info-window-content">
                              {/* {address && (
                                <>
                                  <p>{address.amenity}</p>
                                  <p>{address.house_number}</p>
                                  <p>{address.road}</p>
                                  <p>{address.suburb}</p>
                                  <p>{address.city}</p>                                  
                                  <p>{address.state}</p>
                                </>
                              )} */}
                              <p>{display_name}</p>
                              {/* <p>Latitude: {markerPosition.lat}</p>
                              <p>Longitude: {markerPosition.lng}</p> */}
                            </div>
                          </Popup>
                        )}
                      </Marker>
                    </MapContainer>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setShowMap(false); setMarkerDraggable(false); }}>
                      Close
                    </Button>
                  </Modal.Footer>
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
                          value={formData.code}
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
                          value={formData.name}
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
                          value={formData.addressNumber}
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
                          value={formData.street}
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
                          value={formData.ward}
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
                          value={formData.district}
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
                          value={formData.city}
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
                          readOnly
                          value={formData.latitude}
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
                          readOnly
                          value={formData.longitude}
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

                {/* Detail model */}
                <Modal show={showDetails} onHide={() => setShowDetails(false)}>
                  <Modal.Header >
                    <Modal.Title>Station detail</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3 d-flex justify-content-center align-items-center" >
                        {formData.image ? (
                          <img className="station-img" src={formData.image} alt="" />
                        ) : (
                          <img className="station-img" src={defaultStation} alt="" />
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="code">
                        <Form.Label>Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="code"
                          placeholder="Code"
                          autoFocus
                          readOnly
                          value={formData.code}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          placeholder="Name"
                          readOnly
                          value={formData.name}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="addressNumber">
                        <Form.Label>Address Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="addressNumber"
                          placeholder="Address Number"
                          autoFocus
                          readOnly
                          value={formData.addressNumber}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="street">
                        <Form.Label>Street</Form.Label>
                        <Form.Control
                          type="text"
                          name="street"
                          placeholder="Street"
                          autoFocus
                          readOnly
                          value={formData.street}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="ward">
                        <Form.Label>Ward</Form.Label>
                        <Form.Control
                          type="text"
                          name="ward"
                          placeholder="Ward"
                          autoFocus
                          readOnly
                          value={formData.ward}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="district">
                        <Form.Label>District</Form.Label>
                        <Form.Control
                          type="text"
                          name="district"
                          placeholder="District"
                          autoFocus
                          readOnly
                          value={formData.district}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="city">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          placeholder="City"
                          autoFocus
                          readOnly
                          value={formData.city}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="latitude">
                        <Form.Label>Latitude</Form.Label>
                        <Form.Control
                          type="number"
                          name="latitude"
                          placeholder="Latitude"
                          autoFocus
                          readOnly
                          value={formData.latitude}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="longitude">
                        <Form.Label>Longitude</Form.Label>
                        <Form.Control
                          type="number"
                          name="longitude"
                          placeholder="Longitude"
                          autoFocus
                          readOnly
                          value={formData.longitude}
                        />
                      </Form.Group>
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetails(false)}>
                      Close
                    </Button>
                  </Modal.Footer>
                </Modal>
                {/* Update model */}
                <Modal show={showUpdate} onHide={handleUpdateClose}>
                  <Modal.Header >
                    <Modal.Title>Update station</Modal.Title>

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
                          value={formData.code}
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
                          value={formData.name}
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
                          value={formData.addressNumber}
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
                          value={formData.street}
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
                          value={formData.ward}
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
                          value={formData.district}
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
                          value={formData.city}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              city: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" >
                        <Button variant="primary" size="sm" onClick={() => { setShowMap(true); setMarkerDraggable(true); }}>
                          Change Location
                        </Button>
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="latitude">
                        <Form.Label>Latitude</Form.Label>
                        <Form.Control
                          type="text"
                          name="latitude"
                          placeholder="Latitude"
                          readOnly
                          value={formData.latitude}
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
                          type="text"
                          name="longitude"
                          placeholder="Longitude"
                          readOnly
                          value={formData.longitude}
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
                          placeholder="Image"
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
                          {/* <td>
                            {station.image ? (
                              <img className="station-img" src={station.image} alt="" />
                            ) : (
                              <img className="station-img" src={defaultStation} alt="" />
                            )}
                          </td> */}
                          <td>
                            <span className="link-style" onClick={(e) => {
                              e.preventDefault()
                              handleShowCurrentMap(station.id);
                            }}>{station.code ? station.code : "none"}</span>

                          </td>
                          <td>
                            <span className="link-style" onClick={(e) => {
                              e.preventDefault()
                              handleShowCurrentMap(station.id);
                            }}>{station.name ? station.name : "none"}</span>
                          </td>
                          <td>
                            <span className="link-style" onClick={(e) => {
                              e.preventDefault()
                              handleShowCurrentMap(station.id);
                            }}>{station.district ? station.district : "none"}</span>
                          </td>
                          <td>
                            <span className="link-style" onClick={(e) => {
                              e.preventDefault()
                              handleShowCurrentMap(station.id);
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
      </Container>
    </>
  );
};

export default Stations;