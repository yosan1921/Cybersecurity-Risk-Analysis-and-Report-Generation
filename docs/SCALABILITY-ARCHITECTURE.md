# Scalability Architecture Guide

## Overview

This document describes the comprehensive scalability infrastructure implemented in the INSA Risk Assessment System. The system is designed to support seamless technology integration, horizontal scaling, multi-tenant architecture, and performance optimization.

## Architecture Components

### 1. Multi-Tenant Architecture (`tenantManager.ts`)

**Purpose:** Isolate and manage resources for different organizations/departments

**Key Features:**
- Tenant configuration management with caching
- Resource limit validation (assessments, users, storage)
- Tier-based permission system (starter, professional, enterprise)
- Automatic cache expiration (5-minute TTL)

**Usage:**
```typescript
import { tenantManager } from '@/lib/infrastructure/scalability';

// Get tenant configuration
const config = await tenantManager.getTenantConfig('tenant-123');

// Validate resource limits
const check = await tenantManager.validateResourceLimits(
  'tenant-123',
  'assessments',
  currentCount
);

if (!check.allowed) {
  console.log(`Limit reached. Remaining: ${check.remaining}`);
}
```

**Tier Benefits:**
- **Starter:** Basic assessments and reports
- **Professional:** Advanced features + user management
- **Enterprise:** Full customization + SSO + custom branding

---

### 2. Horizontal Scaling (`horizontalScaling.ts`)

**Purpose:** Distribute workload across multiple workers for improved throughput

**Key Features:**
- Worker pool management with health monitoring
- Distributed task queue with priority support
- Automatic task assignment to available workers
- Cluster health metrics

**Usage:**
```typescript
import { horizontalScalingManager } from '@/lib/infrastructure/scalability';

// Register a worker
horizontalScalingManager.registerWorker('worker-1', 10); // capacity: 10

// Queue a task
const task = horizontalScalingManager.queueTask({
  type: 'analysis',
  priority: 'high',
  payload: { questionnaireId: '123' },
  status: 'queued'
});

// Get cluster health
const health = horizontalScalingManager.getClusterHealth();
console.log(`Utilization: ${health.utilizationPercent}%`);
```

**Task Types:**
- `analysis` - Risk analysis processing
- `report` - Report generation
- `export` - Data export operations
- `backup` - System backups

---

### 3. Performance Optimization (`performanceOptimization.ts`)

**Purpose:** Implement multi-level caching and performance monitoring

**Key Features:**
- In-memory cache with LRU eviction
- Automatic TTL-based expiration
- Performance metrics collection
- Cache statistics and optimization hints

**Usage:**
```typescript
import { performanceOptimizationManager } from '@/lib/infrastructure/scalability';

// Cache data
performanceOptimizationManager.set('key', data, 5 * 60 * 1000); // 5 min TTL

// Retrieve from cache
const cached = performanceOptimizationManager.get('key');

// Record metrics
performanceOptimizationManager.recordMetric({
  name: 'api_request',
  duration: 150,
  status: 'success',
  metadata: { endpoint: '/api/analysis' }
});

// Get statistics
const stats = performanceOptimizationManager.getPerformanceStats('api_request');
console.log(`Avg duration: ${stats.avgDuration}ms`);
```

**Cache Configuration:**
- Max size: 1000 entries
- Default TTL: 5 minutes
- LRU eviction when full

---

### 4. Technology Integration (`technologyIntegration.ts`)

**Purpose:** Enable seamless integration of new technologies with fallback support

**Key Features:**
- Adapter-based architecture for pluggable technologies
- Automatic fallback to secondary technology
- Health status monitoring
- Plugin system for extensions

**Supported Adapters:**
- OpenAI (AI)
- OpenRouter (AI)
- Redis (Cache)
- MongoDB (Database)

**Usage:**
```typescript
import {
  technologyIntegrationManager,
  createOpenRouterAdapter,
  createMongoDBAdapter
} from '@/lib/infrastructure/scalability';

// Register adapters
technologyIntegrationManager.registerAdapter(createOpenRouterAdapter());
technologyIntegrationManager.registerAdapter(createMongoDBAdapter());

// Initialize integration
const success = await technologyIntegrationManager.initializeIntegration(
  'openrouter',
  {
    technology: 'openrouter',
    enabled: true,
    config: { apiKey: process.env.OPENROUTER_API_KEY },
    fallback: 'openai',
    priority: 1
  }
);

// Check health
const health = await technologyIntegrationManager.getHealthStatus();
console.log(health); // { openrouter: true, mongodb: true, ... }
```

**Adding New Technology:**
```typescript
const customAdapter: TechnologyAdapter = {
  name: 'custom-service',
  version: '1.0.0',
  type: 'analytics',
  status: 'active',
  initialize: async () => { /* init logic */ },
  validate: async () => { /* validation logic */ },
  shutdown: async () => { /* cleanup logic */ }
};

technologyIntegrationManager.registerAdapter(customAdapter);
```

---

### 5. Data Sharding (`dataSharding.ts`)

**Purpose:** Distribute data across multiple shards for improved query performance

**Key Features:**
- Multiple sharding strategies (hash, range, directory, geographic)
- Shard rebalancing support
- Replica management
- Shard health monitoring

**Sharding Strategies:**

**Hash Sharding:**
```typescript
dataShardingManager.initializeSharding({
  type: 'hash',
  keyField: 'tenantId',
  shardCount: 4
});
```
Best for: Uniform data distribution

**Range Sharding:**
```typescript
dataShardingManager.initializeSharding({
  type: 'range',
  keyField: 'createdAt',
  shardCount: 12 // Monthly shards
});
```
Best for: Time-series data

**Directory Sharding:**
```typescript
dataShardingManager.initializeSharding({
  type: 'directory',
  keyField: 'companyId',
  shardCount: 10
});
```
Best for: Lookup-based distribution

---

### 6. Scalability Middleware (`scalabilityMiddleware.ts`)

**Purpose:** Integrate scalability features into API requests

**Key Features:**
- Tenant context extraction
- Tenant access validation
- Rate limiting per tenant tier
- Request metrics recording

**Usage:**
```typescript
import { withScalability } from '@/lib/infrastructure/middleware/scalabilityMiddleware';

async function handler(request: NextRequest, context: ScalabilityContext) {
  // context contains: tenantId, userId, requestId, startTime
  return NextResponse.json({ success: true });
}

export const POST = withScalability(handler);
```

**Request Headers:**
- `x-tenant-id` - Tenant identifier
- `x-user-id` - User identifier
- `x-request-id` - Request tracking ID

---

### 7. Cache Middleware (`cacheMiddleware.ts`)

**Purpose:** Implement intelligent HTTP caching for API responses

**Key Features:**
- Automatic cache key generation
- GET request caching
- Pattern-based cache invalidation
- Cache statistics

**Usage:**
```typescript
import { withCache } from '@/lib/infrastructure/middleware/cacheMiddleware';

async function handler(request: NextRequest) {
  return NextResponse.json({ data: 'cached' });
}

export const GET = withCache(handler, {
  ttlSeconds: 300,
  keyPrefix: 'reports'
});
```

---

## Configuration

### Environment Variables

```env
# Multi-tenancy
MULTI_TENANCY_ENABLED=true

# Horizontal Scaling
HORIZONTAL_SCALING_ENABLED=true
MIN_WORKERS=2
MAX_WORKERS=10

# Caching
CACHING_STRATEGY=hybrid
CACHE_TTL_SECONDS=300

# Data Sharding
SHARDING_ENABLED=true
SHARD_COUNT=4

# Technology Integration
OPENROUTER_API_KEY=sk-or-v1-...
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
```

### Configuration File

```typescript
import { loadScalabilityConfig, validateScalabilityConfig } from '@/lib/infrastructure/scalability';

const config = loadScalabilityConfig();
const errors = validateScalabilityConfig(config);

if (errors.length > 0) {
  console.error('Configuration errors:', errors);
}
```

---

## Integration with Existing APIs

### Analysis Processing API

The analysis processing API has been enhanced with scalability features:

```typescript
// Before: Single-threaded processing
// After: Distributed task queue with tenant isolation

const task = horizontalScalingManager.queueTask({
  type: 'analysis',
  priority: 'high',
  payload: { questionnaireId, questions, apiKey },
  status: 'queued'
});

// Tenant resource limits are checked
const resourceCheck = await tenantManager.validateResourceLimits(
  tenantId,
  'assessments',
  1
);

// Results are cached with tenant-aware keys
const cacheKey = `analysis_${tenantId}_${analysisId}`;
performanceOptimizationManager.set(cacheKey, results, 30 * 60 * 1000);
```

---

## Performance Optimization Strategies

### 1. Database Query Optimization

```typescript
// Get optimization hints for collections
const hints = performanceOptimizationManager.getQueryOptimizationHints('riskanalyses');
// Returns: [
//   'Create index on tenantId for tenant isolation',
//   'Create compound index on (tenantId, createdAt) for time-series queries',
//   'Create index on company for company-level filtering'
// ]
```

**Recommended Indexes:**
```javascript
// MongoDB
db.riskanalyses.createIndex({ tenantId: 1 });
db.riskanalyses.createIndex({ tenantId: 1, createdAt: -1 });
db.questionnaires.createIndex({ tenantId: 1, status: 1 });
db.users.createIndex({ tenantId: 1, email: 1 }, { unique: true });
```

### 2. Caching Strategy

- **L1 Cache:** In-memory cache (performanceOptimizationManager)
- **L2 Cache:** Redis (if available)
- **L3 Cache:** HTTP cache headers

### 3. Query Optimization

- Use tenant-aware queries to leverage sharding
- Implement pagination for large result sets
- Use projection to fetch only needed fields

---

## Monitoring & Observability

### Health Checks

```typescript
// Check cluster health
const health = horizontalScalingManager.getClusterHealth();
console.log({
  totalWorkers: health.totalWorkers,
  activeWorkers: health.activeWorkers,
  utilizationPercent: health.utilizationPercent,
  queuedTasks: health.queuedTasks
});

// Check technology health
const techHealth = await technologyIntegrationManager.getHealthStatus();
console.log(techHealth); // { openrouter: true, mongodb: true, redis: false }
```

### Performance Metrics

```typescript
// Get performance statistics
const stats = performanceOptimizationManager.getPerformanceStats('api_request');
console.log({
  avgDuration: stats.avgDuration,
  minDuration: stats.minDuration,
  maxDuration: stats.maxDuration,
  successRate: stats.successRate,
  totalRequests: stats.totalRequests
});

// Get cache statistics
const cacheStats = performanceOptimizationManager.getCacheStats();
console.log({
  size: cacheStats.size,
  maxSize: cacheStats.maxSize,
  hitRate: cacheStats.hitRate,
  totalHits: cacheStats.totalHits
});
```

---

## Scaling Scenarios

### Scenario 1: Increasing User Load

**Problem:** Response times degrade as user count increases

**Solution:**
1. Enable horizontal scaling to distribute load
2. Increase worker pool size
3. Implement caching for frequently accessed data
4. Use data sharding to distribute database load

### Scenario 2: Growing Data Volume

**Problem:** Database queries slow down with more data

**Solution:**
1. Implement data sharding by tenant or time period
2. Create appropriate indexes
3. Archive old data
4. Use read replicas for reporting

### Scenario 3: Adding New Technology

**Problem:** Need to integrate new AI provider or database

**Solution:**
1. Create adapter implementing TechnologyAdapter interface
2. Register with technologyIntegrationManager
3. Configure fallback technology
4. Deploy without downtime

### Scenario 4: Multi-Tenant Isolation

**Problem:** Need to ensure data isolation between tenants

**Solution:**
1. Enable multi-tenancy in configuration
2. Use tenant-aware queries
3. Implement data sharding by tenantId
4. Validate tenant access in middleware

---

## Best Practices

### 1. Tenant Context

Always include tenant context in requests:
```typescript
const context = await extractTenantContext(request);
// Use context.tenantId for all database queries
```

### 2. Resource Limits

Check resource limits before operations:
```typescript
const check = await tenantManager.validateResourceLimits(
  tenantId,
  'assessments',
  currentCount
);
if (!check.allowed) {
  return error('Limit exceeded');
}
```

### 3. Caching

Use appropriate TTLs based on data freshness requirements:
```typescript
// Real-time data: 1 minute
performanceOptimizationManager.set(key, data, 60 * 1000);

// Hourly reports: 1 hour
performanceOptimizationManager.set(key, data, 60 * 60 * 1000);

// Static content: 24 hours
performanceOptimizationManager.set(key, data, 24 * 60 * 60 * 1000);
```

### 4. Task Priority

Use appropriate priority for distributed tasks:
```typescript
// Critical operations
horizontalScalingManager.queueTask({
  type: 'analysis',
  priority: 'high', // Processed first
  payload: data
});

// Background operations
horizontalScalingManager.queueTask({
  type: 'backup',
  priority: 'low', // Processed when capacity available
  payload: data
});
```

---

## Troubleshooting

### Issue: High Cache Miss Rate

**Diagnosis:**
```typescript
const stats = performanceOptimizationManager.getCacheStats();
if (stats.hitRate < 50) {
  console.warn('Low cache hit rate');
}
```

**Solutions:**
- Increase cache TTL
- Increase cache size
- Review cache key generation
- Analyze access patterns

### Issue: Worker Pool Underutilized

**Diagnosis:**
```typescript
const health = horizontalScalingManager.getClusterHealth();
if (health.utilizationPercent < 20) {
  console.warn('Low worker utilization');
}
```

**Solutions:**
- Reduce worker count
- Increase task priority
- Review task distribution

### Issue: Tenant Limit Exceeded

**Diagnosis:**
```typescript
const check = await tenantManager.validateResourceLimits(
  tenantId,
  'assessments',
  count
);
if (!check.allowed) {
  console.warn(`Tenant limit exceeded. Remaining: ${check.remaining}`);
}
```

**Solutions:**
- Upgrade tenant tier
- Archive old assessments
- Implement data retention policy

---

## Future Enhancements

1. **Distributed Caching:** Implement Redis-based distributed cache
2. **Auto-Scaling:** Implement Kubernetes-based auto-scaling
3. **Load Balancing:** Add intelligent load balancing across regions
4. **Data Replication:** Implement cross-region data replication
5. **Advanced Analytics:** Add real-time analytics dashboard
6. **Machine Learning:** Implement ML-based workload prediction

---

## References

- [Multi-Tenancy Architecture](https://en.wikipedia.org/wiki/Multitenancy)
- [Horizontal Scaling](https://en.wikipedia.org/wiki/Scalability#Horizontal_and_vertical_scaling)
- [Data Sharding](https://en.wikipedia.org/wiki/Shard_(database_architecture))
- [Cache Strategies](https://en.wikipedia.org/wiki/Cache_(computing))

---

**Last Updated:** March 2026
**Status:** Production Ready
