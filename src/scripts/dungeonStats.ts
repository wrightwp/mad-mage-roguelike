import { generateDungeon } from '../logic/dungeonGen.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

// Helper to track stats
interface EncounterStats {
    total: number;
    byType: Record<string, number>;
    byName: Record<string, number>;
    fallbacks: number;
}

const runStats = () => {
    const logBuffer: string[] = [];
    const log = (msg: string) => logBuffer.push(msg);

    log("Starting Dungeon Generation Statistics (100 runs per floor, Floors 1-4)...\n");

    // Silence noisy logs from modules
    const originalLog = console.log;
    const originalWarn = console.warn;
    console.log = () => { };
    console.warn = () => { };

    try {
        for (let floor = 1; floor <= 4; floor++) {
            log(`--- Floor ${floor} (Party Level ${floor}, 100 runs) ---`);

            const stats: EncounterStats = {
                total: 0,
                byType: {},
                byName: {},
                fallbacks: 0
            };

            const runs = 100;

            for (let i = 0; i < runs; i++) {
                const dungeon = generateDungeon(
                    15,
                    floor,
                    800,
                    2000,
                    undefined,
                    4,
                    floor
                );

                dungeon.nodes.forEach(node => {
                    if (node.encounter) {
                        stats.total++;

                        const type = node.encounter.type;
                        stats.byType[type] = (stats.byType[type] || 0) + 1;

                        const name = node.encounter.name;
                        stats.byName[name] = (stats.byName[name] || 0) + 1;

                        if (name.startsWith("Default ")) {
                            stats.fallbacks++;
                        }
                    }
                });
            }

            log(`Total Encounters Generated: ${stats.total}`);
            log(`Fallbacks (Default *): ${stats.fallbacks} (${((stats.fallbacks / stats.total) * 100).toFixed(2)}%)`);

            log("\nBy Type:");
            Object.entries(stats.byType)
                .sort(([, a], [, b]) => b - a)
                .forEach(([type, count]) => {
                    log(`  ${type}: ${count} (${((count / stats.total) * 100).toFixed(1)}%)`);
                });

            log("\nTop 10 Encounters:");
            Object.entries(stats.byName)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .forEach(([name, count]) => {
                    log(`  ${name}: ${count}`);
                });

            log("\n");
        }
    } finally {
        console.log = originalLog;
        console.warn = originalWarn;
    }

    const outputPath = path.resolve(projectRoot, 'dungeon_stats_output.txt');
    fs.writeFileSync(outputPath, logBuffer.join('\n'));
    console.log(`Stats written to ${outputPath}`);
};

runStats();
