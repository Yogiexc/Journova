import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { SubmitReviewDto } from './dto/submit-review.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('api/v1/reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('assignments')
  findAllAssignments(@Request() req: any) {
    return this.reviewsService.findAll(req.user.id);
  }

  @Get('assignments/:id')
  findOneAssignment(@Request() req: any, @Param('id') id: string) {
    return this.reviewsService.findOne(req.user.id, id);
  }

  @Post('assignments/:id/accept')
  acceptAssignment(@Request() req: any, @Param('id') id: string) {
    return this.reviewsService.accept(req.user.id, id);
  }

  @Post('assignments/:id/decline')
  declineAssignment(@Request() req: any, @Param('id') id: string) {
    return this.reviewsService.decline(req.user.id, id);
  }

  @Post('assignments/:id/submit')
  submitReview(@Request() req: any, @Param('id') id: string, @Body() submitReviewDto: SubmitReviewDto) {
    return this.reviewsService.submitReview(req.user.id, id, submitReviewDto);
  }
}
