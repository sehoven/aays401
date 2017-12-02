import React from "react";
import { configure, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-15";
import { Enum } from "enumify";

import LandingPage, { AuthPage } from "../src/components/LandingPage.js";
import MapContainer from "../src/components/MapContainer.js";
import { AppBar } from "../src/components/UIComponents.js";

class PanelType extends Enum {}
PanelType.initEnum(['LOGIN', 'SIGNUP']);

configure({ adapter: new Adapter() });

describe("LandingPage", () => {
  let mountedLandingPage;
  let props;

  const landingPage = () => {
    if(!mountedLandingPage) {
      mountedLandingPage = mount(<LandingPage {...props}/>);
    }
    return mountedLandingPage;
  }

  beforeEach(() => {
    mountedLandingPage = null;
    props = {
      PanelType: PanelType
    }
  });

  it("setAuthenticated sets state correctly", () => {
    landingPage().instance().setState({isAuthenticated: false});
    landingPage().instance().setAuthenticated();
    expect(landingPage().state().isAuthenticated).toBe(true);
  });

  it("logout sets state correctly", () => {
    landingPage().instance().setState({isAuthenticated: true});
    landingPage().instance().logout();
    expect(landingPage().state().isAuthenticated).toBe(false);
  });


  describe("state not ready", () => {
    beforeEach(() => {
      landingPage().instance().setState({isReady: false});
    });

    it("only renders app bar", () => {
      const children = landingPage().children();
      expect(children.length).toBe(1);
    });

    it("renders AppBar", () => {
      expect(landingPage().find(AppBar).length).toBe(1);
    });
  });

  describe("state ready", () => {
    beforeEach(() => {
      landingPage().instance().setState({isReady: true});
    });

    it("always renders a div", () => {
      const divs = landingPage().find("div");
      expect(divs.length).toBeGreaterThan(0);
    });

    describe("authenticated", () => {
      beforeEach(() => {
        landingPage().setState({isAuthenticated: true});
      });

      it("renders MapContainer", () => {
        expect(landingPage().find(MapContainer).length).toBe(1);
      });

      it("renders logout", () => {
        expect(landingPage().find("#logout").length).toBe(1);
      });

      it("click logout triggers logout function", () => {
        let mockLogout = jest.fn();
        landingPage().instance().logout = mockLogout;
        landingPage().find("#logout").simulate("click", {stopPropagation: () => undefined});
        expect(mockLogout).toHaveBeenCalled();
      });
    });

    describe("not authenticated", () => {
      beforeEach(() => {
        landingPage().setState({isAuthenticated: false});
      });

      it("renders AuthPage", () => {
        expect(landingPage().find(AuthPage).length).toBe(1);
      });
    });
  });
});

describe("AuthPage", () => {
  let mountedAuthPage;
  let props;

  const authPage = () => {
    if(!mountedAuthPage) {
      mountedAuthPage = mount(<AuthPage {...props}/>);
    }
    return mountedAuthPage;
  }

  beforeEach(() => {
    mountedAuthPage = null;
    props = {
      PanelType: PanelType
    }
  });

  it("always renders a div", () => {
    const divs = authPage().find("div");
    expect(divs.length).toBeGreaterThan(0);
  });

  it("always renders form", () => {
    expect(authPage().find("form").length).toBe(1);
  });

  describe("when LOGIN tab active", () => {
    beforeEach(() => {
      authPage().setState({currentPanel: authPage().props().PanelType.LOGIN});
    });

    it("show only one tab", () => {
      let activeTabs = authPage().find(".activeTabButton");
      expect(activeTabs.length).toBe(1);
    });

    it("show LOGIN tab", () => {
      authPage().find("#login-tab").hasClass("activeTabButton");
    });

    it("onClick on signup tab switches to login tab", () => {
      authPage().find("#signup-tab").simulate("click", {stopPropagation: () => undefined});
      expect(authPage().state().currentPanel).toEqual(PanelType.SIGNUP);
      expect(authPage().find("#signup-tab").hasClass("activeTabButton")).toBe(true);
    });

    it("two inputs visible", () => {
      expect(authPage().find("input").length).toBe(2);
    });
  });

  describe("when SIGNUP active", () => {
    beforeEach(() => {
      authPage().setState({currentPanel: authPage().props().PanelType.SIGNUP});
    });

    it("show only one tab", () => {
      let activeTabs = authPage().find(".activeTabButton");
      expect(activeTabs.length).toBe(1);
    });

    it("show SIGNUP tab", () => {
      authPage().find("#signup-tab").hasClass("activeTabButton");
    });

    it("onClick on login tab switches to login tab", () => {
      authPage().find("#login-tab").simulate("click", {stopPropagation: () => undefined});
      expect(authPage().state().currentPanel).toEqual(PanelType.LOGIN);
      expect(authPage().find("#login-tab").hasClass("activeTabButton")).toBe(true);
    });

    it("four inputs visible", () => {
      expect(authPage().find("input").length).toBe(4);
    });
  });
});
