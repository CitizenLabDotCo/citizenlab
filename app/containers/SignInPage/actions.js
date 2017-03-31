/*
 *
 * SignInPage actions
 *
 */

 import {
   AUTHENTICATE_REQUEST,
   AUTHENTICATE_SUCCESS,
   AUTHENTICATE_ERROR,
 } from './constants';

 export function authenticateRequest(credentials) {
   return {
     type: AUTHENTICATE_REQUEST,
     payload: credentials,
   };
 }

 export function authenticateSuccess(response) {
   return {
     type: AUTHENTICATE_SUCCESS,
     payload: response,
   };
 }

 export function authenticateError(error) {
   return {
     type: AUTHENTICATE_ERROR,
     payload: error,
   };
 }
