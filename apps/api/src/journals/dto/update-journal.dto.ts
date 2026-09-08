import { PartialType } from '@nestjs/mapped-types';
import { CreateJournalDto } from './create-journal.dto.js';

export class UpdateJournalDto extends PartialType(CreateJournalDto) {}
