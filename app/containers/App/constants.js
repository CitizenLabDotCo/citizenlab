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

export const DEFAULT_LOCALE = 'en';
export const AUTH_PATH = '/auth';
export const API_PATH = '/web_api/v1';
export const GOOGLE_MAPS_API_KEY = '***REMOVED***';

export const LOADED_CURRENT_TENANT = 'app/App/LOADED_CURRENT_TENANT';
export const LOAD_CURRENT_USER = 'app/App/LOAD_CURRENT_USER';
export const CL_GA_TRACKING_ID = 'UA-65562281-44';
export const CL_GA_TRACKER_NAME = 'CitizenLab2';
export const CL_SEGMENT_API_KEY = process.env.SEGMENT_API_KEY || 'sIoYsVoTTCBmrcs7yAz1zRFRGhAofBlg';
