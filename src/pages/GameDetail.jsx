import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Star, Heart, Calendar } from 'lucide-react';
import api from '../api';
import { useWishlist } from '../context/WishlistContext';
import styles from './GameDetail.module.css';

const fetchGameDetails = async (id) => {
  const { data } = await api.get('/game', { params: { id } });
  return {
    id: data.id,
    name: data.title,
    background_image: data.thumbnail,
    released: data.release_date,
    rating: 0,
    description: data.description,
    platforms: [
      { platform: { id: data.platform === 'Web Browser' ? 'browser' : 'windows', name: data.platform } }
    ],
    genres: [{ name: data.genre, id: data.genre }]
  };
};

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const { data: game, isLoading, error } = useQuery({
    queryKey: ['game', id],
    queryFn: () => fetchGameDetails(id),
  });

  if (isLoading) return <div className="loader">INITIALIZING DATABANKS...</div>;
  if (error) return <div className="container" style={{color: 'var(--neon-magenta)'}}>ERROR: FAILED TO LOAD GAME DATA</div>;

  const isWished = isInWishlist(game.id);

  const handleWishlist = () => {
    if (isWished) {
      removeFromWishlist(game.id);
    } else {
      addToWishlist(game);
    }
  };

  return (
    <div className={`container animate-fade-in ${styles.detailContainer}`}>
      <button onClick={() => navigate(-1)} className={styles.backBtn}>
        <ArrowLeft size={20} /> BACK TO PREVIOUS
      </button>

      <div className={styles.hero} style={{ backgroundImage: `linear-gradient(to bottom, transparent, var(--bg-dark)), url(${game.background_image})` }}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{game.name}</h1>
          <div className={styles.meta}>
            <span className={styles.releaseDate}><Calendar size={18} /> {game.released || 'TBA'}</span>
            {game.rating > 0 && <span className={styles.rating}><Star size={18} /> {game.rating}</span>}
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.mainInfo}>
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
            <div className={styles.headerRow}>
              <h2>ABOUT</h2>
              <button 
                onClick={handleWishlist}
                className={`${styles.wishlistBtn} ${isWished ? styles.activeWish : ''}`}
              >
                <Heart size={20} fill={isWished ? 'var(--neon-magenta)' : 'none'} />
                {isWished ? 'IN WISHLIST' : 'ADD TO WISHLIST'}
              </button>
            </div>
            <div className={styles.description} dangerouslySetInnerHTML={{ __html: game.description }} />
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <h3>PLATFORMS</h3>
            <div className={styles.tags}>
              {game.platforms?.map(p => (
                <span key={p.platform.id} className={styles.tag}>{p.platform.name}</span>
              ))}
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
            <h3>GENRES</h3>
            <div className={styles.tags}>
              {game.genres?.map(g => (
                <span key={g.id} className={styles.tag}>{g.name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
