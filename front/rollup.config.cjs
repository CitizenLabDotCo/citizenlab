import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';

const packageJson = require('./package.json');

const external = Object.keys(packageJson.dependencies || {});

const config = [
  {
    input: 'app/component-library/index.tsx',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: false,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: false,
      },
    ],
    external,
    plugins: [
      peerDepsExternal(),
      postcss(),
      resolve({ preferBuiltins: true }),
      commonjs(),
      typescript({
        tsconfig: './app/tsconfig.json',
        exclude: ['**/*.test.ts', '**/*.test.tsx'],
      }),
      terser(),
    ],
  },
  {
    input: 'dist/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    external: [/\.css$/],
    plugins: [dts()],
  },
];

export default config;
