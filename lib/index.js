var express = require('express');
var request = require('request');
var cors = require('cors');
var chalk = require('chalk');
var proxy = express();

var cookie = null

var startProxy = function (port, proxyUrl, proxyPartial, credentials, origin) {
  proxy.use(cors({ credentials: credentials, origin: origin }));
  proxy.options('*', cors({ credentials: credentials, origin: origin }));

  // remove trailing slash
  var cleanProxyUrl = proxyUrl.replace(/\/$/, '');
  // remove all forward slashes
  var cleanProxyPartial = proxyPartial.replace(/\//g, '');

  proxy.use('/' + cleanProxyPartial, function (req, res) {
    if (global.cookie)
      req.headers['cookie'] = global.cookie
    try {
      console.log(chalk.green('Request Proxieda -> ' + req.url));
      console.log('HEADERS' + JSON.stringify(req.headers))
      console.log()
    } catch (e) { }
    req.pipe(
      request(cleanProxyUrl + req.url)
        .on('response', response => {
          // In order to avoid https://github.com/expressjs/cors/issues/134
          try {
            if (response.headers['set-cookie'])
              global.cookie = response.headers['set-cookie'][0].split('; Path')[0]
          } catch (e) {
            console.log('Erro no cookie' + e)
          }

          response.headers['access-control-allow-origin'] = '*';
        })
    ).pipe(res);
  });

  proxy.listen(port);

  // Welcome Message
  console.log(chalk.bgGreen.black.bold.underline('\n Proxy Active \n'));
  console.log(chalk.blue('Proxy Url: ' + chalk.green(cleanProxyUrl)));
  console.log(chalk.blue('Proxy Partial: ' + chalk.green(cleanProxyPartial)));
  console.log(chalk.blue('PORT: ' + chalk.green(port)));
  console.log(chalk.blue('Credentials: ' + chalk.green(credentials)));
  console.log(chalk.blue('Origin: ' + chalk.green(origin) + '\n'));
  console.log(
    chalk.cyan(
      'To start using the proxy simply replace the proxied part of your url with: ' +
      chalk.bold('http://localhost:' + port + '/' + cleanProxyPartial + '\n')
    )
  );
};

exports.startProxy = startProxy;