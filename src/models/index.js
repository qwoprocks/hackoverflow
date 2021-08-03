// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { UserVoucher, StoreVoucher } = initSchema(schema);

export {
  UserVoucher,
  StoreVoucher
};