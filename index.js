#! /usr/bin/env node
import chalk from 'chalk';
import {checker} from './ssl-checker.js';
import {sites} from './sites.js';

const {default: ResultFormatter} = await import('ssl-date-checker/src/formatters/ResultFormatter.js');

const formatter = new ResultFormatter('json');


const getSSLData = async() => {
  const checks = sites.map((site) => {
    const port = /^ds/.test(site) ? 5001 : 443;

    return checker(site, port);
  });

  console.log(chalk.cyan('\nChecking SSL certificates...'));
  const results = await Promise.allSettled(checks);

  return results.map((item, i) => {
    const site = sites[i];

    if (item.status === 'fulfilled') {
      const result = formatter.format(site, item.value);

      item.result = JSON.parse(result);
    }

    return item;
  });
};

const formatSuccesses = (results) => {
  return results.map(({result}, i) => {
    const {expires, host, valid_to} = result;
    const res = `${host}: ${valid_to}`;
    const text = i % 2 ? chalk.cyan(res) : res;

    return {expires, text};
  });
};

const logSuccesses = (results) => {
  console.log(chalk.bold.green('\nSSL Expirations:\n'));

  return results.forEach(({text, expires}) => {
    let color = 'green';

    if (expires < 30) {
      color = 'red';
    } else if (expires < 40) {
      color = 'yellow';
    }
    console.log(chalk[color](`${expires} days:`), text);
  });
};


const checkSSL = async() => {
  if (!sites.length) {
    return console.log(chalk.cyan('Make sure you have a sites.js file either in the same directory as this script or in the current working directory'));
  }

  const checked = await getSSLData();

  const succeeded = checked
  .filter(({status}) => status === 'fulfilled');

  const successes = formatSuccesses(succeeded);

  const rejected = checked
  .filter(({status}) => status === 'rejected');

  logSuccesses(successes);

  if (rejected.length) {
    console.log('\n~~~~~~~~~~~\n');
    rejected.forEach((err) => {
      console.log(err.reason);
    });
  } else {
    console.log('All good!');
  }
};

checkSSL();
