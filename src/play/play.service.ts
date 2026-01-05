import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Db } from 'mongodb';
import { Snippet } from './schemas/snippet.schema';
import { SnippetVersion } from './schemas/snippet-version.schema';
import { CreateSnippetDto } from './dto/create-snippet.dto';

@Injectable()
export class PlayService {
  constructor(@Inject('DATABASE_CONNECTION') private db: Db) {}

  private generateId(length = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async save(createSnippetDto: CreateSnippetDto, userId?: string): Promise<Snippet> {
    const { code, id, projectId, name } = createSnippetDto;
    const now = new Date();

    // 1. Try to update existing snippet if ID is provided
    if (id) {
      const existingSnippet = await this.db.collection<Snippet>('play_snippets').findOne({ _id: id });
      
      // If snippet exists AND belongs to the current user
      if (existingSnippet && existingSnippet.owner === userId && userId) {
        const newVersion: SnippetVersion = {
          _id: this.generateId(),
          snippetId: id,
          code: existingSnippet.code, // Save previous code as version
          versionId: this.generateId(4),
          
          // Steedos Standard Fields
          owner: existingSnippet.owner,
          created: existingSnippet.modified || existingSnippet.created,
          created_by: existingSnippet.modified_by || existingSnippet.created_by,
        };

        // Save version
        await this.db.collection<SnippetVersion>('play_snippet_versions').insertOne(newVersion);

        // Update current snippet
        const updateFields: any = {
          code: code,
          modified: now,
          modified_by: userId
        };
        if (name) updateFields.name = name;

        await this.db.collection<Snippet>('play_snippets').updateOne(
          { _id: id },
          { $set: updateFields }
        );
        
        return { ...existingSnippet, ...updateFields };
      }
    }

    // 2. Create new snippet (Fork or New)
    const newSnippet: Snippet = {
      _id: this.generateId(),
      code,
      owner: userId,
      created: now,
      created_by: userId,
      modified: now,
      modified_by: userId,
      projectId: projectId,
      name: name || 'Untitled Page'
    };
    await this.db.collection<Snippet>('play_snippets').insertOne(newSnippet);
    return newSnippet;
  }

  async findAllByProject(projectId: string): Promise<Snippet[]> {
    return this.db.collection<Snippet>('play_snippets')
      .find({ projectId })
      .sort({ modified: -1 })
      .toArray();
  }

  async getVersions(snippetId: string): Promise<SnippetVersion[]> {
    return this.db.collection<SnippetVersion>('play_snippet_versions')
      .find({ snippetId })
      .sort({ created: -1 })
      .toArray();
  }

  async findAll(userId?: string): Promise<Snippet[]> {
    const query = userId ? { owner: userId } : {};
    return this.db.collection<Snippet>('play_snippets').find(query).sort({ modified: -1 }).toArray();
  }

  async findOne(id: string): Promise<Snippet> {
    const snippet = await this.db
      .collection<Snippet>('play_snippets')
      .findOne({ _id: id });
    if (!snippet) {
      throw new NotFoundException(`Snippet #${id} not found`);
    }
    return snippet;
  }

  buildHtml(code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    ${code}
</body>
</html>`;
  }
}
