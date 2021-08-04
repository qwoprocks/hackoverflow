// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { StoreProfile, StoreVoucher, UserProfile, UserVoucher } = initSchema(schema);

export {
  StoreProfile,
  StoreVoucher,
  UserProfile,
  UserVoucher
};