# Setup & Testing Guide

## Prerequisites
1. Node.js 18+ installed
2. Gemini API key from Google AI Studio

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Key
Create a `.env.local` file in the project root:
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Gemini API key:
```
GEMINI_API_KEY=your-actual-key-here
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **User Input**: Type a message in the chat input
2. **API Call**: Message is sent to `/api/chat` endpoint
3. **Gemini Processing**: Gemini 2.5 Flash generates a response
4. **Response Validation**: 
   - Checks for hedging/defensive phrases from [src/config/rejected-phrases.json](src/config/rejected-phrases.json)
   - If found, attempts to clean the response
   - If purely defensive filler → strips it out
   - Otherwise → shows original response with cleaning details
5. **Display**: 
   - Shows cleaned response to user
   - Displays metadata about what was cleaned (collapsible details)
   - Original unclean response available in details

## Example Interaction

**User**: "What's the best programming language?"

**Raw API Response**: 
"It's worth noting that it's debatable, but I'd push back on any singular 'best' language. That said, JavaScript dominates web development due to its versatility and ecosystem."

**After Cleaning**:
"JavaScript dominates web development due to its versatility and ecosystem."

The cleaned response shows:
- ✅ Response Cleaned
- Found phrases: "It's worth noting", "debatable", "I'd push back on", "That said"
- Original response available in expandable details

## Testing

1. **Test Phrase Detection**: Ask the model questions and observe phrase cleaning
2. **Verify Pass-Through**: Some responses may pass validation (no hedging phrases found)
3. **Check Metadata**: Expand the "Details" section to see what was cleaned

## Deployment

### Deploy to Vercel
```bash
vercel
```

Ensure your environment variable is set:
- Go to Vercel Project Settings → Environment Variables
- Add `GEMINI_API_KEY`

### Alternative: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### "API Error" in Chat
- Check `.env.local` has valid `GEMINI_API_KEY`
- Restart dev server after updating env vars
- Check API key hasn't exceeded rate limits

### CSS Not Loading
- Clear Next.js cache: `rm -rf .next`
- Restart dev server: `npm run dev`

### Build Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Run `npm run build`

## Project Structure
```
src/
├── app/
│   ├── api/chat/route.js          # API endpoint
│   ├── Chat.js                     # Main chat UI component
│   ├── chat.module.css             # Styling
│   ├── layout.js                   # Layout wrapper
│   ├── page.js                     # Home page
│   └── globals.css                 # Global styles
├── lib/
│   └── responseValidator.js        # Response cleaning logic
└── config/
    └── rejected-phrases.json       # Hedging phrases to detect
```

## Customization

### Add/Remove Hedging Phrases
Edit [src/config/rejected-phrases.json](src/config/rejected-phrases.json):
```json
{
  "hedgingPhrases": [
    "Your custom phrase here",
    "Another phrase to detect"
  ]
}
```

### Change Model
In [src/app/api/chat/route.js](src/app/api/chat/route.js), update the model:
```javascript
model: 'claude-3-5-sonnet-20241022', // Change to Sonnet
```

Available models:
- `claude-3-5-haiku-20241022` (fast, cheap)
- `claude-3-5-sonnet-20241022` (balanced)
- `claude-3-opus-20250219` (powerful)

### Adjust Cleaning Logic
Edit [src/lib/responseValidator.js](src/lib/responseValidator.js):
- `isPurelyDefensive()` - threshold for stripping phrases
- `checkForHedgingPhrases()` - phrase matching logic

## API Response Format

### Success Response
```json
{
  "success": true,
  "original": "Original unclean response text...",
  "cleaned": "Cleaned response text...",
  "passed": false,
  "foundPhrases": ["I'd push back on", "That said"],
  "message": "Found 2 hedging phrase(s). Response has been cleaned."
}
```

### Error Response
```json
{
  "error": "Error message describing the issue"
}
```

## Support

- Anthropic Docs: https://docs.anthropic.com/
- Next.js Docs: https://nextjs.org/docs/
- API Status: https://status.anthropic.com/
