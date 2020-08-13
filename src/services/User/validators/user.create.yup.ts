/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-invalid-this */
import _ from 'lodash';
import * as yup from 'yup';

import { ErrorGenerator } from '../../../shared/errors.generator';
// import {UserErrorMessage } from '../message/error.message';
import { UserRole, UserInputPayload, UserRoleEnum } from '../types/user.types';

/**
 * Validator for Creating the User
 */
export const UserCreateSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(3, ErrorGenerator.MiniLength<UserInputPayload>('name', 3))
    .max(50, ErrorGenerator.MaxLength<UserInputPayload>('name', 50))
    .required(ErrorGenerator.Required<UserInputPayload>('name')),
  email: yup
    .string()
    .min(10, ErrorGenerator.MiniLength<UserInputPayload>('email', 10))
    .max(50, ErrorGenerator.MaxLength<UserInputPayload>('email', 50))
    .required(ErrorGenerator.Required<UserInputPayload>('email')),
  raw_password: yup
    .string()
    .min(6, ErrorGenerator.MinValue<UserInputPayload>('raw_password', 6))
    .max(20, ErrorGenerator.MaxValue<UserInputPayload>('raw_password', 20))
    .required(ErrorGenerator.Required<UserInputPayload>('raw_password')),
  role: yup.mixed<UserRole>().oneOf(Object.values(UserRoleEnum)),

  date_of_Birth: yup.Date(),
});
