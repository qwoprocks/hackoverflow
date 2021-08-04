import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class StoreProfile {
  readonly id: string;
  readonly username: string;
  readonly shopname: string;
  readonly StoreVouchers?: (StoreVoucher | null)[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<StoreProfile>);
  static copyOf(source: StoreProfile, mutator: (draft: MutableModel<StoreProfile>) => MutableModel<StoreProfile> | void): StoreProfile;
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
  constructor(init: ModelInit<StoreVoucher>);
  static copyOf(source: StoreVoucher, mutator: (draft: MutableModel<StoreVoucher>) => MutableModel<StoreVoucher> | void): StoreVoucher;
}

export declare class UserProfile {
  readonly id: string;
  readonly username: string;
  readonly UserVouchers?: (UserVoucher | null)[];
  readonly money: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<UserProfile>);
  static copyOf(source: UserProfile, mutator: (draft: MutableModel<UserProfile>) => MutableModel<UserProfile> | void): UserProfile;
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
  constructor(init: ModelInit<UserVoucher>);
  static copyOf(source: UserVoucher, mutator: (draft: MutableModel<UserVoucher>) => MutableModel<UserVoucher> | void): UserVoucher;
}