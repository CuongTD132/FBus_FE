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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../../services/checkToken";
import caution from '../../assets/img/caution.png'


const Trips = () => {
    const navigate = useNavigate();
    const [tripList, setTripList] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [showToggleStatus, setShowToggleStatus] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [setErrors] = useState({});
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
    const fetchTripDetails = (id) => {
        getSingleTrip(id)
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
    }
    const handleUpdateShow = (trip) => {
        if (isTokenExpired()) {
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
                },
            });
        } else {
            fetchTripDetails(trip.id); // fetch old data       
            setShowUpdate(true); // show update modal
        }
    };
    const updateTripData = async () => {
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
    const [deleteTripId, setDeleteTripId] = useState();
    const handleDeleteTrip = (id) => {
        if (isTokenExpired()) {
            toast("You need to log in again to continue!", {
                autoClose: 1000,
                onClose: () => {
                    navigate("/auth/login");
                },
            });
        } else {
            setDeleteTripId(id)
            setShowDelete(true)
        }
    };
    const deleteTrip = () => {
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
                if (e.response && e.response.status === 401) {
                    toast("You need to log in again to continue!", {
                        autoClose: 1000,
                    });
                    navigate("/auth/login");
                } else {
                    toast.error("Failed to add this trip!", {
                        autoClose: 1000,
                    });
                    setShowAdd(true);
                }
            }
        }
    };

    const handleAddClose = () => {
        setShowAdd(false);
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
                                    <Modal.Header >
                                        <Modal.Title>Add trip</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Form>
                                            <Form.Group className="mb-3" controlId="driverId">
                                                <Form.Label>DriverID</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="driverId"
                                                    placeholder="DriverID"
                                                    autoFocus
                                                    required
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            driverId: e.target.value
                                                        });
                                                    }}
                                                />

                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="busId">
                                                <Form.Label>BusID</Form.Label>

                                                <Form.Control
                                                    type="number"
                                                    name="busId"
                                                    placeholder="BusID"
                                                    autoFocus
                                                    required
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            busId: e.target.value
                                                        })
                                                    }}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="routeId">
                                                <Form.Label>RouteID</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="routeId"
                                                    placeholder="RouteID"
                                                    autoFocus
                                                    required
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            routeId: e.target.value
                                                        })
                                                    }}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="note">
                                                <Form.Label>Note</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="note"
                                                    placeholder="Note"
                                                    value={formData.note || ""}
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            note: e.target.value
                                                        })
                                                    }}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="dateLine">
                                                <Form.Label>Date Line(MM-DD-YYYY HH:mm)</Form.Label>
                                                <Form.Control
                                                    type="datetime-local"
                                                    name="dateLine"
                                                    required
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            dateLine: e.target.value
                                                        });
                                                    }}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="dueDate">
                                                <Form.Label>Due Date(MM-DD-YYYY HH:mm)</Form.Label>
                                                <Form.Control
                                                    type="datetime-local"
                                                    name="dateLine"
                                                    required
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            dueDate: e.target.value
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
                                                <Form.Label>DriverID</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="driverId"
                                                    placeholder="DriverID"
                                                    autoFocus
                                                    required
                                                    value={formData.driverId}
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            driverId: e.target.value
                                                        })

                                                        setIsUpdated(true);
                                                    }}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="busId">
                                                <Form.Label>BusID</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="busId"
                                                    placeholder="BusID"
                                                    autoFocus
                                                    required
                                                    value={formData.busId}
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            busId: e.target.value
                                                        })

                                                        setIsUpdated(true);
                                                    }}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="routeId">
                                                <Form.Label>RouteID</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="routeId"
                                                    placeholder="RouteID"
                                                    autoFocus
                                                    required
                                                    value={formData.routeId}
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            routeId: e.target.value
                                                        })

                                                        setIsUpdated(true);
                                                    }}
                                                />
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

                                                        setIsUpdated(true);
                                                    }}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="dueDate">
                                                <Form.Label>Due Date(MM-DD-YYYY HH:mm)</Form.Label>
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
                                    <Button variant="primary" onClick={handleAddOpen} size="md" className="add_button">Add Trip +</Button>
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th>Driver Name</th>
                                                <th>Bus License Plate</th>
                                                <th>Beginning</th>
                                                <th>Destination</th>
                                                <th>Date Line</th>
                                                <th>Due Date</th>
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
                                                        <span className="link-style" onClick={(e) => {
                                                            e.preventDefault()
                                                        }}>{trip.driver.fullName}</span>

                                                    </td>
                                                    <td>
                                                        <span className="link-style" onClick={(e) => {
                                                            e.preventDefault()
                                                        }}>{trip.bus.licensePlate}</span>
                                                    </td>
                                                    <td>
                                                        <span className="link-style" onClick={(e) => {
                                                            e.preventDefault()
                                                        }}>{trip.route.beginning}</span>
                                                    </td>
                                                    <td>
                                                        <span className="link-style" onClick={(e) => {
                                                            e.preventDefault()
                                                        }}>{trip.route.destination}</span>
                                                    </td>
                                                    <td>
                                                        <span className="link-style" onClick={(e) => {
                                                            e.preventDefault();
                                                        }}>
                                                            {trip.dueDate && format(new Date(trip.dueDate), 'MM-dd-yyyy HH:mm')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="link-style" onClick={(e) => {
                                                            e.preventDefault();
                                                        }}>
                                                            {trip.dateLine && format(new Date(trip.dateLine), 'MM-dd-yyyy HH:mm')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status ${trip.status === 'ACTIVE' ? 'active' : trip.status === 'INACTIVE' ? 'inactive' : trip.status === 'ONGOING' ? 'ongoing': trip.status === 'FINISHED' ? 'finished': ''}`}>
                                                            {trip.status}
                                                        </span>
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