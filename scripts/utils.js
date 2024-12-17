import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Get all files in directory recursively, synchronously */
export function readdirRecursivelySync(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (let file of list) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(readdirRecursivelySync(file));
    } else {
      results.push(file);
    }
  }
  return results;
}

/** Copy README.md from given location to the library directory */
export function copyReadmeMd(sourceReadmeMd) {
  const libReadmeFile = path.resolve(__dirname, '../src/ngx-slider/README.md');

  const sourceReadme = fs.readFileSync(sourceReadmeMd, { encoding: 'utf8' });
  fs.writeFileSync(libReadmeFile, sourceReadme, { encoding: 'utf8' });
}

/** Escape { and } or otherwise Angular will complain when we're not actually using them for bindings */
export function escapeBracesForAngular(html) {
  return html.replace(/([{}])/g, "{{ '$1' }}");
}

/** Escape at (@) character, which is also reserved in Angular templates now. */
export function escapeAtForAngular(html) {
  return html.replace(/@/g, "&#64;");
}