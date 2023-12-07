import {
  getThemesValues,
  getThemeName,
  logEventsInj,
  LogType,
  Theme,
  THEMES,
} from '@/utils.ts';
import themesAsset from '@/assets/json/themes.json';
import stylesAsset from '@/assets/json/styles.json';
import excStylesAsset from '@/assets/json/exception_styles.json';
import themeIcon from '@/assets/icons/theme.svg?raw';
import './inject.css';

let colorTheme: Theme | null = null;
const defaultTheme = Theme.DARK;
const pathExceptions = ['', 'product', 'c', 'explore', 'apps', 'policy', 'pricing'];
const bombingLimit = 20;

const extractStyles = (styles: { [k1: string]: { [k2: string]: string } }) => {
  const styleList: string[] = [];
  Object.entries(styles).forEach(([key, value]) => {
    styleList.push(`${key} { ${
      Object.entries(value).map(([k, v]) => `${k}: ${v} !important;`).join('')
    }}`);
  });
  return styleList;
};

const changeTheme = () => {
  let styles: string[] = [];
  switch (colorTheme) {
    case Theme.LIGHT: styles = themesAsset.lightTheme; break;
    case Theme.LIGHT_WARM: styles = themesAsset.lightWarmTheme; break;
    case Theme.DARK: styles = themesAsset.darkTheme; break;
    case Theme.DARK_DIMMED: styles = themesAsset.darkDimmedTheme; break;
    case Theme.DARK_HIGH_CONTRAST: styles = themesAsset.darkHighContrastTheme; break;
    case Theme.DARK_WARM: styles = themesAsset.darkWarmTheme; break;
    case Theme.DARK_COOL: styles = themesAsset.darkCoolTheme; break;
    default: styles = themesAsset.lightTheme; break;
  }

  const styleList: string[] = [];
  stylesAsset.rootStyleVars.forEach((name, i) => {
    styleList.push(`${name}: ${styles[i]};`);
  });

  const styleElement = document.createElement('style');
  styleElement.innerHTML = `:root { ${styleList.join('')} }`;
  styleElement.innerHTML += `body { ${styleList.join('')} }`;
  document.head.appendChild(styleElement);

  if (pathExceptions.includes(window.location.pathname.split('/')[1])) {
    const exceptionStyleList = extractStyles(excStylesAsset.exceptionStyles);
    const exceptionStyleElement = document.createElement('style');
    exceptionStyleElement.innerHTML = exceptionStyleList.join('');
    document.head.appendChild(exceptionStyleElement);
  } else {
    const additionalStyleList = extractStyles(stylesAsset.additionalStyles);
    const additionalRootStyleList = `:root { ${stylesAsset.exceptionRoot.join('')} }`;
    const additionalStyleElement = document.createElement('style');
    additionalStyleElement.innerHTML = additionalStyleList.join('') + additionalRootStyleList;
    setTimeout(() => document.head.appendChild(additionalStyleElement), 100);
  }
};

const changeThemeAnimated = () => {
  document.body.classList.add('pct-animate');
  setTimeout(() => document.body.classList.remove('pct-animate'), 500);
  changeTheme();
};

const injectUI = () => {
  if (document.getElementById('pct-toggle')) {
    return;
  }
  const toggle = document.createElement('div');
  toggle.id = 'pct-toggle';
  toggle.innerHTML = `
    <button class="pct-btn-round">${themeIcon}</button>
  `;
  const dropdown = document.createElement('div');
  dropdown.classList.add('pct-dropdown-list');
  dropdown.innerHTML = `
    <ul>
      ${getThemesValues().map((theme) => (`
        <li data-theme="${theme.value}">${theme.name}</li>
      `)).join('')}
    </ul>
  `;
  toggle.addEventListener('click', () => {
    dropdown.classList.toggle('show');
    dropdown.style.top = `${toggle.getBoundingClientRect().bottom + 5}px`;
    dropdown.style.left = `${toggle.getBoundingClientRect().left}px`;
  });
  dropdown.querySelectorAll('li').forEach((li) => {
    li.addEventListener('click', () => {
      const theme = li.getAttribute('data-theme');
      if (theme) {
        colorTheme = Number(theme) as Theme;
        changeThemeAnimated();
        chrome.storage.sync.set({ color_theme: colorTheme }).then();
        logEventsInj([{ name: LogType.THEME_CHANGE, params: { theme: getThemeName(colorTheme) } }]);
      }
    });
  });
  const parent = document.querySelector('#main-app-navigation nav > div:first-child');
  if (parent) {
    parent.appendChild(toggle);
    parent.appendChild(dropdown);
  }
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target as Node) && !dropdown.contains(e.target as Node)) {
      dropdown.classList.remove('show');
    }
  });
};

const overrideOverriders = () => {
  stylesAsset.overriders.forEach((selector) => {
    let overriderList: NodeListOf<HTMLElement> | (HTMLElement | null)[];
    if (selector[0] === '@') {
      const [query, parentExc] = selector.slice(1).split('!');
      overriderList = Array.from(document.querySelectorAll(query)).map((e) => {
        let exception = false;
        parentExc?.split(',').forEach((exc) => {
          if (e.parentElement?.matches(exc)) {
            exception = true;
          }
        });
        return exception ? null : e.parentElement;
      });
    } else {
      overriderList = document.querySelectorAll(selector);
    }
    overriderList.forEach((e) => {
      if (e) {
        e.className = '';
      }
    });
  });
};

const setButtonClickListeners = () => {
  document.querySelectorAll('button').forEach((e) => {
    e.addEventListener('click', () => {
      setTimeout(overrideOverriders, 0);
    });
  });
};

if (!pathExceptions.includes(window.location.pathname.split('/')[1])) {
  let bombingCount = 0;
  const bomb = () => {
    overrideOverriders();
    changeTheme();
    injectUI();
    if (bombingCount++ < bombingLimit) {
      setTimeout(bomb, 100);
    }
  };
  setTimeout(bomb, 0);
  setInterval(overrideOverriders, 600);
  setInterval(injectUI, 2000);
  setInterval(setButtonClickListeners, 2000);
  document.addEventListener('click', overrideOverriders);
  document.addEventListener('keydown', overrideOverriders);
}

chrome.storage.sync.get(['color_theme'], (result) => {
  if (result.color_theme !== undefined) {
    colorTheme = THEMES[result.color_theme];
  } else {
    colorTheme = defaultTheme;
  }
  changeTheme();
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.color_theme !== undefined) {
    colorTheme = THEMES[request.color_theme];
    changeThemeAnimated();
  }
});
