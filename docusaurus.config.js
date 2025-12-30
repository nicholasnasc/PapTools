const FontPreloadPlugin = require('webpack-font-preload-plugin');

/** @type {import('@docusaurus/types').DocusaurusConfig} */

module.exports = async function createConfigAsync() {
  return {
    title: 'PapTools - Documentação Claro',
    tagline: 'Orquestração de Processos Inteligente',
    url: 'https://paptools.claro.com.br',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenAnchors: 'throw',
    favicon: 'img/favicon.png',
    organizationName: 'paptools', // Usually your GitHub org/user name.
    projectName: 'paptools-documentation', // Usually your repo name.
    headTags: [
      {
        tagName: 'link',
        attributes: {
          rel: 'preload',
          href: 'https://paptools.vercel.app/',
          as: 'document',
        },
      },
    ],
    clientModules: [
      './src/client/remote-amplitude-analytics.js',
    ],
    themeConfig: {
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      metadata: [{ name: 'robots', content: 'follow, index' }],
      image: '/img/assets/open-graph-shiny.png',
      prism: {
        additionalLanguages: ['java', 'ruby', 'php', 'csharp', 'toml', 'bash', 'docker'],
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      navbar: {
        hideOnScroll: false,
        logo: {
          alt: 'PAP TOOLS logo',
          src: 'img/assets/logo.png',
          srcDark: 'img/assets/logo_horiz_dark.png',
          href: '/',
        },
        items: [
          {
            label: 'Início',
            to: '/',
            position: 'left',
            activeBasePath: 'none',
          },
        ],
      },
      footer: {
        logo: {
          alt: 'PapTools',
          src: 'img/favicon.png',
          href: 'https://claro.com.br',
          width: 32,
        },
        copyright: `Todos os direitos reservados. © ${new Date().getFullYear()} RedeInova Tecnologia. `,
        links: [],
      },
    },
    presets: [
      [
        '@docusaurus/preset-classic',
        {
          // Will be passed to @docusaurus/plugin-content-docs
          docs: {
            sidebarPath: require.resolve('./sidebars.js'),
            routeBasePath: '/',
            exclude: ['**/clusters/**', '**/ai-cookbook/**'], // do not render context content
            editUrl: 'https://github.com/nicholasnasc/documentation/edit/main/docs/',
            showLastUpdateAuthor: false,
            showLastUpdateTime: false,
            includeCurrentVersion: true,
            admonitions: {
              keywords: ['note', 'tip', 'info', 'caution', 'danger', 'competency', 'copycode'],
            },
            remarkPlugins: [(await import('remark-math')).default],
            rehypePlugins: [(await import('rehype-katex')).default],
          },
          theme: {
            customCss: require.resolve('./src/css/custom.css'),
          },
          // Will be passed to @docusaurus/plugin-content-blog
          // options: https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-blog
          // blog: {},
          // Will be passed to @docusaurus/theme-classic.
          // gtag: {
          //   trackingID: "GTM-TSXFPF2",
          //   // Optional fields.
          //   anonymizeIP: false, // Should IPs be anonymized?
          // },
          // Will be passed to @docusaurus/plugin-content-sitemap
          sitemap: {
            // Per v2.0.0-alpha.72 cacheTime is now deprecated
            //cacheTime: 600 * 1000, // 600 sec - cache purge period
            changefreq: 'daily',
            priority: 0.5,
            filename: 'sitemap.xml',
          },
        },
      ],
    ],
    scripts: [
      {
        src: '/scripts/googletag.js',
        async: true,
        defer: true,
      },
      {
        src: '/scripts/copycode-notice.js',
        async: true,
        defer: true,
      },
    ],
    stylesheets: [
      {
        href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
        type: 'text/css',
        integrity: 'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
        crossorigin: 'anonymous',
      },
    ],
    plugins: [
      function basicAuthPlugin() {
        return {
          name: 'basic-auth-plugin',
          configureExpress(app) {
            const expected = Buffer.from('PapTools_development:development_papT00ls').toString('base64');
            app.use((req, res, next) => {
              const header = req.headers.authorization || '';
              const isValid = header === `Basic ${expected}`;
              if (isValid) return next();
              res.setHeader('WWW-Authenticate', 'Basic realm="Restricted"');
              return res.status(401).send('Authentication required');
            });
          },
        };
      },
      function preloadFontPlugin() {
        return {
          name: 'preload-font-plugin',
          configureWebpack() {
            return {
              plugins: [new FontPreloadPlugin()],
            };
          },
        };
      },
      [
        '@docusaurus/plugin-content-docs',
        {
          id: 'ai-cookbook',
          path: 'ai-cookbook',
          routeBasePath: 'ai-cookbook', // published at /ai-cookbook/* ✅
          sidebarPath: false, // no left nav for these pages ✅
          // optional polish:
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          // use a custom item to center the content:
          docItemComponent: '@site/src/components/CookbookDocItem',
          docCategoryGeneratedIndexComponent: '@site/src/components/CookbookCategoryIndex', // ⬅️ isolated override
        },
      ],
      [
        require.resolve('./plugins/cookbook-index'),
        {
          docsDir: 'ai-cookbook', // change if your folder differs
          routeBasePath: 'ai-cookbook', // change if you use a different base
        },
      ],
      [
        require.resolve('@easyops-cn/docusaurus-search-local'),
        {
          hashed: true,
          language: ['pt', 'en'],
          indexDocs: true,
          indexBlog: false,
          indexPages: true,
          docsRouteBasePath: '/',
          highlightSearchTermsOnTargetPage: true,
          searchResultLimits: 8,
          searchResultContextMaxLength: 50,
          explicitSearchResultPath: true,
        },
      ],
    ],
  };

  function convertIndent4ToIndent2(code) {
    // TypeScript always outputs 4 space indent. This is a workaround.
    // See https://github.com/microsoft/TypeScript/issues/4042
    return code.replace(/^( {4})+/gm, (match) => {
      return '  '.repeat(match.length / 4);
    });
  }

  // Remove the minimum leading whitespace on each line, excluding whitespace-only
  // lines. Helpful for cleaning up TypeScript examples that are pulled from
  // the body of a function.
  function dedent(code) {
    const lines = code.split('\n');

    if (!lines.length) {
      return code;
    }

    // First, find the minimum number of leading space characters, excluding
    // lines that are whitespace-only.
    let minIndent = Number.POSITIVE_INFINITY;
    for (const line of lines) {
      if (line.trim().length === 0) {
        continue;
      }

      const match = line.match(/^( +)/);
      if (match && match[0].length < minIndent) {
        minIndent = match[0].length;
      } else if (!match) {
        minIndent = 0;
      }
    }

    // If there's no leading whitespace, just return the code
    if (minIndent === 0 || minIndent === Number.POSITIVE_INFINITY) {
      return code;
    }

    // Otherwise, remove leading spaces from each line
    return lines.map((line) => line.replace(new RegExp(`^ {${minIndent}}`), '')).join('\n');
  }
};
