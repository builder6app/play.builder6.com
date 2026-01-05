import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Db } from 'mongodb';
import { Page } from './schemas/page.schema';
import { Project } from './schemas/project.schema';
import { PageVersion } from './schemas/page-version.schema';
import { CreatePageDto } from './dto/create-page.dto';

@Injectable()
export class PageService {
  constructor(@Inject('DATABASE_CONNECTION') private db: Db) {}

  private generateId(length = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async save(createPageDto: CreatePageDto, userId?: string): Promise<Page> {
    const { code, id, projectId, name, metaTitle, slug, addToNavigation } = createPageDto;
    const now = new Date();

    // 1. Try to update existing page if ID is provided
    if (id) {
      const existingPage = await this.db.collection<Page>('builder6_pages').findOne({ _id: id });
      
      // If page exists AND belongs to the current user
      if (existingPage && existingPage.owner === userId && userId) {
        const newVersion: PageVersion = {
          _id: this.generateId(),
          pageId: id,
          code: existingPage.code, // Save previous code as version
          versionId: this.generateId(4),
          
          // Steedos Standard Fields
          owner: existingPage.owner,
          created: existingPage.modified || existingPage.created,
          created_by: existingPage.modified_by || existingPage.created_by,
        };

        // Save version
        await this.db.collection<PageVersion>('builder6_page_versions').insertOne(newVersion);

        // Update current page
        const updateFields: any = {
          code: code,
          modified: now,
          modified_by: userId
        };
        if (name) updateFields.name = name;
        if (metaTitle !== undefined) updateFields.metaTitle = metaTitle;
        if (slug !== undefined) updateFields.slug = slug;
        if (addToNavigation !== undefined) updateFields.addToNavigation = addToNavigation;

        await this.db.collection<Page>('builder6_pages').updateOne(
          { _id: id },
          { $set: updateFields }
        );
        
        return { ...existingPage, ...updateFields };
      }
    }

    // 2. Create new page (Fork or New)
    const newId = this.generateId();
    const newPage: Page = {
      _id: newId,
      code,
      owner: userId,
      created: now,
      created_by: userId,
      modified: now,
      modified_by: userId,
      projectId: projectId,
      name: name || 'Untitled Page',
      metaTitle,
      slug: newId.toLocaleLowerCase(),
      addToNavigation
    };
    await this.db.collection<Page>('builder6_pages').insertOne(newPage);
    return newPage;
  }

  async findAllByProject(projectId: string): Promise<Page[]> {
    return this.db.collection<Page>('builder6_pages')
      .find({ projectId })
      .sort({ modified: -1 })
      .toArray();
  }

  async getVersions(pageId: string): Promise<PageVersion[]> {
    return this.db.collection<PageVersion>('builder6_page_versions')
      .find({ pageId })
      .sort({ created: -1 })
      .toArray();
  }

  async findAll(userId?: string): Promise<Page[]> {
    const query = userId ? { owner: userId } : {};
    return this.db.collection<Page>('builder6_pages').find(query).sort({ modified: -1 }).toArray();
  }

  async findOne(id: string): Promise<Page> {
    const page = await this.db
      .collection<Page>('builder6_pages')
      .findOne({ _id: id });
    if (!page) {
      throw new NotFoundException(`Page #${id} not found`);
    }
    return page;
  }

  async delete(id: string, userId: string): Promise<void> {
    const page = await this.findOne(id);
    if (page.owner !== userId) {
      throw new NotFoundException(`Page #${id} not found or you don't have permission`);
    }
    await this.db.collection<Page>('builder6_pages').deleteOne({ _id: id });
  }

  async findByPath(projectId: string, path: string): Promise<Page | null> {
    return this.db.collection<Page>('builder6_pages').findOne({ projectId, path });
  }
}
