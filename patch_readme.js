import fs from 'fs';
let readme = fs.readFileSync('README.md', 'utf8');

const sectionToRemove = `## Otomatik Derleme (GitHub Actions)
Bu projenin kodları GitHub'a her yüklendiğinde, Microsoft (GitHub Actions) sunucuları otomatik olarak Windows (.exe) ve macOS (.dmg) sürümlerini derleyip **Releases (Sürümler)** sekmesine ekler.`;

readme = readme.replace(sectionToRemove, '').trim();

fs.writeFileSync('README.md', readme);
console.log("Removed section from README");
