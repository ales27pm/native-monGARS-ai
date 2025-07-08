
const fs = require('fs');
const requiredDeps = ['expo', 'react-native', 'openai', '@anthropic-ai/sdk', 'zustand'];

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

let missing = requiredDeps.filter(dep => !pkg.dependencies || !pkg.dependencies[dep]);

if (missing.length > 0) {
  console.error('❌ Missing dependencies:', missing.join(', '));
  process.exit(1);
} else {
  console.log('✅ All required dependencies are present.');
}

// ===== End of File: {label} =====

