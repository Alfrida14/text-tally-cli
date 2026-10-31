# text-tally-cli

A small command-line tool for counting lines, words, and characters in UTF-8 text files or piped input. It has no runtime dependencies and works on Node.js 18 or newer.

## Install

Clone the repository and install the CLI globally:

```sh
git clone https://github.com/Alfrida14/text-tally-cli.git
cd text-tally-cli
npm install --global .
```

Or use it without installing globally:

```sh
node bin.js README.md
```

## Use

Count one or more files:

```sh
text-tally README.md package.json
```

Read from standard input:

```sh
cat README.md | text-tally
```

Print JSON for scripts:

```sh
text-tally --json README.md
```

Show help:

```sh
text-tally --help
```

The text count treats a line as each newline-delimited segment, excluding a final empty segment after a trailing newline. Words are non-whitespace runs. Characters count Unicode code points, so an emoji counts as one character.

## Development

There are no dependencies. Run the CLI directly with `node bin.js`. The `npm start` script runs the same command and forwards arguments, for example `npm start -- --help`.

## License

MIT. See [LICENSE](LICENSE).

