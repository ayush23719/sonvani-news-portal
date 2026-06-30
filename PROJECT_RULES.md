# Project Rules

## Scope Discipline

- Build incrementally by milestone.
- Do not implement future milestone features early.
- Keep all visible website UI text in Hindi.
- Keep internal code names, folders, and identifiers in English.

## Frontend

- Use React, Vite, TypeScript, Material UI, TanStack Query, and React Router.
- Use Noto Sans Devanagari as the primary font.
- Build mobile-first and keep desktop layouts responsive.
- Use semantic HTML through appropriate Material UI component props.
- Do not create homepage sections or article pages until their milestone.

## Backend

- Use AWS SAM and TypeScript.
- Keep Lambda functions small and focused.
- Do not add Lambda business logic until the backend API milestone.
- Store Hindi text as UTF-8.
- Store images in S3 and only image URLs in DynamoDB.

## Quality

- Run build and lint before handing off a milestone.
- Prefer explicit types at API boundaries.
- Use shared contracts for Article, API response, errors, and pagination.
- Avoid unrelated refactors.

## Design

- Follow the approved navy/red/neutral design system.
- Avoid decorative clutter.
- Prioritize readability, accessibility, and fast loading.
