import { readFile, writeFile } from 'node:fs/promises';
const path = new URL('../dist/index.html', import.meta.url);
let html = await readFile(path, 'utf8');
html = html.replace(/<title>.*?<\/title>/s, '<title>TaxIntuitive — Learn by doing</title>');
html = html.replace(/href="\/favicon.ico"/g, 'href="/favicon.svg"');
html = html.replace('</head>', '<meta name="description" content="Build your Canadian tax knowledge with short lessons, practice quizzes and a guided simulator. Free public beta." /><meta name="theme-color" content="#123E34" /></head>');
await writeFile(path, html);
// Static hosts supporting redirects should serve every app route through Expo Router.
await writeFile(new URL('../dist/_redirects', import.meta.url), '/* /index.html 200\n');
console.log('Web metadata and SPA routing prepared.');

await writeFile(new URL('../dist/favicon.svg', import.meta.url), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#123E34"/><path d="M15 18h26v7h-9v25h-8V25h-9z" fill="#F7F6EF"/><path d="M40 29h8v21h-8z" fill="#BCE7A7"/></svg>');
