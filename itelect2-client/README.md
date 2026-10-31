# Taskflow Client

A React task manager built with Vite. It supports account registration and login, task listing, creating and updating tasks, and admin-only deletion.

## Run locally

```sh
npm install
npm run dev
```

By default, the client uses `https://taskmanager-api.onrender.com`. To use a local API instead, copy `.env.example` to `.env` and set `VITE_API_URL=http://localhost:3000`.

The backend must allow the client origin in `CORS_ORIGIN`.

## Build

```sh
npm run build
npm run preview
```

## Deploy

Deploy this directory as a static site. Use `npm install` as the build command and `npm run build` as the publish build; publish the `dist` directory. Set `VITE_API_URL` to the deployed API base URL in the hosting provider's build environment.

Add the deployed client URL here after deployment:

## Live URL

Not deployed yet.
