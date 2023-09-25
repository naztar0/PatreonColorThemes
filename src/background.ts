import themesAsset from '@/assets/json/themes.json';
import stylesAsset from '@/assets/json/styles.json';
import excStylesAsset from '@/assets/json/exception_styles.json';

let colorTheme: string | null = null;
const defaultTheme = 'dark';
const pathExceptions = ['product', 'c', 'explore', 'apps', 'policy', 'pricing'];

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
    case 'light': styles = themesAsset.lightTheme; break;
    case 'lightWarm': styles = themesAsset.lightWarmTheme; break;
    case 'dark': styles = themesAsset.darkTheme; break;
    case 'darkDimmed': styles = themesAsset.darkDimmedTheme; break;
    case 'darkHighContrast': styles = themesAsset.darkHighContrastTheme; break;
    case 'darkWarm': styles = themesAsset.darkWarmTheme; break;
    case 'darkCool': styles = themesAsset.darkCoolTheme; break;
    default: styles = themesAsset.lightTheme; break;
  }

  const styleList: string[] = [];
  stylesAsset.rootStyleVars.forEach((name, i) => {
    styleList.push(`${name}: ${styles[i]};`);
  });

  const styleElement = document.createElement('style');
  styleElement.innerHTML = `:root { ${styleList.join('')} }`;
  document.head.appendChild(styleElement);

  // eslint-disable-next-line no-restricted-globals
  if (pathExceptions.includes(location.pathname.split('/')[1])) {
    const exceptionStyleList = extractStyles(excStylesAsset.exceptionStyles);
    const exceptionRootStyleList = `:root { ${excStylesAsset.exceptionRoot.join('')} }`;
    const exceptionStyleElement = document.createElement('style');
    exceptionStyleElement.innerHTML = exceptionStyleList.join('') + exceptionRootStyleList;
    document.head.appendChild(exceptionStyleElement);
  } else {
    const additionalStyleList = extractStyles(stylesAsset.additionalStyles);
    const additionalStyleElement = document.createElement('style');
    additionalStyleElement.innerHTML = additionalStyleList.join('');
    setTimeout(() => document.head.appendChild(additionalStyleElement), 100);
  }
};

chrome.storage.sync.get(['color_theme'], (result) => {
  if (result.color_theme) {
    colorTheme = result.color_theme;
  } else {
    colorTheme = defaultTheme;
  }
  changeTheme();
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.color_theme) {
    colorTheme = request.color_theme;
    changeTheme();
  }
});
