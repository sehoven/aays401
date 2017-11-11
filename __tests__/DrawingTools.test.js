import React from "react";
import { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-15";

import DrawingTools, { PolygonTools } from "../src/components/DrawingTools.js";

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
      mountedDrawingTools = mount(<DrawingTools {...props}/>);
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

  it("selectPolygon updates isSelected state", () => {
    drawingTools().setState({polygon: new google.maps.Polygon()});
    drawingTools().instance().selectPolygon();
    expect(drawingTools().state().isSelected).toEqual(true);
  });

  it("deselectPolygon updates isSelected state", () => {
    drawingTools().setState({polygon: new google.maps.Polygon(), isSelected: true});
    drawingTools().instance().deselectPolygon();
    expect(drawingTools().state().isSelected).toEqual(false);
  });

  it("deletePolygon updates correct states", () => {
    drawingTools().setState({polygon: new google.maps.Polygon()});
    drawingTools().instance().deletePolygon();
    expect(drawingTools().state().isSelected).toEqual(false);
  });

  // TODO More robust tests
});

describe("PolygonTools", () => {
  let mountedPolygonTools;
  let props;

  const polygonTools = () => {
    if(!mountedPolygonTools) {
      mountedPolygonTools = mount(<PolygonTools {...props}/>);
    }
    return mountedPolygonTools;
  }

  beforeEach(() => {
    mountedPolygonTools = null;
    props = {
      map: new google.maps.Map(),
      maps: google.maps
    }
  });

  // TODO Write tests
});



///////
///
/// TESTS FROM DRAWING TOOLS PRE-REFACTOR THAT COULD BE USEFUL IN WRITING MORE TESTS
///
///////

// describe("DrawingTools", () => {
//   let wrapper, props;
//
//   beforeEach(() => {
//     wrapper = shallow(<DrawingTools map={google.maps.Map} maps={google.maps}/>);
//   });
//
//   afterEach(() => {
//
//   });
//
//   it("initial state of drawing manager not null", () => {
//     expect(wrapper.state().drawingManager).not.toBeNull();
//   });
//
//   it("initial state of map listener not null", () => {
//     expect(wrapper.state().mapListener).not.toBeNull();
//   });
//
//   it("selectPolygon updates isSelected state", () => {
//     wrapper.setState({polygon: new google.maps.Polygon()});
//     wrapper.instance().selectPolygon();
//     expect(wrapper.state().isSelected).toEqual(true);
//   });
//
//   it("deselectPolygon updates isSelected state", () => {
//     wrapper.setState({polygon: new google.maps.Polygon(), isSelected: true});
//     wrapper.instance().deselectPolygon();
//     expect(wrapper.state().isSelected).toEqual(false);
//   });
//
//   it("deletePolygon updates correct states", () => {
//     wrapper.setState({polygon: new google.maps.Polygon()});
//     wrapper.instance().deletePolygon();
//     expect(wrapper.state().isSelected).toEqual(false);
//   });
// });
//
// describe("PolygonTools", () => {
//   let wrapper;
//
//   beforeEach(() => {
//     wrapper = mount(<PolygonTools map={google.maps.Map} maps={google.maps}/>);
//   });
//
//   afterEach(() => {
//     wrapper.detach();
//   });
// });
