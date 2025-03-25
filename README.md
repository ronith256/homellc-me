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
Create a `.env` file in the root directory and add your Google AI API key and the Python server URL:
```
GEMINI_API_KEY=your_api_key_here
VITE_API_URL=your_python_server_url_here
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

## Design Decisions & Approach

### Technology Choices

1. **Gemini AI over ChatGPT**
   - Cost-effective solution with a generous free tier
   - Lower latency and faster response times
   - Native support for multimodal interactions
   - Competitive performance for most use cases
   - Better integration with Google's ecosystem

2. **ChromaDB for Knowledge Base**
   - Open-source and free to use
   - Lightweight and easy to integrate
   - Excellent performance for semantic search
   - Built-in support for embeddings
   - Active community and regular updates

3. **React Framework**
   - Component-based architecture for better code organization
   - Rich ecosystem of libraries and tools
   - Excellent TypeScript support
   - Virtual DOM for optimal performance
   - Large community and extensive documentation

### Architecture Decisions

1. **Context API for State Management**
   - Built-in React solution, no additional dependencies
   - Perfect for medium-scale applications
   - Simpler learning curve compared to Redux
   - Better performance for frequent updates

2. **Vega-Lite/Altair for Visualizations**
   - Declarative visualization grammar
   - Interactive by default
   - Wide range of chart types
   - Easy to customize and extend

3. **Docker Support**
   - Consistent development environment
   - Easy deployment and scaling
   - Simplified dependency management
   - Cross-platform compatibility

## Findings
1. **Gemini 2.0 Flash**: Much cheaper than GPT-4o and has a good free tier.


## Live Demo
You can access it at https://homellc.profilegen.site/