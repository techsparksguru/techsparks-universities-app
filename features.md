# FEATURES
 - `IT Admin`: Default top level administrator when application starts
 - `RBAC`:  (Role based Access Control) implemented at university data level i.e. you can choose which universities data can be seen by roles/users. Very useful when you divide India into states and have regional business executives market for each state (In fact it gets better, you can do this at district level too)
 - `Role based Data Access`: Assign State or District regions to users (Users will ONLY see the university records that they have been assigned to)
 - `Map Reduce`: A simple Kanban task board to collaborate and/or monitor the progress of communication with each university (free flow comments) in Kanban style. This is very useful for the sales/ marketing leads to track progress towards conversion (Lets say you are selling your awesome app to a university and you want to be able to review team progress through Agile process regularly and list down action items)  

### Data
- You can add/modify all data that you see under application in admin console under `COLLECTION TYPES` manually. The collection types are self explanatory - Universities, Universitiesaccess, Tasks etc.
- Users can be modified/deleted from `Users` collection type
- Roles and Permissions can be modified under `PLUGINS` menu on the left

### Forgot Password
- Forgot password on login page will trigger an email to reset password. However email integration needs to be enabled first.   

> Steps  

- Navigate to Roles & Permissions page > open Email templates tab
- Click on Edit Reset password > Email address confirmation and update shipper email (Set the email address that is used in your AWS SES Key). Refer to [.env](./backend/.env)

### Role Matrix

| Role                                            | User Management | University Data | Task                        | Profile | Approval             |
| ----------------------------------------------- | --------------- | --------------- | --------------------------- | ------- | -------------------- |
| Admin (Manager/Lead Role)                       | Yes             | Yes (all)       | Yes                         | Yes     | Yes (moving to done) |
| Authenticated (Business Development Executives) | No              | Yes (assigned)  | Yes (until read-for-review) | Yes     | No                   |
| Read-only (Sponsor)                             | No              | Yes (read all)  | No                          | Yes     | No                   |

 # ROADMAP
 - `[TODO]` Option to use Gmaps when showing the Geo region (requires one to input their G credentials)
 - `[TODO]` Add more colleges and institutions in the database
 - `[In Progress]` Expand educational institutions data to rest of the 204 countries in the world (We have ~205 countries and we covered only 1 in this app)
 - `[TODO]`: K8S support - This is for the developer enthusiasts in us. Otherwise the traffic (aka. number of users, number of sessions, and intensity of hitting the webserver) is generally on the lower end for such a product/application, that we don't need to overdo and invest in K8s
 - `[In Progress]` Application support for postgres and testing
 - `[In Progress]` More Unit and E2E tests
 - `[In Progress]` OAuth with Google, Facebook, Linkedin, Github
 - `[In Progress]` Captcha verification