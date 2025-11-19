/* eslint-disable */

/**
 * checker.js
 *
 * This file is modified from the ssl-date-checker package, which is licensed under the MIT license.
 * @see https://github.com/rheh/ssl-date-checker/blob/master/src/Checker.js
 *
 * Changes:
 * - add a default port of 443
 * - adds a timeout for the request (defaults to 5000ms)
 * - removes an unnecessary log statement

 */
import https from 'node:https';

function checkHost(newHost) {
  if (!newHost) {
    throw new Error('Invalid host');
  }

  return true;
}

function checkPort(newPort) {
  const portVal = newPort || 443;
  const numericPort = !isNaN(parseFloat(portVal)) && isFinite(portVal);

  if (numericPort === false) {
    throw new Error('Invalid port');
  }

  return true;
}

/**
 * Checks the SSL certificate of a given host and port.
 * @param {string} host - The host to check the SSL certificate of.
 * @param {number} [port] - The port to check the SSL certificate of. Defaults to 443.
 * @param {number} [timeout] - The timeout in milliseconds for the request. Defaults to 5000.
 * @returns {Promise<Object>} - A promise that resolves with the SSL certificate information.
 */
export async function checker(host, port = 443, timeout = 5000) {
  if (host === null) {
    throw new Error('Invalid host');
  }

  checkHost(host);
  checkPort(port);

  return new Promise((resolve, reject) => {
    let timeoutId;
    const options = {
      host,
      port,
      method: 'GET',
      rejectUnauthorized: false,
    };

    const req = https.request(options, function(res) {
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      res.on('data', (d) => {
        // process.stdout.write(d);
      });

      const certificateInfo = res.socket.getPeerCertificate();

      // console.log(certificateInfo);

      const dateInfo = {
        valid_from: certificateInfo.valid_from,
        valid_to: certificateInfo.valid_to,
        serialNumber: certificateInfo.serialNumber,
        fingerprint : certificateInfo.fingerprint
      };
      // console.log(host, dateInfo.valid_from, dateInfo.valid_to);

      resolve(dateInfo);
    });

    req.on('error', (e) => {
      // Clear the timeout since we got an error
      clearTimeout(timeoutId);
      reject(e);
    });

    timeoutId = setTimeout(() => {
      req.destroy();
      reject(new Error(`Request timeout: ${host}:${port} did not respond within ${timeout / 1000} seconds`));
    }, timeout);

    req.end();
  });
}
