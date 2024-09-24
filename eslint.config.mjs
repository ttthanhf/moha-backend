import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import TsEslint from 'typescript-eslint';
import pluginEslintJs from '@eslint/js';

export default [
	eslintPluginPrettierRecommended,
	pluginEslintJs.configs.recommended,
	...TsEslint.configs.recommended,
	{
		rules: {
			'no-case-declarations': 'off'
		}
	},
	{
		ignores: ['build/**/*', 'node_modules/**/*']
	}
];
