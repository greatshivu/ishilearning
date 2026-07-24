# Repository Guidelines

## Project Structure & Module Organization
This is a full-stack application consisting of a .NET backend and a React frontend, along with utility projects.

- **`.\backend\`**: ASP.NET Core Web API (.NET 9.0).
  - **`Controllers\`**: Handles HTTP requests and routes.
  - **`Services\`**: Contains business logic, including integrations like Brevo (Email), Chatbot, and Cloudflare Turnstile.
  - **`Data\`**: Entity Framework Core DbContext and migrations.
  - **`Models\` & `DTOs\`**: Data structures for database and API communication.
- **`.\frontend\`**: React 19 application built with Vite and TypeScript.
  - **`src\pages\`**: Main view components.
  - **`src\components\`**: Reusable UI elements.
  - **`src\context\`**: React Context for state management (e.g., Auth).
  - **`src\services\`**: API client and utility hooks.
- **`.\Encryptor\`**: A .NET utility project likely used for managing encrypted configuration files.

## Build, Test, and Development Commands

### Frontend (`.\frontend`)
- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview build**: `npm run preview`

### Backend (`.\backend`)
- **Build project**: `dotnet build`
- **Run project**: `dotnet run`
- **Watch for changes**: `dotnet watch`

## Coding Style & Naming Conventions
- **Backend**: Uses C# 13 with `Nullable` and `ImplicitUsings` enabled. Follows standard PascalCase naming for classes and methods.
- **Frontend**: Uses TypeScript with React 19. ESLint is configured for code quality. Follows PascalCase for components and camelCase for functions and variables.
- **CSS**: Styled with Tailwind CSS 4.

## Commit & Pull Request Guidelines
- Commit messages should be short and descriptive (e.g., `SSO Implementation`, `Add Cloudflare Workers configuration`).
- Ensure `npm run lint` passes before committing frontend changes.
