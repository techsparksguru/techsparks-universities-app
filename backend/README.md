# Strapi application
Universities api
# Install required dependencies
`npm install`
# Update Db config as needed
By default sqlite db is used
To change to postgress update `config/database.js` with following parameters
```
module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'postgres',
        host: env('DATABASE_HOST'),
        port: env.int('DATABASE_PORT'),
        database: env('DATABASE_NAME'),
        username: env('DATABASE_USERNAME'),
        password: env('DATABASE_PASSWORD'),
        ssl: env.bool('DATABASE_SSL'),
      },
      options: {}
    },
  },
});
```
# Env
Update [.env](./.env) with keys accordingly
# Run strapi in development mode
`npm run develop`
# Run strapi in production mode
`NODE_ENV=production npm run build`
`NODE_ENV=production npm run start`
### Using pm2
`npm install pm2 -g`
- start
`ENV_PATH=/absolute/path/to/.env pm2 start npm --name universities-app -- run start`
- stop
`pm2 stop universities-app && pm2 delete universities-app`
# Once the Server is up
### Load Universties
- Place universities.json file in `./data` folder
- run `node import_universities`
### Add Admin role
- navigate to http://localhost:1337/admin/plugins/users-permissions/roles

  Click _Add New role_ - Admin give select all permissions (All application's and plugins) and save

### Add Readonly role
- Navigate to http://localhost:1337/admin/plugins/users-permissions/roles

- Click _Add New role_ - Name: Readonly

- Give following permissions:
  - Messages - count,find,findone
  - Tasks - count,find,findone
  - Universities - count,find,findone,stats,status
  - Universitiesaccess - count,find,findone
  - USERS-PERMISSIONS

    - Userspermissions - getrole,getroles,searchusers

    - User -count,find,findone,update,me,updateme

### Edit Authenticated role
- Navigate to http://localhost:1337/admin/plugins/users-permissions/roles

- Edit _Authenticated role_ - 

- Give following permissions:

  - Messages - count,create,delete,find,findone,update
  - Tasks - count,find,findone,update
  - Upload - upload
  - USERS-PERMISSIONS — 

    - Auth - connect

    - User - me,updateme

### Edit Public role
- Navigate to http://localhost:1337/admin/plugins/users-permissions/roles

- Edit _Public role_ - 

- Give following permissions:

  - USERS-PERMISSIONS — 

    - Auth - callback,connect,emailconfirmation,forgotpassword,register,resetpassword,sendemailconfirmation

    - User - me
    
### Change shipper email
- Navigate to Roles & Permissions page > open Email templates tab
- Click on Edit Reset password > Email address confirmation and update shipper email (Set the email address that is used in your AWS SES Key). Refer to [.env](./.env) - This is required if you expect to use `Forgot Password` functionality on login page

### Add Admin
- Add a new user and give admin role
## Frontend deployment
- Navigate to frontend repo and complete deployment
## Load users
- navigate to http://localhost:8083/, and Login with admin creds created above
- Add a new user and give authenticated role
- These users can only view tasks page and manage tasks assigned to them
## Load Readonly users
- navigate to http://localhost:8083/, and Login with admin creds created above
- Add a new user and give Readonly role
- These users only have read access on all resources
## Load tasks
- Navigate to http://localhost:8083/, and Login with admin creds
- goto Users and assign universities to users
- In approvals page admin can review _ready to review tasks_ and change them to _Done_
