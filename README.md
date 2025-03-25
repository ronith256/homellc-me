# Live Chat with AI Assistant

A modern React-based chat application powered by Google's Generative AI (Gemini) that provides an interactive and intelligent chat experience with various integrated tools.

## Features

- 🤖 AI-powered chat interface using Gemini 2.0 Flash
- 🎙️ Text-to-speech capabilities with customizable voice settings
- 📊 Interactive data visualization using Altair/Vega-Lite
- 🔍 Knowledge base integration for personalized responses
- 🌐 Website preview and linking capabilities
- 💬 Real-time chat interface

## Tech Stack

- React
- TypeScript
- Google Generative AI (Gemini)
- Vega-Lite/Altair for visualizations
- Context API for state management

## Getting Started

### Prerequisites

- Node.js
- npm 
- Google AI API key

### Installation
#### Using Docker
1. Clone the repository:
```bash
git clone https://github.com/yourusername/liveChat.git
cd liveChat
```
2. Run docker-compose:
```bash
docker-compose up --build
```

#### Manual
1. Clone the repository:
```bash
git clone https://github.com/yourusername/liveChat.git
cd liveChat
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add your Google AI API key:
```
GEMINI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── contexts/         # React context providers
├── tools/           # Tool implementations
│   ├── altair-tools.ts
│   ├── knowledge-base-tools.ts
│   └── website-tools.ts
├── components/      # React components
└── types/          # TypeScript type definitions
```

## Available Tools

1. **Knowledge Base Tool**
   - Query personal information and resume data
   - Provides context-aware responses

2. **Visualization Tool**
   - Create interactive charts and graphs
   - Supports various chart types (bar, line, scatter plots)

3. **Website Tool**
   - Preview and link to external websites
   - Automatic tab opening for shared links

## Findings
1. **Gemini 2.0 Flash**: Much cheaper than GPT-4o and has a good free tier.
