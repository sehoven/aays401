import React from "react";
import { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-15";

import DrawingTools, { PolygonTools } from "../src/components/DrawingTools.js";
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
      maps: google.maps
    }
  });

  it("selectPolygon updates isSelected", () => {
    drawingTools().instance().polygon = new google.maps.Polygon();
    drawingTools().instance().selectPolygon();
    expect(drawingTools().instance().isSelected).toEqual(true);
  });

  it("deselectPolygon updates isSelected", () => {
    drawingTools().instance().polygon = new google.maps.Polygon();
    drawingTools().instance().isSelected = true;
    drawingTools().instance().deselectPolygon();
    expect(drawingTools().instance().isSelected).toEqual(false);
  });

  it("deletePolygon updates isSelected", () => {
    drawingTools().instance().polygon = new google.maps.Polygon();
    drawingTools().instance().deletePolygon();
    expect(drawingTools().instance().isSelected).toEqual(false);
  });

  // TODO More robust tests
  // Cannot really test setting the drawing tools with just a mock google object
});

describe("PolygonTools", () => {
  let mountedPolygonTools;
  let props, polygon, polygons;

  const polygonTools = () => {
    if(!mountedPolygonTools) {
      mountedPolygonTools = shallow(<PolygonTools {...props}/>);
    }
    return mountedPolygonTools;
  }

  beforeEach(() => {
    mountedPolygonTools = null;
    polygon = new google.maps.Polygon();
    polygons = new PolygonArray(polygon);
    props = {
      map: new google.maps.Map(),
      maps: google.maps,
      polygons: polygons
    }
  });

  it("component mounted", () => {
    expect(polygonTools().instance().data.length).toBe(polygons.size());
    expect(polygonTools().instance().mapListener).not.toBeNull();
  });

  // TODO Write useful tests for this component
  // A lot of it is hard to test because it depends on google maps objects
});
