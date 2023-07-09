
import Index from "./views/Index";
import Login from "./views/pages/Login";
import Buses from "./views/pages/Buses";
import Drivers from "./views/pages/Drivers";
import Accounts from "./views/pages/Accounts";
import Maps from "./views/pages/Maps.js";
import Routes from "./views/pages/Routes";
import Stations from "./views/pages/Stations";
var routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
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
    path: "/accounts",
    name: "Accounts",
    icon: "ni ni-single-02 text-red",
    component: <Accounts />,
    layout: "/admin",
  },
  {
    path: "/drivers",
    name: "Drivers",
    icon: "ni ni-badge text-green",
    component: <Drivers />,
    layout: "/admin",
  },
  // {
  //   path: "/tables",
  //   name: "Tables",
  //   icon: "ni ni-bullet-list-67 text-red",
  //   component: <Tables />,
  //   layout: "/admin",
  // },
  {
    path: "/routes",
    name: "Routes",
    icon: "ni ni-map-big text-yellow",
    component: <Routes />,
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
    path: "/maps",
    name: "Maps",
    icon: "ni ni-pin-3 text-orange",
    component: <Maps />,
    layout: "/admin",
  },
  {
    path: "/login",
    component: <Login />,
    layout: "/auth",
  },
  
];
export default routes;
