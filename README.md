# 🚗 Hono Cars API

A blazing fast REST API built with Hono for managing a collection of cars, powered by Google Firestore.

## ✨ Features

- **Fast & Lightweight:** Built on top of [Hono](https://hono.dev/), a small, simple, and ultrafast web framework for the Edge.
- **Type-Safe:** End-to-end type safety with [Zod](https://zod.dev/) for validation.
- **Persistent Storage:** Uses [Google Firestore](https://firebase.google.com/docs/firestore) for data storage.
- **Ready to Run:** Simple setup and deployment.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.14.1 or higher)
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) and a configured Firestore database.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/hono-cars-api.git
    cd hono-cars-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Development Server

To start the development server with hot-reloading, run:

```bash
npm run dev
```

The API will be available at `http://localhost:8080`.

## ☁️ Deploying to Google Cloud Run

This application is ready for Dockerfile-less deployment to Google Cloud Run.

### Prerequisites

1.  [Install and initialize the Google Cloud SDK](https://cloud.google.com/sdk/docs/install).
2.  Create a Google Cloud project and enable billing.
3.  Enable the Cloud Build and Cloud Run APIs.

### Deployment Command

Set your desired Google Cloud region or use the default:

```bash
export REGION=${REGION:-us-central1}
```

Deploy the application using the `gcloud` CLI from the root of the project directory:

```bash
gcloud run deploy hono-cars-api --source . --region $REGION --allow-unauthenticated --labels=dev-tutorial=sample-hono
```

The `--source .` flag tells Cloud Build to use [Google Cloud Buildpacks](https://cloud.google.com/docs/buildpacks/overview) to automatically build and containerize the application.

## 🛠️ Scripts

- `npm run dev`: Start the development server with `tsx`.
- `npm run build`: Compile the TypeScript code to JavaScript.
- `npm run start`: Start the production server.

## ⚙️ Tech Stack

- [Hono](https://hono.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Zod](https://zod.dev/)
- [Google Cloud Firestore](https://firebase.google.com/docs/firestore)
- [@hono/node-server](https://hono.dev/guides/node-js)

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.