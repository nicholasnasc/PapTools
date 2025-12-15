import React from 'react';
import {
  FaHome,
  FaRocket,
  FaBook,
  FaLink,
  FaMusic,
} from 'react-icons/fa';

const iconMap = {
  home: FaHome,
  rocket: FaRocket,
  book: FaBook,
  link: FaLink,
  music: FaMusic,
};

export const SidebarItemWithIcon = ({ icon, label, ...props }) => {
  const IconComponent = icon && typeof icon === 'string' ? iconMap[icon] : null;
  
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {IconComponent && <IconComponent size={16} />}
      {label}
    </span>
  );
};

export default SidebarItemWithIcon;
