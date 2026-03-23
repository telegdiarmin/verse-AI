/** @type {import("prettier").Config} */
const prettierConfig = {
  printWidth: 100,
  singleQuote: true,
  plugins: ['prettier-plugin-embed', '@ianvs/prettier-plugin-sort-imports'],
  importOrder: ['<BUILTIN_MODULES>', '<THIRD_PARTY_MODULES>', '', '^[.]'],
  importOrderParserPlugins: ['typescript', 'explicitResourceManagement', 'decorators'],
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'angular',
      },
    },
  ],
};

/** @type {import('prettier-plugin-embed').PrettierPluginEmbedOptions} */
const prettierPluginEmbedConfig = {
  embeddedSqlTags: ['sql.type', 'sql.unsafe', 'sql.fragment'],
};

const config = {
  ...prettierConfig,
  ...prettierPluginEmbedConfig,
};
export default config;
