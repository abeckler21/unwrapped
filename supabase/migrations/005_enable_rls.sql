-- security fixes

ALTER TABLE public.spotify_profile_cache ENABLE ROW LEVEL SECURITY;                                         
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;                
ALTER TABLE public.user_analyses ENABLE ROW LEVEL SECURITY;                                                   
ALTER TABLE public.user_visits ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.user_archetypes ENABLE ROW LEVEL SECURITY;                                                 
ALTER TABLE public.lastfm_artist_tags_cache ENABLE ROW LEVEL SECURITY;                                      
ALTER TABLE public.genre_history_cache ENABLE ROW LEVEL SECURITY; 


CREATE POLICY "public read" ON public.lastfm_artist_tags_cache                                                
  FOR SELECT USING (true);                                                                                                                                                                                           
CREATE POLICY "public read" ON public.genre_history_cache
  FOR SELECT USING (true);                