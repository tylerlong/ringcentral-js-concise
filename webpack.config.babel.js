import path from 'path'

export default {
  mode: 'production',
  entry: './src/ringcentral.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ringcentral.js',
    library: 'RingCentral',
    libraryTarget: 'umd'
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
