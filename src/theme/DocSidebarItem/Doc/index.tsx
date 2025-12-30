import React, {type ReactNode} from 'react';
import Doc from '@theme-original/DocSidebarItem/Doc';
import type DocType from '@theme/DocSidebarItem/Doc';
import type {WrapperProps} from '@docusaurus/types';
import {
  IconHome,
  IconRocket,
  IconBook,
  IconLink,
  IconFileText,
  IconSettings,
  IconBubble,
  IconCode,
  IconDatabase,
  IconClock,
  IconBulb,
  IconDeviceLaptop,
  IconApi,
  IconHexagons
} from '@tabler/icons-react';

type Props = WrapperProps<typeof DocType>;

const iconMap: {[key: string]: React.ComponentType<any>} = {
  home: IconHome,
  rocket: IconRocket,
  book: IconBook,
  link: IconLink,
  file: IconFileText,
  settings: IconSettings,
  bubble: IconBubble,
  code: IconCode,
  database: IconDatabase,
  clock: IconClock,
  bulb: IconBulb,
  desktop: IconDeviceLaptop,
  api: IconApi,
  modules: IconHexagons,
};

export default function DocWrapper(props: Props): ReactNode {
  const customProps = (props.item as any)?.customProps;
  const iconKey = customProps?.icon;
  const Icon = iconKey && iconMap[iconKey];
  
  console.log('Doc item:', props.item.label, 'icon:', iconKey, 'Icon found:', !!Icon);
  
  // Se houver um ícone definido, renderizar com o ícone
  if (Icon && props.item.label && typeof props.item.label === 'string') {
    const modifiedItem = {
      ...props.item,
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon style={{ width: 18, height: 18 }} />
          {props.item.label}
        </span>
      ),
    };
    return <Doc {...props} item={modifiedItem} />;
  }
  
  return <Doc {...props} />;
}
