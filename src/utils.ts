import {
  DEBUG,
  GA_API_SECRET,
  GA_ENDPOINT,
  GA_ENDPOINT_DEBUG,
  GA_MEASUREMENT_ID,
} from '@/config.ts';

export enum Theme {
  LIGHT,
  LIGHT_WARM,
  DARK,
  DARK_DIMMED,
  DARK_HIGH_CONTRAST,
  DARK_WARM,
  DARK_COOL,
}

export enum SourceType {
  EXTENSION = 'extension',
  INJECTION = 'injection',
}

export enum LogType {
  THEME_CHANGE = 'theme_change',
  PAGE_VIEW = 'page_view',
}

type Event = { name: LogType, params: Params };
type Params = { [p: string]: string | number | null };

export const THEMES = [
  Theme.LIGHT,
  Theme.LIGHT_WARM,
  Theme.DARK,
  Theme.DARK_DIMMED,
  Theme.DARK_HIGH_CONTRAST,
  Theme.DARK_WARM,
  Theme.DARK_COOL,
];

const SESSION_EXPIRATION_IN_MIN = 30;
const DEFAULT_ENGAGEMENT_TIME_IN_MSEC = 100;

const getOrCreateSessionId = async () => {
  let { sessionData } = await chrome.storage.local.get('sessionData');
  const currentTimeInMs = Date.now();
  if (sessionData && sessionData.timestamp) {
    const durationInMin = (currentTimeInMs - sessionData.timestamp) / 60000;
    if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
      sessionData = null;
    } else {
      sessionData.timestamp = currentTimeInMs;
      await chrome.storage.local.set({ sessionData });
    }
  }
  if (!sessionData) {
    sessionData = {
      session_id: currentTimeInMs.toString(),
      timestamp: currentTimeInMs.toString(),
    };
    await chrome.storage.local.set({ sessionData });
  }
  return sessionData.session_id;
};

const getOrCreateClientId = async () => {
  const result = await chrome.storage.local.get('clientId');
  let { clientId } = result;
  if (!clientId) {
    clientId = window.crypto.randomUUID();
    await chrome.storage.local.set({ clientId });
  }
  return clientId;
};

const sendAnalytics = async (events: Event[]) => {
  const endpoint = DEBUG ? GA_ENDPOINT_DEBUG : GA_ENDPOINT;
  const sessionId = await getOrCreateSessionId();

  return fetch(`${endpoint}?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`, {
    method: 'POST',
    body: JSON.stringify({
      client_id: await getOrCreateClientId(),
      events: events.map((e) => (
        {
          name: e.name,
          params: {
            ...e.params,
            session_id: sessionId,
            engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
          },
        }
      )),
    }),
  });
};

export const logEvents = (events: Event[]) => {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log('Sending analytics event:', events);
  }
  sendAnalytics(events)
    .then((response) => {
      if (DEBUG) {
        // eslint-disable-next-line no-console
        response.json().then((json) => console.log('Analytics response:', json));
      }
    })
    .catch((error) => {
      if (DEBUG) {
        // eslint-disable-next-line no-console
        console.log('Error sending analytics:', error);
      }
    });
};

export const logEventsExt = (events: Event[]) => {
  events = events.map((e) => ({ name: e.name, params: { ...e.params, source: SourceType.EXTENSION } }));
  logEvents(events);
};

export const logEventsInj = (events: Event[]) => {
  events = events.map((e) => ({ name: e.name, params: { ...e.params, source: SourceType.INJECTION } }));
  logEvents(events);
};

export const sendMessage = (data: { [key: string]: any }) => {
  chrome.tabs.query({ currentWindow: true, active: true }, (result) => {
    const activeTab = result[0];
    if (activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, data).then();
    }
  });
};

export const getThemeName = (theme: Theme) => {
  const names = ['light', 'light_warm', 'dark', 'dark_dimmed', 'dark_high_contrast', 'dark_warm', 'dark_cool'];
  return chrome.i18n.getMessage(`theme_${names[theme]}`);
};

export const getThemesValues = () => THEMES.map((theme) => ({ value: theme, name: getThemeName(theme) }));
