import { User } from '~entities/user.entity';
import { BasePaginationResponse } from './base.response';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class UsersWithPaginationResponse extends BasePaginationResponse(User) {}
