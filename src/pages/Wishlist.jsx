import React from 'react';
import { Link } from 'react-router-dom';
import { HeartCrack, Bell, BellRing, Trash2, Calendar, Gamepad2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import styles from './Wishlist.module.css';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, setReminder, hasReminder } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className={`container ${styles.emptyState}`}>
        <HeartCrack size={64} className="neon-text-magenta" />
        <h2>NO GAMES IN WISHLIST</h2>
        <p>Explore the calendar to find and save upcoming releases.</p>
        <Link to="/" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          BROWSE CALENDAR
        </Link>
      </div>
    );
  }

  const handleReminder = (game) => {
    if (hasReminder(game.id)) {
      alert('Reminder is already set for this game.');
    } else {
      setReminder(game.id, game.released);
    }
  };

  return (
    <div className={`container animate-fade-in`}>
      <h1 className={styles.pageTitle}>MY WISHLIST</h1>
      
      <div className={styles.grid}>
        {wishlist.map(game => {
          const reminded = hasReminder(game.id);
          
          return (
            <div key={game.id} className={`glass-panel ${styles.card}`}>
              <div 
                className={styles.image} 
                style={{ backgroundImage: `url(${game.background_image})` }}
              >
                {reminded && (
                  <div className={styles.reminderBadge}>
                    <BellRing size={16} /> REMINDER SET
                  </div>
                )}
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>
                  <Link to={`/game/${game.id}`}>{game.name}</Link>
                </h3>
                
                <div className={styles.meta}>
                  <span className={styles.date}><Calendar size={14} /> {game.released || 'TBA'}</span>
                </div>
                
                <div className={styles.platforms}>
                  {game.platforms?.slice(0, 3).map(p => (
                    <span key={p.platform.id}><Gamepad2 size={14} /> {p.platform.name}</span>
                  ))}
                  {game.platforms?.length > 3 && <span>+{game.platforms.length - 3}</span>}
                </div>
                
                <div className={styles.actions}>
                  <button 
                    onClick={() => handleReminder(game)}
                    className={`${styles.actionBtn} ${reminded ? styles.btnActive : ''}`}
                    title="Set Reminder"
                  >
                    {reminded ? <BellRing size={18} /> : <Bell size={18} />}
                  </button>
                  <button 
                    onClick={() => removeFromWishlist(game.id)}
                    className={`${styles.actionBtn} ${styles.btnDanger}`}
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
