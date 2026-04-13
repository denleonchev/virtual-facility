import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { Repository } from 'typeorm';
import { Building } from './entities/building.entity';
import { CreateWorkflowDto } from '@app/workflows';
import { InjectRepository } from '@nestjs/typeorm';
import { Workflow } from 'apps/workflows-service/src/workflows/entities/workflow.entity';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
  ) {}
  async create(createBuildingDto: CreateBuildingDto) {
    await this.createWorkflow(1);
    const building = this.buildingRepository.create(createBuildingDto);

    return this.buildingRepository.save(building);
  }

  findAll() {
    return this.buildingRepository.find();
  }

  findOne(id: number) {
    return this.buildingRepository.findOne({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateBuildingDto: UpdateBuildingDto) {
    const building = await this.buildingRepository.preload({
      id,
      ...updateBuildingDto,
    });

    if (!building) {
      throw new NotFoundException(`No building with id ${id}`);
    }
    return this.buildingRepository.save(building);
  }

  async remove(id: number) {
    const building = await this.findOne(id);
    if (!building) {
      throw new NotFoundException(`No building with id ${id}`);
    }
    return this.buildingRepository.remove(building);
  }

  async createWorkflow(buildingId: number) {
    const res = await fetch('http://workflows-service:3001/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'My Workflow',
        buildingId,
      } as CreateWorkflowDto),
    });
    const workflow = (await res.json()) as Workflow;
    console.log('new workflow', workflow);

    return workflow;
  }
}
