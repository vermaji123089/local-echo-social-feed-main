
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getQueries, addQuery, addQueryResponse, updateQueryStatus, addCoins } from '@/utils/localStorage';

interface Query {
  id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  status: 'open' | 'resolved';
  responses: Array<{
    id: string;
    queryId: string;
    userId: string;
    username: string;
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
}

const Queries: React.FC = () => {
  const { user } = useAuth();
  const [queries, setQueries] = useState<Query[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [responses, setResponses] = useState<{[key: string]: string}>({});

  const loadQueries = () => {
    const allQueries = getQueries();
    setQueries(allQueries);
  };

  useEffect(() => {
    loadQueries();
  }, []);

  const handleCreateQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;

    const newQuery: Query = {
      id: `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      username: user.username,
      title: title.trim(),
      content: content.trim(),
      status: 'open',
      responses: [],
      createdAt: new Date().toISOString(),
    };

    addQuery(newQuery);
    addCoins(user.id, 5, 'Query posted');
    setTitle('');
    setContent('');
    setShowCreateForm(false);
    loadQueries();
  };

  const handleAddResponse = (queryId: string) => {
    if (!user || !responses[queryId]?.trim()) return;

    const response = {
      id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      queryId,
      userId: user.id,
      username: user.username,
      content: responses[queryId].trim(),
      createdAt: new Date().toISOString(),
    };

    addQueryResponse(queryId, response);
    addCoins(user.id, 10, 'Query response posted');
    setResponses(prev => ({ ...prev, [queryId]: '' }));
    loadQueries();
  };

  const handleMarkResolved = (queryId: string) => {
    updateQueryStatus(queryId, 'resolved');
    loadQueries();
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Community Queries</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : 'Ask Question'}
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ask a Question</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateQuery} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's your question?"
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Details</Label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide more details about your question..."
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <Button type="submit">Post Question (+5 coins)</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {queries.map((query) => (
          <Card key={query.id} className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{query.title}</CardTitle>
                  <p className="text-sm text-gray-500">by {query.username}</p>
                </div>
                <Badge variant={query.status === 'open' ? 'default' : 'secondary'}>
                  {query.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{query.content}</p>
              
              {query.responses.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Responses:</h4>
                  {query.responses.map((response) => (
                    <div key={response.id} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm">{response.content}</p>
                      <p className="text-xs text-gray-500 mt-1">by {response.username}</p>
                    </div>
                  ))}
                </div>
              )}

              {query.status === 'open' && (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add your response..."
                    value={responses[query.id] || ''}
                    onChange={(e) => setResponses(prev => ({ ...prev, [query.id]: e.target.value }))}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleAddResponse(query.id)}
                    disabled={!responses[query.id]?.trim()}
                  >
                    Reply (+10 coins)
                  </Button>
                  {query.userId === user.id && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMarkResolved(query.id)}
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {queries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No queries yet!</p>
          <p className="text-gray-400">Be the first to ask a question.</p>
        </div>
      )}
    </div>
  );
};

export default Queries;
