// Script to combine all CSS parts into one file
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the paths
const basePath = __dirname;
const outputPath = path.join(basePath, 'styles-combined.css');

// Read all parts
const part1 = fs.readFileSync(path.join(basePath, 'styles.css'), 'utf8');
const part2 = fs.readFileSync(path.join(basePath, 'styles-part2.css'), 'utf8');
const part3 = fs.readFileSync(path.join(basePath, 'styles-part3.css'), 'utf8');
const part4 = fs.readFileSync(path.join(basePath, 'styles-part4.css'), 'utf8');

// Combine all parts
const combinedCSS = part1 + '\n' + part2 + '\n' + part3 + '\n' + part4;

// Write the combined file
fs.writeFileSync(outputPath, combinedCSS);

console.log('CSS files combined successfully into styles-combined.css');