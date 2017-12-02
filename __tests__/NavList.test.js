import React from "react";
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';

import NavList from "../src/components/NavList.js";

// TO MOVE MOCK OBJECT TO GLOBAL LEVEL FOR ALL TESTS
const google = {
  maps: {
    Map: function() {
      return {
        setZoom: function() {
          return {};
        },
        setCenter: function() {
          return {};
        }
      };
    },
    Geocoder: function() {
      return {
        geocode: function() {
          return {};
        }
      }
    },
    Polygon: function() {
      return {
        setEditable: function() {
          return {};
        },
        setMap: function() {
          return {};
        }
      };
    },
    event: {
      addListener: function() {
        return {};
      },
      removeListener: function() {
        return {};
      }
    },
    ControlPosition: {
      TOP_RIGHT: 0
    },
    drawing: {
      OverlayType: {
        POLYGON: 0
      },
      DrawingManager: function() {
        return {
          setDrawingMode: function() {
            return {};
          },
          setOptions: function() {
            return {};
          }
        };
      }
    }
  }
}

configure({ adapter: new Adapter() });

describe("NavList", () => {
  let mountedNavList;
  let props;

  const navList = () => {
    if(!mountedNavList) {
      mountedNavList = mount(<NavList {...props}/>);
    }
    return mountedNavList;
  }

  beforeEach(() => {
    mountedNavList = null;
  });

  describe("when data not ready", () => {
    beforeEach(() => {
      props = {
        data: {
          ready: false
        }
      }
    });

    it("always renders one div", () => {
      expect(navList().find("div").length).toBe(1);
    });
  });

  describe("when data ready", () => {
    beforeEach(() => {
      props = {
        data: {
          ready: true,
          data: []
        },
        autocomplete: [],
        map: new google.maps.Map(),
        maps: google.maps
      }
    });

    it("always renders div", () => {
      expect(navList().find("div").length).toBeGreaterThan(0);
    });

    describe("with autocomplete data", () => {
      let data = ["a", "b", "c"];

      beforeEach(() => {
        props.autocomplete = data;
        props.placeIds = [
          {place_id: ""}
        ];
      });

      it("renders correct number of autocomplete results", () => {
        expect(navList().find("#navbar-list-search").children().length).toBe(data.length);
      });

      it("clicking on item", () => {
        navList().find("#navbar-list-search").childAt(0).simulate("click", {stopPropagation: () => undefined});
        // TODO
        // How should we test that map centered on id?
        // How do we qualify the result of this test?
      });
    });

    describe("with data", () => {
      let data = [{}, {}, {}];

      beforeEach(() => {
        props.data.data = data;
      });

      it("renders correct number of data results", () => {
        expect(navList().find("#navbar-list-search").children().length).toBe(data.length);
      });

      it("clicking on item", () => {
        //navList().find("#navbar-list").childAt(0).simulate("click", {stopPropagation: () => undefined});
        // TODO
        // Need to deal with dependency on Tabs element to complete this test
        // Also how do we qualify the result of this test?
      });
    });
  });
});
