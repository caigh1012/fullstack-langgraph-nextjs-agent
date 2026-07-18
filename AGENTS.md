<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

The fullstack-langgraph-nextjs-agent is a Next.js project that integrates with Langgraph to enable natural language processing and interaction.

## Role

You are a seasoned React + TypeScript technical expert with deep knowledge of Next.js.

## Scope

This repository is a **Next.js@16.2.10 + TypeScript@5 + tailwindcss@4** starter app.

- It uses the Next.js App Router pattern.
- It uses Prisma Client to interact with the PostgreSQL database.
- It uses tailwindcss to build CSS styles.
- It uses shadcn + radix-ui to build UI components.
- It uses lucide-react to build icons.
- It uses langgraph to build the AI agent.
- It uses prettier to format the project, the rules are referenced in the .prettierrc.json file in the root directory.
- It uses eslint to lint the project, the rules are referenced in the .eslintrc.json file in the root directory.
- It uses lint-staged to lint the staged files (i.e., the files that are staged for commit), the rules are referenced in the `lint-staged` section of `package.json` in the root directory.
- It uses commitlint to lint the commit messages, the rules are referenced in the .commitlintrc.mjs file in the root directory.

## Development Commands

Only the `pnpm` command can be used.
Do not use any other package manager.

- `pnpm install` to install dependencies.
- `pnpm dev` to start the development server.
- `pnpm build` to build the project.
- `pnpm start` to start the project.
- `pnpm lint` to lint the project.
- `pnpm lint-staged` to lint the staged files.
- `pnpm format` to format the project.

## Project Structure

```text
fullstack-langgraph-nextjs-agent/
├── docs/  # The project documentation.
├── generated/  # The Prisma generated and client files.
├── prisma/  # The Prisma files.
├── public/  # The static files.
├── src/  # The source code files.
│   ├── app/  # The Next.js App Router files.
│   │   ├── favicon.ico # The favicon file.
│   │   ├── globals.css # The global CSS file.
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/  # The UI components files.
│   │   └── ui/  # The Shadcn + Radix-ui components files.
│   │       └── button.tsx
│   ├── constants/  # The constants directory, used to store fixed values ​​and enumerations, etc..
│   ├── contexts/  # The contexts directory, used to store the context providers.
│   ├── hooks/  # The hooks directory, used to store custom hooks.
│   └── lib/  # The library directory.
│       ├── database/  # The database directory.
│       │   └── prisma.ts  # The Prisma Client file.
│       └── utils.ts  # The utility files, store only shadcn/ui or third-party tools that automatically import utilities, such as shadcn/ui.
│       ├── services/  # The services directory, used to store methods that call the database (Prisma Client, etc.).
│       ├── types/  # The TypeScript type directory, used to store definitions of TypeScript types.
├── .commitlintrc.mjs  # The commitlint configuration file.
├── .prettierrc.json  # The prettier configuration file.
├── eslint.config.mjs  # The eslint configuration file.
├── package.json  # The project configuration file.
├── postcss.config.mjs  # The postcss configuration file.
├── prisma.config.ts  # The Prisma configuration file.
└── tsconfig.json  # The TypeScript configuration file.
├── next.config.ts  # The Next.js configuration file.
```

## Code Style

**General Rules**

- Never install dependencies in the node_modules/ directory
- Never modify the lock file.
- Never use any third-party libraries that are not in the `package.json` file.
- Never optimize the existing code.

**Next.js Rules**

- Use an interface to define the Props type.
- Use `React.FC <Props>` or function declarations.
- Use `clsx` to conditionally apply classes.
- Use `tailwindcss` to build CSS styles.
- Use the hooks from the react-use library as much as possible. Custom hooks can be created if the requirements cannot be met.
- Use `zod` to validate data types.
- The client-side component form should use `react-hook-form` and be accompanied by zod for type checking.
- Preferred choice is the `shadcn + radix-ui` component; if this does not meet the requirements, a custom component can be created.
- Never use any type within a component.
- Never omit the key in list rendering.
- Never use inline styles.

**tailwindcss**

- Never modify global.css file.
- Never hard-code color values.
- Never adding custom CSS.

## UI Components

Use **shadcn + radix-ui** (`shadcn + radix-ui`) as the primary component library.

- Prefer named imports
- Do not introduce other component libraries

## Icons

Use **lucide-react** (`lucide-react`) for all icons.

- Prefer named imports
- Do not introduce other icon libraries

## Security

- Never hard-code sensitive information

## Commits

- Follow the commitlint rules.
- Use the commitlint configuration file in the root directory.
