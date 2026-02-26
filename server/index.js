import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const app = express();
app.use(cors());

const EVALS_ROOT = process.env.EVALS_ROOT || path.resolve(import.meta.dirname, '..', '..', 'inspect_evals', 'src', 'inspect_evals');

function scanEvals() {
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

      // Get file stats for lastUpdated
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
        path: path.join(EVALS_ROOT, entry.name),
        hasReadme,
        lastUpdated: stat.mtime.toISOString(),
      });
    } catch (err) {
      console.error(`Failed to parse ${yamlPath}: ${err.message}`);
    }
  }

  return evals;
}

app.get('/api/evals', (_req, res) => {
  try {
    const evals = scanEvals();
    res.json({ evals, total: evals.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/evals/:id', (req, res) => {
  try {
    const evals = scanEvals();
    const eval_ = evals.find(e => e.id === req.params.id);
    if (!eval_) return res.status(404).json({ error: 'Not found' });

    // Also return README content if available
    const readmePath = path.join(EVALS_ROOT, req.params.id, 'README.md');
    if (fs.existsSync(readmePath)) {
      eval_.readme = fs.readFileSync(readmePath, 'utf8');
    }
    res.json(eval_);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/groups', (_req, res) => {
  try {
    const evals = scanEvals();
    const groups = [...new Set(evals.map(e => e.group))].sort();
    res.json({ groups });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`InspectHub API running on http://localhost:${PORT}`);
  console.log(`Scanning evals from: ${EVALS_ROOT}`);
});
