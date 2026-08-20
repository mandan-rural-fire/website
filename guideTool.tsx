import type { ReactElement } from 'react';
import { Card, Flex, Heading, Stack, Text } from '@sanity/ui';
import { Icon } from '@sanity/icons';
import type { Tool } from 'sanity';
// The guide is the repo's docs/editor-guide.md, imported raw at build time:
// one document, readable in the repo AND rendered here. Edit the markdown,
// never this file, to change the instructions.
import guideMd from './docs/editor-guide.md?raw';

const BookIcon = () => <Icon symbol="book" />;

/** Renders the guide's markdown subset: #/##/### headings, paragraphs,
 *  bullet and numbered lists, **bold**, `code`, and [links](url). */
function inline(text: string): (string | ReactElement)[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^`[^`]+`$/.test(part)) return <code key={i} style={{ background: 'rgba(128,128,128,.15)', padding: '0 .3em', borderRadius: 3 }}>{part.slice(1, -1)}</code>;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) return <a key={i} href={link[2]} target="_blank" rel="noopener">{link[1]}</a>;
    return part;
  });
}

function renderMarkdown(md: string): ReactElement[] {
  const blocks = md.split(/\n\n+/);
  return blocks.map((block, i) => {
    const lines = block.split('\n').map((l) => l.trimEnd()).filter(Boolean);
    if (lines.length === 0) return <span key={i} />;
    const first = lines[0] ?? '';
    if (first.startsWith('### '))
      return <Heading key={i} as="h3" size={0} style={{ marginTop: '1.2em' }}>{inline(first.slice(4))}</Heading>;
    if (first.startsWith('## '))
      return <Heading key={i} as="h2" size={1} style={{ marginTop: '1.4em' }}>{inline(first.slice(3))}</Heading>;
    if (first.startsWith('# '))
      return <Heading key={i} as="h1" size={2}>{inline(first.slice(2))}</Heading>;
    if (lines.every((l) => /^[-*] /.test(l.trim()) || /^\s/.test(l))) {
      // bullet list; continuation lines fold into the previous item
      const items: string[] = [];
      for (const l of lines) {
        if (/^[-*] /.test(l.trim())) items.push(l.trim().slice(2));
        else if (items.length) items[items.length - 1] += ' ' + l.trim();
      }
      return (
        <Stack key={i} as="ul" space={3} style={{ paddingLeft: '1.2em', margin: 0 }}>
          {items.map((it, j) => <Text key={j} as="li" size={2} style={{ lineHeight: 1.6, display: 'list-item', listStyleType: 'disc' }}>{inline(it)}</Text>)}
        </Stack>
      );
    }
    if (/^\d+\. /.test(first.trim())) {
      const items: string[] = [];
      for (const l of lines) {
        const m = /^\d+\. (.*)$/.exec(l.trim());
        if (m?.[1] !== undefined) items.push(m[1]);
        else if (items.length) items[items.length - 1] += ' ' + l.trim();
      }
      return (
        <Stack key={i} as="ol" space={3} style={{ paddingLeft: '1.2em', margin: 0 }}>
          {items.map((it, j) => <Text key={j} as="li" size={2} style={{ lineHeight: 1.6, display: 'list-item', listStyleType: 'decimal' }}>{inline(it)}</Text>)}
        </Stack>
      );
    }
    return <Text key={i} as="p" size={2} style={{ lineHeight: 1.65 }}>{inline(lines.join(' '))}</Text>;
  });
}

function GuideTool() {
  return (
    <Flex justify="center" padding={4}>
      <Card padding={5} radius={3} shadow={1} style={{ maxWidth: 720, margin: '24px 0' }}>
        <Stack space={4}>{renderMarkdown(guideMd)}</Stack>
      </Card>
    </Flex>
  );
}

export const guideTool: Tool = {
  name: 'instructions',
  title: 'Instructions',
  icon: BookIcon,
  component: GuideTool,
};
