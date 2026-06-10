const fs = require('fs');
const path = require('path');

function replaceMotion(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace import
  content = content.replace(
    /import\s+{\s*motion\s*,\s*AnimatePresence\s*}\s+from\s+["']framer-motion["'];?/,
    'import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";'
  );

  content = content.replace(
    /import\s+{\s*motion\s*}\s+from\s+["']framer-motion["'];?/,
    'import { LazyMotion, domAnimation, m } from "framer-motion";'
  );

  // Replace <motion. and </motion.
  content = content.replace(/<motion\./g, '<m.');
  content = content.replace(/<\/motion\./g, '</m.');

  // If there's an AnimatePresence wrapper, wrap the inner content in LazyMotion, or just wrap the root return.
  // Actually, we can just wrap the root return of Page component.
  // Let's just find the main return of Page and wrap it.
  // We can just rely on the user or do it manually if it's too complex.
  
  // Also we need to replace raw <img> with <Image>
  // <img src="/audit.jpg" ... />
  // We'll do Image replacement manually or via regex if it's simple.
  
  fs.writeFileSync(filePath, content, 'utf8');
}

const pagePath = path.join(__dirname, 'apps/web/src/app/page.tsx');
replaceMotion(pagePath);

const cardPath = path.join(__dirname, 'apps/web/src/components/CampaignCard.tsx');
if(fs.existsSync(cardPath)) {
  replaceMotion(cardPath);
}

console.log("Replaced motion components.");
