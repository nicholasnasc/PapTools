const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function parseFrontMatter(content) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = content.match(frontMatterRegex);
  if (match) {
    try {
      return yaml.load(match[1]);
    } catch (e) {
      console.warn('Failed to parse frontmatter:', e);
      return {};
    }
  }
  return {};
}

function extractDescription(content) {
  const withoutFrontMatter = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
  const lines = withoutFrontMatter.trim().split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      return trimmed.substring(0, 200);
    }
  }
  return '';
}

function scanRecipes(docsDir) {
  const recipes = [];
  const recipesPath = path.resolve(docsDir);
  
  if (!fs.existsSync(recipesPath)) {
    console.warn(`[cookbook-index] Directory not found: ${recipesPath}`);
    return recipes;
  }

  function scanDirectory(dir, relativePath = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, path.join(relativePath, item));
      } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const frontMatter = parseFrontMatter(content);
          const description = frontMatter.description || extractDescription(content);
          
          recipes.push({
            id: path.join(relativePath, item).replace(/\\/g, '/').replace(/\.(md|mdx)$/, ''),
            title: frontMatter.title || item.replace(/\.(md|mdx)$/, ''),
            description: description,
            tags: frontMatter.tags || [],
            difficulty: frontMatter.difficulty || 'intermediate',
            category: frontMatter.category || relativePath.split(path.sep)[0] || 'general',
          });
        } catch (err) {
          console.warn(`[cookbook-index] Failed to process ${fullPath}:`, err.message);
        }
      }
    }
  }

  scanDirectory(recipesPath);
  console.log(`[cookbook-index] Found ${recipes.length} recipes`);
  return recipes;
}

function cookbookIndexPlugin(context, options) {
  const { docsDir = 'ai-cookbook', routeBasePath = 'ai-cookbook' } = options;

  return {
    name: 'cookbook-index',
    
    async contentLoaded({ actions }) {
      const { setGlobalData } = actions;
      const recipes = scanRecipes(docsDir);
      
      // Normalize data shape expected by UI (items[])
      const items = recipes.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        tags: r.tags,
        // Best-effort permalink; UI will prefer real doc meta when available
        permalink: `/${routeBasePath}/${r.id === 'index' ? '' : r.id}`.replace(/\/$/, '/'),
      }));

      setGlobalData({
        // keep legacy key for debugging
        recipes,
        // primary key consumed by UI
        items,
        routeBasePath,
      });
    },
  };
}

module.exports = cookbookIndexPlugin;
