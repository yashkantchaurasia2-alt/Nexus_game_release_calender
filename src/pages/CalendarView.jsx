import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Heart, Gamepad2, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parse, getDay } from 'date-fns';
import { useGames, PLATFORMS } from '../hooks/useGames';
import { useWishlist } from '../context/WishlistContext';
import styles from './CalendarView.module.css';

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const CalendarView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  // State from URL or Defaults
  const currentMonthStr = searchParams.get('month') || format(new Date(), 'yyyy-MM');
  const currentDate = parse(currentMonthStr, 'yyyy-MM', new Date());
  const selectedPlatforms = searchParams.get('platforms') 
    ? searchParams.get('platforms').split(',')
    : Object.values(PLATFORMS);
  const searchParamValue = searchParams.get('search') || '';
  const pageParam = parseInt(searchParams.get('page')) || 1;

  // Local State
  const [searchInput, setSearchInput] = useState(searchParamValue);
  const debouncedSearch = useDebounce(searchInput, 300);
  const [selectedDay, setSelectedDay] = useState(null);

  // Sync debounce to URL
  useEffect(() => {
    if (debouncedSearch !== searchParamValue) {
      updateParams({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  const updateParams = (newParams) => {
    const params = Object.fromEntries(searchParams.entries());
    Object.keys(newParams).forEach(key => {
      if (newParams[key] === null || newParams[key] === '') {
        delete params[key];
      } else {
        params[key] = newParams[key];
      }
    });
    setSearchParams(params);
  };

  const handlePrevMonth = () => {
    updateParams({ month: format(subMonths(currentDate, 1), 'yyyy-MM'), page: 1 });
    setSelectedDay(null);
  };
  
  const handleNextMonth = () => {
    updateParams({ month: format(addMonths(currentDate, 1), 'yyyy-MM'), page: 1 });
    setSelectedDay(null);
  };

  const handlePlatformToggle = (id) => {
    let newPlatforms;
    if (selectedPlatforms.includes(id)) {
      newPlatforms = selectedPlatforms.filter(p => p !== id);
    } else {
      newPlatforms = [...selectedPlatforms, id];
    }
    // Prevent deselecting all
    if (newPlatforms.length === 0) newPlatforms = [id];
    
    updateParams({ platforms: newPlatforms.join(','), page: 1 });
  };

  // Fetch Games
  const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
  
  const queryParams = {
    dates: `${startDate},${endDate}`,
    page_size: 40,
    page: pageParam,
    platforms: selectedPlatforms.join(','),
  };
  if (debouncedSearch) {
    queryParams.search = debouncedSearch;
  }

  const { data, isLoading, isError } = useGames(queryParams);

  // Calendar Grid Logic
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate)
    });
  }, [currentDate]);

  const startDayOfWeek = getDay(startOfMonth(currentDate)); // 0 = Sunday
  const blanks = Array.from({ length: startDayOfWeek }).map((_, i) => i);

  // Group games by date
  const gamesByDate = useMemo(() => {
    const map = {};
    if (data?.results) {
      data.results.forEach(game => {
        if (!game.released) return;
        if (!map[game.released]) map[game.released] = [];
        map[game.released].push(game);
      });
    }
    return map;
  }, [data]);

  return (
    <div className={`container animate-fade-in ${styles.calendarLayout}`}>
      <div className={styles.mainContent}>
        {/* Month Selector */}
        <div className={styles.header}>
          <button onClick={handlePrevMonth} className={styles.navBtn}><ChevronLeft size={24} /></button>
          <h1 className={styles.monthTitle}>{format(currentDate, 'MMMM yyyy')}</h1>
          <button onClick={handleNextMonth} className={styles.navBtn}><ChevronRight size={24} /></button>
        </div>

        {/* Filter Bar */}
        <div className={`glass-panel ${styles.filterBar}`}>
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search releases..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.platformFilters}>
            {Object.entries(PLATFORMS).map(([name, id]) => (
              <button
                key={id}
                onClick={() => handlePlatformToggle(id)}
                className={`${styles.filterChip} ${selectedPlatforms.includes(id) ? styles.activeChip : ''}`}
              >
                {name.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className={styles.calendarGridWrapper}>
          <div className={styles.weekdays}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className={styles.weekday}>{d}</div>
            ))}
          </div>
          
          {isLoading ? (
            <div className="loader" style={{ gridColumn: '1 / -1', height: '400px' }}>LOADING DATABASE...</div>
          ) : isError ? (
            <div style={{ color: 'var(--neon-magenta)', textAlign: 'center', padding: '2rem', gridColumn: '1 / -1' }}>
              ERROR: CONNECTION LOST
            </div>
          ) : (
            <div className={styles.calendarGrid}>
              {blanks.map(b => <div key={`blank-${b}`} className={styles.emptyDay}></div>)}
              
              {daysInMonth.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayGames = gamesByDate[dateStr] || [];
                const isSelected = selectedDay === dateStr;
                
                return (
                  <div 
                    key={dateStr} 
                    className={`${styles.dayCell} ${isSelected ? styles.selectedDay : ''} ${isToday(day) ? styles.today : ''}`}
                    onClick={() => {
                      if (dayGames.length > 0) {
                        setSelectedDay(isSelected ? null : dateStr);
                      }
                    }}
                    style={{ cursor: dayGames.length > 0 ? 'pointer' : 'default' }}
                  >
                    <div className={styles.dayNumber}>{format(day, 'd')}</div>
                    <div className={styles.dayContent}>
                      {dayGames.slice(0, 3).map(g => (
                        <div key={g.id} className={styles.gamePill} title={g.name}>
                          {g.name}
                        </div>
                      ))}
                      {dayGames.length > 3 && (
                        <div className={styles.morePill}>+{dayGames.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.count > 0 && (
          <div className={styles.pagination}>
            <button 
              disabled={!data.previous} 
              onClick={() => updateParams({ page: pageParam - 1 })}
              className="btn-secondary"
            >
              PREV
            </button>
            <span className={styles.pageInfo}>
              PAGE {pageParam} OF {Math.ceil(data.count / 40)}
            </span>
            <button 
              disabled={!data.next} 
              onClick={() => updateParams({ page: pageParam + 1 })}
              className="btn-secondary"
            >
              NEXT
            </button>
          </div>
        )}
      </div>

      {/* Sidebar for Day Details */}
      {selectedDay && (
        <aside className={`glass-panel ${styles.dayDetailSidebar}`}>
          <div className={styles.sidebarHeader}>
            <h3>{format(new Date(selectedDay), 'MMMM do, yyyy')}</h3>
            <button onClick={() => setSelectedDay(null)} className={styles.closeBtn}><X size={24} /></button>
          </div>
          
          <div className={styles.sidebarContent}>
            {gamesByDate[selectedDay]?.map(game => {
              const isWished = isInWishlist(game.id);
              return (
                <div key={game.id} className={styles.sidebarCard}>
                  <div className={styles.sidebarImg} style={{ backgroundImage: `url(${game.background_image})` }}></div>
                  <div className={styles.sidebarCardBody}>
                    <h4><Link to={`/game/${game.id}`}>{game.name}</Link></h4>
                    <div className={styles.sidebarPlatforms}>
                      {game.platforms?.slice(0, 3).map(p => (
                        <span key={p.platform.id}><Gamepad2 size={12} /> {p.platform.name}</span>
                      ))}
                    </div>
                    <button 
                      onClick={() => isWished ? removeFromWishlist(game.id) : addToWishlist(game)}
                      className={`${styles.miniWishBtn} ${isWished ? styles.activeWish : ''}`}
                    >
                      <Heart size={16} fill={isWished ? 'var(--neon-magenta)' : 'none'} />
                      {isWished ? 'ADDED' : 'WISHLIST'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      )}
    </div>
  );
};

export default CalendarView;
