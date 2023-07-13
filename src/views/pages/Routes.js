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
  addRouteAPI,
  updateRouteAPI,
  getSingleRoute,
  getMultiRoutesAPI,
  getAllRoutes,
  deleteRouteAPI,
  toggleStatusAPI,
} from "../../services/routes";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateRoute } from "../../redux/reducer";
import { isTokenExpired } from "../../services/checkToken";


const Routes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [routeList, setRouteList] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showToggleStatus, setShowToggleStatus] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [formData, setFormData] = useState({
    beginning: "",
    destination: "",
    distance: "",
    stationIds: "",
  });
  const [detailData, setDetailData] = useState(({}))
  const stationIds = detailData.stations?.map(station => station.stationId).join(', ') || "";

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
      getAllRoutes(user.accessToken)
        .then((res) => {
          if (res && res.data && res.data.data) {
            setRouteList(res.data.data);
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
  const fetchRouteDetails = (id) => {
    getSingleRoute(id)
      .then((res) => {
        setDetailData(res.data)
      })
  };

  // Fetch list of Route and pass to table
  const fetchRoutes = () => {
    if (currentSearchRoute !== "") {
      getMultiRoutesAPI({
        beginning: currentSearchRoute,
        destination: currentSearchRoute,
      }).then((res) => {
        // console.log(res.data.data)
        if (res.data.data != null) {
          dispatch(updateRoute(res.data.data))
        } else {
          dispatch(updateRoute([]))
        }
      })
    } else {
      getAllRoutes()
        .then((res) => setRouteList(res.data.data))
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
      fetchRouteDetails(id);
      setShowDetails(true); // Show the modal
    }
  }

  // --UPDATE FUNCTIONS
  const handleUpdateClose = () => {
    setShowUpdate(false);
  }
  const handleUpdateShow = (route) => {
    if (isTokenExpired()) {
      toast("You need to log in again to continue!", {
        autoClose: 1000,
        onClose: () => {
          navigate("/auth/login");
        },
      });
    } else {
      fetchRouteDetails(route.id); // fetch old data
      setShowUpdate(true); // show update modal
    }
  };
  const updateRouteData = () => {
    updateRouteAPI(formData, formData.id)
      .then((res) => {
        // console.log(res);
        if (res.status === 200) {
          toast.success("Route update successfully!", {
            autoClose: 1000,
          });
        }
        setShowUpdate(false);
        fetchRoutes();
      })
      .catch((e) => {
        if (e.response && e.response.status === 401) {
          toast.error("You need to log in again to continue!", {
            autoClose: 1000,
          });
          navigate("/auth/login");
        } else {
          toast.error("Failed to update the route!", {
            autoClose: 1000,
          });
          setShowUpdate(true);
        }
      })
  }
  // END UPDATE FUNCTIONS

  // TOGGLE STATUS FUNCTION
  const [oldStatus, setOldStatus] = useState("");
  const [toggleRouteId, setToggleRouteId] = useState(null);
  const handleToggleStatus = (route) => {
    setOldStatus(route.status)
    setToggleRouteId(route.id)
    setShowToggleStatus(true);
  }
  const toggleStatus = () => {
    let status = "INACTIVE";
    if (oldStatus === "INACTIVE") {
      status = "ACTIVE"
    }
    toggleStatusAPI(toggleRouteId, status)
      .then((res) => {
        toast.success("Successull to enable/disable status!", {
          autoClose: 1000,
        });
        setShowToggleStatus(false);
        fetchRoutes()
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
  const [deleteRouteId, setDeleteRouteId] = useState();
  const handleDeleteRoute = (id) => {
    setDeleteRouteId(id)
    setShowDelete(true)
  };
  const deleteRoute = () => {
    deleteRouteAPI(deleteRouteId)
      .then((res) => {
        if (res.status === 200) {
          // console.log(res)
          toast.success("Route deleted successfully!", {
            autoClose: 1000,
          });
        }
        setShowDelete(false);
        fetchRoutes();
      })
      .catch((e) => {
        if (e.response && e.response.status === 401) {
          toast.error("You need to log in again to continue!", {
            autoClose: 1000,
          });
          navigate("/auth/login");
        } else {
          toast.error("Failed to delete the route!", {
            autoClose: 1000,
          });
        }
      });
  }
  // END DELETE FUNCTIONS

  // ADD
  const handleAddRoute = () => {
    addRouteAPI(formData)
      .then((res) => {
        // console.log(res);
        if (res.status === 200) {
          toast.success("Route has been add successfully!", {
            autoClose: 1000,
          });
          fetchRoutes()
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
          toast.error("Failed to add this route!", {
            autoClose: 1000,
          });
          setShowAdd(true);
        }
      });
  };
  const handleAddClose = () => {
    setShowAdd(false);
    setFormData({
      beginning: "",
      destination: "",
      distance: "",
      stationIds: "",
    })
  }
  const handleAddOpen = () => {
    setFormData({
      beginning: "",
      destination: "",
      distance: "",
      stationIds: "",
    });
    setShowAdd(true);
  };
  // END ADD

  // PAGING
  const itemsPerPage = 5;
  const [currentRouteList, setCurrentRouteList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setTotalPages(Math.ceil(routeList.length / itemsPerPage));
    setStartIndex((currentPage - 1) * itemsPerPage);
  }, [routeList, currentPage]);

  useEffect(() => {
    setEndIndex(startIndex + itemsPerPage);
    setCurrentRouteList(routeList.slice(startIndex, endIndex));
  }, [routeList, startIndex, endIndex]);

  useEffect(() => {
    setCurrentPage(1);
  }, [routeList.length]);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // END PAGING

  // REDUX
  const routes = useSelector((state) => state.routes.value);
  const currentSearchRoute = useSelector((state) => state.routes.currentSearchRoute);
  React.useEffect(() => {
    setRouteList(routes)
  }, [routes])
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
                <h3 className="mb-0">Manager Routes</h3>
              </CardHeader>
              <CardBody>


                <Modal show={showToggleStatus} onHide={() => setShowToggleStatus(false)} animation={true}>
                  <Modal.Header >
                    <Modal.Title>Enable/Disable route</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to enable/disable this route?</Modal.Body>
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
                    <Modal.Title>Delete route</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure to delete this route?</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDelete(false)}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={() => deleteRoute()}>
                      Delete
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Add model */}
                <Modal show={showAdd} onHide={handleAddClose}>
                  <Modal.Header >
                    <Modal.Title>Add route</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="beginning">
                        <Form.Label>Beginning </Form.Label>
                        <Form.Control
                          type="text"
                          name="beginning"
                          placeholder="Beginning "
                          autoFocus
                          required
                          value={formData.beginning}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              beginning: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="destination">
                        <Form.Label>Destination </Form.Label>
                        <Form.Control
                          type="text"
                          name="destination"
                          placeholder="Destination "
                          value={formData.destination}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              destination: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="distance">
                        <Form.Label>Distance </Form.Label>
                        <Form.Control
                          type="number"
                          name="distance"
                          placeholder="Distance "
                          required
                          value={formData.distance}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              distance: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="stationIds">
                        <Form.Label>StationIds</Form.Label>
                        <Form.Control
                          type="text"
                          name="stationIds"
                          placeholder="StationIds"
                          value={formData.stationIds ? formData.stationIds.join(",") : ""}
                          onChange={(e) => {
                            const inputArray = e.target.value.split(",").map(Number);
                            setFormData({
                              ...formData,
                              stationIds: inputArray
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
                    <Button variant="primary" onClick={handleAddRoute}>
                      Add +
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Detail model */}
                <Modal show={showDetails} onHide={() => setShowDetails(false)}>
                  <Modal.Header >
                    <Modal.Title>Route detail</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="beginning">
                        <Form.Label>Beginning </Form.Label>
                        <Form.Control
                          type="text"
                          name="beginning"
                          autoFocus
                          readOnly
                          value={detailData.beginning}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="destination">
                        <Form.Label>Destination </Form.Label>
                        <Form.Control
                          type="text"
                          name="destination"
                          placeholder="Destination "
                          readOnly
                          value={detailData.destination}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="distance">
                        <Form.Label>Distance </Form.Label>
                        <Form.Control
                          type="text"
                          name="distance"
                          readOnly
                          value={detailData.distance + " m"}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="stationIds">
                        <Form.Label>StationIds</Form.Label>
                        <Form.Control
                          type="text"
                          name="stationIds"
                          placeholder="Stations have not been added yet"
                          readOnly
                          value={stationIds}
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
                    <Modal.Title>Update route</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="beginning">
                        <Form.Label>Beginning </Form.Label>
                        <Form.Control
                          type="text"
                          name="beginning"
                          placeholder="Beginning "
                          autoFocus
                          required
                          value={detailData.beginning}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              beginning: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="destination">
                        <Form.Label>Destination </Form.Label>
                        <Form.Control
                          type="text"
                          name="destination"
                          placeholder="Destination "
                          value={detailData.destination}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              destination: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="distance">
                        <Form.Label>Distance </Form.Label>
                        <Form.Control
                          type="number"
                          name="distance"
                          placeholder="Distance "
                          required
                          value={detailData.distance}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              distance: e.target.value
                            })
                          }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="stationIds">
                        <Form.Label>StationIds</Form.Label>
                        <Form.Control
                          type="text"
                          name="stationIds"
                          placeholder="Stations have not been added yet"
                          value={stationIds}
                          onChange={(e) => {
                            const inputArray = e.target.value.split(",").map(Number);
                            setFormData({
                              ...formData,
                              stationIds: inputArray
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
                    <Button variant="primary" onClick={updateRouteData}>
                      Confirm
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/* Table list */}
                <div className="list">
                  <Button variant="primary" onClick={handleAddOpen} size="md" className="add_button">Add Route +</Button>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Beginning</th>
                        <th>Destination</th>
                        <th>Distance</th>
                        <th>Status</th>
                        <th>More Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRouteList.map((route, index) => (
                        <tr key={index}>
                          <td>
                            <span>{route.id}</span>
                          </td>
                          <td>
                            <span className="link-style" onClick={(e) => {
                              e.preventDefault()
                              handleShowDetails(route.id)
                            }}>{route.beginning}</span>

                          </td>
                          <td>
                            <span className="link-style" onClick={(e) => {
                              e.preventDefault()
                              handleShowDetails(route.id)
                            }}>{route.destination}</span>
                          </td>
                          <td>
                            <span className="link-style" onClick={(e) => {
                              e.preventDefault()
                              handleShowDetails(route.id)
                            }}>{route.distance + " m"}</span>
                          </td>
                          <td>
                            <span className={`status ${route.status === 'ACTIVE' ? 'active' : route.status === 'INACTIVE' ? 'inactive' : ''}`}>
                              {route.status}
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
                                  onClick={() => handleUpdateShow(route)}
                                >
                                  Update
                                </DropdownItem>
                                <DropdownItem
                                  className="disable-enable-dropdown-item"
                                  onClick={() => {
                                    handleToggleStatus(route)
                                  }}
                                >
                                  Enable/Disable
                                </DropdownItem>
                                <DropdownItem
                                  className="delete-dropdown-item"
                                  onClick={() => handleDeleteRoute(route.id)}
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

export default Routes;