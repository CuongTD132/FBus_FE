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
    toggleStatusAPI,
    getMultiTripsAPI

} from "../../services/trip";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../../services/checkToken";
import caution from '../../assets/img/caution.png'
import {
    getMultiDriversAPI,
} from "../../services/driver";
import {
    getMultiBusesAPI,
} from "../../services/bus";
import {
    getMultiRoutesAPI,
} from "../../services/routes";

const Trips = () => {
    const navigate = useNavigate();
    const [tripList, setTripList] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [showToggleStatus, setShowToggleStatus] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [errors, setErrors] = useState({});
    const [showBackdrop, setShowBackdrop] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);
    const [sortingOrder, setSortingOrder] = useState("oldest");
    const [selectedStatus, setSelectedStatus] = useState("");
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
        getMultiTripsAPI({ status: selectedStatus })
            .then((res) => {
                let sortedDrivers = res.data.data;
                if (sortingOrder === "newest") {
                    sortedDrivers = res.data.data.sort((a, b) => b.id - a.id);
                } else if (sortingOrder === "oldest") {
                    sortedDrivers = res.data.data.sort((a, b) => a.id - b.id);
                }

                setTripList(sortedDrivers);
            })
            .catch((error) => {
                console.log(error);
            });
    };
    useEffect(() => {
        fetchTrips();
    }, [sortingOrder, selectedStatus]);;

    const handleSortingChange = (order) => {
        setSortingOrder(order);
    };

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
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
        setShowUpdate(true); // show update modal
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

    // TOGGLE STATUS FUNCTION
    const [oldStatus, setOldStatus] = useState("");
    const [toggleTripId, setToggleTripId] = useState(null);
    const handleToggleStatus = (trip) => {
        setOldStatus(trip.status)
        setToggleTripId(trip.id)
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
        toggleStatusAPI(toggleTripId, status)
            .then((res) => {
                toast.success("Successull to enable/disable status!", {
                    autoClose: 1000,
                });
                setShowToggleStatus(false);
                fetchTrips();
                getAllTrips()
                    .then((res) => {
                        setTripList(res.data.data);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            })
            .catch((e) => {
                toast.error("Failed to enable/disable status!", {
                    autoClose: 1000,
                });
                setShowToggleStatus(false);
            });
    }
    // END TOGGLE STATUS


    // DELETE FUNCTIONS
    const [deleteTripId, setDeleteTripId] = useState();
    const handleDeleteTrip = (id) => {
        setDeleteTripId(id)
        setShowDelete(true)
    };
    const deleteTrip = () => {
        const user = JSON.parse(localStorage.getItem('user'))
        if (user == null || !user || isTokenExpired()) {
            setShowBackdrop(true)
            return;
        }
        deleteTripAPI(deleteTripId)
            .then((res) => {
                if (res.status === 200) {
                    // console.log(res)
                    toast.success("Trip deleted successfully!", {
                        autoClose: 1000,
                    });
                }
                setShowDelete(false);
                fetchTrips();
            })
            .catch(() => {
                toast.error("Failed to delete the trip!", {
                    autoClose: 1000,
                });
            });
    }
    // END DELETE FUNCTIONS

    // ADD
    const handleAddTrip = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const newErrors = {};
        if (user == null || !user || isTokenExpired()) {
            setShowBackdrop(true)
            return;
        }
        if (!formData.driverId) {
            newErrors.DriverId = ['Please choose a Driver'];
        }
        if (!formData.busId) {
            newErrors.BusId = ['Please choose a Bus'];
        }
        if (!formData.routeId) {
            newErrors.RouteId = ['Please choose a Route'];
        }

        if (!formData.dateLine) {
            newErrors.DateLine = ['Please select the Date Line'];
        }

        if (!formData.dueDate) {
            newErrors.DueDate = ['Please select the Due Date'];
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (user?.accessToken) {
            try {
                const dateLineData = combineDateLine(formData);
                const dueDateData = combineDueDate(formData);
                const res = await axios.post(
                    "https://fbus-last.azurewebsites.net/api/Trips",
                    { ...formData, ...dateLineData, ...dueDateData },
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
    }
    const handleAddOpen = () => {
        setFormData({
            driverId: "",
            busId: "",
            routeId: "",
            note: "",
            dateLine: "",
            dueDate: "",
        });
        setDateLineFormData("");
        setDueDateFormData("");
        resetFormData();
        setErrors({});
        setShowAdd(true);
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
                            {bus.code} - {bus.licensePlate}
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
        getMultiDriversAPI({ status: "ACTIVE" })
            .then((res) => setDriverList(res.data.data))
            .catch((error) => {
                console.log(error);
            });
        getMultiBusesAPI({ status: 'ACTIVE' })
            .then((res) => setBusList(res.data.data))
            .catch((error) => {
                console.log(error);
            });
        getMultiRoutesAPI({ status: 'ACTIVE' })
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


    const [dateLineFormData, setDateLineFormData] = useState({
        day: "",
        month: "",
        year: "",
        hours: "",
        minutes: "",
    });

    const [dueDateFormData, setDueDateFormData] = useState({
        day1: "",
        month1: "",
        year1: "",
        hours1: "",
        minutes1: "",
    });

    const combineDateLine = (formData) => {
        const { day, month, year, hours, minutes } = formData;
        const formattedDay = day ? String(day).padStart(2, "0") : "01";
        const formattedMonth = month ? String(month).padStart(2, "0") : "01";
        const formattedYear = year ? String(year) : "YYYY";
        const formattedHours = hours ? String(hours).padStart(2, "0") : "00";
        const formattedMinutes = minutes ? String(minutes).padStart(2, "0") : "00";

        return {
            ...formData,
            dateLine: `${formattedYear}-${formattedMonth}-${formattedDay}T${formattedHours}:${formattedMinutes}`,
        };
    };

    const combineDueDate = (formData) => {
        const { day1, month1, year1, hours1, minutes1 } = formData;
        const formattedDay = day1 ? String(day1).padStart(2, "0") : "01";
        const formattedMonth = month1 ? String(month1).padStart(2, "0") : "01";
        const formattedYear = year1 ? String(year1) : "YYYY";
        const formattedHours = hours1 ? String(hours1).padStart(2, "0") : "00";
        const formattedMinutes = minutes1 ? String(minutes1).padStart(2, "0") : "00";

        return {
            ...formData,
            dueDate: `${formattedYear}-${formattedMonth}-${formattedDay}T${formattedHours}:${formattedMinutes}`,
        };
    };





    const currentYear = new Date().getFullYear();

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 2030 - currentYear + 1 }, (_, i) => currentYear + i);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);
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
                                        <Modal.Title>Enable/Disable trip</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>Are you sure to enable/disable this trip?</Modal.Body>
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
                                        <Modal.Title>Delete trip</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>Are you sure to delete this trip?</Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={() => setShowDelete(false)}>
                                            Close
                                        </Button>
                                        <Button variant="primary" onClick={() => deleteTrip()}>
                                            Delete
                                        </Button>
                                    </Modal.Footer>
                                </Modal>

                                {/* Add model */}
                                <Modal show={showAdd} onHide={handleAddClose}>
                                    <Modal.Body>
                                        <Form>
                                            <p>Cases (*) are required</p>
                                            <Form.Group className="mb-3" controlId="driverId">
                                                <Form.Label>Driver*</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="driverId"
                                                    placeholder="Select a driver"
                                                    value={selectedDriver ? selectedDriver.fullName : ''}
                                                    readOnly
                                                    onClick={() => {
                                                        setShowDriverList(!showDriverList);
                                                    }}
                                                />
                                                {showDriverList && <DriverList driverList={driverList} />}
                                                {errors && errors.DriverId && (
                                                    <span className="error-msg">{errors.DriverId}</span>
                                                )}
                                            </Form.Group>

                                            <Form.Group className="mb-3" controlId="busId">
                                                <Form.Label>Bus*</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="busId"
                                                    placeholder="Select a bus"
                                                    value={selectedBus ? selectedBus.licensePlate : ''}
                                                    readOnly
                                                    onClick={() => {
                                                        setShowBusList(!showBusList);
                                                    }}
                                                />
                                                {showBusList && <BusList busList={busList} />}
                                                {errors && errors.BusId && (
                                                    <span className="error-msg">{errors.BusId}</span>
                                                )}
                                            </Form.Group>

                                            <Form.Group className="mb-3" controlId="routeId">
                                                <Form.Label>Route*</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="routeId"
                                                    placeholder="Select a route"
                                                    value={selectedRoute ? `${selectedRoute.beginning} - ${selectedRoute.destination}` : ''}
                                                    readOnly
                                                    onClick={() => {
                                                        setShowRouteList(!showRouteList);
                                                    }}
                                                />
                                                {showRouteList && <RouteList routeList={routeList} />}
                                                {errors && errors.RouteId && (
                                                    <span className="error-msg">{errors.RouteId}</span>
                                                )}
                                            </Form.Group>
                                            <Row className="container_input">
                                                <div className="flex input-group">
                                                    <Form.Label className="align-items-center">
                                                        Note
                                                    </Form.Label>
                                                    <input
                                                        className="input-form"
                                                        type="text"
                                                        name="note"
                                                        placeholder="You can note here"
                                                        maxLength={500}
                                                        onChange={(e) => {
                                                            setFormData({
                                                                ...formData,
                                                                note: e.target.value
                                                            })
                                                            setErrors({
                                                                ...errors,
                                                                Note: null
                                                            });
                                                        }}
                                                    />
                                                </div>
                                                {errors && errors.Note && (
                                                    <span className="error-msg">{errors.Note}</span>
                                                )}
                                            </Row>
                                            <Row className="container_input">
                                                <div className="flex input-group">
                                                    <Form.Label className="align-items-center">Date Line*</Form.Label>
                                                    <div className="date-input-container">
                                                        <select
                                                            className="input-form date-input"
                                                            name="dateLineDay"
                                                            value={dateLineFormData.day || ""}
                                                            onChange={(e) => {
                                                                const day = e.target.value;
                                                                setDateLineFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    day,
                                                                }));
                                                                setFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    ...combineDateLine({ ...prevFormData, day }, "dateLine"),
                                                                }));
                                                            }}
                                                        >
                                                            <option value="">DD</option>
                                                            {days.map((day) => (
                                                                <option key={day} value={day}>
                                                                    {day}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <span className="date-separator">/</span>
                                                        <select
                                                            className="input-form date-input"
                                                            name="dateLineMonth"
                                                            value={dateLineFormData.month || ""}
                                                            onChange={(e) => {
                                                                const month = e.target.value;
                                                                setDateLineFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    month,
                                                                }));
                                                                setFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    ...combineDateLine({ ...prevFormData, month }, "dateLine"),
                                                                }));
                                                            }}
                                                        >
                                                            <option value="">MM</option>
                                                            {months.map((month) => (
                                                                <option key={month} value={month}>
                                                                    {month}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <span className="date-separator">/</span>
                                                        <select
                                                            className="input-form date-input"
                                                            name="dateLineYear"
                                                            value={dateLineFormData.year || ""}
                                                            onChange={(e) => {
                                                                const year = e.target.value;
                                                                setDateLineFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    year,
                                                                }));
                                                                setFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    ...combineDateLine({ ...prevFormData, year }, "dateLine"),
                                                                }));
                                                            }}
                                                        >
                                                            <option value="">YYYY</option>
                                                            {years.map((year) => (
                                                                <option key={year} value={year}>
                                                                    {year}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <span className="date-separator"> </span>
                                                        <select
                                                            className="input-form date-input"
                                                            name="dateLineHours"
                                                            value={dateLineFormData.hours || ""}
                                                            onChange={(e) => {
                                                                const hours = e.target.value;
                                                                setDateLineFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    hours,
                                                                }));
                                                                setFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    ...combineDateLine({ ...prevFormData, hours }, "dateLine"),
                                                                }));
                                                            }}
                                                        >
                                                            <option value="">HH</option>
                                                            {hours.map((hour) => (
                                                                <option key={hour} value={hour}>
                                                                    {hour}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <span className="date-separator">:</span>
                                                        <select
                                                            className="input-form date-input"
                                                            name="dateLineMinutes"
                                                            value={dateLineFormData.minutes || ""}
                                                            onChange={(e) => {
                                                                const minutes = e.target.value;
                                                                setDateLineFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    minutes,
                                                                }));
                                                                setFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    ...combineDateLine({ ...prevFormData, minutes }, "dateLine"),
                                                                }));
                                                            }}
                                                        >
                                                            <option value="">mm</option>
                                                            {minutes.map((minute) => (
                                                                <option key={minute} value={minute}>
                                                                    {minute}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                {errors && errors.DateLine && (
                                                    <span className="error-msg">{errors.DateLine}</span>
                                                )}
                                            </Row>
                                            <Row className="container_input">
                                                <div className="flex input-group">
                                                    <Form.Label className="align-items-center">Due Date*</Form.Label>
                                                    <div className="date-input-container">
                                                        <select
                                                            className="input-form date-input"
                                                            name="dueDateDay"
                                                            value={dueDateFormData.day1 || ""}
                                                            onChange={(e) => {
                                                                const day1 = e.target.value;
                                                                setDueDateFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    day1,
                                                                }));
                                                                setFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    ...combineDueDate({ ...prevFormData, day1 }, "dueDate"),
                                                                }));
                                                            }}
                                                        >
                                                            <option value="">DD</option>
                                                            {days.map((day1) => (
                                                                <option key={day1} value={day1}>
                                                                    {day1}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <span className="date-separator">/</span>
                                                        <select
                                                            className="input-form date-input"
                                                            name="dueDateMonth"
                                                            value={dueDateFormData.month1 || ""}
                                                            onChange={(e) => {
                                                                const month1 = e.target.value;
                                                                setDueDateFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    month1,
                                                                }));
                                                                setFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    ...combineDueDate({ ...prevFormData, month1 }, "dueDate"),
                                                                }));
                                                            }}
                                                        >
                                                            <option value="">MM</option>
                                                            {months.map((month1) => (
                                                                <option key={month1} value={month1}>
                                                                    {month1}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <span className="date-separator">/</span>
                                                        <select
                                                            className="input-form date-input"
                                                            name="dueDateYear"
                                                            value={dueDateFormData.year1 || ""}
                                                            onChange={(e) => {
                                                                const year1 = e.target.value;
                                                                setDueDateFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    year1,
                                                                }));
                                                                setFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    ...combineDueDate({ ...prevFormData, year1 }, "dueDate"),
                                                                }));
                                                            }}
                                                        >
                                                            <option value="">YYYY</option>
                                                            {years.map((year1) => (
                                                                <option key={year1} value={year1}>
                                                                    {year1}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <span className="date-separator"> </span>
                                                        <select
                                                            className="input-form date-input"
                                                            name="dueDateHours"
                                                            value={dueDateFormData.hours1 || ""}
                                                            onChange={(e) => {
                                                                const hours1 = e.target.value;
                                                                setDueDateFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    hours1,
                                                                }));
                                                                setFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    ...combineDueDate({ ...prevFormData, hours1 }, "dueDate"),
                                                                }));
                                                            }}
                                                        >
                                                            <option value="">HH</option>
                                                            {hours.map((hours1) => (
                                                                <option key={hours1} value={hours1}>
                                                                    {hours1}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <span className="date-separator">:</span>
                                                        <select
                                                            className="input-form date-input"
                                                            name="dueDateMinutes"
                                                            value={dueDateFormData.minutes1 || ""}
                                                            onChange={(e) => {
                                                                const minutes1 = e.target.value;
                                                                setDueDateFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    minutes1,
                                                                }));
                                                                setFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    ...combineDueDate({ ...prevFormData, minutes1 }, "dueDate"),
                                                                }));
                                                            }}
                                                        >
                                                            <option value="">mm</option>
                                                            {minutes.map((minute1) => (
                                                                <option key={minute1} value={minute1}>
                                                                    {minute1}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                {errors && errors.DueDate && (
                                                    <span className="error-msg">{errors.DueDate}</span>
                                                )}
                                            </Row>
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
                                                    <span style={{ color: "red", float: "right" }}>*{errors.DriverId}</span>
                                                )}
                                                <Form.Control
                                                    type="text"
                                                    name="driverId"
                                                    placeholder="Select a driver"
                                                    value={selectedDriver ? selectedDriver.fullName : ''}
                                                    readOnly
                                                    onClick={() => setShowDriverList(!showDriverList)}
                                                />
                                                {showDriverList && <DriverList driverList={driverList} />}
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="busId">
                                                <Form.Label>Bus</Form.Label>
                                                {errors && errors.BusId && (
                                                    <span style={{ color: "red", float: "right" }}>*{errors.BusId}</span>
                                                )}
                                                <Form.Control
                                                    type="text"
                                                    name="busId"
                                                    placeholder="Select a bus"
                                                    value={selectedBus ? selectedBus.licensePlate : ''}
                                                    readOnly
                                                    onClick={() => setShowBusList(!showBusList)}
                                                />
                                                {showBusList && <BusList busList={busList} />}
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="routeId">
                                                <Form.Label>Route</Form.Label>
                                                {errors && errors.RouteId && (
                                                    <span style={{ color: "red", float: "right" }}>*{errors.RouteId}</span>
                                                )}
                                                <Form.Control
                                                    type="text"
                                                    name="routeId"
                                                    placeholder="Select a route"
                                                    value={selectedRoute ? `${selectedRoute.beginning} - ${selectedRoute.destination}` : ''}
                                                    readOnly
                                                    onClick={() => setShowRouteList(!showRouteList)}
                                                />
                                                {showRouteList && <RouteList routeList={routeList} />}
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="note">
                                                <Form.Label>Note</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="note"
                                                    placeholder="No note available"
                                                    value={formData.note || ""}
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            note: e.target.value
                                                        })

                                                        setIsUpdated(true);
                                                    }}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="dateLine">
                                                <Form.Label>Date Line(MM-DD-YYYY HH:mm)</Form.Label>
                                                {errors && errors.DateLine && (
                                                    <span style={{ color: "red", float: "right" }}>*{errors.DateLine}</span>
                                                )}
                                                <Form.Control
                                                    type="datetime-local"
                                                    name="dateLine"
                                                    required
                                                    value={formData.dateLine}
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            dateLine: e.target.value
                                                        });
                                                        setErrors({
                                                            ...errors,
                                                            DateLine: null
                                                        });
                                                        setIsUpdated(true);
                                                    }}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="dueDate">
                                                <Form.Label>Due Date(MM-DD-YYYY HH:mm)</Form.Label>
                                                {errors && errors.DueDate && (
                                                    <span style={{ color: "red", float: "right" }}>*{errors.DueDate}</span>
                                                )}
                                                <Form.Control
                                                    type="datetime-local"
                                                    name="dueDate"
                                                    required
                                                    value={formData.dueDate}
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            dueDate: e.target.value
                                                        });
                                                        setErrors({
                                                            ...errors,
                                                            DueDate: null
                                                        });
                                                        setIsUpdated(true);
                                                    }}
                                                />
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
                                                <option value="FINISHED">Finished</option>
                                                <option value="ONGOING">On Going</option>
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
                                                <option value="oldest">Oldest Trips</option>
                                                <option value="newest">Newest Trips</option>
                                            </select>
                                        </div>
                                        <Button variant="primary" onClick={handleAddOpen} size="md" className="add_button">Add Trip +</Button>
                                    </div>
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th>Driver</th>
                                                <th>Bus Code</th>
                                                <th>Beginning</th>
                                                <th>Destination</th>
                                                <th style={{ width: "200px" }}>Date Line - Due Date</th>
                                                <th>Status</th>
                                                <th>More</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentTripList.map((trip, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <span>{trip.id}</span>
                                                    </td>
                                                    <td>
                                                        <span className="link-style1" >{trip.driver.fullName}</span>

                                                    </td>
                                                    <td>
                                                        <span className="link-style1">{trip.bus.code}</span>
                                                    </td>
                                                    <td>
                                                        <span className="link-style1">{trip.route.beginning}</span>
                                                    </td>
                                                    <td>
                                                        <span className="link-style1">{trip.route.destination}</span>
                                                    </td>
                                                    <td>
                                                        <span className="link-style1">
                                                            {trip.dateLine && format(new Date(trip.dateLine), 'MM-dd-yyyy HH:mm')}
                                                            <hr style={{ margin: "10px 0", width: "150px" }} />
                                                            {trip.dueDate && format(new Date(trip.dueDate), 'MM-dd-yyyy HH:mm')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status ${trip.status === 'ACTIVE' ? 'active' : trip.status === 'INACTIVE' ? 'inactive' : trip.status === 'ONGOING' ? 'ongoing' : trip.status === 'FINISHED' ? 'finished' : ''}`}>
                                                            {trip.status}
                                                        </span>
                                                    </td>
                                                    <td className={`registration ${trip.status === "DELETED" ? "disable-actions" : ""}`}>
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
                                                                <DropdownItem
                                                                    className="disable-enable-dropdown-item"
                                                                    onClick={() => {
                                                                        handleToggleStatus(trip)
                                                                    }}
                                                                >
                                                                    Enable/Disable
                                                                </DropdownItem>
                                                                <DropdownItem
                                                                    className="delete-dropdown-item"
                                                                    onClick={() => handleDeleteTrip(trip.id)}
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

export default Trips;