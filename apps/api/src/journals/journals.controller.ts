import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JournalsService } from './journals.service.js';
import { CreateJournalDto } from './dto/create-journal.dto.js';
import { UpdateJournalDto } from './dto/update-journal.dto.js';

@Controller('journals')
export class JournalsController {
  constructor(private readonly journalsService: JournalsService) {}

  @Post()
  create(@Body() createJournalDto: CreateJournalDto) {
    return this.journalsService.create(createJournalDto);
  }

  @Get()
  findAll() {
    return this.journalsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.journalsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJournalDto: UpdateJournalDto) {
    return this.journalsService.update(+id, updateJournalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.journalsService.remove(+id);
  }
}
