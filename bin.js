#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

function usage() {
  return `Usage: text-tally [--json] [FILE ...]

Count lines, words, and characters in files or standard input.

Options:
  --json       Print machine-readable JSON
  -h, --help   Show this help

With no FILE arguments, reads standard input. Use - as a FILE to read stdin.
`;
}

function count(text) {
  const lines = text.length === 0 ? 0 : text.split(/\r\n|\n|\r/).length;
  const words = (text.match(/\S+/gu) || []).length;
  const characters = Array.from(text).length;
  return { lines, words, characters };
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function formatRow(name, stats) {
  return `${String(stats.lines).padStart(8)} ${String(stats.words).padStart(8)} ${String(stats.characters).padStart(12)}  ${name}`;
}

async function main(args) {
  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(usage());
    return 0;
  }
  const json = args.includes('--json');
  const files = args.filter(arg => arg !== '--json');
  if (files.length === 0 || files.includes('-')) {
    const input = await readStdin();
    const result = { file: '-', ...count(input) };
    process.stdout.write(json ? `${JSON.stringify(result, null, 2)}\n` : `${formatRow('-', result)}\n`);
    return 0;
  }
  const results = [];
  for (const file of files) {
    try {
      const text = fs.readFileSync(path.resolve(file), 'utf8');
      results.push({ file, ...count(text) });
    } catch (error) {
      process.stderr.write(`text-tally: ${file}: ${error.message}\n`);
      return 1;
    }
  }
  if (json) {
    process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
  } else {
    process.stdout.write(`${'LINES'.padStart(8)} ${'WORDS'.padStart(8)} ${'CHARS'.padStart(12)}  FILE\n`);
    for (const result of results) process.stdout.write(`${formatRow(result.file, result)}\n`);
    if (results.length > 1) {
      const total = results.reduce((sum, item) => ({
        lines: sum.lines + item.lines,
        words: sum.words + item.words,
        characters: sum.characters + item.characters,
      }), { lines: 0, words: 0, characters: 0 });
      process.stdout.write(`${formatRow('total', total)}\n`);
    }
  }
  return 0;
}

main(process.argv.slice(2)).then(code => {
  process.exitCode = code;
}).catch(error => {
  process.stderr.write(`text-tally: ${error.message}\n`);
  process.exitCode = 1;
});
