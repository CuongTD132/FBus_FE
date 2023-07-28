
import Login from "./views/pages/Login";
import Buses from "./views/pages/Buses";
import Drivers from "./views/pages/Drivers";
import Accounts from "./views/pages/Accounts";
import Maps from "./views/pages/Maps.js";
import Routes from "./views/pages/Routes";
import Stations from "./views/pages/Stations";
import Trips from "./views/pages/Trips";
import Test from "./views/pages/Test";
var routes = [
  {
    path: "/map",
    name: "Maps",
    icon: "ni ni-pin-3 text-orange",
    component: <Maps />,
    layout: "/admin",
  },
  {
    path: "/accounts",
    name: "Accounts",
    icon: "ni ni-single-02 text-red",
    component: <Accounts />,
    layout: "/admin",
  },
  {
    path: "/buses",
    name: "Buses",
    icon: "ni ni-bus-front-12 text-blue",
    component: <Buses />,
    layout: "/admin",
  },
  
  {
    path: "/drivers",
    name: "Drivers",
    icon: "ni ni-badge text-green",
    component: <Drivers />,
    layout: "/admin",
  },
  {
    path: "/test",
    name: "Test",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Test/>,
    layout: "/admin",
  },
  {
    path: "/stations",
    name: "Stations",
    icon: "ni ni-square-pin text-purple",
    component: <Stations />,
    layout: "/admin",
  },
  {
    path: "/routes",
    name: "Routes",
    icon: "ni ni-map-big text-yellow",
    component: <Routes />,
    layout: "/admin",
  },
  {
    path: "/trips",
    name: "Trips",
    icon: "ni ni-archive-2 text-info",
    component: <Trips />,
    layout: "/admin",
  },
  {
    path: "/login",
    component: <Login />,
    layout: "/auth",
  },
  
];
export default routes;
