# AI Integration Architecture Documentation

## Overview
This document outlines the AI integration architecture for the Dynamic Interview Assistant, covering question generation, follow-up logic, and candidate evaluation flows.

## Core Components

### 1. Question Generation
- **Input Processing**: Job description and candidate CV are processed using Google's Gemini API
- **Prompt Engineering**: Custom prompts are crafted to generate contextually relevant questions
- **Output Formatting**: Questions are categorized into technical, behavioral, and situational types

### 2. Follow-up Logic
- **Contextual Analysis**: Previous responses are analyzed to determine follow-up needs
- **Adaptive Questioning**: Follow-up questions are generated based on response depth and relevance

### 3. Candidate Evaluation
- **Scoring Mechanism**: Responses are evaluated on multiple dimensions including technical acumen and communication skills
- **Timing Integration**: Response times are factored into the overall scoring

## API Configuration

### Environment Variables
- `GEMINI_API_KEY`: API key for Google's Gemini
- `OPENAI_API_KEY`: API key for OpenAI
- `ANTHROPIC_API_KEY`: API key for Anthropic
- `AI_PROVIDER`: Can be set to 'googleai', 'openai', 'anthropic', or 'ollama'

### Local AI Setup (Ollama)
1. Install Ollama: `brew install ollama`
2. Pull desired model: `ollama pull <model_name>`
3. Set these in .env:
   - `OLLAMA_MODEL`: Model name (e.g. 'qwen2.5-coder:3b')
   - `OLLAMA_ENDPOINT`: Default is 'http://localhost:11434'

### Error Handling
- API call retries with exponential backoff
- Graceful degradation of service during API outages

## Response Timing Integration
- Response times are tracked per question
- Timing metrics are normalized and incorporated into scoring

## Flow Diagrams

### Question Generation Flow
```
[Job Description] -> [Processing] -> [Prompt Design] -> [Question Generation]
[Candidate CV] -> [Processing] -> [Prompt Design] -> [Question Generation]
```

### Evaluation Flow
```
[Interview Transcript] -> [Analysis] -> [Scoring] -> [Final Evaluation]
```