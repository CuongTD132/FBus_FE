import { useEffect } from "react";
import { Card, Container, Row } from "reactstrap";
import Header from "../../components/Headers/Header";
import { isTokenExpired } from "../../services/checkToken";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

const MapWrapper = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user == null || !user || isTokenExpired()) {
      return;
    }
  }, [navigate]);
  return (
    <>
      {/* <iframe
        src="https://f-bus-map-v2.vercel.app/"
        title="Maps"
        style={{ width: '100%', height: '800px', borderRadius: "5px", border: 'none' }}
      /> */}
      <h1>Hello</h1>
    </>
  );
};

const Maps = () => {
  return (
    <>
      <Header />
      <ToastContainer />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow border-0">
              <MapWrapper/>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Maps;