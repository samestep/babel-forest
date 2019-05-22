module.exports = {
  files: {
    javascripts: {
      joinTo: {
        'app.js': 'app/**',
        'vendor.js': 'node_modules/**',
      },
    },
  },
  modules: { autoRequire: { 'app.js': ['renderer'] } },
  npm: { static: ['node_modules/phaser/dist/phaser.js'] },
  plugins: { brunchTypescript: { ignoreErrors: true } },
};
