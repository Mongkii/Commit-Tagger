import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';

import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';

import postcssUrl from 'postcss-url';

const isProduction = process.env.NODE_ENV === 'production';

export default [
  {
    input: 'src/webview/index.tsx',
    output: {
      dir: 'out/webview',
      format: 'esm',
    },
    onwarn: (warning, warn) => warning.code !== 'EVAL' && warn(warning),
    plugins: [
      postcss({
        plugins: [postcssUrl({ url: 'inline' })],
        extract: true,
        minimize: isProduction,
        modules: isProduction && { generateScopedName: '[hash:base64:5]' },
      }),
      alias({
        entries: [
          { find: 'react', replacement: require.resolve('preact/compat') },
          { find: 'react-dom', replacement: require.resolve('preact/compat') },
        ],
      }),
      resolve(),
      commonjs(),
      typescript({ tsconfig: 'src/webview/tsconfig.json' }),
      isProduction && terser(),
    ],
  },
];
