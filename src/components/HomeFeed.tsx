
import React, { useState, useEffect } from 'react';
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

const HomeFeed: React.FC = () => {
  const { user } = useAuth();
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
    <div className="max-w-2xl mx-auto px-4">
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
    </div>
  );
};

export default HomeFeed;
