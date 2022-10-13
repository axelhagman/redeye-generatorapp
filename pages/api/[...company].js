// const puppeteer = require('puppeteer');
import Cors from 'cors';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

// Initializing the cors middleware
const cors = Cors();

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

const screenshot = (url) => async () => {
  const options = {
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  };
  // const options = process.env.AWS_REGION
  //   ? {
  //       args: chrome.args,
  //       executablePath: await chrome.executablePath,
  //       headless: chrome.headless,
  //     }
  //   : {
  //       args: [],
  //       executablePath:
  //         process.platform === 'win32'
  //           ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  //           : process.platform === 'linux'
  //           ? '/usr/bin/google-chrome'
  //           : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  //     };
  const browser = await chromium.puppeteer.launch(options);
  const page = await browser.newPage();
  await page.setViewport({ width: 870, height: 210 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  const screenshot = await page.screenshot({ omitBackground: true });
  await browser.close();

  return screenshot;
};

const companyScreenshot = (req, res) => {
  (async () => {
    // await runMiddleware(req, res, cors());
    const {
      query: { company },
    } = req;
    const companyId = company[0].split('.')[0];
    // const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    // const page = await browser.newPage();
    // page.setViewport({ width: 870, height: 210 });
    // await page.goto(
    //   `https://www.redeye.se/utility/qualityRatingImage?companyId=${companyId}`,
    //   {
    //     waitUntil: 'networkidle2',
    //   }
    // );
    // const file = await page.screenshot({ omitBackground: true });
    const file = await screenshot(
      `https://www.redeye.se/utility/qualityRatingImage?companyId=${companyId}`
    );

    // await browser.close();

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.statusCode = 200;
    res.send(file);
  })();
};

export default companyScreenshot;
