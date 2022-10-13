const puppeteer = require('puppeteer');
import Cors from 'cors';

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

const corsOptions = {
  origin: (origin, callback) => {
    if (origin === 'http://localhost:3000/') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

const companyScreenshot = (req, res) => {
  (async () => {
    await runMiddleware(req, res, cors(corsOptions));
    const {
      query: { company },
    } = req;
    const companyId = company[0].split('.')[0];
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.setViewport({ width: 870, height: 210 });
    await page.goto(
      `https://www.redeye.se/utility/qualityRatingImage?companyId=${companyId}`,
      {
        waitUntil: 'networkidle2',
      }
    );
    const file = await page.screenshot({ omitBackground: true });

    await browser.close();
    res.statusCode = 200;
    res.send(file);
  })();
};

export default companyScreenshot;
