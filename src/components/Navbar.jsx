import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, Calendar, Heart, BarChart3 } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar = () => {
  const location = useLocation();
  
  const links = [
    { path: '/', label: 'Calendar', icon: Calendar },
    { path: '/wishlist', label: 'Wishlist', icon: Heart },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 }
  ];

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <Link to="/" className={styles.logo}>
          <Gamepad2 size={32} className="neon-text-cyan" />
          <span className={styles.brand}>NEXUS</span>
        </Link>
        <div className={styles.links}>
          {links.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`${styles.link} ${location.pathname === path ? styles.active : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
