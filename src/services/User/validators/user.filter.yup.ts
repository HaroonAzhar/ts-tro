import * as yup from 'yup';

import { ErrorGenerator } from '../../../shared/errors.generator';
import { UserFilter, UserSort } from '../types/user.types';

export const UserFilterSchema = yup.object<UserFilter>({
  name: yup.string().min(3, ErrorGenerator.MiniLength<UserFilter>('name', 3)),
  id: yup.string().min(3, ErrorGenerator.MinValue<UserFilter>('id', 3)),
  limit: yup
    .number()
    .max(1000, ErrorGenerator.MaxValue<UserFilter>('id', 1000))
    .min(1, ErrorGenerator.MinValue<UserFilter>('id', 1)),
  skip: yup.number().min(1, ErrorGenerator.MinValue<UserFilter>('id', 1)),
  email: yup.string(),
  sort_by: yup.mixed<UserSort>(),
});
