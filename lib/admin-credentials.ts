export const ADMIN_CREDENTIALS = {
  superadmin: {
    email: 'rehamansyed07@gmail.com',
    password: 'Indcric@100',
    displayName: 'Rehaman Syed',
    role: 'superadmin',
    permissions: ['*'],
  },
  subadmins: [
    {
      email: 'rahul@indcric.com',
      password: 'Rahul@123',
      displayName: 'Rahul Kumar',
      role: 'quiz_manager',
      permissions: ['quiz:create', 'quiz:edit', 'quiz:delete'],
    },
    {
      email: 'admin@indcric.com',
      password: 'Admin@123',
      displayName: 'Admin User',
      role: 'submissions_moderator',
      permissions: ['submissions:approve', 'submissions:reject'],
    },
  ],
};