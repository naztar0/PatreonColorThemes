import {
  sendMessage,
  getThemeName,
  getThemesValues,
  logEventsExt,
  logEvents,
  LogType,
  Theme,
  THEMES,
} from '@/utils.ts';
import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="header">
    <span id="title">${chrome.i18n.getMessage('change_theme')}</span>
  </div>
  <div id="popupContent">
  <div class="group">
    <div class="menuOption">
      <label for="themeSelect"></label>
      <select id="themeSelect">
        ${getThemesValues().map((theme) => (`
          <option value="${theme.value}">${theme.name}</option>
        `)).join('')}
      </select>
    </div>
  </div>
`;

let colorTheme: Theme | null = null;
const defaultTheme = Theme.DARK;

const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
const appRoot = document.getElementById('app') as HTMLDivElement;

const setHeaderTheme = () => {
  appRoot.classList.remove('dark');
  appRoot.classList.remove('light');
  switch (colorTheme) {
    case Theme.LIGHT:
    case Theme.LIGHT_WARM:
      appRoot.classList.add('light');
      break;
    case Theme.DARK:
    case Theme.DARK_DIMMED:
    case Theme.DARK_HIGH_CONTRAST:
    case Theme.DARK_WARM:
    case Theme.DARK_COOL:
      appRoot.classList.add('dark');
      break;
    default:
      appRoot.classList.add('light');
      break;
  }
};

const saveTheme = () => {
  chrome.storage.sync.set({ color_theme: colorTheme }).then();
  sendMessage({ color_theme: colorTheme });
};

chrome.storage.sync.get(['color_theme'], (items) => {
  colorTheme = items.color_theme;
  if (colorTheme === undefined || colorTheme === null || !THEMES.includes(colorTheme)) {
    colorTheme = defaultTheme;
  }
  themeSelect.value = colorTheme.toString();
  setHeaderTheme();
});

themeSelect?.addEventListener('change', (event) => {
  colorTheme = Number((event.target as HTMLSelectElement)?.value) as Theme;
  setHeaderTheme();
  saveTheme();
  logEventsExt([{ name: LogType.THEME_CHANGE, params: { theme: getThemeName(colorTheme) } }]);
});

window.addEventListener('load', () => logEvents([{ name: LogType.PAGE_VIEW, params: { page_title: document.title } }]));
