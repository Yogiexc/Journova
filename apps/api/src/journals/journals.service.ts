import { Injectable } from '@nestjs/common';
import { CreateJournalDto } from './dto/create-journal.dto.js';
import { UpdateJournalDto } from './dto/update-journal.dto.js';

@Injectable()
export class JournalsService {
  create(createJournalDto: CreateJournalDto) {
    return 'This action adds a new journal';
  }

  findAll() {
    return `This action returns all journals`;
  }

  findOne(id: number) {
    return `This action returns a #${id} journal`;
  }

  update(id: number, updateJournalDto: UpdateJournalDto) {
    return `This action updates a #${id} journal`;
  }

  remove(id: number) {
    return `This action removes a #${id} journal`;
  }
}
