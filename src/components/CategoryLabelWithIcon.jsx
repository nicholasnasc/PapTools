import React from 'react';
import {
  IconHome,
  IconRocket,
  IconBook,
  IconLink,
  IconFileText,
  IconSettings,
  IconBulb,
} from '@tabler/icons-react';

const iconMap = {
  home: IconHome,
  rocket: IconRocket,
  book: IconBook,
  link: IconLink,
  file: IconFileText,
  settings: IconSettings,
  bulb: IconBulb,
};

export const CategoryLabelWithIcon = ({ label, icon }) => {
  const Icon = icon && typeof icon === 'string' ? iconMap[icon] : null;
  
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {Icon && <Icon size={18} stroke={1.5} />}
      {label}
    </span>
  );
};

export default CategoryLabelWithIcon;
