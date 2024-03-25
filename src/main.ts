import { PLAPI, PLExtAPI, PLExtension } from "paperlib-api/api";
import { PaperEntity } from "paperlib-api/model";

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
        customFormat: {
          type: "string",
          name: "Custom format",
          description:
            "A json string to define your custom format for publication names. If the publication name contains the key, it will be replaced by the value.",
          value: "",
          order: 1,
        },
        customExactMatch: {
          type: "boolean",
          name: "Exact match",
          description:
            "If checked, the custom format will only be applied if the key is an exact match of the publication name.",
          value: false,
          order: 2,
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

  private _modifyPubname(
    paperEntities: PaperEntity[],
    removeYear: boolean,
    customFormat?: Record<string, string>,
    customExactMatch: boolean = false
  ) {
    for (const paperEntity of paperEntities) {
      if (removeYear) {
        // remove 4 numbers and the surrounding spaces
        paperEntity.publication = paperEntity.publication
          .replace(/\s\d{4}\s/g, " ")
          .trim();
      }

      if (customFormat) {
        for (const key in customFormat) {
          if (customExactMatch) {
            if (paperEntity.publication === key) {
              paperEntity.publication = customFormat[key];
            }
          } else {
            if (
              paperEntity.publication
                .toLowerCase()
                .includes(key.toLowerCase()) &&
              !paperEntity.publication.toLowerCase().includes("workshop")
            ) {
              paperEntity.publication = customFormat[key];
            }
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
    const customFormatStr = PLExtAPI.extensionPreferenceService.get(
      this.id,
      "customFormat"
    );
    let customFormat;
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
    const customExactMatch = PLExtAPI.extensionPreferenceService.get(
      this.id,
      "customExactMatch"
    );

    return [
      this._modifyPubname(paperEntities, removeYear, customFormat, customExactMatch),
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
    const customFormatStr = PLExtAPI.extensionPreferenceService.get(
      this.id,
      "customFormat"
    );
    let customFormat;
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
    const customExactMatch = PLExtAPI.extensionPreferenceService.get(
      this.id,
      "customExactMatch"
    );

    const modifiedPapers: PaperEntity[] = [];
    for (const paper of allPapers) {
      const oldPubname = paper.publication;
      const [modifiedPaper] = this._modifyPubname(
        [paper],
        removeYear,
        customFormat,
        customExactMatch
      );
      if (modifiedPaper.publication !== oldPubname) {
        modifiedPapers.push(modifiedPaper);
      }
    }

    // Update in chunk of 10
    for (let i = 0; i < modifiedPapers.length; i += 10) {
      await PLAPI.paperService.update(modifiedPapers.slice(i, i + 10), false, true);
    }
  }
}

async function initialize() {
  const extension = new PaperlibFormatPubnameExtension();
  await extension.initialize();

  return extension;
}

export { initialize };
