// =============================================================
// MarkdownView.jsx - Pengolah Markdown Ringan & Aman untuk AI Chat
// Menghilangkan tanda mentah seperti ###, ***, **, dan menampilkan
// kode G-Code, daftar list, tabel, dan penekanan teks secara rapi.
// =============================================================
import React, { useState } from 'react';

// Tokenizer teks sebaris (inline formatting)
function renderInline(text) {
  if (!text) return null;
  const pattern = /(`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    const key = `inline_${match.index}`;

    if (token.startsWith('`')) {
      parts.push(
        <code key={key} className="cnc-inline-code">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('***')) {
      parts.push(
        <strong key={key}>
          <em>{token.slice(3, -3)}</em>
        </strong>
      );
    } else if (token.startsWith('**')) {
      parts.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*')) {
      parts.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={key}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="cnc-md-link"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        parts.push(token);
      }
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

// Blok kode berpagar dengan tombol salin interaktif
function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const label = lang?.toLowerCase() === 'gcode'
    ? 'G-Code'
    : lang
    ? lang.toUpperCase()
    : 'Program / Kode';

  return (
    <div className="cnc-code-block">
      <div className="cnc-code-block__head">
        <span className="cnc-code-block__lang">{label}</span>
        <button
          type="button"
          className="cnc-code-block__copy"
          onClick={handleCopy}
          title="Salin kode ini"
        >
          {copied ? 'Tersalin!' : 'Salin'}
        </button>
      </div>
      <pre className="cnc-code-block__pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function MarkdownView({ content, className = '' }) {
  if (!content) return null;

  const lines = String(content).split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Fenced Code Block (```lang ... ```)
    if (trimmed.startsWith('```')) {
      const lang = trimmed.replace(/^```/, '').trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      blocks.push({
        type: 'code_block',
        lang: lang || 'text',
        code: codeLines.join('\n'),
      });
      continue;
    }

    // 2. Garis Pembatas (---, ***, ___)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // 3. Judul Heading (#, ##, ###, ####)
    const headingMatch = rawLine.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    // 4. Kutipan / Callout (> ...)
    if (trimmed.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join('\n') });
      continue;
    }

    // 5. Tabel Markdown (| col 1 | col 2 |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2 && /^\|[\s\-:|]+\|$/.test(tableLines[1])) {
        const headers = tableLines[0].split('|').slice(1, -1).map((s) => s.trim());
        const rows = tableLines.slice(2).map((r) => r.split('|').slice(1, -1).map((s) => s.trim()));
        blocks.push({ type: 'table', headers, rows });
        continue;
      }
    }

    // 6. Daftar Butir (Unordered List: - item atau * item)
    if (/^\s*[-*]\s+/.test(rawLine)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // 7. Daftar Bernomor (Ordered List: 1. item)
    if (/^\s*\d+\.\s+/.test(rawLine)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // 8. Baris Kosong
    if (!trimmed) {
      i++;
      continue;
    }

    // 9. Paragraf Teks Biasa
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].match(/^(#{1,4})\s+/) &&
      !lines[i].trim().startsWith('>') &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^(\-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'paragraph', text: paraLines.join('\n') });
  }

  return (
    <div className={`cnc-markdown ${className}`}>
      {blocks.map((b, idx) => {
        const k = `blk_${idx}`;
        switch (b.type) {
          case 'heading': {
            if (b.level === 1) return <h3 key={k} className="cnc-md-h3">{renderInline(b.text)}</h3>;
            if (b.level === 2) return <h4 key={k} className="cnc-md-h4">{renderInline(b.text)}</h4>;
            return <h5 key={k} className="cnc-md-h5">{renderInline(b.text)}</h5>;
          }
          case 'paragraph':
            return (
              <p key={k} className="cnc-md-p">
                {renderInline(b.text)}
              </p>
            );
          case 'ul':
            return (
              <ul key={k} className="cnc-md-ul">
                {b.items.map((it, itemIdx) => (
                  <li key={`ul_${itemIdx}`} className="cnc-md-li">
                    {renderInline(it)}
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={k} className="cnc-md-ol">
                {b.items.map((it, itemIdx) => (
                  <li key={`ol_${itemIdx}`} className="cnc-md-li">
                    {renderInline(it)}
                  </li>
                ))}
              </ol>
            );
          case 'code_block':
            return <CodeBlock key={k} lang={b.lang} code={b.code} />;
          case 'blockquote':
            return (
              <blockquote key={k} className="cnc-md-blockquote">
                {renderInline(b.text)}
              </blockquote>
            );
          case 'table':
            return (
              <div key={k} className="cnc-md-table-wrap">
                <table className="cnc-md-table">
                  <thead>
                    <tr>
                      {b.headers.map((h, hIdx) => (
                        <th key={`th_${hIdx}`}>{renderInline(h)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, rIdx) => (
                      <tr key={`tr_${rIdx}`}>
                        {row.map((cell, cIdx) => (
                          <td key={`td_${cIdx}`}>{renderInline(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'hr':
            return <hr key={k} className="cnc-md-hr" />;
          default:
            return null;
        }
      })}
    </div>
  );
}
