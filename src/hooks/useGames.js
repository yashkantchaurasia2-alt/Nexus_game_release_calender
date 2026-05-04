import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const PLATFORMS = {
  PC: 'windows',
  BROWSER: 'browser',
};

const fetchGames = async (params) => {
  const queryParams = {};

  if (params.platforms && params.platforms !== 'all') {
    if (params.platforms.includes(',') || params.platforms === 'windows,browser') {
      queryParams.platform = 'all';
    } else {
      queryParams.platform = params.platforms;
    }
  }

  const { data } = await api.get('/games', { params: queryParams });

  // Map FreeToGame structure to RAWG structure
  let mappedResults = data.map(game => ({
    id: game.id,
    name: game.title,
    background_image: game.thumbnail,
    released: game.release_date,
    rating: 0,
    description: game.short_description,
    platforms: [
      { platform: { id: game.platform === 'Web Browser' ? 'browser' : 'windows', name: game.platform } }
    ],
    genres: [{ name: game.genre, id: game.genre }]
  }));

  // Client-side filtering
  if (params.search) {
    const s = params.search.toLowerCase();
    mappedResults = mappedResults.filter(g => g.name.toLowerCase().includes(s));
  }

  if (params.dates) {
    const [start, end] = params.dates.split(',');
    mappedResults = mappedResults.filter(g => {
      if (!g.released) return false;
      return g.released >= start && g.released <= end;
    });
  }

  if (params.platforms && params.platforms.includes(',')) {
    const pArr = params.platforms.split(',');
    mappedResults = mappedResults.filter(g => pArr.includes(g.platforms[0].platform.id));
  }

  const pageSize = params.page_size || 40;
  const page = params.page || 1;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    count: mappedResults.length,
    next: endIndex < mappedResults.length ? 'next' : null,
    previous: page > 1 ? 'prev' : null,
    results: mappedResults.slice(startIndex, endIndex)
  };
};

export const useGames = (params, enabled = true) => {
  return useQuery({
    queryKey: ['games', params],
    queryFn: () => fetchGames(params),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    enabled,
  });
};
