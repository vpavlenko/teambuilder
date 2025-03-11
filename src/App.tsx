import { useState, useEffect } from "react";
import "./App.css";

// Toast interface and component
interface ToastProps {
  title: string;
  message: string;
  onClose: () => void;
}

function Toast({ title, message, onClose }: ToastProps) {
  useEffect(() => {
    // Automatically close the toast after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast">
      <div className="toast-icon">🎉</div>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        <div className="toast-message">{message}</div>
      </div>
    </div>
  );
}

// Types
interface User {
  id: string;
  name: string;
  description: string;
  celebratedProjects: string[]; // Array of project IDs where celebration was shown
}

interface Project {
  id: string;
  authorId: string;
  title: string;
  description: string;
  createdAt: number;
  applications: string[]; // array of user IDs who applied
  acceptedUsers: string[]; // array of accepted user IDs
  rejectedUsers: string[]; // array of rejected user IDs
}

// Project templates
const PROJECT_TEMPLATES = [
  {
    title: "Умный планировщик питания",
    description:
      "Приложение, которое анализирует привычки питания, составляет персонализированное меню и автоматически заказывает продукты из ближайших магазинов. Интеграция с популярными службами доставки продуктов.",
  },
  {
    title: "Маркетплейс локальных гидов",
    description:
      "Платформа для поиска местных гидов и уникальных экскурсий в городах России. Гиды могут создавать свои маршруты, а путешественники - выбирать экскурсии по интересам и бюджету.",
  },
  {
    title: "Агрегатор детских кружков",
    description:
      "Сервис для поиска и записи детей на развивающие занятия, спортивные секции и творческие кружки. С отзывами родителей, рейтингом преподавателей и онлайн-оплатой.",
  },
  {
    title: "Сервис аренды гаражных мастерских",
    description:
      "Платформа, где владельцы гаражей и мастерских могут сдавать их в почасовую аренду для ремонта автомобилей, столярных работ или других хобби. С инструментами и оборудованием.",
  },
  {
    title: "Marketplace подержанной электроники",
    description:
      "Сервис перепродажи б/у электроники с проверкой технического состояния, гарантией и доставкой. Интеграция с сервисными центрами для диагностики и ремонта.",
  },
];

// Local Storage Keys
const USERS_KEY = "marketplace_users";
const PROJECTS_KEY = "marketplace_projects";
const CURRENT_USER_KEY = "marketplace_current_user";

// Helper functions for localStorage
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  console.log(`Getting from storage [${key}]:`, stored);

  // Return default value if nothing is stored
  if (!stored) return defaultValue;

  // Parse the stored data
  const parsed = JSON.parse(stored);

  // Add migration for users to ensure celebratedProjects exists
  if (key === USERS_KEY) {
    return parsed.map((user: User) => ({
      ...user,
      celebratedProjects: user.celebratedProjects || [],
    })) as T;
  }

  // Add migration for currentUser to ensure celebratedProjects exists
  if (key === CURRENT_USER_KEY && parsed) {
    return {
      ...parsed,
      celebratedProjects: parsed.celebratedProjects || [],
    } as T;
  }

  // Add migration for projects to ensure all arrays are initialized
  if (key === PROJECTS_KEY) {
    return parsed.map((project: Project) => ({
      ...project,
      applications: project.applications || [],
      acceptedUsers: project.acceptedUsers || [],
      rejectedUsers: project.rejectedUsers || [],
    })) as T;
  }

  return parsed;
};

const setToStorage = <T,>(key: string, value: T): void => {
  console.log(`Setting to storage [${key}]:`, value);
  localStorage.setItem(key, JSON.stringify(value));
};

function App() {
  // Initialize state with values from localStorage
  const [users, setUsers] = useState<User[]>(() =>
    getFromStorage<User[]>(USERS_KEY, [])
  );
  const [projects, setProjects] = useState<Project[]>(() =>
    getFromStorage<Project[]>(PROJECTS_KEY, [])
  );
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    getFromStorage<User | null>(CURRENT_USER_KEY, null)
  );
  const [newUserName, setNewUserName] = useState("");
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  // Toast state
  const [toasts, setToasts] = useState<
    { id: string; title: string; message: string }[]
  >([]);

  // Add state to track celebrations shown in the current session
  const [sessionCelebrations, setSessionCelebrations] = useState<string[]>([]);

  // Remove the initial load effect as we now initialize with localStorage values

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (users.length > 0) {
      // Only save if there's actual data
      setToStorage(USERS_KEY, users);
    }
  }, [users]);

  useEffect(() => {
    if (projects.length > 0) {
      // Only save if there's actual data
      setToStorage(PROJECTS_KEY, projects);
    }
  }, [projects]);

  useEffect(() => {
    if (currentUser) {
      // Only save if there's actual data
      setToStorage(CURRENT_USER_KEY, currentUser);
    }
  }, [currentUser]);

  // Function to add a toast
  const addToast = (title: string, message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message }]);
  };

  // Function to remove a toast
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleCreateUser = () => {
    if (!newUserName.trim()) return;

    const newUser: User = {
      id: Date.now().toString(),
      name: newUserName.trim(),
      description: "",
      celebratedProjects: [],
    };

    console.log("Creating new user:", newUser);
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setNewUserName("");
  };

  const handleCreateProject = () => {
    if (!currentUser || !newProjectTitle.trim()) return;

    const newProject: Project = {
      id: Date.now().toString(),
      authorId: currentUser.id,
      title: newProjectTitle.trim(),
      description: newProjectDescription.trim(),
      createdAt: Date.now(),
      applications: [],
      acceptedUsers: [],
      rejectedUsers: [],
    };

    setProjects((prev) => [...prev, newProject]);
    setNewProjectTitle("");
    setNewProjectDescription("");
  };

  const handleApplyToProject = (projectId: string) => {
    if (!currentUser) return;

    setProjects(
      projects.map((project) => {
        if (
          project.id === projectId &&
          !project.applications.includes(currentUser.id)
        ) {
          return {
            ...project,
            applications: [...project.applications, currentUser.id],
          };
        }
        return project;
      })
    );
  };

  const handleAcceptApplication = (projectId: string, userId: string) => {
    setProjects(
      projects.map((project) => {
        if (project.id === projectId) {
          // Ensure the user isn't already in acceptedUsers to prevent duplicates
          if (!project.acceptedUsers?.includes(userId)) {
            return {
              ...project,
              applications: project.applications.filter((id) => id !== userId),
              acceptedUsers: [...(project.acceptedUsers || []), userId],
            };
          } else {
            // If user is already accepted, just remove from applications
            return {
              ...project,
              applications: project.applications.filter((id) => id !== userId),
            };
          }
        }
        return project;
      })
    );
  };

  const handleRejectApplication = (projectId: string, userId: string) => {
    setProjects(
      projects.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            applications: project.applications.filter((id) => id !== userId),
            rejectedUsers: [...(project.rejectedUsers || []), userId],
          };
        }
        return project;
      })
    );
  };

  // Update the celebration check effect
  useEffect(() => {
    if (!currentUser || !currentUser.celebratedProjects) return;

    const pendingCelebrations: { projectId: string; title: string }[] = [];

    projects.forEach((project) => {
      if (
        project.acceptedUsers &&
        project.acceptedUsers.includes(currentUser.id) &&
        !currentUser.celebratedProjects.includes(project.id) &&
        !sessionCelebrations.includes(project.id)
      ) {
        // Add to pending celebrations
        pendingCelebrations.push({
          projectId: project.id,
          title: project.title,
        });
      }
    });

    if (pendingCelebrations.length > 0) {
      // Add all to session celebrations to prevent showing again
      setSessionCelebrations((prev) => [
        ...prev,
        ...pendingCelebrations.map((cel) => cel.projectId),
      ]);

      // Show toast for each celebration
      pendingCelebrations.forEach((cel) => {
        addToast("Поздравляем!", `Вас приняли в проект '${cel.title}'!`);
      });

      // Update user's celebratedProjects to permanently remove these celebrations
      setUsers((prev) =>
        prev.map((user) =>
          user.id === currentUser.id
            ? {
                ...user,
                celebratedProjects: [
                  ...(user.celebratedProjects || []),
                  ...pendingCelebrations.map((cel) => cel.projectId),
                ],
              }
            : user
        )
      );
    }
  }, [currentUser, projects]);

  if (!currentUser) {
    return (
      <div className="App">
        {/* Toast Container */}
        <div className="toast-container">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              title={toast.title}
              message={toast.message}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>

        <div className="welcome-screen">
          <h1>Welcome to Project Marketplace</h1>
          <div className="login-section">
            <div className="new-user">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter new username"
              />
              <button onClick={handleCreateUser}>Create New User</button>
            </div>
            <div className="existing-users">
              <h2>Existing Users</h2>
              <div className="users-list">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setCurrentUser(user)}
                    className="user-button"
                  >
                    {user.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <div className="app">
        <header>
          <h1>Project Marketplace</h1>
          <div className="user-info">
            Welcome, {currentUser.name}!
            <button onClick={() => setCurrentUser(null)}>Logout</button>
          </div>
        </header>

        <div className="create-project">
          <h2>Create New Project</h2>
          <div className="project-templates">
            <h3>Шаблоны проектов:</h3>
            <div className="templates-grid">
              {PROJECT_TEMPLATES.map((template, index) => (
                <button
                  key={index}
                  className="template-button"
                  onClick={() => {
                    setNewProjectTitle(template.title);
                    setNewProjectDescription(template.description);
                  }}
                >
                  {template.title}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            placeholder="Project Title"
          />
          <textarea
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
            placeholder="Project Description"
          />
          <button onClick={handleCreateProject}>Publish Project</button>
        </div>

        <div className="projects-list">
          <h2>All Projects</h2>
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <p>
                Author: {users.find((u) => u.id === project.authorId)?.name}
              </p>

              {project.authorId === currentUser.id ? (
                <div className="applications">
                  <h4>Applications:</h4>
                  {project.applications.map((applicantId) => {
                    const applicant = users.find((u) => u.id === applicantId);
                    return applicant ? (
                      <div key={applicantId} className="application">
                        <span>{applicant.name}</span>
                        <button
                          onClick={() =>
                            handleAcceptApplication(project.id, applicantId)
                          }
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleRejectApplication(project.id, applicantId)
                          }
                        >
                          Reject
                        </button>
                      </div>
                    ) : null;
                  })}
                  {(project.acceptedUsers?.length > 0 ||
                    project.rejectedUsers?.length > 0) && (
                    <div className="applications-status">
                      {project.acceptedUsers?.length > 0 && (
                        <div className="accepted-users">
                          <h4>Принятые участники:</h4>
                          {project.acceptedUsers.map((userId) => (
                            <div key={userId} className="status-item accepted">
                              ✅ {users.find((u) => u.id === userId)?.name}
                            </div>
                          ))}
                        </div>
                      )}
                      {project.rejectedUsers?.length > 0 && (
                        <div className="rejected-users">
                          <h4>Отклоненные заявки:</h4>
                          {project.rejectedUsers.map((userId) => (
                            <div key={userId} className="status-item rejected">
                              ❌ {users.find((u) => u.id === userId)?.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="project-status">
                  {project.acceptedUsers?.includes(currentUser.id) ? (
                    <div className="status-message accepted">
                      ✅ Вы приняты в проект!
                    </div>
                  ) : project.rejectedUsers?.includes(currentUser.id) ? (
                    <div className="status-message rejected">
                      ❌ Ваша заявка отклонена
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApplyToProject(project.id)}
                      disabled={project.applications.includes(currentUser.id)}
                    >
                      {project.applications.includes(currentUser.id)
                        ? "Applied"
                        : "I Want This!"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
