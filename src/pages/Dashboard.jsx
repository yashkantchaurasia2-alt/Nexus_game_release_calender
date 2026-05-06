import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import api from '../api';
import { PLATFORMS } from '../hooks/useGames';
import styles from './Dashboard.module.css';

const COLORS = ['#00f0ff', '#ff003c', '#00ff66', '#f0f0f5', '#a0a0b0', '#ff00ff', '#ffff00'];

const Dashboard = () => {
  const [data, setData] = useState({
    platformData: [],
    genreData: [],
    monthData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Analyze the entire FreeToGame database instead of future upcoming months

        // Fetch first few pages to gather a good sample
        const platformsStr = Object.values(PLATFORMS).join(',');
        
        const res = await api.get('/games');
        let allGames = res.data.map(game => ({
          id: game.id,
          name: game.title,
          background_image: game.thumbnail,
          released: game.release_date,
          platforms: [
            { platform: { id: game.platform === 'Web Browser' ? 'browser' : 'windows', name: game.platform } }
          ],
          genres: [{ name: game.genre, id: game.genre }]
        }));

        // Process Platform Data
        const pCount = {};
        // Process Genre Data
        const gCount = {};
        // Process Monthly Data tracking all-time releases by year instead of next 6 months
        const mCount = {};

        allGames.forEach(game => {
          // Platforms
          game.platforms?.forEach(p => {
            const name = p.platform.name;
            if (['PC (Windows)', 'Web Browser'].includes(name)) {
              pCount[name] = (pCount[name] || 0) + 1;
            }
          });

          // Genres
          game.genres?.forEach(g => {
            gCount[g.name] = (gCount[g.name] || 0) + 1;
          });

          // Years
          if (game.released) {
            const yearStr = game.released.split('-')[0];
            if (yearStr && yearStr >= '2010') { // Only track 2010 onwards for clean chart
              mCount[yearStr] = (mCount[yearStr] || 0) + 1;
            }
          }
        });

        const platformData = Object.keys(pCount).map(k => ({ name: k, count: pCount[k] }));
        const genreData = Object.keys(gCount)
          .map(k => ({ name: k, value: gCount[k] }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 7); // top 7 genres
        const monthData = Object.keys(mCount).map(k => ({ name: k, count: mCount[k] }));

        setData({ platformData, genreData, monthData });
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="loader">ANALYZING TELEMETRY...</div>;
  if (error) return <div className="container" style={{color: 'var(--neon-magenta)'}}>ERROR: {error}</div>;

  return (
    <div className={`container animate-fade-in`}>
      <h1 className={styles.pageTitle}>ANALYTICS DASHBOARD</h1>
      <p className={styles.subtitle}>Analyzing all {data.platformData.reduce((a,b)=>a+b.count,0)} games in the FreeToGame Database</p>

      <div className={styles.grid}>
        {/* Platform Bar Chart */}
        <div className={`glass-panel ${styles.chartCard}`}>
          <h3>Releases by Platform</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.platformData}>
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--neon-cyan)', color: '#fff' }}
                />
                <Bar dataKey="count" fill="var(--neon-cyan)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Genre Pie Chart */}
        <div className={`glass-panel ${styles.chartCard}`}>
          <h3>Top Genres Distribution</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--neon-magenta)', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.legend}>
            {data.genreData.map((g, i) => (
              <span key={g.name} style={{ color: COLORS[i % COLORS.length] }}>■ {g.name}</span>
            ))}
          </div>
        </div>

        {/* Monthly Line Chart */}
        <div className={`glass-panel ${styles.chartCard} ${styles.fullWidth}`}>
          <h3>Release Volume (By Year)</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthData}>
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--neon-green)', color: '#fff' }}
                />
                <Line type="monotone" dataKey="count" stroke="var(--neon-green)" strokeWidth={3} dot={{ r: 6, fill: 'var(--bg-dark)', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
