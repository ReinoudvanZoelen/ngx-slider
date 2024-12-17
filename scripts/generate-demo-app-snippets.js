/*
   This script will go through all *.component.template.html (and *.component.title-template.html)
   files in snippets and generate the corresponding HTML template *.component.html, pasting the code
   examples in the HTML.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import escape from 'escape-html';
import prism from 'prismjs';

import { escapeAtForAngular, escapeBracesForAngular, readdirRecursivelySync } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Generate template for a single file */
function generateTemplate(templateFile, snippetsDir) {
  const titleTemplateFile = templateFile.replace('.template.html', '.title-template.html');
  const sectionIdTemplateFile = templateFile.replace('.template.html', '.id-template.html');
  const outputTemplateFile = templateFile.replace('.template.html', '.html');
  const codeFile = templateFile.replace('.template.html', '.ts');
  const styleFile = templateFile.replace('.template.html', '.scss');

  const titleTemplateFileContent = fs.readFileSync(path.resolve(snippetsDir, titleTemplateFile), { encoding: 'utf8' }).trim();
  const sectionIdTemplateFileContent = fs.readFileSync(path.resolve(snippetsDir, sectionIdTemplateFile), { encoding: 'utf8' }).trim();

  const templateFileContent = fs.readFileSync(path.resolve(snippetsDir, templateFile), { encoding: 'utf8' });
  const templateNavHtml = navHtml(path.basename(outputTemplateFile), templateFileContent, 'html');

  let codeFileContent = fs.readFileSync(path.resolve(snippetsDir, codeFile), { encoding: 'utf8' });
  // The only modification to the source file is to remove the @local prefix from slider import
  codeFileContent = codeFileContent.replace(/@local\/ngx-slider/g, "@angular-slider/ngx-slider");
  const codeNavHtml = navHtml(path.basename(codeFile), codeFileContent, 'typescript');

  let styleNavHtml = '';
  if (fs.existsSync(path.resolve(snippetsDir, styleFile))) {
    const styleFileContent = fs.readFileSync(path.resolve(snippetsDir, styleFile), { encoding: 'utf8' });
    styleNavHtml = navHtml(path.basename(styleFile), styleFileContent, 'scss');
  }
  const fileNameAndPath = process.platform === "win32" ? templateFile.split('\\') : templateFile.split('/');
  const fileName = fileNameAndPath[fileNameAndPath.length - 1];
  const navName = fileName.replace(/-/g, '').replace('.component', '').replace('.template.html', 'Nav');

  const outputHtmlFileContent = `
  <h2 class="snippet-title" id="${sectionIdTemplateFileContent}">${titleTemplateFileContent}
    <a routerLink="./" fragment="${sectionIdTemplateFileContent}"><svg class="bi section-link" width="1em" height="1em" fill="currentColor"><use xlink:href="assets/bootstrap-icons.svg#link"/></svg></a>
  </h2>
<div class="snippet-card card">
  <div class="card-body">
    <div class="snippet-content">
      ${templateFileContent}
    </div>

    <ul ngbNav class="nav-tabs snippet-code-tabset" #${navName}="ngbNav">
      ${codeNavHtml}

      ${templateNavHtml}

      ${styleNavHtml}
    </ul>
    <div class="snippet-code-content" [ngbNavOutlet]="${navName}"></div>
  </div>
</div>`;

  fs.writeFileSync(path.resolve(snippetsDir, outputTemplateFile), escapeAtForAngular(outputHtmlFileContent), { encoding: 'utf8' });
}

/** Generate highlighted source code using prism */
function highlight(code, lang) {
  return prism.highlight(code.trim(), {}, prism.languages[lang]);
}

/** Common HTML template for tab */
function navHtml(tabTitle, codeContent, codeLang) {
  return `<li ngbNavItem>
      <a ngbNavLink>${escape(tabTitle)}</a>
      <ng-template ngbNavContent>
        <pre class="language-${codeLang}"><code class="language-${codeLang}">${escapeBracesForAngular(highlight(codeContent, codeLang))}</code></pre>
      </ng-template>
    </li>`;
}


const snippetsDir = path.resolve(__dirname, '../src/demo-app/app/snippets');

const templateFiles = readdirRecursivelySync(snippetsDir)
  .filter((file) => file.endsWith('component.template.html'));

for (let templateFile of templateFiles) {
  generateTemplate(templateFile, snippetsDir)
}
