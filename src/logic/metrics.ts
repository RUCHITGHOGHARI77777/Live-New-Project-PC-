/**
 * Windows X-Ray - System Metrics Math & Conversion Utilities
 */

export interface DiskVolume {
  mount: string;
  label: string;
  fs: string;
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  percent: number;
  readSpeedBps: number;
  writeSpeedBps: number;
}

export interface NetworkInterface {
  id: string;
  name: string;
  type: 'ethernet' | 'wifi' | 'virtual' | 'loopback';
  isUp: boolean;
  speedMbps: number;
  bytesRecvPerSec: number;
  bytesSentPerSec: number;
}

export interface ProcessItem {
  pid: number;
  name: string;
  cpuPercent: number;
  memoryBytes: number;
  memoryPercent: number;
  status: 'running' | 'sleeping' | 'suspended';
  user: string;
}

export interface TelemetrySnapshot {
  timestamp: number;
  uptimeSeconds: number;
  osName: string;
  osVersion: string;
  cpuModel: string;
  physicalCores: number;
  logicalCores: number;
  cpuOverallPercent: number;
  cpuPerCorePercent: number[];
  memoryTotalBytes: number;
  memoryUsedBytes: number;
  memoryAvailableBytes: number;
  memoryPercent: number;
  disks: DiskVolume[];
  networks: NetworkInterface[];
  netDownloadKbps: number;
  netUploadKbps: number;
  diskReadKbps: number;
  diskWriteKbps: number;
  isDemo: boolean;
}

/** Formats byte count into binary units (GiB / MiB / KiB) */
export function formatBytesBinary(bytes: number, decimals: number = 2): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / Math.pow(k, i);
  return `${val.toFixed(decimals)} ${sizes[i]}`;
}

/** Formats byte count into decimal units (GB / MB / KB) */
export function formatBytesDecimal(bytes: number, decimals: number = 2): string {
  if (bytes <= 0) return '0 B';
  const k = 1000;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / Math.pow(k, i);
  return `${val.toFixed(decimals)} ${sizes[i]}`;
}

/** Calculates safe transfer rate from counter delta */
export function calculateCounterRate(
  current: number,
  previous: number,
  deltaSeconds: number
): number {
  if (deltaSeconds <= 0 || previous < 0) return 0;
  const delta = current - previous;
  // If counter reset or rolled over, return 0 instead of negative or spike
  if (delta < 0) return 0;
  return delta / deltaSeconds;
}

/** Formats uptime into human-readable hours and minutes */
export function formatUptime(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

/** Clamps a percentage between 0.0 and 100.0 */
export function clampPercent(val: number): number {
  if (isNaN(val)) return 0;
  return Math.max(0, Math.min(100, Math.round(val * 10) / 10));
}
