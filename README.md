# AI Regression Worker

AI-powered regression testing platform that generates test plans, creates Playwright tests, executes them in background, and analyzes failures with AI.

## Features

- AI Test Plan Generation
- Playwright Code Generation
- Background Test Execution
- Failure Analysis with AI
- Self-Healing Selector Suggestions
- Bug Report Generation

## Tech Stack

- Next.js 16 + React 19
- PostgreSQL + Drizzle ORM
- Redis + BullMQ
- Playwright
- TanStack Query
- shadcn/ui + Tailwind CSS

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- pnpm

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start database services:
   ```bash
   docker-compose up -d
   ```

4. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

5. Run database migrations:
   ```bash
   pnpm db:push
   ```

6. Start the development server:
   ```bash
   pnpm dev
   ```

7. Start the worker (in a separate terminal):
   ```bash
   pnpm dev:worker
   ```

## Usage

1. Open http://localhost:3000
2. Create a new project
3. Add environments (dev, staging, production)
4. Use AI Generate to create test plans
5. Review and approve generated test cases
6. Run tests and view results

## Project Structure

See [DESIGN.md](docs/superpowers/specs/2026-06-30-ai-regression-worker-design.md) for detailed architecture.