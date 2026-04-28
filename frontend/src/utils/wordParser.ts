import type { WordDefinition } from '../types';

const POS_PATTERNS = [
  /^(adj|adv|n|v|vt|vi|prep|pron|conj|interj|art|num|abbr|phr|prep)\.\s*/i,
  /^(adjective|adverb|noun|verb|preposition|pronoun|conjunction|interjection|article|number|abbreviation|phrase)\s+/i,
  /^(形容词|副词|名词|动词|介词|代词|连词|感叹词|冠词|数词|缩写|短语)\s*/,
];

const POS_LABELS: Record<string, string> = {
  adj: 'adj.',
  adjective: 'adj.',
  形容词: 'adj.',
  adv: 'adv.',
  adverb: 'adv.',
  副词: 'adv.',
  n: 'n.',
  noun: 'n.',
  名词: 'n.',
  v: 'v.',
  verb: 'v.',
  动词: 'v.',
  vt: 'vt.',
  vi: 'vi.',
  prep: 'prep.',
  preposition: 'prep.',
  介词: 'prep.',
  pron: 'pron.',
  pronoun: 'pron.',
  代词: 'pron.',
  conj: 'conj.',
  conjunction: 'conj.',
  连词: 'conj.',
  interj: 'interj.',
  interjection: 'interj.',
  感叹词: 'interj.',
  art: 'art.',
  article: 'art.',
  冠词: 'art.',
  num: 'num.',
  number: 'num.',
  数词: 'num.',
  abbr: 'abbr.',
  abbreviation: 'abbr.',
  缩写: 'abbr.',
  phr: 'phr.',
  phrase: 'phr.',
  短语: 'phr.',
};

export const parseTranslation = (translation: string): WordDefinition[] => {
  if (!translation || !translation.trim()) return [];

  const trimmed = translation.trim();

  const isJSONFormat = /^\s*[\[{]/.test(trimmed);
  if (isJSONFormat) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          pos: item.pos || item.partOfSpeech || '',
          meanings: Array.isArray(item.meanings)
            ? item.meanings
            : typeof item.meaning === 'string'
              ? [item.meaning]
              : [],
        })).filter((d) => d.pos || d.meanings.length > 0);
      }
    } catch {
    }
  }

  const segments = splitByPOS(trimmed);

  if (segments.length > 1) {
    return segments
      .map(({ pos, text }) => ({
        pos: POS_LABELS[pos.toLowerCase()] || pos,
        meanings: text.split(/[;；]/).map(s => s.trim()).filter(Boolean),
      }))
      .filter(d => d.meanings.length > 0);
  }

  const meanings = trimmed.split(/[,，;；、]/).map(s => s.trim()).filter(Boolean);
  if (meanings.length > 0) {
    return [{ pos: '', meanings }];
  }

  return [];
};

const splitByPOS = (text: string): { pos: string; text: string }[] => {
  const result: { pos: string; text: string }[] = [];
  let currentPos = '';
  let currentText = '';
  let i = 0;

  while (i < text.length) {
    let matched = false;
    for (const pattern of POS_PATTERNS) {
      const match = text.slice(i).match(pattern);
      if (match && match.index === 0) {
        if (currentText.trim()) {
          result.push({ pos: currentPos, text: currentText.trim() });
        }
        currentPos = match[0].trim();
        currentText = '';
        i += match[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      currentText += text[i];
      i++;
    }
  }

  if (currentText.trim()) {
    result.push({ pos: currentPos, text: currentText.trim() });
  }

  return result;
};
