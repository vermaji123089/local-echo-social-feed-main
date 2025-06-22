
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { getPosts } from '@/utils/localStorage';
import CreatePost from './CreatePost';
import Post from './Post';

interface PostData {
  id: string;
  userId: string;
  username: string;
  content: string;
  image?: string;
  createdAt: string;
  likes: string[];
  comments: Array<{
    id: string;
    postId: string;
    userId: string;
    username: string;
    content: string;
    createdAt: string;
  }>;
}

const Home: React.FC = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<PostData[]>([]);

  const loadPosts = () => {
    const allPosts = getPosts();
    setPosts(allPosts);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Social Feed</h1>
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user.username}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <CreatePost />
        
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No posts yet!</p>
              <p className="text-gray-400">Be the first to share something.</p>
            </div>
          ) : (
            posts.map((post) => (
              <Post 
                key={post.id} 
                post={post} 
                onUpdate={loadPosts}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
