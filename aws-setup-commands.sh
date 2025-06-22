#!/bin/bash
# AWS CLI commands to set up RDS Security Group for SyncUp

# Your current public IP - REPLACE WITH YOUR ACTUAL IP
YOUR_IP="YOUR_PUBLIC_IP_HERE"

# Get default VPC ID
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query 'Vpcs[0].VpcId' --output text)
echo "Using VPC: $VPC_ID"

# Create Security Group
SG_ID=$(aws ec2 create-security-group \
  --group-name syncup-rds-sg \
  --description "Security group for SyncUp PostgreSQL RDS" \
  --vpc-id $VPC_ID \
  --query 'GroupId' \
  --output text)

echo "Created Security Group: $SG_ID"

# Add rule for your development machine
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 5432 \
  --cidr ${YOUR_IP}/32

echo "Added rule for your IP: ${YOUR_IP}/32"

# Add rule for AWS internal services (10.0.0.0/8)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 5432 \
  --cidr 10.0.0.0/8

echo "Added rule for AWS internal services: 10.0.0.0/8"

# Display the security group details
echo "Security Group created successfully:"
aws ec2 describe-security-groups --group-ids $SG_ID

echo ""
echo "🎯 Next Steps:"
echo "1. Copy this Security Group ID: $SG_ID"
echo "2. Use it when creating your RDS instance"
echo "3. Or attach it to existing RDS instance"