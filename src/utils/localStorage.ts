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

interface Coin {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  createdAt: string;
}

interface Query {
  id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  status: 'open' | 'resolved';
  responses: QueryResponse[];
  createdAt: string;
}

interface QueryResponse {
  id: string;
  queryId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

interface Itinerary {
  id: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  destinations: Destination[];
  startDate: string;
  endDate: string;
  isPublic: boolean;
  createdAt: string;
}

interface Destination {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
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

interface BlogComment {
  id: string;
  blogId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

interface TicketBooking {
  id: string;
  userId: string;
  username: string;
  type: 'flight' | 'train' | 'bus' | 'hotel';
  from: string;
  to: string;
  date: string;
  passengers: number;
  price: number;
  status: 'booked' | 'cancelled';
  createdAt: string;
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

// Coin utilities
export const getUserCoins = (userId: string): number => {
  const coins = getCoins();
  return coins
    .filter(coin => coin.userId === userId)
    .reduce((total, coin) => total + coin.amount, 0);
};

export const addCoins = (userId: string, amount: number, reason: string): void => {
  const coins = getCoins();
  const newCoin: Coin = {
    id: `coin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    amount,
    reason,
    createdAt: new Date().toISOString(),
  };
  coins.push(newCoin);
  localStorage.setItem('coins', JSON.stringify(coins));
};

export const getCoins = (): Coin[] => {
  const coinsData = localStorage.getItem('coins');
  return coinsData ? JSON.parse(coinsData) : [];
};

// Query utilities
export const getQueries = (): Query[] => {
  const queriesData = localStorage.getItem('queries');
  return queriesData ? JSON.parse(queriesData) : [];
};

export const addQuery = (query: Query): void => {
  const queries = getQueries();
  queries.unshift(query);
  localStorage.setItem('queries', JSON.stringify(queries));
};

export const addQueryResponse = (queryId: string, response: QueryResponse): void => {
  const queries = getQueries();
  const query = queries.find(q => q.id === queryId);
  if (query) {
    query.responses.push(response);
    localStorage.setItem('queries', JSON.stringify(queries));
  }
};

export const updateQueryStatus = (queryId: string, status: 'open' | 'resolved'): void => {
  const queries = getQueries();
  const query = queries.find(q => q.id === queryId);
  if (query) {
    query.status = status;
    localStorage.setItem('queries', JSON.stringify(queries));
  }
};

// Itinerary utilities
export const getItineraries = (): Itinerary[] => {
  const itinerariesData = localStorage.getItem('itineraries');
  return itinerariesData ? JSON.parse(itinerariesData) : [];
};

export const addItinerary = (itinerary: Itinerary): void => {
  const itineraries = getItineraries();
  itineraries.unshift(itinerary);
  localStorage.setItem('itineraries', JSON.stringify(itineraries));
};

export const updateItinerary = (itineraryId: string, updatedItinerary: Partial<Itinerary>): void => {
  const itineraries = getItineraries();
  const index = itineraries.findIndex(i => i.id === itineraryId);
  if (index !== -1) {
    itineraries[index] = { ...itineraries[index], ...updatedItinerary };
    localStorage.setItem('itineraries', JSON.stringify(itineraries));
  }
};

// Blog utilities
export const getBlogs = (): BlogPost[] => {
  const blogsData = localStorage.getItem('blogs');
  return blogsData ? JSON.parse(blogsData) : [];
};

export const addBlog = (blog: BlogPost): void => {
  const blogs = getBlogs();
  blogs.unshift(blog);
  localStorage.setItem('blogs', JSON.stringify(blogs));
};

export const likeBlog = (blogId: string, userId: string): void => {
  const blogs = getBlogs();
  const blog = blogs.find(b => b.id === blogId);
  
  if (blog) {
    if (blog.likes.includes(userId)) {
      blog.likes = blog.likes.filter(id => id !== userId);
    } else {
      blog.likes.push(userId);
    }
    localStorage.setItem('blogs', JSON.stringify(blogs));
  }
};

export const addBlogComment = (blogId: string, comment: BlogComment): void => {
  const blogs = getBlogs();
  const blog = blogs.find(b => b.id === blogId);
  
  if (blog) {
    blog.comments.push(comment);
    localStorage.setItem('blogs', JSON.stringify(blogs));
  }
};

// Ticket utilities
export const getTickets = (): TicketBooking[] => {
  const ticketsData = localStorage.getItem('tickets');
  return ticketsData ? JSON.parse(ticketsData) : [];
};

export const addTicket = (ticket: TicketBooking): void => {
  const tickets = getTickets();
  tickets.unshift(ticket);
  localStorage.setItem('tickets', JSON.stringify(tickets));
};

export const updateTicketStatus = (ticketId: string, status: 'booked' | 'cancelled'): void => {
  const tickets = getTickets();
  const ticket = tickets.find(t => t.id === ticketId);
  if (ticket) {
    ticket.status = status;
    localStorage.setItem('tickets', JSON.stringify(tickets));
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
