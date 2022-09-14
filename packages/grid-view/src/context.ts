import type { ObsidianAdapter } from './domain/adapter/ObsidianAdapter';

export interface ObsidianContext {
  obsidian: ObsidianAdapter;
}

export const ObsidianContextKey = 'obsidian';
