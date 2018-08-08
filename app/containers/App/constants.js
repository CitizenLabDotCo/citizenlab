export const DEFAULT_LOCALE = 'en';
export const AUTH_PATH = '/auth';
export const API_PATH = '/web_api/v1';
export const GOOGLE_MAPS_API_KEY = '***REMOVED***';
export const CL_GA_TRACKING_ID = 'UA-65562281-44';
export const CL_GA_TRACKER_NAME = 'CitizenLab2';
export const CL_SEGMENT_API_KEY = process.env.SEGMENT_API_KEY || 'sIoYsVoTTCBmrcs7yAz1zRFRGhAofBlg';

export const API_HOST = process.env.API_HOST || (typeof window === "undefined" ? 'localhost' : window.location.hostname);
export const API_PORT = process.env.API_PORT || 4000;
