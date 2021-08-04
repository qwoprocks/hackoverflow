import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type StoreProfileMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type StoreVoucherMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type UserProfileMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type UserVoucherMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class StoreProfile {
  readonly id: string;
  readonly username: string;
  readonly shopname: string;
  readonly StoreVouchers?: (StoreVoucher | null)[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<StoreProfile, StoreProfileMetaData>);
  static copyOf(source: StoreProfile, mutator: (draft: MutableModel<StoreProfile, StoreProfileMetaData>) => MutableModel<StoreProfile, StoreProfileMetaData> | void): StoreProfile;
}

export declare class StoreVoucher {
  readonly id: string;
  readonly title: string;
  readonly shop: string;
  readonly expiry: string;
  readonly price: number;
  readonly image: string;
  readonly daysvalid: number;
  readonly storeprofileID?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<StoreVoucher, StoreVoucherMetaData>);
  static copyOf(source: StoreVoucher, mutator: (draft: MutableModel<StoreVoucher, StoreVoucherMetaData>) => MutableModel<StoreVoucher, StoreVoucherMetaData> | void): StoreVoucher;
}

export declare class UserProfile {
  readonly id: string;
  readonly username: string;
  readonly UserVouchers?: (UserVoucher | null)[];
  readonly money: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<UserProfile, UserProfileMetaData>);
  static copyOf(source: UserProfile, mutator: (draft: MutableModel<UserProfile, UserProfileMetaData>) => MutableModel<UserProfile, UserProfileMetaData> | void): UserProfile;
}

export declare class UserVoucher {
  readonly id: string;
  readonly Voucher?: StoreVoucher;
  readonly timebought: string;
  readonly timeused?: string;
  readonly used: boolean;
  readonly profileID?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<UserVoucher, UserVoucherMetaData>);
  static copyOf(source: UserVoucher, mutator: (draft: MutableModel<UserVoucher, UserVoucherMetaData>) => MutableModel<UserVoucher, UserVoucherMetaData> | void): UserVoucher;
}