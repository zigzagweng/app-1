export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  nlmCitation: string;
}

/**
 * Parse MEDLINE format from PubMed efetch
 * Field lines start with a 2-4 char tag, then 0-2 spaces, then "-", then value.
 * Continuation lines start with 6 spaces.
 */
function parseMedline(text: string): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  const lines = text.split("\n");

  let currentTag: string | null = null;
  let currentValue = "";

  for (const rawLine of lines) {
    // Check if this is a continuation line (6 leading spaces)
    if (rawLine.startsWith("      ") && currentTag) {
      currentValue += " " + rawLine.trim();
      continue;
    }

    // Save previous field
    if (currentTag && currentValue) {
      if (!fields[currentTag]) fields[currentTag] = [];
      fields[currentTag].push(currentValue.trim());
    }

    // Try to parse a new field line
    // Pattern: TAG[space][space]-[space]value
    // The tag is at positions 0-3 (4 chars max). The dash is at pos 3 or later.
    const match = rawLine.match(/^([A-Z]{2,4})\s*-\s*(.*)$/);
    if (match) {
      currentTag = match[1];
      currentValue = match[2];
    } else {
      currentTag = null;
      currentValue = "";
    }
  }

  // Flush last field
  if (currentTag && currentValue) {
    if (!fields[currentTag]) fields[currentTag] = [];
    fields[currentTag].push(currentValue.trim());
  }

  return fields;
}

function getField(fields: Record<string, string[]>, tag: string): string | undefined {
  const values = fields[tag];
  if (!values || values.length === 0) return undefined;
  return values.join("; ");
}

function getFirstField(fields: Record<string, string[]>, tag: string): string | undefined {
  const values = fields[tag];
  if (!values || values.length === 0) return undefined;
  return values[0];
}

function buildNlmCitation(article: PubMedArticle): string {
  const parts: string[] = [];
  if (article.authors) parts.push(article.authors);
  if (article.title) parts.push(article.title);

  const journalPart = [article.journal];
  if (article.year) journalPart.push(article.year);
  if (article.volume) {
    let volIssue = article.volume;
    if (article.issue) volIssue += `(${article.issue})`;
    journalPart.push(volIssue);
  }
  if (article.pages) journalPart.push(`:${article.pages}`);

  parts.push(journalPart.join(" "));
  if (article.doi) parts.push(`doi: ${article.doi}`);
  parts.push(`PMID: ${article.pmid}`);

  return parts.join(". ") + ".";
}

export async function fetchPubMedArticle(pmid: string): Promise<PubMedArticle | null> {
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&rettype=medline&retmode=text`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const text = await response.text();
    if (!text || text.includes("Error")) return null;

    const fields = parseMedline(text);

    // Extract fields
    const fauAuthors = getField(fields, "FAU");
    const auAuthors = getField(fields, "AU");
    const authors = fauAuthors || auAuthors || "";

    const title = getFirstField(fields, "TI") || "";

    // Journal: prefer TA (Title Abbreviation), fallback to JT (Journal Title)
    const journal = getFirstField(fields, "TA") || getFirstField(fields, "JT") || "";

    // Date: DP format is "2023 Nov 28", take the first part as year
    const dp = getFirstField(fields, "DP") || "";
    const year = dp.split(" ")[0] || "";

    const volume = getFirstField(fields, "VI") || undefined;
    const issue = getFirstField(fields, "IP") || undefined;
    const pages = getFirstField(fields, "PG") || undefined;

    // DOI: look in LID field with [doi] suffix, or in AID field
    let doi: string | undefined;
    const lidValues = fields["LID"] || [];
    for (const val of lidValues) {
      const doiMatch = val.match(/^(\S+)\s*\[doi\]/i);
      if (doiMatch) {
        doi = doiMatch[1];
        break;
      }
    }
    if (!doi) {
      const aidValues = fields["AID"] || [];
      for (const val of aidValues) {
        const doiMatch = val.match(/^(\S+)\s*\[doi\]/i);
        if (doiMatch) {
          doi = doiMatch[1];
          break;
        }
      }
    }

    const article: PubMedArticle = {
      pmid,
      title,
      authors,
      journal,
      year,
      volume,
      issue,
      pages,
      doi,
      nlmCitation: "",
    };

    article.nlmCitation = buildNlmCitation(article);

    return article;
  } catch {
    return null;
  }
}
