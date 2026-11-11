import fs from 'fs';
let yml = fs.readFileSync('.github/workflows/release.yml', 'utf8');
if(!yml.includes("permissions:")) {
  yml = yml.replace(
    "jobs:\n  build:",
    "jobs:\n  build:\n    permissions:\n      contents: write"
  );
  fs.writeFileSync('.github/workflows/release.yml', yml);
  console.log("Added permissions to workflow");
}
