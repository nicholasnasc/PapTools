import React, {type ReactNode} from 'react';
import Category from '@theme-original/DocSidebarItem/Category';
import type CategoryType from '@theme/DocSidebarItem/Category';
import type {WrapperProps} from '@docusaurus/types';
import {
  IconHome,
  IconRocket,
  IconBook,
  IconLink,
  IconFileText,
  IconSettings,
  IconCode,
  IconDatabase,
  IconClock,
  IconBulb,
  IconDeviceLaptop,
  IconApi,
  IconHexagons,
} from '@tabler/icons-react';

type Props = WrapperProps<typeof CategoryType>;

const iconMap: {[key: string]: React.ComponentType<any>} = {
  home: IconHome,
  rocket: IconRocket,
  book: IconBook,
  link: IconLink,
  file: IconFileText,
  settings: IconSettings,
  code: IconCode,
  database: IconDatabase,
  clock: IconClock,
  bulb: IconBulb,
  desktop: IconDeviceLaptop,
  api: IconApi,
  modules: IconHexagons,
};

export default function CategoryWrapper(props: Props): ReactNode {
  const customProps = (props.item as any)?.customProps;
  const iconKey = customProps?.icon;
  const Icon = iconKey && iconMap[iconKey];
  
  // Se houver um ícone definido, renderizar com o ícone
  if (Icon && props.item.label && typeof props.item.label === 'string') {
    const modifiedItem = {
      ...props.item,
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon size={18} stroke={1.5} />
          {props.item.label}
        </span>
      ),
    };
    return <Category {...props} item={modifiedItem} />;
  }
  
  return <Category {...props} />;
}
