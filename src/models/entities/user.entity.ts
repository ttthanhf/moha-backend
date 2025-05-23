import {
	AfterCreate,
	BeforeCreate,
	BeforeUpdate,
	Collection,
	Entity,
	Enum,
	EventArgs,
	OneToMany,
	Property
} from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { Role } from '~constants/role.constant';
import { UserStatus } from '~constants/status.constant';
import { CryptoUtil } from '~utils/crypto.util';
import logger from '~utils/logger.util';
import { BaseEntity } from './base.entity';
import { Order } from './order.entity';

@ObjectType()
@Entity()
export class User extends BaseEntity {
	@Field()
	@Property()
	fullName!: string;

	@Field({ nullable: true })
	@Property({
		nullable: true
	})
	phone!: string;

	@Field()
	@Property()
	email!: string;

	@Property({ nullable: true })
	password!: string;

	@Field(() => Role)
	@Enum(() => Role)
	role: Role = Role.CUSTOMER;

	@Field(() => UserStatus)
	@Enum(() => UserStatus)
	status: UserStatus = UserStatus.ACTIVE;

	@Field()
	@Property()
	isVerified: boolean = false;

	@Field()
	@Property()
	isPremium: boolean = false;

	@Field({ nullable: true })
	@Property({ nullable: true })
	premiumExpireAt!: Date;

	@Field(() => [Order])
	@OneToMany(() => Order, (order) => order.user)
	orders = new Collection<Order>(this);

	@BeforeCreate()
	async encryptPassword() {
		if (this.password) {
			this.password = await CryptoUtil.encryptPassword(this.password);
		}
	}

	@AfterCreate()
	async log() {
		logger.info('Create new user');
	}

	@BeforeUpdate()
	async encryptPasswordUpdate(args: EventArgs<this>) {
		if (args.changeSet?.payload.password) {
			this.password = await CryptoUtil.encryptPassword(
				args.changeSet.payload.password
			);
		}
	}
}
