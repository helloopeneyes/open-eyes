import Main from "./main.js";
import React from "react";
import ReactDOM from "react-dom";

const delay = parseInt(new URLSearchParams(location.search).get("delay"), 10);
const hydrate = () => ReactDOM.hydrate(<Main items={initialState.items} />, document.getElementById("root"));
setTimeout(hydrate, delay);
