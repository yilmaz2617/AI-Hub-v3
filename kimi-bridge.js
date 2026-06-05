const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const PROJECT_DIR = 'D:\\AI-Hub-v3';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/write') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { filePath, content } = JSON.parse(body);
        const fullPath = path.join(PROJECT_DIR, filePath);
        
        // Güvenlik: Proje dizini dışına çıkma
        if (!fullPath.startsWith(PROJECT_DIR)) {
          res.writeHead(403);
          res.end(JSON.stringify({ error: 'Access denied' }));
          return;
        }

        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf8');
        
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, path: fullPath }));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/read') {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const filePath = url.searchParams.get('path');
    const fullPath = path.join(PROJECT_DIR, filePath);
    
    if (!fullPath.startsWith(PROJECT_DIR)) {
      res.writeHead(403);
      res.end(JSON.stringify({ error: 'Access denied' }));
      return;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      res.writeHead(200);
      res.end(JSON.stringify({ content }));
    } catch (err) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'File not found' }));
    }
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 Kimi Bridge Agent running on http://localhost:${PORT}`);
  console.log(`📁 Project: ${PROJECT_DIR}`);
});
