output "alb_url" {
  description = "🌐 Public API URL (also used by the frontend)"
  value       = module.alb.alb_url
}

output "website_url" {
  description = "🌐 Frontend website URL"
  value       = "http://${module.s3_website.website_endpoint}"
}

output "ecr_repository_url" {
  description = "📦 Push Docker images here"
  value       = module.ecr.repository_url
}

output "ecs_cluster_name" {
  value = module.ecs.cluster_name
}

output "ecs_service_name" {
  value = module.ecs.service_name
}

output "rds_endpoint" {
  description = "RDS endpoint (not publicly accessible)"
  value       = module.rds.endpoint
  sensitive   = true
}
