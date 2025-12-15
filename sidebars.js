module.exports = {
  documentation: [
    {
      type: 'doc',
      id: 'introducao/visao-geral',
      label: 'Introdução',
      customProps: { icon: 'bulb' },
    },
    {
      type: 'category',
      label: 'Comece aqui',
      customProps: { icon: 'home' },
      items: [
        'index',
        'guia-rapido',
        'conceitos-fundamentais',
      ],
    },

    {
      type: 'category',
      label: 'Documentação',
      customProps: { icon: 'book' },
      items: [
        {
          type: 'category',
          label: 'Backend',
          customProps: { icon: 'code' },
          items: [
            'backend/nodejs',
            'backend/python',
          ],
        },
        {
          type: 'category',
          label: 'Frontend',
          customProps: { icon: 'code' },
          items: [
            'frontend/react',
            'frontend/vue',
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
