
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { getBlogs, addBlog, likeBlog, addBlogComment, saveFile, addCoins } from '@/utils/localStorage';
import { BookOpen } from 'lucide-react';

interface BlogComment {
  id: string;
  blogId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

interface BlogPost {
  id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  image?: string;
  tags: string[];
  likes: string[];
  comments: BlogComment[];
  createdAt: string;
}

const Blogs: React.FC = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [comments, setComments] = useState<{[key: string]: string}>({});

  const loadBlogs = () => {
    const allBlogs = getBlogs();
    setBlogs(allBlogs);
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;

    let imageData: string | undefined;
    if (image) {
      imageData = await saveFile(image);
    }

    const newBlog: BlogPost = {
      id: `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      username: user.username,
      title: title.trim(),
      content: content.trim(),
      image: imageData,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };

    addBlog(newBlog);
    addCoins(user.id, 20, 'Blog post created');
    
    // Reset form
    setTitle('');
    setContent('');
    setTags('');
    setImage(null);
    setShowCreateForm(false);
    loadBlogs();
  };

  const handleLike = (blogId: string) => {
    if (!user) return;
    likeBlog(blogId, user.id);
    loadBlogs();
  };

  const handleAddComment = (blogId: string) => {
    if (!user || !comments[blogId]?.trim()) return;

    const comment: BlogComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      blogId,
      userId: user.id,
      username: user.username,
      content: comments[blogId].trim(),
      createdAt: new Date().toISOString(),
    };

    addBlogComment(blogId, comment);
    addCoins(user.id, 5, 'Blog comment added');
    setComments(prev => ({ ...prev, [blogId]: '' }));
    loadBlogs();
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center space-x-2">
          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
          <span>Travel Blogs</span>
        </h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="w-full sm:w-auto">
          {showCreateForm ? 'Cancel' : 'Write Blog'}
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Create New Blog Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBlog} className="space-y-4">
              <div>
                <Label htmlFor="blogTitle">Title</Label>
                <Input
                  id="blogTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Your blog post title..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="blogContent">Content</Label>
                <textarea
                  id="blogContent"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog content here..."
                  className="w-full min-h-[150px] sm:min-h-[200px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="blogTags">Tags (comma separated)</Label>
                <Input
                  id="blogTags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="travel, adventure, food, culture..."
                />
              </div>

              <div>
                <Label htmlFor="blogImage">Featured Image (optional)</Label>
                <Input
                  id="blogImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </div>

              <Button type="submit" className="w-full sm:w-auto">Publish Blog (+20 coins)</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4 sm:space-y-6">
        {blogs.map((blog) => (
          <Card key={blog.id} className="animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                    <AvatarFallback>
                      {blog.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-xl leading-tight">{blog.title}</CardTitle>
                    <p className="text-xs sm:text-sm text-gray-500">
                      by {blog.username} • {new Date(blog.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {blog.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              {blog.image && (
                <img 
                  src={blog.image} 
                  alt={blog.title}
                  className="w-full h-48 sm:h-64 object-cover rounded-lg"
                />
              )}
              
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{blog.content}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLike(blog.id)}
                  className={blog.likes.includes(user.id) ? 'bg-red-50 text-red-600' : ''}
                >
                  ❤️ {blog.likes.length}
                </Button>
                <span className="text-sm text-gray-500">
                  💬 {blog.comments.length} comments
                </span>
              </div>

              {blog.comments.length > 0 && (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {blog.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.username}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={comments[blog.id] || ''}
                  onChange={(e) => setComments(prev => ({ ...prev, [blog.id]: e.target.value }))}
                  className="flex-1"
                />
                <Button 
                  size="sm"
                  onClick={() => handleAddComment(blog.id)}
                  disabled={!comments[blog.id]?.trim()}
                  className="w-full sm:w-auto"
                >
                  Comment (+5 coins)
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {blogs.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 text-base sm:text-lg">No blog posts yet!</p>
          <p className="text-gray-400 text-sm sm:text-base">Share your travel experiences with the community.</p>
        </div>
      )}
    </div>
  );
};

export default Blogs;
