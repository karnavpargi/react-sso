import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import decode from "jwt-decode";
import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { Col, Row } from "react-bootstrap";
import jwtDecode from "jwt-decode";
// import { Col, Row } from "react-bootstrap";
let fulfill = false;

function App() {
  const [ip, setIP] = useState("");
  const [userData, setUserData] = useState(0);
  const [SSOToken, setSSOToken] = useState("");
  const [token, setToken] = useState("");
  // const [tanent, setTanent] = useState("")

  //creating function to load ip address from the API
  const retrieveIpAddress = async () => {
    handleSSOResponse(); /* get the data from localstorage and add it to state*/
    try {
      // axios.defaults.headers.common["Authorization"] = undefined;
      const res = await axios.get("http://geolocation-db.com/json");
      console.log("res.data.IPv4", res.data.IPv4);
      setIP(res.data.IPv4);
    } catch (error) {
      console.log("err", error.message);
    }
  };

  ///* get the data from localstorage and add it to state*/
  const handleSSOResponse = async (response) => {
    if (response?.clientId) {
      localStorage.setItem("response", JSON.stringify(response));
    } else {
      response = JSON.parse(localStorage.getItem("response"));
    }
    setSSOToken(response.credential);
    setUserData(await decode(response.credential));
    console.log("body", response);
  };

  const callApi = (body) => {
    // axios.defaults.headers.common["Authorization"] = `Bearer ${SSOToken}`;
    axios
      .get("http://localhost:3001/sso", {
        headers: { Authorization: `Bearer ${SSOToken}` },
        ip: ip,
      })
      .then((response) => {
        const data = response.data;
        if (data.status === 200) {
          setToken(data.message);
          localStorage.setItem("authToken", data.message);
        } else {
          alert(data.message);
        }
      });
  };

  const validateToken = () => {
    axios
      .get("http://localhost:3001/authorize", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const data = response.data;
        if (data.status === 200) {
          try {
            console.log("jwtDecode(data.message)", jwtDecode(data.message));
          } catch (error) {
            alert(error);
          }
        } else {
          alert(data.message);
        }
      });
  };

  useEffect(() => {
    if (!fulfill) retrieveIpAddress();
    fulfill = true;
  });

  useEffect(() => {
    /*global google*/
    google.accounts.id.initialize({
      client_id:
        "",
      callback: handleSSOResponse,
    });

    google.accounts.id.renderButton(document.getElementById("signinDiv"), {
      theme: "outline",
      size: "large",
    });
  }, []);

  return (
    <div className="container">
      <Stack gap={2} className="col-md-10 mx-auto">
        <Row>
          <Col>
            <Form>
              {userData &&
                Object.entries(userData).map((ele, key) => (
                  <Form.Group
                    className="mb-3"
                    controlId="formBasicEmail"
                    key={`${ele[0]}`}
                  >
                    <Form.Label>{ele[0]}</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={ele[1]}
                      disabled
                    />
                  </Form.Group>
                ))}
            </Form>
          </Col>
          <Col>
            <center style={{ margin: "50px auto" }}>
              <div id="signinDiv"></div>
            </center>

            <Form>
              <Form.Group className="mb-3">
                <Form.Label>IP Address</Form.Label>
                <Form.Control type="text" placeholder="IP" value={ip} />
              </Form.Group>
              {/* <Form.Group className="mb-3">
                <Form.Label>Tanent</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="tanent name"
                  onChange={({ target }) =>
                    setUserData({
                      ...userData,
                      tanent: target?.value?.toUpperCase(),
                    })
                  }
                  value={userData.tanent}
                />
              </Form.Group> */}
              <Button variant="primary" onClick={() => callApi(userData)}>
                Submit
              </Button>
            </Form>
            {/* style={{ padding: "20px" }} */}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Token</Form.Label>
                <Form.Control
                  as="textarea"
                  placeholder="generated token"
                  style={{ height: "100px" }}
                  value={token}
                />
              </Form.Group>
              <Button variant="primary" onClick={() => validateToken()}>
                validateToken
              </Button>
            </Form>
          </Col>
        </Row>
      </Stack>
    </div>
  );
}

export default App;
