output "execution_role_arn" {
  description = "Task execution role ARN (image pull + secrets + logs)"
  value       = aws_iam_role.execution.arn
}

output "task_role_arn" {
  description = "Task role ARN (used by the app at runtime)"
  value       = aws_iam_role.task.arn
}
