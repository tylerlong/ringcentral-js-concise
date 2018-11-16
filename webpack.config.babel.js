const defaultConfig = {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/ringcentral.js',
  output: {
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

const pubnubConfig = {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/pubnub.js',
  output: {
    filename: 'pubnub.js',
    library: 'RCPubNub',
    libraryTarget: 'umd',
    globalObject: 'this' // fix window undefined issue in node
  },
  externals: {
    pubnub: {
      commonjs: 'pubnub',
      commonjs2: 'pubnub',
      amd: 'pubnub',
      root: 'PubNub'
    }
  }
}

export default [defaultConfig, pubnubConfig]
