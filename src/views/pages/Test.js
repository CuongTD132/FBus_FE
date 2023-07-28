import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Table } from 'react-bootstrap';
import "../../style/Manager.css"
import { format } from 'date-fns';
import axios from "axios";
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
    // addTripAPI,
    // updateTripAPI,
    getSingleTrip,
    getAllTrips,
    deleteTripAPI,
    toggleStatusAPI

} from "../../services/trip";
import {
    getAllDrivers,
} from "../../services/driver";
import {
    getAllBuses,
} from "../../services/bus";
import {
    getAllRoutes,
} from "../../services/routes";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../../services/checkToken";
import caution from '../../assets/img/caution.png'

const Test = () => {
    const navigate = useNavigate();
    const [tripList, setTripList] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [showToggleStatus, setShowToggleStatus] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [errors, setErrors] = useState({});
    const [showBackdrop, setShowBackdrop] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);
    const [formData, setFormData] = useState({
        driverId: "",
        busId: "",
        routeId: "",
        note: "",
        dateLine: "",
        dueDate: "",
    });

    // Check accessToken
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user == null || !user || isTokenExpired()) {
            setShowBackdrop(true)
            return;
        } else {
            getAllTrips(user.accessToken)
                .then((res) => {
                    if (res && res.data && res.data.data) {
                        setTripList(res.data.data);
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
    const fetchTripDetails = async (id) => {
        await getSingleTrip(id)
            .then((res) => {
                setFormData(res.data)
            })
    };

    // Fetch list of driver and pass to table
    const fetchTrips = () => {
        getAllTrips()
            .then((res) => setTripList(res.data.data))
            .catch((error) => {
                console.log(error);
            });
    };


    // --UPDATE FUNCTIONS
    const handleUpdateClose = () => {
        setShowUpdate(false);
        resetFormData();
    }
    const handleUpdateShow = async (trip) => {
        const user = JSON.parse(localStorage.getItem('user'))
        if (user == null || !user || isTokenExpired()) {
            setShowBackdrop(true)
            return;
        }
        await fetchTripDetails(trip.id); // fetch old data
        setShowUpdate(true);
    };
    const updateTripData = async () => {
        const user = JSON.parse(localStorage.getItem('user'))
        if (user == null || !user || isTokenExpired()) {
            setShowBackdrop(true)
            return;
        }
        if (formData.note === null) {
            formData.note = "";
        }
        // Check if form data has been changed
        if (!isUpdated) {
            toast.info("Nothing has been changed!", {
                autoClose: 1000,
            });
            setShowUpdate(true);
            return;
        }
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await axios.put(
                `https://fbus-last.azurewebsites.net/api/Trips/${formData.id}`,
                formData,
                {
                    headers: {
                        "Authorization": `Bearer ${user.accessToken}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            if (res.status === 200) {
                toast.success("Trip updated successfully!", {
                    autoClose: 1000,
                });
            }
            setShowUpdate(false);
            fetchTrips();
            try {
                const response = await getAllTrips();
                setTripList(response.data.data);
            } catch (error) {
                console.log(error);
            }
        } catch (e) {
            if (e.response.data.errors) {
                setErrors(e.response.data.errors);
            }
            toast.error("Failed to update the trip!", {
                autoClose: 1000,
            });
            setShowUpdate(true);
        }
    };


    // END UPDATE FUNCTIONS

    // ADD
    const handleAddTrip = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user == null || !user || isTokenExpired()) {
            setShowBackdrop(true)
            return;
        }
        let hasError = false;
        const newErrors = {};

        if (!selectedDriver) {
            newErrors.DriverId = ["Please choose a driver"];
            hasError = true;
        }

        if (!selectedBus) {
            newErrors.BusId = ["Please choose a bus"];
            hasError = true;
        }

        if (!selectedRoute) {
            newErrors.RouteId = ["Please choose a route"];
            hasError = true;
        }

        setErrorVisible(hasError);
        setErrors(newErrors);

        if (hasError) {
            return;
        }

        if (user?.accessToken) {
            try {
                const res = await axios.post(
                    "https://fbus-last.azurewebsites.net/api/Trips",
                    formData,
                    {
                        headers: {
                            "Authorization": `Bearer ${user.accessToken}`,
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );

                if (res.status === 200) {
                    toast.success("Trip has been added successfully!", {
                        autoClose: 1000,
                    });
                    setShowAdd(false);
                    fetchTrips();
                }
            } catch (e) {
                if (e.response.data.errors) {
                    setErrors(e.response.data.errors);
                }
                toast.error("Failed to add this trip!", {
                    autoClose: 1000,
                });
                setShowAdd(true);
            }
        }
    };

    const handleAddClose = () => {
        setShowAdd(false);
        resetFormData();
        resetErrorVisible()
    }
    const handleAddOpen = () => {
        if (isTokenExpired()) {
            toast("You need to log in again to continue!", {
                autoClose: 1000,
                onClose: () => {
                    navigate("/auth/login");
                },
            });
        } else {
            setFormData({
                driverId: "",
                busId: "",
                routeId: "",
                note: "",
                dateLine: "",
                dueDate: "",
            });
            resetFormData();
            resetErrorVisible()
            setShowAdd(true);
        }
    };
    // END ADD

    // PAGING
    const itemsPerPage = 5;
    const [currentTripList, setCurrentTripList] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setTotalPages(Math.ceil(tripList.length / itemsPerPage));
        setStartIndex((currentPage - 1) * itemsPerPage);
    }, [tripList, currentPage]);

    useEffect(() => {
        setEndIndex(startIndex + itemsPerPage);
        setCurrentTripList(tripList.slice(startIndex, endIndex));
    }, [tripList, startIndex, endIndex]);

    useEffect(() => {
        setCurrentPage(1);
    }, [tripList.length]);

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    // END PAGING

    // EXPIRED
    const handleLogoutClose = () => {
        navigate("/auth/login");
        localStorage.removeItem('user');
        toast.success("Logout successful", {
            autoClose: 1000,
        });
        setShowBackdrop(false);
    }


    //DRIVER
    const [showDriverList, setShowDriverList] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [driverList, setDriverList] = useState([]);
    const resetFormData = () => {
        setShowDriverList(false)
        setShowBusList(false)
        setShowRouteList(false)
        setSelectedDriver(null);
        setSelectedBus(null);
        setSelectedRoute(null);
        setFormData({
            driverId: "",
            busId: "",
            routeId: "",
            note: "",
            dateLine: "",
            dueDate: "",
        });
    };
    const DriverList = ({ driverList }) => {
        // Filter the driverList to exclude the selectedDriver
        const availableDrivers = driverList.filter(
            (driver) => driver.id !== selectedDriver?.id
        );

        return (
            <div
                style={{
                    height: "130px",
                    overflowY: "scroll",
                    borderRadius: "5px",
                    marginTop: "5px"
                    // marginRight: "24px",
                }}
            >
                <ListGroup style={{ border: "1px solid #cad1d7", fontSize: "0.875rem" }}>
                    {availableDrivers.map((driver) => (
                        <ListGroupItem
                            key={driver.id}
                            tag="a"
                            action
                            style={{
                                height: "43px",
                                border: "1px solid #d0d6dc",
                                borderRadius: "5px",
                                cursor: "pointer",
                                color: "#8898aa",
                                padding: "10px 12px",
                            }}
                            onClick={() => handleSelectDriver(driver)}
                        >
                            {driver.fullName}
                        </ListGroupItem>
                    ))}
                </ListGroup>
            </div>
        );
    };
    const handleSelectDriver = (driver) => {
        setSelectedDriver(driver);
        setErrors((prevErrors) => ({
            ...prevErrors,
            DriverId: undefined, // Reset error for DriverId only
        }));
        setFormData({
            ...formData,
            driverId: driver.id,
        });
        setIsUpdated(true);
        setShowDriverList(false);
    };

    //BUS
    const [showBusList, setShowBusList] = useState(false);
    const [selectedBus, setSelectedBus] = useState(null);
    const [busList, setBusList] = useState([]);
    const BusList = ({ busList }) => {
        // Filter the busList to exclude the selectedBus
        const availableBuses = busList.filter(
            (bus) => bus.id !== selectedBus?.id
        );

        return (
            <div
                style={{
                    height: "130px",
                    overflowY: "scroll",
                    borderRadius: "5px",
                    marginTop: "5px"
                    // marginRight: "24px",
                }}
            >
                <ListGroup style={{ border: "1px solid #cad1d7", fontSize: "0.875rem" }}>
                    {availableBuses.map((bus) => (
                        <ListGroupItem
                            key={bus.id}
                            tag="a"
                            action
                            style={{
                                height: "43px",
                                border: "1px solid #d0d6dc",
                                borderRadius: "5px",
                                cursor: "pointer",
                                color: "#8898aa",
                                padding: "10px 12px",
                            }}
                            onClick={() => handleSelectBus(bus)}
                        >
                            {bus.licensePlate}
                        </ListGroupItem>
                    ))}
                </ListGroup>
            </div>
        );
    };

    const handleSelectBus = (bus) => {
        setSelectedBus(bus);
        setErrors((prevErrors) => ({
            ...prevErrors,
            BusId: undefined, // Reset error for BusId only
        }));
        setFormData({
            ...formData,
            busId: bus.id,
        });
        setIsUpdated(true);
        setShowBusList(false);
    };

    //ROUTE
    const [showRouteList, setShowRouteList] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [routeList, setRouteList] = useState([]);
    const RouteList = ({ routeList }) => {
        // Filter the routeList to exclude the selectedRoute
        const availableRoutes = routeList.filter(
            (route) => route.id !== selectedRoute?.id
        );

        if (availableRoutes.length === 0) {
            return <div
                style={{
                    height: "130px",
                    overflowY: "scroll",
                    borderRadius: "5px",
                    marginTop: "5px"
                }}
            >There is no data</div>;
        }

        return (
            <div
                style={{
                    height: "130px",
                    overflowY: "scroll",
                    borderRadius: "5px",
                    marginTop: "5px"
                }}
            >
                <ListGroup style={{ border: "1px solid #cad1d7", fontSize: "0.875rem" }}>
                    {availableRoutes.map((route) => (
                        <ListGroupItem
                            key={route.id}
                            tag="a"
                            action
                            style={{
                                height: "43px",
                                border: "1px solid #d0d6dc",
                                borderRadius: "5px",
                                cursor: "pointer",
                                color: "#8898aa",
                                padding: "10px 12px",
                            }}
                            onClick={() => handleSelectRoute(route)}
                        >
                            {route.beginning} - {route.destination}
                        </ListGroupItem>
                    ))}
                </ListGroup>
            </div>
        );
    };

    const handleSelectRoute = (route) => {
        setSelectedRoute(route);
        setErrors((prevErrors) => ({
            ...prevErrors,
            RouteId: undefined, // Reset error for RouteId only
        }));
        setFormData({
            ...formData,
            routeId: route.id,
        });
        setIsUpdated(true);
        setShowRouteList(false);
    };

    useEffect(() => {
        getAllDrivers()
            .then((res) => setDriverList(res.data.data))
            .catch((error) => {
                console.log(error);
            });
        getAllBuses()
            .then((res) => setBusList(res.data.data))
            .catch((error) => {
                console.log(error);
            });
        getAllRoutes()
            .then((res) => setRouteList(res.data.data))
            .catch((error) => {
                console.log(error);
            });
    }, []);

    useEffect(() => {
        if (formData.driverId) {
            setSelectedDriver(driverList.find(driver => driver.id === formData.driverId));
            setSelectedBus(busList.find(bus => bus.id === formData.busId));
            setSelectedRoute(routeList.find(route => route.id === formData.routeId));
        }
    }, [driverList, busList, routeList, formData.driverId, formData.busId, formData.routeId]);

    const [errorVisible, setErrorVisible] = useState({
        DriverId: false,
        BusId: false,
        RouteId: false,
      });
      const resetErrorVisible = () => {
        setErrorVisible({
          DriverId: false,
          BusId: false,
          RouteId: false,
        });
      };
      

    return (
        <>
            <Header />
            <ToastContainer />
            <Container className="mt--7" fluid>
                <Row>
                    <div className="col">
                        <Card className=" card-container shadow">
                            <CardHeader className="bg-transparent">
                                <h3 className="mb-0">Manager Trips</h3>
                            </CardHeader>
                            <CardBody>
                                {/* Add model */}
                                <Modal show={showAdd} onHide={handleAddClose}>
                                    <Modal.Header >
                                        <Modal.Title>Add trip</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Form>
                                            <Form.Group className="mb-3" controlId="driverId">
                                                <Form.Label>Driver</Form.Label>
                                                {errorVisible && errors.DriverId && (
                                                    <span style={{ color: "red", float: "right" }}>*{errors.DriverId[0]}</span>
                                                )}
                                                <Form.Control
                                                    type="text"
                                                    name="driverId"
                                                    placeholder="Select a driver"
                                                    value={selectedDriver ? selectedDriver.fullName : ''}
                                                    autoFocus
                                                    required
                                                    readOnly
                                                    onClick={() => {
                                                        setErrorVisible(false); // Hide the error message when the user clicks on the field again
                                                        setShowDriverList(!showDriverList);
                                                    }}
                                                />
                                                {showDriverList && <DriverList driverList={driverList} />}
                                            </Form.Group>

                                            <Form.Group className="mb-3" controlId="busId">
                                                <Form.Label>Bus</Form.Label>
                                                {errorVisible && errors.BusId && (
                                                    <span style={{ color: "red", float: "right" }}>*{errors.BusId[0]}</span>
                                                )}
                                                <Form.Control
                                                    type="text"
                                                    name="busId"
                                                    placeholder="Select a bus"
                                                    value={selectedBus ? selectedBus.licensePlate : ''}
                                                    autoFocus
                                                    required
                                                    readOnly
                                                    onClick={() => {
                                                        setErrorVisible(false); // Hide the error message when the user clicks on the field again
                                                        setShowBusList(!showBusList);
                                                    }}
                                                />
                                                {showBusList && <BusList busList={busList} />}
                                            </Form.Group>

                                            <Form.Group className="mb-3" controlId="routeId">
                                                <Form.Label>Route</Form.Label>
                                                {errorVisible && errors.RouteId && (
                                                    <span style={{ color: "red", float: "right" }}>*{errors.RouteId[0]}</span>
                                                )}
                                                <Form.Control
                                                    type="text"
                                                    name="routeId"
                                                    placeholder="Select a route"
                                                    value={selectedRoute ? `${selectedRoute.beginning} - ${selectedRoute.destination}` : ''}
                                                    autoFocus
                                                    required
                                                    readOnly
                                                    onClick={() => {
                                                        setErrorVisible(false); // Hide the error message when the user clicks on the field again
                                                        setShowRouteList(!showRouteList);
                                                    }}
                                                />
                                                {showRouteList && <RouteList routeList={routeList} />}
                                            </Form.Group>

                                        </Form>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={handleAddClose}>
                                            Close
                                        </Button>
                                        <Button variant="primary" onClick={handleAddTrip}>
                                            Add +
                                        </Button>
                                    </Modal.Footer>
                                </Modal>


                                {/* Update model  */}
                                <Modal show={showUpdate} onHide={handleUpdateClose}>
                                    <Modal.Header >
                                        <Modal.Title>Update trip</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Form>
                                            <Form.Group className="mb-3" controlId="driverId">
                                                <Form.Label>Driver</Form.Label>
                                                {errors && errors.DriverId && (
                                                    <span style={{ color: "red", float: "right" }}>*{errors.DriverId[0]}</span>
                                                )}
                                                <Form.Control
                                                    type="text"
                                                    name="driverId"
                                                    placeholder="Select a driver"
                                                    value={selectedDriver ? selectedDriver.fullName : ''}
                                                    autoFocus
                                                    required
                                                    readOnly
                                                    onClick={() => setShowDriverList(!showDriverList)}
                                                />
                                                {showDriverList && <DriverList driverList={driverList} />}
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="busId">
                                                <Form.Label>Bus</Form.Label>
                                                {errors && errors.BusId && (
                                                    <span style={{ color: "red", float: "right" }}>*{errors.BusId[0]}</span>
                                                )}
                                                <Form.Control
                                                    type="text"
                                                    name="busId"
                                                    placeholder="Select a bus"
                                                    value={selectedBus ? selectedBus.licensePlate : ''}
                                                    autoFocus
                                                    required
                                                    readOnly
                                                    onClick={() => setShowBusList(!showBusList)}
                                                />
                                                {showBusList && <BusList busList={busList} />}
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="routeId">
                                                <Form.Label>Route</Form.Label>
                                                {errors && errors.RouteId && (
                                                    <span style={{ color: "red", float: "right" }}>*{errors.RouteId[0]}</span>
                                                )}
                                                <Form.Control
                                                    type="text"
                                                    name="routeId"
                                                    placeholder="Select a route"
                                                    value={selectedRoute ? `${selectedRoute.beginning} - ${selectedRoute.destination}` : ''}
                                                    autoFocus
                                                    required
                                                    readOnly

                                                    onClick={() => setShowRouteList(!showRouteList)}
                                                />
                                                {showRouteList && <RouteList routeList={routeList} />}
                                            </Form.Group>
                                        </Form>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={handleUpdateClose}>
                                            Close
                                        </Button>
                                        <Button variant="primary" onClick={updateTripData}>
                                            Confirm
                                        </Button>
                                    </Modal.Footer>
                                </Modal>

                                {/* Table list */}
                                <div className="list">
                                    <Button variant="primary" onClick={handleAddOpen} size="md" className="add_button">Add Trip +</Button>
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentTripList.map((trip, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <span>{trip.id}</span>
                                                    </td>
                                                    <td className="registration">
                                                        <UncontrolledDropdown >
                                                            <DropdownToggle
                                                                className="btn-icon-only text-light"
                                                                role="button"
                                                                size="sm"
                                                                color=""
                                                            >
                                                                <i className="fas fa-ellipsis-v" />
                                                            </DropdownToggle>
                                                            <DropdownMenu className="dropdown-menu-arrow" right>
                                                                <DropdownItem
                                                                    className="update-dropdown-item"
                                                                    onClick={() => handleUpdateShow(trip)}
                                                                >
                                                                    Update
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
                        </Card>
                    </div>
                </Row>
            </Container>
        </>
    );
};

export default Test;