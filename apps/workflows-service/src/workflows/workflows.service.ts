import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Workflow } from './entities/workflow.entity';
import { CreateWorkflowDto, UpdateWorkflowDto } from '@app/workflows';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
  ) {}
  async create(createWorkflowDto: CreateWorkflowDto) {
    const workflow = this.workflowRepository.create(createWorkflowDto);
    const newWorkflow = await this.workflowRepository.save(workflow);
    this.logger.debug(
      `Created workflow with id ${newWorkflow.id} for the building ${newWorkflow.buildingId}`,
    );
    return newWorkflow;
  }

  findAll() {
    return this.workflowRepository.find();
  }

  findOne(id: number) {
    return this.workflowRepository.findOne({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateWorkflowDto: UpdateWorkflowDto) {
    const workflow = await this.workflowRepository.preload({
      id,
      ...updateWorkflowDto,
    });

    if (!workflow) {
      throw new NotFoundException(`No workflow with id ${id}`);
    }
    return this.workflowRepository.save(workflow);
  }

  async remove(id: number) {
    const workflow = await this.findOne(id);
    if (!workflow) {
      throw new NotFoundException(`No workflow with id ${id}`);
    }
    return this.workflowRepository.remove(workflow);
  }
}
