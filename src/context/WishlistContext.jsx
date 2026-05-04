import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('nexus_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('nexus_reminders');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('nexus_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('nexus_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    // Check reminders on load
    const checkReminders = () => {
      const today = new Date().toISOString().split('T')[0];
      Object.entries(reminders).forEach(([id, date]) => {
        if (date === today) {
          const game = wishlist.find(g => g.id.toString() === id);
          if (game && Notification.permission === 'granted') {
            new Notification(`🎮 Release Today: ${game.name}`, {
              body: `${game.name} is releasing today!`,
              icon: game.background_image
            });
          }
        }
      });
    };

    if (Notification.permission === 'granted') {
      checkReminders();
    }
  }, [reminders, wishlist]);

  const addToWishlist = (game) => {
    const minGame = {
      id: game.id,
      name: game.name,
      released: game.released,
      background_image: game.background_image,
      genres: game.genres,
      platforms: game.platforms
    };
    setWishlist(prev => {
      if (prev.some(g => g.id === game.id)) return prev;
      return [...prev, minGame];
    });
  };

  const removeFromWishlist = (gameId) => {
    setWishlist(prev => prev.filter(g => g.id !== gameId));
    if (reminders[gameId]) {
      const newReminders = { ...reminders };
      delete newReminders[gameId];
      setReminders(newReminders);
    }
  };

  const isInWishlist = (gameId) => {
    return wishlist.some(g => g.id === gameId);
  };

  const setReminder = async (gameId, releaseDate) => {
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;
    }
    
    setReminders(prev => ({
      ...prev,
      [gameId]: releaseDate
    }));
    return true;
  };

  const hasReminder = (gameId) => {
    return !!reminders[gameId];
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      setReminder,
      hasReminder
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
