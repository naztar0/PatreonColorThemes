import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="header">
    <span id="title">Change the color theme</span>
  </div>
  <div id="popupContent">
  <div class="group">
    <div class="menuOption">
      <label for="themeSelect"></label>
      <select id="themeSelect">
        <option value="light">Light</option>
        <option value="lightWarm">Light Warm</option>
        <option value="dark">Dark</option>
        <option value="darkDimmed">Dark Dimmed</option>
        <option value="darkHighContrast">Dark High Contrast</option>
        <option value="darkWarm">Dark Warm</option>
        <option value="darkCool">Dark Cool</option>
      </select>
    </div>
  </div>
`;

let colorTheme: string | null = null;
const defaultTheme = 'dark';

const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
const appRoot = document.getElementById('app') as HTMLDivElement;

const setHeaderTheme = () => {
  appRoot.classList.remove('dark');
  appRoot.classList.remove('light');
  switch (colorTheme) {
    case 'light':
    case 'lightWarm':
      appRoot.classList.add('light');
      break;
    case 'dark':
    case 'darkDimmed':
    case 'darkHighContrast':
    case 'darkWarm':
    case 'darkCool':
      appRoot.classList.add('dark');
      break;
    default:
      appRoot.classList.add('light');
      break;
  }
};

const sendMessage = (data: { [key: string]: string | null }) => {
  chrome.tabs.query({ currentWindow: true, active: true }, (result) => {
    const activeTab = result[0];
    if (activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, data).then();
    }
  });
};

const saveData = (data: { [p: string]: string | null }) => {
  chrome.storage.sync.set(data, () => {});
};

const saveTheme = () => {
  saveData({ color_theme: colorTheme });
  sendMessage({ color_theme: colorTheme });
};

themeSelect?.addEventListener('change', (event) => {
  colorTheme = (event.target as HTMLSelectElement)?.value;
  setHeaderTheme();
  saveTheme();
});

chrome.storage.sync.get(['color_theme'], (items) => {
  colorTheme = items.color_theme;
  if (!colorTheme) {
    colorTheme = defaultTheme;
  }
  themeSelect.value = colorTheme;
  setHeaderTheme();
});
