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
import { updateBusAPI } from "../../services/bus";
import { deleteBusAPI } from "../../services/bus";
import { updateStatusAPI } from "../../services/bus";
import { getAllBuses } from "../../services/bus";



const Buses = () => {
  const [busList, setBusList] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    code: "",
    licensePlate: "",
    brand: "",
    model: "",
    color: "",
    seat: 1,
    dateOfRegistration: "",
  });
  const [updateData, setUpdateData] = useState({
    code: "",
    licensePlate: "",
    brand: "",
    model: "",
    color: "",
    seat: 2,
    dateOfRegistration: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    getAllBuses()
      .then((res) => setBusList(res.data.data))
  }, [])

  const handleAddClose = () => setShowAdd(false);
  const handleAddShow = () => setShowAdd(true);

  const handleUpdateClose = () => setShowUpdate(false);
  const handleUpdateShow = (bus) => {
    setUpdateData(bus)
    setShowUpdate(true)
  };

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

  const addBus = () => {
    console.log(formData);
  };

  const updateBus = () => {
    updateBusAPI(formData, selectedId)
      .then((res) => console.log(res))
  }

  const toggleStatusBus = async (selectedId) => {
    let id = await selectedId;
    updateStatusAPI(id, selectedBus.status == 'ACTIVE' ? 'DISABLE' : 'ACTIVE')
      .then((res) => {
        console.log(res)
      })
  }

  const deleteBus = (selectedBus) => {
    deleteBusAPI(selectedBus.id)
      .then(res => console.log(res))
  }

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
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
                    <Modal.Title>Disable/Enable bus</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to disable/enable this bus!</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleDisableClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={() => toggleStatusBus(updateData)}>
                      Disable/Enable
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
                          value={formData.code}
                          onChange={handleAddChange}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="licensePlate">
                        <Form.Label>License Plate</Form.Label>
                        <Form.Control
                          type="text"
                          name="LicensePlate"
                          placeholder="licensePlate"
                          autoFocus
                          required
                          value={formData.licensePlate}
                          onChange={handleAddChange}
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
                          onChange={handleAddChange}
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
                          onChange={handleAddChange}
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
                          onChange={handleAddChange}
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
                          onChange={handleAddChange}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="licensePlate">
                        <Form.Label>Date of Registration</Form.Label>
                        <Form.Control
                          type="text"
                          name="licensePlate"
                          placeholder="YYYY-MM-DD"
                          autoFocus
                          required
                          value={formData.licensePlate}
                          onChange={handleAddChange}
                        />
                      </Form.Group>
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleAddClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={addBus}>
                      Add +
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
                          placeholder="1"
                          autoFocus
                          required
                          value={updateData.seat}
                          onChange={handleUpdateChange}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="licensePlate">
                        <Form.Label>Date of Registration</Form.Label>
                        <Form.Control
                          type="text"
                          name="licensePlate"
                          placeholder="Date of Registration"
                          autoFocus
                          required
                          value={formData.licensePlate}
                          onChange={handleAddChange}
                        />
                      </Form.Group>
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleUpdateClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={() => updateBus()}>
                      Update
                    </Button>
                  </Modal.Footer>
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
                        <tr key={index} onClick={() => {
                          setSelectedBus(bus)
                          setSelectedId(index)
                        }}>
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
                                  className="update-dropdown-item"
                                  href="#pablo"
                                  onClick={() => handleUpdateShow(bus)}
                                >
                                  Update
                                </DropdownItem>
                                <DropdownItem
                                  className="disable-enable-dropdown-item"
                                  href="#pablo"
                                  onClick={() => handleDisableShow(bus)}
                                >
                                  Disable/Enable
                                </DropdownItem>
                                <DropdownItem
                                  className="delete-dropdown-item"
                                  href="#pablo"
                                  onClick={() => handleDeleteShow(bus)}
                                >
                                  Delete
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
