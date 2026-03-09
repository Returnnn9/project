const fs = require('fs');

const filePath = 'c:/Users/saefs/OneDrive/Рабочий стол/smuslest/components/CartSidebar.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the problematic list container and items animation
const searchPattern = /<motion\.div\s+variants=\{containerVariants\}\s+initial="hidden"\s+animate="show"\s+className="flex flex-col gap-4"\s+>\s+<AnimatePresence mode="popLayout">([\s\S]*?)<\/AnimatePresence>\s+<\/motion\.div>/;

const replacement = `<div className="flex flex-col gap-4">
       <AnimatePresence>
        $1
       </AnimatePresence>
      </div>`;

if (searchPattern.test(content)) {
 content = content.replace(searchPattern, replacement);
 // Also update the item variants to be simple within the map
 content = content.replace(/variants=\{itemVariants\}\s+layout/g, 'initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} layout');
 fs.writeFileSync(filePath, content);
 console.log('Successfully patched CartSidebar.tsx');
} else {
 console.error('Could not find the list container pattern');
}
