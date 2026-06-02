import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, relativeTime, resolveMediaUrl } from '../lib/format.js';
import OptionsPosts from '../components/OptionsPosts.jsx';

export default function Profile() {
  const { username } = useParams();
  const { isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followBusy, setFollowBusy] = useState(false);
  const [isSelf, setIsSelf] = useState(false);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);

  const fetchUserPosts = useCallback(async () => {
    setPostsLoading(true); setPostsError(null);
    try {
      const { data } = await client.get('/api/posts/explore');
      if (data?.success) {
        const own = (data.data.posts || [])
          .filter((p) => p.author === username)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(own);
      } else {
        setPostsError(data?.message || 'No se pudieron cargar los posts');
      }
    } catch (err) {
      setPostsError(err.response?.data?.message || err.message || 'Error de red');
    } finally {
      setPostsLoading(false);
    }
  }, [username]);

  useEffect(() => { fetchUserPosts(); }, [fetchUserPosts]);

  const fetchProfile = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await client.get(`/api/users/${username}`);
      if (data?.success) {
        const { user, stats, isFollowing, isSelf, location } = data.data;
        setProfile({ user, stats });
        setLocation(location || null);
        setFollowing(Boolean(isFollowing));
        setFollowerCount(stats?.followerCount ?? 0);
        setIsSelf(Boolean(isSelf));
      } else {
        setError(data?.message || 'Usuario no encontrado');
      }
    } catch (err) {
      const status = err.response?.status;
      setError(status === 404 ? 'Usuario no encontrado' : (err.response?.data?.message || err.message || 'Error de red'));
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  async function toggleFollow() {
    if (!isAuthenticated || isSelf || followBusy) return;
    const wasFollowing = following;
    setFollowing(!wasFollowing);
    setFollowerCount((c) => c + (wasFollowing ? -1 : 1));
    setFollowBusy(true);
    try {
      const url = wasFollowing
        ? `/api/users/${username}/unfollow`
        : `/api/users/${username}/follow`;
      const { data } = await client.post(url);
      if (!data?.success) {
        setFollowing(wasFollowing);
        setFollowerCount((c) => c + (wasFollowing ? 1 : -1));
      }
    } catch {
      setFollowing(wasFollowing);
      setFollowerCount((c) => c + (wasFollowing ? 1 : -1));
    } finally {
      setFollowBusy(false);
    }
  }

  if (loading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="bg-white border-2 border-titi-red/40 rounded-2xl p-8 text-center shadow-titi">
        <h2 className="text-xl font-extrabold mb-2 text-titi-red">¡Ups!</h2>
        <p className="text-titi-muted mb-4">{error}</p>
        <button onClick={fetchProfile} className="titi-btn-primary">Reintentar</button>
      </div>
    );
  }

  if (!profile) return null;

  const { user, stats } = profile;

  function handleDeletePost(postId) {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setProfile(prev => ({
      ...prev,
      stats: { ...prev.stats, postCount: Math.max(0, prev.stats.postCount - 1) },
    }));
  }

  function handleEditPost(updated) {
    setPosts(prev => prev.map(p => (p.id === updated.id ? { ...p, ...updated } : p)));
  }

  return (
    <div>
      {/* Header del perfil */}
      <div className="titi-card p-6 mb-6 border-t-4 border-t-titi-yellow">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-28 h-28 rounded-full bg-titi-bg border-4 border-titi-yellow shrink-0 shadow-titi"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-titi-yellow text-titi-dark grid place-items-center text-4xl font-extrabold shrink-0 border-4 border-titi-yellow shadow-titi">
              {user.username?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-titi-text">@{user.username}</h1>
              {!isSelf && isAuthenticated && (
                <button
                  type="button"
                  onClick={toggleFollow}
                  disabled={followBusy}
                  className={
                    following
                      ? 'titi-btn-ghost text-sm disabled:opacity-50'
                      : 'titi-btn-primary text-sm disabled:opacity-50'
                  }
                >
                  {followBusy ? '…' : following ? 'Siguiendo' : 'Seguir'}
                </button>
              )}
              {isSelf && (
                <span className="inline-block text-xs font-extrabold text-titi-dark bg-titi-yellow px-3 py-1 rounded-full">Vos</span>
              )}
            </div>

            {user.bio ? (
              <p className="text-titi-text whitespace-pre-wrap mb-2 font-semibold">{user.bio}</p>
            ) : (
              <p className="text-titi-muted italic mb-2">Sin biografía.</p>
            )}

            {location && (
              <p className="text-sm text-titi-muted flex items-center gap-1.5 justify-center sm:justify-start mb-1 font-semibold">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-titi-green" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{location.city}, {location.country}</span>
              </p>
            )}

            {user.createdAt && (
              <p className="text-xs text-titi-muted font-semibold">
                Se unió el {formatDate(user.createdAt)}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-titi-border">
          <Stat label="Posts" value={stats.postCount} color="text-titi-yellow" />
          <Stat label="Seguidores" value={followerCount} color="text-titi-blue" />
          <Stat label="Seguidos" value={stats.followingCount} color="text-titi-green" />
        </div>
      </div>

      {/* Posts del usuario */}
      <section aria-label={`Posts de @${user.username}`}>
        <h2 className="text-2xl font-extrabold mb-4 px-1 text-titi-text">
          Posts de @{user.username}
        </h2>

        {postsLoading && (
          <div className="titi-card p-6 text-center text-titi-muted font-semibold">Cargando…</div>
        )}

        {postsError && (
          <div className="bg-white border-2 border-titi-red/40 rounded-2xl p-6 text-center shadow-titi">
            <p className="text-sm text-titi-red font-bold mb-3">{postsError}</p>
            <button onClick={fetchUserPosts} className="titi-btn-primary">Reintentar</button>
          </div>
        )}

        {!postsLoading && !postsError && posts.length === 0 && (
          <div className="titi-card p-8 text-center">
            <p className="text-titi-muted font-semibold">
              @{user.username} no ha publicado nada todavía.
            </p>
          </div>
        )}

        {!postsLoading && !postsError && posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((p) => (
              <SimplePostCard
                key={p.id}
                post={p}
                onDelete={handleDeletePost}
                onEdit={handleEditPost}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SimplePostCard({ post, onDelete, onEdit }) {
  const { user, isAuthenticated } = useAuth();
  const imageUrl = resolveMediaUrl(post.imageUrl);
  const [likedByMe, setLikedByMe] = useState(Boolean(post.likedByMe));
  const [likes, setLikes] = useState(post.likes ?? 0);
  const [liking, setLiking] = useState(false);

  async function toggleLike() {
    if (!isAuthenticated || liking) return;
    const prevLiked = likedByMe;
    const prevLikes = likes;
    setLikedByMe(!prevLiked);
    setLikes(prevLikes + (prevLiked ? -1 : 1));
    setLiking(true);
    try {
      const { data } = await client.post(`/api/posts/${post.id}/like`);
      if (data?.success) {
        setLikedByMe(Boolean(data.data.liked));
        setLikes(Number(data.data.likes ?? 0));
      } else {
        setLikedByMe(prevLiked); setLikes(prevLikes);
      }
    } catch {
      setLikedByMe(prevLiked); setLikes(prevLikes);
    } finally {
      setLiking(false);
    }
  }

  return (
    <article className="bg-white rounded-2xl shadow-titi border border-titi-border overflow-hidden hover:shadow-titi-lg transition-shadow">
      <div className="flex justify-end p-3">
        <OptionsPosts user={user} post={post} onDelete={onDelete} onEdit={onEdit} />
      </div>
      {imageUrl && (
        <div className="bg-titi-bg">
          <img src={imageUrl} alt="" className="w-full max-h-[480px] object-cover" loading="lazy" />
        </div>
      )}
      <div className="px-5 py-4">
        {post.content && (
          <p className="whitespace-pre-wrap leading-relaxed text-titi-text">{post.content}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <time
            dateTime={post.createdAt}
            title={formatDate(post.createdAt)}
            className="text-sm text-titi-muted font-semibold"
          >
            {relativeTime(post.createdAt)}
          </time>
          <button
            type="button"
            onClick={toggleLike}
            disabled={!isAuthenticated || liking}
            aria-pressed={likedByMe}
            aria-label={likedByMe ? 'Quitar like' : 'Dar like'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all ${
              likedByMe
                ? 'text-titi-red bg-titi-red/10 scale-105'
                : 'text-titi-muted hover:bg-titi-bg hover:text-titi-red'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <HeartIcon filled={likedByMe} className="w-5 h-5" />
            <span className="tabular-nums text-sm">{likes}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

const HeartIcon = ({ filled, className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

function Stat({ label, value, color = 'text-titi-text' }) {
  return (
    <div className="text-center">
      <p className={`text-2xl sm:text-3xl font-extrabold tabular-nums ${color}`}>{value ?? 0}</p>
      <p className="text-xs uppercase tracking-wide text-titi-muted font-extrabold">{label}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="titi-card p-6 animate-pulse">
      <div className="flex gap-6">
        <div className="w-28 h-28 rounded-full bg-titi-border shrink-0" />
        <div className="flex-1 space-y-3 pt-3">
          <div className="h-5 w-40 bg-titi-border rounded" />
          <div className="h-3 w-3/4 bg-titi-border rounded" />
          <div className="h-3 w-1/2 bg-titi-border rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-titi-border">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2 text-center">
            <div className="h-6 w-12 bg-titi-border rounded mx-auto" />
            <div className="h-2 w-16 bg-titi-border rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
