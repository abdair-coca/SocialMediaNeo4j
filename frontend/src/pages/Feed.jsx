import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client.js';
import PostCard from '../components/PostCard.jsx';
import CreatePost from '../components/CreatePost.jsx';
import TitiMascot from '../components/TitiMascot.jsx';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.get('/api/posts/feed');
      if (data?.success) setPosts(data.data.posts || []);
      else setError(data?.message || 'No se pudo cargar el feed');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error de red');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  const handleDelete = useCallback((id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);
  const handleEdit = useCallback((updated) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
  }, []);

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-titi-text">Inicio</h1>
          <p className="text-sm text-titi-muted font-semibold">Lo que está pasando con quienes seguís</p>
        </div>
        <button
          type="button"
          onClick={fetchFeed}
          disabled={loading}
          className="titi-btn-ghost text-sm disabled:opacity-50"
        >
          {loading ? 'Actualizando…' : 'Refrescar'}
        </button>
      </header>

      <CreatePost onCreated={fetchFeed} />

      {loading && posts.length === 0 && <FeedSkeleton />}

      {error && (
        <div className="bg-white border-2 border-titi-red/40 rounded-2xl p-6 text-center shadow-titi">
          <p className="text-titi-red font-extrabold mb-2">¡Ups!</p>
          <p className="text-sm text-titi-muted mb-4">{error}</p>
          <button onClick={fetchFeed} className="titi-btn-primary">Reintentar</button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && <EmptyFeed />}

      {posts.length > 0 && (
        <div>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-titi-border p-5 animate-pulse shadow-titi">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-titi-border" />
            <div className="space-y-2">
              <div className="h-3 w-24 bg-titi-border rounded" />
              <div className="h-2 w-16 bg-titi-border rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-titi-border rounded" />
            <div className="h-3 w-4/5 bg-titi-border rounded" />
            <div className="h-3 w-3/5 bg-titi-border rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyFeed() {
  return (
    <div className="titi-card p-10 text-center">
      <div className="mb-6">
        <TitiMascot
          mood="motivating"
          message="¡Sigue a alguien para ver su contenido!"
          size="lg"
        />
      </div>
      <h2 className="text-2xl font-extrabold mb-2">Tu inicio está vacío</h2>
      <p className="text-titi-muted mb-6 max-w-md mx-auto">
        Cuando sigas a otras personas, sus publicaciones aparecerán acá. Mientras tanto,
        descubrí qué se está compartiendo en Titi.
      </p>
      <Link to="/explore" className="titi-btn-primary">Ir a Explorar</Link>
    </div>
  );
}
