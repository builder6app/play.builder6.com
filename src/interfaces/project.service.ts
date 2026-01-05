import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Db } from 'mongodb';
import { Project } from './schemas/project.schema';

@Injectable()
export class ProjectService {
  constructor(@Inject('DATABASE_CONNECTION') private db: Db) {}

  private generateId(length = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async create(userId: string, name: string, description?: string): Promise<Project> {
    const now = new Date();
    const id = this.generateId();
    const project: Project = {
      _id: id,
      name,
      description,
      slug: id,
      owner: userId,
      created: now,
      created_by: userId,
      modified: now,
      modified_by: userId,
    };
    await this.db.collection<Project>('builder6_projects').insertOne(project);
    return project;
  }

  async findAll(userId: string): Promise<Project[]> {
    return this.db.collection<Project>('builder6_projects')
      .find({ owner: userId })
      .sort({ modified: -1 })
      .toArray();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.db.collection<Project>('builder6_projects').findOne({ _id: id });
    if (!project) {
      throw new NotFoundException(`Project #${id} not found`);
    }
    return project;
  }

  async findBySlug(slug: string): Promise<Project | null> {
    return this.db.collection<Project>('builder6_projects').findOne({ slug });
  }

  async update(id: string, userId: string, updateData: Partial<Project>): Promise<Project> {
    const now = new Date();
    await this.db.collection<Project>('builder6_projects').updateOne(
      { _id: id, owner: userId },
      { 
        $set: { 
          ...updateData,
          modified: now,
          modified_by: userId
        } 
      }
    );
    return this.findOne(id);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.db.collection<Project>('builder6_projects').deleteOne({ _id: id, owner: userId });
  }
}
