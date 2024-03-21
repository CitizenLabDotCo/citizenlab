import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import external from 'rollup-plugin-peer-deps-external';
import terser from '@rollup/plugin-terser';

const config = [
  {
    input: 'app/component-library/index.tsx',
    output: [
      {
        format: 'esm',
        sourcemap: false,
        dir: 'dist',
      },
    ],
    plugins: [
      external(),
      peerDepsExternal(),
      postcss(),
      resolve({ preferBuiltins: true }),
      commonjs(),
      terser(),
      typescript({
        tsconfig: './app/tsconfig.json',
        exclude: [
          '**/*.test.ts',
          '**/*.test.tsx',
          '**/*.stories.tsx',
          '**/*.stories.ts',
        ],
        declarationDir: 'dist',
        sourceMap: false,
      }),
    ],
  },
];

export default config;
