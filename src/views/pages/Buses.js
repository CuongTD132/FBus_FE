import { useEffect, useState } from "react";
import { Button, Form, Modal, Table } from 'react-bootstrap';
import "../../style/Manager.css"
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
  const [sortingOrder, setSortingOrder] = useState("oldest");
  const [selectedStatus, setSelectedStatus] = useState("");
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
      setShowBackdrop(true)
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
  const fetchBuses = async () => {
    if (currentSearchBus !== "") {
      await getMultiBusesAPI({
        licensePlate: currentSearchBus,
        code: currentSearchBus,
        status: selectedStatus,
      }).then((res) => {
        if (res.data.data != null) {
          dispatch(updateBus(res.data.data))
        } else {
          dispatch(updateBus([]))
        }
      })
    } else {
      await getMultiBusesAPI({ status: selectedStatus })
        .then((res) => {
          let sortedBuses = res.data.data;
          if (sortingOrder === "newest") {
            sortedBuses = res.data.data.sort((a, b) => b.id - a.id);
          } else if (sortingOrder === "oldest") {
            sortedBuses = res.data.data.sort((a, b) => a.id - b.id);
          }

          setBusList(sortedBuses);
          dispatch(updateBus(sortedBuses));
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };


  useEffect(() => {
    fetchBuses();
  }, [sortingOrder, selectedStatus]);

  const handleSortingChange = (order) => {
    setSortingOrder(order);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
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
    setErrors({});
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
      setShowUpdate(true);
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
    setOldStatus(bus.status)
    setToggleBusId(bus.id)
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
    toggleStatusAPI(toggleBusId, status)
      .then(() => {
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
    const newErrors = {};
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    if (!formData.licensePlate) {
      newErrors.LicensePlate = ['Please enter the License Plate'];
    }

    if (!formData.brand) {
      newErrors.Brand = ['Please enter the Brand'];
    }

    if (!formData.model) {
      newErrors.Model = ['Please enter the Model'];
    }

    if (!formData.color) {
      newErrors.Color = ['Please enter the Color'];
    }

    if (!formData.seat) {
      newErrors.Seat = ['Please choose the number of Seats'];
    }
    if (!formData.dateOfRegistration) {
      newErrors.DateOfRegistration = ['Please choose the Date Of Registration'];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
        setShowAdd(true);
      });
  };
  const handleAddClose = () => {
    setShowAdd(false);
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
  const combineDate = (day, month, year) => {
    const formattedDay = day ? String(day).padStart(2, "0") : "01";
    const formattedMonth = month ? String(month).padStart(2, "0") : "01";
    const formattedYear = year ? String(year) : "YYYY";
    return `${formattedYear}-${formattedMonth}-${formattedDay}`;
  };

  const currentYear = new Date().getFullYear();
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => currentYear - i);
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
                  <Modal.Body>
                    <Form>
                      <p>Cases (*) are required</p>
                      <Row className="container_input">
                        <div className="flex input-group">
                          <Form.Label className="align-items-center">
                            License Plate*
                          </Form.Label>
                          <input
                            className="input-form"
                            type="text"
                            name="licensePlate"
                            placeholder="51A123456"
                            autoFocus
                            required
                            maxLength={10}
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
                        </div>
                        {errors && errors.LicensePlate && (
                          <span className="error-msg">{errors.LicensePlate}</span>
                        )}
                      </Row>
                      <Row className="container_input">
                        <div className="flex input-group">
                          <Form.Label className="align-items-center">
                            Brand*
                          </Form.Label>
                          <input
                            className="input-form"
                            type="text"
                            name="brand"
                            placeholder="Brand"
                            autoFocus
                            required
                            maxLength={10}
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
                        </div>
                        {errors && errors.Brand && (
                          <span className="error-msg">{errors.Brand}</span>
                        )}
                      </Row>
                      <Row className="container_input">
                        <div className="flex input-group">
                          <Form.Label className="align-items-center">
                            Model*
                          </Form.Label>
                          <input
                            className="input-form"
                            type="text"
                            name="model"
                            placeholder="Model"
                            autoFocus
                            required
                            maxLength={10}
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
                        </div>
                        {errors && errors.Model && (
                          <span className="error-msg">{errors.Model}</span>
                        )}
                      </Row>
                      <Row className="container_input">
                        <div className="flex input-group">
                          <Form.Label className="align-items-center">
                            Color*
                          </Form.Label>
                          <input
                            className="input-form"
                            type="text"
                            name="color"
                            placeholder="Color"
                            autoFocus
                            required
                            maxLength={10}
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
                        </div>
                        {errors && errors.Color && (
                          <span className="error-msg">{errors.Color}</span>
                        )}
                      </Row>
                      <Row className="container_input">
                        <div className="flex input-group">
                          <Form.Label className="align-items-center">
                            Seats*
                          </Form.Label>
                          <select
                            className="input-form"
                            name="seat"
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
                            <option value="">Number of Seats</option>
                            <option value="4">4</option>
                            <option value="7">7</option>
                            <option value="16">16</option>
                            <option value="25">25</option>
                            <option value="35">35</option>
                            <option value="45">45</option>
                          </select>
                        </div>
                        {errors && errors.Seat && (
                          <span className="error-msg">{errors.Seat}</span>
                        )}
                      </Row>
                      <Row className="container_input">
                        <div className="flex input-group">
                          <Form.Label className="align-items-center">
                            Date of Registration*
                          </Form.Label>
                          <div className="date-input-container">
                            <select
                              className="input-form date-input"
                              name="day"
                              value={formData.day || ''}
                              onChange={(e) => {
                                const day = e.target.value;
                                setFormData((prevFormData) => ({
                                  ...prevFormData,
                                  day,
                                  dateOfRegistration: combineDate(day, prevFormData.month, prevFormData.year)
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
                              name="month"
                              value={formData.month || ''}
                              onChange={(e) => {
                                const month = e.target.value;
                                setFormData((prevFormData) => ({
                                  ...prevFormData,
                                  month,
                                  dateOfRegistration: combineDate(prevFormData.day, month, prevFormData.year)
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
                              name="year"
                              value={formData.year || ''}
                              onChange={(e) => {
                                const year = e.target.value;
                                setFormData((prevFormData) => ({
                                  ...prevFormData,
                                  year,
                                  dateOfRegistration: combineDate(prevFormData.day, prevFormData.month, year)
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
                          </div>
                        </div>
                        {errors && errors.DateOfRegistration && (
                          <span className="error-msg">{errors.DateOfRegistration}</span>
                        )}
                      </Row>
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
                      <Form.Group className="mb-3" controlId="licensePlate">
                        <Form.Label>License Plate</Form.Label>
                        {errors && errors.LicensePlate && (
                          <span style={{ color: "red", float: "right" }}>*{errors.LicensePlate}</span>
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
                          <span style={{ color: "red", float: "right" }}>*{errors.Brand}</span>
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
                          <span style={{ color: "red", float: "right" }}>*{errors.Model}</span>
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
                          <span style={{ color: "red", float: "right" }}>*{errors.Color}</span>
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
                          <span style={{ color: "red", float: "right" }}>*{errors.Seat}</span>
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
                        <option value="oldest">Oldest Buses</option>
                        <option value="newest">Newest Buses</option>
                      </select>
                    </div>
                    <Button variant="primary" onClick={handleAddOpen} size="md" className="add_button">Add Bus +</Button>
                  </div>
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
                          <td className={`registration ${bus.status === "DELETED" ? "disable-actions" : ""}`}>
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
