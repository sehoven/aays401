import React from "react";
import { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-15";

import DrawingTools from "../src/components/DrawingTools.js";
import { PolygonArray } from "../src/components/Overlay.js";

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

describe("DrawingTools", () => {
  let mountedDrawingTools;
  let props;
  let mockCallback = jest.fn();

  const drawingTools = () => {
    if(!mountedDrawingTools) {
      mountedDrawingTools = shallow(<DrawingTools {...props}/>);
    }
    return mountedDrawingTools;
  }

  beforeEach(() => {
    mountedDrawingTools = null;
    props = {
      map: new google.maps.Map(),
      maps: google.maps,
      flagCallback: mockCallback
    }
  });

  it("renders nothing", () => {
    expect(drawingTools().children().length).toBe(0);
  });

  // Nothing of value to test here because the Google API cannot be directly tested with React
});
