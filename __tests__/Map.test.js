import React from "react";
import { configure, mount } from 'enzyme';
import GoogleMap from 'google-map-react';
import Adapter from 'enzyme-adapter-react-15';

import Map from "../src/components/Map.js";

configure({ adapter: new Adapter() });

describe("Map", () => {
  let mountedMap;
  let props;

  const map = () => {
    if(!mountedMap) {
      mountedMap = mount(<Map {...props}/>);
    }
    return mountedMap;
  }

  beforeEach(() => {
    props = {
      setMapRef: function() {}
    }
    mountedMap = null;
  });

  it("always renders GoogleMap", () => {
    expect(map().find(GoogleMap).length).toBe(1);
  });
});
