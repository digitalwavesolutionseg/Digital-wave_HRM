import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateJobPostDto } from "./dto/create-job-post.dto";
import { UpdateJobPostDto } from "./dto/update-job-post.dto";
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { UpdateCandidateDto } from "./dto/update-candidate.dto";
import { CreateInterviewDto } from "./dto/create-interview.dto";
import { UpdateInterviewDto } from "./dto/update-interview.dto";

@Injectable()
export class RecruitmentService {
  constructor(private prisma: PrismaService) {}

  findAllJobPosts(query: any) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.departmentId) where.departmentId = query.departmentId;
    return this.prisma.jobPost.findMany({
      where,
      include: {
        department: true,
        _count: { select: { candidates: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findJobPost(id: string) {
    return this.prisma.jobPost.findUnique({
      where: { id },
      include: {
        department: true,
        candidates: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            stage: true,
          },
        },
      },
    });
  }

  createJobPost(dto: CreateJobPostDto) {
    return this.prisma.jobPost.create({
      data: dto,
      include: { department: true },
    });
  }

  async updateJobPost(id: string, dto: UpdateJobPostDto) {
    await this.ensureJobPost(id);
    return this.prisma.jobPost.update({
      where: { id },
      data: dto,
      include: { department: true },
    });
  }

  async removeJobPost(id: string) {
    await this.ensureJobPost(id);
    await this.prisma.jobPost.delete({ where: { id } });
    return { success: true };
  }

  findAllCandidates(query: any) {
    const where: any = {};
    if (query.stage) where.stage = query.stage;
    if (query.jobPostId) where.jobPostId = query.jobPostId;
    return this.prisma.candidate.findMany({
      where,
      include: {
        jobPost: { select: { id: true, title: true } },
        _count: { select: { interviews: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findCandidate(id: string) {
    return this.prisma.candidate.findUnique({
      where: { id },
      include: {
        jobPost: { select: { id: true, title: true } },
        interviews: true,
      },
    });
  }

  createCandidate(dto: CreateCandidateDto) {
    return this.prisma.candidate.create({
      data: dto,
      include: { jobPost: true },
    });
  }

  async updateCandidate(id: string, dto: UpdateCandidateDto) {
    await this.ensureCandidate(id);
    return this.prisma.candidate.update({
      where: { id },
      data: dto,
      include: { jobPost: true },
    });
  }

  async removeCandidate(id: string) {
    await this.ensureCandidate(id);
    await this.prisma.candidate.delete({ where: { id } });
    return { success: true };
  }

  findAllInterviews(query: any) {
    const where: any = {};
    if (query.candidateId) where.candidateId = query.candidateId;
    if (query.status) where.status = query.status;
    return this.prisma.interview.findMany({
      where,
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        interviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });
  }

  findInterview(id: string) {
    return this.prisma.interview.findUnique({
      where: { id },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        interviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  createInterview(dto: CreateInterviewDto) {
    return this.prisma.interview.create({
      data: {
        candidateId: dto.candidateId,
        interviewerId: dto.interviewerId,
        scheduledAt: new Date(dto.scheduledAt),
        type: dto.type,
        feedback: dto.feedback,
        status: dto.status,
      },
      include: { candidate: true, interviewer: true },
    });
  }

  async updateInterview(id: string, dto: UpdateInterviewDto) {
    await this.ensureInterview(id);
    const data: any = {};
    if (dto.candidateId !== undefined) data.candidateId = dto.candidateId;
    if (dto.interviewerId !== undefined) data.interviewerId = dto.interviewerId;
    if (dto.scheduledAt) data.scheduledAt = new Date(dto.scheduledAt);
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.feedback !== undefined) data.feedback = dto.feedback;
    if (dto.status !== undefined) data.status = dto.status;
    return this.prisma.interview.update({
      where: { id },
      data,
      include: { candidate: true, interviewer: true },
    });
  }

  async removeInterview(id: string) {
    await this.ensureInterview(id);
    await this.prisma.interview.delete({ where: { id } });
    return { success: true };
  }

  private async ensureJobPost(id: string) {
    const jobPost = await this.prisma.jobPost.findUnique({ where: { id } });
    if (!jobPost) {
      throw new NotFoundException("Job post not found");
    }
    return jobPost;
  }

  private async ensureCandidate(id: string) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id } });
    if (!candidate) {
      throw new NotFoundException("Candidate not found");
    }
    return candidate;
  }

  private async ensureInterview(id: string) {
    const interview = await this.prisma.interview.findUnique({ where: { id } });
    if (!interview) {
      throw new NotFoundException("Interview not found");
    }
    return interview;
  }
}