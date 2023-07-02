
import Index from "./views/Index";
import Login from "./views/examples/Login";
import Tables from "./views/examples/Tables";
import Buses from "./views/examples/Buses";
import Drivers from "./views/examples/Drivers";

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
    path: "/drivers",
    name: "Drivers",
    icon: "ni ni-single-02 text-yellow",
    component: <Drivers />,
    layout: "/admin",
  },
  {
    path: "/tables",
    name: "Tables",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Tables />,
    layout: "/admin",
  },
  {
    path: "/login",
    component: <Login />,
    layout: "/auth",
  },
  
];
export default routes;
