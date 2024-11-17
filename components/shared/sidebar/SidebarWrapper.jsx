import React from 'react'
import DesktopNav from './nav/DesktopNav'
import MobileNav from './nav/MobileNav'

const SidebarWrapper = ({children}) => {
  return (
    <div className='h-[100vh] w-full p-4 flex flex-col lg:flex-row gap-4 mb-0 overflow-hidden'>
        <MobileNav/>
        <DesktopNav/>
        <main className='h-full lg:h-full w-full flex gap-4'>{children}</main>
    </div>
  )
}

export default SidebarWrapper