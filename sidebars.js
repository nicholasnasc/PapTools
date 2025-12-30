const { type } = require("os");

module.exports = {
  documentation: [
    {
      type: 'doc',
      id: 'introducao/index',
      label: 'Bem-vindo à PapTools',
      customProps: { icon: 'rocket' },
    },
    {
      type: 'category',
      label: 'Documentação',
      customProps: { icon: 'book' },
      items: [
    {
      type: 'category',
      label: 'API',
      customProps: { icon: 'api' },
      items: [
        {
          type: 'category',
          label: 'Módulos',
          customProps: { icon: 'modules' },
          items: [
            'api/modulos/Consultas/consultas',
            'api/modulos/Rotas/rotas',
            'api/modulos/Rotas/lista',
            'api/modulos/Relatorios/relatorios',
            'api/modulos/Provedores/provedores',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Banco de Dados',
      customProps: { icon: 'database' },
      items: [
        {
          type: 'category',
          label: 'Módulos',
          customProps: { icon: 'modules' },
          items: [
            'api/modulos/Consultas/consultas',
            'api/modulos/Rotas/rotas',
            'api/modulos/Rotas/lista',
            'api/modulos/Relatorios/relatorios',
            'api/modulos/Provedores/provedores',
          ],
        },
      ],
    },
      ],
    },
    
    {
      type: 'category',
      label: 'Links Úteis',
      customProps: { icon: 'link' },
      items: [
        {
          type: 'link',
          label: 'PapTools Portal',
          href: 'https://paptools.redeinova.com.br/',
          customProps: { icon: 'desktop' },
        },
        {
          type: 'link',
          label: 'Aplicativo Android',
          href: 'https://play.google.com/store/apps/details?id=br.com.paptools&pcampaignid=web_share',
          customProps: { icon: 'android' },
        },
        {
          type: 'link',
          label: 'Aplicativo IOS',
          customProps: { icon: 'apple' },
          href: 'https://apps.apple.com/br/app/pap-tools/id6743853945',
        },
      ],
    },
  ],
};
