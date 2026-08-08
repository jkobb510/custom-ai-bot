# Application Architecture

## Overview

This is an isomorphic Next.js application that functions as a ChatGPT clone with deterministic response cleaning. The architecture consists of a frontend UI layer, API routes for backend logic, integration with the Google Gemini API (gemini-2.5-flash), and a response validation pipeline.

## System Architecture Diagram

```mermaid
graph LR
    User["User Message"]
    ChatAPI["/api/chat<br/>(POST)"]
    GeminiAPI["Google Gemini<br/>API"]
    ResponseValidator["Response<br/>Validator"]
    PhrasesJSON["Rejected<br/>Phrases JSON"]
    PhraseChecker["Phrase<br/>Checker"]
    ResponseRephrase["Rephrase"]
    ResponseRender["Render<br/>Response"]

    User -->|Send| ChatAPI
    ChatAPI -->|Call| GeminiAPI
    GeminiAPI -->|Response| ResponseValidator
    PhrasesJSON -->|Load| ResponseValidator
    ResponseValidator -->|Check| PhraseChecker
    
    PhraseChecker -->|Pass| ResponseRender
    PhraseChecker -->|Fail| ResponseRephrase
    ResponseRephrase -->|Output| ResponseRender
    
    ResponseRender -->|Return| User

    style User fill:#e1f5ff,color:#000000
    style ChatAPI fill:#fff3e0,color:#000000
    style GeminiAPI fill:#c8e6c9,color:#000000
    style ResponseValidator fill:#ffe0b2,color:#000000
    style PhrasesJSON fill:#f0f4c3,color:#000000
    style PhraseChecker fill:#ffe0b2,color:#000000
    style ResponseRephrase fill:#ffe0b2,color:#000000
    style ResponseRender fill:#f3e5f5,color:#000000
```

## Component Details

### API Endpoint
- **POST /api/chat** - Main entry point
  - Receives user message
  - Calls Google Gemini API
  - Pipes response through validator
  - Returns cleaned response

### Response Validation Pipeline
1. **Phrase Checker** - Detects hedging/defensive language
   - Loads rejected phrases from JSON config
   - Scans response text for matches
   - Identifies flagged phrases

2. **Filtering Logic**
   - **Pass**: Response contains no flagged phrases → render as-is
   - **Fail with pure filler**: Strip out defensive phrase
   - **Fail with useful content**: Rephrase response while keeping useful parts

3. **Response Rephrase** (AI-assisted)
   - Removes purely defensive filler
   - Preserves substantive content
   - Maintains natural language flow

### Configuration
- **rejected-phrases.json** - Centralized list of hedging phrases to detect and clean

### Data Flow
```
User Message → /api/chat → Google Gemini API → Response Validator → 
Phrase Checker → [Pass/Fail] → Response Rephrase (if needed) → Rendered Response → User
```

## Technology Stack
- **Framework**: Next.js (App Router)
- **AI API**: Google Gemini (`gemini-3.6-flash`)
- **Styling**: CSS Modules
- **Config**: JSON files
- **Deployment**: Vercel (recommended)

## Future Enhancements
- Message streaming for better UX
- Customizable phrase rules
- Analytics on phrase detection rates
- Confidence scoring for phrase categorization
