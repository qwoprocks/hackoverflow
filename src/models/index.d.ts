import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class UserVoucher {
  readonly id: string;
  readonly Voucher?: StoreVoucher;
  readonly timebought: string;
  readonly timeused?: string;
  readonly used: boolean;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<UserVoucher>);
  static copyOf(source: UserVoucher, mutator: (draft: MutableModel<UserVoucher>) => MutableModel<UserVoucher> | void): UserVoucher;
}

export declare class StoreVoucher {
  readonly id: string;
  readonly title: string;
  readonly shop: string;
  readonly expiry: string;
  readonly price: number;
  readonly image: string;
  readonly daysvalid: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<StoreVoucher>);
  static copyOf(source: StoreVoucher, mutator: (draft: MutableModel<StoreVoucher>) => MutableModel<StoreVoucher> | void): StoreVoucher;
}