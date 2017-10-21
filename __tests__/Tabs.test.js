import React from "react";
import ReactDOM from "React-dom";
import { shallow } from 'enzyme';
import GoogleMap from 'google-map-react';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import sinon from "sinon";

import Tabs from "../src/components/Tabs.js";

configure({ adapter: new Adapter() });

//tests left blank because refactoring is needed for Tabs component
it("should toggle between indexes for tabs", ()=>{

});
