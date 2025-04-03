const clear = (res) => {
    res.setHeader('Clear-Site-Data', '"cache", "cookies"');
  };
  
  const show = (res) => {
    res.status(200).render('cache');
  };

const clearCache = (req, res) => {
    try {
      if (!req || !res) {
        throw new Error('Invalid request or response object');
      }
  
      clear(res);
      show(res);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
  

  
  module.exports = { clearCache };