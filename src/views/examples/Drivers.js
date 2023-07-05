import { useEffect, useState } from "react";
import { Button, Form, Modal, Table } from 'react-bootstrap';
import "../../style/Manager.css"
import defaultAvatar from '../../assets/img/driver.png'
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
  getSingleDriver,
  getAllDrivers,
  updateDriverAPI,
  deleteDriverAPI,
  addDriverAPI,
  toggleStatusAPI
} from "../../services/driver";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";



const Drivers = () => {
  const [driverList, setDriverList] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    fullName: "",
    gender: "",
    idCardNumber: "",
    address: "",
    phoneNumber: "",
    dateOfBirth: "",
    avatar: "",
    personalEmail: "",
  });

  const [updateData, setUpdateData] = useState({
    email: "",
    code: "",
    fullName: "",
    gender: "",
    idCardNumber: "",
    address: "",
    phoneNumber: "",
    dateOfBirth: "",
    avatar: "",
    personalEmail: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [newEmail, setNewEmail] = useState(null);
  const [newCode, setNewCode] = useState(null);
  const [newFullName, setNewFullName] = useState(null);
  const [newGender, setNewGender] = useState(null);
  const [newIdCardNumber, setNewIdCardNumber] = useState(null);
  const [newAddress, setNewAddress] = useState(null);
  const [newPhoneNumber, setNewPhoneNumber] = useState(null);
  const [newDateOfBirth, setNewDateOfBirth] = useState(null);
  const [newAvatar, setNewAvatar] = useState("");
  const [newPersonalEmail, setNewPersonalEmail] = useState(null);
  useEffect(() => {
    getAllDrivers(JSON.parse(localStorage.getItem("user")).accessToken)
      .then((res) => setDriverList(res.data.data))
  }, [])
  const navigate = useNavigate();
  const handleAddClose = () => {
    setShowAdd(false);
    setNewEmail("");
    setNewCode("");
    setNewFullName("");
    setNewGender("");
    setNewIdCardNumber("");
    setNewAddress("");
    setNewPhoneNumber("");
    setNewDateOfBirth("");
    setNewAvatar("");
    setNewPersonalEmail("");
  }
  const handleAddShow = () => setShowAdd(true);
  const fetchBusDetails = (driverId) => {
    setCurrentSelectDriver(driverId)
    getSingleDriver(driverId)
      .then((res) => {
        setShowDetails(true); // Show the modal
        setFormData(res.data)
      })
      .catch((error) => {
        console.log(error);
        // Handle the error appropriately
      });
  };


  const fetchDrivers = () => {
    getAllDrivers()
      .then((res) => setDriverList(res.data.data))
      .catch((error) => {
        console.log(error);
      });
  };
  const [currentSelectDriver, setCurrentSelectDriver] = useState("")

  const handleUpdateClose = () => {
    setShowUpdate(false);
    setShowDetails(true);
  }

  const formDataToUpdateData = () => {
    setNewEmail(formData.email);
    setNewCode(formData.code);
    setNewFullName(formData.fullName);
    setNewGender(formData.gender);
    setNewIdCardNumber(formData.idCardNumber);
    setNewAddress(formData.address);
    setNewPersonalEmail(formData.personalEmail);
    setNewPhoneNumber(formData.phoneNumber);
    setNewDateOfBirth(formData.dateOfBirth);
    setNewAvatar(formData.avatar);
  }
  const handleUpdateShow = () => {
    setShowDetails(false); // clode detail modal
    setShowUpdate(true); // show update modal
    formDataToUpdateData(); // move data in detail form to update form
  };
  const updateDriverData = () => {
    const updateBus = {
      email: newEmail,
      code: newCode,
      fullName: newFullName,
      gender: newGender,
      idCardNumber: newIdCardNumber,
      address: newAddress,
      phoneNumber: newPhoneNumber,
      personalEmail: newPersonalEmail,
      dateOfBirth: newDateOfBirth,
      avatar: newAvatar,
    }
    updateDriverAPI(updateBus, currentSelectDriver)
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          toast.success("Driver update successfully!", {
            autoClose: 1000,
          });
        } else {
          toast.warning("Can't update this driver!", {
            autoClose: 1000,
          });
        }
        setShowUpdate(false);
        navigate("/admin/drivers");
        fetchDrivers();
      })
      .catch(() => {
        toast.error("Failed to update the driver!", {
          autoClose: 1000,
        });
      })
  }

  const handleDisableClose = () => setShowDisable(false);

  const handleDeleteClose = () => setShowDelete(false);
  const handleDeleteShow = () => {
    setShowDelete(true);
  }

  const handleAddDriver = () => {
    addDriverAPI({
      email: newEmail,
      code: newCode,
      fullName: newFullName,
      gender: newGender,
      idCardNumber: newIdCardNumber,
      address: newAddress,
      phoneNumber: newPhoneNumber,
      personalEmail: newPersonalEmail,
      dateOfBirth: newDateOfBirth,
      avatar: newAvatar
    })
      .then((res) => {
        console.log(res);
        if(res.status === 200){
        toast.success("Driver add successfully!", {
          autoClose: 1000,
        });
        navigate("/admin/drivers");
        }

        // Handle the response here
      })
      .catch((error) => {
        console.log(error);
        // Handle the error appropriately
      });
  };


  const deleteBus = () => {
    deleteDriverAPI(currentSelectDriver)
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          toast.success("Driver deleted successfully!", {
            autoClose: 1000,
          });
        } else {
          toast.warning("Can't delete the driver!", {
            autoClose: 1000,
          });
        }
        setShowDelete(false);
        setShowDetails(false);
        navigate("/admin/drivers");
        fetchDrivers();
      })
      .catch(() => {
        toast.error("Failed to delete the driver!", {
          autoClose: 1000,
        });
      })
  };

  const enableBus = () => {
    toggleStatusAPI(currentSelectDriver)
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          toast.success("Driver enable successfully!", {
            autoClose: 1000,
          });
        } else {
          toast.warning("Can't enable this driver!", {
            autoClose: 1000,
          });
        }
        setShowDelete(false);
        navigate("/admin/drivers");
        fetchDrivers();
      })
      .catch(() => {
        toast.error("Failed to enable the driver!", {
          autoClose: 1000,
        });
      })
  }


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
  const totalPages = Math.ceil(driverList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBusList = driverList.slice(startIndex, endIndex);

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
                <h3 className="mb-0">Manager Drivers</h3>
              </CardHeader>
              <CardBody>

                <Modal show={showDisable} onHide={handleDisableClose} animation={false}>
                  <Modal.Header closeButton>
                    <Modal.Title>Enable driver</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to enable this driver!</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleDisableClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={enableBus}>
                      Enable
                    </Button>
                  </Modal.Footer>
                </Modal>

                <Modal show={showDelete} onHide={handleDeleteClose} animation={false}>
                  <Modal.Header closeButton>
                    <Modal.Title>Delete driver</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to delete this driver!</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleDeleteClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={() => deleteBus()}>
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
                      <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="text"
                          name="email"
                          placeholder="Email"
                          autoFocus
                          required
                          // value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="code">
                        <Form.Label>Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="code"
                          placeholder="Code"
                          autoFocus
                          required
                          // value={newCode}
                          onChange={(e) => setNewCode(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="fullName">
                        <Form.Label>FullName</Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          placeholder="FullName"
                          autoFocus
                          required
                          // value={newFullName}
                          onChange={(e) => setNewFullName(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="gender">
                        <Form.Label>Gender </Form.Label>
                        <Form.Control
                          type="text"
                          name="gender"
                          placeholder="Gender"
                          autoFocus
                          required
                          // value={newGender}
                          onChange={(e) => setNewGender(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="idCardNumber">
                        <Form.Label>IdCardNumber </Form.Label>
                        <Form.Control
                          type="text"
                          name="idCardNumber"
                          placeholder="IdCardNumber"
                          autoFocus
                          required
                          // value={newIdCardNumber}
                          onChange={(e) => setNewIdCardNumber(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="address">
                        <Form.Label>Address </Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          placeholder="Address"
                          autoFocus
                          required
                          // value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="phoneNumber">
                        <Form.Label>PhoneNumber</Form.Label>
                        <Form.Control
                          type="text"
                          name="phoneNumber"
                          placeholder="PhoneNumber"
                          autoFocus
                          required
                          // value={newPhoneNumber}
                          onChange={(e) => setNewPhoneNumber(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="personalEmail">
                        <Form.Label>PersonalEmail</Form.Label>
                        <Form.Control
                          type="text"
                          name="personalEmail"
                          placeholder="PersonalEmail"
                          autoFocus
                          required
                          // value={newPersonalEmail}
                          onChange={(e) => setNewPersonalEmail(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="dateOfBirth">
                        <Form.Label>Date Of Birth</Form.Label>
                        <Form.Control
                          type="text"
                          name="dateOfBirth"
                          placeholder="YYYY-MM-DD"
                          autoFocus
                          required
                          // value={newDateOfBirth}
                          onChange={(e) => setNewDateOfBirth(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="avatar">
                        <Form.Label>AvatarFile</Form.Label>
                        <Form.Control
                          type="file"
                          name="avatar"
                          placeholder="AvatarFile"
                          
                          autoFocus
                          required
                          // value={newAvatar}
                          onChange={(e) => setNewAvatar(e.target.value)}
                        />
                      </Form.Group>
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleAddClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={handleAddDriver}>
                      Add +
                    </Button>
                  </Modal.Footer>
                </Modal>

                <Modal show={showDetails} onHide={() => setShowDetails(false)}>
                  <Modal.Header closeButton>
                    <Modal.Title>Driver detail</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
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
                              onClick={() => handleUpdateShow(true)}
                            >
                              Update
                            </DropdownItem>
                            <DropdownItem
                              className="disable-enable-dropdown-item"
                              href="#pablo"
                              onClick={() => setShowDisable(true)}
                            >
                              Enable
                            </DropdownItem>
                            <DropdownItem
                              className="delete-dropdown-item"
                              href="#pablo"
                              onClick={handleDeleteShow}
                            >
                              Delete
                            </DropdownItem>
                          </DropdownMenu>

                        </UncontrolledDropdown>
                        <Form.Control
                          type="text"
                          name="email"
                          placeholder="Email"
                          autoFocus
                          required
                          value={formData.email}
                          onChange={handleUpdateChange}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="code">
                        <Form.Label>Code</Form.Label>
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
                      <Form.Group className="mb-3" controlId="fullName">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          placeholder="Full Name"
                          autoFocus
                          required
                          value={formData.fullName}
                          onChange={handleUpdateChange}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="gender">
                        <Form.Label>Gender</Form.Label>
                        <Form.Control
                          type="text"
                          name="gender"
                          placeholder="Gender"
                          autoFocus
                          required
                          value={formData.gender}
                          onChange={handleUpdateChange}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="idCardNumber">
                        <Form.Label>Id Card Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="idCardNumber"
                          placeholder="Id Card Number"
                          autoFocus
                          required
                          value={formData.idCardNumber}
                          onChange={handleUpdateChange}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="address">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          placeholder="Address"
                          autoFocus
                          required
                          value={formData.address}
                          onChange={handleUpdateChange}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="phoneNumber">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="number"
                          name="phoneNumber"
                          placeholder="Phone Number"
                          autoFocus
                          required
                          value={formData.phoneNumber}
                          onChange={handleUpdateChange}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="personalEmail">
                        <Form.Label>Personal Email</Form.Label>
                        <Form.Control
                          type="text"
                          name="personalEmail"
                          placeholder="Personal Email"
                          autoFocus
                          required
                          value={formData.personalEmail}
                          onChange={handleUpdateChange}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="dateOfBirth">
                        <Form.Label>Date of Birth</Form.Label>
                        <Form.Control
                          type="text"
                          name="dateOfBirth"
                          placeholder="Date of Birth"
                          autoFocus
                          required
                          value={formData.dateOfBirth}
                          onChange={handleUpdateChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="avatar">
                        <Form.Label>Avatar File</Form.Label>
                        <Form.Control
                          type="text"
                          name="avatar"
                          placeholder="Avatar File"
                          autoFocus
                          required
                          value={formData.avatar}
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
                    <Modal.Title>Update driver</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="text"
                          name="email"
                          placeholder="Email"
                          autoFocus
                          required
                          readOnly
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="code">
                        <Form.Label>Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="code"
                          placeholder="code"
                          autoFocus
                          required
                          value={newCode}
                          onChange={(e) => setNewCode(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="fullName">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          placeholder="Full Name"
                          autoFocus
                          required
                          value={newFullName}
                          onChange={(e) => setNewFullName(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="gender">
                        <Form.Label>Gender</Form.Label>
                        <Form.Control
                          type="text"
                          name="gender"
                          placeholder="Gender"
                          autoFocus
                          required
                          value={newGender}
                          onChange={(e) => setNewGender(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="idCardNumber">
                        <Form.Label>Id Card Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="idCardNumber"
                          placeholder="Id Card Number"
                          autoFocus
                          required
                          value={newIdCardNumber}
                          onChange={(e) => setNewIdCardNumber(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="address">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          placeholder="Address"
                          autoFocus
                          required
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="phoneNumber">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="number"
                          name="phoneNumber"
                          placeholder="Phone Number"
                          autoFocus
                          required
                          value={newPhoneNumber}
                          onChange={(e) => setNewPhoneNumber(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="personalEmail">
                        <Form.Label>Personal Email</Form.Label>
                        <Form.Control
                          type="text"
                          name="personalEmail"
                          placeholder="Personal Email"
                          autoFocus
                          required
                          value={newPersonalEmail}
                          onChange={(e) => setNewPersonalEmail(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="dateOfBirth">
                        <Form.Label>Date of Birth</Form.Label>
                        <Form.Control
                          type="text"
                          name="dateOfBirth"
                          placeholder="Date of Birth"
                          autoFocus
                          required
                          value={newDateOfBirth}
                          onChange={(e) => setNewDateOfBirth(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="avatar">
                        <Form.Label>Avatar File</Form.Label>
                        <Form.Control
                          type="text"
                          name="avatar"
                          placeholder="Avatar File"
                          autoFocus
                          required
                          value={newAvatar}
                          onChange={(e) => setNewAvatar(e.target.value)}
                        />
                      </Form.Group>
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleUpdateClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={updateDriverData}>
                      Confirm
                    </Button>
                  </Modal.Footer>
                </Modal>

                <div className="list">
                  <Button variant="primary" onClick={handleAddShow} size="md" className="add_button">Add Driver +</Button>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Avatar </th>
                        <th>Email</th>
                        <th>Code</th>
                        <th>Full Name</th>
                        <th>Gender</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBusList.map((bus, index) => (
                        <tr key={index} >
                          <td>{bus.id ? bus.id : "none"}</td>
                          <td>
                            {bus.avatar ? (
                              <img className="driver-img" src={bus.avatar} alt="" />
                            ) : (
                              <img className="driver-img" src={defaultAvatar} alt="" />
                            )}
                          </td>
                          <td>{bus.email ? bus.email : "none"}</td>
                          <td>{bus.code ? bus.code : "none"}</td>
                          <td>{bus.fullName ? bus.fullName : "none"}</td>
                          <td>{bus.gender ? bus.gender : "none"}</td>
                          <td>{bus.status ? bus.status : "none"}
                            {/* <UncontrolledDropdown>
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
                                    setCurrentSelectDriver(bus.id)
                                  }}
                                >
                                  Detail
                                </DropdownItem>
                              </DropdownMenu>

                            </UncontrolledDropdown> */}
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

export default Drivers;
