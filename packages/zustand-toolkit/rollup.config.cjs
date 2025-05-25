const { withNx } = require('@nx/rollup/with-nx');

const external = ['react'];

module.exports = withNx(
  {
    main: './src/index.ts',
    outputPath: './dist',
    tsConfig: './tsconfig.lib.json',
    compiler: 'swc',
    format: ['esm'],
    external,
  },
);
