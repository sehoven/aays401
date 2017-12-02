import React from "react";
import { configure, mount } from "enzyme";
import GoogleMap from "google-map-react";
import Adapter from "enzyme-adapter-react-15";

import MapContainer from "../src/components/MapContainer.js";
import Map from "../src/components/Map.js";
import Tabs from "../src/components/Tabs.js";

configure({ adapter: new Adapter() });

describe("MapContainer", () => {
  let mountedMapContainer;

  const mapContainer = () => {
    if(!mountedMapContainer) {
      mountedMapContainer = mount(<MapContainer />);
    }
    return mountedMapContainer;
  }

  beforeEach(() => {
    mountedMapContainer = null;
  });

  it("always renders a div", () => {
    const divs = mapContainer().find("div");
    expect(divs.length).toBeGreaterThan(0);
  });

  it("always renders Map", () => {
    expect(mapContainer().find(Map).length).toBe(1);
  });

  describe("rendered Map", () => {
    let setMapRef;
    beforeEach(() => {
      setMapRef = jest.fn();
    })
  })

  it("only renders Tabs if mapLoaded", () => {
    expect(mapContainer().find(Tabs).length).toBe(0);
    mapContainer().setState({mapLoaded: true});
    expect(mapContainer().find(Tabs).length).toBe(1);
  });

  describe("rendered Tabs", () => {
    let map, maps;
    beforeEach(() => {
      map = {}, maps = {};
      mapContainer().setState({mapLoaded: true, map: map, maps: maps});
    });
  });

  it("setMapRef updates states correctly", () => {
    let map = {}, maps = {};

    mapContainer().instance().setMapRef(map, maps);
    expect(mapContainer().state().mapLoaded).toBe(true);
    expect(mapContainer().state().map).toEqual(map);
    expect(mapContainer().state().maps).toEqual(maps);
  });
});
