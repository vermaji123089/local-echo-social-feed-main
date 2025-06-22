
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface Post {
  id: string;
  userId: string;
  username: string;
  content: string;
  image?: string;
  createdAt: string;
  likes: string[];
  comments: Comment[];
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

interface Session {
  userId: string;
  username: string;
  email: string;
  token: string;
  expiresAt: string;
}

// Auth utilities
export const saveSession = (user: User): void => {
  const session: Session = {
    userId: user.id,
    username: user.username,
    email: user.email,
    token: `token_${user.id}_${Date.now()}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  };
  localStorage.setItem('session', JSON.stringify(session));
};

export const getSession = (): Session | null => {
  const sessionData = localStorage.getItem('session');
  if (!sessionData) return null;
  
  const session: Session = JSON.parse(sessionData);
  if (new Date(session.expiresAt) < new Date()) {
    localStorage.removeItem('session');
    return null;
  }
  
  return session;
};

export const clearSession = (): void => {
  localStorage.removeItem('session');
};

// User utilities
export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex !== -1) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem('users', JSON.stringify(users));
};

export const getUsers = (): User[] => {
  const usersData = localStorage.getItem('users');
  return usersData ? JSON.parse(usersData) : [];
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(user => user.email === email) || null;
};

export const getUserById = (id: string): User | null => {
  const users = getUsers();
  return users.find(user => user.id === id) || null;
};

// Post utilities
export const savePosts = (posts: Post[]): void => {
  localStorage.setItem('posts', JSON.stringify(posts));
};

export const getPosts = (): Post[] => {
  const postsData = localStorage.getItem('posts');
  return postsData ? JSON.parse(postsData) : [];
};

export const addPost = (post: Post): void => {
  const posts = getPosts();
  posts.unshift(post);
  savePosts(posts);
};

export const updatePost = (postId: string, updatedPost: Partial<Post>): void => {
  const posts = getPosts();
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex !== -1) {
    posts[postIndex] = { ...posts[postIndex], ...updatedPost };
    savePosts(posts);
  }
};

export const likePost = (postId: string, userId: string): void => {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  
  if (post) {
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      post.likes.push(userId);
    }
    savePosts(posts);
  }
};

export const addComment = (postId: string, comment: Comment): void => {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  
  if (post) {
    post.comments.push(comment);
    savePosts(posts);
  }
};

// File utilities
export const saveFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = e.target?.result as string;
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(fileId, fileData);
      resolve(fileData);
    };
    reader.readAsDataURL(file);
  });
};
