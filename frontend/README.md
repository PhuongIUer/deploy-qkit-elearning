# QEL - QKIT E-Learning
An E-Learning website help people to upload or buy course.
## Technologies Used

- **Vue.js**: A progressive JavaScript framework used to build user interfaces.
- **Vite**: A fast, opinionated build tool that provides fast development and optimized production builds.
- **TypeScript**: A superset of JavaScript that adds static typing for better tooling and reliability.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version >= 14.x)
- **npm** (comes with Node.js)

## Setup and Installation

### 1. Clone the repository

```bash
git clone <repository-url>
```

### 2. Install dependencies

After cloning the repo, navigate to the project directory and run the following command to install dependencies:

```bash
cd <project-directory>
npm install
```

### 3. Run the Development Server

To start the development server, run:

```bash
npm run dev
```

This will start the Vite development server, and you should see an output with something like:

```bash
  VITE  ready in 300ms
  Local:   http://localhost:3000/
  Network: http://192.168.0.x:3000/
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### 4. Build for Production

To create a production build, run:

```bash
npm run build
```

This will generate an optimized version of your app in the `dist/` folder.

### 5. Preview Production Build

If you want to preview the production build locally, run:

```bash
npm run preview
```

This will serve the optimized build locally for testing.

## Directory Structure

- `src/`: The main source folder for Vue components, assets, and TypeScript files.
- `public/`: Static assets that will be served directly.
- `vite.config.ts`: The configuration file for Vite.
- `tsconfig.json`: The TypeScript configuration file.

## Learn More

- [Vue Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.