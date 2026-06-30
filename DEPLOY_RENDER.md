# Render Deployment

## 1. Push latest code

```bash
git add .
git commit -m "Add Render deployment config"
git push origin main
```

## 2. Create MongoDB Atlas database

Render filesystem is not permanent, so use MongoDB Atlas for live saved data.

Create a free Atlas cluster and copy the connection string:

```text
mongodb+srv://USERNAME:PASSWORD@cluster-name.mongodb.net/refund-portal?retryWrites=true&w=majority
```

In Atlas Network Access, allow Render by adding:

```text
0.0.0.0/0
```

## 3. Deploy on Render

1. Open Render Dashboard.
2. New + > Web Service.
3. Connect GitHub repo:

```text
https://github.com/prateeksharma4919l/refund-portal
```

4. Select branch:

```text
main
```

5. Render should detect `render.yaml`. If manual setup is needed:

Build Command:

```bash
npm run build
```

Start Command:

```bash
npm run start
```

## 4. Environment variables

Set these in Render:

```text
NODE_ENV=production
PORT=10000
CLIENT_ORIGIN=https://YOUR-RENDER-APP.onrender.com
MONGO_URI=your MongoDB Atlas connection string
JWT_SECRET=use a long random secret
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_USERNAME=prateeksharma4919l
ADMIN_PASSWORD=1234
```

After deploy, open:

```text
https://YOUR-RENDER-APP.onrender.com/#verify
https://YOUR-RENDER-APP.onrender.com/#refund
https://YOUR-RENDER-APP.onrender.com/#history
https://YOUR-RENDER-APP.onrender.com/#admin
```

Admin login:

```text
Username: prateeksharma4919l
Password: 1234
```
