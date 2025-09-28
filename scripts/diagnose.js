#!/usr/bin/env node

/**
 * LexiNote Setup Diagnostic Tool
 * Run this with: node scripts/diagnose.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 LexiNote Setup Diagnostic Tool\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found. Please run this from the project root directory.');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.name !== 'lexinote') {
  console.error('❌ This doesn\'t appear to be the lexinote project.');
  process.exit(1);
}

console.log('✅ Running in lexinote project directory\n');

// Check environment file
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

console.log('📋 Environment Variables Check:');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env.local file not found');
  if (fs.existsSync(envExamplePath)) {
    console.log('💡 Copy .env.example to .env.local and fill in your values');
  }
} else {
  console.log('✅ .env.local file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'DATABASE_URL',
    'GOOGLE_API_KEY', 
    'PINECONE_API_KEY',
    'KINDE_CLIENT_ID',
    'KINDE_CLIENT_SECRET',
    'UPLOADTHING_SECRET'
  ];
  
  console.log('\n🔑 Required Environment Variables:');
  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(varName + '=') && !envContent.includes(varName + '=your_');
    console.log(`  ${hasVar ? '✅' : '❌'} ${varName}`);
  });
}

// Check important files
console.log('\n📁 Important Files Check:');
const importantFiles = [
  'src/lib/pinecone.ts',
  'src/lib/geminiai.ts', 
  'src/app/api/uploadthing/core.ts',
  'src/app/api/message/route.ts',
  'prisma/schema.prisma'
];

importantFiles.forEach(filePath => {
  const exists = fs.existsSync(path.join(process.cwd(), filePath));
  console.log(`  ${exists ? '✅' : '❌'} ${filePath}`);
});

// Check node_modules
console.log('\n📦 Dependencies Check:');
const nodeModulesExists = fs.existsSync(path.join(process.cwd(), 'node_modules'));
console.log(`  ${nodeModulesExists ? '✅' : '❌'} node_modules (run 'npm install' if missing)`);

if (nodeModulesExists) {
  const criticalPackages = [
    '@langchain/google-genai',
    '@langchain/pinecone',
    '@pinecone-database/pinecone',
    '@prisma/client'
  ];
  
  criticalPackages.forEach(pkg => {
    const exists = fs.existsSync(path.join(process.cwd(), 'node_modules', pkg));
    console.log(`  ${exists ? '✅' : '❌'} ${pkg}`);
  });
}

console.log('\n🏥 Next Steps:');
console.log('1. Make sure all environment variables are set in .env.local');
console.log('2. Run: npm install');
console.log('3. Run: npx prisma generate'); 
console.log('4. Run: npx prisma db push');
console.log('5. Test your setup: curl http://localhost:3000/api/debug/health');
console.log('6. Start development: npm run dev');

console.log('\n💡 If you need help:');
console.log('- Check the README.md for setup instructions');
console.log('- Visit /api/debug/health in your browser for runtime diagnostics');
console.log('- Check the browser console and server logs for errors');