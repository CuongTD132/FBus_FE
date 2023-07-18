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
  toggleStatusAPI,
  addBusAPI,
  getMultiBusesAPI
} from "../../services/bus";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateBus } from "../../redux/reducer";
import QRCode from 'qrcode.react';
import { isTokenExpired } from "../../services/checkToken";
import caution from '../../assets/img/caution.png'

const Buses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [busList, setBusList] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showToggleStatus, setShowToggleStatus] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [errors, setErrors] = useState({});
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    licensePlate: "",
    brand: "",
    model: "",
    color: "",
    seat: "",
    dateOfRegistration: "",
  });

  // Check accessToken
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user == null || !user || isTokenExpired()) {
      return;
    }
    getAllBuses(user.accessToken)
      .then((res) => {
        if (res && res.data && res.data.data) {
          setBusList(res.data.data);
        } else {
          alert("Error: Invalid response data");
          return;
        }
      })
      .catch((error) => {
        alert("Error: " + error.message);
      });
  }, [navigate])

  // Fetch detail information and pass to detail form
  const fetchBusDetails = async (id) => {
    await getSingleBus(id)
      .then((res) => {
        setFormData(res.data)
      })
  };

  // Fetch list of bus and pass to table
  const fetchBuses = () => {
    if (currentSearchBus !== "") {
      getMultiBusesAPI({
        licensePlate: currentSearchBus,
        code: currentSearchBus
      }).then((res) => {
        // console.log(res.data.data)
        if (res.data.data != null) {
          dispatch(updateBus(res.data.data))
        } else {
          dispatch(updateBus([]))
        }
      })
    } else {
      getAllBuses()
        .then((res) => {
          setBusList(res.data.data);
          dispatch(updateBus(res.data.data));
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  // Call show detail form
  const handleShowDetails = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    await fetchBusDetails(id);
    setShowDetails(true);
  }

  // QRCODE FUNCTIONS
  const [qrHash, setQrHash] = useState(null);
  const handleQrCode = (bus) => {
    const myObject = `${bus.code}-${bus.licensePlate}`;
    setQrHash(JSON.stringify(myObject));
    setShowQrCode(true);
  }

  const downloadQR = () => {
    const canvas = document.getElementById("qr-gen");
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");

    downloadLink.href = pngUrl;
    downloadLink.download = `${JSON.parse(qrHash).split('-')[0]}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    setShowQrCode(false);
  };

  // --UPDATE FUNCTIONS
  const handleUpdateClose = () => {
    setShowUpdate(false);
  }

  const handleUpdateShow = async (bus) => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    await fetchBusDetails(bus.id); // fetch old data
    setShowUpdate(true); // show update modal
    setIsUpdated(false);
  };

  const updateBusData = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    // Check if form data has been changed
    if (!isUpdated) {
      toast.info("Nothing has been changed!", {
        autoClose: 1000,
      });
      setShowUpdate(false);
      return;
    }
    updateBusAPI(formData, formData.id)
      .then((res) => {
        // console.log(res);
        if (res.status === 200) {
          toast.success("Bus update successfully!", {
            autoClose: 1000,
          });
        }
        setShowUpdate(false);
        fetchBuses();
      })
      .catch((e) => {
        if (e.response.data.errors) {
          setErrors(e.response.data.errors);
        }
        toast.error("Failed to update the bus!", {
          autoClose: 1000,
        });
        setShowUpdate(true);
      })
  }
  // END UPDATE FUNCTIONS

  // TOGGLE STATUS FUNCTION
  const [oldStatus, setOldStatus] = useState("");
  const [toggleBusId, setToggleBusId] = useState(null);
  const handleToggleStatus = (bus) => {
    if (isTokenExpired()) {
      toast.error("You need to log in again to continue!", {
        autoClose: 1000,
        onClose: () => {
          navigate("/auth/login");
        },
      });
    } else {
      setOldStatus(bus.status)
      setToggleBusId(bus.id)
      setShowToggleStatus(true);
    }

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
    toggleStatusAPI(toggleBusId, status)
      .then((res) => {
        toast.success("Successull to enable/disable status!", {
          autoClose: 1000,
        });
        setShowToggleStatus(false);
        fetchBuses()
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
  const [deleteBusId, setDeleteBusId] = useState();
  const handleDeleteBus = (id) => {
    setDeleteBusId(id)
    setShowDelete(true)
  };
  const deleteBus = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    deleteBusAPI(deleteBusId)
      .then((res) => {
        if (res.status === 200) {
          toast.success("Bus deleted successfully!", {
            autoClose: 1000,
          });
        }
        setShowDelete(false);
        fetchBuses();
      })
      .catch(() => {
        toast.error("Failed to delete the bus!", {
          autoClose: 1000,
        });
      });
  }
  // END DELETE FUNCTIONS

  // ADD
  const handleAddBus = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    addBusAPI(formData)
      .then((res) => {
        // console.log(res);
        if (res.status === 200) {
          toast.success("Bus has been add successfully!", {
            autoClose: 1000,
          });
          fetchBuses()
          setShowAdd(false);
        }
      })
      .catch((e) => {
        if (e.response.data.errors) {
          setErrors(e.response.data.errors);
        }
        toast.error("Failed to add this bus!", {
          autoClose: 1000,
        });
        setShowAdd(true);
      });
  };
  const handleAddClose = () => {
    setShowAdd(false);
    setErrors({});
  }
  const handleAddOpen = () => {
    setFormData({
      code: "",
      licensePlate: "",
      brand: "",
      model: "",
      color: "",
      seat: "",
      dateOfRegistration: "",
    });
    setErrors({});
    setShowAdd(true);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [busList.length]);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // END PAGING

  // REDUX
  const buses = useSelector((state) => state.buses.value);
  const currentSearchBus = useSelector((state) => state.buses.currentSearchBus);
  useEffect(() => {
    setBusList(buses)
  }, [buses])
  // END REDUX

  return (
    <>
      <Header />
      <ToastContainer />
      <Container className="mt--7 " fluid>
        <Row>
          <div className="col">
            <Card className=" card-container shadow">
              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Manager Buses</h3>
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


                <Modal className="modal" show={showToggleStatus} onHide={() => setShowToggleStatus(false)} animation={true}>
                  <Modal.Header >
                    <Modal.Title>Enable/Disable bus</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to enable/disable this bus?</Modal.Body>
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
                  <Modal.Header >
                    <Modal.Title>Add bus</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="code">
                        <Form.Label>Code</Form.Label>
                        {errors && errors.Code && (
                          <span style={{ color: "red", float: "right" }}>*{errors.Code[0]}</span>
                        )}
                        <Form.Control
                          type="text"
                          name="code"
                          placeholder="Code"
                          autoFocus
                          required
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              code: e.target.value
                            });
                            setErrors({
                              ...errors,
                              Code: null
                            });
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="licensePlate">
                        <Form.Label>License Plate</Form.Label>
                        {errors && errors.LicensePlate && (
                          <span style={{ color: "red", float: "right" }}>*{errors.LicensePlate[0]}</span>
                        )}
                        <Form.Control
                          type="text"
                          name="licensePlate"
                          placeholder="licensePlate"
                          autoFocus
                          required
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              licensePlate: e.target.value,
                            });
                            setErrors({
                              ...errors,
                              LicensePlate: null,
                            });
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="brand">
                        <Form.Label>Brand</Form.Label>
                        {errors && errors.Brand && (
                          <span style={{ color: "red", float: "right" }}>*{errors.Brand[0]}</span>
                        )}
                        <Form.Control
                          type="text"
                          name="brand"
                          placeholder="Brand"
                          autoFocus
                          required
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              brand: e.target.value
                            });
                            setErrors({
                              ...errors,
                              Brand: null
                            });
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="model">
                        <Form.Label>Model</Form.Label>
                        {errors && errors.Model && (
                          <span style={{ color: "red", float: "right" }}>*{errors.Model[0]}</span>
                        )}
                        <Form.Control
                          type="text"
                          name="model"
                          placeholder="Model"
                          autoFocus
                          required
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              model: e.target.value
                            });
                            setErrors({
                              ...errors,
                              Model: null
                            });
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="color">
                        <Form.Label>Color</Form.Label>
                        {errors && errors.Color && (
                          <span style={{ color: "red", float: "right" }}>*{errors.Color[0]}</span>
                        )}
                        <Form.Control
                          type="text"
                          name="color"
                          placeholder="Color"
                          autoFocus
                          required
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              color: e.target.value
                            });
                            setErrors({
                              ...errors,
                              Color: null
                            });
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="seat">
                        <Form.Label>Seat</Form.Label>
                        {errors && errors.Seat && (
                          <span style={{ color: "red", float: "right" }}>*{errors.Seat[0]}</span>
                        )}
                        <Form.Control
                          as="select"
                          name="seat"
                          placeholder="Seat"
                          autoFocus
                          required
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              seat: e.target.value
                            });
                            setErrors({
                              ...errors,
                              Seat: null
                            });
                          }}
                        >
                          <option value="">Select seat</option>
                          <option value="4">4</option>
                          <option value="7">7</option>
                          <option value="16">16</option>
                          <option value="25">25</option>
                          <option value="35">35</option>
                          <option value="45">45</option>
                        </Form.Control>
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="dateOfRegistration">
                        <Form.Label>Date of Registration</Form.Label>
                        <Form.Control
                          type="date"
                          name="dateOfRegistration"
                          placeholder="YYYY-MM-DD"
                          required
                          onChange={(e) => {
                            const inputDate = e.target.value;
                            const formattedDate = inputDate
                              .split("-")
                              .map((part) => part.padStart(2, "0"))
                              .join("-");

                            setFormData({
                              ...formData,
                              dateOfRegistration: formattedDate
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
                    <Button variant="primary" onClick={handleAddBus}>
                      Add +
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Detail model */}
                <Modal show={showDetails}
                  onHide={() =>
                    setShowDetails(false)
                  }>
                  <Modal.Header >
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
                        <Form.Label>Date of Registration (MM-DD-YYYY)</Form.Label>
                        <Form.Control
                          type="text"
                          name="dateOfRegistration"
                          placeholder="No date of registration available"
                          autoFocus
                          readOnly
                          value={new Date(formData.dateOfRegistration.slice(0, 10)).toLocaleDateString("en-US")}
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
                  <Modal.Header >
                    <Modal.Title>Update bus</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="code">
                        <Form.Label>Code</Form.Label>
                        {errors && errors.Code && (
                          <span style={{ color: "red", float: "right" }}>*{errors.Code[0]}</span>
                        )}
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
                            });
                            setIsUpdated(true);
                            setErrors({
                              ...errors,
                              Code: null
                            });
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="licensePlate">
                        <Form.Label>License Plate</Form.Label>
                        {errors && errors.LicensePlate && (
                          <span style={{ color: "red", float: "right" }}>*{errors.LicensePlate[0]}</span>
                        )}
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
                              licensePlate: e.target.value,
                            });
                            setIsUpdated(true);
                            setErrors({
                              ...errors,
                              LicensePlate: null,
                            });
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="brand">
                        <Form.Label>Brand</Form.Label>
                        {errors && errors.Brand && (
                          <span style={{ color: "red", float: "right" }}>*{errors.Brand[0]}</span>
                        )}
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
                            });
                            setIsUpdated(true);
                            setErrors({
                              ...errors,
                              Brand: null
                            });
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="model">
                        <Form.Label>Model</Form.Label>
                        {errors && errors.Model && (
                          <span style={{ color: "red", float: "right" }}>*{errors.Model[0]}</span>
                        )}
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
                            });
                            setIsUpdated(true);
                            setErrors({
                              ...errors,
                              Model: null
                            });
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="color">
                        <Form.Label>Color</Form.Label>
                        {errors && errors.Color && (
                          <span style={{ color: "red", float: "right" }}>*{errors.Color[0]}</span>
                        )}
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
                            });
                            setIsUpdated(true);
                            setErrors({
                              ...errors,
                              Color: null
                            });
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="seat">
                        <Form.Label>Seat</Form.Label>
                        {errors && errors.Seat && (
                          <span style={{ color: "red", float: "right" }}>*{errors.Seat[0]}</span>
                        )}
                        <Form.Control
                          as="select"
                          name="seat"
                          placeholder="Seat"
                          autoFocus
                          required
                          value={formData.seat}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              seat: e.target.value
                            });
                            setIsUpdated(true);
                            setErrors({
                              ...errors,
                              Seat: null
                            });
                          }}
                        >
                          {/* <option value="">Select seat</option> */}
                          <option value="4" disabled={formData.seat === '4'}>4</option>
                          <option value="7" disabled={formData.seat === '7'}>7</option>
                          <option value="16" disabled={formData.seat === '16'}>16</option>
                          <option value="25" disabled={formData.seat === '25'}>25</option>
                          <option value="35" disabled={formData.seat === '35'}>35</option>
                          <option value="45" disabled={formData.seat === '45'}>45</option>
                        </Form.Control>
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="dateOfRegistration">
                        <Form.Label>
                          Date of Registration (MM-DD-YYYY)
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="dateOfRegistration"
                          placeholder="No date of registration available"
                          autoFocus
                          required
                          value={formData.dateOfRegistration ? formData.dateOfRegistration.slice(0, 10) : ''}
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
                    <Button variant="primary" onClick={updateBusData}>
                      Confirm
                    </Button>
                  </Modal.Footer>
                </Modal>
                {/* QRCode model */}
                <Modal show={showQrCode && qrHash} onHide={() => {
                  setShowQrCode(false)
                  setQrHash(null)
                }}>
                  <Modal.Header >
                    <Modal.Title>QR CODE</Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="text-center">
                    <Form>
                      <Form.Group>
                        <QRCode className="qr-code-container" size={300} id="qr-gen" includeMargin={true} value={qrHash} />
                      </Form.Group>
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowQrCode(false)}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={downloadQR}>
                      Download QR
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Table list */}
                <div className="list">
                  <Button variant="primary" onClick={handleAddOpen} size="md" className="add_button">Add Bus +</Button>
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
                            <span>{bus.id ? bus.id : "none"}</span>
                          </td>
                          <td>
                            <span className="link-style" onClick={(e) => {
                              e.preventDefault()
                              handleShowDetails(bus.id)
                            }}>{bus.code ? bus.code : "none"}</span>

                          </td>
                          <td>
                            <span className="link-style" onClick={(e) => {
                              e.preventDefault()
                              handleShowDetails(bus.id)
                            }}>{bus.licensePlate ? bus.licensePlate : "none"}</span>
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
                                  className="qrcode-dropdown-item"
                                  onClick={() => handleQrCode(bus)}
                                >
                                  QR Code
                                </DropdownItem>
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

export default Buses;
