// Script to fix all API calls in frontend pages
const fs = require('fs');
const path = require('path');

const filesToFix = [
  'frontend/app/dashboard/subscribers/page.tsx',
  'frontend/app/dashboard/domains/page.tsx', 
  'frontend/app/dashboard/templates/page.tsx',
  'frontend/app/dashboard/reports/page.tsx',
  'frontend/app/dashboard/admin/page.tsx',
  'frontend/app/dashboard/settings/page.tsx',
  'frontend/app/dashboard/test-tracking/page.tsx'
];

const apiMappings = {
  // Campaign API
  'fetch("/api/campaigns/list?userId=${user.uid}")': 'campaignAPI.list()',
  'fetch("/api/campaigns/create")': 'campaignAPI.create(data)',
  'fetch("/api/campaigns/send")': 'campaignAPI.send(id, data)',
  'fetch("/api/campaigns/delete")': 'campaignAPI.delete(id)',
  
  // Subscriber API  
  'fetch("/api/subscribers/list?userId=${user.uid}")': 'subscriberAPI.list()',
  'fetch("/api/subscribers/create")': 'subscriberAPI.add(data)',
  'fetch("/api/subscribers/update")': 'subscriberAPI.update(id, data)',
  'fetch("/api/subscribers/delete")': 'subscriberAPI.delete(id)',
  
  // Domain API
  'fetch("/api/domains/list?userId=${user.uid}")': 'domainAPI.list()',
  'fetch("/api/domains/create")': 'domainAPI.add(data)',
  'fetch("/api/domains/verify")': 'domainAPI.verify(id)',
  'fetch("/api/domains/delete")': 'domainAPI.delete(id)',
  
  // Template API
  'fetch("/api/templates/list?userId=${user.uid}")': 'templateAPI.list()',
  'fetch("/api/templates/create")': 'templateAPI.create(data)',
  'fetch("/api/templates/update")': 'templateAPI.update(id, data)',
  'fetch("/api/templates/delete")': 'templateAPI.delete(id)',
  
  // Gmail API
  'fetch("/api/gmail/status?userId=${user.uid}")': 'gmailAPI.getStatus()',
  'fetch("/api/gmail/connect")': 'gmailAPI.connect(email, password)',
  'fetch("/api/gmail/disconnect")': 'gmailAPI.disconnect()',
  'fetch("/api/gmail/send")': 'gmailAPI.send(data)',
  
  // User ID fixes
  'user.uid': 'user.id',
  'userId=${user.uid}': 'userId=${user.id}'
};

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Add imports if not present
  if (!content.includes('import {') || !content.includes('api-client')) {
    const importLine = "import { campaignAPI, domainAPI, templateAPI, subscriberAPI, gmailAPI } from '@/lib/api-client';";
    content = content.replace(
      /import.*from.*lucide-react.*;/,
      `$&\n${importLine}`
    );
    modified = true;
  }
  
  // Fix API calls
  Object.entries(apiMappings).forEach(([oldPattern, newPattern]) => {
    if (content.includes(oldPattern)) {
      content = content.replace(new RegExp(oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPattern);
      modified = true;
    }
  });
  
  // Fix response handling
  content = content.replace(/const data = await res\.json\(\);/g, '// Response already parsed by API client');
  content = content.replace(/if \(!res\.ok\)/g, 'if (!data.success)');
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

// Fix all files
filesToFix.forEach(fixFile);
console.log('API fixes completed!');
