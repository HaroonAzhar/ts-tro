import { UserRole } from '../types/user.types';
/**
 * User Model
 * End-user of our service
 * Define its information & fields of users
 *
 * #TODO: 1:
 *        2:
 *        3:
 * @export
 * @interface IUser
 */
export interface IUser {
  id: string;

  /**
   * Store the Name of User
   *
   * @type {string}
   * @memberof IUser
   */
  name: string;
  /**
   * Store the Email of User
   *
   * @type {string}
   * @memberof IUser
   */
  email: string;

  /**
   * Store the  Phone/Contact Number
   *
   * @type {string}
   * @memberof IUser
   */
  phone_number: number;

  /**
   * Stores Date of Birth of User
   *
   * @type {string}
   * @memberof IUser
   */
  date_of_birth: Date;

  /**
   *  Encrypts passowrd of user
   *
   * @type {function}
   * @memberof IUser
   */
  generate_hashed_password: (raw_password: string) => string;

  /**
   *  return decrypted passowrd of user, for the passed hashed_password
   *
   * @type {function}
   * @memberof IUser
   */
  password: (hashed_password: string) => string;

  // /**
  //  * holds passowrd of user for InputUserType
  //  *
  //  * @type {string}
  //  * @memberof IUser
  //  */
  // raw_password: string;

  /**
   *
   * Stores Enrypted passowrd of user
   * @type {string}
   * @memberof IUser
   *
   *
   */
  hashed_password: string;

  /**
   *
   * Stores Role of the  user
   * The  role should  be one  'ADMIN' | 'USER'
   * @type {UserRole}
   * @memberof IUser
   *
   *
   */
  role: UserRole;
}
