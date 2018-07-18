import path from 'path'

export default {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/ringcentral.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ringcentral.js',
    library: 'RingCentral',
    libraryTarget: 'umd',
    globalObject: 'this' // fix window undefined issue in node
  },
  externals: {
    axios: {
      commonjs: 'axios',
      commonjs2: 'axios',
      amd: 'axios',
      root: 'axios'
    }
  }
}
