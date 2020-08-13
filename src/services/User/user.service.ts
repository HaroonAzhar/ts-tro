import { injectable } from 'inversify';
import _ from 'lodash';

import { createEverLogger } from '../..//helpers/log';
import { ErrorGenerator } from '../../shared/errors.generator';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ParseError,
} from '../../shared/errors.messages';
import { DatabaseService } from '../database/database.service';
import { servicesContainer } from '../inversify.config';
import { IService } from '../IService';
import { Users } from './model/user.model';
import {
  DeleteUserResponse,
  IUserService,
  UserInputPayload,
  User,
  UserFilter,
  UserResponse,
  UserUpdatePayload,
  UpdateUserResponse,
} from './types/user.types';
import { UserCreateSchema } from './validators/user.create.yup';
import { UserFilterSchema } from './validators/user.filter.yup';
import { UserUpdateSchema } from './validators/user.update.yup';

/**
 * User Service
 * CRUD operation for User
 * @export
 * @class UserService
 * @implements {IUserService}
 * @implements {IService}
 */
@injectable()
export class UserService implements IUserService, IService {
  private logger = createEverLogger({ name: 'UserService' });
  private dbService = servicesContainer.get<DatabaseService>(DatabaseService);
  /**
   * Create a User
   *
   * Returns the newly created user object with id
   *
   * @param {UserInputPayload} payload
   * @returns {Promise<User>}
   * @memberof UserService
   */
  async create(payload: UserInputPayload): Promise<User> {
    let result: User;
    try {
      // Validate the payload
      await UserCreateSchema.validate(payload, {
        abortEarly: false,
      });
      const email = payload.email;

      // Check for existing slug
      const isExist = await this.dbService.findOne<User, UserFilter>({ email });
      if (!_.isNil(isExist)) {
        throw ConflictError(ErrorGenerator.Duplicate('User'));
      }

      // set hashed_password
      let hashed_password = Users.generate_hashed_password(
        payload.raw_password,
      );
      // Make db call
      result = await this.dbService.create<User, Users>(
        new Users({ ...payload, hashed_password }),
      );
      this.logger.debug('User added Successfully', result);
    } catch (e) {
      this.logger.error(e);
      ParseError(e, ErrorGenerator.Duplicate('User'));
    }
    if (!_.isEmpty(result?.id)) {
      return result;
    }
    throw BadRequestError(ErrorGenerator.UnableSave('User'));
  }

  /**
   * Get the subscription plan by id only
   * will return single object
   * @param {SubscriptionPlanFilter} where
   * @returns {Promise<SubscriptionPlan>}
   * @memberof SubscriptionPlanService
   */
  async findOne(where: SubscriptionPlanFilter): Promise<SubscriptionPlan> {
    let edge: SubscriptionPlan;
    try {
      // Validate Input
      await subscriptionPlanFilterSchema.validate(where, {
        abortEarly: false,
      });
      // Get the subscription plan id
      // TODO: Implement other filters
      const id = where?.id;
      if (!_.isNil(id)) {
        // make db call
        edge = await this.dbService.findOne<
          SubscriptionPlan,
          SubscriptionPlanFilter
        >(new SubscriptionPlans({ id }));
      }
    } catch (e) {
      this.logger.error(e);
      ParseError(e, ErrorGenerator.NotFound('Subscription Plan'));
    }
    if (!_.isEmpty(edge)) {
      this.logger.debug('Subscription Plan loaded Successfully', edge);

      return edge;
    }
    throw NotFoundError(ErrorGenerator.NotFound('Subscription Plan'));
  }
  /**
   * Get all the subscriptions plans
   * with pagination
   * @param {SubscriptionPlanFilter} [where]
   * @returns {Promise<SubscriptionPlanResponse>}
   * @memberof SubscriptionPlanService
   */
  async findAll(
    where?: SubscriptionPlanFilter,
  ): Promise<SubscriptionPlanResponse> {
    // Validate the Input

    let edges: SubscriptionPlan[];
    let count: number; // Rows counts
    let recordLimit = 10; // Pagination Limit
    let recordSkip = 0; // Pagination: SKIP

    // TODO
    // Transform from Object to Array
    // { id: SortDirection.ASC } to [ "id", "ASC"]
    // for (const [key, value] of Object.entries(sortBy)) {
    //   sortOrder.push([key, value]);
    // }
    try {
      await subscriptionPlanFilterSchema.validate(where, {
        abortEarly: false,
      });
      if (where) {
        // TODO: Implement other filters
        const { id, limit, skip } = where;
        // isNil check for for null or undefined
        if (!_.isNil(id) && !_.isNil(limit) && !_.isNil(skip)) {
          // Set Limit and Skip for `page_info`
          recordLimit = limit;
          recordSkip = skip;
          // Load the SubscriptionPlan with ID and Pagination
          [edges, count] = await this.dbService.findAll<
            SubscriptionPlan,
            Partial<SubscriptionPlanFilter>
          >(new SubscriptionPlans({ id }), recordLimit, recordSkip);
        } else if (!_.isNil(limit) && !_.isNil(skip)) {
          // Set Limit and Skip for `page_info`
          recordLimit = limit;
          recordSkip = skip;
          // Load All SubscriptionPlan with default pagination
          [edges, count] = await this.dbService.findAll<
            SubscriptionPlan,
            Partial<SubscriptionPlanFilter>
          >(new SubscriptionPlans(), recordLimit, recordSkip);
        } else if (!_.isNil(id)) {
          // Load All SubscriptionPlan with id with default pagination
          [edges, count] = await this.dbService.findAll<
            SubscriptionPlan,
            Partial<SubscriptionPlanFilter>
          >(new SubscriptionPlans({ id }), recordLimit, recordSkip);
        }
      } else {
        // Load All SubscriptionPlan with default pagination
        [edges, count] = await this.dbService.findAll<
          SubscriptionPlan,
          Partial<SubscriptionPlanFilter>
        >(new SubscriptionPlans(), recordLimit, recordSkip);
      }
    } catch (error) {
      this.logger.error(error);
      // Empty
      ParseError(error, ErrorGenerator.NotFound('Subscription Plan'));
    }
    // Validate edges are not empty
    if (!_.isEmpty(edges)) {
      this.logger.debug('Subscription Plan loaded Successfully', edges);

      return {
        edges,
        page_info: {
          total: count,
          limit: recordLimit,
          skip: recordSkip,
          has_more: count > recordLimit + recordSkip ? true : false,
        },
      };
    }
    throw NotFoundError(ErrorGenerator.NotFound('Subscription Plan'));
  }
  count(where?: SubscriptionPlanFilter): Promise<number> {
    throw new Error('Method not implemented.');
  }
  /**
   * Update the subscription plan
   * by id only
   * @param {SubscriptionPlanUpdatePayload} payload
   * @param {SubscriptionPlanFilter} where
   * @returns {Promise<UpdateSubscriptionPlanResponse>}
   * @memberof SubscriptionPlanService
   */
  async update(
    payload: SubscriptionPlanUpdatePayload,
    where: SubscriptionPlanFilter,
  ): Promise<UpdateSubscriptionPlanResponse> {
    let modified: number;
    let edges: SubscriptionPlan[];

    try {
      // Validate the input
      await subscriptionPlanUpdateSchema.validate(
        { ...payload, ...where },
        { abortEarly: false },
      );
      // Check where is defined
      if (where) {
        const { id } = where;
        // Get Subscription plan id
        if (!_.isNil(id)) {
          // Generate the slug
          const slug = payload.name.toLowerCase().replace(' ', '-');
          // Check for existing slug
          const isExist = await this.dbService.findOne<
            SubscriptionPlan,
            SubscriptionPlanFilter
          >({ slug });
          // Validate the ID is not same
          // Return document can have the same ID as of update
          if (!_.isNil(isExist) && isExist?.id != id) {
            throw ConflictError(ErrorGenerator.Duplicate('Subscription Plan'));
          }
          // Make db call
          [edges, modified] = await this.dbService.update<
            SubscriptionPlan,
            Partial<SubscriptionPlan>,
            SubscriptionPlanFilter
          >(
            new SubscriptionPlans({ ...payload, slug }),
            new SubscriptionPlans({ id }),
          );
          this.logger.debug('Subscription Plan Update Successfully', edges);
        }
      }
    } catch (e) {
      this.logger.error(e);
      ParseError(e, ErrorGenerator.Duplicate('Subscription Plan'));
    }
    if (modified > 0) {
      // Return the update data with count
      return { modified, edges };
    }
    throw NotFoundError(ErrorGenerator.NotFound('Subscription Plan'));
  }
  /**
   * Delete the subscription plan
   * by id only
   * @param {SubscriptionPlanFilter} where
   * @returns {Promise<DeleteSubscriptionPlanResponse>}
   * @memberof SubscriptionPlanService
   */
  async delete(
    where: SubscriptionPlanFilter,
  ): Promise<DeleteSubscriptionPlanResponse> {
    let modified: number;
    let edges: SubscriptionPlan[];

    try {
      this.logger.info(where, 'Delete request');
      // Validate the payload
      await subscriptionPlanFilterSchema.validate(where, { abortEarly: false });
      // Check where is defined
      if (where) {
        // Get the subscription plan id
        const { id } = where;
        if (!_.isNil(id)) {
          // Make db call
          [edges, modified] = await this.dbService.delete<
            SubscriptionPlan,
            SubscriptionPlanFilter
          >(new SubscriptionPlans({ id }));
          this.logger.debug('Subscription Plan deleted Successfully', edges);
        }
      }
    } catch (e) {
      this.logger.error(e);
      ParseError(e, ErrorGenerator.UnableToDelete('Subscription Plan'));
    }
    if (modified > 0) {
      return { modified, edges };
    }
    throw NotFoundError(ErrorGenerator.NotFound('Subscription Plan'));
  }
}
