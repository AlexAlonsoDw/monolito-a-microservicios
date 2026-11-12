/**
 * dependency-cruiser: architectural guard rails for the app.
 *
 * Run:  npm run depcruise
 * Docs: https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md
 *
 * Target architecture: a modular monolith.
 *   - Every module under src/modules/<name>/ is a closed box. Outsiders only
 *     touch its public index.ts.
 *   - Modules never reach into another module's internals.
 *   - src/lib is a shared kernel and must never depend on features or the app.
 *   - No dependency cycles anywhere.
 */

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment:
        "Circular dependencies make the code impossible to reason about and block extracting a module into its own service.",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-non-package-json",
      severity: "error",
      comment:
        "This import resolves to a package that is not declared in package.json. It will break on a clean install.",
      from: {},
      to: { dependencyTypes: ["npm-no-pkg", "npm-unknown"] },
    },
    {
      name: "not-to-unresolvable",
      severity: "error",
      comment:
        "This import cannot be resolved. Check the path or the @/* alias in tsconfig.json.",
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: "module-boundary-public-api",
      severity: "error",
      comment:
        "Outside a module, import it only through its public index.ts. Repository, service and mappers are private.",
      from: { pathNot: "^src/modules/[^/]+/" },
      to: {
        path: "^src/modules/[^/]+/",
        pathNot: "^src/modules/[^/]+/index\\.ts$",
      },
    },
    {
      name: "no-cross-module-internals",
      severity: "error",
      comment:
        "A module must not reach into another module's internals. Cross-module access goes through the other module's index.ts.",
      from: { path: "^src/modules/([^/]+)/" },
      to: {
        path: "^src/modules/([^/]+)/",
        pathNot: ["^src/modules/$1/", "^src/modules/[^/]+/index\\.ts$"],
      },
    },
    {
      name: "lib-is-a-shared-kernel",
      severity: "error",
      comment:
        "src/lib is shared infrastructure. It must never depend on features (src/modules) or the app layer.",
      from: { path: "^src/lib/" },
      to: { path: "^src/(modules|app)/" },
    },
    {
      name: "no-orphans",
      severity: "warn",
      comment:
        "A module that nothing imports is dead code (or a forgotten entry point).",
      from: {
        orphan: true,
        pathNot: ["^src/app/", "\\.spec\\.ts$", "/__tests__/"],
      },
      to: {},
    },
  ],

  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "(^|/)(\\.next|node_modules|out|build|dist|coverage)/" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
