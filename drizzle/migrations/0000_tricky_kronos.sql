CREATE TYPE "public"."BugReportStatus" AS ENUM('open', 'in-progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."Priority" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."RunType" AS ENUM('smoke', 'regression', 'impacted', 'manual');--> statement-breakpoint
CREATE TYPE "public"."SuggestionStatus" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."SuggestionType" AS ENUM('patch', 'bug-report', 'new-test');--> statement-breakpoint
CREATE TYPE "public"."TestCaseStatus" AS ENUM('draft', 'approved', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."TestRunResultStatus" AS ENUM('passed', 'failed', 'skipped', 'error');--> statement-breakpoint
CREATE TYPE "public"."TestRunStatus" AS ENUM('queued', 'running', 'passed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "AiSuggestion" (
	"id" text PRIMARY KEY NOT NULL,
	"testCaseId" text NOT NULL,
	"testRunResultId" text,
	"suggestionType" "SuggestionType" NOT NULL,
	"oldCode" text,
	"newCode" text NOT NULL,
	"explanation" text,
	"confidenceScore" real,
	"status" "SuggestionStatus" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "BugReport" (
	"id" text PRIMARY KEY NOT NULL,
	"projectId" text NOT NULL,
	"testRunResultId" text,
	"title" text NOT NULL,
	"module" text,
	"environment" text,
	"stepsToReproduce" jsonb NOT NULL,
	"expectedResult" text NOT NULL,
	"actualResult" text NOT NULL,
	"evidence" jsonb,
	"aiAnalysis" text,
	"status" "BugReportStatus" DEFAULT 'open' NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Environment" (
	"id" text PRIMARY KEY NOT NULL,
	"projectId" text NOT NULL,
	"name" text NOT NULL,
	"baseUrl" text NOT NULL,
	"variables" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Module" (
	"id" text PRIMARY KEY NOT NULL,
	"projectId" text NOT NULL,
	"name" text NOT NULL,
	"routePattern" text,
	"apiPatterns" jsonb DEFAULT '[]'::jsonb,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Project" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"baseUrl" text NOT NULL,
	"description" text,
	"authConfig" jsonb,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PromptTemplate" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"provider" text DEFAULT 'all' NOT NULL,
	"systemPrompt" text NOT NULL,
	"userPromptTemplate" text NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TestCase" (
	"id" text PRIMARY KEY NOT NULL,
	"projectId" text NOT NULL,
	"moduleId" text,
	"title" text NOT NULL,
	"description" text,
	"goal" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"priority" "Priority" DEFAULT 'medium' NOT NULL,
	"status" "TestCaseStatus" DEFAULT 'draft' NOT NULL,
	"generatedCode" text,
	"createdByAi" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TestRunResult" (
	"id" text PRIMARY KEY NOT NULL,
	"testRunId" text NOT NULL,
	"testCaseId" text NOT NULL,
	"status" "TestRunResultStatus" NOT NULL,
	"duration" integer,
	"errorMessage" text,
	"screenshotUrl" text,
	"videoUrl" text,
	"traceUrl" text,
	"consoleLogs" jsonb,
	"networkLogs" jsonb,
	"aiAnalysis" jsonb,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TestRun" (
	"id" text PRIMARY KEY NOT NULL,
	"projectId" text NOT NULL,
	"environmentId" text NOT NULL,
	"status" "TestRunStatus" DEFAULT 'queued' NOT NULL,
	"runType" "RunType" DEFAULT 'manual' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"startedAt" timestamp (3),
	"finishedAt" timestamp (3),
	"summary" jsonb,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "AiSuggestion" ADD CONSTRAINT "AiSuggestion_testCaseId_TestCase_id_fk" FOREIGN KEY ("testCaseId") REFERENCES "public"."TestCase"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "AiSuggestion" ADD CONSTRAINT "AiSuggestion_testRunResultId_TestRunResult_id_fk" FOREIGN KEY ("testRunResultId") REFERENCES "public"."TestRunResult"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "BugReport" ADD CONSTRAINT "BugReport_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "BugReport" ADD CONSTRAINT "BugReport_testRunResultId_TestRunResult_id_fk" FOREIGN KEY ("testRunResultId") REFERENCES "public"."TestRunResult"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Environment" ADD CONSTRAINT "Environment_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Module" ADD CONSTRAINT "Module_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_moduleId_Module_id_fk" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TestRunResult" ADD CONSTRAINT "TestRunResult_testRunId_TestRun_id_fk" FOREIGN KEY ("testRunId") REFERENCES "public"."TestRun"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TestRunResult" ADD CONSTRAINT "TestRunResult_testCaseId_TestCase_id_fk" FOREIGN KEY ("testCaseId") REFERENCES "public"."TestCase"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TestRun" ADD CONSTRAINT "TestRun_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TestRun" ADD CONSTRAINT "TestRun_environmentId_Environment_id_fk" FOREIGN KEY ("environmentId") REFERENCES "public"."Environment"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "AiSuggestion_testCaseId_idx" ON "AiSuggestion" USING btree ("testCaseId");--> statement-breakpoint
CREATE INDEX "AiSuggestion_status_idx" ON "AiSuggestion" USING btree ("status");--> statement-breakpoint
CREATE INDEX "BugReport_projectId_idx" ON "BugReport" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "BugReport_status_idx" ON "BugReport" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Environment_projectId_idx" ON "Environment" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "Module_projectId_idx" ON "Module" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "TestCase_projectId_idx" ON "TestCase" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "TestCase_moduleId_idx" ON "TestCase" USING btree ("moduleId");--> statement-breakpoint
CREATE INDEX "TestCase_status_idx" ON "TestCase" USING btree ("status");--> statement-breakpoint
CREATE INDEX "TestRunResult_testRunId_idx" ON "TestRunResult" USING btree ("testRunId");--> statement-breakpoint
CREATE INDEX "TestRunResult_testCaseId_idx" ON "TestRunResult" USING btree ("testCaseId");--> statement-breakpoint
CREATE INDEX "TestRun_projectId_idx" ON "TestRun" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "TestRun_status_idx" ON "TestRun" USING btree ("status");