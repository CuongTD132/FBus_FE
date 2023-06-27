import { useEffect, useState } from "react";
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
  updateStatusAPI,
  addBus
} from "../../services/bus";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";



const Buses = () => {
  const [busList, setBusList] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
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

  const [updateData, setUpdateData] = useState({
    code: "",
    licensePlate: "",
    brand: "",
    model: "",
    color: "",
    seat: "",
    dateOfRegistration: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [newCode, setNewCode] = useState(null);
  const [newLicensePlate, setNewLicensePlate] = useState(null);
  const [newBrand, setNewBrand] = useState(null);
  const [newModel, setNewModel] = useState(null);
  const [newColor, setNewColor] = useState(null);
  const [newSeat, setNewSeat] = useState(null);
  const [newatDeOfRegistration, setNewatDeOfRegistration] = useState(null);
  useEffect(() => {
    getAllBuses()
      .then((res) => setBusList(res.data.data))
  }, [])
  const navigate = useNavigate();
  const handleAddClose = () => {
    setShowAdd(false);
    setNewCode("");
    setNewLicensePlate("");
    setNewBrand("");
    setNewModel("");
    setNewColor("");
    setNewSeat("");
    setNewatDeOfRegistration("");
  }
  const handleAddShow = () => setShowAdd(true);
  const fetchBusDetails = (busId) => {
    setCurrentSelectBus(busId)
    getSingleBus(busId)
      .then((res) => {
        setShowDetails(true); // Show the modal
        setFormData(res.data)
      })
      .catch((error) => {
        console.log(error);
        // Handle the error appropriately
      });
  };


  const fetchBuses = () => {
    getAllBuses()
      .then((res) => setBusList(res.data.data))
      .catch((error) => {
        console.log(error);
      });
  };
  const [currentSelectBus, setCurrentSelectBus] = useState("")
  const handleUpdateClose = () => setShowUpdate(false);
  const handleUpdateShow = () => {
    const updateBus = {
      code: newCode,
      licensePlate: newLicensePlate,
      brand: newBrand,
      model: newModel,
      color: newColor,
      seat: newSeat,
      dateOfRegistration: newatDeOfRegistration,
    }
    updateBusAPI(updateBus, currentSelectBus)
      .then((res) => {
        setShowUpdate(true);
        console.log(res.data)
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // const handleUpdateShow = (bus) => {
  //   setUpdateData(bus)
  //   setShowUpdate(true)
  // };

  const handleDisableClose = () => setShowDisable(false);
  const handleDisableShow = (bus) => {
    setUpdateData(bus)
    setShowDisable(true);
  }

  const handleDeleteClose = () => setShowDelete(false);
  const handleDeleteShow = (bus) => {
    setUpdateData(bus)
    setShowDelete(true);

  }

  const handleAddBus = () => {
    addBus({
      code: newCode,
      licensePlate: newLicensePlate,
      brand: newBrand,
      model: newModel,
      color: newColor,
      seat: newSeat,
      dateOfRegistration: newatDeOfRegistration
    })
      .then((res) => {
        console.log(res);
        // Handle the response here
      })
      .catch((error) => {
        console.log(error);
        // Handle the error appropriately
      });
  };




  const toggleStatusBus = async (selectedId) => {
    let id = await selectedId;
    if (selectedBus.status === 'INACTIVE') {
      updateStatusAPI(id, 'ACTIVE')
        .then((res) => {
          console.log(res);
        });
    }
  };


  const deleteBus = (selectedBus) => {
    deleteBusAPI(selectedBus.id)
      .then((res) => {
        console.log(res);
        if (selectedBus.status === "ACTIVE") {
          toast.success("Bus deleted successfully!");
        } else if (selectedBus.status === "INACTIVE") {
          toast.info("The bus was deleted earlier");
        }
        setShowDelete(false);
        navigate("/admin/buses");
        fetchBuses();
      })
      .catch((error) => {
        console.log(error);
        toast.error("Failed to delete the bus!");
      });
  };





  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData((prevFormData) => {
      if (prevFormData) {
        return {
          ...prevFormData,
          [name]: value,
        };
      }
      return prevFormData;
    });
  };


  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(busList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBusList = busList.slice(startIndex, endIndex);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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

                <Modal show={showDisable} onHide={handleDisableClose} animation={false}>
                  <Modal.Header closeButton>
                    <Modal.Title>Enable bus</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to enable this bus!</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleDisableClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={() => toggleStatusBus(updateData)}>
                      Enable
                    </Button>
                  </Modal.Footer>
                </Modal>

                <Modal show={showDelete} onHide={handleDeleteClose} animation={false}>
                  <Modal.Header closeButton>
                    <Modal.Title>Delete bus</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to delete this bus!</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleDeleteClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={() => deleteBus(updateData)}>
                      Delete
                    </Button>
                  </Modal.Footer>
                </Modal>

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
                          value={newCode}
                          onChange={(e) => setNewCode(e.target.value)}
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
                          value={newLicensePlate}
                          onChange={(e) => setNewLicensePlate(e.target.value)}
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
                          value={newBrand}
                          onChange={(e) => setNewBrand(e.target.value)}
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
                          value={newModel}
                          onChange={(e) => setNewModel(e.target.value)}
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
                          value={newColor}
                          onChange={(e) => setNewColor(e.target.value)}
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
                          value={newSeat}
                          onChange={(e) => setNewSeat(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="dateOfRegistration">
                        <Form.Label>Date of Registration</Form.Label>
                        <Form.Control
                          type="text"
                          name="dateOfRegistration"
                          placeholder="YYYY-MM-DD"
                          autoFocus
                          required
                          value={newatDeOfRegistration}
                          onChange={(e) => setNewatDeOfRegistration(e.target.value)}
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

                <Modal show={showDetails} onHide={() => setShowDetails(false)}>
                  <Modal.Header closeButton>
                    <Modal.Title>Bus detail</Modal.Title>
                    
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="code">
                        <Form.Label>Code</Form.Label>
                        <UncontrolledDropdown>
                      <DropdownToggle
                        className="btn-icon-only text-light"
                        href="#pablo"
                        role="button"
                        size="sm"
                        color=""
                        // onClick={(e) => e.preventDefault()}
                      >
                        <i className="fas fa-ellipsis-v" />
                      </DropdownToggle>
                      <DropdownMenu className="dropdown-menu-arrow" right>
                        <DropdownItem
                          className="update-dropdown-item"
                          href="#pablo"
                          onClick={() => handleUpdateShow()}
                        >
                          Update
                        </DropdownItem>
                        <DropdownItem
                          className="disable-enable-dropdown-item"
                          href="#pablo"
                          // onClick={() => handleDisableShow(bus)}
                        >
                          Enable
                        </DropdownItem>
                        <DropdownItem
                          className="delete-dropdown-item"
                          href="#pablo"
                          onClick={() => handleDeleteShow(currentSelectBus)}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>

                    </UncontrolledDropdown>
                        <Form.Control
                          type="text"
                          name="code"
                          placeholder="Code"
                          autoFocus
                          required
                          value={formData.code}
                          onChange={handleUpdateChange}
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
                          onChange={handleUpdateChange}
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
                          onChange={handleUpdateChange}
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
                          onChange={handleUpdateChange}
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
                          onChange={handleUpdateChange}
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
                          onChange={handleUpdateChange}
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
                          value={formData.dateOfRegistration}
                          onChange={handleUpdateChange}
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
                          value={updateData.code}
                          onChange={handleUpdateChange}
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
                          value={updateData.licensePlate}
                          onChange={handleUpdateChange}
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
                          value={updateData.brand}
                          onChange={handleUpdateChange}
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
                          value={updateData.model}
                          onChange={handleUpdateChange}
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
                          value={updateData.color}
                          onChange={handleUpdateChange}
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
                          value={updateData.seat}
                          onChange={handleUpdateChange}
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
                          value={updateData.dateOfRegistration}
                          onChange={handleUpdateChange}
                        />
                      </Form.Group>
                    </Form>
                  </Modal.Body>
                  {/* <Modal.Footer>
                    <Button variant="secondary" onClick={handleUpdateClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={() => updateBus()}>
                      Update
                    </Button>
                  </Modal.Footer> */}
                </Modal>

                <div className="list">
                  <Button variant="primary" onClick={handleAddShow} size="md" className="add_button">Add Bus +</Button>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Code</th>
                        <th>License Plate</th>
                        <th>Brand</th>
                        <th>Model</th>
                        <th>Color</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBusList.map((bus, index) => (
                        <tr key={index} >
                          <td>{bus.id ? bus.id : "none"}</td>
                          <td>{bus.code ? bus.code : "none"}</td>
                          <td>{bus.licensePlate ? bus.licensePlate : "none"}</td>
                          <td>{bus.brand ? bus.brand : "none"}</td>
                          <td>{bus.model ? bus.model : "none"}</td>
                          <td>{bus.color ? bus.color : "none"}</td>
                          <td>{bus.status ? bus.status : "none"}
                            <UncontrolledDropdown>
                              <DropdownToggle
                                className="btn-icon-only text-light"
                                href="#pablo"
                                role="button"
                                size="sm"
                                color=""
                                onClick={(e) => e.preventDefault()}
                              >
                                <i className="fas fa-ellipsis-v" />
                              </DropdownToggle>
                              <DropdownMenu className="dropdown-menu-arrow" right>
                                <DropdownItem
                                  className="detail-dropdown-item"
                                  href="#pablo"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    fetchBusDetails(bus.id)
                                    setCurrentSelectBus(bus.id)
                                  }}
                                >
                                  Detail
                                </DropdownItem>
                              </DropdownMenu>

                            </UncontrolledDropdown>
                          </td>
                          {/* <td className="registration">{bus.dateOfRegistration ? bus.dateOfRegistration : "none"}</td> */}

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
