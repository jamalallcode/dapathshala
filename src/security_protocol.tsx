/**
 * AI SECURITY & CODE ALTERATION PROTOCOL
 * STATUS: STRICT LOCKED MODE ACTIVE
 * 
 * This file serves as a persistent memory of the security and design protocols
 * for the DaPathshala.com project.
 */

export const SECURITY_PROTOCOL = {
  PROJECT_NAME: "DaPathshala.com",
  STATUS: "STRICT LOCKED MODE ACTIVE",
  
  POLICIES: {
    ZERO_ALTERATION: [
      "No changes to existing CSS classes, Tailwind colors, or design structure without explicit written permission.",
      "No deletion of code, even if it seems redundant or unnecessary.",
      "No changes to previous logic or variable naming."
    ],
    INCREMENTAL_UPDATES: [
      "Add code only for new features.",
      "Ensure new code does not impact existing functionality."
    ],
    ID_BASED_COMMUNICATION: "Changes must target specific IDs when provided (e.g., #table-return-summary, #form-entry).",
    STYLE_GUIDELINES: [
      "Maintain Blue-Slate and White-Clean design.",
      "Font Family: 'Hind Siliguri' must be preserved.",
      "Font sizes must remain unchanged."
    ]
  },

  MASTER_ID_REGISTRY: {
    TABLE_RETURN_SUMMARY: "#table-return-summary",
    TFOOT_RETURN_SUMMARY: "#tfoot-return-summary",
    FORM_ENTRY: "#form-entry",
    FIELDS: ["#field-1", "#field-2", "#field-3", "#field-4", "#field-5", "#field-6", "#field-7", "#field-8", "#field-9", "#field-10", "#field-11", "#field-12", "#field-13", "#field-14", "#field-15", "#field-16"],
    TABLE_MAIN_LEDGER: "#table-main-ledger",
    PROTOCOL_CARD: "#protocol-card",
    HERO_SECTION: "#hero-section"
  }
};
