# Multi-Document Intelligence Workbench

A full-stack application for uploading multiple documents, providing analysis instructions, and receiving structured comparison and consolidated insights derived from those documents.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                  │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────────────┐  │
│  │ Upload   │  │ Analysis  │  │ Results Dashboard            │  │
│  │ Zone     │  │ Prompt    │  │ - Comparison Table           │  │
│  │ Doc List │  │ Trigger   │  │ - Discrepancies              │  │
│  │          │  │           │  │ - Missing Info               │  │
│  │          │  │           │  │ - Key-Values                 │  │
│  │          │  │           │  │ - Facts vs Inferences        │  │
│  │          │  │           │  │ - Provenance Chips           │  │
│  └──────────┘  └───────────┘  │ - Copy (Markdown / JSON)     │  │
│                               └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTP (REST)
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Express + TypeScript)                │
│                                                                 │
│  ┌─────────────┐   ┌──────────────────┐   ┌──────────────────┐  │
│  │ Ingestion   │   │ LLM Provider     │   │ Normalizer       │  │
│  │ Pipeline    │   │ System           │   │ Service          │  │
│  │             │   │                  │   │                  │  │
│  │ • Validate  │   │ ILLMProvider ◄───┤   │ Raw LLM Output   │  │
│  │   - ext     │   │ ├─ MockProvider  │   │ → Structured     │  │
│  │   - MIME    │   │ ├─ (Gemini)*     │   │   Result         │  │
│  │   - size    │   │ └─ (OpenAI)*     │   │                  │  │
│  │   - magic   │   │                  │   │ • summary        │  │
│  │ • Parse     │   │ Stage 1:         │   │ • comparisonTable│  │
│  │   - PDF     │   │  Extract facts   │   │ • discrepancies  │  │
│  │   - TXT     │   │  per document    │   │ • missingInfo    │  │
│  │   - CSV     │   │                  │   │ • keyValues      │  │
│  │             │   │ Stage 2:         │   │ • inferences     │  │
│  └─────────────┘   │  Cross-doc       │   └──────────────────┘  │
│                    │  analysis        │                         │
│                    └──────────────────┘                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  SQLite + Prisma ORM                        │ │
│  │  Document │ DocumentFacts │ AnalysisSession                │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Two-Stage Analysis Pipeline

1. **Stage 1 – Per-document extraction**: Each document is independently processed through the LLM provider to extract entities, dates, obligations, financial values, and key-value pairs with supporting quotes. Results are cached in `DocumentFacts`.

2. **Stage 2 – Cross-document analysis**: Cached facts from all selected documents are combined with the user's custom prompt. The LLM performs comparative analysis, identifying discrepancies, missing information, and generating a consolidated summary.

### Database Schema

| Table | Purpose |
|-------|---------|
| `Document` | Stores uploaded document metadata and extracted text content |
| `DocumentFacts` | Caches Stage 1 extraction results (JSON) per document |
| `AnalysisSession` | Stores analysis prompt, status, and normalized results |
| `AnalysisSessionDocument` | Join table linking sessions to documents |

## Assumptions

- **Mock LLM Provider**: The application ships with a `MockProvider` that uses heuristic regex-based extraction (pattern matching for dates, financial values, entities, etc.) instead of calling a real LLM API. This makes it fully functional without API keys.
- **Text-based PDFs only**: Scanned/image-only PDFs are explicitly rejected since OCR is not included (the requirement was to handle this gracefully).
- **1MB file limit**: Enforced via both magic-byte validation and multer middleware.
- **Single-user**: No authentication or multi-tenancy. Designed for local or single-user deployment.
- **Synchronous analysis**: Analysis runs in-request (not queued). Suitable for small document sets; would need a job queue for production scale.

## Completed Functionality

- ✅ Multi-file upload with drag-and-drop support
- ✅ PDF, TXT, and CSV format support
- ✅ Magic-byte validation for PDFs
- ✅ File size validation (1MB limit)
- ✅ Reject scanned PDFs with no extractable text
- ✅ Content extraction and storage
- ✅ User-defined analysis prompt with example suggestions
- ✅ Two-stage analysis pipeline (extract → analyze)
- ✅ Fact caching in `DocumentFacts` table
- ✅ Normalized output structure (summary, comparison table, discrepancies, missing info, key-values, inferences)
- ✅ Comparison table with match/conflict/partial/missing status badges
- ✅ Provenance chips with quote tooltips
- ✅ Clear distinction between extracted facts and AI-generated inferences
- ✅ One-click copy as Markdown or JSON
- ✅ ErrorBoundary for graceful UI error handling
- ✅ Defensive optional chaining throughout
- ✅ Extensible LLM provider system (interface + factory + registry)
- ✅ Extensible parser system (interface + factory)
- ✅ Zod schema validation for extracted facts (backend + frontend)
- ✅ 40 automated tests (vitest): schema validation, normalizer, file validator
- ✅ Environment variable validation with Zod at startup
- ✅ Document deletion
- ✅ Select all / individual document selection
- ✅ Upload error reporting (per-file)

## Known Limitations

1. **Mock LLM only**: The `MockProvider` uses regex heuristics — real LLM integration (Gemini, OpenAI) requires implementing the `ILLMProvider` interface and adding API keys.
2. **No OCR**: Scanned/image PDFs are rejected rather than processed.
3. **No streaming**: Analysis results are returned after full completion, not streamed.
4. **No authentication**: No user accounts, sessions, or access control.
5. **No file storage**: Document content is stored in SQLite (text column). For large-scale deployments, object storage (S3) would be more appropriate.
6. **Synchronous processing**: Analysis blocks the HTTP request. Large document sets may timeout.
7. **No pagination**: Document and session lists are not paginated.
8. **No WebSocket/SSE**: No real-time progress updates during analysis.

## Security Considerations

- **File validation**: Multi-layer validation (extension, MIME type, magic bytes, file size) prevents upload of malicious files.
- **Memory-only upload**: Files are processed in memory (multer `memoryStorage`) — no temporary files written to disk before validation.
- **Input sanitization**: All user inputs are validated and typed through TypeScript and Zod schemas.
- **CORS**: Restricted to configured origin (`CORS_ORIGIN` env var).
- **No secret exposure**: Backend `.env` secrets (API keys, DB URL) are never sent to the frontend. Frontend uses only `VITE_API_URL` which is a path prefix.
- **SQL injection prevention**: Prisma ORM with parameterized queries.
- **Error handling**: Global error handler strips stack traces in production mode.
- **File size limits**: Enforced at both multer and application level to prevent DoS.

## How to Productionise

1. **Real LLM integration**: Implement `ILLMProvider` for Gemini/OpenAI with proper rate limiting, retry logic, and token budgeting.
2. **Job queue**: Replace synchronous analysis with a queue (Bull/BullMQ + Redis) for background processing with WebSocket/SSE progress updates.
3. **Object storage**: Move document content from SQLite to S3/GCS with presigned URLs.
4. **PostgreSQL**: Replace SQLite with PostgreSQL for concurrent access and better performance.
5. **Authentication**: Add JWT/OAuth2 authentication with role-based access control.
6. **Rate limiting**: Add express-rate-limit middleware.
7. **Monitoring**: Add structured logging (Pino), health checks, and APM (Datadog/New Relic).
8. **Containerisation**: Dockerize with multi-stage builds and deploy to Kubernetes/ECS.
9. **CI/CD**: GitHub Actions pipeline with lint, test, build, and deploy stages.
10. **CDN**: Serve frontend via CDN (CloudFront/Cloudflare).
11. **Chunking**: Implement token-aware chunking for large documents that exceed LLM context windows.

## Adding a New LLM Provider

The system is designed for easy extensibility:

```typescript
// 1. Create backend/src/llm/gemini.provider.ts
import { ILLMProvider } from './llm.interface';
import { ExtractedFacts, AnalysisOutput } from '../types/llm.types';

export class GeminiProvider implements ILLMProvider {
  readonly name = 'gemini';
  
  constructor(private apiKey: string) {}

  async extractFacts(content, documentId, documentName, fileType): Promise<ExtractedFacts> {
    // Call Gemini API with extraction prompt
  }

  async analyzeDocuments(facts, userPrompt): Promise<AnalysisOutput> {
    // Call Gemini API with analysis prompt
  }
}

// 2. Register in backend/src/llm/llm.factory.ts
import { GeminiProvider } from './gemini.provider';
registry.set('gemini', () => new GeminiProvider(process.env.GEMINI_API_KEY!));

// 3. Set in .env
// LLM_PROVIDER=gemini
// GEMINI_API_KEY=your-key-here
```

**Zero changes** needed in services, controllers, or frontend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite + Prisma ORM |
| Testing | Vitest (40 tests) |
| Validation | Zod (runtime schema validation) |
| Document parsing | pdf-parse, csv-parse |
| LLM | ILLMProvider interface + MockProvider |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to the backend on `http://localhost:3001`.

### Running Tests

```bash
# Backend (34 tests)
cd backend && npm test

# Frontend (6 tests)
cd frontend && npm test
```

## Project Structure

```
├── backend/
│   ├── prisma/              # Database schema
│   ├── src/
│   │   ├── config/          # Environment validation
│   │   ├── controllers/     # Request handlers
│   │   ├── ingestion/       # Document processing pipeline
│   │   │   ├── parsers/     # PDF, TXT, CSV parsers
│   │   │   └── validators/  # File validation (magic bytes, size, etc.)
│   │   ├── llm/             # LLM provider system
│   │   │   ├── llm.interface.ts   # ILLMProvider interface
│   │   │   ├── llm.factory.ts     # Provider registry & factory
│   │   │   └── mock.provider.ts   # Mock implementation
│   │   ├── middleware/      # Error handling, file upload
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Chunking, provenance helpers
│   └── tests/               # Vitest tests & fixtures
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API client
│   │   ├── components/      # React components
│   │   │   ├── upload/      # Upload zone, document list
│   │   │   ├── analysis/    # Prompt input, trigger button
│   │   │   └── results/     # Dashboard, tables, panels, chips
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # Frontend type definitions + Zod schemas
│   │   └── styles/          # Tailwind CSS
│   └── tests/               # Frontend vitest tests
```
