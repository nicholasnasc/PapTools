import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/ai-cookbook',
    component: ComponentCreator('/ai-cookbook', '0e3'),
    exact: true
  },
  {
    path: '/changelog',
    component: ComponentCreator('/changelog', '839'),
    exact: true
  },
  {
    path: '/index-legacy',
    component: ComponentCreator('/index-legacy', '7f1'),
    exact: true
  },
  {
    path: '/search',
    component: ComponentCreator('/search', '822'),
    exact: true
  },
  {
    path: '/ai-cookbook',
    component: ComponentCreator('/ai-cookbook', '4b4'),
    routes: [
      {
        path: '/ai-cookbook',
        component: ComponentCreator('/ai-cookbook', '5c0'),
        routes: [
          {
            path: '/ai-cookbook',
            component: ComponentCreator('/ai-cookbook', 'b32'),
            routes: [
              {
                path: '/ai-cookbook/',
                component: ComponentCreator('/ai-cookbook/', '7ea'),
                exact: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', '2e1'),
    exact: true
  },
  {
    path: '/',
    component: ComponentCreator('/', '8c6'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', '277'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', '5d5'),
            routes: [
              {
                path: '/api/modulos/Consultas/',
                component: ComponentCreator('/api/modulos/Consultas/', 'dfd'),
                exact: true,
                sidebar: "documentation"
              },
              {
                path: '/api/modulos/Provedores/',
                component: ComponentCreator('/api/modulos/Provedores/', 'c1a'),
                exact: true,
                sidebar: "documentation"
              },
              {
                path: '/api/modulos/Relatorios/',
                component: ComponentCreator('/api/modulos/Relatorios/', '885'),
                exact: true,
                sidebar: "documentation"
              },
              {
                path: '/api/modulos/Rotas/',
                component: ComponentCreator('/api/modulos/Rotas/', '7f2'),
                exact: true,
                sidebar: "documentation"
              },
              {
                path: '/api/modulos/Rotas/lista',
                component: ComponentCreator('/api/modulos/Rotas/lista', '392'),
                exact: true,
                sidebar: "documentation"
              },
              {
                path: '/banco/provedores/tabela',
                component: ComponentCreator('/banco/provedores/tabela', '360'),
                exact: true
              },
              {
                path: '/CORRECAO_DATA_ATUALIZACAO',
                component: ComponentCreator('/CORRECAO_DATA_ATUALIZACAO', '1e3'),
                exact: true
              },
              {
                path: '/introducao/',
                component: ComponentCreator('/introducao/', '566'),
                exact: true,
                sidebar: "documentation"
              },
              {
                path: '/PROVEDORES_CAMPO_CIDADE_NOME',
                component: ComponentCreator('/PROVEDORES_CAMPO_CIDADE_NOME', 'd1e'),
                exact: true
              },
              {
                path: '/PROVEDORES_CIDADE_IMPLEMENTACAO',
                component: ComponentCreator('/PROVEDORES_CIDADE_IMPLEMENTACAO', 'de6'),
                exact: true
              },
              {
                path: '/PROVEDORES_DEBUG_CAMPO_OPERADORA',
                component: ComponentCreator('/PROVEDORES_DEBUG_CAMPO_OPERADORA', '465'),
                exact: true
              },
              {
                path: '/PROVEDORES_DEBUG_GUIDE',
                component: ComponentCreator('/PROVEDORES_DEBUG_GUIDE', '6ba'),
                exact: true
              },
              {
                path: '/PROVEDORES_FIX_CONVERSAO_IBGE',
                component: ComponentCreator('/PROVEDORES_FIX_CONVERSAO_IBGE', '516'),
                exact: true
              },
              {
                path: '/PROVEDORES_FIX_TIPO_INT_IMPORTACOES',
                component: ComponentCreator('/PROVEDORES_FIX_TIPO_INT_IMPORTACOES', '50d'),
                exact: true
              },
              {
                path: '/PROVEDORES_TROUBLESHOOTING_REGIONAL_UF',
                component: ComponentCreator('/PROVEDORES_TROUBLESHOOTING_REGIONAL_UF', '048'),
                exact: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
