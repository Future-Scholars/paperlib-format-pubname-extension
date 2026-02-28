import { PLAPI, PLExtAPI, PLExtension } from "paperlib-api/api";
import { PaperEntity } from "paperlib-api/model";

const PRESETS = {
  cv: {
    "Computer Vision and Pattern Recognition": "IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)",
    "CVPR": "IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)",
    "International Conference on Computer Vision": "IEEE/CVF International Conference on Computer Vision (ICCV)",
    "ICCV": "IEEE/CVF International Conference on Computer Vision (ICCV)",
    "European Conference on Computer Vision": "European Conference on Computer Vision (ECCV)",
    "ECCV": "European Conference on Computer Vision (ECCV)",
  },
  ml: {
    "Neural Information Processing Systems": "Advances in Neural Information Processing Systems (NeurIPS)",
    "NeurIPS": "Advances in Neural Information Processing Systems (NeurIPS)",
    "NIPS": "Advances in Neural Information Processing Systems (NeurIPS)",
    "International Conference on Learning Representations": "International Conference on Learning Representations (ICLR)",
    "ICLR": "International Conference on Learning Representations (ICLR)",
    "International Conference on Machine Learning": "International Conference on Machine Learning (ICML)",
    "ICML": "International Conference on Machine Learning (ICML)",
    "Conference on Learning Theory": "Conference on Learning Theory (COLT)",
    "COLT": "Conference on Learning Theory (COLT)",
    "International Conference on Artificial Intelligence and Statistics": "International Conference on Artificial Intelligence and Statistics (AISTATS)",
    "AISTATS": "International Conference on Artificial Intelligence and Statistics (AISTATS)",
  },
  ai: {
    "AAAI Conference on Artificial Intelligence": "AAAI Conference on Artificial Intelligence (AAAI)",
    "AAAI": "AAAI Conference on Artificial Intelligence (AAAI)",
    "International Joint Conference on Artificial Intelligence": "International Joint Conference on Artificial Intelligence (IJCAI)",
    "IJCAI": "International Joint Conference on Artificial Intelligence (IJCAI)",
    "European Conference on Artificial Intelligence": "European Conference on Artificial Intelligence (ECAI)",
    "ECAI": "European Conference on Artificial Intelligence (ECAI)",
    "Conference on Uncertainty in Artificial Intelligence": "Conference on Uncertainty in Artificial Intelligence (UAI)",
    "UAI": "Conference on Uncertainty in Artificial Intelligence (UAI)",
    "International Conference on Human-Robot Interaction": "ACM/IEEE International Conference on Human-Robot Interaction (HRI)",
    "HRI": "ACM/IEEE International Conference on Human-Robot Interaction (HRI)",
  },
  nlp: {
    "Association for Computational Linguistics": "Association for Computational Linguistics (ACL)",
    "ACL": "Association for Computational Linguistics (ACL)",
    "North American Chapter of the Association for Computational Linguistics": "Annual Conference of the North American Chapter of the Association for Computational Linguistics (NAACL)",
    "NAACL": "Annual Conference of the North American Chapter of the Association for Computational Linguistics (NAACL)",
    "Conference on Empirical Methods in Natural Language Processing": "Conference on Empirical Methods in Natural Language Processing (EMNLP)",
    "EMNLP": "Conference on Empirical Methods in Natural Language Processing (EMNLP)",
    "International Conference on Computational Linguistics": "International Conference on Computational Linguistics (COLING)",
    "COLING": "International Conference on Computational Linguistics (COLING)",
    "Journal of Computational Linguistics": "Journal of Computational Linguistics",
  },
  dm: {
    "Knowledge Discovery and Data Mining": "ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD)",
    "KDD": "ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD)",
    "International Conference on Data Mining": "IEEE International Conference on Data Mining (ICDM)",
    "ICDM": "IEEE International Conference on Data Mining (ICDM)",
    "International World Wide Web Conference": "International World Wide Web Conference (WWW)",
    "WWW": "International World Wide Web Conference (WWW)",
    "International Conference on Web Search and Data Mining": "ACM International Conference on Web Search and Data Mining (WSDM)",
    "WSDM": "ACM International Conference on Web Search and Data Mining (WSDM)",
    "Research and Development in Information Retrieval": "ACM SIGIR Conference on Research and Development in Information Retrieval (SIGIR)",
    "SIGIR": "ACM SIGIR Conference on Research and Development in Information Retrieval (SIGIR)",
  },
  journal: {
    "IEEE Transactions on Pattern Analysis and Machine Intelligence": "IEEE Transactions on Pattern Analysis and Machine Intelligence (T-PAMI)",
    "T-PAMI": "IEEE Transactions on Pattern Analysis and Machine Intelligence (T-PAMI)",
    "IEEE Transactions on Image Processing": "IEEE Transactions on Image Processing (T-IP)",
    "T-IP": "IEEE Transactions on Image Processing (T-IP)",
    "IEEE Transactions on Neural Networks and Learning Systems": "IEEE Transactions on Neural Networks and Learning Systems (T-NNLS)",
    "T-NNLS": "IEEE Transactions on Neural Networks and Learning Systems (T-NNLS)",
    "IEEE Transactions on Cybernetics": "IEEE Transactions on Cybernetics",
    "ACM Transactions on Intelligent Systems and Technology": "ACM Transactions on Intelligent Systems and Technology (T-IST)",
    "T-IST": "ACM Transactions on Intelligent Systems and Technology (T-IST)",
    "Journal of Machine Learning Research": "Journal of Machine Learning Research (JMLR)",
    "JMLR": "Journal of Machine Learning Research (JMLR)",
    "Transactions on Machine Learning Research": "Transactions on Machine Learning Research (TMLR)",
    "TMLR": "Transactions on Machine Learning Research (TMLR)",
    "Journal of Artificial Intelligence Research": "Journal of Artificial Intelligence Research (JAIR)",
    "JAIR": "Journal of Artificial Intelligence Research (JAIR)",
  },
};

class PaperlibFormatPubnameExtension extends PLExtension {
  disposeCallbacks: (() => void)[];

  constructor() {
    super({
      id: "@future-scholars/paperlib-format-pubname-extension",
      defaultPreference: {
        removeYear: {
          type: "boolean",
          name: "Remove year",
          description: "Remove year string from publication names",
          value: true,
          order: 0,
        },
        cvPreset: {
          type: "boolean",
          name: "CV Preset",
          description: "Computer Vision conferences (CVPR, ICCV, ECCV)",
          value: false,
          order: 1,
        },
        mlPreset: {
          type: "boolean",
          name: "ML Preset",
          description: "Machine Learning conferences (NeurIPS, ICLR, ICML, AISTATS, COLT)",
          value: false,
          order: 2,
        },
        aiPreset: {
          type: "boolean",
          name: "AI Preset",
          description: "Artificial Intelligence conferences (AAAI, IJCAI, ECAI, UAI, HRI)",
          value: false,
          order: 3,
        },
        nlpPreset: {
          type: "boolean",
          name: "NLP Preset",
          description: "NLP conferences (ACL, EMNLP, NAACL, COLING)",
          value: false,
          order: 4,
        },
        dmPreset: {
          type: "boolean",
          name: "DM Preset",
          description: "Data Mining & IR conferences (KDD, ICDM, WWW, WSDM, SIGIR)",
          value: false,
          order: 5,
        },
        journalPreset: {
          type: "boolean",
          name: "Journal Preset",
          description: "Journals (T-PAMI, T-IP, T-NNLS, JMLR, TMLR, JAIR, etc.)",
          value: false,
          order: 6,
        },
        customFormat: {
          type: "string",
          name: "Custom format",
          description:
            "A json string to define your custom format for publication names. Highest priority, matched first.",
          value: "",
          order: 7,
        },
        exactMatch: {
          type: "boolean",
          name: "Exact match",
          description:
            "If checked, the format will only be applied if the key is an exact match of the publication name. Applies to both presets and custom format.",
          value: false,
          order: 8,
        },
      },
    });

    this.disposeCallbacks = [];
  }

  async initialize() {
    await PLExtAPI.extensionPreferenceService.register(
      this.id,
      this.defaultPreference
    );

    this.disposeCallbacks.push(
      PLAPI.hookService.hookModify(
        "afterScrapeMetadata",
        this.id,
        "modifyPubnameHook"
      )
    );

    this.disposeCallbacks.push(
      PLAPI.commandService.on("format_pubnames_event" as any, (value) => {
        this.formatLibrary();
      })
    );

    this.disposeCallbacks.push(
      PLAPI.commandService.registerExternel({
        id: "format_pubnames",
        description: "Format the publication names of your papers.",
        event: "format_pubnames_event",
      })
    );
  }

  async dispose() {
    PLExtAPI.extensionPreferenceService.unregister(this.id);
    this.disposeCallbacks.forEach((dispose) => dispose());
  }

  private _matchKey(publication: string, key: string, exactMatch: boolean): boolean {
    if (exactMatch) {
      return publication === key;
    }
    return (
      publication.toLowerCase().includes(key.toLowerCase()) &&
      !publication.toLowerCase().includes("workshop")
    );
  }

  private _getPresetMap(prefs: {
    cvPreset: boolean;
    mlPreset: boolean;
    aiPreset: boolean;
    nlpPreset: boolean;
    dmPreset: boolean;
    journalPreset: boolean;
  }): Record<string, string> {
    const merged: Record<string, string> = {};

    if (prefs.cvPreset) Object.assign(merged, PRESETS.cv);
    if (prefs.mlPreset) Object.assign(merged, PRESETS.ml);
    if (prefs.aiPreset) Object.assign(merged, PRESETS.ai);
    if (prefs.nlpPreset) Object.assign(merged, PRESETS.nlp);
    if (prefs.dmPreset) Object.assign(merged, PRESETS.dm);
    if (prefs.journalPreset) Object.assign(merged, PRESETS.journal);

    return merged;
  }

  private _modifyPubname(
    paperEntities: PaperEntity[],
    removeYear: boolean,
    customFormat: Record<string, string> | undefined,
    presetMap: Record<string, string>,
    exactMatch: boolean
  ) {
    for (const paperEntity of paperEntities) {
      if (removeYear) {
        paperEntity.publication = paperEntity.publication
          .replace(/\s\d{4}\s/g, " ")
          .trim();
      }

      let matched = false;

      // Step A: Match custom format first (sorted by key length descending)
      if (customFormat && Object.keys(customFormat).length > 0) {
        const sortedCustomKeys = Object.keys(customFormat).sort(
          (a, b) => b.length - a.length
        );
        for (const key of sortedCustomKeys) {
          if (this._matchKey(paperEntity.publication, key, exactMatch)) {
            paperEntity.publication = customFormat[key];
            matched = true;
            break;
          }
        }
      }

      // Step B: Match preset (sorted by key length descending)
      if (!matched && Object.keys(presetMap).length > 0) {
        const sortedPresetKeys = Object.keys(presetMap).sort(
          (a, b) => b.length - a.length
        );
        for (const key of sortedPresetKeys) {
          if (this._matchKey(paperEntity.publication, key, exactMatch)) {
            paperEntity.publication = presetMap[key];
            break;
          }
        }
      }
    }

    return paperEntities;
  }

  async modifyPubnameHook(
    paperEntities: PaperEntity[],
    scrapers: string[],
    force: boolean
  ) {
    const removeYear = PLExtAPI.extensionPreferenceService.get(
      this.id,
      "removeYear"
    );
    const cvPreset = PLExtAPI.extensionPreferenceService.get(this.id, "cvPreset");
    const mlPreset = PLExtAPI.extensionPreferenceService.get(this.id, "mlPreset");
    const aiPreset = PLExtAPI.extensionPreferenceService.get(this.id, "aiPreset");
    const nlpPreset = PLExtAPI.extensionPreferenceService.get(this.id, "nlpPreset");
    const dmPreset = PLExtAPI.extensionPreferenceService.get(this.id, "dmPreset");
    const journalPreset = PLExtAPI.extensionPreferenceService.get(
      this.id,
      "journalPreset"
    );
    const customFormatStr = PLExtAPI.extensionPreferenceService.get(
      this.id,
      "customFormat"
    );
    const exactMatch = PLExtAPI.extensionPreferenceService.get(
      this.id,
      "exactMatch"
    );

    let customFormat: Record<string, string> | undefined;
    if (customFormatStr) {
      try {
        customFormat = JSON.parse(customFormatStr);
      } catch (e) {
        PLAPI.logService.error(
          "Error parsing custom format",
          e as Error,
          true,
          "FormatPubnameExt"
        );
      }
    }

    const presetMap = this._getPresetMap({
      cvPreset,
      mlPreset,
      aiPreset,
      nlpPreset,
      dmPreset,
      journalPreset,
    });

    return [
      this._modifyPubname(
        paperEntities,
        removeYear,
        customFormat,
        presetMap,
        exactMatch
      ),
      scrapers,
      force,
    ];
  }

  async formatLibrary() {
    const allPapers = await PLAPI.paperService.load("", "addTime", "desc");
    const removeYear = PLExtAPI.extensionPreferenceService.get(
      this.id,
      "removeYear"
    );
    const cvPreset = PLExtAPI.extensionPreferenceService.get(this.id, "cvPreset");
    const mlPreset = PLExtAPI.extensionPreferenceService.get(this.id, "mlPreset");
    const aiPreset = PLExtAPI.extensionPreferenceService.get(this.id, "aiPreset");
    const nlpPreset = PLExtAPI.extensionPreferenceService.get(this.id, "nlpPreset");
    const dmPreset = PLExtAPI.extensionPreferenceService.get(this.id, "dmPreset");
    const journalPreset = PLExtAPI.extensionPreferenceService.get(
      this.id,
      "journalPreset"
    );
    const customFormatStr = PLExtAPI.extensionPreferenceService.get(
      this.id,
      "customFormat"
    );
    const exactMatch = PLExtAPI.extensionPreferenceService.get(
      this.id,
      "exactMatch"
    );

    let customFormat: Record<string, string> | undefined;
    if (customFormatStr) {
      try {
        customFormat = JSON.parse(customFormatStr);
      } catch (e) {
        PLAPI.logService.error(
          "Error parsing custom format",
          e as Error,
          true,
          "FormatPubnameExt"
        );
      }
    }

    const presetMap = this._getPresetMap({
      cvPreset,
      mlPreset,
      aiPreset,
      nlpPreset,
      dmPreset,
      journalPreset,
    });

    const modifiedPapers: PaperEntity[] = [];
    for (const paper of allPapers) {
      const oldPubname = paper.publication;
      const [modifiedPaper] = this._modifyPubname(
        [paper],
        removeYear,
        customFormat,
        presetMap,
        exactMatch
      );
      if (modifiedPaper.publication !== oldPubname) {
        modifiedPapers.push(modifiedPaper);
      }
    }

    for (let i = 0; i < modifiedPapers.length; i += 10) {
      await PLAPI.paperService.update(
        modifiedPapers.slice(i, i + 10),
        false,
        true
      );
    }
  }
}

async function initialize() {
  const extension = new PaperlibFormatPubnameExtension();
  await extension.initialize();

  return extension;
}

export { initialize };
