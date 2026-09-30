# Job Application Tracker

A full-stack job application tracker built with FastAPI and React, deployed
to AWS ECS Fargate using Terraform.

**Status:** 🚧 Backend complete, frontend + infra in progress

## Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, SQLAlchemy 2.0, Pydantic v2 |
| Database | PostgreSQL 16 |
| Auth | JWT (python-jose + bcrypt) |
| Frontend | React + Vite (coming soon) |
| Container | Docker (multi-stage) |
| Infra | Terraform → AWS ECS Fargate, RDS, ALB (coming soon) |

## Local Development

```bash
docker compose up --build
API is at http://localhost:8000 — docs at http://localhost:8000/docs

Features
User registration and login (JWT)

Company management

Application tracking with statuses (wishlist, applied, interview, offer, rejected)

Interview scheduling per application

Strict ownership isolation (users can only see their own data)

Roadmap
☑ Backend API with auth and CRUD
☑ Docker Compose for local dev
□ React frontend (kanban board)
□ Terraform: VPC, RDS, ECR, ECS, ALB
□ Deploy to AWS
□ Autoscaling
