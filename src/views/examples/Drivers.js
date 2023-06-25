import { useState } from "react";
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
import Header from "components/Headers/Header.js";

const data = [
  {
    email: "abc@gmail.com",
    code: "A01",
    fullName: "Nguyen Van A",
    gender: "male",
    idCardNumber: "076321046973",
    address: "Pham Van Dong, Thu Duc, Ho Chi Minh",
    phoneNumber: "0123456789",
    personalEmail: "",
    dateOfBirth : "2000-12-23",
    avatarFile: "",
  },
  {
    code: "FA03",
    licensePlate: "123",
    brand: "adidas",
    model: "toyota",
    color: "white",
    seat: 32,
    dateOfRegistration: "",
  },
  {
    code: "FA03",
    licensePlate: "123",
    brand: "adidas",
    model: "toyota",
    color: "white",
    seat: 32,
    dateOfRegistration: "",
  },
  {
    code: "FA03",
    licensePlate: "123",
    brand: "adidas",
    model: "toyota",
    color: "white",
    seat: 32,
    dateOfRegistration: "",
  },
  {
    code: "FA03",
    licensePlate: "123",
    brand: "adidas",
    model: "toyota",
    color: "white",
    seat: 32,
    dateOfRegistration: "",
  },
  {
    code: "FA03",
    licensePlate: "123",
    brand: "adidas",
    model: "toyota",
    color: "white",
    seat: 32,
    dateOfRegistration: "",
  },
  {
    code: "FA03",
    licensePlate: "123",
    brand: "adidas",
    model: "toyota",
    color: "white",
    seat: 32,
    dateOfRegistration: "",
  },
]

const Drivers = () => {
  const [busList, setBusList] = useState(data);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    fullName: "",
    gender: "",
    idCardNumber: "",
    address: "",
    phoneNumber: 0,
    personalEmail: "",
    dateOfBirth : "",
    avatarFile: "",
  });
  const [updateData, setUpdateData] = useState({
    email: "",
    code: "",
    fullName: "",
    gender: "",
    idCardNumber: "",
    address: "",
    phoneNumber: 0,
    personalEmail: "",
    dateOfBirth : "",
    avatarFile: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

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

  const updateBus = (bus) => {
    console.log(bus);
  }

  const disableBus = (bus) => {
    console.log(bus.code);
  }

  const deleteBus = (bus) => {
    console.log(bus.code);
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
            <Card className="card-container shadow">
              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Manager Drivers</h3>
              </CardHeader>
              <CardBody>

                <Modal show={showDisable} onHide={handleDisableClose} animation={false}>
                  <Modal.Header closeButton>
                    <Modal.Title>Disable driver</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to disabled this driver!</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleDisableClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={() => disableBus(updateData)}>
                      Disable
                    </Button>
                  </Modal.Footer>
                </Modal>

                <Modal show={showDelete} onHide={handleDeleteClose} animation={false}>
                  <Modal.Header closeButton>
                    <Modal.Title>Delete bus</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to delete this driver!</Modal.Body>
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
                    <Modal.Title>Add driver</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="code">
                        <Form.Label>Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="code"
                          placeholder="FE01"
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
                          name="licensePlate"
                          placeholder="FE01"
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
                          placeholder="FE01"
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
                          placeholder="FE01"
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
                          placeholder="FE01"
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
                          placeholder="FE01"
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
                          placeholder="FE01"
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
                    <Modal.Title>Update driver</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="code">
                        <Form.Label>Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="code"
                          placeholder="FE01"
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
                          placeholder="FE01"
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
                          placeholder="FE01"
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
                          placeholder="FE01"
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
                          placeholder="FE01"
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
                          placeholder="FE03"
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
                          placeholder="FE01"
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
                    <Button variant="primary" onClick={() => updateBus(updateData)}>
                      Update
                    </Button>
                  </Modal.Footer>
                </Modal>

                <div className="list">
                  <Button variant="primary" onClick={handleAddShow} size="md" className="add_button">Add Driver +</Button>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>License Plate</th>
                        <th>Brand</th>
                        <th>Model</th>
                        <th>Color</th>
                        <th>Seat</th>
                        <th>Date of Registration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBusList.map((bus, index) => (
                        <tr key={index}>
                          <td>{bus.code ? bus.code : "none"}</td>
                          <td>{bus.licensePlate ? bus.licensePlate : "none"}</td>
                          <td>{bus.brand ? bus.brand : "none"}</td>
                          <td>{bus.model ? bus.model : "none"}</td>
                          <td>{bus.color ? bus.color : "none"}</td>
                          <td>{bus.seat ? bus.seat : "none"}</td>
                          <td className="registration">{bus.dateOfRegistration ? bus.dateOfRegistration : "none"}
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
                                  href="#pablo"
                                  onClick={() => handleUpdateShow(bus)}
                                // onClick={(e) => e.preventDefault()}
                                >
                                  Update
                                </DropdownItem>
                                <DropdownItem
                                  href="#pablo"
                                  onClick={() => handleDisableShow(bus)}
                                >
                                  Disable
                                </DropdownItem>
                                <DropdownItem
                                  href="#pablo"
                                  onClick={() => handleDeleteShow(bus)}
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

export default Drivers;
