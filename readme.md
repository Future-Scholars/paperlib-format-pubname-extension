# Paperlib Format Publication Name Extension

# Paperlib Format Publication Name Extension

This extension helps you automatically format the publication name when you import a paper into your library.
For example: 2017 ABC Conference -> ABC Conference.
It also supports define your custom formats.

For existing papers in your library, it provides a command `\format_pubnames`. Run it and boom!

## Features

- **Multi-domain Presets**: Built-in presets for CV, ML, AI, NLP, Data Mining, and Journals
- **Custom Formats**: Define your own publication name formats with highest priority
- **Flexible Matching**: Support for exact match or fuzzy match
- **Year Removal**: Automatically remove year strings from publication names

## Installation

### Local Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Build the extension:
   ```bash
   pnpm build
   ```
4. In Paperlib, go to **Settings → Extensions → Install from local folder**
5. Select the **project root directory** (the folder containing `package.json`)

## Usage

### Presets

Enable the presets you need in the extension preferences. Each preset covers a specific domain:

| Preset | Conferences/Journals |
|--------|---------------------|
| **CV Preset** | CVPR, ICCV, ECCV |
| **ML Preset** | NeurIPS, ICLR, ICML, AISTATS, COLT |
| **AI Preset** | AAAI, IJCAI, ECAI, UAI, HRI |
| **NLP Preset** | ACL, EMNLP, NAACL, COLING, CL Journal |
| **DM Preset** | KDD, ICDM, WWW, WSDM, SIGIR |
| **Journal Preset** | T-PAMI, T-IP, T-NNLS, JMLR, TMLR, JAIR, etc. |

### Matching Priority

```
Custom format → Presets (merged) → Original name
```

1. **Custom format** is matched first (highest priority)
2. If no match, **enabled presets** are merged and matched
3. Keys are sorted by length (longest first) for precise matching

### Preferences

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **Remove year** | boolean | `true` | Remove year string from publication names |
| **CV Preset** | boolean | `false` | Computer Vision conferences |
| **ML Preset** | boolean | `false` | Machine Learning conferences |
| **AI Preset** | boolean | `false` | Artificial Intelligence conferences |
| **NLP Preset** | boolean | `false` | NLP conferences |
| **DM Preset** | boolean | `false` | Data Mining & IR conferences |
| **Journal Preset** | boolean | `false` | Journals |
| **Custom format** | string | `""` | Custom format JSON (highest priority) |
| **Exact match** | boolean | `false` | Exact match for both presets and custom format |

### Custom Formats

Define custom formats in JSON. Custom formats have the highest priority and will override presets:

```json
{"CVPR": "CVPR", "NeurIPS": "NeurIPS"}
```

### Command

Use `\format_pubnames` command to format publication names for all existing papers in your library.

---

## Developer Guide

### Project Structure

```
paperlib-format-pubname-extension/
├── src/
│   └── main.ts          # Main extension code
├── dist/                # Built extension (generated)
├── package.json         # Package configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
└── readme.md            # This file
```

### Code Architecture

```typescript
// Presets are organized by domain
const PRESETS = {
  cv: { /* CVPR, ICCV, ECCV */ },
  ml: { /* NeurIPS, ICLR, ICML, ... */ },
  ai: { /* AAAI, IJCAI, ECAI, UAI, HRI */ },
  nlp: { /* ACL, EMNLP, NAACL, COLING */ },
  dm: { /* KDD, ICDM, WWW, WSDM, SIGIR */ },
  journal: { /* T-PAMI, JMLR, ... */ },
};
```

### Matching Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Input: publication                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              removeYear enabled? ──No──→ Skip                │
│                    │Yes                                      │
│                    ▼                                         │
│              Remove year (e.g., "2023 CVPR" → "CVPR")        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│        customFormat exists? ──No──→ Go to Step B             │
│                    │Yes                                      │
│                    ▼                                         │
│    Step A: Match in customFormat (sorted by key length)     │
│    ┌─────────────────────────────────────────────┐          │
│    │ exactMatch?                                 │          │
│    │   Yes: publication === key?                 │          │
│    │   No:  publication.includes(key)?           │          │
│    │        && !includes("workshop")             │          │
│    └─────────────────────────────────────────────┘          │
│                    │                                         │
│            ┌───────┴───────┐                                 │
│            ▼               ▼                                 │
│        Match found      No match                             │
│            │               │                                 │
│            ▼               ▼                                 │
│     Return custom      Continue to Step B                    │
│        result                                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│    Step B: Check if any preset is enabled                    │
│                                                              │
│    All presets disabled? ──Yes──→ Return original           │
│                    │No                                       │
│                    ▼                                         │
│    Merge all enabled presets → presetMap                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│    Step C: Match in presetMap (sorted by key length)        │
│    ┌─────────────────────────────────────────────┐          │
│    │ exactMatch?                                 │          │
│    │   Yes: publication === key?                 │          │
│    │   No:  publication.includes(key)?           │          │
│    │        && !includes("workshop")             │          │
│    └─────────────────────────────────────────────┘          │
│                    │                                         │
│            ┌───────┴───────┐                                 │
│            ▼               ▼                                 │
│        Match found      No match                             │
│            │               │                                 │
│            ▼               ▼                                 │
│     Return preset      Return original                       │
│        result          publication                           │
└─────────────────────────────────────────────────────────────┘
```

### Adding New Presets

To add a new preset:

1. Add a new key to `PRESETS` object in `src/main.ts`:
   ```typescript
   const PRESETS = {
     // ... existing presets
     newDomain: {
       "Full Conference Name": "Formatted Name (Abbreviation)",
       "Abbreviation": "Formatted Name (Abbreviation)",
     },
   };
   ```

2. Add corresponding preference in `defaultPreference`:
   ```typescript
   newDomainPreset: {
     type: "boolean",
     name: "New Domain Preset",
     description: "Description of the preset",
     value: false,
     order: X,  // appropriate order number
   },
   ```

3. Update `_getPresetMap()` to include the new preset:
   ```typescript
   if (prefs.newDomainPreset) Object.assign(merged, PRESETS.newDomain);
   ```

4. Update the preference reading in `modifyPubnameHook()` and `formatLibrary()`

5. Rebuild: `pnpm build`

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Build and test: `pnpm build`
5. Submit a pull request

---

## Preset Details

### Computer Vision (CV Preset)

| Key | Formatted Name |
|-----|----------------|
| CVPR | IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR) |
| ICCV | IEEE/CVF International Conference on Computer Vision (ICCV) |
| ECCV | European Conference on Computer Vision (ECCV) |

### Machine Learning (ML Preset)

| Key | Formatted Name |
|-----|----------------|
| NeurIPS/NIPS | Advances in Neural Information Processing Systems (NeurIPS) |
| ICLR | International Conference on Learning Representations (ICLR) |
| ICML | International Conference on Machine Learning (ICML) |
| AISTATS | International Conference on Artificial Intelligence and Statistics (AISTATS) |
| COLT | Conference on Learning Theory (COLT) |

### Artificial Intelligence (AI Preset)

| Key | Formatted Name |
|-----|----------------|
| AAAI | AAAI Conference on Artificial Intelligence (AAAI) |
| IJCAI | International Joint Conference on Artificial Intelligence (IJCAI) |
| ECAI | European Conference on Artificial Intelligence (ECAI) |
| UAI | Conference on Uncertainty in Artificial Intelligence (UAI) |
| HRI | ACM/IEEE International Conference on Human-Robot Interaction (HRI) |

### Natural Language Processing (NLP Preset)

| Key | Formatted Name |
|-----|----------------|
| ACL | Association for Computational Linguistics (ACL) |
| NAACL | Annual Conference of the North American Chapter of the Association for Computational Linguistics (NAACL) |
| EMNLP | Conference on Empirical Methods in Natural Language Processing (EMNLP) |
| COLING | International Conference on Computational Linguistics (COLING) |

### Data Mining & Information Retrieval (DM Preset)

| Key | Formatted Name |
|-----|----------------|
| KDD | ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD) |
| ICDM | IEEE International Conference on Data Mining (ICDM) |
| WWW | International World Wide Web Conference (WWW) |
| WSDM | ACM International Conference on Web Search and Data Mining (WSDM) |
| SIGIR | ACM SIGIR Conference on Research and Development in Information Retrieval (SIGIR) |

### Journals (Journal Preset)

| Key | Formatted Name |
|-----|----------------|
| T-PAMI | IEEE Transactions on Pattern Analysis and Machine Intelligence (T-PAMI) |
| T-IP | IEEE Transactions on Image Processing (T-IP) |
| T-NNLS | IEEE Transactions on Neural Networks and Learning Systems (T-NNLS) |
| JMLR | Journal of Machine Learning Research (JMLR) |
| TMLR | Transactions on Machine Learning Research (TMLR) |
| JAIR | Journal of Artificial Intelligence Research (JAIR) |
