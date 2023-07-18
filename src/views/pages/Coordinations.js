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
    // addCoordinationAPI,
    // updateCoordinationAPI,
    getSingleCoordination,
    getAllCoordinations,
    deleteCoordinationAPI,
    toggleStatusAPI

} from "../../services/coordinations";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../../services/checkToken";

const Coords = () => {
    const navigate = useNavigate();
    const [coordinationList, setCoordinationList] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showToggleStatus, setShowToggleStatus] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
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
            getAllCoordinations(user.accessToken)
                .then((res) => {
                    if (res && res.data && res.data.data) {
                        setCoordinationList(res.data.data);
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
    const fetchCoordinationDetails = (id) => {
        getSingleCoordination(id)
            .then((res) => {
                setFormData(res.data)
            })
    };


    const handleShowDetails = (id) => {
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
            fetchCoordinationDetails(id);
            setShowDetails(true); // Show the modal
        }
    }

    // --UPDATE FUNCTIONS
    const handleUpdateClose = () => {
        setShowUpdate(false);
    }
    const handleUpdateShow = (coordination) => {
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
            fetchCoordinationDetails(coordination.id); // fetch old data       
            setShowUpdate(true); // show update modal
        }
    };
    const updateCoordinationData = async () => {
        if (formData.note === null) {
            formData.note = "";
        }
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await axios.put(
                `https://fbus-final.azurewebsites.net/api/coordinations/${formData.id}`,
                formData,
                {
                    headers: {
                        "Authorization": `Bearer ${user.accessToken}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
    
            if (res.status === 200) {
                toast.success("Coordination updated successfully!", {
                    autoClose: 1000,
                });
            }
            setShowUpdate(false);
            try {
                const response = await getAllCoordinations();
                setCoordinationList(response.data.data);
            } catch (error) {
                console.log(error);
            }
        } catch (e) {
            if (e.response && e.response.status === 401) {
                toast("You need to log in again to continue!", {
                    autoClose: 1000,
                });
                navigate("/auth/login");
            } else {
                toast.error("Failed to update the coordination!", {
                    autoClose: 1000,
                });
                setShowUpdate(true);
            }
        }
    };
    

    // END UPDATE FUNCTIONS

    // TOGGLE STATUS FUNCTION
    const [oldStatus, setOldStatus] = useState("");
    const [toggleCoordinationId, setToggleCoordinationId] = useState(null);
    const handleToggleStatus = (coordination) => {
        setOldStatus(coordination.status)
        setToggleCoordinationId(coordination.id)
        setShowToggleStatus(true);
    }
    const toggleStatus = () => {
        let status = "INACTIVE";
        if (oldStatus === "INACTIVE") {
            status = "ACTIVE"
        }
        toggleStatusAPI(toggleCoordinationId, status)
            .then((res) => {
                toast.success("Successull to enable/disable status!", {
                    autoClose: 1000,
                });
                setShowToggleStatus(false);
                getAllCoordinations()
                    .then((res) => {
                        setCoordinationList(res.data.data);
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
    const [deleteCoordinationId, setDeleteCoordinationId] = useState();
    const handleDeleteCoordination = (id) => {
        if (isTokenExpired()) {
            toast("You need to log in again to continue!", {
                autoClose: 1000,
                onClose: () => {
                    navigate("/auth/login");
                },
            });
        } else {
            setDeleteCoordinationId(id)
            setShowDelete(true)
        }
    };
    const deleteCoordination = () => {
        deleteCoordinationAPI(deleteCoordinationId)
            .then((res) => {
                if (res.status === 200) {
                    // console.log(res)
                    toast.success("Coordination deleted successfully!", {
                        autoClose: 1000,
                    });
                }
                setShowDelete(false);
                getAllCoordinations()
                    .then((res) => {
                        setCoordinationList(res.data.data);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            })
            .catch((e) => {
                if (e.response && e.response.status === 401) {
                    toast("You need to log in again to continue!", {
                        autoClose: 1000,
                    });
                    navigate("/auth/login");
                } else {
                    toast.error("Failed to delete the coordination!", {
                        autoClose: 1000,
                    });
                }
            });
    }
    // END DELETE FUNCTIONS

    // ADD
    const handleAddCoordination = async () => {
        const user = JSON.parse(localStorage.getItem('user'));

        if (user?.accessToken) {
            try {
                const res = await axios.post(
                    "https://fbus-final.azurewebsites.net/api/coordinations",
                    formData,
                    {
                        headers: {
                            "Authorization": `Bearer ${user.accessToken}`,
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );

                if (res.status === 200) {
                    toast.success("Coordination has been added successfully!", {
                        autoClose: 1000,
                    });
                    setShowAdd(false);
                }
            } catch (e) {
                if (e.response && e.response.status === 401) {
                    toast("You need to log in again to continue!", {
                        autoClose: 1000,
                    });
                    navigate("/auth/login");
                } else {
                    toast.error("Failed to add this coordination!", {
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
    const [currentCoordinationList, setCurrentCoordinationList] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setTotalPages(Math.ceil(coordinationList.length / itemsPerPage));
        setStartIndex((currentPage - 1) * itemsPerPage);
    }, [coordinationList, currentPage]);

    useEffect(() => {
        setEndIndex(startIndex + itemsPerPage);
        setCurrentCoordinationList(coordinationList.slice(startIndex, endIndex));
    }, [coordinationList, startIndex, endIndex]);

    useEffect(() => {
        setCurrentPage(1);
    }, [coordinationList.length]);

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    // END PAGING



    return (
        <>
            <Header />
            <ToastContainer />
            <Container className="mt--7" fluid>
                <Row>
                    <div className="col">
                        <Card className=" card-container shadow">
                            <CardHeader className="bg-transparent">
                                <h3 className="mb-0">Manager Coordinations</h3>
                            </CardHeader>
                            <CardBody>

                                <Modal show={showToggleStatus} onHide={() => setShowToggleStatus(false)} animation={true}>
                                    <Modal.Header >
                                        <Modal.Title>Enable/Disable coordination</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>Are you sure to enable/disable this coordination?</Modal.Body>
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
                                        <Modal.Title>Delete coordination</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>Are you sure to delete this coordination?</Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={() => setShowDelete(false)}>
                                            Close
                                        </Button>
                                        <Button variant="primary" onClick={() => deleteCoordination()}>
                                            Delete
                                        </Button>
                                    </Modal.Footer>
                                </Modal>

                                {/* Add model */}
                                <Modal show={showAdd} onHide={handleAddClose}>
                                    <Modal.Header >
                                        <Modal.Title>Add coordination</Modal.Title>
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
                                        <Button variant="primary" onClick={handleAddCoordination}>
                                            Add +
                                        </Button>
                                    </Modal.Footer>
                                </Modal>

                                {/* Detail model */}
                                <Modal show={showDetails} onHide={() => setShowDetails(false)}>
                                    <Modal.Header >
                                        <Modal.Title>Coordination detail</Modal.Title>
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
                                                    readOnly
                                                    value={formData.driverId}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="busId">
                                                <Form.Label>BusID</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="busId"
                                                    placeholder="BusID"
                                                    autoFocus
                                                    readOnly
                                                    value={formData.busId}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="routeId">
                                                <Form.Label>RouteID</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="routeId"
                                                    placeholder="RouteID"
                                                    autoFocus
                                                    readOnly
                                                    value={formData.routeId}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="note">
                                                <Form.Label>Note</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="note"
                                                    readOnly
                                                    placeholder="No note available"
                                                    value={formData.note || ""}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="dateLine">
                                                <Form.Label>Date Line(MM-DD-YYYY HH:mm)</Form.Label>
                                                <Form.Control
                                                    type="datetime-local"
                                                    name="dateLine"
                                                    readOnly
                                                    value={formData.dateLine}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="dueDate">
                                                <Form.Label>Due Date(MM-DD-YYYY HH:mm)</Form.Label>
                                                <Form.Control
                                                    type="datetime-local"
                                                    name="dueDate"
                                                    readOnly
                                                    value={formData.dueDate}
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
                                {/* Update model  */}
                                <Modal show={showUpdate} onHide={handleUpdateClose}>
                                    <Modal.Header >
                                        <Modal.Title>Update coordination</Modal.Title>
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
                                                    }}
                                                />
                                            </Form.Group>
                                        </Form>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={handleUpdateClose}>
                                            Close
                                        </Button>
                                        <Button variant="primary" onClick={updateCoordinationData}>
                                            Confirm
                                        </Button>
                                    </Modal.Footer>
                                </Modal>

                                {/* Table list */}
                                <div className="list">
                                    <Button variant="primary" onClick={handleAddOpen} size="md" className="add_button">Add Coordination +</Button>
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                {/* <th>Driver ID </th> */}
                                                <th>Driver Code</th>
                                                {/* <th>Bus Id</th> */}
                                                <th>Bus Code</th>
                                                {/* <th>License Plate</th> */}
                                                {/* <th>Route Id</th> */}
                                                <th>Beginning</th>
                                                <th>Destination</th>
                                                <th>Date Line</th>
                                                <th>Due Date</th>
                                                <th>Status</th>
                                                <th>More</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentCoordinationList.map((coordination, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <span>{coordination.id}</span>
                                                    </td>
                                                    {/* <td>
                                                        <span className="link-style" onClick={(e) => {
                                                            e.preventDefault()
                                                            // handleShowDetails(coordination.id)
                                                        }}>{coordination.driverId ? coordination.driverId : "none"}</span>
                                                    </td> */}
                                                    <td>
                                                        <span className="link-style" onClick={(e) => {
                                                            e.preventDefault()
                                                            handleShowDetails(coordination.id)
                                                        }}>{coordination.driverCode}</span>

                                                    </td>
                                                    {/* <td>
                                                        <span className="link-style" onClick={(e) => {
                                                            e.preventDefault()
                                                            handleShowDetails(coordination.id)
                                                        }}>{coordination.busId ? coordination.busId : "none"}</span>
                                                    </td> */}
                                                    <td>
                                                        <span className="link-style" onClick={(e) => {
                                                            e.preventDefault()
                                                            handleShowDetails(coordination.id)
                                                        }}>{coordination.busCode}</span>
                                                    </td>
                                                    {/* <td>
                                                        <span className="link-style" onClick={(e) => {
                                                            e.preventDefault()
                                                            handleShowDetails(coordination.id)
                                                        }}>{coordination.licensePlate ? coordination.licensePlate : "none"}</span>
                                                    </td> */}
                                                    {/* <td>
                                                        <span className="link-style" onClick={(e) => {
                                                            e.preventDefault()
                                                            handleShowDetails(coordination.id)
                                                        }}>{coordination.routeId ? coordination.routeId : "none"}</span>
                                                    </td> */}
                                                    <td>
                                                        <span className="link-style" onClick={(e) => {
                                                            e.preventDefault()
                                                            handleShowDetails(coordination.id)
                                                        }}>{coordination.beginning}</span>
                                                    </td>
                                                    <td>
                                                        <span className="link-style" onClick={(e) => {
                                                            e.preventDefault()
                                                            handleShowDetails(coordination.id)
                                                        }}>{coordination.destination}</span>
                                                    </td>
                                                    <td>
                                                        <span className="link-style" onClick={(e) => {
                                                            e.preventDefault();
                                                            handleShowDetails(coordination.id);
                                                        }}>
                                                            {coordination.dueDate && format(new Date(coordination.dateLine), 'MM-dd-yyyy HH:mm')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="link-style" onClick={(e) => {
                                                            e.preventDefault();
                                                            handleShowDetails(coordination.id);
                                                        }}>
                                                            {coordination.dueDate && format(new Date(coordination.dueDate), 'MM-dd-yyyy HH:mm')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status ${coordination.status === 'ACTIVE' ? 'active' : coordination.status === 'INACTIVE' ? 'inactive' : ''}`}>
                                                            {coordination.status}
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
                                                                    onClick={() => handleUpdateShow(coordination)}
                                                                >
                                                                    Update
                                                                </DropdownItem>
                                                                <DropdownItem
                                                                    className="disable-enable-dropdown-item"
                                                                    onClick={() => {
                                                                        handleToggleStatus(coordination)
                                                                    }}
                                                                >
                                                                    Enable/Disable
                                                                </DropdownItem>
                                                                <DropdownItem
                                                                    className="delete-dropdown-item"
                                                                    onClick={() => handleDeleteCoordination(coordination.id)}
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

export default Coords;