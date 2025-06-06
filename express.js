const http = require('http');
const { parse } = require('url');

function pathToRegex(path) {
  const parts = path.split('/').filter(Boolean);
  const paramNames = [];
  const regexParts = parts.map(part => {
    if (part.startsWith(':')) {
      paramNames.push(part.slice(1));
      return '([^/]+)';
    }
    return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });
  const regex = new RegExp('^/' + regexParts.join('/') + '/?$');
  return { regex, paramNames };
}

function express() {
  const middlewares = [];
  const routes = [];

  const app = (req, res) => {
    let idx = 0;
    req.params = {};
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (obj) => {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json');
      }
      res.end(JSON.stringify(obj));
    };
    res.redirect = (url) => {
      res.statusCode = 302;
      res.setHeader('Location', url);
      res.end();
    };

    const next = (err) => {
      if (err) {
        res.statusCode = 500;
        res.end('Internal Server Error');
        return;
      }
      if (idx < middlewares.length) {
        const mw = middlewares[idx++];
        mw(req, res, next);
        return;
      }
      handleRoute();
    };

    const handleRoute = () => {
      for (const route of routes) {
        if (route.method !== req.method) continue;
        const match = route.regex.exec(parse(req.url).pathname);
        if (match) {
          route.paramNames.forEach((name, i) => {
            req.params[name] = match[i + 1];
          });
          return route.handler(req, res);
        }
      }
      res.statusCode = 404;
      res.end('Not Found');
    };

    next();
  };

  app.use = (mw) => {
    middlewares.push(mw);
  };

  ['GET', 'POST', 'PUT', 'DELETE'].forEach(method => {
    app[method.toLowerCase()] = (path, handler) => {
      const { regex, paramNames } = pathToRegex(path);
      routes.push({ method, regex, paramNames, handler });
    };
  });

  app.listen = (port, cb) => {
    const server = http.createServer(app);
    return server.listen(port, cb);
  };


  return app;
}

express.json = () => {
  return (req, res, next) => {
    if (req.headers['content-type'] !== 'application/json') {
      return next();
    }
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch (e) {
        res.statusCode = 400;
        res.end('Invalid JSON');
        return;
      }
      next();
    });
  };
};

module.exports = express;

