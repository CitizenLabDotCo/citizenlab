import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import { IUser } from 'services/users';
import { IHttpMethod } from 'typings.d';
import { API_PATH } from 'containers/App/constants';
import { getJwt, setJwt, removeJwt } from 'utils/auth/jwt';
import request from 'utils/request';
import streams, { IStreamParams } from 'utils/streams';
import { store } from 'app';
import { loadCurrentUserSuccess } from 'utils/auth/actions';
import { mergeJsonApiResources } from 'utils/resources/actions';

export interface IUserToken {
  jwt: string;
}

class Auth {
  private authUser$: Rx.BehaviorSubject<IUser | null>;

  constructor() {
    this.authUser$ = new Rx.BehaviorSubject(null);
  }

  observeAuthUser() {
    return this.authUser$.distinctUntilChanged((x, y) => !_.isEqual(x, y)).publishReplay(1).refCount();
  }

  async signIn(email: string, password: string) {
    const bodyData = {
      auth: { email, password }
    };

    const httpMethod: IHttpMethod = {
      method: 'POST',
    };

    try {
      const { jwt } = await request<IUserToken>(`${API_PATH}/user_token`, bodyData, httpMethod, null);
      setJwt(jwt);
      const authenticatedUser = await this.getAuthUserAsync();
      return authenticatedUser;
    } catch (error) {
      this.signOut();
      throw error;
    }
  }

  async signUp(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    locale: string,
    selectedGender: 'male' | 'female' | 'unspecified' | null = null,
    selectedYearOfBirth: number | null = null,
    selectedAreaId: string | null = null
  ) {
    const bodyData = {
      user: {
        email,
        password,
        locale,
        first_name: firstName,
        last_name: lastName,
        gender: selectedGender,
        birthyear: selectedYearOfBirth,
        domicile: selectedAreaId,
      }
    };

    const httpMethod: IHttpMethod = {
      method: 'POST'
    };

    try {
      await request(`${API_PATH}/users`, bodyData, httpMethod, null);
      const authenticatedUser = await this.signIn(email, password);
      return authenticatedUser;
    } catch (error) {
      throw error;
    }
  }

  signOut() {
    removeJwt();
    this.authUser$.next(null);
  }

  async getAuthUserAsync() {
    const jwt = getJwt();

    if (!_.isString(jwt)) {
      throw new Error('no jwt token set in localstorage');
    } else {
      try {
        const authenticatedUser = await request<IUser>(`${API_PATH}/users/me`, null, null, null);

        if (authenticatedUser && authenticatedUser.data && authenticatedUser.data.id) {
          store.dispatch(mergeJsonApiResources(authenticatedUser));
          store.dispatch(loadCurrentUserSuccess(authenticatedUser));
          this.authUser$.next(authenticatedUser);
          return authenticatedUser;
        } else {
          this.signOut();
          throw new Error('not authenticated');
        }
      } catch {
        this.signOut();
        throw new Error('not authenticated');
      }
    }
  }

  sendPasswordResetMail(email: string) {
    const bodyData = {
      user: {
        email
      }
    };

    const httpMethod: IHttpMethod = {
      method: 'POST'
    };

    return request(`${API_PATH}/users/reset_password_email`, bodyData, httpMethod, null).catch((error) => {
      throw error;
    });
  }
}

const auth = new Auth();
export default auth;
