import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react({ babel: { plugins: [
function __dualiteSourceLoc({ types: t }) {
  return { visitor: { JSXOpeningElement(path, state) {
    var fn = state.filename || '';
    if (!fn || fn.includes('node_modules')) return;
    var name = path.node.name;
    var reactSpecials = ['Fragment', 'StrictMode', 'Suspense', 'Profiler'];
    var isReactSpecial = (name.type === 'JSXIdentifier' && reactSpecials.indexOf(name.name) !== -1) ||
      (name.type === 'JSXMemberExpression' && name.object && name.object.name === 'React' && name.property && reactSpecials.indexOf(name.property.name) !== -1) ||
      (name.type === 'JSXMemberExpression' && name.property && (name.property.name === 'Provider' || name.property.name === 'Consumer'));
    if (isReactSpecial) return;
    var attrs = path.node.attributes;
    for (var i = 0; i < attrs.length; i++) {
      if (attrs[i].type === 'JSXAttribute' && attrs[i].name && attrs[i].name.name === 'data-ds') return;
    }
    var loc = path.node.loc;
    if (!loc) return;
    var wd = '/home/project/';
    var rel = fn.startsWith(wd) ? fn.slice(wd.length) : fn;
    attrs.push(t.jsxAttribute(t.jsxIdentifier('data-ds'), t.stringLiteral(rel + ':' + loc.start.line + ':' + loc.start.column)));
  } } };
}
] } }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
