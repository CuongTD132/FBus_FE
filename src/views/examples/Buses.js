import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Table } from 'react-bootstrap';
import "../../style/Manager.css"
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
  getAllBuses,
  getSingleBus,
  updateBusAPI,
  deleteBusAPI,
  toggleStatusAPI,
  addBusAPI,
  getMultiBusesAPI
} from "../../services/bus";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateBus } from "../../redux/reducer";



const Buses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [busList, setBusList] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showToggleStatus, setShowToggleStatus] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    licensePlate: "",
    brand: "",
    model: "",
    color: "",
    seat: "",
    dateOfRegistration: "",
  });

  // Check token
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user == null || !user) {
      navigate('/auth/login');
    }
    if (user?.accessToken) {
      getAllBuses(user.refreshToken)
        .then((res) => setBusList(res.data.data))
        .catch(() => {
          // fetchNewAccessToken();
        })
    }
    getAllBuses(user?.accessToken)
      .then((res) => {
        setBusList(res.data.data)
      })
  }, [])

  // Fetch detail information and pass to detail form
  const fetchBusDetails = (id) => {
    getSingleBus(id)
      .then((res) => {
        setFormData(res.data)
      })
  };

  // Fetch list of bus and pass to table
  const fetchBuses = () => {
    if(currentSearch != "") {
      getMultiBusesAPI({
        licensePlate: currentSearch,
        code: currentSearch
      }).then((res) => {
        console.log(res.data.data)
        if (res.data.data != null) {
          dispatch(updateBus(res.data.data))
        } else {
          dispatch(updateBus([]))
        }
      })
    }else if (busList.length == 0) {
      getAllBuses()
        .then((res) => setBusList(res.data.data))
        .catch((error) => {
          console.log(error);
        });
    } 
  };

  // Call show detail form
  const handleShowDetails = (id) => {
    fetchBusDetails(id);
    setShowDetails(true); // Show the modal
  }

  // --UPDATE FUNCTIONS
  const handleUpdateClose = () => {
    setShowUpdate(false);
  }
  const handleUpdateShow = (bus) => {
    fetchBusDetails(bus.id); // fetch old data
    setShowUpdate(true); // show update modal
  };
  const updateBusData = () => {
    updateBusAPI(formData, formData.id)
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          toast.success("Bus update successfully!");
        } else {
          toast.warning("Can't update this bus!");
        }
        setShowUpdate(false);
        fetchBuses();
      })
      .catch(() => {
        toast.error("Failed to update the bus!");
      })
  }
  // END UPDATE FUNCTIONS

  // TOGGLE STATUS FUNCTION
  const [oldStatus, setOldStatus] = useState("");
  const [toggleBusId, setToggleBusId] = useState(null);
  const handleToggleStatus = (bus) => {
    setOldStatus(bus.status)
    setToggleBusId(bus.id)
    setShowToggleStatus(true);
  }
  const toggleStatus = () => {
    let status = "INACTIVE";
    if (oldStatus == "INACTIVE") {
      status = "ACTIVE"
    }
    toggleStatusAPI(toggleBusId, status)
      .then((res) => {
        toast.success("Successull to enable/disable status!")
        setShowToggleStatus(false);
        fetchBuses()
      })
      .catch(() => {
        toast.error("Failed to enable/disable status!")
        setShowToggleStatus(false);
      });
  }
  // END TOGGLE STATUS

  // DELETE FUNCTIONS
  const [deleteBusId, setDeleteBusId] = useState();
  const handleDeleteBus = (id) => {
    setDeleteBusId(id)
    setShowDelete(true)
  };
  const deleteBus = () => {
    deleteBusAPI(deleteBusId)
      .then((res) => {
        if (res.status === 200) {
          toast.success("Bus deleted successfully!");
        } else {
          toast.warning("Can't delete the bus!");
        }
        setShowDelete(false);
        fetchBuses();
      })
      .catch((e) => {
        // toast.error("Failed to delete the bus!");
        toast.error(e)
      })
  }
  // END DELETE FUNCTIONS

  // ADD
  const handleAddBus = () => {
    addBusAPI(formData)
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          toast.success("Bus has been add successfully!");
          fetchBuses()
          setShowAdd(false);
        }
      })
      .catch((error) => {
        setShowAdd(false);
      });
  };
  const handleAddClose = () => {
    setShowAdd(false);
    setFormData({
      code: "",
      licensePlate: "",
      brand: "",
      model: "",
      color: "",
      seat: "",
      dateOfRegistration: "",
    })
  }
  // END ADD

  // PAGING
  const itemsPerPage = 5;
  const [currentBusList, setCurrentBusList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    setTotalPages(Math.ceil(busList.length / itemsPerPage));
    setStartIndex((currentPage - 1) * itemsPerPage);
  }, [busList, currentPage]);
  useEffect(() => {
    setEndIndex(startIndex + itemsPerPage);
    setCurrentBusList(busList.slice(startIndex, endIndex));
  }, [busList, startIndex, endIndex]);
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // END PAGING

  // REDUX
  const buses = useSelector((state) => state.buses.value);
  const currentSearch = useSelector((state) => state.buses.currentSearch);
  React.useEffect(() => {
    setBusList(buses)
  }, [buses])
  // END REDUX

  return (
    <>
      <Header />
      <ToastContainer />
      <Container className="mt--7 bus_manager" fluid>
        <Row>
          <div className="col">
            <Card className=" card-container shadow">
              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Manager Buses</h3>
              </CardHeader>
              <CardBody>


                <Modal show={showToggleStatus} onHide={() => setShowToggleStatus(false)} animation={false}>
                  <Modal.Header closeButton>
                    <Modal.Title>Enable/Disable bus</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to enable/disable this bus?</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowToggleStatus(false)}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={toggleStatus}>
                      Enable
                    </Button>
                  </Modal.Footer>
                </Modal>

                <Modal show={showDelete} onHide={() => setShowDelete(false)} animation={false}>
                  <Modal.Header closeButton>
                    <Modal.Title>Delete bus</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to delete this bus?</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDelete(false)}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={() => deleteBus()}>
                      Delete
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Add model */}
                <Modal show={showAdd} onHide={handleAddClose}>
                  <Modal.Header closeButton>
                    <Modal.Title>Add bus</Modal.Title>
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
                      <Form.Group className="mb-3" controlId="licensePlate">
                        <Form.Label>License Plate</Form.Label>
                        <Form.Control
                          type="text"
                          name="licensePlate"
                          placeholder="licensePlate"
                          autoFocus
                          required
                          value={formData.licensePlate}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              licensePlate: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="brand">
                        <Form.Label>Brand</Form.Label>
                        <Form.Control
                          type="text"
                          name="brand"
                          placeholder="Brand"
                          autoFocus
                          required
                          value={formData.brand}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              brand: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="model">
                        <Form.Label>Model</Form.Label>
                        <Form.Control
                          type="text"
                          name="model"
                          placeholder="Model"
                          autoFocus
                          required
                          value={formData.model}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              model: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="color">
                        <Form.Label>Color</Form.Label>
                        <Form.Control
                          type="text"
                          name="color"
                          placeholder="Color"
                          autoFocus
                          required
                          value={formData.color}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              color: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="seat">
                        <Form.Label>Seat</Form.Label>
                        <Form.Control
                          type="number"
                          name="seat"
                          placeholder="1"
                          autoFocus
                          required
                          value={formData.seat}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              seat: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="dateOfRegistration">
                        <Form.Label>Date of Registration</Form.Label>
                        <Form.Control
                          type="date"
                          name="dateOfRegistration"
                          placeholder="YYYY-MM-DD"
                          autoFocus
                          required
                          value={formData.dateOfRegistration}
                          onChange={(e) => {
                            const inputDate = e.target.value;
                            const formattedDate = inputDate
                              .split("-")
                              .map((part) => part.padStart(2, "0"))
                              .join("-");

                            setFormData({
                              ...formData,
                              dateOfRegistration: formattedDate
                            })
                          }}
                        />
                      </Form.Group>
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleAddClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={handleAddBus}>
                      Add +
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Detail model */}
                <Modal show={showDetails} onHide={() => setShowDetails(false)}>
                  <Modal.Header closeButton>
                    <Modal.Title>Bus detail</Modal.Title>
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
                          readOnly
                          value={formData.code}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="licensePlate">
                        <Form.Label>License Plate</Form.Label>
                        <Form.Control
                          type="text"
                          name="licensePlate"
                          placeholder="licensePlate"
                          autoFocus
                          readOnly
                          value={formData.licensePlate}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="brand">
                        <Form.Label>Brand</Form.Label>
                        <Form.Control
                          type="text"
                          name="brand"
                          placeholder="brand"
                          autoFocus
                          readOnly
                          value={formData.brand}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="model">
                        <Form.Label>Model</Form.Label>
                        <Form.Control
                          type="text"
                          name="model"
                          placeholder="model"
                          autoFocus
                          readOnly
                          value={formData.model}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="color">
                        <Form.Label>Color</Form.Label>
                        <Form.Control
                          type="text"
                          name="color"
                          placeholder="color"
                          autoFocus
                          readOnly
                          value={formData.color}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="seat">
                        <Form.Label>Seat</Form.Label>
                        <Form.Control
                          type="number"
                          name="seat"
                          placeholder="Seat"
                          autoFocus
                          readOnly
                          value={formData.seat}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="dateOfRegistration">
                        <Form.Label>Date of Registration</Form.Label>
                        <Form.Control
                          type="text"
                          name="dateOfRegistration"
                          placeholder="Date of Registration"
                          autoFocus
                          readOnly
                          value={formData.dateOfRegistration.slice(0, 10)}
                        // onChange={handleUpdateChange}
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
                  <Modal.Header closeButton>
                    <Modal.Title>Update bus</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="code">
                        <Form.Label>Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="code"
                          placeholder="code"
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
                      <Form.Group className="mb-3" controlId="licensePlate">
                        <Form.Label>License Plate</Form.Label>
                        <Form.Control
                          type="text"
                          name="licensePlate"
                          placeholder="licensePlate"
                          autoFocus
                          required
                          value={formData.licensePlate}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              licensePlate: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="brand">
                        <Form.Label>Brand</Form.Label>
                        <Form.Control
                          type="text"
                          name="brand"
                          placeholder="brand"
                          autoFocus
                          required
                          value={formData.brand}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              brand: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="model">
                        <Form.Label>Model</Form.Label>
                        <Form.Control
                          type="text"
                          name="model"
                          placeholder="model"
                          autoFocus
                          required
                          value={formData.model}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              model: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="color">
                        <Form.Label>Color</Form.Label>
                        <Form.Control
                          type="text"
                          name="color"
                          placeholder="color"
                          autoFocus
                          required
                          value={formData.color}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              color: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="seat">
                        <Form.Label>Seat</Form.Label>
                        <Form.Control
                          type="number"
                          name="seat"
                          placeholder="Seat"
                          autoFocus
                          required
                          value={formData.seat}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              seat: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="dateOfRegistration">
                        <Form.Label>Date of Registration</Form.Label>
                        <Form.Control
                          type="text"
                          name="dateOfRegistration"
                          placeholder="Date of Registration"
                          autoFocus
                          required
                          value={formData.dateOfRegistration.slice(0, 10)}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              dateOfRegistration: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleUpdateClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={updateBusData}>
                      Confirm
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Table list */}
                <div className="list">
                  <Button variant="primary" onClick={() => setShowAdd(true)} size="md" className="add_button">Add Bus +</Button>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Code</th>
                        <th>License Plate</th>
                        <th>Status</th>
                        <th>More Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBusList.map((bus, index) => (
                        <tr key={index}>
                          <td>
                            <a>{bus.id ? bus.id : "none"}</a>
                          </td>
                          <td>
                            <a href="" onClick={(e) => {
                              e.preventDefault()
                              handleShowDetails(bus.id)
                            }}>{bus.code ? bus.code : "none"}</a>

                          </td>
                          <td>
                            <a href="" onClick={(e) => {
                              e.preventDefault()
                              handleShowDetails(bus.id)
                            }}>{bus.licensePlate ? bus.licensePlate : "none"}</a>
                          </td>
                          <td>
                            <span className={`status ${bus.status === 'ACTIVE' ? 'active' : bus.status === 'INACTIVE' ? 'inactive' : ''}`}>
                              {bus.status}
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
                                  onClick={() => handleUpdateShow(bus)}
                                >
                                  Update
                                </DropdownItem>
                                <DropdownItem
                                  className="disable-enable-dropdown-item"
                                  onClick={() => {
                                    handleToggleStatus(bus)
                                  }}
                                >
                                  Enable/Disable
                                </DropdownItem>
                                <DropdownItem
                                  className="delete-dropdown-item"
                                  onClick={() => handleDeleteBus(bus.id)}
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
                        href="#"
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
                          href="#"
                          onClick={() => handlePageClick(index + 1)}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem disabled={currentPage === totalPages}>
                      <PaginationLink
                        href="#"
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

export default Buses;
