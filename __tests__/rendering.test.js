import React from "react";
import ReactDOM from "React-dom";
import {Index} from "../src/index.js";

it("renders without crashing", ()=>{
    //const div = document.createElement("app");
    ReactDOM.render(
      <Index />,
      document.getElementById('app')
    );
});
