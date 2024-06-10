module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://54.169.101.100:8000',
        changeOrigin: true
      }
    }
  }
};
