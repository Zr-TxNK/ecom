/**
 * ============================================================
 * eCommerce Project — HTML File Reorganization Script
 * ============================================================
 * 
 * This script will:
 *  1. Create new subdirectories (shop, product, blog, cart, auth, pages)
 *  2. Move HTML files into their respective folders
 *  3. Update ALL relative paths inside EVERY HTML file:
 *     - CSS / JS / Image / Favicon references (add ../ prefix)
 *     - Inter-page href links (rewrite to new folder paths)
 * 
 * Usage:
 *   node reorganize.js            — Preview changes (DRY RUN, no files moved)
 *   node reorganize.js --execute  — Actually move files and rewrite paths
 * 
 * ============================================================
 */

const fs = require('fs');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────

const ROOT = __dirname;
const DRY_RUN = !process.argv.includes('--execute');

// File → target folder mapping
const FILE_MAP = {
  // Shop listing pages → shop/
  'shop-3-column.html': 'shop',
  'shop-4-column.html': 'shop',
  'shop-left-sidebar.html': 'shop',
  'shop-right-sidebar.html': 'shop',
  'shop-list.html': 'shop',
  'shop-list-left-sidebar.html': 'shop',
  'shop-list-right-sidebar.html': 'shop',

  // Single product pages → product/
  'single-product.html': 'product',
  'single-product-affiliate.html': 'product',
  'single-product-carousel.html': 'product',
  'single-product-gallery-left.html': 'product',
  'single-product-gallery-right.html': 'product',
  'single-product-group.html': 'product',
  'single-product-normal.html': 'product',
  'single-product-sale.html': 'product',
  'single-product-tab-style-left.html': 'product',
  'single-product-tab-style-right.html': 'product',
  'single-product-tab-style-top.html': 'product',
  'product-details.html': 'product',

  // Blog pages → blog/
  'blog-2-column.html': 'blog',
  'blog-3-column.html': 'blog',
  'blog-audio-format.html': 'blog',
  'blog-details.html': 'blog',
  'blog-details-left-sidebar.html': 'blog',
  'blog-details-right-sidebar.html': 'blog',
  'blog-gallery-format.html': 'blog',
  'blog-left-sidebar.html': 'blog',
  'blog-list.html': 'blog',
  'blog-list-left-sidebar.html': 'blog',
  'blog-list-right-sidebar.html': 'blog',
  'blog-right-sidebar.html': 'blog',
  'blog-video-format.html': 'blog',

  // Cart & checkout → cart/
  'cart.html': 'cart',
  'shopping-cart.html': 'cart',
  'checkout.html': 'cart',
  'compare.html': 'cart',
  'wishlist.html': 'cart',

  // Auth → auth/
  'login-register.html': 'auth',

  // Static / utility pages → pages/
  'about-us.html': 'pages',
  'contact.html': 'pages',
  'faq.html': 'pages',
  '404.html': 'pages',
};

// Root files that don't move but still need href updates
const ROOT_FILES = [
  'index.html',
  'index-2.html',
  'index-3.html',
  'index-4.html',
];

// Asset path prefixes that need ../ when in a subfolder
const ASSET_PREFIXES = [
  'css/',
  'js/',
  'images/',
  'fonts/',
  'data/',
  'style.css',
];

// ─── Helper Functions ─────────────────────────────────────────

/**
 * Build a lookup: filename → new folder (or null for root files)
 */
function buildFileLookup() {
  const lookup = {};
  for (const [file, folder] of Object.entries(FILE_MAP)) {
    lookup[file] = folder;
  }
  for (const file of ROOT_FILES) {
    lookup[file] = null; // stays in root
  }
  return lookup;
}

/**
 * Rewrite a single href/src value based on:
 * - sourceFolder: where the current HTML file will live (null = root)
 * - the href value itself
 */
function rewritePath(href, sourceFolder, fileLookup) {
  // Skip anchors, external links, data URIs, javascript:, mailto:, #
  if (!href || href.startsWith('#') || href.startsWith('http') ||
      href.startsWith('//') || href.startsWith('data:') ||
      href.startsWith('javascript:') || href.startsWith('mailto:')) {
    return href;
  }

  const trimmed = href.trim();

  // ── Case 1: Asset references (css/, js/, images/, fonts/, style.css) ──
  for (const prefix of ASSET_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      if (sourceFolder) {
        // File is in a subfolder → needs ../
        return '../' + trimmed;
      }
      // File is in root → no change needed
      return trimmed;
    }
  }

  // ── Case 2: Link to another HTML page ──
  // Extract just the filename (ignore query strings / anchors)
  const htmlMatch = trimmed.match(/^([^?#]+\.html)(.*)$/);
  if (htmlMatch) {
    const targetFile = htmlMatch[1];
    const suffix = htmlMatch[2] || '';
    const targetFolder = fileLookup[targetFile];

    if (targetFolder === undefined) {
      // Unknown file — leave as-is
      return href;
    }

    if (sourceFolder === null && targetFolder === null) {
      // root → root: no change
      return trimmed;
    }

    if (sourceFolder === null && targetFolder !== null) {
      // root → subfolder
      return targetFolder + '/' + targetFile + suffix;
    }

    if (sourceFolder !== null && targetFolder === null) {
      // subfolder → root
      return '../' + targetFile + suffix;
    }

    if (sourceFolder === targetFolder) {
      // same subfolder → just filename
      return targetFile + suffix;
    }

    // different subfolder → ../otherFolder/file
    return '../' + targetFolder + '/' + targetFile + suffix;
  }

  return href;
}

/**
 * Rewrite all href and src attributes in HTML content
 */
function rewriteHtml(content, sourceFolder, fileLookup) {
  // Match href="..." and src="..." (both single and double quotes)
  return content.replace(
    /((?:href|src)\s*=\s*)(["'])([^"']*)\2/gi,
    (match, prefix, quote, value) => {
      const newValue = rewritePath(value, sourceFolder, fileLookup);
      if (newValue !== value) {
        return prefix + quote + newValue + quote;
      }
      return match;
    }
  );
}

// ─── Main Execution ───────────────────────────────────────────

function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   eCommerce HTML Reorganization Script           ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE — No files will be moved or modified.');
    console.log('   Run with --execute to apply changes.\n');
  } else {
    console.log('⚡ EXECUTE MODE — Files WILL be moved and modified.\n');
  }

  const fileLookup = buildFileLookup();

  // ── Step 1: Create directories ──
  const folders = [...new Set(Object.values(FILE_MAP))];
  console.log('📁 Step 1: Creating directories...');
  for (const folder of folders) {
    const dirPath = path.join(ROOT, folder);
    if (!fs.existsSync(dirPath)) {
      console.log(`   ✅ mkdir ${folder}/`);
      if (!DRY_RUN) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    } else {
      console.log(`   ⏭️  ${folder}/ already exists`);
    }
  }

  // ── Step 2: Move files ──
  console.log('\n📦 Step 2: Moving HTML files...');
  let moveCount = 0;
  for (const [file, folder] of Object.entries(FILE_MAP)) {
    const srcPath = path.join(ROOT, file);
    const destPath = path.join(ROOT, folder, file);

    if (!fs.existsSync(srcPath)) {
      console.log(`   ⚠️  ${file} not found, skipping`);
      continue;
    }

    console.log(`   📄 ${file}  →  ${folder}/${file}`);
    if (!DRY_RUN) {
      fs.renameSync(srcPath, destPath);
    }
    moveCount++;
  }
  console.log(`   Total: ${moveCount} files to move`);

  // ── Step 3: Rewrite paths in moved files ──
  console.log('\n🔗 Step 3: Rewriting paths in moved files...');
  let rewriteCount = 0;
  for (const [file, folder] of Object.entries(FILE_MAP)) {
    const filePath = DRY_RUN
      ? path.join(ROOT, file)  // In dry-run, file hasn't moved yet
      : path.join(ROOT, folder, file);

    if (!fs.existsSync(filePath)) {
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const newContent = rewriteHtml(content, folder, fileLookup);

    if (content !== newContent) {
      console.log(`   ✏️  Updated paths in ${folder}/${file}`);
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
      }
      rewriteCount++;
    } else {
      console.log(`   ⏭️  No path changes needed in ${folder}/${file}`);
    }
  }

  // ── Step 4: Rewrite paths in root files (index*.html) ──
  console.log('\n🏠 Step 4: Rewriting paths in root files...');
  for (const file of ROOT_FILES) {
    const filePath = path.join(ROOT, file);
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  ${file} not found, skipping`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const newContent = rewriteHtml(content, null, fileLookup);

    if (content !== newContent) {
      console.log(`   ✏️  Updated hrefs in ${file}`);
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
      }
      rewriteCount++;
    } else {
      console.log(`   ⏭️  No href changes needed in ${file}`);
    }
  }

  // ── Summary ──
  console.log('\n' + '═'.repeat(50));
  console.log(`✅ Done!`);
  console.log(`   📦 Files to move: ${moveCount}`);
  console.log(`   ✏️  Files with path rewrites: ${rewriteCount}`);
  if (DRY_RUN) {
    console.log('\n💡 This was a DRY RUN. To apply changes, run:');
    console.log('   node reorganize.js --execute');
  }
  console.log('');
}

main();
