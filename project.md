# AssessAI - AI-Powered Interview Assessment Tool

## Installation

1. Clone the repository
```bash
git clone https://github.com/your-repo/ats-challenge.git
```
2. Install dependencies
```bash
npm install
```
3. Run development server
```bash
npm run dev
```

## Functionality

The application has three main stages:

1. **Document Upload**:
   - Upload job description and CV (file or text)
   - Validates file size (max 5MB) and types (PDF, DOC, DOCX, TXT)
   - Minimum 50 characters for job description
   - Minimum 100 characters for CV text

2. **Interview Chat**:
   - AI-generated questions based on job description and CV
   - Follow-up questions based on candidate responses
   - Tracks response time for each question

3. **Performance Report**:
   - AI-powered evaluation of candidate performance
   - Includes timing metrics and scoring

## Key Components

- **DocumentUploadForm**: Handles document upload and validation
- **InterviewChat**: Manages interview flow and question generation
- **PerformanceReport**: Displays evaluation results

## Deployment

1. Build production bundle
```bash
npm run build
```
2. Deploy to Vercel
```bash
npx vercel --prod
```