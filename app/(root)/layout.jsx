import React from 'react';
import SidebarWrapper from '@/components/shared/sidebar/SidebarWrapper';
const Layout = ({ children }) => {
  return <SidebarWrapper>{children}</SidebarWrapper>;
};

export default Layout;
