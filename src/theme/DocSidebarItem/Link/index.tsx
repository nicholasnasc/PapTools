import React, {type ReactNode} from 'react';
import Link from '@theme-original/DocSidebarItem/Link';
import type LinkType from '@theme/DocSidebarItem/Link';
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
  IconBrandAndroid,
  IconBrandApple,
  IconApi,

} from '@tabler/icons-react';

type Props = WrapperProps<typeof LinkType>;

const iconMap = {
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
  android: IconBrandAndroid,
  apple: IconBrandApple,
  api: IconApi,
};

export default function LinkWrapper(props: Props): ReactNode {
  const customProps = (props.item as any)?.customProps;
  const iconKey = customProps?.icon;
  const Icon = iconKey && iconMap[iconKey];
  
  console.log('Link item:', props.item.label, 'icon:', iconKey, 'Icon found:', !!Icon);
  
  if (Icon && props.item.label && typeof props.item.label === 'string') {
    const label = props.item.label;
    const modifiedItem = {
      ...props.item,
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon style={{ width: 18, height: 18 }} />
          {label}
        </span>
      ),
    };
    return <Link {...props} item={modifiedItem} />;
  }
  
  return (
    <Link {...props} />
  );
}
