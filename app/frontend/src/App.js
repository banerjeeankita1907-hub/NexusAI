"import { useState, useEffect } from \"react\";
import \"@/App.css\";
import { BrowserRouter, Routes, Route, Link, useNavigate } from \"react-router-dom\";
import axios from \"axios\";
import { 
  MessageSquare, 
  Image as ImageIcon, 
  CheckSquare, 
  BarChart3, 
  User, 
  Menu,
  Send,
  Plus,
  X,
  Trash2,
  Loader2
} from \"lucide-react\";
import { Button } from \"@/components/ui/button\";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from \"@/components/ui/card\";
import { Input } from \"@/components/ui/input\";
import { Textarea } from \"@/components/ui/textarea\";
import { Badge } from \"@/components/ui/badge\";
import { ScrollArea } from \"@/components/ui/scroll-area\";
import { Tabs, TabsContent, TabsList, TabsTrigger } from \"@/components/ui/tabs\";
import { toast } from \"sonner\";
import { Toaster } from \"@/components/ui/sonner\";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ==================== DASHBOARD PAGE ====================
const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error(\"Error fetching analytics:\", error);
      toast.error(\"Failed to load analytics\");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className=\"flex items-center justify-center h-full\">
        <Loader2 className=\"w-8 h-8 animate-spin text-blue-600\" />
      </div>
    );
  }

  return (
    <div className=\"space-y-8\" data-testid=\"dashboard-page\">
      <div>
        <h1 className=\"text-4xl font-bold text-gray-900\" data-testid=\"dashboard-title\">Welcome to NexusAI</h1>
        <p className=\"text-gray-600 mt-2\">Your AI-powered productivity and creativity hub</p>
      </div>

      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">
        <Card data-testid=\"stat-card-chats\">
          <CardHeader className=\"pb-3\">
            <CardTitle className=\"text-sm font-medium text-gray-600\">Total Chats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=\"text-3xl font-bold text-blue-600\">{analytics?.total_chats || 0}</div>
            <p className=\"text-sm text-gray-500 mt-1\">{analytics?.total_messages || 0} messages</p>
          </CardContent>
        </Card>

        <Card data-testid=\"stat-card-images\">
          <CardHeader className=\"pb-3\">
            <CardTitle className=\"text-sm font-medium text-gray-600\">Images Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=\"text-3xl font-bold text-purple-600\">{analytics?.total_images || 0}</div>
            <p className=\"text-sm text-gray-500 mt-1\">AI-powered creations</p>
          </CardContent>
        </Card>

        <Card data-testid=\"stat-card-tasks\">
          <CardHeader className=\"pb-3\">
            <CardTitle className=\"text-sm font-medium text-gray-600\">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=\"text-3xl font-bold text-green-600\">{analytics?.total_tasks || 0}</div>
            <p className=\"text-sm text-gray-500 mt-1\">{analytics?.completed_tasks || 0} completed</p>
          </CardContent>
        </Card>

        <Card data-testid=\"stat-card-pending\">
          <CardHeader className=\"pb-3\">
            <CardTitle className=\"text-sm font-medium text-gray-600\">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=\"text-3xl font-bold text-orange-600\">{analytics?.pending_tasks || 0}</div>
            <p className=\"text-sm text-gray-500 mt-1\">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
        <Card data-testid=\"features-card\">
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>Explore what NexusAI can do for you</CardDescription>
          </CardHeader>
          <CardContent className=\"space-y-4\">
            <div className=\"flex items-start space-x-4 p-4 bg-blue-50 rounded-lg\">
              <MessageSquare className=\"w-6 h-6 text-blue-600 mt-1\" />
              <div>
                <h3 className=\"font-semibold text-gray-900\">AI Chat Assistant</h3>
                <p className=\"text-sm text-gray-600\">Powered by GPT-5.2 for intelligent conversations</p>
              </div>
            </div>
            <div className=\"flex items-start space-x-4 p-4 bg-purple-50 rounded-lg\">
              <ImageIcon className=\"w-6 h-6 text-purple-600 mt-1\" />
              <div>
                <h3 className=\"font-semibold text-gray-900\">Image Generation</h3>
                <p className=\"text-sm text-gray-600\">Create stunning visuals with Gemini Nano Banana</p>
              </div>
            </div>
            <div className=\"flex items-start space-x-4 p-4 bg-green-50 rounded-lg\">
              <CheckSquare className=\"w-6 h-6 text-green-600 mt-1\" />
              <div>
                <h3 className=\"font-semibold text-gray-900\">Task Management</h3>
                <p className=\"text-sm text-gray-600\">Organize your work with smart to-do lists</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid=\"quick-actions-card\">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump right into what you need</CardDescription>
          </CardHeader>
          <CardContent className=\"space-y-3\">
            <Link to=\"/chat\">
              <Button className=\"w-full justify-start\" variant=\"outline\" data-testid=\"quick-action-chat\">
                <MessageSquare className=\"w-4 h-4 mr-2\" />
                Start a new chat
              </Button>
            </Link>
            <Link to=\"/images\">
              <Button className=\"w-full justify-start\" variant=\"outline\" data-testid=\"quick-action-image\">
                <ImageIcon className=\"w-4 h-4 mr-2\" />
                Generate an image
              </Button>
            </Link>
            <Link to=\"/tasks\">
              <Button className=\"w-full justify-start\" variant=\"outline\" data-testid=\"quick-action-task\">
                <CheckSquare className=\"w-4 h-4 mr-2\" />
                Create a task
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ==================== CHAT PAGE ====================
const Chat = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState(\"\");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (currentSession) {
      fetchMessages(currentSession.id);
    }
  }, [currentSession]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API}/chat/sessions`);
      setSessions(response.data);
      if (response.data.length > 0 && !currentSession) {
        setCurrentSession(response.data[0]);
      }
    } catch (error) {
      console.error(\"Error fetching sessions:\", error);
      toast.error(\"Failed to load chat sessions\");
    }
  };

  const fetchMessages = async (sessionId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/chat/sessions/${sessionId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error(\"Error fetching messages:\", error);
      toast.error(\"Failed to load messages\");
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await axios.post(`${API}/chat/sessions`, { title: \"New Chat\" });
      setSessions([response.data, ...sessions]);
      setCurrentSession(response.data);
      setMessages([]);
      toast.success(\"New chat session created\");
    } catch (error) {
      console.error(\"Error creating session:\", error);
      toast.error(\"Failed to create new session\");
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSession) return;

    const userMessage = inputMessage;
    setInputMessage(\"\");
    setSending(true);

    // Add user message to UI immediately
    const tempUserMsg = {
      id: Date.now().toString(),
      role: \"user\",
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages([...messages, tempUserMsg]);

    try {
      const response = await axios.post(`${API}/chat`, {
        session_id: currentSession.id,
        message: userMessage
      });
      
      // Refresh messages to get both user and AI messages
      await fetchMessages(currentSession.id);
      toast.success(\"Message sent\");
    } catch (error) {
      console.error(\"Error sending message:\", error);
      toast.error(\"Failed to send message\");
      // Remove temporary message on error
      setMessages(messages);
    } finally {
      setSending(false);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await axios.delete(`${API}/chat/sessions/${sessionId}`);
      setSessions(sessions.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
      toast.success(\"Session deleted\");
    } catch (error) {
      console.error(\"Error deleting session:\", error);
      toast.error(\"Failed to delete session\");
    }
  };

  return (
    <div className=\"flex h-[calc(100vh-8rem)] gap-4\" data-testid=\"chat-page\">
      {/* Sessions Sidebar */}
      <div className=\"w-64 border-r border-gray-200 pr-4 space-y-3\">
        <Button 
          onClick={createNewSession} 
          className=\"w-full\" 
          data-testid=\"new-chat-button\"
        >
          <Plus className=\"w-4 h-4 mr-2\" />
          New Chat
        </Button>
        <ScrollArea className=\"h-[calc(100%-4rem)]\">
          <div className=\"space-y-2\">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`p-3 rounded-lg cursor-pointer flex items-center justify-between group ${
                  currentSession?.id === session.id ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setCurrentSession(session)}
                data-testid={`session-${session.id}`}
              >
                <span className=\"text-sm truncate flex-1\">{session.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className=\"opacity-0 group-hover:opacity-100 ml-2\"
                  data-testid={`delete-session-${session.id}`}
                >
                  <Trash2 className=\"w-4 h-4 text-red-600\" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className=\"flex-1 flex flex-col\">
        {currentSession ? (
          <>
            <div className=\"border-b border-gray-200 pb-4 mb-4\">
              <h2 className=\"text-2xl font-bold\" data-testid=\"current-session-title\">{currentSession.title}</h2>
            </div>

            <ScrollArea className=\"flex-1 mb-4\">
              {loading ? (
                <div className=\"flex items-center justify-center h-full\">
                  <Loader2 className=\"w-8 h-8 animate-spin text-blue-600\" />
                </div>
              ) : messages.length === 0 ? (
                <div className=\"flex items-center justify-center h-full text-gray-500\">
                  Start a conversation with NexusAI
                </div>
              ) : (
                <div className=\"space-y-4\" data-testid=\"messages-container\">
                  {messages.map((msg, idx) => (
                    <div
                      key={msg.id || idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      data-testid={`message-${msg.role}-${idx}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className=\"whitespace-pre-wrap\">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className=\"flex gap-2\" data-testid=\"chat-input-container\">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder=\"Type your message...\"
                disabled={sending}
                className=\"flex-1\"
                data-testid=\"chat-input\"
              />
              <Button 
                onClick={sendMessage} 
                disabled={sending || !inputMessage.trim()}
                data-testid=\"send-message-button\"
              >
                {sending ? (
                  <Loader2 className=\"w-4 h-4 animate-spin\" />
                ) : (
                  <Send className=\"w-4 h-4\" />
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className=\"flex items-center justify-center h-full text-gray-500\">
            Create or select a chat session to start
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== IMAGE GENERATION PAGE ====================
const Images = () => {
  const [prompt, setPrompt] = useState(\"\");
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${API}/images`);
      setImages(response.data);
    } catch (error) {
      console.error(\"Error fetching images:\", error);
      toast.error(\"Failed to load images\");
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);
    try {
      const response = await axios.post(`${API}/images/generate`, { prompt });
      setImages([response.data, ...images]);
      setPrompt(\"\");
      toast.success(\"Image generated successfully!\");
    } catch (error) {
      console.error(\"Error generating image:\", error);
      toast.error(\"Failed to generate image\");
    } finally {
      setGenerating(false);
    }
  };

  const deleteImage = async (imageId) => {
    try {
      await axios.delete(`${API}/images/${imageId}`);
      setImages(images.filter(img => img.id !== imageId));
      toast.success(\"Image deleted\");
    } catch (error) {
      console.error(\"Error deleting image:\", error);
      toast.error(\"Failed to delete image\");
    }
  };

  return (
    <div className=\"space-y-8\" data-testid=\"images-page\">
      <div>
        <h1 className=\"text-4xl font-bold text-gray-900\" data-testid=\"images-title\">AI Image Generation</h1>
        <p className=\"text-gray-600 mt-2\">Create stunning images with Gemini Nano Banana</p>
      </div>

      <Card data-testid=\"generate-image-card\">
        <CardHeader>
          <CardTitle>Generate New Image</CardTitle>
          <CardDescription>Describe what you want to create</CardDescription>
        </CardHeader>
        <CardContent className=\"space-y-4\">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder=\"E.g., A futuristic city with flying cars at sunset...\"
            rows={3}
            data-testid=\"image-prompt-input\"
          />
          <Button 
            onClick={generateImage} 
            disabled={generating || !prompt.trim()}
            className=\"w-full\"
            data-testid=\"generate-image-button\"
          >
            {generating ? (
              <>
                <Loader2 className=\"w-4 h-4 mr-2 animate-spin\" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className=\"w-4 h-4 mr-2\" />
                Generate Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className=\"text-2xl font-bold mb-4\">Your Gallery</h2>
        {loading ? (
          <div className=\"flex items-center justify-center py-12\">
            <Loader2 className=\"w-8 h-8 animate-spin text-blue-600\" />
          </div>
        ) : images.length === 0 ? (
          <Card>
            <CardContent className=\"py-12 text-center text-gray-500\">
              No images generated yet. Create your first masterpiece!
            </CardContent>
          </Card>
        ) : (
          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\" data-testid=\"images-gallery\">
            {images.map((img) => (
              <Card key={img.id} className=\"overflow-hidden group\" data-testid={`image-card-${img.id}`}>
                <div className=\"relative\">
                  <img
                    src={`data:image/png;base64,${img.image_data}`}
                    alt={img.prompt}
                    className=\"w-full h-64 object-cover\"
                  />
                  <button
                    onClick={() => deleteImage(img.id)}
                    className=\"absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity\"
                    data-testid={`delete-image-${img.id}`}
                  >
                    <Trash2 className=\"w-4 h-4\" />
                  </button>
                </div>
                <CardContent className=\"p-4\">
                  <p className=\"text-sm text-gray-600 line-clamp-2\">{img.prompt}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== TASKS PAGE ====================
const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: \"\", description: \"\", priority: \"medium\" });
  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error(\"Error fetching tasks:\", error);
      toast.error(\"Failed to load tasks\");
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const response = await axios.post(`${API}/tasks`, newTask);
      setTasks([response.data, ...tasks]);
      setNewTask({ title: \"\", description: \"\", priority: \"medium\" });
      setShowAddTask(false);
      toast.success(\"Task created\");
    } catch (error) {
      console.error(\"Error creating task:\", error);
      toast.error(\"Failed to create task\");
    }
  };

  const toggleTask = async (taskId, completed) => {
    try {
      const response = await axios.put(`${API}/tasks/${taskId}`, { completed: !completed });
      setTasks(tasks.map(t => t.id === taskId ? response.data : t));
      toast.success(completed ? \"Task marked as incomplete\" : \"Task completed!\");
    } catch (error) {
      console.error(\"Error updating task:\", error);
      toast.error(\"Failed to update task\");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API}/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success(\"Task deleted\");
    } catch (error) {
      console.error(\"Error deleting task:\", error);
      toast.error(\"Failed to delete task\");
    }
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className=\"space-y-8\" data-testid=\"tasks-page\">
      <div className=\"flex items-center justify-between\">
        <div>
          <h1 className=\"text-4xl font-bold text-gray-900\" data-testid=\"tasks-title\">Task Management</h1>
          <p className=\"text-gray-600 mt-2\">Stay organized and productive</p>
        </div>
        <Button onClick={() => setShowAddTask(!showAddTask)} data-testid=\"add-task-button\">
          <Plus className=\"w-4 h-4 mr-2\" />
          Add Task
        </Button>
      </div>

      {showAddTask && (
        <Card data-testid=\"add-task-form\">
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
          </CardHeader>
          <CardContent className=\"space-y-4\">
            <Input
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder=\"Task title\"
              data-testid=\"task-title-input\"
            />
            <Textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder=\"Description (optional)\"
              rows={2}
              data-testid=\"task-description-input\"
            />
            <div className=\"flex items-center gap-2\">
              <label className=\"text-sm font-medium\">Priority:</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className=\"border rounded px-3 py-1\"
                data-testid=\"task-priority-select\"
              >
                <option value=\"low\">Low</option>
                <option value=\"medium\">Medium</option>
                <option value=\"high\">High</option>
              </select>
            </div>
            <div className=\"flex gap-2\">
              <Button onClick={createTask} className=\"flex-1\" data-testid=\"save-task-button\">
                Save Task
              </Button>
              <Button 
                onClick={() => setShowAddTask(false)} 
                variant=\"outline\"
                data-testid=\"cancel-task-button\"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue=\"pending\" data-testid=\"tasks-tabs\">
        <TabsList>
          <TabsTrigger value=\"pending\" data-testid=\"pending-tasks-tab\">
            Pending ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value=\"completed\" data-testid=\"completed-tasks-tab\">
            Completed ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value=\"pending\" className=\"space-y-3 mt-6\">
          {loading ? (
            <div className=\"flex items-center justify-center py-12\">
              <Loader2 className=\"w-8 h-8 animate-spin text-blue-600\" />
            </div>
          ) : pendingTasks.length === 0 ? (
            <Card>
              <CardContent className=\"py-12 text-center text-gray-500\">
                No pending tasks. Great work!
              </CardContent>
            </Card>
          ) : (
            pendingTasks.map((task) => (
              <Card key={task.id} data-testid={`task-${task.id}`}>
                <CardContent className=\"p-4 flex items-start justify-between\">
                  <div className=\"flex items-start gap-3 flex-1\">
                    <input
                      type=\"checkbox\"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id, task.completed)}
                      className=\"mt-1 w-5 h-5\"
                      data-testid={`task-checkbox-${task.id}`}
                    />
                    <div className=\"flex-1\">
                      <h3 className=\"font-semibold text-gray-900\">{task.title}</h3>
                      {task.description && (
                        <p className=\"text-sm text-gray-600 mt-1\">{task.description}</p>
                      )}
                      <div className=\"flex items-center gap-2 mt-2\">
                        <Badge
                          variant={
                            task.priority === 'high' ? 'destructive' :
                            task.priority === 'medium' ? 'default' : 'secondary'
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className=\"text-red-600 hover:text-red-800\"
                    data-testid={`delete-task-${task.id}`}
                  >
                    <Trash2 className=\"w-4 h-4\" />
                  </button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value=\"completed\" className=\"space-y-3 mt-6\">
          {completedTasks.length === 0 ? (
            <Card>
              <CardContent className=\"py-12 text-center text-gray-500\">
                No completed tasks yet.
              </CardContent>
            </Card>
          ) : (
            completedTasks.map((task) => (
              <Card key={task.id} className=\"opacity-75\" data-testid={`task-${task.id}`}>
                <CardContent className=\"p-4 flex items-start justify-between\">
                  <div className=\"flex items-start gap-3 flex-1\">
                    <input
                      type=\"checkbox\"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id, task.completed)}
                      className=\"mt-1 w-5 h-5\"
                      data-testid={`task-checkbox-${task.id}`}
                    />
                    <div className=\"flex-1\">
                      <h3 className=\"font-semibold text-gray-900 line-through\">{task.title}</h3>
                      {task.description && (
                        <p className=\"text-sm text-gray-600 mt-1\">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className=\"text-red-600 hover:text-red-800\"
                    data-testid={`delete-task-${task.id}`}
                  >
                    <Trash2 className=\"w-4 h-4\" />
                  </button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ==================== PROFILE PAGE ====================
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: \"\", email: \"\" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/user/profile`);
      setProfile(response.data);
      setFormData({ name: response.data.name, email: response.data.email || \"\" });
    } catch (error) {
      console.error(\"Error fetching profile:\", error);
      toast.error(\"Failed to load profile\");
    }
  };

  const updateProfile = async () => {
    try {
      const response = await axios.put(`${API}/user/profile`, formData);
      setProfile(response.data);
      setEditing(false);
      toast.success(\"Profile updated\");
    } catch (error) {
      console.error(\"Error updating profile:\", error);
      toast.error(\"Failed to update profile\");
    }
  };

  return (
    <div className=\"space-y-8\" data-testid=\"profile-page\">
      <div>
        <h1 className=\"text-4xl font-bold text-gray-900\" data-testid=\"profile-title\">Profile Settings</h1>
        <p className=\"text-gray-600 mt-2\">Manage your account preferences</p>
      </div>

      <Card data-testid=\"profile-card\">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className=\"space-y-4\">
          {editing ? (
            <>
              <div>
                <label className=\"text-sm font-medium\">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder=\"Your name\"
                  data-testid=\"profile-name-input\"
                />
              </div>
              <div>
                <label className=\"text-sm font-medium\">Email</label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder=\"your.email@example.com\"
                  type=\"email\"
                  data-testid=\"profile-email-input\"
                />
              </div>
              <div className=\"flex gap-2\">
                <Button onClick={updateProfile} data-testid=\"save-profile-button\">Save Changes</Button>
                <Button 
                  onClick={() => setEditing(false)} 
                  variant=\"outline\"
                  data-testid=\"cancel-profile-button\"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className=\"text-sm font-medium text-gray-600\">Name</label>
                <p className=\"text-lg\" data-testid=\"profile-name-display\">{profile?.name}</p>
              </div>
              <div>
                <label className=\"text-sm font-medium text-gray-600\">Email</label>
                <p className=\"text-lg\" data-testid=\"profile-email-display\">{profile?.email || \"Not set\"}</p>
              </div>
              <Button onClick={() => setEditing(true)} data-testid=\"edit-profile-button\">
                Edit Profile
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ==================== MAIN LAYOUT ====================
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: \"/\", icon: BarChart3, label: \"Dashboard\" },
    { path: \"/chat\", icon: MessageSquare, label: \"AI Chat\" },
    { path: \"/images\", icon: ImageIcon, label: \"Image Gen\" },
    { path: \"/tasks\", icon: CheckSquare, label: \"Tasks\" },
    { path: \"/profile\", icon: User, label: \"Profile\" },
  ];

  return (
    <div className=\"flex h-screen bg-gray-50\">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 overflow-hidden`}>
        <div className=\"p-6\">
          <h1 className=\"text-2xl font-bold\">NexusAI</h1>
          <p className=\"text-sm text-gray-400 mt-1\">AI-Powered Hub</p>
        </div>
        <nav className=\"mt-6 px-3\">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <div className=\"flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors mb-1\">
                <item.icon className=\"w-5 h-5\" />
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className=\"flex-1 flex flex-col overflow-hidden\">
        {/* Header */}
        <header className=\"bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4\">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className=\"p-2 hover:bg-gray-100 rounded-lg\"
            data-testid=\"sidebar-toggle\"
          >
            <Menu className=\"w-5 h-5\" />
          </button>
        </header>

        {/* Page Content */}
        <main className=\"flex-1 overflow-auto p-8\">
          {children}
        </main>
      </div>
    </div>
  );
};

// ==================== APP COMPONENT ====================
function App() {
  return (
    <div className=\"App\">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path=\"/\" element={<Dashboard />} />
            <Route path=\"/chat\" element={<Chat />} />
            <Route path=\"/images\" element={<Images />} />
            <Route path=\"/tasks\" element={<Tasks />} />
            <Route path=\"/profile\" element={<Profile />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <Toaster position=\"top-right\" />
    </div>
  );
}

export default App;
"
Observation: Overwrite successful: /app/frontend/src/App.js
