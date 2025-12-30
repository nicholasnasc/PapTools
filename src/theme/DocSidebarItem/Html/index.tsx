import React, {type ReactNode} from 'react';
import type {Props} from '@theme/DocSidebarItem/Html';
import clsx from 'clsx';
import styles from './styles.module.css';
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

export default function DocSidebarItemHtml({item, level, index}: Props): ReactNode {
  const {value, defaultStyle, className} = item;
  const iconKey = (item as any)?.customProps?.icon;
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
  const Icon = iconKey && iconMap[iconKey];
  
  // Se for um título estático
  if (item.customProps?.isStaticTitle) {
    return (
      <div
        className={clsx(
          styles.staticTitle,
          'menu__list-item',
          className,
        )}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {Icon && <Icon size={16} stroke={1.5} />}
          <span dangerouslySetInnerHTML={{__html: value}} />
        </span>
      </div>
    );
  }
  
  // Renderização padrão do HTML
  return (
    <li
      className={clsx(
        'menu__list-item',
        defaultStyle && 'theme-doc-sidebar-item-html',
        className,
      )}
      dangerouslySetInnerHTML={{__html: value}}
    />
  );
}
