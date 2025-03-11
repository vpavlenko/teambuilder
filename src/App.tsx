import { useState, useEffect } from "react";
import "./App.css";

// Types
interface User {
  id: string;
  name: string;
  description: string;
}

interface Project {
  id: string;
  authorId: string;
  title: string;
  description: string;
  createdAt: number;
  applications: string[]; // array of user IDs who applied
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
  return stored ? JSON.parse(stored) : defaultValue;
};

const setToStorage = <T,>(key: string, value: T): void => {
  console.log(`Setting to storage [${key}]:`, value);
  localStorage.setItem(key, JSON.stringify(value));
};

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newUserName, setNewUserName] = useState("");
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedUsers = getFromStorage<User[]>(USERS_KEY, []);
    const storedProjects = getFromStorage<Project[]>(PROJECTS_KEY, []);
    const storedCurrentUser = getFromStorage<User | null>(
      CURRENT_USER_KEY,
      null
    );

    console.log("Initial load from storage:", {
      storedUsers,
      storedProjects,
      storedCurrentUser,
    });

    setUsers(storedUsers);
    setProjects(storedProjects);
    setCurrentUser(storedCurrentUser);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    setToStorage(USERS_KEY, users);
  }, [users]);

  useEffect(() => {
    setToStorage(PROJECTS_KEY, projects);
  }, [projects]);

  useEffect(() => {
    setToStorage(CURRENT_USER_KEY, currentUser);
  }, [currentUser]);

  const handleCreateUser = () => {
    if (!newUserName.trim()) return;

    const newUser: User = {
      id: Date.now().toString(),
      name: newUserName.trim(),
      description: "",
    };

    console.log("Creating new user:", newUser);
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
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
    };

    setProjects([...projects, newProject]);
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
    // In this simple version, we'll just remove the application
    // In a real app, you might want to move it to an "accepted" array
    setProjects(
      projects.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            applications: project.applications.filter((id) => id !== userId),
          };
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
          };
        }
        return project;
      })
    );
  };

  if (!currentUser) {
    return (
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
    );
  }

  return (
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
            <p>Author: {users.find((u) => u.id === project.authorId)?.name}</p>

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
        ))}
      </div>
    </div>
  );
}

export default App;
