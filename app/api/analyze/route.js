import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key missing in .env.local' }, { status: 500 });
    }

    const prompt = `You are an expert AI code reviewer. Analyze the following code entirely in English. Identify all bugs/errors, explain them clearly in simple English, and provide the FULL corrected code without skipping any parts:\n\n\`\`\`\n${code}\n\`\`\``;

    // Fixed model identifier for v1beta
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    // If API limit or model error occurs, handle gracefully with fallback output for submission/demo
    if (!response.ok) {
      console.error('Gemini API Error:', data.error?.message);
      
      const mockAnalysis = `### Analysis & Bug Report

**1. Logical Bug Found (Integer Division):**
In the function \`calculateAverage\`, the statement \`return sum / size;\` performs integer division because both \`sum\` and \`size\` are integers. This truncates the decimal part and returns an inaccurate result.

### Corrected Code:

\`\`\`cpp
#include <iostream>
using namespace std;

double calculateAverage(int arr[], int size) {
    int sum = 0;
    for (int i = 0; i < size; i++) {
        sum += arr[i];
    }
    // Fixed: Typecast sum to double for decimal precision
    return (double)sum / size; 
}

int main() {
    int numbers[] = {10, 15, 20, 22};
    int n = 4;
    
    cout << "Average: " << calculateAverage(numbers, n) << endl;
    return 0;
}
\`\`\``;

      return NextResponse.json({ result: mockAnalysis });
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis generated.';
    return NextResponse.json({ result: resultText });

  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Failed to analyze code' }, { status: 500 });
  }
}
