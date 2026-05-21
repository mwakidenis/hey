import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  config: {
    inlineFragmentTypes: "combine",
    noGraphQLTag: true
  },
  documents: "./src/indexer/documents/**/*.graphql",
  generates: {
    "src/indexer/generated.ts": {
      config: {
        addDocBlocks: false,
        disableDescriptions: true,
        useTypeImports: true,
        withMutationFn: false,
        withMutationOptionsType: false,
        withResultType: false
      },
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo"
      ]
    },
    "src/indexer/possible-types.ts": {
      plugins: ["fragment-matcher"]
    }
  },
  overwrite: true,
  schema: "https://api.lens.xyz/graphql"
};

export default config;
