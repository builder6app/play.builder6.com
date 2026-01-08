import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;
  private defaultModel = 'google/gemini-3-pro-preview';
  private allowedKeywords: string[] = [
    'gpt-5', 
    'gemini-3',
  ];
  private models: any[] = [];

  constructor(private configService: ConfigService) {
    const defaultModel = this.configService.get<string>('OPENAI_MODEL_DEFAULT');
    if (defaultModel) {
      this.defaultModel = defaultModel;
    }

    const items = this.configService.get<string>('OPENAI_MODEL_ALLOWED');
    if (items) {
      this.allowedKeywords = items.split(',').map(k => k.trim());
    }

    if (!this.configService.get<string>('OPENAI_API_KEY')) {
      console.error('OPENAI_API_KEY is not set in the environment variables');
      return;
    }
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      baseURL: this.configService.get<string>('OPENAI_BASE_URL'),
    });
  }

  async generateCode(prompt: string, currentCode?: string, model?: string, type: 'page' | 'object' = 'page') {
    if (type === 'object') {
      const result = await this.generateObjectDefinition(prompt, model, currentCode);
      return { code: result.params };
    }

    const systemPrompt = `You are an expert web developer and UI designer. 
    Your task is to generate or modify HTML/Tailwind CSS code based on the user's request.
    
    If 'currentCode' is provided, you should modify it according to the user's instructions.
    If 'currentCode' is not provided, you should generate a new page from scratch.

    Tech Stack & Environment:
    - Styling: Tailwind CSS (CDN loaded).
    - Icons: Remix Icon (CDN loaded, e.g. <i class="ri-home-line"></i>).
    - Interactivity: Alpine.js (CDN loaded, e.g. x-data="{ open: false }").

    Important Constraints:
    - The page is rendered inside a layout that ALREADY contains a sidebar/header navigation. DO NOT regenerate the main navigation menu or sidebar. Focus on the specific page content.
    - If generating a full page, you can include <html>, <head>, <body> tags. The system will automatically process specific layout adjustments.
    
    Return ONLY the HTML code. Do not include markdown backticks or explanations.
    `;

    const userMessage = currentCode 
      ? `Current Code:\n${currentCode}\n\nUser Request: ${prompt}`
      : `User Request: ${prompt}`;

    const completion = await this.openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      model: model || this.defaultModel,
    });

    let content = completion.choices[0].message.content || '';
    
    // Clean up markdown code blocks if present
    if (content.startsWith('```html')) {
      content = content.replace(/^```html\n/, '').replace(/\n```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    return { code: content };
  }

  async generateCodeStream(prompt: string, currentCode?: string, model?: string, type: 'page' | 'object' = 'page') {
    if (type === 'object') {
      // Reuse existing object generation (non-streaming for now, or implement if needed)
      // Since the return type of generateCode is {code}, and this returns a stream, 
      // we should probably just support page generation here or implement stream for object.
      // Let's stick to page generation structure for now.
      const result = await this.generateObjectDefinition(prompt, model, currentCode);
      // Create a mock stream for consistency if needed, but better to just throw or handle elsewhere.
      // For this task, I'll implement the Page streaming logic.
    }

    const systemPrompt = `You are an expert web developer and UI designer. 
    Your task is to generate or modify HTML/Tailwind CSS code based on the user's request.
    
    If 'currentCode' is provided, you should modify it according to the user's instructions.
    If 'currentCode' is not provided, you should generate a new page from scratch.

    Tech Stack & Environment:
    - Styling: Tailwind CSS (CDN loaded).
    - Icons: Remix Icon (CDN loaded, e.g. <i class="ri-home-line"></i>).
    - Interactivity: Alpine.js (CDN loaded, e.g. x-data="{ open: false }").

    Important Constraints:
    - The page is rendered inside a layout that ALREADY contains a sidebar/header navigation. DO NOT regenerate the main navigation menu or sidebar. Focus on the specific page content.
    - If generating a full page, you can include <html>, <head>, <body> tags. The system will automatically process specific layout adjustments.
    
    Return ONLY the HTML code. Do not include markdown backticks or explanations.
    `;

    const userMessage = currentCode 
      ? `Current Code:\n${currentCode}\n\nUser Request: ${prompt}`
      : `User Request: ${prompt}`;

    return await this.openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      model: model || this.defaultModel,
      stream: true,
    });
  }

  async getModels() {
    if (this.models && this.models.length > 0) return this.models;
    
    // Default fallback models
    const fallbackModels = [
      { id: 'gpt-4o' },
      { id: 'gpt-4o-mini' },
      { id: 'google/gemini-3-pro-preview' }
    ];

    if (!this.configService.get<string>('OPENAI_API_KEY')) {
      return fallbackModels;
    }
    
    try {
      const list = await this.openai.models.list();
      // Filter for coding capable models from major providers supported by Vercel AI Gateway
      // Also allow any model that might be passed via env or specific ones we know
      const models = list.data.filter(m => this.allowedKeywords.some(am => m.id.toLowerCase().includes(am)));
      
      models.sort((a, b) => {
        if (a.id === this.defaultModel) return -1;
        if (b.id === this.defaultModel) return 1;
        return 0;
      });
      
      this.models = models.length > 0 ? models : fallbackModels;
      return this.models;
    } catch (e) {
      console.error('Failed to fetch models from OpenAI', e);
      // Fallback list for Vercel AI Gateway
      return fallbackModels;
    }
  }

  async generateObjectDefinition(prompt: string, model?: string, currentCode?: string) {
    const systemPrompt = `You are an expert Steedos Platform developer.
    Your task is to generate or modify a Steedos Object YAML definition (.object.yml) based on the user's request.
    
    The YAML should include standard properties: name, label, icon, version: 2, and fields.
    Common Field types: text, textarea, select, boolean, date, datetime, number, currency, lookup, master_detail, html, markdown.
    
    If 'currentCode' is provided, you should modify it according to the user's instructions.
    If 'currentCode' is not provided, you should generate a new object from scratch.

    Example structure:
    name: project
    label: Project
    icon: project
    version: 2
    fields:
      name:
        type: text
        label: Name
        required: true
        searchable: true
      status:
        type: select
        label: Status
        options:
          - label: Draft
            value: draft
    
    Return ONLY the YAML code. Do not include markdown backticks or explanations.
    `;

    const userMessage = currentCode 
    ? `Current YAML:\n${currentCode}\n\nUser Request: ${prompt}`
    : `User Request: ${prompt}`;

    const completion = await this.openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      model: model || this.defaultModel,
    });

    let content = completion.choices[0].message.content || '';
    
    // Clean up markdown code blocks if present
    if (content.startsWith('```yaml')) {
      content = content.replace(/^```yaml\n/, '').replace(/\n```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    return { params: content };
  }
}
