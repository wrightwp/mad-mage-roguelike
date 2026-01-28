
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const monstersPath = path.join(__dirname, 'monsters.json');

try {
    const data = fs.readFileSync(monstersPath, 'utf8');
    const monsters = JSON.parse(data);

    // Filter CR >= 5
    const highCr = monsters.filter(m => m.cr >= 5);

    console.log(`Found ${highCr.length} monsters with CR >= 5.`);

    // Sort by CR desc
    highCr.sort((a, b) => b.cr - a.cr);

    highCr.forEach(m => {
        console.log(`[CR ${m.cr}] ${m.name} (${m.thematicType || 'Unknown'})`);
    });

} catch (err) {
    console.error("Error:", err);
}
