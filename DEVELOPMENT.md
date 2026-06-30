# Development

## Prerequisites

- Node.js 22 or newer
- npm
- AWS SAM CLI for SAM validation/build/deploy

## Install

```bash
npm install --prefix frontend
npm install --prefix backend
```

## Build

```bash
npm run build --prefix frontend
npm run build --prefix backend
```

## Lint

```bash
npm run lint --prefix frontend
npm run lint --prefix backend
```

## Format Check

```bash
npm run format --prefix frontend
npm run format --prefix backend
```

## Frontend Dev Server

```bash
npm run dev --prefix frontend
```

## SAM

```bash
sam validate --template-file backend/template.yaml
sam build --template-file backend/template.yaml
```
