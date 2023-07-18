import { Link } from "react-router-dom";
// reactstrap components
import {
  NavbarBrand,
  Navbar,
  Container,
} from "reactstrap";

const AdminNavbar = () => {
  return (
    <>
      <Navbar className="navbar-top navbar-horizontal navbar-dark" expand="md">
        <Container className="px-4">
          <NavbarBrand to="/" tag={Link}>
            <img
                   style={{ width: '30%', height: '30%' }}
              alt="..."
              src={require("../../assets/img/brand/bus-promax.jpg")}
            />
          </NavbarBrand>
         
        </Container>
      </Navbar>
    </>
  );
};

export default AdminNavbar;
