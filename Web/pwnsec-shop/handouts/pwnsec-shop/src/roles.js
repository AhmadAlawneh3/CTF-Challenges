const AccessControl = require('accesscontrol');

const grants = {
  admin: {
    product: {
      'create:any': ['*'],
      'read:any': ['*'],
      'update:any': ['*'],
      'delete:any': ['*'],
    },
    order: {
      'create:any': ['*'],
      'read:any': ['*'],
      'update:any': ['*'],
      'delete:any': ['*'],
    },
    user: {
      'create:any': ['*'],
      'read:any': ['*'],
      'update:any': ['*'], 
      'delete:any': ['*'],
    },
    productRequest: {
      'create:any': ['*'],
      'read:any': ['*'],
      'update:any': ['*'],
      'delete:any': ['*'],
    },
  },
  vendor: {
    product: {
      'create:own': ['*'], 
      'read:any': ['*'],
      'update:own': ['*'],
      'delete:own': ['*'],
    },
    order: {
      'create:own': ['*'], 
      'read:own': ['*'],
      'update:own': ['*'],
    },
    user: {
      'read:own': ['*'], 
      'update:own': ['*'] 
    },
    productRequest: {
      'create:own': ['*'],
      'read:own': ['*'],
      'update:own': ['*'],
      'delete:own': ['*'],
    },
  },
  customer: {
    product: {
      'read:any': ['*'], 
    },
    order: {
      'create:own': ['*'], 
      'read:own': ['*'], 
      'update:own': ['*'], 
    },
    user: {
      'read:own': ['*'],
    },
  },
  guest: {
    product: {
      'read:any': ['*'], 
    },
  },
};

const ac = new AccessControl(grants);
module.exports = ac;