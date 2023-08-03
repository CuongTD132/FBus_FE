import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Table } from 'react-bootstrap';
import "../../style/Manager.css"
import bin from '../../assets/img/bin.png'
import remove from '../../assets/img/delete.png'
import binRed from '../../assets/img/bin-red.png'
import removeRed from '../../assets/img/delete-red.png'
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
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
  // addRouteAPI,
  // updateRouteAPI,
  getSingleRoute,
  getMultiRoutesAPI,
  getAllRoutes,
  deleteRouteAPI,
  toggleStatusAPI,
} from "../../services/routes";
import {
  getAllStations,
} from "../../services/station";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateRoute } from "../../redux/reducer";
import { isTokenExpired } from "../../services/checkToken";
import caution from '../../assets/img/caution.png'
import axios from "axios";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import 'leaflet-routing-machine';
import defaultStation from '../../assets/img/station-marker.png';
import firstStation from '../../assets/img/start-marker.png';
import lastStation from '../../assets/img/end-marker.png';
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';
const RouteControl = ({ stations }) => {
  const map = useMap();

  useEffect(() => {
    console.log("Selected Stations:", stations);

    if (!map || !stations || stations.length < 2) {
      return;
    }

    const createCustomIcon = (name, isStartStation, isLastStation) =>
      L.divIcon({
        className: "custom-icon",
        iconAnchor: [15, 30],
        html: `
      <div>
        <h1 style="background-color: #aad3df; border-radius: 8px; padding: 3px; border: 1px solid rgba(0, 0, 0, 0.2);">
          ${name}
        </h1>        
        <img src="${isStartStation ? firstStation : isLastStation ? lastStation : defaultStation}" alt="${name}" class="custom-icon-img">        
      </div>
    `,
      });

    const waypoints = stations.map((station, index) => ({
      name: station.station.name,
      latLng: L.latLng(station.station.latitude, station.station.longitude),
      isStartStation: index === 0,
      isLastStation: index === stations.length - 1, // Mark the last station as the last station
    }));

    console.log('waypoints:', waypoints);

    const control = L.Routing.control({
      waypoints: waypoints,
      addWaypoints: false,
      fitSelectedRoutes: true,
      show: false,

      createMarker: (i, waypoint, n) => {
        const icon = createCustomIcon(waypoint.name, waypoint.isStartStation, waypoint.isLastStation);
        return L.marker(waypoint.latLng, { icon: icon });
      },
    });

    control.addTo(map);


    control.on('routesfound', function (e) {
      var routes = e.routes;
      var summary = routes[0].summary;
      toast.info('Total distance is ' + Math.round(summary.totalDistance) + ' m', {
        autoClose: 1500,
      });
    });
    return () => {
      map.removeControl(control);
    };
  }, [map, stations]);


  return null;
}
const Routes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [routeList, setRouteList] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showToggleStatus, setShowToggleStatus] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [errors, setErrors] = useState({});
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedStations, setSelectedStations] = useState([]);
  const [routeControl, setRouteControl] = useState(null);
  const [stationList, setStationList] = useState([]);
  const [showStationList, setShowStationList] = useState(false);
  const [sortingOrder, setSortingOrder] = useState("oldest");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [formData, setFormData] = useState({
    beginning: "",
    destination: "",
    distance: "",
    stations: [],
  });

  // Check accessToken
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    getAllRoutes(user.accessToken)
      .then((res) => {
        if (res && res.data && res.data.data) {
          setRouteList(res.data.data);
        } else {
          toast.warn("You need add more stations!", {
            autoClose: 1500,
          });
          return;
        }
      })
      .catch((error) => {
        alert("Error: " + error.message);
      });


  }, [navigate])
  // Fetch detail information and pass to detail form
  const fetchRouteDetails = async (id) => {
    await getSingleRoute(id)
      .then((res) => {
        const { routeStations, ...routeData } = res.data;
        setFormData(routeData);
        console.log(routeData);
      })
  };
  const fetchStations = async (selectedStationIds) => {
    await getAllStations()
      .then((res) => {
        // Filter out the selected stations from the available stations
        const availableStations = res.data.data?.filter(
          (station) => !selectedStationIds?.includes(station.id)
        );
        setStationList(availableStations);
      })
      .catch((error) => {
        console.log(error);
      });
  };



  const [chosenStations, setChosenStations] = useState([]);

  const StationList = ({ stationList }) => {
    if (!showStationList) return null;

    const availableStations = stationList.filter(
      (station) => !chosenStations?.includes(station.id)
    );

    return (
      <div style={{ height: "130px", overflowY: "scroll", borderRadius: "5px", marginRight: "34px", marginLeft: "12px" }}>
        <ListGroup style={{ border: "1px solid #cad1d7", fontSize: "0.875rem" }}>
          {availableStations.map((station) => (
            <ListGroupItem
              key={station.id}
              tag="a"
              action
              style={{
                height: "43px",
                border: "1px solid #d0d6dc",
                borderRadius: "5px",
                cursor: "pointer",
                color: "#8898aa",
                padding: "10px 12px"
              }}
              onClick={() => handleSelectStation(station)}
            >
              {station.name}
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>
    );
  };


  const handleSelectStation = (station) => {
    // Check if the selected station ID is already present in the chosenStations state
    if (!chosenStations?.includes(station.id)) {
      // If not, add it to the chosenStations array
      setChosenStations([...chosenStations, station.id]);

      // Update the formData to store the array of chosen station IDs
      setFormData({
        ...formData,
        stationIds: [...chosenStations, station.id], // Store the array of station IDs
      });

      setSelectedStations([...selectedStations, { station: station }]);
      setIsUpdated(true);
      setErrors({
        ...errors,
        StationIds: null
      });
    }

    setShowStationList(false);
  };


  const removeStation = (stationId) => {
    const updatedChosenStations = chosenStations?.filter((id) => id !== stationId);
    setChosenStations(updatedChosenStations);

    // Remove the station from selectedStations
    const updatedSelectedStations = selectedStations?.filter(
      (station) => station.station.id !== stationId
    );
    setSelectedStations(updatedSelectedStations);

    // Update the formData to store the updated array of chosen station IDs
    setFormData({
      ...formData,
      stationIds: updatedChosenStations,
    });

    // Fetch stations again with updated chosen stations to include the removed station
    fetchStations(updatedChosenStations);
  };





  // Fetch list of Route and pass to table
  const fetchRoutes = () => {
    if (currentSearchRoute !== "") {
      getMultiRoutesAPI({
        beginning: currentSearchRoute,
        destination: currentSearchRoute,
        status: selectedStatus,
      }).then((res) => {
        // console.log(res.data.data)
        if (res.data.data != null) {
          dispatch(updateRoute(res.data.data))
        } else {
          dispatch(updateRoute([]))
        }
      })
    } else {
      getMultiRoutesAPI({ status: selectedStatus })
        .then((res) => {
          let sortedRoutes = res.data.data;
          if (sortingOrder === "newest") {
            sortedRoutes = res.data.data.sort((a, b) => b.id - a.id);
          } else if (sortingOrder === "oldest") {
            sortedRoutes = res.data.data.sort((a, b) => a.id - b.id);
          }

          setRouteList(sortedRoutes);
          dispatch(updateRoute(sortedRoutes));
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  useEffect(() => {
    fetchRoutes();
  }, [sortingOrder, selectedStatus]);

  const handleSortingChange = (order) => {
    setSortingOrder(order);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
  };
  // Call show detail form
  const handleShowDetails = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    try {
      const response = await getSingleRoute(id, user.accessToken);
      const routeData = response.data;

      if (routeData && routeData.routeStations && routeData.routeStations.length >= 2) {
        setSelectedStations(routeData.routeStations);
        setShowMap(true);
      } else {
        toast.warn("Please add more stations!", {
          autoClose: 1500,
        });
      }
    } catch (error) {
      console.error("Error fetching route details:", error);
      alert("Error fetching route details");
    }
  }

  // --UPDATE FUNCTIONS
  const handleUpdateClose = () => {
    setShowUpdate(false);
    setChosenStations([]);
    setShowStationList(false)
  }
  const handleUpdateShow = async (route) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true);
      return;
    }
    try {
      const response = await getSingleRoute(route.id, user.accessToken);
      const routeData = response.data;
      if (routeData && routeData.routeStations && routeData.routeStations.length >= 2) {
        setSelectedStations(routeData.routeStations);
      } else {
        alert("Error: Invalid route data");
      }
      setFormData({
        ...formData,
        stationIds: routeData.routeStations.map((station) => station.station.id),
      });
      await fetchStations(routeData.routeStations.map((station) => station.station.id));
      await fetchRouteDetails(route.id);
      setShowUpdate(true);
      setErrors({});
    } catch (error) {
      console.error("Error fetching route details:", error);
      alert("Error fetching route details");
    }
  };

  const updateRouteData = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true);
      return;
    }

    if (!isUpdated) {
      toast.info("Nothing has been changed!", {
        autoClose: 1000,
      });
      setShowUpdate(true);
      return;
    }

    if (user?.accessToken) {
      try {
        const stationIdsArray = selectedStations.map((station) => station.station.id);

        const res = await axios.put(
          `https://fbus-last.azurewebsites.net/api/Routes/${formData.id}`,
          {
            ...formData,
            stationIds: stationIdsArray,
          },
          {
            headers: {
              "Authorization": `Bearer ${user.accessToken}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );

        if (res.status === 200) {
          toast.success("Route update successfully!", {
            autoClose: 1000,
          });
          setShowUpdate(false);
          fetchRoutes();
        }
      } catch (e) {
        if (e.response.data.errors) {
          setErrors(e.response.data.errors);
        }
        toast.error("Failed to update the route!", {
          autoClose: 1000,
        });
        setShowUpdate(true);
      }
    }
  };

  // END UPDATE FUNCTIONS

  // TOGGLE STATUS FUNCTION
  const [oldStatus, setOldStatus] = useState("");
  const [toggleRouteId, setToggleRouteId] = useState(null);
  const handleToggleStatus = (route) => {
    setOldStatus(route.status)
    setToggleRouteId(route.id)
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
    toggleStatusAPI(toggleRouteId, status)
      .then((res) => {
        toast.success("Successull to enable/disable status!", {
          autoClose: 1000,
        });
        setShowToggleStatus(false);
        fetchRoutes()
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
  const [deleteRouteId, setDeleteRouteId] = useState();
  const handleDeleteRoute = (id) => {
    setDeleteRouteId(id)
    setShowDelete(true)
  };
  const deleteRoute = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    deleteRouteAPI(deleteRouteId)
      .then((res) => {
        if (res.status === 200) {
          // console.log(res)
          toast.success("Route deleted successfully!", {
            autoClose: 1000,
          });
        }
        setShowDelete(false);
        fetchRoutes();
      })
      .catch(() => {
        toast.error("Failed to delete the route!", {
          autoClose: 1000,
        });
      });
  }
  // END DELETE FUNCTIONS

  // ADD
  const handleAddRoute = async () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    if (user?.accessToken) {
      try {
        const res = await axios.post(
          "https://fbus-last.azurewebsites.net/api/Routes",
          {
            ...formData,
          },
          {
            headers: {
              "Authorization": `Bearer ${user.accessToken}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );

        if (res.status === 200) {
          toast.success("Route has been add successfully!", {
            autoClose: 1000,
          });
          fetchRoutes()
          setShowAdd(false);
        }
      } catch (e) {
        if (e.response.data.errors) {
          setErrors(e.response.data.errors);
        }
        toast.error("Failed to add this route!", {
          autoClose: 1000,
        });
        setShowAdd(true);
      }
    }
  };
  const handleAddClose = () => {
    setShowAdd(false);
    setChosenStations([]);
    setShowStationList(false)
  }
  const handleAddOpen = async () => {
    setFormData({
      beginning: "",
      destination: "",
      distance: "",
      stationIds: [],
    });
    setChosenStations([]);
    await fetchStations();
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
  const [currentRouteList, setCurrentRouteList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setTotalPages(Math.ceil(routeList.length / itemsPerPage));
    setStartIndex((currentPage - 1) * itemsPerPage);
  }, [routeList, currentPage]);

  useEffect(() => {
    setEndIndex(startIndex + itemsPerPage);
    setCurrentRouteList(routeList.slice(startIndex, endIndex));
  }, [routeList, startIndex, endIndex]);

  useEffect(() => {
    setCurrentPage(1);
  }, [routeList.length]);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // END PAGING

  // REDUX
  const routes = useSelector((state) => state.routes.value);
  const currentSearchRoute = useSelector((state) => state.routes.currentSearchRoute);
  React.useEffect(() => {
    setRouteList(routes)
  }, [routes])
  // END REDUX

  //MAP
  // RouteControl component to draw the route on the map
  const handleCloseMap = (map) => {
    setShowMap(false);
    if (routeControl && map) {
      map.removeControl(routeControl);
      setRouteControl(null); // Reset the routeControl state
    }
  };


  //DRAG AND DROP
  const moveStation = (dragIndex, hoverIndex) => {
    const draggedStation = chosenStations[dragIndex];
    const updatedStations = [...chosenStations];
    updatedStations.splice(dragIndex, 1);
    updatedStations.splice(hoverIndex, 0, draggedStation);
    setChosenStations(updatedStations);
    setFormData({
      ...formData,
      stationIds: updatedStations,
    });
    const draggedStation1 = selectedStations[dragIndex];
    const updatedStations1 = [...selectedStations];
    updatedStations1.splice(dragIndex, 1);
    updatedStations1.splice(hoverIndex, 0, draggedStation1);
    setSelectedStations(updatedStations1);
    setFormData({
      ...formData,
      stationIds: updatedStations1,
    });
  };


  const StationItem = ({ station, index }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: "STATION",
      item: { station, index },
    }));

    const [, drop] = useDrop(() => ({
      accept: "STATION",
      hover: (item) => {
        const draggedIndex = item.index;
        const hoverIndex = index;
        // Don't replace items with themselves
        if (draggedIndex === hoverIndex) {
          return;
        }
        // Move the station from the dragged index to the hover index
        moveStation(draggedIndex, hoverIndex);

        item.index = hoverIndex;
      },
    }));

    const opacity = isDragging ? 0.4 : 1;

    return (
      <li
        ref={(node) => drag(drop(node))}
        style={{ color: "#8898aa", marginBottom: "5px", border: "1px solid #cad1d7", padding: "10px 12px", borderRadius: "0.375rem", opacity }}
        key={station.id}
      >
        {station.name}
        <img
          src={remove}
          alt="Delete"
          style={{ cursor: "pointer", float: "right", marginTop: "3px" }}
          onMouseOver={(e) => {
            e.target.src = removeRed;
          }}
          onMouseOut={(e) => {
            e.target.src = remove;
          }}
          onClick={(e) => {
            e.stopPropagation();
            removeStation(station.id);
          }}
        />
      </li>
    );
  };



  return (
    <DndProvider backend={HTML5Backend}>
      <>
        <Header />
        <ToastContainer />
        <Container className="mt--7" fluid>
          <Row>
            <div className="col">
              <Card className=" card-container shadow">
                <CardHeader className="bg-transparent">
                  <h3 className="mb-0">Manager Routes</h3>
                </CardHeader>
                <CardBody>

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
                      <Modal.Title>Enable/Disable route</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Are you sure to enable/disable this route?</Modal.Body>
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
                      <Modal.Title>Delete route</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Are you sure to delete this route?</Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={() => setShowDelete(false)}>
                        Close
                      </Button>
                      <Button variant="primary" onClick={() => deleteRoute()}>
                        Delete
                      </Button>
                    </Modal.Footer>
                  </Modal>

                  {/* Add model */}
                  <Modal show={showAdd} onHide={handleAddClose}>
                    <Modal.Header >
                      <Modal.Title>Add route</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form>
                        <Form.Group className="mb-3" controlId="beginning">
                          <Form.Label>Beginning</Form.Label>
                          {errors && errors.Beginning && (
                            <span style={{ color: "red", float: "right" }}>*{errors.Beginning}</span>
                          )}
                          <Form.Control
                            type="text"
                            name="beginning"
                            placeholder="Beginning"
                            autoFocus
                            required
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                beginning: e.target.value
                              });
                              setErrors({
                                ...errors,
                                Beginning: null
                              });
                            }}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="destination">
                          <Form.Label>Destination</Form.Label>
                          {errors && errors.Destination && (
                            <span style={{ color: "red", float: "right" }}>*{errors.Destination}</span>
                          )}
                          <Form.Control
                            type="text"
                            name="destination"
                            placeholder="Destination"
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                destination: e.target.value
                              });
                              setErrors({
                                ...errors,
                                Destination: null
                              });
                            }}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="distance">
                          <Form.Label>Distance</Form.Label>
                          {errors && errors.Distance && (
                            <span style={{ color: "red", float: "right" }}>*{errors.Distance}</span>
                          )}
                          <Form.Control
                            type="number"
                            name="distance"
                            placeholder="Distance"
                            required
                            min={0}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                distance: e.target.value
                              });
                              setErrors({
                                ...errors,
                                Distance: null
                              });
                            }}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3" >
                          <Form.Label>Stations</Form.Label>
                          {errors && errors.StationIds && (
                            <span style={{ color: "red", float: "right" }}>*{errors.StationIds}</span>
                          )}
                          <Row>
                            <Col xs={11} onClick={() => setShowStationList(!showStationList)}>
                              <ul
                                style={{
                                  padding: "10px 12px",
                                  borderRadius: "0.375rem",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {chosenStations.length === 0 && (
                                  <li style={{ color: "#8898aa", marginBottom: "5px", border: "1px solid #cad1d7", padding: "10px 12px", borderRadius: "0.375rem" }}>Please choose a station</li>
                                )}
                                {chosenStations.map((stationId, index) => (
                                  <StationItem
                                    key={stationId}
                                    station={stationList.find((station) => station.id === stationId)}
                                    onRemoveStation={removeStation}
                                    index={index}
                                  />
                                ))}
                              </ul>
                            </Col>
                            {chosenStations.length > 1 && (
                              <Col xs={1} className="d-flex align-items-center justify-content-center">
                                <img
                                  src={bin}
                                  alt="Delete"
                                  style={{
                                    cursor: "pointer", marginBottom: "10px", paddingLeft: 0,
                                  }}
                                  onMouseOver={(e) => {
                                    e.target.src = binRed;
                                  }}
                                  onMouseOut={(e) => {
                                    e.target.src = bin;
                                  }}
                                  onClick={() => {
                                    setChosenStations([]);
                                    setFormData({
                                      ...formData,
                                      stationIds: [],
                                    });
                                  }}
                                />
                              </Col>
                            )}
                          </Row>
                          <StationList stationList={stationList} />
                        </Form.Group>
                      </Form>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={handleAddClose}>
                        Close
                      </Button>
                      <Button variant="primary" onClick={handleAddRoute}>
                        Add +
                      </Button>
                    </Modal.Footer>
                  </Modal>

                  {/* Map model */}
                  <Modal dialogClassName="modal-map" show={showMap} onHide={handleCloseMap}>
                    <Modal.Body>
                      <MapContainer
                        zoom={13}
                        scrollWheelZoom={true}
                        zoomControl={true}
                        style={{ height: "calc(80vh)", borderRadius: "5px" }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                        />
                        {selectedStations.length >= 2 && <RouteControl stations={selectedStations} />}
                      </MapContainer>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="primary" onClick={handleCloseMap}>
                        Close
                      </Button>
                    </Modal.Footer>
                  </Modal>

                  {/* Update model */}
                  <Modal show={showUpdate} onHide={handleUpdateClose}>
                    <Modal.Header>
                      <Modal.Title>Update route</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form>
                        <Form.Group className="mb-3" controlId="beginning">
                          <Form.Label>Beginning</Form.Label>
                          {errors && errors.Beginning && (
                            <span style={{ color: "red", float: "right" }}>*{errors.Beginning}</span>
                          )}
                          <Form.Control
                            type="text"
                            name="beginning"
                            placeholder="Beginning"
                            autoFocus
                            required
                            value={formData.beginning}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                beginning: e.target.value,
                              });
                              setErrors({
                                ...errors,
                                Beginning: null
                              });
                              setIsUpdated(true);
                            }}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="destination">
                          <Form.Label>Destination</Form.Label>
                          {errors && errors.Destination && (
                            <span style={{ color: "red", float: "right" }}>*{errors.Destination}</span>
                          )}
                          <Form.Control
                            type="text"
                            name="destination"
                            placeholder="Destination"
                            value={formData.destination}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                destination: e.target.value,
                              });
                              setErrors({
                                ...errors,
                                Destination: null
                              });
                              setIsUpdated(true);
                            }}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="distance">
                          <Form.Label>Distance</Form.Label>
                          {errors && errors.Distance && (
                            <span style={{ color: "red", float: "right" }}>*{errors.Distance}</span>
                          )}
                          <Form.Control
                            type="number"
                            name="distance"
                            placeholder="Distance"
                            required
                            min={0}
                            value={formData.distance}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                distance: e.target.value,
                              });
                              setErrors({
                                ...errors,
                                Distance: null
                              });
                              setIsUpdated(true);
                            }}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Stations</Form.Label>
                          {errors && errors.StationIds && (
                            <span style={{ color: "red", float: "right" }}>
                              *{errors.StationIds}
                            </span>
                          )}
                          <Row>
                            <Col xs={11} onClick={() => setShowStationList(!showStationList)}>
                              <ul
                                style={{
                                  padding: "10px 12px",
                                  borderRadius: "0.375rem",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {selectedStations.length === 0 && (
                                  <li
                                    style={{
                                      color: "#8898aa",
                                      marginBottom: "5px",
                                      marginLeft: 10,
                                      border: "1px solid #cad1d7",
                                      padding: "10px 12px",
                                      borderRadius: "0.375rem",
                                    }}
                                  >
                                    Please choose a station
                                  </li>
                                )}
                                {selectedStations.map((station, index) => (
                                  <StationItem
                                    key={station.station.id}
                                    station={station.station}
                                    onRemoveStation={removeStation}
                                    index={index}
                                  />
                                ))}
                              </ul>
                            </Col>
                            {selectedStations.length > 1 && (
                              <Col
                                xs={1}
                                className="d-flex align-items-center justify-content-center"
                              >
                                <img
                                  src={bin}
                                  alt="Delete"
                                  style={{
                                    cursor: "pointer",
                                    marginBottom: "10px",
                                    paddingLeft: "0 !important",
                                  }}
                                  onMouseOver={(e) => {
                                    e.target.src = binRed;
                                  }}
                                  onMouseOut={(e) => {
                                    e.target.src = bin;
                                  }}
                                  onClick={() => {
                                    setSelectedStations([]);
                                    setFormData({
                                      ...formData,
                                      stationIds: [],
                                    });
                                  }}
                                />
                              </Col>
                            )}
                          </Row>
                          <StationList stationList={stationList} />
                        </Form.Group>
                      </Form>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={handleUpdateClose}>
                        Close
                      </Button>
                      <Button variant="primary" onClick={updateRouteData}>
                        Confirm
                      </Button>
                    </Modal.Footer>
                  </Modal>


                  {/* Table list */}
                  <div className="list">
                    <div style={{ display: "flex" }}>
                      <div style={{ flexGrow: "8" }}></div>
                      <div style={{ paddingTop: "20px", paddingLeft: "20px" }}>
                        Filter by Status:
                        <select
                          as="select"
                          value={selectedStatus}
                          onChange={(e) => handleStatusFilter(e.target.value)}
                          style={{ height: "22px", borderRadius: "5px", marginLeft: "10px", fontSize: "0.9rem" }}
                        >
                          <option value="">All</option>
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="DELETED">Deleted</option>
                        </select>
                      </div>
                      <div style={{ paddingTop: "20px", paddingLeft: "20px" }}>
                        Sort:
                        <select
                          as="select"
                          value={sortingOrder}
                          onChange={(e) => handleSortingChange(e.target.value)}
                          style={{ height: "22px", borderRadius: "5px", marginLeft: "10px", fontSize: "0.9rem" }}
                        >
                          <option value="oldest">Oldest Routes</option>
                          <option value="newest">Newest Routes</option>
                        </select>
                      </div>
                      <Button variant="primary" onClick={handleAddOpen} size="md" className="add_button">Add Route +</Button>
                    </div>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Id</th>
                          <th>Beginning</th>
                          <th>Destination</th>
                          <th>Distance</th>
                          <th>Status</th>
                          <th>More Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRouteList.map((route, index) => (
                          <tr key={index}>
                            <td>
                              <span>{route.id}</span>
                            </td>
                            <td>
                              <span className="link-style" onClick={(e) => {
                                e.preventDefault()
                                handleShowDetails(route.id)
                              }}>{route.beginning}</span>

                            </td>
                            <td>
                              <span className="link-style" onClick={(e) => {
                                e.preventDefault()
                                handleShowDetails(route.id)
                              }}>{route.destination}</span>
                            </td>
                            <td>
                              <span className="link-style" onClick={(e) => {
                                e.preventDefault()
                                handleShowDetails(route.id)
                              }}>{route.distance + " m"}</span>
                            </td>
                            <td>
                              <span className={`status ${route.status === 'ACTIVE' ? 'active' : route.status === 'INACTIVE' ? 'inactive' : ''}`}>
                                {route.status}
                              </span>
                            </td>
                            <td className={`registration ${route.status === "DELETED" ? "disable-actions" : ""}`}>
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
                                    onClick={() => handleUpdateShow(route)}
                                  >
                                    Update
                                  </DropdownItem>
                                  <DropdownItem
                                    className="disable-enable-dropdown-item"
                                    onClick={() => {
                                      handleToggleStatus(route)
                                    }}
                                  >
                                    Enable/Disable
                                  </DropdownItem>
                                  <DropdownItem
                                    className="delete-dropdown-item"
                                    onClick={() => handleDeleteRoute(route.id)}
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
    </DndProvider >
  );
};

export default Routes;