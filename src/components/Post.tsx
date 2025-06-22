
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { likePost, addComment } from '@/utils/localStorage';
import { toast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

interface PostData {
  id: string;
  userId: string;
  username: string;
  content: string;
  image?: string;
  createdAt: string;
  likes: string[];
  comments: Comment[];
}

interface PostProps {
  post: PostData;
  onUpdate: () => void;
}

const Post: React.FC<PostProps> = ({ post, onUpdate }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();

  const handleLike = () => {
    if (!user) return;
    
    likePost(post.id, user.id);
    onUpdate();
    
    const isLiked = post.likes.includes(user.id);
    toast({
      title: isLiked ? "Removed like" : "Liked post",
      description: isLiked ? "You unliked this post" : "You liked this post",
    });
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      postId: post.id,
      userId: user.id,
      username: user.username,
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    addComment(post.id, comment);
    setCommentText('');
    onUpdate();
    
    toast({
      title: "Comment added",
      description: "Your comment has been posted",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isLiked = user ? post.likes.includes(user.id) : false;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>
              {post.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.username}</p>
            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {post.content && (
          <p className="mb-4 text-gray-800">{post.content}</p>
        )}
        
        {post.image && (
          <img 
            src={post.image} 
            alt="Post image" 
            className="w-full rounded-lg mb-4 max-h-96 object-cover"
          />
        )}
        
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes.length}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1"
            >
              <span>💬 {post.comments.length}</span>
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="mt-4 space-y-3 border-t pt-3">
            <form onSubmit={handleComment} className="flex space-x-2">
              <Input
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={!commentText.trim()}>
                Post
              </Button>
            </form>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {comment.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm">{comment.username}</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Post;
