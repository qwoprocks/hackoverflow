// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { GiftVoucher, StoreProfile, StoreVoucher, UserProfile, UserVoucher } = initSchema(schema);

export {
  GiftVoucher,
  StoreProfile,
  StoreVoucher,
  UserProfile,
  UserVoucher
};