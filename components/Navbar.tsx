import React from 'react';

const Navbar = () => {
 const links = ['Доставка', 'о нас', 'смысл'];

 return (
  <nav className="flex items-center justify-center py-4 bg-background">
   <ul className="flex items-center gap-12">
    {links.map((link) => (
     <li key={link}>
      <a
       href={`#${link}`}
       className="text-sm font-medium text-secondary hover:text-foreground transition-colors uppercase tracking-widest"
      >
       {link}
      </a>
     </li>
    ))}
   </ul>
  </nav>
 );
};

export default Navbar;
