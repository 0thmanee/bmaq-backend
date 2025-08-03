// Script to fix TypeScript route handler types
const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src/routes');
const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix route handler type annotations
  content = content.replace(
    /async \(request: FastifyRequest<[^>]+>\, reply: FastifyReply\) => \{/g,
    'async (request, reply) => {'
  );
  
  // Fix plugins too
  const pluginsDir = path.join(__dirname, 'src/plugins');
  if (fs.existsSync(pluginsDir)) {
    const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.ts'));
    pluginFiles.forEach(pluginFile => {
      const pluginPath = path.join(pluginsDir, pluginFile);
      let pluginContent = fs.readFileSync(pluginPath, 'utf8');
      
      // Fix parameter type annotations
      pluginContent = pluginContent.replace(
        /\(([^)]+): any\)/g,
        '($1)'
      );
      
      fs.writeFileSync(pluginPath, pluginContent);
    });
  }
  
  fs.writeFileSync(filePath, content);
});

console.log('Fixed TypeScript route handler types');
