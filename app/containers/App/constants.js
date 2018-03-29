/*
 * AppConstants
 * Each action has a corresponding type, which the reducer knows and picks up on.
 * To avoid weird typos between the reducer and the actions, we save them as
 * constants here. We prefix them with 'yourproject/YourComponent' so we avoid
 * reducers accidentally picking up actions they shouldn't.
 *
 * Follow this format:
 * export const YOUR_ACTION_CONSTANT = 'yourproject/YourContainer/YOUR_ACTION_CONSTANT';
 */

const API_HOST = process.env.API_HOST || (typeof window === "undefined" ? '' : window.location.hostname);
const API_PORT = process.env.API_PORT || 4000;
const API_PROTOCOL = process.env.API_PROTOCOL || 'http';

export const DEFAULT_LOCALE = 'en';
export const AUTH_PATH = (process.env.NODE_ENV === 'development') ? `${API_PROTOCOL}://${API_HOST}:${API_PORT}/auth` : '/auth';
export const API_PATH = (process.env.NODE_ENV === 'development') ? `${API_PROTOCOL}://${API_HOST}:${API_PORT}/web_api/v1` : '/web_api/v1';
export const GOOGLE_MAPS_API_KEY = 'AIzaSyDRtFe1KRBnGfDy_ijw6yCYsYnEkQRl9Cw';

export const LOADED_CURRENT_TENANT = 'app/App/LOADED_CURRENT_TENANT';
export const LOAD_CURRENT_USER = 'app/App/LOAD_CURRENT_USER';
export const CL_GA_TRACKING_ID = 'UA-65562281-44';
export const CL_GA_TRACKER_NAME = 'CitizenLab2';
export const CL_SEGMENT_API_KEY = process.env.SEGMENT_API_KEY || 'sIoYsVoTTCBmrcs7yAz1zRFRGhAofBlg';
