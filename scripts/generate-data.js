#!/usr/bin/env node
/**
 * Pre-builds eval data into a static JSON file for GitHub Pages deployment.
 * Run: node scripts/generate-data.js
 */
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const EVALS_ROOT = process.env.EVALS_ROOT || path.resolve(import.meta.dirname, '..', '..', 'inspect_evals', 'src', 'inspect_evals');
const OUT_DIR = path.resolve(import.meta.dirname, '..', 'public');

console.log(`Scanning evals from: ${EVALS_ROOT}`);

const entries = fs.readdirSync(EVALS_ROOT, { withFileTypes: true });
const evals = [];

for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  if (entry.name.startsWith('_') || entry.name === 'utils') continue;

  const yamlPath = path.join(EVALS_ROOT, entry.name, 'eval.yaml');
  if (!fs.existsSync(yamlPath)) continue;

  try {
    const raw = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
    const readmePath = path.join(EVALS_ROOT, entry.name, 'README.md');
    const hasReadme = fs.existsSync(readmePath);
    const readme = hasReadme ? fs.readFileSync(readmePath, 'utf8') : null;
    const stat = fs.statSync(yamlPath);

    evals.push({
      id: entry.name,
      title: raw.title || entry.name,
      description: (raw.description || '').trim(),
      group: raw.group || 'Uncategorized',
      arxiv: raw.arxiv || null,
      contributors: raw.contributors || [],
      tags: raw.tags || [],
      tasks: (raw.tasks || []).map(t => ({
        name: t.name,
        datasetSamples: t.dataset_samples || 0,
        humanBaseline: t.human_baseline || null,
      })),
      dependency: raw.dependency || null,
      hasReadme,
      readme,
      lastUpdated: stat.mtime.toISOString(),
    });
  } catch (err) {
    console.error(`Failed to parse ${yamlPath}: ${err.message}`);
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'evals.json'), JSON.stringify({ evals, total: evals.length }));
console.log(`Generated evals.json with ${evals.length} evals in ${OUT_DIR}`);
