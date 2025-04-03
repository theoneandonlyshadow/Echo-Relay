const { info, succ, err, warn } = require('../controllers/LoggerStyles.js');

const clear = (res) => {
    res.setHeader('Clear-Site-Data', '"cache", "cookies"');
  };
  
  const show = (res, req) => {
    res.status(200);
    console.log(`${succ} Cache cleared`);
  };

const clearCache = (req, res) => {
    try {
      if (!req || !res) {
        console.error(`${err} Invalid request or response object`);
      }
  
      clear(res);
      show(res);
      
      if (!clear && !show) {
        console.error(`${warn} Cache aint cleared`);
      } else if (clear && show) {
        res.render('home');
      } else {
        console.error(`${err} Cache not cleared`);
        res.render('home');
      }

    } catch (error) {
      console.error(`${err} Invalid request or response object \n`, error);
    }
  };
  

  
  module.exports = { clearCache };