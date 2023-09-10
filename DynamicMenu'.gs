class DynamicMenu {
  constructor(menu, docId, email) {
    const locations = getLocations();
    const year = new Date().getFullYear();
    const documentId = docId;
    const lastLocation = `${Keys.LastHistoryLocation}-${email}`;
    const lastHistoryDate = `${Keys.LastHistoryDate}-${email}`;
    const menuName = menu;
    this.createMenu = (ui) => {
      const locationsMenu = ui.createMenu('Locations');
      locations.forEach(param=> {
          const functionName = `function${param}`;
          locationsMenu.addItem(param, `${menuName}.${functionName}`)
      })
      const quartersMenu = ui.createMenu('Financial Quarters');
      quartersMenu.addSeparator();
      quartersMenu.addItem(`Current quarter ${year}`, `${menuName}.functionCurrent${year}`);
      quartersMenu.addItem(`First quarter ${year}`, `${menuName}.functionFirst${year}`);
      quartersMenu.addItem(`Second quarter ${year}`, `${menuName}.functionSecond${year}`);
      quartersMenu.addItem(`Third quarter ${year}`, `${menuName}.functionThird${year}`);
      quartersMenu.addItem(`Fourth quarter ${year}`, `${menuName}.functionFourth${year}`);
      quartersMenu.addSeparator();
      quartersMenu.addItem(`First quarter ${year-1}`, `${menuName}.functionFirst${year-1}`);
      quartersMenu.addItem(`Second quarter ${year-1}`, `${menuName}.functionSecond${year-1}`);
      quartersMenu.addItem(`Third quarter ${year-1}`, `${menuName}.functionThird${year-1}`);
      quartersMenu.addItem(`Fourth quarter ${year-1}`, `${menuName}.functionFourth${year-1}`);
      quartersMenu.addSeparator();
      quartersMenu.addItem(`First quarter ${year-2}`, `${menuName}.functionFirst${year-2}`);
      quartersMenu.addItem(`Second quarter ${year-2}`, `${menuName}.functionSecond${year-2}`);
      quartersMenu.addItem(`Third quarter ${year-2}`, `${menuName}.functionThird${year-2}`);
      quartersMenu.addItem(`Fourth quarter ${year-2}`, `${menuName}.functionFourth${year-2}`);
      const topMenu = ui.createMenu(`Dad's Cookies`);
      topMenu.addSubMenu(locationsMenu);
      topMenu.addSubMenu(quartersMenu);
      topMenu.addToUi();
    }
    this.createActions = () => {
      const actions = {}
      locations.forEach(param => {
        const functionName = `function${param}`
        actions[functionName] = function() {
          setStoreLocation(param)
        }
      })
      actions[`functionCurrent${year}`] = function() {
        setQuarter(`7/01/${year}`);
      }
      actions[`functionFirst${year}`] = function() {
        setQuarter(`1/01/${year}`);
      }
      actions[`functionSecond${year}`] = function() {
        setQuarter(`4/01/${year}`);
      }
      actions[`functionThird${year}`] = function() {
        setQuarter(`7/01/${year}`);
      }
      actions[`functionFourth${year}`] = function() {
        setQuarter(`10/01/${year}`);
      }
      actions[`functionFirst${year-1}`] = function() {
        setQuarter(`1/01/${year-1}`);
      }
      actions[`functionSecond${year-1}`] = function() {
        setQuarter(`4/01/${year-1}`);
      }
      actions[`functionThird${year-1}`] = function() {
        setQuarter(`7/01/${year-1}`);
      }
      actions[`functionFourth${year-1}`] = function() {
        setQuarter(`10/01/${year-1}`);
      }
      actions[`functionFirst${year-2}`] = function() {
        setQuarter(`1/01/${year-2}`);
      }
      actions[`functionSecond${year-2}`] = function() {
        setQuarter(`4/01/${year-2}`);
      }
      actions[`functionThird${year-2}`] = function() {
        setQuarter(`7/01/${year-2}`);
      }
      actions[`functionFourth${year-2}`] = function() {
        setQuarter(`10/01/${year-2}`);
      }
      return actions;
    }

    function buildData() {
      const location = PropertiesService.getScriptProperties().getProperty(lastLocation) ?? 'Fresno';
      const start = PropertiesService.getScriptProperties().getProperty(lastHistoryDate) ?? '1/01/2023';
      const histories = getHistory();
      addHistoryDetail(documentId, histories, location, start);
    }

    function setStoreLocation(param) {
      PropertiesService.getScriptProperties().setProperty(lastLocation, param);
      buildData();
    }

    function setQuarter(param) {
      PropertiesService.getScriptProperties().setProperty(lastHistoryDate, param);
      buildData();
    }
    buildData();
  }
}