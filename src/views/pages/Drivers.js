import React, { useEffect, useState } from "react";
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
  addDriverAPI,
  updateDriverAPI,
  getSingleDriver,
  getMultiDriversAPI,
  getAllDrivers,
  deleteDriverAPI,
  toggleStatusAPI,

} from "../../services/driver";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateDriver } from "../../redux/reducer";
import { isTokenExpired } from "../../services/checkToken";

const Drivers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [driverList, setDriverList] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showToggleStatus, setShowToggleStatus] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    fullName: "",
    gender: "",
    idCardNumber: "",
    address: "",
    phoneNumber: "",
    personalEmail: "",
    dateOfBirth: "",
    avatarFile: "",
  });

  // Check accessToken
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user == null || !user || isTokenExpired()) {
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
      return;
    } else {
      getAllDrivers(user.accessToken)
        .then((res) => {
          if (res && res.data && res.data.data) {
            setDriverList(res.data.data);
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
  const fetchDriverDetails = (id) => {
    getSingleDriver(id)
      .then((res) => {
        setFormData(res.data)
      })
  };

  // Fetch list of driver and pass to table
  const fetchDrivers = () => {
    if (currentSearchDriver !== "") {
      getMultiDriversAPI({
        code: currentSearchDriver,
        email: currentSearchDriver
      }).then((res) => {
        // console.log(res.data.data)
        if (res.data.data != null) {
          dispatch(updateDriver(res.data.data))
        } else {
          dispatch(updateDriver([]))
        }
      })
    } else {
      getAllDrivers()
        .then((res) => setDriverList(res.data.data))
        .catch((error) => {
          console.log(error);
        });
    }
  };

  // Call show detail form
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
      fetchDriverDetails(id);
      setShowDetails(true); // Show the modal
    }
  }

  // --UPDATE FUNCTIONS
  const handleUpdateClose = () => {
    setShowUpdate(false);
  }
  const handleUpdateShow = (driver) => {
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
      fetchDriverDetails(driver.id); // fetch old data       
      setShowUpdate(true); // show update modal
    }
  };
  const updateDriverData = () => {
    if (formData.personalEmail === null) {
      formData.personalEmail = "";
    }
    updateDriverAPI(formData, formData.id)
      .then((res) => {
        // console.log(res);
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
        fetchDrivers();
      })
      .catch((e) => {
        if (e.response && e.response.status === 401) {
          toast("You need to log in again to continue!", {
            autoClose: 1000,
          });
          navigate("/auth/login");
        } else {
          toast.error("Failed to update the driver!", {
            autoClose: 1000,
          });
          setShowUpdate(true);

        }
      })
  }
  // END UPDATE FUNCTIONS

  // TOGGLE STATUS FUNCTION
  const [oldStatus, setOldStatus] = useState("");
  const [toggleDriverId, setToggleDriverId] = useState(null);
  const handleToggleStatus = (driver) => {
    if (isTokenExpired()) {
      toast("You need to log in again to continue!", {
        autoClose: 1000,
        onClose: () => {
          navigate("/auth/login");
        },
      });
    } else {
      setOldStatus(driver.status)
      setToggleDriverId(driver.id)
      setShowToggleStatus(true);
    }

  }
  const toggleStatus = () => {
    let status = "INACTIVE";
    if (oldStatus === "INACTIVE") {
      status = "ACTIVE"
    }
    toggleStatusAPI(toggleDriverId, status)
      .then((res) => {
        // console.log(res)
        toast.success("Successull to enable/disable status!", {
          autoClose: 1000,
        });
        setShowToggleStatus(false);
        fetchDrivers()
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
  const [deleteDriverId, setDeleteDriverId] = useState();
  const handleDeleteDriver = (id) => {
    if (isTokenExpired()) {
      toast("You need to log in again to continue!", {
        autoClose: 1000,
        onClose: () => {
          navigate("/auth/login");
        },
      });
    } else {
      setDeleteDriverId(id)
      setShowDelete(true)
    }
  };
  const deleteDriver = () => {
    deleteDriverAPI(deleteDriverId)
      .then((res) => {
        if (res.status === 200) {
          // console.log(res)
          toast.success("Driver deleted successfully!", {
            autoClose: 1000,
          });
        } else {
          toast.warning("Can't delete the driver!", {
            autoClose: 1000,
          });
        }
        setShowDelete(false);
        fetchDrivers();
      })
      .catch((e) => {
        if (e.response && e.response.status === 401) {
          toast("You need to log in again to continue!", {
            autoClose: 1000,
          });
          navigate("/auth/login");
        } else {
          toast.error("Failed to delete the driver!", {
            autoClose: 1000,
          });
        }
      });
  }
  // END DELETE FUNCTIONS

  // ADD
  const handleAddDriver = () => {
    addDriverAPI(formData)
      .then((res) => {
        // console.log(res);
        if (res.status === 200) {
          toast.success("Driver has been add successfully!", {
            autoClose: 1000,
          });
          fetchDrivers()
          setShowAdd(false);
        }
      })
      .catch((e) => {
        if (e.response && e.response.status === 401) {
          toast("You need to log in again to continue!", {
            autoClose: 1000,
          });
          navigate("/auth/login");
        } else {
          toast.error("Failed to add this driver!", {
            autoClose: 1000,
          });
          setShowAdd(true);
        }
      });
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
        email: "",
        code: "",
        fullName: "",
        gender: "",
        idCardNumber: "",
        address: "",
        phoneNumber: "",
        personalEmail: "",
        dateOfBirth: "",
        avatarFile: "",
      });
      setShowAdd(true);
    }
  };
  // END ADD

  // PAGING
  const itemsPerPage = 5;
  const [currentDriverList, setCurrentDriverList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setTotalPages(Math.ceil(driverList.length / itemsPerPage));
    setStartIndex((currentPage - 1) * itemsPerPage);
  }, [driverList, currentPage]);

  useEffect(() => {
    setEndIndex(startIndex + itemsPerPage);
    setCurrentDriverList(driverList.slice(startIndex, endIndex));
  }, [driverList, startIndex, endIndex]);

  useEffect(() => {
    setCurrentPage(1);
  }, [driverList.length]);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // END PAGING

  // REDUX
  const drivers = useSelector((state) => state.drivers.value);
  const currentSearchDriver = useSelector((state) => state.drivers.currentSearchDriver);
  React.useEffect(() => {
    setDriverList(drivers)
  }, [drivers])
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
                <h3 className="mb-0">Manager Drivers</h3>
              </CardHeader>
              <CardBody>


                <Modal show={showToggleStatus} onHide={() => setShowToggleStatus(false)} animation={true}>
                  <Modal.Header >
                    <Modal.Title>Enable/Disable driver</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to enable/disable this driver?</Modal.Body>
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
                    <Modal.Title>Delete driver</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to delete this driver?</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDelete(false)}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={() => deleteDriver()}>
                      Delete
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Add model */}
                <Modal show={showAdd} onHide={handleAddClose}>
                  <Modal.Header >
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
                          <option value="true">Male</option>
                          <option value="false">Female</option>
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
                          placeholder="Input with your country code. For example +84 xxxxxxxxx "
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
                    <Button variant="primary" onClick={handleAddDriver}>
                      Add +
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Detail model */}
                <Modal show={showDetails} onHide={() => setShowDetails(false)}>
                  <Modal.Header >
                    <Modal.Title>Driver detail</Modal.Title>
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
                  <Modal.Header >
                    <Modal.Title>Update driver</Modal.Title>
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
                    <Button variant="primary" onClick={updateDriverData}>
                      Confirm
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Table list */}
                <div className="list">
                  <Button variant="primary" onClick={handleAddOpen} size="md" className="add_button">Add Driver +</Button>
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
                      {currentDriverList.map((driver, index) => (
                        <tr key={index}>
                          <td>
                            <span>{driver.id ? driver.id : "none"}</span>
                          </td>
                          <td>
                            {driver.avatar ? (
                              <img className="driver-img" src={driver.avatar} alt="" />
                            ) : (
                              <img className="driver-img" src={defaultAvatar} alt="" />
                            )}
                          </td>
                          <td>
                            <span className="link-style" onClick={(e) => {
                              e.preventDefault()
                              handleShowDetails(driver.id)
                            }}>{driver.code ? driver.code : "none"}</span>

                          </td>
                          <td>
                            <span className="link-style" onClick={(e) => {
                              e.preventDefault()
                              handleShowDetails(driver.id)
                            }}>{driver.email ? driver.email : "none"}</span>
                          </td>
                          <td>
                            <span className="link-style" onClick={(e) => {
                              e.preventDefault()
                              handleShowDetails(driver.id)
                            }}>{driver.fullName ? driver.fullName : "none"}</span>
                          </td>
                          <td>
                            <span className={`status ${driver.status === 'ACTIVE' ? 'active' : driver.status === 'INACTIVE' ? 'inactive' : ''}`}>
                              {driver.status}
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
                                  onClick={() => handleUpdateShow(driver)}
                                >
                                  Update
                                </DropdownItem>
                                <DropdownItem
                                  className="disable-enable-dropdown-item"
                                  onClick={() => {
                                    handleToggleStatus(driver)
                                  }}
                                >
                                  Enable/Disable
                                </DropdownItem>
                                <DropdownItem
                                  className="delete-dropdown-item"
                                  onClick={() => handleDeleteDriver(driver.id)}
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

export default Drivers;