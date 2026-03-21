# Scalability Quick Start Guide

## 5-Minute Setup

### Step 1: Initialize Scalability Infrastructure

Add to your application startup (e.g., `app/layout.tsx` or server initialization):

```typescript
import { initializeScalabilityInfrastructure } from '@/lib/infrastructure/scalability';

// Call during app initialization
await initializeScalabilityInfrastructure();
```

### Step 2: Enable Multi-Tenancy

Add to `.env.local`:

```env
MULTI_TENANCY_ENABLED=true
HORIZONTAL_SCALING_ENABLED=true
CACHING_STRATEGY=hybrid
SHARDING_ENABLED=true
SHARD_COUNT=4
```

### Step 3: Update API Routes

Wrap your API handlers with scalability middleware:

```typescript
import { withScalability } from '@/lib/infrastructure/middleware/scalabilityMiddleware';

async function handler(request: NextRequest, context: ScalabilityContext) {
  // Your handler logic
  return NextResponse.json({ success: true });
}

export const POST = withScalability(handler);
```

### Step 4: Add Tenant Headers to Requests

When calling APIs, include tenant context:

```typescript
const response = await fetch('/api/analysis/process', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-tenant-id': 'tenant-123',
    'x-user-id': 'user-456',
    'x-request-id': `req_${Date.now()}`
  },
  body: JSON.stringify({ questionnaireId: '789' })
});
```

---

## Common Use Cases

### Use Case 1: Cache API Response

```typescript
import { withCache } from '@/lib/infrastructure/middleware/cacheMiddleware';

async function getReports(request: NextRequest) {
  // Fetch reports
  return NextResponse.json({ reports: [] });
}

export const GET = withCache(getReports, {
  ttlSeconds: 300,
  keyPrefix: 'reports'
});
```

### Use Case 2: Queue Long-Running Task

```typescript
import { horizontalScalingManager } from '@/lib/infrastructure/scalability';

const task = horizontalScalingManager.queueTask({
  type: 'report',
  priority: 'high',
  payload: { analysisId: '123', format: 'PDF' },
  status: 'queued'
});

console.log(`Task queued: ${task.taskId}`);
```

### Use Case 3: Check Tenant Limits

```typescript
import { tenantManager } from '@/lib/infrastructure/scalability';

const check = await tenantManager.validateResourceLimits(
  'tenant-123',
  'assessments',
  currentAssessmentCount
);

if (!check.allowed) {
  return NextResponse.json(
    { error: `Limit reached. Remaining: ${check.remaining}` },
    { status: 429 }
  );
}
```

### Use Case 4: Monitor Performance

```typescript
import { performanceOptimizationManager } from '@/lib/infrastructure/scalability';

// Get stats for specific metric
const stats = performanceOptimizationManager.getPerformanceStats('api_request');
console.log(`Average response time: ${stats.avgDuration}ms`);
console.log(`Success rate: ${stats.successRate}%`);

// Get cache stats
const cacheStats = performanceOptimizationManager.getCacheStats();
console.log(`Cache hit rate: ${cacheStats.hitRate}%`);
```

### Use Case 5: Add New Technology

```typescript
import { technologyIntegrationManager, type TechnologyAdapter } from '@/lib/infrastructure/scalability';

const customAdapter: TechnologyAdapter = {
  name: 'custom-ai',
  version: '1.0.0',
  type: 'ai',
  status: 'active',
  initialize: async () => {
    console.log('Initializing custom AI...');
  },
  validate: async () => {
    return !!process.env.CUSTOM_AI_KEY;
  },
  shutdown: async () => {
    console.log('Shutting down custom AI');
  }
};

technologyIntegrationManager.registerAdapter(customAdapter);

// Initialize
await technologyIntegrationManager.initializeIntegration('custom-ai', {
  technology: 'custom-ai',
  enabled: true,
  config: { apiKey: process.env.CUSTOM_AI_KEY },
  fallback: 'openrouter',
  priority: 1
});
```

---

## Verification Checklist

- [ ] Scalability infrastructure initializes without errors
- [ ] Multi-tenancy is enabled in environment
- [ ] API routes include scalability middleware
- [ ] Tenant headers are sent with requests
- [ ] Cache is working (check hit rate > 50%)
- [ ] Performance metrics are being recorded
- [ ] Horizontal scaling is enabled
- [ ] Technology integrations are healthy

---

## Performance Targets

After implementing scalability features, you should see:

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time | < 500ms | - |
| Cache Hit Rate | > 70% | - |
| Worker Utilization | 60-80% | - |
| Tenant Isolation | 100% | - |
| Data Sharding | 4+ shards | - |

---

## Troubleshooting

### Scalability not initializing

```bash
# Check logs
npm run dev 2>&1 | grep -i "scalability"

# Verify environment variables
echo $MULTI_TENANCY_ENABLED
echo $HORIZONTAL_SCALING_ENABLED
```

### Tenant context not extracted

```typescript
// Verify headers are being sent
console.log(request.headers.get('x-tenant-id'));
console.log(request.headers.get('x-user-id'));
```

### Cache not working

```typescript
// Check cache stats
const stats = performanceOptimizationManager.getCacheStats();
console.log(stats);

// Verify TTL is appropriate
// Default: 5 minutes (300 seconds)
```

### Workers not processing tasks

```typescript
// Check cluster health
const health = horizontalScalingManager.getClusterHealth();
console.log(health);

// Verify workers are registered
const workers = horizontalScalingManager.getAvailableWorkers();
console.log(`Available workers: ${workers.length}`);
```

---

## Next Steps

1. **Monitor Performance:** Set up monitoring dashboard
2. **Optimize Queries:** Create recommended indexes
3. **Scale Infrastructure:** Add more workers/shards as needed
4. **Integrate Technologies:** Add new AI providers or databases
5. **Implement Auto-Scaling:** Set up automatic scaling based on metrics

---

## Support

For detailed documentation, see:
- `SCALABILITY-ARCHITECTURE.md` - Complete architecture guide
- `lib/infrastructure/scalability/` - Source code with inline documentation
- `lib/infrastructure/middleware/` - Middleware implementations

---

**Last Updated:** March 2026
