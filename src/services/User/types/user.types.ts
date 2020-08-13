import {
  IChangeResponseInfo,
  IPagination,
  IResponseInfo,
} from '../../../shared/interfaces/common.interfaces';
import { SortProperties } from '../../../shared/types/sort.types';
import { IBaseService } from '../../base/base.service';
import { IUser } from '../interfaces/user.interface';

// description for user
export type User = IUser;

export type UserKeys = keyof IUser;

export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  SUBSCRIBER = 'USER',
}

export type UserRole = keyof typeof UserRoleEnum;
// Type for creating User
export type UserInputPayload = Required<
  Pick<User, 'name' | 'email' | 'phone_number' | 'role'>
> &
  Pick<User, 'date_of_birth'> & { raw_password: string };

// Type of User Properties used for sorting id | price
type UserSortKeys = Extract<keyof Pick<User, 'id' | 'name'>, string>;

// Transform the property type to SortDirection
// {id: "ASC" | "DESC"}
export type UserSort = SortProperties<UserSortKeys>;

// Type for getting User
export type UserFilter = Partial<
  Pick<User, 'id' | 'name' | 'email'> &
    Pick<IPagination, 'limit' | 'skip'> & { sort_by: UserSort }
>;

// Type for Updating User
export type UserUpdatePayload = Partial<UserInputPayload>;

export type UserResponse = IResponseInfo<User>;
export type DeleteUserResponse = IChangeResponseInfo<User>;
export type UpdateUserResponse = IChangeResponseInfo<User>;

/**
 * Interface for User Service
 * CRUD operation
 *
 * @export
 * @interface IUser
 */
export type IUserService = IBaseService<
  User,
  UserInputPayload,
  UserFilter,
  UserUpdatePayload
>;
