import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Table } from 'react-bootstrap';
import "../../style/Manager.css"
import defaultAvatar from '../../assets/img/bus-stop.png'

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
  addStationAPI,
  updateStationAPI,
  getSingleStation,
  getMultiStationsAPI,
  getAllStations,
  deleteStationAPI,
  toggleStatusAPI,
} from "../../services/station";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateStation } from "../../redux/reducer";
import { isTokenExpired } from "../../services/checkToken";


const Stations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [stationList, setStationList] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showToggleStatus, setShowToggleStatus] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    addressNumber: "",
    street: "",
    ward: "",
    district: "",
    city: "",
    image: "",
    longtitude: "",
    latitude: "",
  });

  // Check accessToken
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user == null || !user || isTokenExpired()) {
      toast("You need to log in to continue!", {
        autoClose: 1000,
        onClose: () => {
          navigate("/auth/login");
        },
      });
      return;
    } else {
      getAllStations(user.accessToken)
        .then((res) => {
          if (res && res.data && res.data.data) {
            setStationList(res.data.data);
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
  const fetchStationDetails = (id) => {
    getSingleStation(id)
      .then((res) => {
        setFormData(res.data)
      })
  };

  // Fetch list of Station and pass to table
  const fetchStations = () => {
    if (currentSearchStation !== "") {
      getMultiStationsAPI({
        code: currentSearchStation,
        email: currentSearchStation
      }).then((res) => {
        console.log(res.data.data)
        if (res.data.data != null) {
          dispatch(updateStation(res.data.data))
        } else {
          dispatch(updateStation([]))
        }
      })
    } else if (stationList.length === 0) {
      getAllStations()
        .then((res) => setStationList(res.data.data))
        .catch((error) => {
          console.log(error);
        });
    }
  };

  // Call show detail form
  const handleShowDetails = (id) => {
    if (isTokenExpired()) {
      toast("You need to log in again to continue!", {
        autoClose: 1000,
        onClose: () => {
          navigate("/auth/login");
        },
      });
    } else {
      fetchStationDetails(id);
      setShowDetails(true); // Show the modal
    }
  }

  // --UPDATE FUNCTIONS
  const handleUpdateClose = () => {
    setShowUpdate(false);
  }
  const handleUpdateShow = (station) => {
    if (isTokenExpired()) {
      toast("You need to log in again to continue!", {
        autoClose: 1000,
        onClose: () => {
          navigate("/auth/login");
        },
      });
    } else {
      fetchStationDetails(station.id); // fetch old data
      setShowUpdate(true); // show update modal
    }
  };
  const updateStationData = () => {
    updateStationAPI(formData, formData.id)
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          toast.success("Station update successfully!", {
            autoClose: 1000,
          });
        } else {
          toast.warning("Can't update this station!", {
            autoClose: 1000,
          });
        }
        setShowUpdate(false);
        fetchStations();
      })
      .catch((e) => {
        if (e.response && e.response.status === 401) {
          toast.error("You need to log in again to continue!", {
            autoClose: 1000,
          });
          navigate("/auth/login");
        } else {
          toast.error("Failed to update the station!", {
            autoClose: 1000,
          });
        setShowUpdate(true);
        }
      })
  }
  // END UPDATE FUNCTIONS

  // TOGGLE STATUS FUNCTION
  const [oldStatus, setOldStatus] = useState("");
  const [toggleStationId, setToggleStationId] = useState(null);
  const handleToggleStatus = (station) => {
    setOldStatus(station.status)
    setToggleStationId(station.id)
    setShowToggleStatus(true);
  }
  const toggleStatus = () => {
    let status = "INACTIVE";
    if (oldStatus === "INACTIVE") {
      status = "ACTIVE"
    }
    toggleStatusAPI(toggleStationId, status)
      .then((res) => {
        toast.success("Successull to enable/disable status!", {
          autoClose: 1000,
        });
        setShowToggleStatus(false);
        fetchStations()
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
  const [deleteStationId, setDeleteStationId] = useState();
  const handleDeleteStation = (id) => {
    setDeleteStationId(id)
    setShowDelete(true)
  };
  const deleteStation = () => {
    deleteStationAPI(deleteStationId)
      .then((res) => {
        if (res.status === 200) {
          console.log(res)
          toast.success("Station deleted successfully!", {
            autoClose: 1000,
          });
        }
        setShowDelete(false);
        fetchStations();
      })
      .catch((e) => {
        if (e.response && e.response.status === 401) {
          toast.error("You need to log in again to continue!", {
            autoClose: 1000,
          });
          navigate("/auth/login");
        } else {
          toast.error("Failed to delete the station!", {
            autoClose: 1000,
          });
        }
      });
  }
  // END DELETE FUNCTIONS

  // ADD
  const handleAddStation = () => {
    addStationAPI(formData)
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          toast.success("Station has been add successfully!", {
            autoClose: 1000,
          });
          fetchStations()
          setShowAdd(false);
        }
      })
      .catch((e) => {
        if (e.response && e.response.status === 401) {
          toast.error("You need to log in again to continue!", {
            autoClose: 1000,
          });
          navigate("/auth/login");
        } else {
          toast.error("Failed to add this station!", {
            autoClose: 1000,
          });
          setShowAdd(true);
        }
      });
  };
  const handleAddClose = () => {
    setShowAdd(false);
    setFormData({
      name: "",
      code: "",
      addressNumber: "",
      street: "",
      ward: "",
      district: "",
      city: "",
      image: "",
      longtitude: "",
      latitude: "",
    })
  }
  const handleAddOpen = () => {
    setFormData({
      name: "",
      code: "",
      addressNumber: "",
      street: "",
      ward: "",
      district: "",
      city: "",
      image: "",
      longtitude: "",
      latitude: "",
    });
    setShowAdd(true);
  };
  // END ADD

  // PAGING
  const itemsPerPage = 5;
  const [currentStationList, setCurrentStationList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setTotalPages(Math.ceil(stationList.length / itemsPerPage));
    setStartIndex((currentPage - 1) * itemsPerPage);
  }, [stationList, currentPage]);

  useEffect(() => {
    setEndIndex(startIndex + itemsPerPage);
    setCurrentStationList(stationList.slice(startIndex, endIndex));
  }, [stationList, startIndex, endIndex]);

  useEffect(() => {
    setCurrentPage(1);
  }, [stationList.length]);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // END PAGING

  // REDUX
  const stations = useSelector((state) => state.stations.value);
  const currentSearchStation = useSelector((state) => state.drstationsivers.currentSearchStation);
  React.useEffect(() => {
    setStationList(stations)
  }, [stations])
  // END REDUX

  return (
    <>
      <Header />
      <ToastContainer />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className=" card-container shadow">
              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Manager Stations</h3>
              </CardHeader>
              <CardBody>


                <Modal show={showToggleStatus} onHide={() => setShowToggleStatus(false)} animation={false}>
                  <Modal.Header closeButton>
                    <Modal.Title>Enable/Disable station</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to enable/disable this station?</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowToggleStatus(false)}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={toggleStatus}>
                      Enable/Disable
                    </Button>
                  </Modal.Footer>
                </Modal>

                <Modal show={showDelete} onHide={() => setShowDelete(false)} animation={false}>
                  <Modal.Header closeButton>
                    <Modal.Title>Delete station</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to delete this station?</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDelete(false)}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={() => deleteStation()}>
                      Delete
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Add model */}
                <Modal show={showAdd} onHide={handleAddClose}>
                  <Modal.Header closeButton>
                    <Modal.Title>Add station</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="text"
                          name="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              email: e.target.value
                            })
                          }}
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
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              code: e.target.value
                            })
                          }}
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
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              fullName: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="gender">
                        <Form.Label>Gender</Form.Label>
                        <Form.Control
                          as="select"
                          name="gender"
                          placeholder="Gender"
                          autoFocus
                          required
                          value={formData.gender}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              gender: e.target.value
                            });
                          }}
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </Form.Control>
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
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              idCardNumber: e.target.value
                            })
                          }}
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
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              address: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="phoneNumber">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="phoneNumber"
                          placeholder="Phone Number"
                          autoFocus
                          required
                          value={formData.phoneNumber}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              phoneNumber: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="personalEmail">
                        <Form.Label>Personal Email</Form.Label>
                        <Form.Control
                          type="text"
                          name="personalEmail"
                          placeholder="Personal Email"
                          value={formData.personalEmail}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              personalEmail: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="dateOfBirth">
                        <Form.Label>Date of Birth (MM-DD-YYYY)</Form.Label>
                        <Form.Control
                          type="date"
                          name="dateOfBirth"
                          required
                          value={formData.dateOfBirth}
                          onChange={(e) => {
                            const inputDate = e.target.value;
                            const formattedDate = inputDate
                              .split("-")
                              .map((part) => part.padStart(2, "0"))
                              .join("-");

                            setFormData({
                              ...formData,
                              dateOfBirth: formattedDate
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="avatarFile">
                        <Form.Label>Avatar File</Form.Label>
                        <Form.Control
                          type="file"
                          name="avatarFile"
                          placeholder="Avatar File"
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              avatarFile: e.target.files[0] // Store the selected file in the form data
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
                    <Button variant="primary" onClick={handleAddStation}>
                      Add +
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Detail model */}
                <Modal show={showDetails} onHide={() => setShowDetails(false)}>
                  <Modal.Header closeButton>
                    <Modal.Title>Station detail</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="text"
                          name="email"
                          placeholder="No email available"
                          autoFocus
                          readOnly
                          value={formData.email || ""}
                        />
                      </Form.Group>
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
                      <Form.Group className="mb-3" controlId="fullName">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          placeholder="fullName"
                          autoFocus
                          readOnly
                          value={formData.fullName}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="gender">
                        <Form.Label>Gender</Form.Label>
                        <Form.Control
                          type="text"
                          name="gender"
                          placeholder="Gender"
                          autoFocus
                          readOnly
                          value={formData.gender}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="idCardNumber">
                        <Form.Label>Id Card Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="idCardNumber"
                          placeholder="Id Card Number"
                          autoFocus
                          readOnly
                          value={formData.idCardNumber}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="address">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          placeholder="Address"
                          autoFocus
                          readOnly
                          value={formData.address}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="phoneNumber">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="phoneNumber"
                          placeholder="Phone Number"
                          autoFocus
                          readOnly
                          value={formData.phoneNumber}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="personalEmail">
                        <Form.Label>Personal Email</Form.Label>
                        <Form.Control
                          type="text"
                          name="personalEmail"
                          placeholder="No personal email available"
                          autoFocus
                          readOnly
                          value={formData.personalEmail || ""}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="dateOfBirth">
                        <Form.Label>Date of Birth (MM-DD-YYYY)</Form.Label>
                        <Form.Control
                          type="text"
                          name="dateOfBirth"
                          placeholder="Date of Birth"
                          readOnly
                          value={new Date(formData.dateOfBirth.slice(0, 10)).toLocaleDateString("en-US")}
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
                    <Modal.Title>Update station</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="text"
                          name="email"
                          placeholder="No email available"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              email: e.target.value
                            })
                          }}
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
                          value={formData.code}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              code: e.target.value
                            })
                          }}
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
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              fullName: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="gender">
                        <Form.Label>Gender</Form.Label>
                        <Form.Control
                          as="select"
                          name="gender"
                          placeholder="Gender"
                          autoFocus
                          required
                          value={formData.gender}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              gender: e.target.value
                            });
                          }}
                        >
                          {formData.gender === "Female" ? (
                            <>
                              <option value="Female">Female</option>
                              <option value="Male">Male</option>
                            </>
                          ) : (
                            <>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </>
                          )}
                        </Form.Control>
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
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              idCardNumber: e.target.value
                            })
                          }}
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
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              address: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="phoneNumber">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="phoneNumber"
                          placeholder="Phone Number"
                          autoFocus
                          required
                          value={formData.phoneNumber}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              phoneNumber: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="personalEmail">
                        <Form.Label>Personal Email</Form.Label>
                        <Form.Control
                          type="text"
                          name="personalEmail"
                          placeholder="No personal email available"
                          value={formData.personalEmail || ""}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              personalEmail: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="dateOfBirth">
                        <Form.Label>
                          Date of Birth (MM-DD-YYYY)
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="dateOfBirth"
                          required
                          value={formData.dateOfBirth ? formData.dateOfBirth.slice(0, 10) : ''}
                          onChange={(e) => {
                            const inputDate = e.target.value;
                            const formattedDate = inputDate
                              .split("-")
                              .map((part) => part.padStart(2, "0"))
                              .join("-");

                            setFormData({
                              ...formData,
                              dateOfBirth: formattedDate
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="avatarFile">
                        <Form.Label>Avatar File</Form.Label>
                        <Form.Control
                          type="file"
                          name="avatarFile"
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              avatarFile: e.target.files[0] // Store the selected file in the form data
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
                    <Button variant="primary" onClick={updateStationData}>
                      Confirm
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Table list */}
                <div className="list">
                  <Button variant="primary" onClick={handleAddOpen} size="md" className="add_button">Add Station +</Button>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Avatar </th>
                        <th>Code</th>
                        <th>Email</th>
                        <th>Full Name</th>
                        <th>Status</th>
                        <th>More Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStationList.map((station, index) => (
                        <tr key={index}>
                          <td>
                            <a>{station.id ? station.id : "none"}</a>
                          </td>
                          <td>
                            {station.avatar ? (
                              <img className="station-img" src={station.avatar} alt="" />
                            ) : (
                              <img className="station-img" src={defaultAvatar} alt="" />
                            )}
                          </td>
                          <td>
                            <a href="" onClick={(e) => {
                              e.preventDefault()
                              handleShowDetails(station.id)
                            }}>{station.code ? station.code : "none"}</a>

                          </td>
                          <td>
                            <a href="" onClick={(e) => {
                              e.preventDefault()
                              handleShowDetails(station.id)
                            }}>{station.email ? station.email : "none"}</a>
                          </td>
                          <td>
                            <a href="" onClick={(e) => {
                              e.preventDefault()
                              handleShowDetails(station.id)
                            }}>{station.fullName ? station.fullName : "none"}</a>
                          </td>
                          <td>
                            <span className={`status ${station.status === 'ACTIVE' ? 'active' : station.status === 'INACTIVE' ? 'inactive' : ''}`}>
                              {station.status}
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
                                  onClick={() => handleUpdateShow(station)}
                                >
                                  Update
                                </DropdownItem>
                                <DropdownItem
                                  className="disable-enable-dropdown-item"
                                  onClick={() => {
                                    handleToggleStatus(station)
                                  }}
                                >
                                  Enable/Disable
                                </DropdownItem>
                                <DropdownItem
                                  className="delete-dropdown-item"
                                  onClick={() => handleDeleteStation(station.id)}
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

export default Stations;