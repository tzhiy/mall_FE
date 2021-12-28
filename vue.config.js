module.exports = {
  devServer: {
    // 跨域
    proxy: {
      'api': {
        // 目标路径
        target: 'http://121.43.173.31:8080',
        // 允许跨越
        changOrigin: true,
        // 重写路径
        pathRewrite: {
          '^/api': ""
        }
      }
    }
  }
}