import React from "react";
import ReactDOM from "React-dom";
import { shallow } from 'enzyme';
import GoogleMap from 'google-map-react';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import sinon from "sinon";

import {NavList} from "../src/components/NavList.js";

configure({ adapter: new Adapter() });

// We are still investigating the best way to test components that use the Google Maps API.
it("initial markers is empty", ()=>{
    const wrapper = shallow(<NavList/>);
    console.log(wrapper.state());
});