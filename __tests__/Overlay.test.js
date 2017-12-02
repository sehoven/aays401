import React from "react";
import { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-15";
import { NotificationContainer, NotificationManager } from "react-notifications";

import OverlayContainer, { Overlay, Polygon, PolygonArray } from "../src/components/Overlay.js";
import DrawingTools from "../src/components/DrawingTools.js";

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
        setOptions: function() {
          return {};
        },
        setEditable: function() {
          return {};
        },
        setMap: function() {
          return {};
        },
        getPath: function() {
          return {
            getLength: function() {
              return {};
            }
          };
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

describe("Overlay", () => {
  let mountedOverlay;
  let props;

  const overlay = () => {
    if(!mountedOverlay) {
      mountedOverlay = mount(<Overlay {...props}/>);
    }
    return mountedOverlay;
  }

  beforeEach(() => {
    mountedOverlay = null;
    props = {
      map: new google.maps.Map(),
      maps: google.maps
    }
  });

  describe("when not active", () => {
    beforeEach(() => {
      props.active = false;
    });

    it("always renders nothing", () => {
      expect(overlay().children().length).toBe(0);
    });
  });

  describe("when active", () => {
    beforeEach(() => {
      props.active = true;
    });

    it("always renders div", () => {
      expect(overlay().find("div").length).toBeGreaterThan(0);
    });

    it("always renders NotificationContainer", () => {
      expect(overlay().find(NotificationContainer).length).toBe(1);
    });

    describe("when containerState is 1", () => {
      beforeEach(() => {
        props.containerState = 1;
      });

      it("renders one button", () => {
        expect(overlay().find("button").length).toBe(1);
      });

      it("click on draw button", () => {
        let mockCallback = jest.fn();
        props.drawClickCallback = mockCallback;

        overlay().find("#draw-button").simulate("click", {stopPropagation: () => undefined});
        expect(mockCallback).toHaveBeenCalled();
      });
    });

    describe("when containerState is 2", () => {
      beforeEach(() => {
        props.containerState = 2;
      });

      it("renders two buttons", () => {
        expect(overlay().find("button").length).toBe(2);
      });

      it("click on cancel button", () => {
        let mockCallback = jest.fn();
        props.cancelClickCallback = mockCallback;

        overlay().find("#cancel-draw-button").simulate("click", {stopPropagation: () => undefined});
        expect(mockCallback).toHaveBeenCalled();
      });

      it("click on confirm button", () => {
        let mockCallback = jest.fn();
        props.confirmClickCallback = mockCallback;

        overlay().find("#confirm-draw-button").simulate("click", {stopPropagation: () => undefined});
        expect(mockCallback).toHaveBeenCalled();
      });
    });

    describe("when containerState is 3", () => {
      beforeEach(() => {
        props.containerState = 3;
      });

      it("renders three buttons", () => {
        expect(overlay().find("button").length).toBe(3);
      });

      it("click on draw button", () => {
        let mockCallback = jest.fn();
        props.drawClickCallback = mockCallback;

        overlay().find("#draw-button").simulate("click", {stopPgropagation: () => undefined});
        expect(mockCallback).toHaveBeenCalled();
      });

      it("click on clear button", () => {
        let mockCallback = jest.fn();
        props.clearClickCallback = mockCallback;
        let mockHasDeliveryZone = jest.fn();
        props.hasDeliveryZone = mockHasDeliveryZone;

        overlay().find("#clear-button").simulate("click", {stopPropagation: () => undefined});
        expect(mockCallback).toHaveBeenCalled();
        expect(mockHasDeliveryZone).toHaveBeenCalled();
      });

      it("click on edit button", () => {
        let mockCallback = jest.fn();
        props.editClickCallback = mockCallback;

        overlay().find("#edit-button").simulate("click", {stopPropagation: () => undefined});
        expect(mockCallback).toHaveBeenCalled();
      });
    });
  });
});

describe("OverlayContainer mount", () => {
  let mountedOverlayContainer;
  let props;

  const overlayContainer = () => {
    if(!mountedOverlayContainer) {
      mountedOverlayContainer = mount(<OverlayContainer {...props}/>);
    }
    return mountedOverlayContainer;
  }

  beforeEach(() => {
    mountedOverlayContainer = null;
    props = {
      map: new google.maps.Map(),
      maps: google.maps
    }
  });

  describe("when not active", () => {
    beforeEach(() => {
      props.active = false;
    });

    it("always renders nothing", () => {
      expect(overlayContainer().children().length).toBe(0);
    });
  });

  describe("when active", () => {
    beforeEach(() => {
      props.active = true;
    });

    it("always renders div", () => {
      expect(overlayContainer().find("div").length).toBeGreaterThan(0);
    });

    it("always renders Overlay", () => {
      expect(overlayContainer().find(Overlay).length).toBeGreaterThan(0);
    })

    it("always renders five checkboxes", () => {
      expect(overlayContainer().find('[type="checkbox"]').length).toBe(5);
    })

    it("always renders navbar-list-draw", () => {
      expect(overlayContainer().find("#navbar-list-draw").length).toBe(1);
    });

    it("click check box", () => {
      let mockToggleFilter = jest.fn();
      overlayContainer().instance().polygonArray.toggleFilter = mockToggleFilter;
      overlayContainer().find("#checkbox-red > input").simulate("click", {stopPropagation: () => undefined});
      expect(mockToggleFilter).toHaveBeenCalled();
    });

    it("iterable creates cards in navbar list", () => {
      let iterables = [{
        image: "",
        values: null
      },
      {
        image: "",
        values: null
      }];
      let filters = {
        residenceFilter: true,
        apartmentFilter: true,
        industrialFilter: true,
        commercialFilter: true,
        unspecifiedFilter: true
      }
      overlayContainer().setState({
        iterable: iterables,
        filters: filters
      });
      expect(overlayContainer().find("#navbar-list-draw").children().length).toBe(iterables.length);
      expect(overlayContainer().find(".navbar-count-poly-text > label").length).toBe((Object.keys(filters).length) * iterables.length);
    });

    describe("when drawing", () => {
      beforeEach(() => {
        overlayContainer().setState({isDrawing: true});
      });

      it("renders DrawingTools", () => {
        expect(overlayContainer().find(DrawingTools).length).toBe(1);
      });
    });
  });
});

describe("Polygon", () => {
  it("contructor", () => {
    let googlePolygon = new google.maps.Polygon();
    let polygon = new Polygon(googlePolygon);
    expect(polygon.polygon).toEqual(googlePolygon);
  });
});

describe("PolygonArray", () => {
  let mountedOverlayContainer;
  let props;

  const overlayContainer = () => {
    if(!mountedOverlayContainer) {
      mountedOverlayContainer = mount(<OverlayContainer {...props}/>);
    }
    return mountedOverlayContainer;
  }

  beforeEach(() => {
    mountedOverlayContainer = null;
    props = {
      map: new google.maps.Map(),
      maps: google.maps
    }
  });

  it("contructor with one element", () => {
    let polygon = new Polygon();
    let polygons = new PolygonArray(google.map, google.maps, overlayContainer(), polygon);
    expect(polygons.arr.length).toBe(1);
    expect(polygons.arr[0]).toEqual(polygon);
  });

  it("constructor with multiple elements", () => {
    let polygon0 = new Polygon();
    let polygon1 = new Polygon();
    let polygons = new PolygonArray(google.map, google.maps, overlayContainer(), polygon0, polygon1);
    expect(polygons.arr.length).toBe(2);
    expect(polygons.arr[0]).toEqual(polygon0);
    expect(polygons.arr[1]).toEqual(polygon1);
  });

  it("empty constructor", () => {
    let polygons = new PolygonArray();
    expect(polygons.arr.length).toBe(0);
  });

  describe("with two polygons", () => {
    let polygon0, polygon1, polygonArray;
    beforeEach(() => {
      polygon0 = new Polygon(new google.maps.Polygon());
      polygon1 = new Polygon(new google.maps.Polygon());
      polygonArray = new PolygonArray();
      polygonArray.arr[0] = polygon0;
      polygonArray.arr[1] = polygon1;
    });

    it("getAll", () => {
      expect(polygonArray.getAll().length).toBe(2);
      expect(polygonArray.getAll()[0]).toEqual(polygonArray.arr[0]);
      expect(polygonArray.getAll()[1]).toEqual(polygonArray.arr[1]);
    });

    it("getLength", () => {
      expect(polygonArray.getLength()).toBe(2);
    });

    it("getOuter", () => {
      expect(polygonArray.getOuter().length).toBe(1);
      expect(polygonArray.getOuter()[0]).toEqual(polygonArray.arr[0]);
    });

    it("outerExists", () => {
      expect(polygonArray.outerExists()).toBe(true);
    });

    it("getAllInner", () => {
      expect(polygonArray.getAllInner().length).toBe(1);
      expect(polygonArray.getAllInner()[0]).toEqual(polygonArray.arr[1]);
    });

    it("getListIterable", () => {
      expect(polygonArray.getListIterable().length).toBe(2);
      expect(Object.keys(polygonArray.getListIterable()[0]).length).toBe(2);
      expect(polygonArray.getListIterable()[0].hasOwnProperty("image")).toBe(true);
      expect(polygonArray.getListIterable()[0].hasOwnProperty("values")).toBe(true);
    });

    // Some methods are not tested here because they are heavily dependent on the Polygon Object

    it("size", () => {
      expect(polygonArray.size()).toBe(2);
    });
  });
});
