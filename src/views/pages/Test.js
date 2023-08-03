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
  const fetchBuses = () => {
    if (currentSearchBus !== "") {
      getMultiBusesAPI({
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
      getMultiBusesAPI({ status: selectedStatus })
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
  }, [sortingOrder]);

  const handleSortingChange = (order) => {
    setSortingOrder(order);
  };

  const handleStatusFilter = (status) => {
    console.log(status)
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
