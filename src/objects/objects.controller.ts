import { Controller, Get, Post, Put, Delete, Body, Param, Render, Res, NotFoundException, Query } from '@nestjs/common';
import { Response } from 'express';
import { ObjectsService } from './objects.service';
import { Builder6Object } from './schemas/object.schema';
import { ProjectService } from '../projects/project.service';

@Controller('app/:projectSlug/objects')
export class ObjectsController {
  constructor(
    private readonly objectsService: ObjectsService,
    private readonly projectService: ProjectService
  ) {}

  @Get()
  @Render('objects/index')
  async index(@Param('projectSlug') projectSlug: string) {
    const project = await this.projectService.resolve(projectSlug);
    if (!project) {
        throw new NotFoundException('Project not found');
    }

    const objects = await this.objectsService.findAll('mock-user-id', project._id!);

    return {
      user: { name: 'Developer' },
      project: project,
      objects,
      projectId: project._id 
    };
  }

  @Get('new')
  @Render('objects/editor')
  async newObject(@Param('projectSlug') projectSlug: string) {
    const project = await this.projectService.resolve(projectSlug);
    
    if (!project) {
        throw new NotFoundException('Project not found');
    }
    
    return {
      user: { name: 'Developer' },
      project: project,
      isNew: true,
      projectId: project._id
    };
  }

  @Get(':id')
  @Render('objects/editor')
  async editObject(@Param('id') id: string, @Param('projectSlug') projectSlug: string) {
    // Note: :id can be 'new' if route matched improperly, but 'new' is handled above.
    
    if (id === 'new') return this.newObject(projectSlug); // Fallback if needed, though Order matters
    
    const project = await this.projectService.resolve(projectSlug);

    if (!project) {
        throw new NotFoundException('Project not found');
    }

    const obj = await this.objectsService.findOne(id);

    return {
      user: { name: 'Developer' },
      project: project,
      object: obj,
      isNew: false,
      projectId: project._id
    };
  }

  @Post()
  async create(@Body() body: Partial<Builder6Object>) {
    return this.objectsService.create('mock-user-id', body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Builder6Object>) {
    return this.objectsService.update(id, 'mock-user-id', body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.objectsService.delete(id, 'mock-user-id');
  }

  @Post('generate')
  async generate(@Body('prompt') prompt: string) {
    return this.objectsService.generateSchema(prompt);
  }
}

