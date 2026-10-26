import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBytesBinary,
  formatBytesDecimal,
  calculateCounterRate,
  formatUptime,
  clampPercent,
} from './metrics';
import { DiagnosticsEngineWeb } from './diagnostics';

test('formatBytesBinary converts accurately to GiB and MiB', () => {
  assert.equal(formatBytesBinary(1024 * 1024), '1.00 MiB');
  assert.equal(formatBytesBinary(16 * 1024 * 1024 * 1024), '16.00 GiB');
  assert.equal(formatBytesBinary(0), '0 B');
});

test('formatBytesDecimal converts accurately to GB and MB', () => {
  assert.equal(formatBytesDecimal(1000 * 1000), '1.00 MB');
  assert.equal(formatBytesDecimal(500 * 1000 * 1000 * 1000), '500.00 GB');
});

test('calculateCounterRate handles delta and avoids counter reset spikes', () => {
  // Normal delta: 2000 bytes over 2 seconds = 1000 B/s
  assert.equal(calculateCounterRate(3000, 1000, 2), 1000);

  // Counter reset / rollover (current < previous): should return 0, never negative or huge spike
  assert.equal(calculateCounterRate(50, 1000, 1), 0);

  // First sample (deltaSeconds <= 0): should return 0
  assert.equal(calculateCounterRate(1000, 1000, 0), 0);
});

test('formatUptime renders readable time units', () => {
  assert.equal(formatUptime(45), '45s');
  assert.equal(formatUptime(125), '2m 5s');
  assert.equal(formatUptime(3665), '1h 1m 5s');
});

test('clampPercent clamps between 0 and 100', () => {
  assert.equal(clampPercent(50.44), 50.4);
  assert.equal(clampPercent(-10), 0);
  assert.equal(clampPercent(150), 100);
});

test('DiagnosticsEngineWeb detects sustained high CPU load after 3 intervals', () => {
  const engine = new DiagnosticsEngineWeb();
  const dummySnapshot = {
    timestamp: Date.now(),
    uptimeSeconds: 1000,
    osName: 'Windows 11',
    osVersion: '10.0',
    cpuModel: 'Intel Core i7',
    physicalCores: 8,
    logicalCores: 8,
    cpuOverallPercent: 92.0,
    cpuPerCorePercent: [92, 92, 92, 92, 92, 92, 92, 92],
    memoryTotalBytes: 16 * 1024 * 1024 * 1024,
    memoryUsedBytes: 4 * 1024 * 1024 * 1024,
    memoryAvailableBytes: 12 * 1024 * 1024 * 1024,
    memoryPercent: 25.0,
    disks: [],
    networks: [],
    netDownloadKbps: 0,
    netUploadKbps: 0,
    diskReadKbps: 0,
    diskWriteKbps: 0,
    isDemo: false,
  };

  // Turn 1 & 2: sustained count increments
  engine.evaluate(dummySnapshot, []);
  engine.evaluate(dummySnapshot, []);
  // Turn 3: threshold breached
  const findings = engine.evaluate(dummySnapshot, []);
  const cpuFinding = findings.find(f => f.category === 'CPU');
  assert.ok(cpuFinding, 'Should produce a CPU diagnostic finding on 3rd sustained reading');
  assert.match(cpuFinding!.title, /Sustained High CPU/);
});
