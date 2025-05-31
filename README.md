# Prerendererest

A CLI-based prerenderer for static site generation.

## Installation

```bash
npm install -g prerendererest
```

## Usage

```bash
# Basic usage
prerendererest render

# With custom input/output directories
prerendererest render -i ./source -o ./build

# Verbose output
prerendererest render -v
```

## Options

- `-i, --input <path>`: Input directory (default: ./src)
- `-o, --output <path>`: Output directory (default: ./dist)
- `-v, --verbose`: Enable verbose output

## Development

```bash
# Install dependencies
npm install

# Run locally
npm start

# Link for global usage during development
npm link
```

## License

MIT
