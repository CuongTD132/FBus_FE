import { useEffect, useState } from "react";
import { Button, Modal, Table } from 'react-bootstrap';
import "../../style/Manager.css"
import caution from '../../assets/img/caution.png'
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  CardFooter,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import Header from "../../components/Headers/Header";
import {
  getAllAccounts,
  getMultiAccounts,
} from "../../services/account";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { isTokenExpired } from "../../services/checkToken";

const Accounts = () => {
  const navigate = useNavigate();
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [accountList, setAccountList] = useState([]);
  const [sortingOrder, setSortingOrder] = useState("oldest");
  const [selectedStatus, setSelectedStatus] = useState("");
  // Check accessToken
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user == null || !user || isTokenExpired()) {
      setShowBackdrop(true);
      return;
    }
    getAllAccounts(user.accessToken)
      .then((res) => {
        if (res && res.data && res.data.data) {
          setAccountList(res.data.data);
        } else {
          console.log("Error: Invalid response data");
          return;
        }
      })
      .catch((e) => {
        console.log("Error: " + e.message);
      });
  }, [navigate])

  const fetchTrips = () => {
    getMultiAccounts({ status: selectedStatus })
      .then((res) => {
        let sortedAccounts = res.data.data;
        if (sortingOrder === "newest") {
          sortedAccounts = res.data.data.sort((a, b) => b.id - a.id);
        } else if (sortingOrder === "oldest") {
          sortedAccounts = res.data.data.sort((a, b) => a.id - b.id);
        }

        setAccountList(sortedAccounts);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    fetchTrips();
  }, [sortingOrder, selectedStatus]);;

  const handleSortingChange = (order) => {
    setSortingOrder(order);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
  };

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
  const [currentAccountList, setCurrentAccountList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setTotalPages(Math.ceil(accountList.length / itemsPerPage));
    setStartIndex((currentPage - 1) * itemsPerPage);
  }, [accountList, currentPage]);

  useEffect(() => {
    setEndIndex(startIndex + itemsPerPage);
    setCurrentAccountList(accountList.slice(startIndex, endIndex));
  }, [accountList, startIndex, endIndex]);

  useEffect(() => {
    setCurrentPage(1);
  }, [accountList.length]);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // END PAGING

  // REDUX
  const accounts = useSelector((state) => state.accounts.value);
  useEffect(() => {
    setAccountList(accounts)
  }, [accounts])
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
                <h3 className="mb-0">Manager Accounts</h3>
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

                {/* Table list */}
                <div className="list">
                  <div style={{ display: "flex" }}>
                    <div style={{ flexGrow: "8" }}></div>
                    <div style={{ padding: "20px"}}>
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
                        <option value="UNSIGNED">Unsigned</option>
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
                        <option value="oldest">Oldest Accounts</option>
                        <option value="newest">Newest Accounts</option>
                      </select>
                    </div>
                    <div style={{ flexGrow: "1" }}></div>
                  </div>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Code</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentAccountList.map((account, index) => (
                        <tr key={index}>
                          <td>
                            <span>{account.id ? account.id : "none"}</span>
                          </td>
                          <td>
                            <span className="normal-style">{account.code ? account.code : "none"}</span>
                          </td>
                          <td>
                            <span className="normal-style">{account.email ? account.email : "none"}</span>
                          </td>
                          <td>
                            <span className={`role ${account.role === 'Admin' ? 'admin' : account.role === 'Driver' ? 'driver' : ''}`}>
                              {account.role}
                            </span>
                          </td>
                          <td>
                            <span className={`status ${account.status === 'ACTIVE' ? 'active' : account.status === 'INACTIVE' ? 'inactive' : ''}`}>
                              {account.status}
                            </span>
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

export default Accounts;
