const fs = require('fs');
const path = require('path');

function analyzeFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Very basic regex-based extraction for fast overview
        const imports = content.match(/import\s+.*?\s+from\s+['"].*?['"]/g) || [];
        const components = content.match(/(?:const|function)\s+([A-Z][a-zA-Z0-9_]*)\s*=?\s*(?:\([^)]*\))?\s*(?:=>)?\s*\{/g) || [];
        const hooks = content.match(/use[A-Z][a-zA-Z0-9_]*/g) || [];
        const isPage = filePath.includes('page.tsx');
        
        return {
            lines: lines.length,
            imports: imports.length,
            components: components.map(c => c.replace(/(?:const|function)\s+/, '').split(/[\s=(]/)[0]),
            hooks: [...new Set(hooks)],
            isPage
        };
    } catch (e) {
        return { error: e.message };
    }
}

function analyzeRepo(dir, result = {}) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (['node_modules', '.git', '.next'].includes(file)) continue;
        
        if (fs.statSync(fullPath).isDirectory()) {
            analyzeRepo(fullPath, result);
        } else if (fullPath.match(/\.(ts|tsx)$/)) {
            const relPath = path.relative('.', fullPath).replace(/\\/g, '/');
            result[relPath] = analyzeFile(fullPath);
        }
    }
    return result;
}

const analysis = analyzeRepo('./frontend');
fs.writeFileSync('frontend_analysis.json', JSON.stringify(analysis, null, 2));
