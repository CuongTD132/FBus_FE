import React, { useEffect, useState } from "react";
import { Table } from 'react-bootstrap';
import "../../style/Manager.css"
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
  getSingleAccount,
  getMultiAccounts
} from "../../services/account";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateAccount } from "../../redux/reducer";
import { isTokenExpired } from "../../services/checkToken";

const Accounts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [accountList, setAccountList] = useState([]);

  // Check accessToken
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user == null || !user) {
      toast("You need to log in to continue!", {
        autoClose: 1000,
        onClose: () => {
          navigate("/auth/login");
        },
      });
      return;
    } else {
      if (isTokenExpired()) {
        toast("You need to log in again to continue!", {
          autoClose: 1000,
          onClose: () => {
            navigate("/auth/login");
          },
        });
        return;
      }
      getAllAccounts(user.accessToken)
        .then((res) => {
          if (res && res.data && res.data.data) {
            setAccountList(res.data.data);
          } else {
            toast.error("Error: Invalid response data");
            return;
          }
        })
        .catch((e) => {
          toast.error("Error: " + e.message);
        });
    }

  }, [])


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
  const currentSearchAccount = useSelector((state) => state.accounts.currentSearchAccount);
  React.useEffect(() => {
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
                {/* Table list */}
                <div className="list">
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
                            <a>{account.id ? account.id : "none"}</a>
                          </td>
                          <td>
                            <a>{account.code ? account.code : "none"}</a>
                          </td>
                          <td>
                            <a>{account.email ? account.email : "none"}</a>
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

export default Accounts;
