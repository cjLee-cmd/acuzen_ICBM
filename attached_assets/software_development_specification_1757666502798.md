aiCommand
  .command('status')
  .description('Check AI model status and performance')
  .action(async () => {
    try {
      console.log('🤖 AI Model Status Report');
      console.log('========================\n');
      
      const models = await aiModelManager.getAllModels();
      
      for (const model of models) {
        console.log(`📋 Model: ${model.name}`);
        console.log(`   Version: ${model.version}`);
        console.log(`   Status: ${model.status}`);
        console.log(`   Accuracy: ${(model.accuracy * 100).toFixed(2)}%`);
        console.log(`   Last Updated: ${model.lastUpdated}`);
        console.log(`   Performance: ${model.avgResponseTime}ms avg response time`);
        console.log('');
      }
      
    } catch (error) {
      console.error('❌ Failed to get AI model status:', error);
      process.exit(1);
    }
  });

aiCommand
  .command('retrain')
  .option('-m, --model <name>', 'Model name to retrain')
  .option('-d, --data <path>', 'Training data path')
  .description('Retrain AI model with new data')
  .action(async (options) => {
    try {
      if (!options.model) {
        console.error('❌ Model name is required');
        process.exit(1);
      }
      
      console.log(`🔄 Starting retraining for model: ${options.model}`);
      
      const retrainingJob = await aiModelManager.retrainModel(options.model, {
        dataPath: options.data,
        validationSplit: 0.2,
        batchSize: 32,
        epochs: 10
      });
      
      console.log(`✅ Retraining job started: ${retrainingJob.id}`);
      console.log(`📊 Progress can be monitored at: /admin/ai/jobs/${retrainingJob.id}`);
      
    } catch (error) {
      console.error('❌ Model retraining failed:', error);
      process.exit(1);
    }
  });

aiCommand
  .command('deploy')
  .option('-m, --model <name>', 'Model name to deploy')
  .option('-v, --version <version>', 'Model version to deploy')
  .option('--canary <percentage>', 'Canary deployment percentage', '10')
  .description('Deploy AI model to production')
  .action(async (options) => {
    try {
      if (!options.model) {
        console.error('❌ Model name is required');
        process.exit(1);
      }
      
      console.log(`🚀 Deploying model: ${options.model}@${options.version || 'latest'}`);
      
      const deployment = await aiModelManager.deployModel({
        modelName: options.model,
        version: options.version,
        strategy: 'canary',
        canaryPercentage: parseInt(options.canary)
      });
      
      console.log(`✅ Model deployed successfully`);
      console.log(`🎯 Canary deployment: ${options.canary}% traffic`);
      console.log(`📈 Monitor deployment at: /admin/ai/deployments/${deployment.id}`);
      
    } catch (error) {
      console.error('❌ Model deployment failed:', error);
      process.exit(1);
    }
  });

// 사용자 관리 명령어
const userCommand = program.command('user').description('User management commands');

userCommand
  .command('create')
  .option('-e, --email <email>', 'User email')
  .option('-r, --role <role>', 'User role', 'USER')
  .option('-o, --org <organization>', 'Organization')
  .description('Create new user')
  .action(async (options) => {
    try {
      if (!options.email) {
        console.error('❌ Email is required');
        process.exit(1);
      }
      
      // 임시 패스워드 생성
      const tempPassword = encryptionService.generateRandomString(12);
      const hashedPassword = await encryptionService.hashPassword(tempPassword);
      
      const user = await prisma.user.create({
        data: {
          email: options.email,
          role: options.role.toUpperCase(),
          organization: options.org,
          password: hashedPassword,
          isActive: true,
          createdAt: new Date()
        }
      });
      
      console.log('✅ User created successfully');
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Temporary password: ${tempPassword}`);
      console.log(`👤 Role: ${user.role}`);
      console.log('⚠️  Please ask user to change password on first login');
      
    } catch (error) {
      console.error('❌ User creation failed:', error);
      process.exit(1);
    }
  });

userCommand
  .command('list')
  .option('-r, --role <role>', 'Filter by role')
  .option('-a, --active', 'Show only active users')
  .description('List users')
  .action(async (options) => {
    try {
      const whereClause: any = {};
      
      if (options.role) {
        whereClause.role = options.role.toUpperCase();
      }
      
      if (options.active) {
        whereClause.isActive = true;
      }
      
      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          role: true,
          organization: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log(`👥 Found ${users.length} users:\n`);
      
      users.forEach(user => {
        console.log(`📧 ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Organization: ${user.organization || 'N/A'}`);
        console.log(`   Status: ${user.isActive ? '✅ Active' : '❌ Inactive'}`);
        console.log(`   Last Login: ${user.lastLoginAt || 'Never'}`);
        console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
        console.log('');
      });
      
    } catch (error) {
      console.error('❌ Failed to list users:', error);
      process.exit(1);
    }
  });

// 시스템 모니터링 명령어
const monitorCommand = program.command('monitor').description('System monitoring commands');

monitorCommand
  .command('health')
  .description('Check system health')
  .action(async () => {
    try {
      console.log('🏥 System Health Check');
      console.log('===================\n');
      
      // 데이터베이스 연결 확인
      try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database: Connected');
      } catch (dbError) {
        console.log('❌ Database: Connection failed');
        console.log(`   Error: ${dbError}`);
      }
      
      // Redis 연결 확인
      try {
        const Redis = require('redis');
        const redis = Redis.createClient({ url: process.env.REDIS_URL });
        await redis.ping();
        await redis.quit();
        console.log('✅ Redis: Connected');
      } catch (redisError) {
        console.log('❌ Redis: Connection failed');
        console.log(`   Error: ${redisError}`);
      }
      
      // AI 서비스 상태 확인
      try {
        const aiStatus = await aiModelManager.getServiceHealth();
        console.log(`✅ AI Service: ${aiStatus.status}`);
        console.log(`   Models loaded: ${aiStatus.modelsLoaded}`);
        console.log(`   GPU available: ${aiStatus.gpuAvailable ? 'Yes' : 'No'}`);
      } catch (aiError) {
        console.log('❌ AI Service: Health check failed');
        console.log(`   Error: ${aiError}`);
      }
      
      // 시스템 리소스 확인
      const os = require('os');
      const totalMem = os.totalmem() / 1024 / 1024 / 1024; // GB
      const freeMem = os.freemem() / 1024 / 1024 / 1024; // GB
      const memUsage = ((totalMem - freeMem) / totalMem * 100).toFixed(1);
      
      console.log(`💻 System Resources:`);
      console.log(`   CPU Load: ${os.loadavg()[0].toFixed(2)}`);
      console.log(`   Memory Usage: ${memUsage}% (${(totalMem - freeMem).toFixed(1)}GB / ${totalMem.toFixed(1)}GB)`);
      console.log(`   Uptime: ${(os.uptime() / 3600).toFixed(1)} hours`);
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
      process.exit(1);
    }
  });

monitorCommand
  .command('performance')
  .option('-d, --days <days>', 'Number of days to analyze', '7')
  .description('Generate performance report')
  .action(async (options) => {
    try {
      const days = parseInt(options.days);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      console.log(`📊 Performance Report (Last ${days} days)`);
      console.log('=====================================\n');
      
      // 케이스 처리 통계
      const caseStats = await prisma.case.groupBy({
        by: ['status'],
        _count: { status: true },
        where: {
          createdAt: {
            gte: startDate
          }
        }
      });
      
      console.log('📋 Case Processing Statistics:');
      caseStats.forEach(stat => {
        console.log(`   ${stat.status}: ${stat._count.status} cases`);
      });
      
      // AI 처리 성능
      const aiStats = await prisma.aIPrediction.aggregate({
        _avg: {
          confidence: true,
          processingTime: true
        },
        _count: {
          id: true
        },
        where: {
          createdAt: {
            gte: startDate
          }
        }
      });
      
      console.log('\n🤖 AI Processing Performance:');
      console.log(`   Total predictions: ${aiStats._count.id}`);
      console.log(`   Average confidence: ${(aiStats._avg.confidence || 0 * 100).toFixed(2)}%`);
      console.log(`   Average processing time: ${(aiStats._avg.processingTime || 0).toFixed(2)}s`);
      
      // 에러율 계산
      const totalRequests = await prisma.auditLog.count({
        where: {
          timestamp: {
            gte: startDate
          }
        }
      });
      
      const errorRequests = await prisma.auditLog.count({
        where: {
          timestamp: {
            gte: startDate
          },
          action: {
            contains: 'ERROR'
          }
        }
      });
      
      const errorRate = totalRequests > 0 ? (errorRequests / totalRequests * 100).toFixed(2) : '0.00';
      
      console.log('\n📈 System Reliability:');
      console.log(`   Total requests: ${totalRequests}`);
      console.log(`   Error requests: ${errorRequests}`);
      console.log(`   Error rate: ${errorRate}%`);
      
    } catch (error) {
      console.error('❌ Performance report generation failed:', error);
      process.exit(1);
    }
  });

// 유지보수 명령어
const maintenanceCommand = program.command('maintenance').description('System maintenance commands');

maintenanceCommand
  .command('cleanup')
  .option('--dry-run', 'Show what would be deleted without actually deleting')
  .option('--days <days>', 'Delete logs older than specified days', '90')
  .description('Clean up old logs and temporary files')
  .action(async (options) => {
    try {
      const days = parseInt(options.days);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      console.log(`🧹 Cleanup Operation (${options.dryRun ? 'DRY RUN' : 'LIVE'})`);
      console.log(`📅 Removing data older than ${days} days (before ${cutoffDate.toISOString()})`);
      console.log('='.repeat(60));
      
      // 오래된 감사 로그 정리
      const oldAuditLogs = await prisma.auditLog.findMany({
        where: {
          timestamp: {
            lt: cutoffDate
          }
        },
        select: { id: true }
      });
      
      console.log(`📋 Found ${oldAuditLogs.length} old audit logs`);
      
      if (!options.dryRun && oldAuditLogs.length > 0) {
        await prisma.auditLog.deleteMany({
          where: {
            timestamp: {
              lt: cutoffDate
            }
          }
        });
        console.log(`✅ Deleted ${oldAuditLogs.length} audit logs`);
      }
      
      // 오래된 AI 예측 정리 (낮은 신뢰도)
      const lowConfidencePredictions = await prisma.aIPrediction.findMany({
        where: {
          createdAt: {
            lt: cutoffDate
          },
          confidence: {
            lt: 0.5
          },
          humanReviewed: false
        },
        select: { id: true }
      });
      
      console.log(`🤖 Found ${lowConfidencePredictions.length} low-confidence AI predictions`);
      
      if (!options.dryRun && lowConfidencePredictions.length > 0) {
        await prisma.aIPrediction.deleteMany({
          where: {
            createdAt: {
              lt: cutoffDate
            },
            confidence: {
              lt: 0.5
            },
            humanReviewed: false
          }
        });
        console.log(`✅ Deleted ${lowConfidencePredictions.length} low-confidence predictions`);
      }
      
      // 임시 파일 정리
      const fs = require('fs').promises;
      const path = require('path');
      const tempDir = './temp';
      
      try {
        const files = await fs.readdir(tempDir);
        let deletedFiles = 0;
        
        for (const file of files) {
          const filePath = path.join(tempDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime < cutoffDate) {
            if (!options.dryRun) {
              await fs.unlink(filePath);
            }
            deletedFiles++;
          }
        }
        
        console.log(`🗂️  Found ${deletedFiles} old temporary files`);
        if (!options.dryRun) {
          console.log(`✅ Deleted ${deletedFiles} temporary files`);
        }
        
      } catch (error) {
        console.log('⚠️  No temp directory or temp files found');
      }
      
      if (options.dryRun) {
        console.log('\n💡 This was a dry run. Use without --dry-run to actually perform cleanup.');
      } else {
        console.log('\n✅ Cleanup completed successfully');
      }
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    }
  });

maintenanceCommand
  .command('vacuum')
  .description('Optimize database storage')
  .action(async () => {
    try {
      console.log('🔄 Running database vacuum...');
      
      await prisma.$executeRawUnsafe('VACUUM ANALYZE;');
      
      console.log('✅ Database vacuum completed');
      console.log('💡 Database storage optimized and statistics updated');
      
    } catch (error) {
      console.error('❌ Database vacuum failed:', error);
      process.exit(1);
    }
  });

// 메인 실행
program.parse();

// 프로그램 종료 시 정리
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
```

### 10.2 백업 및 재해복구

#### **<코드 23>** 자동 백업 및 복구 스크립트
```bash
#!/bin/bash
# scripts/backup-restore.sh

set -e  # Exit on any error

# Configuration
BACKUP_DIR="/var/backups/icsr-ai"
S3_BUCKET="icsr-ai-backups"
RETENTION_DAYS=30
LOG_FILE="/var/log/icsr-ai-backup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Database backup function
backup_database() {
    log "Starting database backup..."
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="$BACKUP_DIR/db_backup_$timestamp.sql"
    local compressed_file="$backup_file.gz"
    
    # Create database dump
    if pg_dump "$DATABASE_URL" > "$backup_file"; then
        success "Database dump created: $backup_file"
    else
        error "Failed to create database dump"
        return 1
    fi
    
    # Compress backup
    if gzip "$backup_file"; then
        success "Backup compressed: $compressed_file"
    else
        error "Failed to compress backup"
        return 1
    fi
    
    # Encrypt backup
    local encrypted_file="$compressed_file.enc"
    if openssl enc -aes-256-cbc -salt -in "$compressed_file" -out "$encrypted_file" -pass pass:"$BACKUP_ENCRYPTION_KEY"; then
        success "Backup encrypted: $encrypted_file"
        rm "$compressed_file"  # Remove unencrypted version
    else
        error "Failed to encrypt backup"
        return 1
    fi
    
    # Upload to S3
    if aws s3 cp "$encrypted_file" "s3://$S3_BUCKET/database/"; then
        success "Backup uploaded to S3"
    else
        error "Failed to upload backup to S3"
        return 1
    fi
    
    echo "$encrypted_file"
}

# File storage backup function
backup_files() {
    log "Starting file storage backup..."
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="$BACKUP_DIR/files_backup_$timestamp.tar.gz"
    
    # Create tar archive of important files
    if tar -czf "$backup_file" \
        -C / \
        var/uploads \
        var/models \
        etc/ssl/certs \
        --exclude='*.tmp' \
        --exclude='*.log'; then
        success "File backup created: $backup_file"
    else
        error "Failed to create file backup"
        return 1
    fi
    
    # Encrypt file backup
    local encrypted_file="$backup_file.enc"
    if openssl enc -aes-256-cbc -salt -in "$backup_file" -out "$encrypted_file" -pass pass:"$BACKUP_ENCRYPTION_KEY"; then
        success "File backup encrypted: $encrypted_file"
        rm "$backup_file"  # Remove unencrypted version
    else
        error "Failed to encrypt file backup"
        return 1
    fi
    
    # Upload to S3
    if aws s3 cp "$encrypted_file" "s3://$S3_BUCKET/files/"; then
        success "File backup uploaded to S3"
    else
        error "Failed to upload file backup to S3"
        return 1
    fi
    
    echo "$encrypted_file"
}

# Configuration backup function
backup_config() {
    log "Starting configuration backup..."
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="$BACKUP_DIR/config_backup_$timestamp.tar.gz"
    
    # Backup Kubernetes configs, environment files, etc.
    if tar -czf "$backup_file" \
        -C / \
        etc/kubernetes \
        opt/icsr-ai/config \
        home/admin/.env.production; then
        success "Configuration backup created: $backup_file"
    else
        error "Failed to create configuration backup"
        return 1
    fi
    
    # Upload to S3
    if aws s3 cp "$backup_file" "s3://$S3_BUCKET/config/"; then
        success "Configuration backup uploaded to S3"
    else
        error "Failed to upload configuration backup to S3"
        return 1
    fi
    
    echo "$backup_file"
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Local cleanup
    find "$BACKUP_DIR" -name "*.enc" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    success "Local old backups cleaned up"
    
    # S3 cleanup (lifecycle policy should handle this, but double-check)
    local cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)
    aws s3api list-objects-v2 --bucket "$S3_BUCKET" --query "Contents[?LastModified<'$cutoff_date'].Key" --output text | \
    while read -r key; do
        if [ -n "$key" ]; then
            aws s3 rm "s3://$S3_BUCKET/$key"
            log "Deleted old S3 backup: $key"
        fi
    done
    
    success "S3 old backups cleaned up"
}

# Database restore function
restore_database() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        error "Backup file path is required for restore"
        return 1
    fi
    
    log "Starting database restore from: $backup_file"
    
    # Check if file exists
    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
        return 1
    fi
    
    # Decrypt backup
    local decrypted_file="${backup_file%.enc}"
    if openssl enc -aes-256-cbc -d -in "$backup_file" -out "$decrypted_file" -pass pass:"$BACKUP_ENCRYPTION_KEY"; then
        success "Backup decrypted successfully"
    else
        error "Failed to decrypt backup"
        return 1
    fi
    
    # Decompress backup
    local sql_file="${decrypted_file%.gz}"
    if gunzip "$decrypted_file"; then
        success "Backup decompressed successfully"
    else
        error "Failed to decompress backup"
        return 1
    fi
    
    # Create confirmation prompt
    warning "⚠️  This will COMPLETELY REPLACE the current database!"
    warning "Current database will be backed up before restore."
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        log "Restore cancelled by user"
        return 1
    fi
    
    # Backup current database before restore
    log "Creating safety backup of current database..."
    local safety_backup="$BACKUP_DIR/safety_backup_$(date +%Y%m%d_%H%M%S).sql"
    if pg_dump "$DATABASE_URL" > "$safety_backup"; then
        success "Safety backup created: $safety_backup"
    else
        error "Failed to create safety backup"
        return 1
    fi
    
    # Stop application services
    log "Stopping application services..."
    kubectl scale deployment/icsr-ai-backend --replicas=0 -n icsr-ai-prod
    kubectl scale deployment/icsr-ai-frontend --replicas=0 -n icsr-ai-prod
    
    # Wait for pods to stop
    sleep 30
    
    # Drop and recreate database
    log "Recreating database..."
    if psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"; then
        success "Database schema recreated"
    else
        error "Failed to recreate database schema"
        return 1
    fi
    
    # Restore from backup
    log "Restoring database from backup..."
    if psql "$DATABASE_URL" < "$sql_file"; then
        success "Database restored successfully"
    else
        error "Failed to restore database"
        
        # Attempt to restore safety backup
        warning "Attempting to restore from safety backup..."
        psql "$DATABASE_URL" < "$safety_backup"
        return 1
    fi
    
    # Restart application services
    log "Restarting application services..."
    kubectl scale deployment/icsr-ai-backend --replicas=3 -n icsr-ai-prod
    kubectl scale deployment/icsr-ai-frontend --replicas=2 -n icsr-ai-prod
    
    # Wait for services to be ready
    kubectl wait --for=condition=available --timeout=300s deployment/icsr-ai-backend -n icsr-ai-prod
    kubectl wait --for=condition=available --timeout=300s deployment/icsr-ai-frontend -n icsr-ai-prod
    
    # Cleanup temporary files
    rm -f "$sql_file"
    
    success "Database restore completed successfully"
}

# Health check after restore
health_check() {
    log "Performing post-restore health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "https://api.icsr-ai.company.com/health" > /dev/null; then
            success "Application health check passed"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, retrying in 10s..."
        sleep 10
        ((attempt++))
    done
    
    error "Application failed health check after restore"
    return 1
}

# Send notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # Slack notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🔄 ICSR-AI Backup Report\\n*Status:* $status\\n*Message:* $message\\n*Time:* $(date)\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
    
    # Email notification (requires mailutils)
    if command -v mail >/dev/null 2>&1 && [ -n "$NOTIFICATION_EMAIL" ]; then
        echo "$message" | mail -s "ICSR-AI Backup Report - $status" "$NOTIFICATION_EMAIL"
    fi
}

# Main backup function
run_backup() {
    log "========== Starting ICSR-AI System Backup =========="
    
    local overall_status="SUCCESS"
    local error_messages=()
    
    # Database backup
    if ! db_backup_file=$(backup_database); then
        overall_status="PARTIAL_FAILURE"
        error_messages+=("Database backup failed")
    fi
    
    # File backup
    if ! file_backup_file=$(backup_files); then
        overall_status="PARTIAL_FAILURE"
        error_messages+=("File backup failed")
    fi
    
    # Configuration backup
    if ! config_backup_file=$(backup_config); then
        overall_status="PARTIAL_FAILURE"
        error_messages+=("Configuration backup failed")
    fi
    
    # Cleanup
    cleanup_old_backups
    
    # Generate backup report
    local backup_report="Backup Summary:\n"
    backup_report+="- Database: ${db_backup_file:-FAILED}\n"
    backup_report+="- Files: ${file_backup_file:-FAILED}\n"
    backup_report+="- Config: ${config_backup_file:-FAILED}\n"
    
    if [ ${#error_messages[@]} -gt 0 ]; then
        backup_report+="Errors:\n"
        printf '%s\n' "${error_messages[@]}" | sed 's/^/- /' >> /tmp/backup_report
        backup_report+="$(cat /tmp/backup_report)"
        rm -f /tmp/backup_report
    fi
    
    log "========== Backup Completed with status: $overall_status =========="
    
    # Send notification
    send_notification "$overall_status" "$backup_report"
    
    if [ "$overall_status" = "SUCCESS" ]; then
        return 0
    else
        return 1
    fi
}

# Command line interface
case "$1" in
    "backup")
        run_backup
        ;;
    "restore")
        if [ -z "$2" ]; then
            error "Usage: $0 restore <backup_file_path>"
            exit 1
        fi
        restore_database "$2"
        health_check
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    "health")
        health_check
        ;;
    *)
        echo "Usage: $0 {backup|restore <file>|cleanup|health}"
        echo ""
        echo "Commands:"
        echo "  backup  - Run full system backup"
        echo "  restore - Restore from backup file"
        echo "  cleanup - Clean up old backup files"
        echo "  health  - Check application| **데이터 암호화** | 저장/전송 중 암호화 | AES-256, TLS 1.3 | FIPS 140-2 |
| **접근 제어** | 역할 기반 접근 제어 | RBAC, 최소 권한 원칙 | NIST 800-53 |
| **개인정보 보호** | PII 익명화/가명처리 | 해시, 토큰화 | GDPR, HIPAA |
| **감사 추적** | 모든 활동 로깅 | 변조 방지 로그 | SOX, CFR 21 Part 11 |
| **네트워크 보안** | 침입 탐지/차단 | WAF, IDS/IPS | PCI DSS |
| **취약점 관리** | 정기 보안 스캔 | SAST, DAST, SCA | OWASP Top 10 |

#### **<코드 20>** 보안 미들웨어 구현
```typescript
// src/middleware/securityMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { RedisClient } from '../utils/redis';

export class SecurityMiddleware {
  private redis: RedisClient;

  constructor() {
    this.redis = new RedisClient();
  }

  // Helmet 보안 헤더 설정
  static securityHeaders() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
          fontSrc: ["'self'", 'fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: []
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      frameguard: { action: 'deny' },
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    });
  }

  // API 속도 제한
  static createRateLimiter(windowMs: number = 15 * 60 * 1000, max: number = 100) {
    return rateLimit({
      windowMs,
      max,
      message: {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // 헬스 체크 등 특정 엔드포인트는 제외
        const skipPaths = ['/health', '/metrics'];
        return skipPaths.includes(req.path);
      },
      keyGenerator: (req) => {
        // IP 주소와 사용자 ID 조합으로 키 생성
        const userId = req.user?.id || 'anonymous';
        return `${req.ip}:${userId}`;
      }
    });
  }

  // JWT 토큰 검증 미들웨어
  static authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Access token required', 401);
    }

    jwt.verify(token, process.env.JWT_SECRET!, async (err, decoded) => {
      if (err) {
        logger.logSecurityEvent('Invalid JWT token', 'medium', {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          token: token.substring(0, 10) + '...' // 부분만 로깅
        });
        throw new AppError('Invalid or expired token', 403);
      }

      const payload = decoded as any;
      
      // 토큰 블랙리스트 확인
      const isBlacklisted = await SecurityMiddleware.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new AppError('Token has been revoked', 403);
      }

      // 사용자 정보 설정
      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        senderID: payload.senderID,
        permissions: payload.permissions || []
      };

      // 토큰 활동 기록
      logger.info('Token authenticated', {
        userId: payload.sub,
        tokenId: payload.jti,
        ip: req.ip
      });

      next();
    });
  }

  // 역할 기반 접근 제어
  static requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      if (!roles.includes(req.user.role)) {
        logger.logSecurityEvent('Unauthorized role access attempt', 'high', {
          userId: req.user.id,
          requiredRoles: roles,
          actualRole: req.user.role,
          path: req.path,
          ip: req.ip
        });
        throw new AppError('Insufficient permissions', 403);
      }

      next();
    };
  }

  // 권한 기반 접근 제어
  static requirePermission(...permissions: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user?.permissions) {
        throw new AppError('Permissions not found', 403);
      }

      const hasPermission = permissions.every(permission => 
        req.user.permissions.includes(permission)
      );

      if (!hasPermission) {
        logger.logSecurityEvent('Unauthorized permission access attempt', 'high', {
          userId: req.user.id,
          requiredPermissions: permissions,
          actualPermissions: req.user.permissions,
          path: req.path,
          ip: req.ip
        });
        throw new AppError('Insufficient permissions', 403);
      }

      next();
    };
  }

  // 입력 검증 및 살균
  static validateAndSanitize = {
    // 이메일 검증
    email: body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),

    // 패스워드 검증
    password: body('password')
      .isLength({ min: 8, max: 128 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must be 8-128 characters with uppercase, lowercase, number, and special character'),

    // 사용자 입력 살균
    sanitizeString: body('*')
      .trim()
      .escape(),

    // SQL 인젝션 방지
    preventSQLInjection: body('*').custom((value) => {
      if (typeof value === 'string') {
        const sqlPatterns = [
          /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
          /(\b(UNION|OR|AND)\b.*\b(SELECT|INSERT|UPDATE|DELETE)\b)/i,
          /(--|\/\*|\*\/|;)/,
          /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/i
        ];

        for (const pattern of sqlPatterns) {
          if (pattern.test(value)) {
            throw new Error('Potentially malicious input detected');
          }
        }
      }
      return true;
    }),

    // XSS 방지
    preventXSS: body('*').custom((value) => {
      if (typeof value === 'string') {
        const xssPatterns = [
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi
        ];

        for (const pattern of xssPatterns) {
          if (pattern.test(value)) {
            throw new Error('XSS attempt detected');
          }
        }
      }
      return true;
    })
  };

  // 검증 오류 처리
  static handleValidationErrors(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      logger.logSecurityEvent('Input validation failed', 'medium', {
        errors: errors.array(),
        ip: req.ip,
        path: req.path,
        userId: req.user?.id
      });

      throw new AppError('Input validation failed', 400, errors.array());
    }

    next();
  }

  // CSRF 토큰 생성
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // CSRF 토큰 검증
  static verifyCSRFToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionToken = req.session?.csrfToken;

    if (!token || !sessionToken || token !== sessionToken) {
      logger.logSecurityEvent('CSRF token validation failed', 'high', {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        userId: req.user?.id
      });
      throw new AppError('Invalid CSRF token', 403);
    }

    next();
  }

  // 토큰 블랙리스트 확인
  private static async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const redis = new RedisClient();
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const isBlacklisted = await redis.client.exists(`blacklist:${tokenHash}`);
      return isBlacklisted === 1;
    } catch (error) {
      logger.error('Failed to check token blacklist', error);
      return false; // 에러 시 안전한 방향으로 처리
    }
  }

  // 토큰 블랙리스트 추가
  static async blacklistToken(token: string, expirationTime: number): Promise<void> {
    try {
      const redis = new RedisClient();
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await redis.client.setex(`blacklist:${tokenHash}`, expirationTime, 'true');
      
      logger.logSecurityEvent('Token blacklisted', 'low', {
        tokenHash: tokenHash.substring(0, 16) + '...',
        expiration: expirationTime
      });
    } catch (error) {
      logger.error('Failed to blacklist token', error);
    }
  }

  // IP 주소 기반 지역 차단
  static blockGeoLocation(blockedCountries: string[] = []) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // IP 지역 조회 서비스 (예: MaxMind GeoIP)
        const geoInfo = await this.getGeoLocation(req.ip);
        
        if (blockedCountries.includes(geoInfo.country)) {
          logger.logSecurityEvent('Blocked geographical access', 'medium', {
            ip: req.ip,
            country: geoInfo.country,
            city: geoInfo.city
          });
          
          throw new AppError('Access denied from this location', 403);
        }
        
        next();
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        // 지역 조회 실패 시 통과 (서비스 가용성 우선)
        next();
      }
    };
  }

  private static async getGeoLocation(ip: string): Promise<{country: string, city: string}> {
    // 실제 구현에서는 MaxMind GeoIP2 또는 다른 서비스 사용
    return { country: 'US', city: 'Unknown' };
  }

  // 의심스러운 활동 탐지
  static detectSuspiciousActivity() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];
      const path = req.path;

      // 의심스러운 패턴들
      const suspiciousPatterns = [
        // 짧은 시간 내 대량 요청
        { type: 'rapid_requests', threshold: 50, window: 60 },
        // 다양한 IP에서 동일 계정 접근
        { type: 'multiple_ips', threshold: 5, window: 300 },
        // 비정상적인 시간대 접근
        { type: 'unusual_hours', threshold: 1, window: 3600 }
      ];

      try {
        for (const pattern of suspiciousPatterns) {
          const isSuspicious = await this.checkSuspiciousPattern(
            pattern, userId, ip, userAgent, path
          );
          
          if (isSuspicious) {
            logger.logSecurityEvent(`Suspicious activity detected: ${pattern.type}`, 'high', {
              userId,
              ip,
              userAgent,
              path,
              pattern: pattern.type
            });

            // 의심스러운 활동 시 추가 인증 요구 또는 계정 일시 잠금
            if (pattern.type === 'rapid_requests') {
              throw new AppError('Suspicious activity detected. Please try again later.', 429);
            }
          }
        }

        next();
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        next(); // 탐지 실패 시 통과
      }
    };
  }

  private static async checkSuspiciousPattern(
    pattern: any, 
    userId: string | undefined, 
    ip: string, 
    userAgent: string | undefined, 
    path: string
  ): Promise<boolean> {
    // Redis를 사용한 패턴 탐지 로직 구현
    const redis = new RedisClient();
    const key = `suspicious:${pattern.type}:${userId || ip}`;
    
    const count = await redis.client.incr(key);
    if (count === 1) {
      await redis.client.expire(key, pattern.window);
    }
    
    return count > pattern.threshold;
  }
}

// 보안 관련 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        senderID?: string;
        permissions: string[];
      };
    }
  }
}

export default SecurityMiddleware;
```

### 9.2 데이터 보호 및 암호화

#### **<코드 21>** 데이터 암호화 서비스
```typescript
// src/services/encryptionService.ts
import crypto from 'crypto';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

interface EncryptionResult {
  encryptedData: string;
  iv: string;
  authTag?: string;
}

interface DecryptionParams {
  encryptedData: string;
  iv: string;
  authTag?: string;
}

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly saltRounds = 12;

  // 환경변수에서 마스터 키 로드
  private readonly masterKey: Buffer;

  constructor() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters');
    }
    
    this.masterKey = crypto.scryptSync(key, 'salt', this.keyLength);
  }

  // 개인식별정보(PII) 암호화
  async encryptPII(data: string): Promise<string> {
    try {
      const result = this.encrypt(data);
      
      // 암호화된 데이터를 Base64로 인코딩하여 저장
      const encryptedPackage = {
        data: result.encryptedData,
        iv: result.iv,
        authTag: result.authTag
      };
      
      logger.info('PII data encrypted', {
        dataLength: data.length,
        encryptedLength: result.encryptedData.length
      });
      
      return Buffer.from(JSON.stringify(encryptedPackage)).toString('base64');
      
    } catch (error) {
      logger.error('Failed to encrypt PII data', error);
      throw new AppError('Encryption failed', 500);
    }
  }

  // 개인식별정보(PII) 복호화
  async decryptPII(encryptedData: string): Promise<string> {
    try {
      const encryptedPackage = JSON.parse(
        Buffer.from(encryptedData, 'base64').toString('utf8')
      );
      
      const decryptedData = this.decrypt({
        encryptedData: encryptedPackage.data,
        iv: encryptedPackage.iv,
        authTag: encryptedPackage.authTag
      });
      
      logger.info('PII data decrypted', {
        encryptedLength: encryptedData.length,
        decryptedLength: decryptedData.length
      });
      
      return decryptedData;
      
    } catch (error) {
      logger.error('Failed to decrypt PII data', error);
      throw new AppError('Decryption failed', 500);
    }
  }

  // 일반 데이터 암호화
  private encrypt(plaintext: string): EncryptionResult {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, this.masterKey, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  // 일반 데이터 복호화
  private decrypt(params: DecryptionParams): string {
    const iv = Buffer.from(params.iv, 'hex');
    const authTag = Buffer.from(params.authTag!, 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, this.masterKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(params.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // 패스워드 해싱
  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      logger.info('Password hashed successfully');
      return hashedPassword;
      
    } catch (error) {
      logger.error('Failed to hash password', error);
      throw new AppError('Password hashing failed', 500);
    }
  }

  // 패스워드 검증
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const isValid = await bcrypt.compare(password, hashedPassword);
      
      logger.info('Password verification completed', { isValid });
      return isValid;
      
    } catch (error) {
      logger.error('Failed to verify password', error);
      throw new AppError('Password verification failed', 500);
    }
  }

  // 토큰 생성 (세션 토큰, API 키 등)
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // HMAC 서명 생성
  createHMAC(data: string, secret?: string): string {
    const key = secret || process.env.HMAC_SECRET!;
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }

  // HMAC 서명 검증
  verifyHMAC(data: string, signature: string, secret?: string): boolean {
    const key = secret || process.env.HMAC_SECRET!;
    const expectedSignature = crypto.createHmac('sha256', key).update(data).digest('hex');
    
    // 타이밍 공격 방지를 위한 constant-time 비교
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  }

  // 데이터 해싱 (중복 제거, 무결성 검사용)
  hashData(data: string, algorithm: 'md5' | 'sha1' | 'sha256' = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  // 키 유도 함수 (Key Derivation Function)
  deriveKey(password: string, salt: string, iterations: number = 100000): Buffer {
    return crypto.pbkdf2Sync(password, salt, iterations, this.keyLength, 'sha256');
  }

  // 안전한 랜덤 문자열 생성
  generateRandomString(length: number = 16, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = '';
    const randomBytes = crypto.randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      result += charset[randomBytes[i] % charset.length];
    }
    
    return result;
  }

  // 파일 암호화
  async encryptFile(filePath: string, outputPath: string): Promise<void> {
    const fs = require('fs').promises;
    
    try {
      const fileData = await fs.readFile(filePath);
      const encrypted = this.encrypt(fileData.toString('base64'));
      
      const encryptedPackage = {
        data: encrypted.encryptedData,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        originalName: filePath.split('/').pop(),
        encryptedAt: new Date().toISOString()
      };
      
      await fs.writeFile(outputPath, JSON.stringify(encryptedPackage));
      
      logger.info('File encrypted successfully', {
        originalPath: filePath,
        encryptedPath: outputPath
      });
      
    } catch (error) {
      logger.error('File encryption failed', error);
      throw new AppError('File encryption failed', 500);
    }
  }

  // 파일 복호화
  async decryptFile(encryptedFilePath: string, outputPath: string): Promise<void> {
    const fs = require('fs').promises;
    
    try {
      const encryptedContent = await fs.readFile(encryptedFilePath, 'utf8');
      const encryptedPackage = JSON.parse(encryptedContent);
      
      const decryptedData = this.decrypt({
        encryptedData: encryptedPackage.data,
        iv: encryptedPackage.iv,
        authTag: encryptedPackage.authTag
      });
      
      const fileData = Buffer.from(decryptedData, 'base64');
      await fs.writeFile(outputPath, fileData);
      
      logger.info('File decrypted successfully', {
        encryptedPath: encryptedFilePath,
        decryptedPath: outputPath,
        originalName: encryptedPackage.originalName
      });
      
    } catch (error) {
      logger.error('File decryption failed', error);
      throw new AppError('File decryption failed', 500);
    }
  }

  // 개인정보 마스킹 (로그 출력용)
  maskPII(data: string, visibleChars: number = 2): string {
    if (data.length <= visibleChars * 2) {
      return '*'.repeat(data.length);
    }
    
    const start = data.substring(0, visibleChars);
    const end = data.substring(data.length - visibleChars);
    const middle = '*'.repeat(data.length - visibleChars * 2);
    
    return start + middle + end;
  }

  // 데이터 무결성 검증
  verifyDataIntegrity(data: string, expectedHash: string, algorithm: 'md5' | 'sha1' | 'sha256' = 'sha256'): boolean {
    const actualHash = this.hashData(data, algorithm);
    return crypto.timingSafeEqual(
      Buffer.from(expectedHash, 'hex'),
      Buffer.from(actualHash, 'hex')
    );
  }
}

// 싱글톤 인스턴스 내보내기
export const encryptionService = new EncryptionService();
```

---

## 🔧 10. 운영 및 유지보수

### 10.1 시스템 관리 도구

#### **<코드 22>** 시스템 관리 CLI 도구
```typescript
// scripts/admin-cli.ts
#!/usr/bin/env ts-node
import { Command } from 'commander';
import { PrismaClient } from '@prisma/client';
import { encryptionService } from '../src/services/encryptionService';
import { databaseOptimizer } from '../src/utils/databaseOptimization';
import { logger } from '../src/utils/logger';
import { AIModelManager } from '../src/ai/services/modelManager';

const program = new Command();
const prisma = new PrismaClient();
const aiModelManager = new AIModelManager();

program
  .name('icsr-admin')
  .description('ICSR AI System Administration CLI')
  .version('1.0.0');

// 데이터베이스 관련 명령어
const dbCommand = program.command('db').description('Database management commands');

dbCommand
  .command('migrate')
  .description('Run database migrations')
  .action(async () => {
    try {
      console.log('🔄 Running database migrations...');
      // Prisma migrate 실행
      const { exec } = require('child_process');
      exec('npx prisma migrate deploy', (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.error('❌ Migration failed:', error);
          process.exit(1);
        }
        console.log('✅ Migration completed successfully');
        console.log(stdout);
      });
    } catch (error) {
      console.error('❌ Migration error:', error);
      process.exit(1);
    }
  });

dbCommand
  .command('optimize')
  .description('Optimize database performance')
  .action(async () => {
    try {
      console.log('🔄 Analyzing database performance...');
      
      const suggestions = await databaseOptimizer.analyzePerformance();
      console.log('📊 Performance Analysis Results:');
      suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
      
      console.log('\n🔄 Creating recommended indexes...');
      await databaseOptimizer.createRecommendedIndexes();
      
      console.log('🔄 Updating database statistics...');
      await databaseOptimizer.updateStatistics();
      
      console.log('✅ Database optimization completed');
      
    } catch (error) {
      console.error('❌ Database optimization failed:', error);
      process.exit(1);
    }
  });

dbCommand
  .command('backup')
  .option('-o, --output <path>', 'Output file path', `./backup-${new Date().toISOString().split('T')[0]}.sql`)
  .description('Create database backup')
  .action(async (options) => {
    try {
      console.log('🔄 Creating database backup...');
      
      const { exec } = require('child_process');
      const backupCommand = `pg_dump ${process.env.DATABASE_URL} > ${options.output}`;
      
      exec(backupCommand, (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.error('❌ Backup failed:', error);
          process.exit(1);
        }
        
        console.log(`✅ Database backup created: ${options.output}`);
        
        // 백업 파일 암호화
        encryptionService.encryptFile(options.output, `${options.output}.encrypted`)
          .then(() => {
            console.log(`🔒 Backup encrypted: ${options.output}.encrypted`);
          })
          .catch((encError) => {
            console.error('⚠️  Backup encryption failed:', encError);
          });
      });
      
    } catch (error) {
      console.error('❌ Backup error:', error);
      process.exit(1);
    }
  });

// AI 모델 관련 명령어
const aiCommand = program.command('ai').description('AI model management commands');

aiCommand
  .command('status')  icsr_ai_rules.yml: |
    groups:
    - name: icsr-ai-alerts
      rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} for {{ $labels.job }}"
      
      - alert: AIModelLowAccuracy
        expr: ai_model_accuracy < 0.75
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "AI model accuracy is low"
          description: "AI model {{ $labels.model_name }} accuracy is {{ $value | humanizePercentage }}"
      
      - alert: DatabaseConnectionHigh
        expr: pg_stat_activity_count > 80
        for: 3m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "PostgreSQL has {{ $value }} active connections"
      
      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Pod is crash looping"
          description: "Pod {{ $labels.pod }} is restarting frequently"
      
      - alert: MemoryUsageHigh
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Container {{ $labels.container }} memory usage is {{ $value | humanizePercentage }}"
```

#### **<코드 16>** 애플리케이션 로깅 구성
```typescript
// src/utils/logger.ts
import winston from 'winston';
import 'winston-daily-rotate-file';

interface LogContext {
  userId?: string;
  caseId?: string;
  requestId?: string;
  action?: string;
  duration?: number;
}

class Logger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return JSON.stringify({
            '@timestamp': timestamp,
            level,
            message,
            service: 'icsr-ai-backend',
            version: process.env.APP_VERSION || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            ...meta
          });
        })
      ),
      transports: [
        // Console output
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),

        // File output
        new winston.transports.DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '100m',
          maxFiles: '30d'
        }),

        // Error file output
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          zippedArchive: true,
          maxSize: '100m',
          maxFiles: '30d'
        })
      ]
    });

    // Elasticsearch transport in production
    if (process.env.NODE_ENV === 'production') {
      const { ElasticsearchTransport } = require('winston-elasticsearch');
      
      this.logger.add(new ElasticsearchTransport({
        level: 'info',
        clientOpts: {
          node: process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200'
        },
        index: 'icsr-ai-logs',
        indexTemplate: {
          name: 'icsr-ai-template',
          patterns: ['icsr-ai-logs-*'],
          settings: {
            number_of_shards: 1,
            number_of_replicas: 1
          },
          mappings: {
            properties: {
              '@timestamp': { type: 'date' },
              level: { type: 'keyword' },
              message: { type: 'text' },
              service: { type: 'keyword' },
              userId: { type: 'keyword' },
              caseId: { type: 'keyword' },
              requestId: { type: 'keyword' },
              action: { type: 'keyword' },
              duration: { type: 'long' },
              stack: { type: 'text' }
            }
          }
        }
      }));
    }
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(message, context);
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    const errorInfo = error instanceof Error ? {
      stack: error.stack,
      name: error.name
    } : error;

    this.logger.error(message, {
      error: errorInfo,
      ...context
    });
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, context);
  }

  // 성능 로깅
  logPerformance(action: string, duration: number, context?: LogContext): void {
    this.info(`Performance: ${action} completed`, {
      action,
      duration,
      ...context
    });
  }

  // 비즈니스 이벤트 로깅
  logBusinessEvent(event: string, context?: LogContext): void {
    this.info(`Business Event: ${event}`, {
      event_type: 'business',
      event_name: event,
      ...context
    });
  }

  // AI 처리 로깅
  logAIProcessing(modelName: string, accuracy: number, processingTime: number, context?: LogContext): void {
    this.info('AI Processing completed', {
      event_type: 'ai_processing',
      model_name: modelName,
      accuracy,
      processing_time: processingTime,
      ...context
    });
  }

  // 보안 이벤트 로깅
  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext): void {
    this.warn(`Security Event: ${event}`, {
      event_type: 'security',
      event_name: event,
      severity,
      ...context
    });
  }
}

export const logger = new Logger();
```

---

## 📊 8. 성능 최적화 및 모니터링

### 8.1 성능 최적화 전략

#### **<표 10>** 성능 최적화 체크리스트
| 영역 | 최적화 기법 | 구현 상태 | 예상 효과 |
|------|------------|-----------|-----------|
| **Frontend** | 코드 스플리팅 | ✅ 완료 | 초기 로딩 40% 단축 |
| **Frontend** | 이미지 최적화 | ✅ 완료 | 번들 크기 30% 감소 |
| **Frontend** | 메모이제이션 | ✅ 완료 | 렌더링 성능 25% 향상 |
| **Backend** | API 응답 캐싱 | ✅ 완료 | API 응답 시간 60% 단축 |
| **Backend** | 데이터베이스 최적화 | ✅ 완료 | 쿼리 성능 50% 향상 |
| **Backend** | 커넥션 풀링 | ✅ 완료 | 동시 처리량 200% 증가 |
| **AI Engine** | 모델 양자화 | 🔄 진행중 | 추론 시간 70% 단축 |
| **AI Engine** | 배치 처리 | ✅ 완료 | 처리량 300% 증가 |
| **Infrastructure** | CDN 적용 | ✅ 완료 | 로딩 시간 50% 단축 |

#### **<코드 17>** 성능 모니터링 미들웨어
```typescript
// src/middleware/performanceMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import { logger } from '../utils/logger';
import { prometheusMetrics } from '../utils/metrics';

interface PerformanceData {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
}

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();
  const startCpuUsage = process.cpuUsage();
  const requestId = req.headers['x-request-id'] as string || generateRequestId();

  // Request ID 설정
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  // Response 완료 후 성능 메트릭 수집
  res.on('finish', () => {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    const endCpuUsage = process.cpuUsage(startCpuUsage);
    const memoryUsage = process.memoryUsage();

    const performanceData: PerformanceData = {
      requestId,
      method: req.method,
      path: req.route?.path || req.path,
      statusCode: res.statusCode,
      responseTime: Math.round(responseTime * 100) / 100, // 소수점 2자리
      memoryUsage,
      cpuUsage: endCpuUsage
    };

    // 성능 로그
    logger.logPerformance(`${req.method} ${req.path}`, responseTime, {
      requestId,
      statusCode: res.statusCode,
      memoryUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      cpuUser: endCpuUsage.user,
      cpuSystem: endCpuUsage.system
    });

    // Prometheus 메트릭 업데이트
    prometheusMetrics.httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(responseTime / 1000); // 초 단위로 변환

    prometheusMetrics.httpRequestsTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .inc();

    // 메모리 사용량 메트릭
    prometheusMetrics.memoryUsage.set(memoryUsage.heapUsed);

    // 느린 요청 알림 (5초 이상)
    if (responseTime > 5000) {
      logger.warn('Slow request detected', {
        requestId,
        method: req.method,
        path: req.path,
        responseTime,
        statusCode: res.statusCode
      });
    }

    // 메모리 사용량 높은 경우 알림 (500MB 이상)
    if (memoryUsage.heapUsed > 500 * 1024 * 1024) {
      logger.warn('High memory usage detected', {
        requestId,
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024)
      });
    }
  });

  next();
};

// 요청 ID 생성
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}
```

#### **<코드 18>** 데이터베이스 성능 최적화
```typescript
// src/utils/databaseOptimization.ts
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

class DatabaseOptimizer {
  constructor(private prisma: PrismaClient) {
    this.setupQueryLogging();
    this.setupConnectionPooling();
  }

  private setupQueryLogging(): void {
    // 슬로우 쿼리 로깅
    this.prisma.$use(async (params, next) => {
      const start = Date.now();
      const result = await next(params);
      const duration = Date.now() - start;

      // 1초 이상 걸린 쿼리 로깅
      if (duration > 1000) {
        logger.warn('Slow query detected', {
          model: params.model,
          action: params.action,
          duration,
          args: JSON.stringify(params.args, null, 2)
        });
      }

      return result;
    });
  }

  private setupConnectionPooling(): void {
    // 커넥션 풀 설정은 DATABASE_URL에서 설정
    // postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20
  }

  // 인덱스 최적화 제안
  async analyzePerformance(): Promise<string[]> {
    const suggestions: string[] = [];

    try {
      // 자주 사용되는 쿼리 패턴 분석
      const caseQueries = await this.prisma.$queryRaw`
        SELECT schemaname, tablename, attname, n_distinct, correlation
        FROM pg_stats 
        WHERE tablename IN ('cases', 'patients', 'drugs', 'events')
        ORDER BY n_distinct DESC;
      `;

      // 느린 쿼리 분석
      const slowQueries = await this.prisma.$queryRaw`
        SELECT query, mean_time, calls, total_time
        FROM pg_stat_statements 
        WHERE mean_time > 1000
        ORDER BY mean_time DESC
        LIMIT 10;
      `;

      if (Array.isArray(caseQueries)) {
        suggestions.push(`분석된 테이블: ${caseQueries.length}개`);
      }

      if (Array.isArray(slowQueries) && slowQueries.length > 0) {
        suggestions.push(`느린 쿼리 발견: ${slowQueries.length}개`);
        suggestions.push('인덱스 추가를 고려해보세요.');
      }

    } catch (error) {
      logger.error('Database performance analysis failed', error);
      suggestions.push('성능 분석 중 오류 발생');
    }

    return suggestions;
  }

  // 권장 인덱스 생성
  async createRecommendedIndexes(): Promise<void> {
    const indexes = [
      // 케이스 검색 최적화
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cases_status_created ON cases (status, created_at);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cases_sender_updated ON cases (sender_id, updated_at);',
      
      // 환자 정보 검색 최적화
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_patients_initials ON patients (initials);',
      
      // 의약품 검색 최적화
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drugs_name ON drugs USING gin (name gin_trgm_ops);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drugs_meddra ON drugs (meddra_code);',
      
      // 이상사례 검색 최적화
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_verbatim ON events USING gin (verbatim_term gin_trgm_ops);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_pt_code ON events (pt_code);',
      
      // AI 예측 검색 최적화
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_predictions_case_confidence ON ai_predictions (case_id, confidence);',
      
      // 감사 로그 최적화
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_action ON audit_logs (user_id, action);'
    ];

    for (const indexQuery of indexes) {
      try {
        await this.prisma.$executeRawUnsafe(indexQuery);
        logger.info('Index created successfully', { query: indexQuery });
      } catch (error) {
        logger.error('Failed to create index', error, { query: indexQuery });
      }
    }
  }

  // 데이터베이스 통계 업데이트
  async updateStatistics(): Promise<void> {
    try {
      await this.prisma.$executeRawUnsafe('ANALYZE;');
      logger.info('Database statistics updated');
    } catch (error) {
      logger.error('Failed to update database statistics', error);
    }
  }

  // 연결 상태 모니터링
  async monitorConnections(): Promise<{
    active: number;
    idle: number;
    total: number;
  }> {
    try {
      const result = await this.prisma.$queryRaw<Array<{
        state: string;
        count: bigint;
      }>>`
        SELECT state, COUNT(*) as count
        FROM pg_stat_activity 
        WHERE datname = current_database()
        GROUP BY state;
      `;

      const connections = {
        active: 0,
        idle: 0,
        total: 0
      };

      result.forEach(row => {
        const count = Number(row.count);
        if (row.state === 'active') {
          connections.active = count;
        } else if (row.state === 'idle') {
          connections.idle = count;
        }
        connections.total += count;
      });

      return connections;
    } catch (error) {
      logger.error('Failed to monitor database connections', error);
      return { active: 0, idle: 0, total: 0 };
    }
  }
}

export const databaseOptimizer = new DatabaseOptimizer(new PrismaClient());
```

### 8.2 AI 모델 성능 최적화

#### **<코드 19>** AI 모델 최적화 및 모니터링
```python
# src/ai/utils/model_optimizer.py
import torch
import torch.nn as nn
from torch.quantization import quantize_dynamic
import time
import logging
from typing import Dict, Any, List
import psutil
import GPUtil
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class ModelPerformanceMetrics:
    """모델 성능 메트릭"""
    inference_time: float
    memory_usage: float
    gpu_utilization: float
    accuracy: float
    throughput: float  # requests per second

class AIModelOptimizer:
    """AI 모델 성능 최적화 클래스"""
    
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.optimization_cache = {}
        
    def optimize_model_for_inference(self, model: nn.Module, optimization_level: str = 'medium') -> nn.Module:
        """
        추론을 위한 모델 최적화
        
        Args:
            model: 최적화할 PyTorch 모델
            optimization_level: 'low', 'medium', 'high'
            
        Returns:
            최적화된 모델
        """
        try:
            logger.info(f"Starting model optimization (level: {optimization_level})")
            
            # 평가 모드로 설정
            model.eval()
            
            if optimization_level in ['medium', 'high']:
                # 동적 양자화 적용
                model = self._apply_dynamic_quantization(model)
                
            if optimization_level == 'high':
                # 더 강력한 최적화 적용
                model = self._apply_advanced_optimization(model)
            
            # JIT 컴파일 (추론 속도 향상)
            model = torch.jit.script(model)
            
            logger.info("Model optimization completed")
            return model
            
        except Exception as e:
            logger.error(f"Model optimization failed: {str(e)}")
            return model  # 최적화 실패 시 원본 모델 반환

    def _apply_dynamic_quantization(self, model: nn.Module) -> nn.Module:
        """동적 양자화 적용"""
        try:
            quantized_model = quantize_dynamic(
                model,
                {nn.Linear, nn.LSTM, nn.GRU},  # 양자화할 레이어 타입
                dtype=torch.qint8
            )
            
            logger.info("Dynamic quantization applied")
            return quantized_model
            
        except Exception as e:
            logger.warning(f"Dynamic quantization failed: {str(e)}")
            return model

    def _apply_advanced_optimization(self, model: nn.Module) -> nn.Module:
        """고급 최적화 기법 적용"""
        try:
            # 그래디언트 비활성화 (추론 시 메모리 절약)
            for param in model.parameters():
                param.requires_grad = False
            
            # 혼합 정밀도 최적화 (GPU에서)
            if self.device.type == 'cuda':
                model = model.half()  # FP16 사용
                
            logger.info("Advanced optimization applied")
            return model
            
        except Exception as e:
            logger.warning(f"Advanced optimization failed: {str(e)}")
            return model

    async def benchmark_model_performance(
        self, 
        model: nn.Module, 
        sample_inputs: List[torch.Tensor],
        num_iterations: int = 100
    ) -> ModelPerformanceMetrics:
        """
        모델 성능 벤치마킹
        
        Args:
            model: 벤치마킹할 모델
            sample_inputs: 테스트용 입력 데이터
            num_iterations: 반복 횟수
            
        Returns:
            성능 메트릭
        """
        logger.info(f"Starting performance benchmark ({num_iterations} iterations)")
        
        model.eval()
        inference_times = []
        
        # GPU 메모리 사용량 측정 시작
        if torch.cuda.is_available():
            torch.cuda.reset_peak_memory_stats()
            initial_gpu_memory = torch.cuda.memory_allocated()
        
        # CPU 메모리 사용량 측정 시작
        initial_cpu_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        
        # 워밍업 (첫 몇 번의 추론은 제외)
        with torch.no_grad():
            for _ in range(10):
                _ = model(sample_inputs[0])
        
        # 실제 벤치마크
        with torch.no_grad():
            for i in range(num_iterations):
                input_tensor = sample_inputs[i % len(sample_inputs)]
                
                start_time = time.time()
                _ = model(input_tensor)
                end_time = time.time()
                
                inference_times.append(end_time - start_time)
                
                # GPU 동기화 (정확한 시간 측정을 위해)
                if torch.cuda.is_available():
                    torch.cuda.synchronize()
        
        # 성능 메트릭 계산
        avg_inference_time = sum(inference_times) / len(inference_times)
        throughput = 1.0 / avg_inference_time
        
        # 메모리 사용량 계산
        if torch.cuda.is_available():
            gpu_memory_used = (torch.cuda.max_memory_allocated() - initial_gpu_memory) / 1024 / 1024  # MB
            gpu_utilization = self._get_gpu_utilization()
        else:
            gpu_memory_used = 0
            gpu_utilization = 0
            
        final_cpu_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        cpu_memory_used = final_cpu_memory - initial_cpu_memory
        
        metrics = ModelPerformanceMetrics(
            inference_time=avg_inference_time * 1000,  # milliseconds
            memory_usage=max(gpu_memory_used, cpu_memory_used),
            gpu_utilization=gpu_utilization,
            accuracy=0.0,  # 별도 평가 필요
            throughput=throughput
        )
        
        logger.info(f"Benchmark completed - Avg inference time: {metrics.inference_time:.2f}ms, "
                   f"Throughput: {metrics.throughput:.2f} req/s")
        
        return metrics

    def _get_gpu_utilization(self) -> float:
        """GPU 사용률 조회"""
        try:
            gpus = GPUtil.getGPUs()
            if gpus:
                return gpus[0].load * 100  # 첫 번째 GPU 사용률
            return 0.0
        except Exception:
            return 0.0

    async def optimize_batch_processing(
        self, 
        model: nn.Module,
        batch_sizes: List[int] = [1, 4, 8, 16, 32]
    ) -> int:
        """
        최적 배치 크기 찾기
        
        Args:
            model: 모델
            batch_sizes: 테스트할 배치 크기 리스트
            
        Returns:
            최적 배치 크기
        """
        logger.info("Optimizing batch size for processing")
        
        best_batch_size = 1
        best_throughput = 0.0
        
        for batch_size in batch_sizes:
            try:
                # 샘플 배치 생성 (실제 입력 크기에 맞게 조정 필요)
                sample_batch = torch.randn(batch_size, 512)  # 예시 크기
                
                # 메모리 체크
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                    
                start_time = time.time()
                
                with torch.no_grad():
                    for _ in range(10):  # 10번 반복 테스트
                        _ = model(sample_batch)
                        
                if torch.cuda.is_available():
                    torch.cuda.synchronize()
                    
                end_time = time.time()
                
                # 처리량 계산 (samples per second)
                total_samples = batch_size * 10
                total_time = end_time - start_time
                throughput = total_samples / total_time
                
                logger.info(f"Batch size {batch_size}: {throughput:.2f} samples/sec")
                
                if throughput > best_throughput:
                    best_throughput = throughput
                    best_batch_size = batch_size
                    
            except RuntimeError as e:
                if "out of memory" in str(e):
                    logger.warning(f"OOM at batch size {batch_size}")
                    break  # 메모리 부족 시 중단
                else:
                    logger.error(f"Error testing batch size {batch_size}: {str(e)}")
        
        logger.info(f"Optimal batch size: {best_batch_size} (throughput: {best_throughput:.2f} samples/sec)")
        return best_batch_size

    def monitor_model_drift(
        self,
        current_accuracy: float,
        baseline_accuracy: float,
        drift_threshold: float = 0.05
    ) -> Dict[str, Any]:
        """
        모델 드리프트 모니터링
        
        Args:
            current_accuracy: 현재 정확도
            baseline_accuracy: 기준 정확도
            drift_threshold: 드리프트 임계값
            
        Returns:
            드리프트 분석 결과
        """
        accuracy_drop = baseline_accuracy - current_accuracy
        is_drifted = accuracy_drop > drift_threshold
        
        drift_info = {
            'is_drifted': is_drifted,
            'accuracy_drop': accuracy_drop,
            'current_accuracy': current_accuracy,
            'baseline_accuracy': baseline_accuracy,
            'drift_threshold': drift_threshold,
            'severity': self._calculate_drift_severity(accuracy_drop, drift_threshold)
        }
        
        if is_drifted:
            logger.warning(f"Model drift detected! Accuracy dropped by {accuracy_drop:.3f}")
        
        return drift_info

    def _calculate_drift_severity(self, accuracy_drop: float, threshold: float) -> str:
        """드리프트 심각도 계산"""
        if accuracy_drop <= threshold:
            return 'none'
        elif accuracy_drop <= threshold * 2:
            return 'low'
        elif accuracy_drop <= threshold * 4:
            return 'medium'
        else:
            return 'high'

# 전역 인스턴스
model_optimizer = AIModelOptimizer()
```

---

## 🔒 9. 보안 및 컴플라이언스

### 9.1 보안 아키텍처

#### **<표 11>** 보안 요구사항 매트릭스
| 보안 영역 | 요구사항 | 구현 방법 | 준수 표준 |
|----------|----------|-----------|-----------|
| **인증/인가** | 다단계 인증 | OAuth 2.0 + TOTP | ISO 27001 |
| **데이터 암# AI 기반 약물감시 시스템 소프트웨어 제작 사양서

## 📋 문서 정보

- **프로젝트명**: ICSR-AI (Individual Case Safety Report - AI)
- **문서 버전**: v2.0
- **작성일**: 2025년 9월 12일
- **승인자**: 기술이사, PV 책임자
- **문서 유형**: 소프트웨어 요구사항 명세서 (SRS)

---

## 🎯 1. 프로젝트 개요

### 1.1 프로젝트 목표
**약물감시업계의 ICSR 처리 과정을 AI로 자동화하여 업무 효율성 향상 및 규제 준수 보장**

### 1.2 주요 성과 목표
- **<표 1>** ICSR 처리 시간 75% 단축 (60분 → 15분)
- **<표 2>** AI 자동화율 85% 달성
- **<표 3>** 운영비용 40% 절감
- **<표 4>** 처리 용량 300% 증가

### 1.3 프로젝트 범위

#### 포함 사항 (In-Scope)
✅ ICSR 케이스 관리 시스템  
✅ AI 기반 데이터 추출 및 분류  
✅ MedDRA 자동 코딩  
✅ E2B(R3) XML 생성 및 검증  
✅ 규제기관 자동 제출  
✅ 대시보드 및 리포팅  

#### 제외 사항 (Out-of-Scope)  
❌ 기존 레거시 시스템 마이그레이션  
❌ 하드웨어 구매 및 설치  
❌ 타사 시스템과의 직접 연동  

---

## 🏗️ 2. 시스템 아키텍처

### 2.1 전체 시스템 구조도

```mermaid
graph TB
    A[Web Browser] --> B[Load Balancer]
    B --> C[React Frontend]
    C --> D[API Gateway]
    D --> E[Microservices]
    E --> F[AI Engine]
    E --> G[Database Cluster]
    E --> H[External APIs]
    
    subgraph "Frontend Layer"
        C
    end
    
    subgraph "Backend Layer"
        D
        E
        I[Redis Cache]
        J[Message Queue]
    end
    
    subgraph "AI/ML Layer"
        F
        K[Model Registry]
        L[Training Pipeline]
    end
    
    subgraph "Data Layer"
        G
        M[File Storage]
    end
```

### 2.2 기술 스택 매트릭스

#### **<표 5>** Front-End 기술 스택
| 구분 | 기술 | 버전 | 용도 |
|------|------|------|------|
| Framework | React | 18.2+ | UI 프레임워크 |
| Language | TypeScript | 5.0+ | 타입 안정성 |
| State Management | Redux Toolkit | 1.9+ | 전역 상태 관리 |
| UI Library | Material-UI | 5.14+ | UI 컴포넌트 |
| Build Tool | Vite | 4.4+ | 빌드 도구 |
| Testing | Jest + RTL | Latest | 테스팅 |

#### **<표 6>** Back-End 기술 스택
| 구분 | 기술 | 버전 | 용도 |
|------|------|------|------|
| Runtime | Node.js | 20.x LTS | 서버 런타임 |
| Framework | Express.js | 4.18+ | 웹 프레임워크 |
| Language | TypeScript | 5.0+ | 타입 안정성 |
| Database | PostgreSQL | 16.x | 메인 데이터베이스 |
| Cache | Redis | 7.x | 캐싱 및 세션 |
| ORM | Prisma | 5.x | 데이터베이스 ORM |

#### **<표 7>** AI/ML 기술 스택
| 구분 | 기술 | 버전 | 용도 |
|------|------|------|------|
| Runtime | Python | 3.11+ | AI/ML 런타임 |
| Framework | FastAPI | 0.103+ | API 서버 |
| ML Library | scikit-learn | 1.3+ | 전통적 ML |
| NLP | Transformers | 4.33+ | 자연어 처리 |
| Model Serving | MLflow | 2.6+ | 모델 관리 |
| GPU Support | CUDA | 12.0+ | GPU 가속 |

---

## 📱 3. Front-End 상세 설계

### 3.1 디렉토리 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   ├── forms/          # 폼 컴포넌트
│   └── charts/         # 차트 컴포넌트
├── pages/              # 페이지 컴포넌트
│   ├── dashboard/      # 대시보드
│   ├── cases/          # ICSR 케이스 관리
│   ├── meddra/         # MedDRA 관리
│   └── reports/        # 리포트
├── hooks/              # Custom React Hooks
├── store/              # Redux Store
├── services/           # API 서비스
├── types/              # TypeScript 타입 정의
├── utils/              # 유틸리티 함수
└── constants/          # 상수 정의
```

### 3.2 주요 컴포넌트 설계

#### **<코드 1>** ICSR 케이스 목록 컴포넌트
```typescript
// src/components/cases/CaseList.tsx
import React, { useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Chip, IconButton, Tooltip
} from '@mui/material';
import { Edit, Visibility, Send } from '@mui/icons-material';
import { ICSRCase, CaseStatus } from '../../types/case.types';

interface CaseListProps {
  cases: ICSRCase[];
  loading?: boolean;
  onEdit: (caseId: string) => void;
  onView: (caseId: string) => void;
  onSubmit: (caseId: string) => void;
}

export const CaseList: React.FC<CaseListProps> = ({
  cases,
  loading = false,
  onEdit,
  onView,
  onSubmit
}) => {
  const getStatusColor = (status: CaseStatus): "success" | "warning" | "error" | "info" => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'warning'; 
      case 'ERROR': return 'error';
      default: return 'info';
    }
  };

  const getStatusLabel = (status: CaseStatus): string => {
    const labels = {
      DRAFT: '작성중',
      IN_PROGRESS: '처리중', 
      AI_PROCESSED: 'AI처리완료',
      REVIEWED: '검토완료',
      COMPLETED: '완료',
      ERROR: '오류'
    };
    return labels[status] || status;
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>케이스 번호</TableCell>
            <TableCell>환자 이니셜</TableCell>
            <TableCell>의약품명</TableCell>
            <TableCell>이상사례</TableCell>
            <TableCell>상태</TableCell>
            <TableCell>AI 신뢰도</TableCell>
            <TableCell>수정일</TableCell>
            <TableCell>작업</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cases.map((caseItem) => (
            <TableRow key={caseItem.id} hover>
              <TableCell>{caseItem.caseNumber}</TableCell>
              <TableCell>{caseItem.patient?.initials || 'N/A'}</TableCell>
              <TableCell>{caseItem.drugs?.[0]?.name || 'N/A'}</TableCell>
              <TableCell>
                {caseItem.events?.[0]?.verbatimTerm || 'N/A'}
              </TableCell>
              <TableCell>
                <Chip 
                  label={getStatusLabel(caseItem.status)}
                  color={getStatusColor(caseItem.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {caseItem.aiConfidence ? 
                  `${Math.round(caseItem.aiConfidence * 100)}%` : 'N/A'}
              </TableCell>
              <TableCell>
                {new Date(caseItem.updatedAt).toLocaleDateString('ko-KR')}
              </TableCell>
              <TableCell>
                <Tooltip title="보기">
                  <IconButton onClick={() => onView(caseItem.id)} size="small">
                    <Visibility />
                  </IconButton>
                </Tooltip>
                <Tooltip title="편집">
                  <IconButton onClick={() => onEdit(caseItem.id)} size="small">
                    <Edit />
                  </IconButton>
                </Tooltip>
                {caseItem.status === 'REVIEWED' && (
                  <Tooltip title="제출">
                    <IconButton onClick={() => onSubmit(caseItem.id)} size="small">
                      <Send />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
```

#### **<코드 2>** MedDRA 자동 매핑 컴포넌트
```typescript
// src/components/meddra/MedDRAMapper.tsx
import React, { useState, useEffect } from 'react';
import {
  Autocomplete, TextField, Box, Typography, 
  Chip, LinearProgress, Alert
} from '@mui/material';
import { Psychology, CheckCircle } from '@mui/icons-material';
import { useMedDRAMappingQuery } from '../../hooks/useMedDRA';
import { MedDRAMapping, MedDRAResponse } from '../../types/meddra.types';

interface MedDRAMapperProps {
  verbatimTerm: string;
  language: 'ko' | 'en';
  onMappingSelect: (mapping: MedDRAMapping) => void;
  disabled?: boolean;
}

export const MedDRAMapper: React.FC<MedDRAMapperProps> = ({
  verbatimTerm,
  language,
  onMappingSelect,
  disabled = false
}) => {
  const [selectedMapping, setSelectedMapping] = useState<MedDRAMapping | null>(null);
  
  const {
    data: mappings,
    isLoading,
    error,
    refetch
  } = useMedDRAMappingQuery({
    verbatimTerm,
    language,
    enabled: !!verbatimTerm
  });

  const handleMappingChange = (
    event: React.SyntheticEvent,
    value: MedDRAMapping | null
  ) => {
    setSelectedMapping(value);
    if (value) {
      onMappingSelect(value);
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return '#4caf50'; // 녹색
    if (confidence >= 0.6) return '#ff9800'; // 주황색
    return '#f44336'; // 빨간색
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return '높음';
    if (confidence >= 0.6) return '중간';
    return '낮음';
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
        AI MedDRA 매핑 결과
      </Typography>
      
      {isLoading && (
        <Box>
          <LinearProgress />
          <Typography variant="caption" color="textSecondary">
            AI가 MedDRA 코드를 분석중입니다...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          MedDRA 매핑 중 오류가 발생했습니다. 다시 시도해주세요.
        </Alert>
      )}

      {mappings && (
        <Autocomplete
          options={mappings}
          value={selectedMapping}
          onChange={handleMappingChange}
          disabled={disabled}
          getOptionLabel={(option) => 
            `${option.ptCode} - ${option.ptName} (${Math.round(option.confidence * 100)}%)`
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="MedDRA PT 선택"
              variant="outlined"
              placeholder="AI 추천 결과에서 선택하거나 직접 검색"
              helperText={selectedMapping ? 
                `선택된 코드: ${selectedMapping.ptCode}` : 
                '가장 높은 신뢰도의 결과를 선택하는 것을 권장합니다.'
              }
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2">
                  {option.ptCode} - {option.ptName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  SOC: {option.socName || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ ml: 2 }}>
                <Chip
                  label={`${getConfidenceLabel(option.confidence)} ${Math.round(option.confidence * 100)}%`}
                  size="small"
                  sx={{ 
                    bgcolor: getConfidenceColor(option.confidence),
                    color: 'white'
                  }}
                />
              </Box>
            </Box>
          )}
          noOptionsText="검색 결과가 없습니다"
        />
      )}

      {selectedMapping && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
            선택된 MedDRA 정보
          </Typography>
          <Typography variant="body2">
            <strong>PT Code:</strong> {selectedMapping.ptCode}
          </Typography>
          <Typography variant="body2">
            <strong>PT Name:</strong> {selectedMapping.ptName}
          </Typography>
          <Typography variant="body2">
            <strong>SOC:</strong> {selectedMapping.socName || 'N/A'}
          </Typography>
          <Typography variant="body2">
            <strong>AI 신뢰도:</strong> {Math.round(selectedMapping.confidence * 100)}%
          </Typography>
        </Box>
      )}
    </Box>
  );
};
```

### 3.3 상태 관리 (Redux)

#### **<코드 3>** Case Store 설계
```typescript
// src/store/slices/caseSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { caseService } from '../../services/caseService';
import { ICSRCase, CaseFilters, CreateCaseRequest } from '../../types/case.types';

interface CaseState {
  cases: ICSRCase[];
  currentCase: ICSRCase | null;
  loading: boolean;
  error: string | null;
  filters: CaseFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: CaseState = {
  cases: [],
  currentCase: null,
  loading: false,
  error: null,
  filters: {
    status: undefined,
    dateRange: undefined,
    searchTerm: ''
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0
  }
};

// Async Thunks
export const fetchCases = createAsyncThunk(
  'cases/fetchCases',
  async (params: { filters?: CaseFilters; page?: number; limit?: number }) => {
    const response = await caseService.getCases(params);
    return response;
  }
);

export const createCase = createAsyncThunk(
  'cases/createCase',
  async (caseData: CreateCaseRequest) => {
    const response = await caseService.createCase(caseData);
    return response;
  }
);

export const processWithAI = createAsyncThunk(
  'cases/processWithAI',
  async ({ caseId, processType }: { caseId: string; processType: string }) => {
    const response = await caseService.processWithAI(caseId, processType);
    return response;
  }
);

// Slice
const caseSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<CaseFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCase: (state, action: PayloadAction<ICSRCase | null>) => {
      state.currentCase = action.payload;
    },
    updateCaseInList: (state, action: PayloadAction<ICSRCase>) => {
      const index = state.cases.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.cases[index] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cases
      .addCase(fetchCases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCases.fulfilled, (state, action) => {
        state.loading = false;
        state.cases = action.payload.cases;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cases';
      })
      
      // Create Case
      .addCase(createCase.fulfilled, (state, action) => {
        state.cases.unshift(action.payload);
        state.pagination.total += 1;
      })
      
      // AI Processing
      .addCase(processWithAI.pending, (state, action) => {
        const caseId = action.meta.arg.caseId;
        const caseIndex = state.cases.findIndex(c => c.id === caseId);
        if (caseIndex !== -1) {
          state.cases[caseIndex].status = 'IN_PROGRESS';
        }
      })
      .addCase(processWithAI.fulfilled, (state, action) => {
        const updatedCase = action.payload;
        const caseIndex = state.cases.findIndex(c => c.id === updatedCase.id);
        if (caseIndex !== -1) {
          state.cases[caseIndex] = updatedCase;
        }
        if (state.currentCase?.id === updatedCase.id) {
          state.currentCase = updatedCase;
        }
      });
  }
});

export const { setFilters, clearError, setCurrentCase, updateCaseInList } = caseSlice.actions;
export default caseSlice.reducer;
```

---

## 🔧 4. Back-End 상세 설계

### 4.1 프로젝트 구조

```
src/
├── controllers/        # API 컨트롤러
├── services/          # 비즈니스 로직
├── models/            # 데이터 모델 (Prisma)
├── middleware/        # 미들웨어
├── routes/            # 라우트 정의
├── utils/             # 유틸리티
├── types/             # TypeScript 타입
├── config/            # 설정
└── tests/             # 테스트 파일
```

### 4.2 API 설계

#### **<표 8>** RESTful API 엔드포인트
| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| GET | /api/v1/cases | 케이스 목록 조회 | ✅ |
| POST | /api/v1/cases | 새 케이스 생성 | ✅ |
| GET | /api/v1/cases/:id | 특정 케이스 조회 | ✅ |
| PUT | /api/v1/cases/:id | 케이스 수정 | ✅ |
| POST | /api/v1/cases/:id/ai-process | AI 처리 요청 | ✅ |
| GET | /api/v1/meddra/search | MedDRA 검색 | ✅ |
| POST | /api/v1/meddra/mapping | MedDRA 자동 매핑 | ✅ |
| POST | /api/v1/regulatory/submit | 규제기관 제출 | ✅ |

#### **<코드 4>** Case Controller 구현
```typescript
// src/controllers/caseController.ts
import { Request, Response, NextFunction } from 'express';
import { CaseService } from '../services/caseService';
import { AIProcessingService } from '../services/aiProcessingService';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError';

export class CaseController {
  constructor(
    private caseService: CaseService,
    private aiService: AIProcessingService
  ) {}

  // 케이스 목록 조회
  getCases = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20, status, searchTerm, dateFrom, dateTo } = req.query;
      
      const filters = {
        status: status as string,
        searchTerm: searchTerm as string,
        dateRange: dateFrom && dateTo ? {
          from: new Date(dateFrom as string),
          to: new Date(dateTo as string)
        } : undefined
      };

      const result = await this.caseService.getCases({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        filters,
        userId: req.user.id
      });

      res.json({
        success: true,
        data: result,
        message: 'Cases retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // 새 케이스 생성
  createCase = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 입력 검증
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
      }

      const caseData = {
        ...req.body,
        createdBy: req.user.id,
        senderID: req.user.senderID
      };

      const newCase = await this.caseService.createCase(caseData);

      res.status(201).json({
        success: true,
        data: newCase,
        message: 'Case created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // AI 처리 요청
  processWithAI = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: caseId } = req.params;
      const { processType, options } = req.body;

      // 케이스 존재 여부 확인
      const existingCase = await this.caseService.getCaseById(caseId, req.user.id);
      if (!existingCase) {
        throw new AppError('Case not found', 404);
      }

      // AI 처리 시작
      const processingJob = await this.aiService.processCase(caseId, processType, options);

      res.json({
        success: true,
        data: {
          jobId: processingJob.id,
          status: 'started',
          estimatedTime: processingJob.estimatedTime
        },
        message: 'AI processing started'
      });
    } catch (error) {
      next(error);
    }
  };

  // 케이스 상세 조회
  getCaseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const caseData = await this.caseService.getCaseById(id, req.user.id);
      
      if (!caseData) {
        throw new AppError('Case not found', 404);
      }

      res.json({
        success: true,
        data: caseData,
        message: 'Case retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // 케이스 업데이트
  updateCase = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // 입력 검증
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
      }

      const updatedCase = await this.caseService.updateCase(id, updateData, req.user.id);

      res.json({
        success: true,
        data: updatedCase,
        message: 'Case updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
```

### 4.3 비즈니스 로직 (Service Layer)

#### **<코드 5>** Case Service 구현
```typescript
// src/services/caseService.ts
import { PrismaClient } from '@prisma/client';
import { AIProcessingService } from './aiProcessingService';
import { XMLGeneratorService } from './xmlGeneratorService';
import { ValidationService } from './validationService';
import { AppError } from '../utils/AppError';
import { 
  CreateCaseRequest, 
  UpdateCaseRequest, 
  CaseFilters, 
  ICSRCase 
} from '../types/case.types';

export class CaseService {
  constructor(
    private prisma: PrismaClient,
    private aiService: AIProcessingService,
    private xmlService: XMLGeneratorService,
    private validationService: ValidationService
  ) {}

  async getCases(params: {
    page: number;
    limit: number;
    filters?: CaseFilters;
    userId: string;
  }) {
    const { page, limit, filters, userId } = params;
    const offset = (page - 1) * limit;

    // 권한에 따른 필터링
    const whereClause = this.buildWhereClause(filters, userId);

    const [cases, total] = await Promise.all([
      this.prisma.case.findMany({
        skip: offset,
        take: limit,
        where: whereClause,
        include: {
          patient: {
            select: {
              initials: true,
              age: true,
              gender: true
            }
          },
          drugs: {
            select: {
              name: true,
              meddraCode: true,
              dose: true,
              unit: true
            }
          },
          events: {
            select: {
              verbatimTerm: true,
              ptCode: true,
              ptName: true,
              seriousness: true
            }
          },
          aiPredictions: {
            select: {
              confidence: true,
              modelVersion: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      }),
      this.prisma.case.count({ where: whereClause })
    ]);

    // AI 신뢰도 추가
    const casesWithConfidence = cases.map(c => ({
      ...c,
      aiConfidence: c.aiPredictions[0]?.confidence || null
    }));

    return {
      cases: casesWithConfidence,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createCase(data: CreateCaseRequest): Promise<ICSRCase> {
    try {
      // 케이스 번호 생성
      const caseNumber = await this.generateCaseNumber();

      // 트랜잭션으로 케이스와 관련 데이터 생성
      const newCase = await this.prisma.$transaction(async (tx) => {
        // 메인 케이스 생성
        const caseRecord = await tx.case.create({
          data: {
            caseNumber,
            senderID: data.senderID,
            receiverID: data.receiverID || 'MFDS-O-KR',
            reportType: data.reportType || 'INITIAL',
            status: 'DRAFT',
            createdBy: data.createdBy,
            
            // 환자 정보 생성
            patient: data.patient ? {
              create: {
                initials: data.patient.initials,
                age: data.patient.age,
                gender: data.patient.gender,
                medicalHistory: data.patient.medicalHistory
              }
            } : undefined,
            
            // 의약품 정보 생성
            drugs: data.drugs ? {
              create: data.drugs.map(drug => ({
                name: drug.name,
                activeIngredient: drug.activeIngredient,
                dose: drug.dose,
                unit: drug.unit,
                route: drug.route,
                indication: drug.indication
              }))
            } : undefined,
            
            // 이상사례 정보 생성
            events: data.events ? {
              create: data.events.map(event => ({
                verbatimTerm: event.verbatimTerm,
                onsetDate: event.onsetDate,
                seriousness: event.seriousness,
                outcome: event.outcome
              }))
            } : undefined
          },
          include: {
            patient: true,
            drugs: true,
            events: true
          }
        });

        // 감사 로그 생성
        await tx.auditLog.create({
          data: {
            caseId: caseRecord.id,
            userId: data.createdBy,
            action: 'CREATE_CASE',
            details: { caseNumber },
            timestamp: new Date()
          }
        });

        return caseRecord;
      });

      return newCase;
    } catch (error) {
      throw new AppError('Failed to create case', 500, error);
    }
  }

  async updateCase(caseId: string, data: UpdateCaseRequest, userId: string): Promise<ICSRCase> {
    try {
      // 권한 확인
      await this.checkCasePermission(caseId, userId);

      const updatedCase = await this.prisma.$transaction(async (tx) => {
        // 케이스 업데이트
        const updated = await tx.case.update({
          where: { id: caseId },
          data: {
            status: data.status,
            updatedBy: userId,
            updatedAt: new Date(),
            
            // 환자 정보 업데이트
            patient: data.patient ? {
              upsert: {
                create: data.patient,
                update: data.patient
              }
            } : undefined
          },
          include: {
            patient: true,
            drugs: true,
            events: true,
            aiPredictions: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        });

        // 의약품 정보 업데이트
        if (data.drugs) {
          await tx.drug.deleteMany({ where: { caseId } });
          await tx.drug.createMany({
            data: data.drugs.map(drug => ({ ...drug, caseId }))
          });
        }

        // 이상사례 정보 업데이트
        if (data.events) {
          await tx.event.deleteMany({ where: { caseId } });
          await tx.event.createMany({
            data: data.events.map(event => ({ ...event, caseId }))
          });
        }

        // 감사 로그
        await tx.auditLog.create({
          data: {
            caseId,
            userId,
            action: 'UPDATE_CASE',
            details: data,
            timestamp: new Date()
          }
        });

        return updated;
      });

      return updatedCase;
    } catch (error) {
      throw new AppError('Failed to update case', 500, error);
    }
  }

  private buildWhereClause(filters?: CaseFilters, userId?: string) {
    const where: any = {};

    // 사용자별 권한 필터링
    if (userId) {
      where.OR = [
        { createdBy: userId },
        { assignedTo: userId },
        // 관리자 권한 확인은 middleware에서 처리
      ];
    }

    if (filters) {
      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.searchTerm) {
        where.OR = [
          { caseNumber: { contains: filters.searchTerm } },
          { patient: { initials: { contains: filters.searchTerm } } },
          { drugs: { some: { name: { contains: filters.searchTerm } } } }
        ];
      }

      if (filters.dateRange) {
        where.createdAt = {
          gte: filters.dateRange.from,
          lte: filters.dateRange.to
        };
      }
    }

    return where;
  }

  private async generateCaseNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // 연월별 카운터 조회/증가
    const counter = await this.prisma.caseCounter.upsert({
      where: { yearMonth: `${year}${month}` },
      update: { count: { increment: 1 } },
      create: { yearMonth: `${year}${month}`, count: 1 }
    });

    return `KR${year}${month}${String(counter.count).padStart(4, '0')}`;
  }

  private async checkCasePermission(caseId: string, userId: string): Promise<void> {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
      select: { createdBy: true, assignedTo: true }
    });

    if (!caseData) {
      throw new AppError('Case not found', 404);
    }

    if (caseData.createdBy !== userId && caseData.assignedTo !== userId) {
      throw new AppError('Access denied', 403);
    }
  }
}
```

### 4.4 데이터베이스 설계 (Prisma Schema)

#### **<코드 6>** Prisma 스키마 정의
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  username      String   @unique
  firstName     String
  lastName      String
  role          Role     @default(USER)
  senderID      String?  // MFDS Sender ID
  organization  String?
  isActive      Boolean  @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  createdCases  Case[]   @relation("CaseCreatedBy")
  assignedCases Case[]   @relation("CaseAssignedTo")
  auditLogs     AuditLog[]
  
  @@map("users")
}

model Case {
  id              String      @id @default(cuid())
  caseNumber      String      @unique
  senderID        String
  receiverID      String
  reportType      ReportType  @default(INITIAL)
  status          CaseStatus  @default(DRAFT)
  priority        Priority    @default(NORMAL)
  
  // AI Processing
  aiProcessed     Boolean     @default(false)
  aiProcessedAt   DateTime?
  aiModelVersion  String?
  
  // Tracking
  createdBy       String
  createdUser     User        @relation("CaseCreatedBy", fields: [createdBy], references: [id])
  assignedTo      String?
  assignedUser    User?       @relation("CaseAssignedTo", fields: [assignedTo], references: [id])
  
  // Timestamps
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  submittedAt     DateTime?
  
  // Relations
  patient         Patient?
  drugs           Drug[]
  events          Event[]
  aiPredictions   AIPrediction[]
  submissions     RegulatorySubmission[]
  auditLogs       AuditLog[]
  attachments     Attachment[]
  
  @@map("cases")
  @@index([senderID])
  @@index([status])
  @@index([createdAt])
}

model Patient {
  id              String    @id @default(cuid())
  caseId          String    @unique
  case            Case      @relation(fields: [caseId], references: [id], onDelete: Cascade)
  
  // Patient Information (Encrypted)
  initials        String
  dateOfBirth     DateTime?
  age             Int?
  ageUnit         AgeUnit   @default(YEARS)
  gender          Gender?
  weight          Float?
  height          Float?
  
  // Medical History
  medicalHistory  String?   // Encrypted JSON
  allergies       String?   // Encrypted JSON
  concomitantMeds String?   // Encrypted JSON
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@map("patients")
}

model Drug {
  id                  String    @id @default(cuid())
  caseId              String
  case                Case      @relation(fields: [caseId], references: [id], onDelete: Cascade)
  
  // Drug Information
  name                String
  activeIngredient    String?
  strength            String?
  formulation         String?
  manufacturer        String?
  batchLotNumber      String?
  
  // Dosing Information
  dose                String?
  unit                String?
  frequency           String?
  route               String?
  startDate           DateTime?
  endDate             DateTime?
  
  // Indication and Action
  indication          String?
  actionTaken         String?
  
  // MedDRA Coding
  meddraCode          String?
  meddraVersion       String?
  
  // Korean Specific
  koreanProductCode   String?   // 품목기준코드
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@map("drugs")
  @@index([caseId])
}

model Event {
  id              String      @id @default(cuid())
  caseId          String
  case            Case        @relation(fields: [caseId], references: [id], onDelete: Cascade)
  
  // Event Description
  verbatimTerm    String
  description     String?
  
  // Timing
  onsetDate       DateTime?
  endDate         DateTime?
  duration        String?
  
  // Severity and Outcome
  seriousness     Seriousness @default(NON_SERIOUS)
  severity        Severity?
  outcome         Outcome?
  
  // MedDRA Coding
  ptCode          String?
  ptName          String?
  socCode         String?
  socName         String?
  meddraVersion   String?
  
  // Causality Assessment
  causalityWHO    String?     // WHO-UMC Scale
  causalityKRCT   String?     // KRCT Scale
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@map("events")
  @@index([caseId])
}

model AIPrediction {
  id            String    @id @default(cuid())
  caseId        String
  case          Case      @relation(fields: [caseId], references: [id], onDelete: Cascade)
  
  modelName     String
  modelVersion  String
  prediction    Json      // AI 예측 결과 (JSON)
  confidence    Float     // 0.0 - 1.0
  processingTime Float?   // 처리 시간 (seconds)
  
  // Human Review
  humanReviewed Boolean   @default(false)
  reviewedBy    String?
  reviewedAt    DateTime?
  accepted      Boolean?
  feedback      String?
  
  createdAt     DateTime  @default(now())
  
  @@map("ai_predictions")
  @@index([caseId])
  @@index([modelName, modelVersion])
}

model RegulatorySubmission {
  id              String            @id @default(cuid())
  caseId          String
  case            Case              @relation(fields: [caseId], references: [id], onDelete: Cascade)
  
  authority       String            // MFDS, FDA, EMA, etc.
  submissionType  SubmissionType
  xmlContent      String            // Generated XML
  
  status          SubmissionStatus  @default(PENDING)
  submittedAt     DateTime?
  acknowledgedAt  DateTime?
  ackMessage      String?           // ACK/NACK message
  
  // Retry Logic
  retryCount      Int               @default(0)
  maxRetries      Int               @default(3)
  nextRetryAt     DateTime?
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  @@map("regulatory_submissions")
  @@index([caseId])
  @@index([authority])
  @@index([status])
}

model AuditLog {
  id          String    @id @default(cuid())
  caseId      String?
  case        Case?     @relation(fields: [caseId], references: [id], onDelete: Cascade)
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  
  action      String    // CREATE_CASE, UPDATE_CASE, SUBMIT_CASE, etc.
  details     Json?     // Action details
  ipAddress   String?
  userAgent   String?
  
  timestamp   DateTime  @default(now())
  
  @@map("audit_logs")
  @@index([caseId])
  @@index([userId])
  @@index([timestamp])
}

model CaseCounter {
  yearMonth   String    @id  // YYYYMM format
  count       Int       @default(0)
  
  @@map("case_counters")
}

// Enums
enum Role {
  SUPER_ADMIN
  ADMIN
  MANAGER
  REVIEWER
  USER
}

enum CaseStatus {
  DRAFT
  IN_PROGRESS
  AI_PROCESSED
  REVIEWED
  APPROVED
  SUBMITTED
  COMPLETED
  ERROR
  REJECTED
}

enum ReportType {
  INITIAL
  FOLLOWUP
  CORRECTION
  NULLIFICATION
}

enum Priority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum Gender {
  MALE
  FEMALE
  UNKNOWN
}

enum AgeUnit {
  YEARS
  MONTHS
  WEEKS
  DAYS
  HOURS
}

enum Seriousness {
  SERIOUS
  NON_SERIOUS
}

enum Severity {
  MILD
  MODERATE
  SEVERE
}

enum Outcome {
  RECOVERED
  RECOVERING
  NOT_RECOVERED
  RECOVERED_WITH_SEQUELAE
  FATAL
  UNKNOWN
}

enum SubmissionType {
  INITIAL
  FOLLOWUP
  CORRECTION
  NULLIFICATION
}

enum SubmissionStatus {
  PENDING
  SUBMITTED
  ACKNOWLEDGED
  REJECTED
  ERROR
}
```

---

## 🤖 5. AI Engine 상세 설계

### 5.1 AI 서비스 아키텍처

#### **<코드 7>** AI Processing Service
```python
# src/ai/services/ai_processing_service.py
import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sentence_transformers import SentenceTransformer
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd

from ..models.meddra_mapper import MedDRAMapper
from ..models.causality_assessor import CausalityAssessor
from ..models.seriousness_classifier import SeriousnessClassifier
from ..utils.text_preprocessor import TextPreprocessor
from ..config import AI_CONFIG

logger = logging.getLogger(__name__)

class AIProcessingService:
    """AI 기반 ICSR 처리 서비스"""
    
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.models = {}
        self.tokenizers = {}
        self.text_preprocessor = TextPreprocessor()
        
        # NLP 모델 로드
        self.nlp = spacy.load("ko_core_news_sm")  # 한국어 모델
        self.nlp_en = spacy.load("en_core_web_sm")  # 영어 모델
        
        # 초기화
        self._load_models()
        
    def _load_models(self):
        """AI 모델들을 메모리에 로드"""
        try:
            logger.info("Loading AI models...")
            
            # MedDRA 매핑 모델
            self.meddra_mapper = MedDRAMapper(
                model_path=AI_CONFIG['MEDDRA_MODEL_PATH'],
                device=self.device
            )
            
            # 인과관계 평가 모델
            self.causality_assessor = CausalityAssessor(
                model_path=AI_CONFIG['CAUSALITY_MODEL_PATH'],
                device=self.device
            )
            
            # 중대성 분류 모델
            self.seriousness_classifier = SeriousnessClassifier(
                model_path=AI_CONFIG['SERIOUSNESS_MODEL_PATH'],
                device=self.device
            )
            
            # BioBERT 토크나이저 및 모델
            self.tokenizer = AutoTokenizer.from_pretrained(
                'dmis-lab/biobert-base-cased-v1.1'
            )
            
            logger.info("All AI models loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading AI models: {str(e)}")
            raise

    async def process_case_data(
        self, 
        case_data: Dict[str, Any], 
        process_types: List[str]
    ) -> Dict[str, Any]:
        """
        케이스 데이터를 AI로 처리
        
        Args:
            case_data: ICSR 케이스 데이터
            process_types: 처리할 AI 작업 유형 리스트
                          ['extract', 'classify', 'meddra', 'causality', 'validate']
        
        Returns:
            처리 결과 딕셔너리
        """
        start_time = datetime.now()
        results = {
            'case_id': case_data.get('id'),
            'processed_at': start_time,
            'processing_time': 0,
            'results': {},
            'confidence_scores': {},
            'errors': []
        }
        
        try:
            # 병렬 처리를 위한 태스크 생성
            tasks = []
            
            if 'extract' in process_types:
                tasks.append(self._extract_medical_entities(case_data))
                
            if 'classify' in process_types:
                tasks.append(self._classify_case_attributes(case_data))
                
            if 'meddra' in process_types:
                tasks.append(self._map_to_meddra(case_data))
                
            if 'causality' in process_types:
                tasks.append(self._assess_causality(case_data))
                
            if 'validate' in process_types:
                tasks.append(self._validate_data_quality(case_data))
            
            # 병렬 실행
            task_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # 결과 통합
            for i, result in enumerate(task_results):
                if isinstance(result, Exception):
                    results['errors'].append(str(result))
                else:
                    results['results'].update(result)
            
            # 전체 신뢰도 점수 계산
            confidence_scores = [
                score for score in results.get('confidence_scores', {}).values()
                if isinstance(score, (int, float))
            ]
            
            if confidence_scores:
                results['overall_confidence'] = sum(confidence_scores) / len(confidence_scores)
            else:
                results['overall_confidence'] = 0.0
            
            # 처리 시간 계산
            end_time = datetime.now()
            results['processing_time'] = (end_time - start_time).total_seconds()
            
            logger.info(
                f"Case {case_data.get('id')} processed in "
                f"{results['processing_time']:.2f} seconds"
            )
            
        except Exception as e:
            logger.error(f"Error processing case {case_data.get('id')}: {str(e)}")
            results['errors'].append(str(e))
        
        return results

    async def _extract_medical_entities(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """의료 개체명 추출"""
        try:
            results = {
                'extracted_entities': {},
                'confidence_scores': {}
            }
            
            # 자유텍스트 필드들에서 개체명 추출
            text_fields = [
                case_data.get('narrative', ''),
                case_data.get('medical_history', ''),
                case_data.get('event_description', '')
            ]
            
            full_text = ' '.join(filter(None, text_fields))
            
            if not full_text.strip():
                return results
            
            # 언어 감지
            language = self._detect_language(full_text)
            nlp_model = self.nlp if language == 'ko' else self.nlp_en
            
            # 텍스트 전처리
            processed_text = self.text_preprocessor.preprocess(full_text, language)
            
            # spaCy를 사용한 개체명 인식
            doc = nlp_model(processed_text)
            
            entities = {
                'drugs': [],
                'symptoms': [],
                'medical_conditions': [],
                'procedures': [],
                'dates': [],
                'persons': [],
                'organizations': []
            }
            
            for ent in doc.ents:
                entity_info = {
                    'text': ent.text,
                    'label': ent.label_,
                    'start': ent.start_char,
                    'end': ent.end_char,
                    'confidence': 0.8  # spaCy confidence placeholder
                }
                
                # 엔티티 유형별 분류
                if ent.label_ in ['DRUG', 'MEDICATION']:
                    entities['drugs'].append(entity_info)
                elif ent.label_ in ['SYMPTOM', 'DISEASE', 'CONDITION']:
                    entities['symptoms'].append(entity_info)
                elif ent.label_ in ['DATE', 'TIME']:
                    entities['dates'].append(entity_info)
                elif ent.label_ in ['PERSON']:
                    entities['persons'].append(entity_info)
                elif ent.label_ in ['ORG']:
                    entities['organizations'].append(entity_info)
            
            # 규칙 기반 추가 추출
            drug_entities = await self._extract_drugs_with_rules(processed_text)
            entities['drugs'].extend(drug_entities)
            
            # 중복 제거
            for category in entities:
                entities[category] = self._remove_duplicate_entities(entities[category])
            
            results['extracted_entities'] = entities
            results['confidence_scores']['extraction'] = 0.85
            
            return results
            
        except Exception as e:
            logger.error(f"Error in entity extraction: {str(e)}")
            raise

    async def _map_to_meddra(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """MedDRA 자동 매핑"""
        try:
            results = {
                'meddra_mappings': [],
                'confidence_scores': {}
            }
            
            # 이상사례 용어들 추출
            adverse_events = []
            
            # 케이스 데이터에서 이상사례 용어 수집
            if 'events' in case_data:
                for event in case_data['events']:
                    if event.get('verbatim_term'):
                        adverse_events.append({
                            'verbatim_term': event['verbatim_term'],
                            'description': event.get('description', ''),
                            'event_id': event.get('id')
                        })
            
            if not adverse_events:
                return results
            
            # 각 이상사례에 대해 MedDRA 매핑 수행
            for event in adverse_events:
                mappings = await self.meddra_mapper.map_term(
                    verbatim_term=event['verbatim_term'],
                    context=event.get('description', ''),
                    top_k=5
                )
                
                event_mapping = {
                    'event_id': event.get('event_id'),
                    'verbatim_term': event['verbatim_term'],
                    'suggested_mappings': mappings
                }
                
                results['meddra_mappings'].append(event_mapping)
            
            # 전체 매핑 신뢰도 계산
            all_confidences = []
            for mapping in results['meddra_mappings']:
                for suggestion in mapping['suggested_mappings']:
                    all_confidences.append(suggestion['confidence'])
            
            if all_confidences:
                results['confidence_scores']['meddra_mapping'] = (
                    sum(all_confidences) / len(all_confidences)
                )
            
            return results
            
        except Exception as e:
            logger.error(f"Error in MedDRA mapping: {str(e)}")
            raise

    async def _assess_causality(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """인과관계 자동 평가"""
        try:
            results = {
                'causality_assessments': [],
                'confidence_scores': {}
            }
            
            if not case_data.get('drugs') or not case_data.get('events'):
                return results
            
            # 약물-이상사례 쌍별 인과관계 평가
            for drug in case_data['drugs']:
                for event in case_data['events']:
                    assessment = await self.causality_assessor.assess(
                        drug_info=drug,
                        event_info=event,
                        patient_info=case_data.get('patient', {}),
                        timing_info={
                            'drug_start': drug.get('start_date'),
                            'drug_end': drug.get('end_date'),
                            'event_onset': event.get('onset_date'),
                            'event_end': event.get('end_date')
                        }
                    )
                    
                    results['causality_assessments'].append({
                        'drug_id': drug.get('id'),
                        'drug_name': drug.get('name'),
                        'event_id': event.get('id'),
                        'event_term': event.get('verbatim_term'),
                        'who_umc_scale': assessment['who_umc'],
                        'krct_scale': assessment['krct'],
                        'confidence': assessment['confidence'],
                        'reasoning': assessment['reasoning']
                    })
            
            # 평균 신뢰도 계산
            confidences = [
                assessment['confidence'] 
                for assessment in results['causality_assessments']
            ]
            
            if confidences:
                results['confidence_scores']['causality'] = sum(confidences) / len(confidences)
            
            return results
            
        except Exception as e:
            logger.error(f"Error in causality assessment: {str(e)}")
            raise

    def _detect_language(self, text: str) -> str:
        """텍스트 언어 감지"""
        try:
            # 한글 문자 비율 계산
            korean_chars = sum(1 for char in text if '\uac00' <= char <= '\ud7a3')
            total_chars = len(text.replace(' ', ''))
            
            if total_chars == 0:
                return 'en'
            
            korean_ratio = korean_chars / total_chars
            return 'ko' if korean_ratio > 0.3 else 'en'
            
        except Exception:
            return 'en'  # 기본값

    def _remove_duplicate_entities(self, entities: List[Dict]) -> List[Dict]:
        """중복 개체 제거"""
        seen = set()
        unique_entities = []
        
        for entity in entities:
            key = (entity['text'].lower(), entity['label'])
            if key not in seen:
                seen.add(key)
                unique_entities.append(entity)
        
        return unique_entities

    async def _extract_drugs_with_rules(self, text: str) -> List[Dict]:
        """규칙 기반 의약품 추출"""
        # 의약품명 패턴 매칭
        import re
        
        drug_patterns = [
            r'\b([A-Z][a-z]+(?:cillin|mycin|prine|zole|statin))\b',  # 일반적인 의약품 접미사
            r'\b(\w+(?:정|캡슐|시럽|연고|주사))\b',  # 한국어 제형
        ]
        
        extracted_drugs = []
        for pattern in drug_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                extracted_drugs.append({
                    'text': match.group(1),
                    'label': 'DRUG',
                    'start': match.start(),
                    'end': match.end(),
                    'confidence': 0.7
                })
        
        return extracted_drugs
```

#### **<코드 8>** MedDRA 매핑 모델
```python
# src/ai/models/meddra_mapper.py
import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer
from sentence_transformers import SentenceTransformer
import pickle
import numpy as np
from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)

class MedDRAMapper:
    """MedDRA 자동 매핑을 위한 AI 모델"""
    
    def __init__(self, model_path: str, device: torch.device):
        self.device = device
        self.model_path = model_path
        
        # 모델 및 리소스 로드
        self._load_resources()
        
    def _load_resources(self):
        """필요한 리소스들 로드"""
        try:
            # Sentence Transformer 모델 (의미적 유사도)
            self.sentence_model = SentenceTransformer(
                'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
            ).to(self.device)
            
            # MedDRA 사전 로드
            with open(f'{self.model_path}/meddra_dict.pkl', 'rb') as f:
                self.meddra_dict = pickle.load(f)
            
            # 사전 계산된 MedDRA PT 임베딩 로드
            self.meddra_embeddings = np.load(f'{self.model_path}/meddra_embeddings.npy')
            
            # PT 코드 -> 인덱스 매핑
            with open(f'{self.model_path}/pt_to_idx.pkl', 'rb') as f:
                self.pt_to_idx = pickle.load(f)
            
            # 인덱스 -> PT 정보 매핑
            with open(f'{self.model_path}/idx_to_pt.pkl', 'rb') as f:
                self.idx_to_pt = pickle.load(f)
            
            # 한국어-영어 번역 매핑 (선택적)
            try:
                with open(f'{self.model_path}/ko_en_mapping.pkl', 'rb') as f:
                    self.ko_en_mapping = pickle.load(f)
            except FileNotFoundError:
                self.ko_en_mapping = {}
            
            logger.info("MedDRA mapping resources loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading MedDRA resources: {str(e)}")
            raise

    async def map_term(
        self, 
        verbatim_term: str, 
        context: str = "",
        top_k: int = 5,
        min_confidence: float = 0.5
    ) -> List[Dict]:
        """
        Verbatim term을 MedDRA PT로 매핑
        
        Args:
            verbatim_term: 원본 이상사례 용어
            context: 추가 컨텍스트 정보
            top_k: 반환할 상위 매핑 개수
            min_confidence: 최소 신뢰도 임계값
            
        Returns:
            매핑 결과 리스트
        """
        try:
            # 입력 텍스트 전처리
            processed_term = self._preprocess_term(verbatim_term)
            
            # 컨텍스트가 있으면 결합
            if context:
                search_text = f"{processed_term} {context}"
            else:
                search_text = processed_term
            
            # 임베딩 생성
            query_embedding = self.sentence_model.encode(
                [search_text], 
                convert_to_tensor=True,
                device=self.device
            )
            
            # 코사인 유사도 계산
            similarities = torch.nn.functional.cosine_similarity(
                query_embedding, 
                torch.tensor(self.meddra_embeddings).to(self.device),
                dim=1
            )
            
            # 상위 k개 결과 추출
            top_scores, top_indices = torch.topk(similarities, k=min(top_k * 2, len(similarities)))
            
            # 결과 생성
            results = []
            for score, idx in zip(top_scores.cpu().numpy(), top_indices.cpu().numpy()):
                if score < min_confidence:
                    continue
                    
                pt_info = self.idx_to_pt[idx]
                
                # 추가 스코어링 (규칙 기반)
                rule_score = self._calculate_rule_based_score(verbatim_term, pt_info['pt_name'])
                combined_score = (score * 0.7) + (rule_score * 0.3)
                
                result = {
                    'pt_code': pt_info['pt_code'],
                    'pt_name': pt_info['pt_name'],
                    'soc_code': pt_info.get('soc_code'),
                    'soc_name': pt_info.get('soc_name'),
                    'hlgt_code': pt_info.get('hlgt_code'),
                    'hlgt_name': pt_info.get('hlgt_name'),
                    'hlt_code': pt_info.get('hlt_code'),
                    'hlt_name': pt_info.get('hlt_name'),
                    'confidence': float(combined_score),
                    'semantic_similarity': float(score),
                    'rule_score': float(rule_score)
                }
                
                results.append(result)
            
            # 최종 신뢰도로 정렬
            results.sort(key=lambda x: x['confidence'], reverse=True)
            
            # 상위 k개만 반환
            return results[:top_k]
            
        except Exception as e:
            logger.error(f"Error mapping term '{verbatim_term}': {str(e)}")
            return []

    def _preprocess_term(self, term: str) -> str:
        """용어 전처리"""
        import re
        
        # 소문자 변환
        processed = term.lower()
        
        # 특수문자 정리
        processed = re.sub(r'[^\w\s가-힣]', ' ', processed)
        
        # 다중 공백 정리
        processed = ' '.join(processed.split())
        
        return processed.strip()

    def _calculate_rule_based_score(self, verbatim_term: str, pt_name: str) -> float:
        """규칙 기반 스코어 계산"""
        score = 0.0
        
        verbatim_lower = verbatim_term.lower()
        pt_lower = pt_name.lower()
        
        # 정확한 매치
        if verbatim_lower == pt_lower:
            score += 1.0
        
        # 부분 문자열 매치
        elif verbatim_lower in pt_lower or pt_lower in verbatim_lower:
            score += 0.8
        
        # 단어별 매치
        verbatim_words = set(verbatim_lower.split())
        pt_words = set(pt_lower.split())
        
        if verbatim_words and pt_words:
            intersection = verbatim_words.intersection(pt_words)
            union = verbatim_words.union(pt_words)
            jaccard_score = len(intersection) / len(union)
            score += jaccard_score * 0.6
        
        # 동의어 매치 (사전 정의된 동의어가 있는 경우)
        synonym_score = self._check_synonyms(verbatim_lower, pt_lower)
        score += synonym_score * 0.4
        
        return min(score, 1.0)

    def _check_synonyms(self, term1: str, term2: str) -> float:
        """동의어 확인"""
        # 간단한 동의어 사전 (실제로는 더 포괄적인 사전 필요)
        synonyms = {
            '두통': ['headache', 'cephalgia'],
            '복통': ['abdominal pain', 'stomach ache'],
            '설사': ['diarrhea', 'loose stool'],
            '구토': ['vomiting', 'emesis'],
            '발열': ['fever', 'pyrexia'],
            '어지러움': ['dizziness', 'vertigo']
        }
        
        score = 0.0
        
        for key, values in synonyms.items():
            if key in term1:
                for synonym in values:
                    if synonym in term2:
                        score = 1.0
                        break
            elif key in term2:
                for synonym in values:
                    if synonym in term1:
                        score = 1.0
                        break
        
        return score

    def retrain_model(self, training_data: List[Dict]):
        """모델 재훈련 (피드백 기반)"""
        # 사용자 피드백을 바탕으로 모델 성능 개선
        # 실제 구현에서는 더 복잡한 재훈련 로직 필요
        logger.info("Model retraining initiated with new feedback data")
        # TODO: 재훈련 로직 구현
```

### 5.2 XML 생성 서비스

#### **<코드 9>** E2B XML 생성기
```typescript
// src/services/xmlGeneratorService.ts
import { create } from 'xmlbuilder2';
import { ICSRCase } from '../types/case.types';
import { ValidationService } from './validationService';
import { AppError } from '../utils/AppError';

export class XMLGeneratorService {
  constructor(private validationService: ValidationService) {}

  async generateE2BXML(caseData: ICSRCase): Promise<string> {
    try {
      // 데이터 검증
      const validationResult = await this.validationService.validateForXML(caseData);
      if (!validationResult.isValid) {
        throw new AppError('Case data validation failed', 400, validationResult.errors);
      }

      const root = create({
        version: '1.0',
        encoding: 'UTF-8'
      }).ele('ichicsr', {
        'xmlns': 'http://www.ich.org/ICSR/xmlschema/20100718',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'http://www.ich.org/ICSR/xmlschema/20100718 ICH_ICSR_v2.1.xsd',
        'lang': caseData.language || 'ko'
      });

      // N.1 Message Header
      const messageHeader = root.ele('ichicsrmessageheader');
      messageHeader.ele('messagetype').txt('ichicsr');
      messageHeader.ele('messageformatversion').txt('2.1');
      messageHeader.ele('messageformatrelease').txt('2.0');
      messageHeader.ele('messagenumb').txt(caseData.batchNumber || this.generateBatchNumber());
      messageHeader.ele('messagesenderidentifier').txt(caseData.senderID);
      messageHeader.ele('messagereceiveridentifier').txt(caseData.receiverID);
      messageHeader.ele('messagedateformat').txt('102');
      messageHeader.ele('messagedate').txt(this.formatDate(new Date()));

      // N.2 Safety Report
      const safetyReport = root.ele('safetyreport');
      
      // N.2.r ICSR
      const safetyReportVersion = safetyReport.ele('safetyreportversion').txt('1');
      const safetyReportId = safetyReport.ele('safetyreportid').txt(caseData.caseNumber);
      
      // Primary Source
      const primarySource = safetyReport.ele('primarysource');
      
      if (caseData.patient) {
        // C.1 Case Information
        this.addCaseInformation(safetyReport, caseData);
        
        // C.2 Primary Source Information
        this.addPrimarySourceInformation(primarySource, caseData);
        
        // C.3 Information on Sender of the Report  
        this.addSenderInformation(safetyReport, caseData);
        
        // D Patient Information
        this.addPatientInformation(safetyReport, caseData.patient);
        
        // E Medical History
        if (caseData.patient.medicalHistory) {
          this.addMedicalHistory(safetyReport, caseData.patient);
        }
        
        // G Drug Information
        if (caseData.drugs && caseData.drugs.length > 0) {
          this.addDrugInformation(safetyReport, caseData.drugs);
        }
        
        // H Narrative Case Summary
        this.addNarrativeSummary(safetyReport, caseData);
      }

      // XML 생성 및 포맷팅
      const xmlString = root.end({ 
        prettyPrint: true,
        indent: '  ',
        newline: '\n'
      });

      // 최종 검증
      await this.validateXMLSchema(xmlString);

      return xmlString;

    } catch (error) {
      throw new AppError('Failed to generate E2B XML', 500, error);
    }
  }

  private addCaseInformation(safetyReport: any, caseData: ICSRCase): void {
    // C.1.1 Sender's (case) safety report unique identifier
    safetyReport.ele('safetyreportid').txt(caseData.caseNumber);
    
    // C.1.2 Date of creation
    safetyReport.ele('creationdate').txt(this.formatDate(caseData.createdAt));
    
    // C.1.3 Type of report
    const reportType = this.mapReportType(caseData.reportType);
    safetyReport.ele('reporttype').txt(reportType);
    
    // C.1.4 Date of this report
    safetyReport.ele('reportdate').txt(this.formatDate(caseData.updatedAt || caseData.createdAt));
    
    // C.1.5 Date report was first received from source
    safetyReport.ele('receiptdate').txt(this.formatDate(caseData.createdAt));
    
    // C.1.6 Date of most recent information for this report
    safetyReport.ele('receivedate').txt(this.formatDate(caseData.updatedAt || caseData.createdAt));
    
    // C.1.7 Is this an expedited report?
    safetyReport.ele('serious').txt(this.isExpeditedReport(caseData) ? '1' : '2');
    
    // C.1.8.1 Worldwide unique case identification number
    safetyReport.ele('companynumb').txt(caseData.caseNumber);
  }

  private addPatientInformation(safetyReport: any, patient: any): void {
    const patientElement = safetyReport.ele('patient');
    
    // D.1 Patient (name or initials)
    if (patient.initials) {
      patientElement.ele('patientinitial').txt(patient.initials);
    }
    
    // D.2 Age information
    if (patient.age) {
      patientElement.ele('patientage').txt(patient.age.toString());
      patientElement.ele('patientageunit').txt(this.mapAgeUnit(patient.ageUnit || 'YEARS'));
    }
    
    // D.3 Date of birth
    if (patient.dateOfBirth) {
      patientElement.ele('patientdateofbirth').txt(this.formatDate(patient.dateOfBirth));
    }
    
    // D.4 Age group
    const ageGroup = this.calculateAgeGroup(patient.age);
    if (ageGroup) {
      patientElement.ele('patientagegroup').txt(ageGroup);
    }
    
    // D.5 Sex
    if (patient.gender) {
      patientElement.ele('patientsex').txt(this.mapGender(patient.gender));
    }
    
    // D.6 Last menstrual period date
    // D.7.1 Medical record number
    // D.7.2 Investigation number
    // D.8 Weight (kg)
    if (patient.weight) {
      patientElement.ele('patientweight').txt(patient.weight.toString());
    }
    
    // D.9 Height (cm)
    if (patient.height) {
      patientElement.ele('patientheight').txt(patient.height.toString());
    }
  }

  private addDrugInformation(safetyReport: any, drugs: any[]): void {
    drugs.forEach((drug, index) => {
      const drugElement = safetyReport.ele('drug');
      
      // G.k.1 Characterisation of drug role
      drugElement.ele('drugcharacterization').txt('1'); // Suspect
      
      // G.k.2.2 Medicinal product name
      if (drug.name) {
        const medProduct = drugElement.ele('medicinalproduct');
        medProduct.txt(drug.name);
      }
      
      // G.k.2.3 Substance/specified substance name
      if (drug.activeIngredient) {
        const activeSubstance = drugElement.ele('activesubstance');
        const substanceName = activeSubstance.ele('activesubstancename');
        substanceName.txt(drug.activeIngredient);
      }
      
      // G.k.3 Holder and authorisation/application number of drug
      // G.k.4 Dosage information
      if (drug.dose || drug.unit || drug.frequency) {
        const drugDosage = drugElement.ele('drugdosagetext');
        const dosageText = `${drug.dose || ''} ${drug.unit || ''} ${drug.frequency || ''}`.trim();
        drugDosage.txt(dosageText);
      }
      
      // G.k.5 Pharmaceutical dose form
      if (drug.formulation) {
        drugElement.ele('drugdosageform').txt(drug.formulation);
      }
      
      // G.k.6 Route of administration
      if (drug.route) {
        drugElement.ele('drugroute').txt(this.mapRoute(drug.route));
      }
      
      // G.k.7 Indication for use in the case
      if (drug.indication) {
        const drugIndication = drugElement.ele('drugindication');
        drugIndication.txt(drug.indication);
      }
      
      // G.k.8 Action(s) taken with drug
      if (drug.actionTaken) {
        drugElement.ele('actiondrug').txt(this.mapAction(drug.actionTaken));
      }
      
      // G.k.9 Assessment of relatedness of drug to adverse event(s)/reaction(s)
      // This would be added based on causality assessment results
      
      // Korean specific fields
      if (drug.koreanProductCode) {
        const koreanCode = drugElement.ele('drugadditionalinformation');
        // Add Korean specific MedDRA coding here
      }
    });
  }

  private addNarrativeSummary(safetyReport: any, caseData: ICSRCase): void {
    const summary = safetyReport.ele('summary');
    
    // H.1 Case narrative including clinical course, therapeutic measures, outcome
    let narrativeText = '';
    
    // 환자 정보 요약
    if (caseData.patient) {
      narrativeText += `Patient: ${caseData.patient.initials || 'Unknown'}, `;
      narrativeText += `${caseData.patient.age || 'Unknown age'} ${caseData.patient.gender || 'Unknown gender'}. `;
    }
    
    // 의약품 정보 요약
    if (caseData.drugs && caseData.drugs.length > 0) {
      narrativeText += 'Suspected drugs: ';
      narrativeText += caseData.drugs.map(d => d.name).join(', ') + '. ';
    }
    
    // 이상사례 정보 요약
    if (caseData.events && caseData.events.length > 0) {
      narrativeText += 'Adverse events: ';
      narrativeText += caseData.events.map(e => e.verbatimTerm).join(', ') + '. ';
    }
    
    // 추가 서술이 있다면 포함
    if (caseData.narrative) {
      narrativeText += caseData.narrative;
    }
    
    summary.ele('narrativeincludeclinical').txt(narrativeText);
    
    // H.2 Other relevant history including concomitant medication and medical history
    if (caseData.patient?.medicalHistory) {
      summary.ele('reportercomment').txt(caseData.patient.medicalHistory);
    }
    
    // H.4 Sender's diagnosis/syndrome and/or reclassification of reaction/event
    // H.5 Sender's comments
  }

  // 유틸리티 메서드들
  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0].replace(/-/g, '');
  }

  private generateBatchNumber(): string {
    const timestamp = Date.now().toString();
    return `BATCH_${timestamp}`;
  }

  private mapReportType(reportType: string): string {
    const mapping: { [key: string]: string } = {
      'INITIAL': '1',
      'FOLLOWUP': '2',
      'CORRECTION': '3',
      'NULLIFICATION': '4'
    };
    return mapping[reportType] || '1';
  }

  private mapGender(gender: string): string {
    const mapping: { [key: string]: string } = {
      'MALE': '1',
      'FEMALE': '2',
      'UNKNOWN': '0'
    };
    return mapping[gender] || '0';
  }

  private mapAgeUnit(unit: string): string {
    const mapping: { [key: string]: string } = {
      'YEARS': '801',
      'MONTHS': '802', 
      'WEEKS': '803',
      'DAYS': '804',
      'HOURS': '805'
    };
    return mapping[unit] || '801';
  }

  private calculateAgeGroup(age?: number): string | null {
    if (!age) return null;
    
    if (age < 18) return '1'; // Pediatric
    if (age >= 18 && age < 65) return '2'; // Adult
    if (age >= 65) return '3'; // Elderly
    
    return null;
  }

  private isExpeditedReport(caseData: ICSRCase): boolean {
    // 중대한 이상사례인지 확인
    return caseData.events?.some(event => 
      event.seriousness === 'SERIOUS'
    ) || false;
  }

  private mapRoute(route: string): string {
    const mapping: { [key: string]: string } = {
      'ORAL': '001',
      'INTRAVENOUS': '002',
      'INTRAMUSCULAR': '003',
      'SUBCUTANEOUS': '004',
      'TOPICAL': '005'
    };
    return mapping[route.toUpperCase()] || '001';
  }

  private mapAction(action: string): string {
    const mapping: { [key: string]: string } = {
      'DOSE_REDUCED': '1',
      'DOSE_INCREASED': '2', 
      'DOSE_NOT_CHANGED': '3',
      'UNKNOWN': '4',
      'NOT_APPLICABLE': '5',
      'DRUG_WITHDRAWN': '6'
    };
    return mapping[action.toUpperCase()] || '4';
  }

  private async validateXMLSchema(xmlString: string): Promise<void> {
    // XML 스키마 검증 로직
    // 실제 구현에서는 ICH E2B XSD 스키마를 사용하여 검증
    try {
      // libxmljs2 또는 다른 XML 검증 라이브러리 사용
      // const result = validator.validate(xmlString, schemaPath);
      // if (!result.isValid) {
      //   throw new Error('XML schema validation failed');
      // }
    } catch (error) {
      throw new AppError('XML schema validation failed', 400, error);
    }
  }
}
```

---

## 🧪 6. 테스트 전략 및 구현

### 6.1 테스트 계획

#### **<표 9>** 테스트 매트릭스
| 테스트 레벨 | 도구/프레임워크 | 커버리지 목표 | 자동화 | 실행 주기 |
|------------|----------------|-------------|--------|-----------|
| 단위 테스트 | Jest, PyTest | 90% | ✅ | 매 커밋 |
| 통합 테스트 | Supertest, TestContainers | 80% | ✅ | PR 생성시 |
| API 테스트 | Postman/Newman | 100% | ✅ | 배포 전 |
| E2E 테스트 | Playwright | 핵심 플로우 | ✅ | 매일 |
| 성능 테스트 | K6, Artillery | N/A | ✅ | 주간 |
| 보안 테스트 | OWASP ZAP | N/A | ✅ | 월간 |
| AI 모델 테스트 | Custom | 정확도 90%+ | ✅ | 모델 업데이트시 |

### 6.2 테스트 구현

#### **<코드 10>** 단위 테스트 예제
```typescript
// src/services/__tests__/caseService.test.ts
import { CaseService } from '../caseService';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';

const mockPrisma = mockDeep<PrismaClient>();
const mockAIService = {
  processCase: jest.fn(),
  mapToMedDRA: jest.fn()
};
const mockXMLService = {
  generateE2BXML: jest.fn()
};
const mockValidationService = {
  validateCase: jest.fn()
};

describe('CaseService', () => {
  let caseService: CaseService;

  beforeEach(() => {
    mockReset(mockPrisma);
    jest.clearAllMocks();
    
    caseService = new CaseService(
      mockPrisma,
      mockAIService as any,
      mockXMLService as any,
      mockValidationService as any
    );
  });

  describe('createCase', () => {
    it('should create a new ICSR case successfully', async () => {
      // Arrange
      const caseData = {
        senderID: 'MFDS-TEST-001',
        receiverID: 'MFDS-O-KR',
        reportType: 'INITIAL' as const,
        createdBy: 'user-123',
        patient: {
          initials: 'J.D.',
          age: 45,
          gender: 'MALE' as const
        },
        drugs: [{
          name: 'Aspirin',
          activeIngredient: 'Acetylsalicylic acid',
          dose: '100',
          unit: 'mg'
        }],
        events: [{
          verbatimTerm: 'Headache',
          seriousness: 'NON_SERIOUS' as const
        }]
      };

      const expectedCase = {
        id: 'case-123',
        caseNumber: 'KR202509120001',
        ...caseData,
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          case: {
            create: jest.fn().mockResolvedValue(expectedCase)
          },
          auditLog: {
            create: jest.fn().mockResolvedValue({})
          }
        };
        return await callback(mockTx as any);
      });

      // Act
      const result = await caseService.createCase(caseData);

      // Assert
      expect(result).toEqual(expectedCase);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const caseData = {
        senderID: 'MFDS-TEST-001',
        createdBy: 'user-123'
      };

      mockPrisma.$transaction.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(caseService.createCase(caseData))
        .rejects
        .toThrow('Failed to create case');
    });
  });

  describe('getCases', () => {
    it('should return paginated cases with filters', async () => {
      // Arrange
      const params = {
        page: 1,
        limit: 10,
        filters: { status: 'DRAFT' as const },
        userId: 'user-123'
      };

      const mockCases = [
        {
          id: 'case-1',
          caseNumber: 'KR202509120001',
          status: 'DRAFT',
          aiPredictions: [{ confidence: 0.85 }],
          patient: { initials: 'J.D.' },
          drugs: [{ name: 'Aspirin' }],
          events: [{ verbatimTerm: 'Headache' }]
        }
      ];

      mockPrisma.case.findMany.mockResolvedValue(mockCases);
      mockPrisma.case.count.mockResolvedValue(1);

      // Act
      const result = await caseService.getCases(params);

      // Assert
      expect(result.cases).toHaveLength(1);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      });
      expect(result.cases[0].aiConfidence).toBe(0.85);
    });
  });
});
```

#### **<코드 11>** AI 모델 테스트
```python
# tests/ai/test_meddra_mapper.py
import pytest
import torch
from unittest.mock import Mock, patch
from src.ai.models.meddra_mapper import MedDRAMapper

class TestMedDRAMapper:
    @pytest.fixture
    def mock_mapper(self):
        with patch('src.ai.models.meddra_mapper.SentenceTransformer'), \
             patch('builtins.open'), \
             patch('pickle.load'), \
             patch('numpy.load'):
            
            mapper = MedDRAMapper('/fake/path', torch.device('cpu'))
            
            # Mock resources
            mapper.meddra_embeddings = torch.randn(1000, 384).numpy()
            mapper.idx_to_pt = {
                0: {
                    'pt_code': '10019211',
                    'pt_name': 'Headache',
                    'soc_code': '10029205', 
                    'soc_name': 'Nervous system disorders'
                },
                1: {
                    'pt_code': '10000081',
                    'pt_name': 'Abdominal pain',
                    'soc_code': '10017947',
                    'soc_name': 'Gastrointestinal disorders'
                }
            }
            
            return mapper

    @pytest.mark.asyncio
    async def test_map_term_korean_input(self, mock_mapper):
        """한국어 입력에 대한 MedDRA 매핑 테스트"""
        # Arrange
        mock_mapper.sentence_model.encode.return_value = torch.randn(1, 384)
        
        # Act
        results = await mock_mapper.map_term("심한 두통", context="", top_k=3)
        
        # Assert
        assert len(results) <= 3
        assert all(0 <= result['confidence'] <= 1 for result in results)
        assert all('pt_code' in result for result in results)
        assert all('pt_name' in result for result in results)

    @pytest.mark.asyncio
    async def test_map_term_with_context(self, mock_mapper):
        """컨텍스트를 포함한 매핑 테스트"""
        # Arrange
        mock_mapper.sentence_model.encode.return_value = torch.randn(1, 384)
        
        # Act
        results = await mock_mapper.map_term(
            "headache", 
            context="patient experienced severe headache after taking medication",
            top_k=5
        )
        
        # Assert
        assert len(results) <= 5
        assert results[0]['confidence'] >= 0.5  # 최소 신뢰도 확인

    def test_preprocess_term(self, mock_mapper):
        """용어 전처리 테스트"""
        # Test cases
        test_cases = [
            ("SEVERE HEADACHE!!!", "severe headache"),
            ("복통   및   설사", "복통 및 설사"),
            ("Head-ache (severe)", "head ache severe")
        ]
        
        for input_term, expected in test_cases:
            result = mock_mapper._preprocess_term(input_term)
            assert result == expected

    def test_calculate_rule_based_score(self, mock_mapper):
        """규칙 기반 스코어 계산 테스트"""
        # Exact match
        score = mock_mapper._calculate_rule_based_score("headache", "Headache")
        assert score >= 0.8
        
        # Partial match
        score = mock_mapper._calculate_rule_based_score("severe headache", "Headache")
        assert 0.5 <= score <= 0.8
        
        # No match
        score = mock_mapper._calculate_rule_based_score("fever", "Headache")
        assert score < 0.3

    @pytest.mark.asyncio
    async def test_map_term_empty_input(self, mock_mapper):
        """빈 입력에 대한 처리 테스트"""
        results = await mock_mapper.map_term("", context="")
        assert results == []

    @pytest.mark.asyncio
    async def test_map_term_low_confidence_filtering(self, mock_mapper):
        """낮은 신뢰도 결과 필터링 테스트"""
        # Mock low confidence scores
        mock_mapper.sentence_model.encode.return_value = torch.randn(1, 384)
        
        results = await mock_mapper.map_term(
            "unknown symptom", 
            top_k=10,
            min_confidence=0.8
        )
        
        # 높은 임계값으로 인해 결과가 적거나 없어야 함
        assert len(results) <= 10
        assert all(result['confidence'] >= 0.8 for result in results)
```

#### **<코드 12>** E2E 테스트
```typescript
// tests/e2e/case-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('ICSR Case Management', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 대시보드로 이동 확인
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create new ICSR case with AI processing', async ({ page }) => {
    // 새 케이스 생성 페이지로 이동
    await page.click('text=새 케이스 생성');
    await expect(page).toHaveURL('/cases/new');

    // 환자 정보 입력
    await page.fill('input[name="patient.initials"]', 'J.D.');
    await page.fill('input[name="patient.age"]', '45');
    await page.selectOption('select[name="patient.gender"]', 'MALE');

    // 의약품 정보 입력
    await page.click('button:has-text("의약품 추가")');
    await page.fill('input[name="drugs.0.name"]', 'Aspirin 100mg');
    await page.fill('input[name="drugs.0.dose"]', '100');
    await page.selectOption('select[name="drugs.0.unit"]', 'mg');

    // 이상사례 정보 입력
    await page.click('button:has-text("이상사례 추가")');
    await page.fill('input[name="events.0.verbatimTerm"]', '심한 두통');
    await page.fill('textarea[name="events.0.description"]', '약물 복용 후 30분 뒤 발생한 심한 두통');

    // 케이스 저장
    await page.click('button:has-text("저장")');

    // 성공 메시지 확인
    await expect(page.locator('.alert-success')).toContainText('케이스가 성공적으로 생성되었습니다');

    // AI 처리 시작
    await page.click('button:has-text("AI 처리 시작")');
    
    // AI 처리 진행 확인
    await expect(page.locator('.ai-processing-indicator')).toBeVisible();
    await expect(page.locator('text=AI가 데이터를 분석중입니다')).toBeVisible();

    // AI 처리 완료 대기 (최대 30초)
    await expect(page.locator('.ai-processing-complete')).toBeVisible({ timeout: 30000 });

    // MedDRA 매핑 결과 확인
    const meddraSuggestion = page.locator('.meddra-suggestion').first();
    await expect(meddraSuggestion).toContainText('Headache');
    await expect(meddraSuggestion).toContainText('10019211'); // PT Code

    // AI 제안 승인
    await page.click('.meddra-suggestion .accept-button');

    // 케이스 상태 확인
    await expect(page.locator('.case-status')).toContainText('AI처리완료');
  });

  test('should validate and submit case to regulatory authority', async ({ page }) => {
    // 기존 케이스로 이동 (AI 처리 완료 상태)
    await page.goto('/cases/test-case-123');

    // 케이스 검토 및 승인
    await page.click('button:has-text("검토 완료")');
    await page.fill('textarea[name="reviewComments"]', '모든 항목이 적절히 기재되었음');
    await page.click('button:has-text("승인")');

    // 규제기관 제출
    await page.click('button:has-text("규제기관 제출")');
    
    // 제출 확인 모달
    await expect(page.locator('.submit-confirmation-modal')).toBeVisible();
    await page.selectOption('select[name="targetAuthority"]', 'MFDS');
    await page.click('button:has-text("제출 확인")');

    // 제출 진행 상태 확인
    await expect(page.locator('.submission-progress')).toBeVisible();
    await expect(page.locator('text=XML 생성중')).toBeVisible();

    // 제출 완료 확인 (최대 60초)
    await expect(page.locator('.submission-success')).toBeVisible({ timeout: 60000 });
    await expect(page.locator('text=MFDS에 성공적으로 제출되었습니다')).toBeVisible();

    // ACK 메시지 확인
    await page.click('button:has-text("제출 상세 정보")');
    await expect(page.locator('.ack-message')).toContainText('승인됨 (AA)');
  });

  test('should handle AI processing errors gracefully', async ({ page }) => {
    // AI 처리 중 오류가 발생하는 시나리오
    await page.goto('/cases/error-case-456');

    // AI 처리 시작
    await page.click('button:has-text("AI 처리 재시도")');

    // 오류 발생 시 처리
    await expect(page.locator('.error-alert')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.error-alert')).toContainText('AI 처리 중 오류가 발생했습니다');

    // 수동 처리로 전환 옵션 확인
    await expect(page.locator('button:has-text("수동으로 처리")')).toBeVisible();
    
    // 오류 세부 정보 확인
    await page.click('button:has-text("오류 세부정보")');
    await expect(page.locator('.error-details')).toContainText('모델 서버 연결 실패');
  });

  test('should display real-time dashboard metrics', async ({ page }) => {
    await page.goto('/dashboard');

    // 주요 메트릭 확인
    await expect(page.locator('.metric-total-cases')).toContainText(/\d+/);
    await expect(page.locator('.metric-ai-processed')).toContainText(/\d+/);
    await expect(page.locator('.metric-accuracy')).toContainText(/\d+%/);

    // 차트 로딩 확인
    await expect(page.locator('.processing-time-chart')).toBeVisible();
    await expect(page.locator('.ai-accuracy-chart')).toBeVisible();

    // 실시간 업데이트 확인 (5초 대기)
    const initialCaseCount = await page.locator('.metric-total-cases').textContent();
    await page.waitForTimeout(5000);
    
    // 새로고침 없이 데이터 업데이트 확인
    await expect(page.locator('.last-updated')).toContainText('방금 전');
  });
});
```

---

## 🚀 7. 배포 및 DevOps

### 7.1 CI/CD 파이프라인

#### **<코드 13>** GitHub Actions 워크플로우
```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20.x'
  PYTHON_VERSION: '3.11'
  DOCKER_REGISTRY: 'your-registry.com'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: testpassword
          POSTGRES_DB: icsr_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
          cache: 'pip'

      - name: Install dependencies
        run: |
          npm ci
          pip install -r requirements.txt
          pip install -r requirements-test.txt

      - name: Run linting
        run: |
          npm run lint
          flake8 src/
          black --check src/

      - name: Run unit tests
        env:
          DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/icsr_test
          REDIS_URL: redis://localhost:6379
        run: |
          npm run test:coverage
          pytest tests/ --cov=src --cov-report=xml

      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/icsr_test
          REDIS_URL: redis://localhost:6379
        run: |
          npm run test:integration
          python -m pytest tests/integration/

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info,./coverage.xml
          flags: unittests
          name: icsr-ai-coverage

      - name: Run security scan
        run: |
          npm audit --audit-level=high
          safety check -r requirements.txt

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    outputs:
      frontend-image: ${{ steps.build-frontend.outputs.image }}
      backend-image: ${{ steps.build-backend.outputs.image }}
      ai-engine-image: ${{ steps.build-ai.outputs.image }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.DOCKER_REGISTRY }}
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_PASSWORD }}

      - name: Build and push Frontend
        id: build-frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: true
          tags: |
            ${{ env.DOCKER_REGISTRY }}/icsr-ai-frontend:latest
            ${{ env.DOCKER_REGISTRY }}/icsr-ai-frontend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push Backend
        id: build-backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: |
            ${{ env.DOCKER_REGISTRY }}/icsr-ai-backend:latest
            ${{ env.DOCKER_REGISTRY }}/icsr-ai-backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push AI Engine
        id: build-ai
        uses: docker/build-push-action@v5
        with:
          context: ./ai-engine
          file: ./ai-engine/Dockerfile
          push: true
          tags: |
            ${{ env.DOCKER_REGISTRY }}/icsr-ai-engine:latest
            ${{ env.DOCKER_REGISTRY }}/icsr-ai-engine:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Staging
        run: |
          # Kubernetes 배포 스크립트
          envsubst < k8s/staging/deployment.yaml | kubectl apply -f -
          kubectl rollout status deployment/icsr-ai-backend -n staging
          kubectl rollout status deployment/icsr-ai-frontend -n staging
          kubectl rollout status deployment/icsr-ai-engine -n staging

      - name: Run E2E tests
        run: |
          npx playwright test --config=playwright.staging.config.ts

      - name: Performance testing
        run: |
          k6 run tests/performance/load-test.js

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Blue-Green Deployment
        run: |
          # 블루-그린 배포 스크립트
          ./scripts/blue-green-deploy.sh production ${{ github.sha }}

      - name: Health Check
        run: |
          # 헬스 체크 스크립트
          ./scripts/health-check.sh https://icsr-ai.prod.com/health

      - name: Rollback on Failure
        if: failure()
        run: |
          ./scripts/rollback.sh production

  notify:
    needs: [test, build, deploy-production]
    runs-on: ubuntu-latest
    if: always()

    steps:
      - name: Slack Notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#icsr-ai-deployment'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          fields: repo,message,commit,author,action,eventName,ref,workflow
```

### 7.2 Kubernetes 배포 구성

#### **<코드 14>** Kubernetes 배포 매니페스트
```yaml
# k8s/production/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: icsr-ai-prod
  labels:
    name: icsr-ai-prod
    environment: production

---
# k8s/production/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: icsr-ai-config
  namespace: icsr-ai-prod
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  DATABASE_HOST: "postgres-cluster.icsr-ai-prod.svc.cluster.local"
  REDIS_HOST: "redis-cluster.icsr-ai-prod.svc.cluster.local"
  AI_MODEL_ENDPOINT: "http://icsr-ai-engine.icsr-ai-prod.svc.cluster.local:8000"
  MFDS_ENDPOINT: "https://nedrug.mfds.go.kr/api"

---
# k8s/production/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: icsr-ai-secrets
  namespace: icsr-ai-prod
type: Opaque
data:
  DATABASE_PASSWORD: <base64-encoded-password>
  JWT_SECRET: <base64-encoded-secret>
  ENCRYPTION_KEY: <base64-encoded-key>
  MFDS_API_KEY: <base64-encoded-api-key>

---
# k8s/production/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: icsr-ai-backend
  namespace: icsr-ai-prod
  labels:
    app: icsr-ai-backend
    version: v1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: icsr-ai-backend
  template:
    metadata:
      labels:
        app: icsr-ai-backend
        version: v1
    spec:
      containers:
      - name: backend
        image: your-registry.com/icsr-ai-backend:latest
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: PORT
          value: "3000"
        envFrom:
        - configMapRef:
            name: icsr-ai-config
        - secretRef:
            name: icsr-ai-secrets
        
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 5
          failureThreshold: 3

      - name: sidecar-proxy
        image: nginx:1.24
        ports:
        - containerPort: 8080
          name: proxy
        volumeMounts:
        - name: nginx-config
          mountPath: /etc/nginx/conf.d
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"

      volumes:
      - name: nginx-config
        configMap:
          name: nginx-sidecar-config

      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - icsr-ai-backend
              topologyKey: kubernetes.io/hostname

---
# k8s/production/ai-engine-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: icsr-ai-engine
  namespace: icsr-ai-prod
  labels:
    app: icsr-ai-engine
spec:
  replicas: 2
  selector:
    matchLabels:
      app: icsr-ai-engine
  template:
    metadata:
      labels:
        app: icsr-ai-engine
    spec:
      containers:
      - name: ai-engine
        image: your-registry.com/icsr-ai-engine:latest
        ports:
        - containerPort: 8000
          name: http
        env:
        - name: CUDA_VISIBLE_DEVICES
          value: "0"
        - name: MODEL_PATH
          value: "/models"
        
        resources:
          requests:
            memory: "4Gi"
            cpu: "1000m"
            nvidia.com/gpu: 1
          limits:
            memory: "8Gi"
            cpu: "2000m"
            nvidia.com/gpu: 1
        
        volumeMounts:
        - name: model-storage
          mountPath: /models
          readOnly: true
        - name: tmp-storage
          mountPath: /tmp
        
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 60
          periodSeconds: 30
          timeoutSeconds: 20
        
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 10

      volumes:
      - name: model-storage
        persistentVolumeClaim:
          claimName: ai-model-pvc
      - name: tmp-storage
        emptyDir:
          sizeLimit: 10Gi

      nodeSelector:
        accelerator: nvidia-tesla-v100
      
      tolerations:
      - key: nvidia.com/gpu
        operator: Exists
        effect: NoSchedule

---
# k8s/production/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: icsr-ai-backend
  namespace: icsr-ai-prod
  labels:
    app: icsr-ai-backend
spec:
  selector:
    app: icsr-ai-backend
  ports:
  - name: http
    port: 80
    targetPort: 3000
    protocol: TCP
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: icsr-ai-engine
  namespace: icsr-ai-prod
  labels:
    app: icsr-ai-engine
spec:
  selector:
    app: icsr-ai-engine
  ports:
  - name: http
    port: 8000
    targetPort: 8000
    protocol: TCP
  type: ClusterIP

---
# k8s/production/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: icsr-ai-ingress
  namespace: icsr-ai-prod
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "https://icsr-ai.company.com"
spec:
  tls:
  - hosts:
    - api.icsr-ai.company.com
    secretName: icsr-ai-tls
  rules:
  - host: api.icsr-ai.company.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: icsr-ai-backend
            port:
              number: 80
      - path: /ai
        pathType: Prefix
        backend:
          service:
            name: icsr-ai-engine
            port:
              number: 8000

---
# k8s/production/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: icsr-ai-backend-hpa
  namespace: icsr-ai-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: icsr-ai-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

### 7.3 모니터링 및 로깅

#### **<코드 15>** Prometheus 모니터링 설정
```yaml
# k8s/monitoring/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    rule_files:
      - "icsr_ai_rules.yml"
    
    alerting:
      alertmanagers:
        - static_configs:
            - targets:
              - alertmanager:9093
    
    scrape_configs:
    - job_name: 'icsr-ai-backend'
      static_configs:
      - targets: ['icsr-ai-backend.icsr-ai-prod:80']
      metrics_path: '/metrics'
      scrape_interval: 30s
      
    - job_name: 'icsr-ai-engine'
      static_configs:
      - targets: ['icsr-ai-engine.icsr-ai-prod:8000']
      metrics_path: '/metrics'
      scrape_interval: 30s
      
    - job_name: 'postgres'
      static_configs:
      - targets: ['postgres-exporter.icsr-ai-prod:9187']
      
    - job_name: 'redis'
      static_configs:
      - targets: ['redis-exporter.icsr-ai-prod:9121']