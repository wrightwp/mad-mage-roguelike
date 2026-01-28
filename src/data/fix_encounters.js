
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'encounters-tier-1.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const encounters = JSON.parse(data);

    let updatedCount = 0;
    const fixedEncounters = encounters.map(enc => {
        if (typeof enc.dmDescription === 'string') {
            enc.dmDescription = [enc.dmDescription];
            updatedCount++;
        }
        return enc;
    });

    if (updatedCount > 0) {
        fs.writeFileSync(filePath, JSON.stringify(fixedEncounters, null, 4), 'utf8');
        console.log(`Successfully updated ${updatedCount} encounters in ${filePath}`);
    } else {
        console.log('No encounters needed updating.');
    }

} catch (err) {
    console.error('Error processing file:', err);
    process.exit(1);
}
