/**
 * Health Check & Performance Metrics API (CSRARS §3.2.3, §3.2.5)
 * GET /api/health
 */
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
    const start = Date.now();

    let dbStatus = 'disconnected';
    let dbLatencyMs = -1;

    try {
        await dbConnect();
        const dbStart = Date.now();
        await mongoose.connection.db?.admin().ping();
        dbLatencyMs = Date.now() - dbStart;
        dbStatus = 'connected';
    } catch {
        dbStatus = 'error';
    }

    const memUsage = process.memoryUsage();

    return NextResponse.json({
        status: dbStatus === 'connected' ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
            status: dbStatus,
            latencyMs: dbLatencyMs,
        },
        memory: {
            heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
            heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
            rssMB: Math.round(memUsage.rss / 1024 / 1024),
        },
        responseTimeMs: Date.now() - start,
        version: process.env.npm_package_version ?? '0.1.0',
    });
}
