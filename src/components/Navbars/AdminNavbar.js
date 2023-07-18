
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Modal } from 'react-bootstrap';
import caution from '../../assets/img/caution.png'
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Form,
  FormGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  InputGroup,
  Navbar,
  Nav,
  Container,
  Media,
} from "reactstrap";
import "../../style/Manager.css"
import { useEffect, useState } from "react";
import { getMultiBusesAPI } from "../../services/bus";
import { getMultiDriversAPI } from "../../services/driver";
import { getMultiAccounts } from "../../services/account";
import { getMultiStationsAPI } from "../../services/station";
import { getMultiRoutesAPI } from "../../services/routes";
import { useDispatch } from "react-redux";
import { setCurrentSearchBus, updateBus, setCurrentSearchAccount, updateAccount, setCurrentSearchDriver, updateDriver, updateStation, setCurrentSearchStation, updateRoute, setCurrentSearchRoute } from "../../redux/reducer";
import { isTokenExpired } from "../../services/checkToken";

const AdminNavbar = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [user, setUser] = useState({
    picture: '',
    name: ''
  });
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user ) {
      navigate('/auth/login')
      return;
    }
     else if (isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }

    setUser(user)
  }, [navigate])

  // EXPIRED
  const handleLogoutClose = () => {
    navigate("/auth/login");
    localStorage.removeItem('user');
    toast.success("Logout successful", {
      autoClose: 1000,
    });
    setShowBackdrop(false);
  }
  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success("Logout successful", {
      autoClose: 1000,
    });
    navigate("/auth/login");
  };


  // SEARCH FUNCTIONS
  const dispatch = useDispatch();

  const handleSearch = (searchString = "") => {
    localStorage.setItem('currentSearch', searchString);
    const user = JSON.parse(localStorage.getItem('user'))
    if (user == null || !user ||isTokenExpired()) {
      setShowBackdrop(true)
      return;
    }
    getMultiBusesAPI({
      licensePlate: searchString,
      code: searchString
    }).then((res) => {
      // console.log(res.data)
      if (res.data.data != null) {
        dispatch(updateBus(res.data.data))
        dispatch(setCurrentSearchBus(searchString))
      } else {
        dispatch(updateBus([]))
      }
    })

    getMultiDriversAPI({
      code: searchString,
      email: searchString
    }).then((res) => {
      // console.log(res.data)
      if (res.data.data != null) {
        dispatch(updateDriver(res.data.data))
        dispatch(setCurrentSearchDriver(searchString))
      } else {
        dispatch(updateDriver([]))
      }
    })

    getMultiAccounts({
      code: searchString,
      email: searchString
    }).then((res) => {
      // console.log(res.data)
      if (res.data.data != null) {
        dispatch(updateAccount(res.data.data))
        dispatch(setCurrentSearchAccount(searchString))
      } else {
        dispatch(updateAccount([]))
      }
    })

    getMultiStationsAPI({
      code: searchString,
    }).then((res) => {
      // console.log(res.data)
      if (res.data.data != null) {
        dispatch(updateStation(res.data.data))
        dispatch(setCurrentSearchStation(searchString))
      } else {
        dispatch(updateStation([]))
      }
    })

    getMultiRoutesAPI({
      beginning: searchString,
      destination: searchString,
    }).then((res) => {
      // console.log(res.data)
      if (res.data.data != null) {
        dispatch(updateRoute(res.data.data))
        dispatch(setCurrentSearchRoute(searchString))
      } else {
        dispatch(updateRoute([]))
      }
    })
  }

  // END FUNCTIONS

  return (
    <>
      <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
        <Container fluid>
          <Modal
            show={showBackdrop}
            onHide={() => setShowBackdrop(false)}
            animation={true}
            dialogClassName="modal-logout"
            backdrop="static"
          >
            <Modal.Body className="modal-logout-body">
              <h2> PLEASE LOG IN AGAIN TO CONTINUE!!!</h2>
              <img className="img" src={caution} alt="" />

              <Button className="button" color="primary" onClick={handleLogoutClose}>
                OK
              </Button>
            </Modal.Body>
          </Modal>
          <Form className="navbar-search navbar-search-dark form-inline mr-3 d-none d-md-flex ml-lg-auto">
            {(location.pathname !== "/admin/map" && location.pathname !== "/admin/coords") && (
              <FormGroup className="mb-0">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="fas fa-search" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input placeholder="Search" type="text" onChange={(e) => handleSearch(e.target.value)} />
                </InputGroup>
              </FormGroup>
            )}
          </Form>
          <Nav className="align-items-center d-none d-md-flex" navbar>
            <UncontrolledDropdown nav>
              <DropdownToggle className="pr-0" nav>
                <Media className="align-items-center">
                  <span className="avatar avatar-sm rounded-circle">
                    <img
                      alt="..."
                      src={user.picture}
                    />
                  </span>
                  <Media className="ml-2 d-none d-lg-block">
                    <span className="mb-0 text-sm font-weight-bold">
                      {user.name}
                    </span>
                  </Media>
                </Media>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-arrow" right>
                <DropdownItem className="noti-title" header tag="div">
                  <h6 className="text-overflow m-0">Welcome to Admin Page!</h6>
                </DropdownItem>
                <DropdownItem divider />
                <GoogleOAuthProvider clientId="319062689013-fku6m54vf3arbhrnoiij84qb0e852o28.apps.googleusercontent.com">
                  <DropdownItem onClick={handleLogout}>
                    <i className="ni ni-user-run" />
                    <span>Logout</span>
                  </DropdownItem>
                </GoogleOAuthProvider>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};

export default AdminNavbar;

