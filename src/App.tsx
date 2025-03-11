import { useState, useEffect } from "react";
import "./App.css";
import {
  usersCollection,
  projectsCollection,
  getFromFirestore,
  setToFirestore,
  updateInFirestore,
} from "./firebaseCredentials";
import { User, Project } from "./types";

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

// User Profile component
interface UserProfileProps {
  user: User;
  isEditing?: boolean;
  onEdit?: (updatedUser: User) => void;
}

function UserProfile({ user, isEditing, onEdit }: UserProfileProps) {
  const [editedName, setEditedName] = useState(user.name);
  const [editedDescription, setEditedDescription] = useState(user.description);

  if (!isEditing) {
    return (
      <div className="user-profile">
        <div className="user-name">{user.name}</div>
        {user.description && (
          <div className="user-description">{user.description}</div>
        )}
      </div>
    );
  }

  return (
    <div className="user-profile editing">
      <input
        type="text"
        value={editedName}
        onChange={(e) => setEditedName(e.target.value)}
        placeholder="Your name"
      />
      <textarea
        value={editedDescription}
        onChange={(e) => setEditedDescription(e.target.value)}
        placeholder="Tell us about yourself..."
      />
      <button
        onClick={() =>
          onEdit?.({
            ...user,
            name: editedName.trim(),
            description: editedDescription.trim(),
          })
        }
      >
        Save Profile
      </button>
    </div>
  );
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

function App() {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newUserName, setNewUserName] = useState("");
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Toast state
  const [toasts, setToasts] = useState<
    { id: string; title: string; message: string }[]
  >([]);

  // Add state to track celebrations shown in the current session
  const [sessionCelebrations, setSessionCelebrations] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedUsers = await getFromFirestore<User>(usersCollection);
        const loadedProjects = await getFromFirestore<Project>(
          projectsCollection
        );
        setUsers(loadedUsers);
        setProjects(loadedProjects);
      } catch (error) {
        console.error("Error loading data:", error);
        addToast("Error", "Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Function to add a toast
  const addToast = (title: string, message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message }]);
  };

  // Function to remove a toast
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleCreateUser = async () => {
    if (!newUserName.trim()) return;

    const newUser: User = {
      id: Date.now().toString(),
      name: newUserName.trim(),
      description: "",
      celebratedProjects: [],
    };

    try {
      await setToFirestore(usersCollection, newUser);
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      setNewUserName("");
    } catch (error) {
      console.error("Error creating user:", error);
      addToast("Error", "Failed to create user. Please try again.");
    }
  };

  const handleCreateProject = async () => {
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

    try {
      await setToFirestore(projectsCollection, newProject);
      setProjects((prev) => [...prev, newProject]);
      setNewProjectTitle("");
      setNewProjectDescription("");
    } catch (error) {
      console.error("Error creating project:", error);
      addToast("Error", "Failed to create project. Please try again.");
    }
  };

  const handleApplyToProject = async (projectId: string) => {
    if (!currentUser) return;

    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const updatedProject = {
      ...project,
      applications: [...project.applications, currentUser.id],
    };

    try {
      await updateInFirestore(projectsCollection, updatedProject);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? updatedProject : p))
      );
    } catch (error) {
      console.error("Error applying to project:", error);
      addToast("Error", "Failed to apply to project. Please try again.");
    }
  };

  const handleAcceptApplication = async (projectId: string, userId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const updatedProject = {
      ...project,
      applications: project.applications.filter((id) => id !== userId),
      acceptedUsers: [...project.acceptedUsers, userId],
    };

    try {
      await updateInFirestore(projectsCollection, updatedProject);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? updatedProject : p))
      );
    } catch (error) {
      console.error("Error accepting application:", error);
      addToast("Error", "Failed to accept application. Please try again.");
    }
  };

  const handleRejectApplication = async (projectId: string, userId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const updatedProject = {
      ...project,
      applications: project.applications.filter((id) => id !== userId),
      rejectedUsers: [...project.rejectedUsers, userId],
    };

    try {
      await updateInFirestore(projectsCollection, updatedProject);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? updatedProject : p))
      );
    } catch (error) {
      console.error("Error rejecting application:", error);
      addToast("Error", "Failed to reject application. Please try again.");
    }
  };

  const handleUpdateProfile = async (updatedUser: User) => {
    try {
      await updateInFirestore(usersCollection, updatedUser);
      setUsers((prev) =>
        prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
      setCurrentUser(updatedUser);
      setIsEditingProfile(false);
      addToast("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      addToast("Error", "Failed to update profile. Please try again.");
    }
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
        pendingCelebrations.push({
          projectId: project.id,
          title: project.title,
        });
      }
    });

    if (pendingCelebrations.length > 0) {
      setSessionCelebrations((prev) => [
        ...prev,
        ...pendingCelebrations.map((cel) => cel.projectId),
      ]);

      pendingCelebrations.forEach((cel) => {
        addToast("Поздравляем!", `Вас приняли в проект '${cel.title}'!`);
      });

      const updatedUser = {
        ...currentUser,
        celebratedProjects: [
          ...currentUser.celebratedProjects,
          ...pendingCelebrations.map((cel) => cel.projectId),
        ],
      };

      updateInFirestore(usersCollection, updatedUser)
        .then(() => {
          setUsers((prev) =>
            prev.map((user) =>
              user.id === currentUser.id ? updatedUser : user
            )
          );
        })
        .catch((error) => {
          console.error("Error updating user celebrations:", error);
        });
    }
  }, [currentUser, projects]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

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
            {isEditingProfile ? (
              <UserProfile
                user={currentUser}
                isEditing={true}
                onEdit={handleUpdateProfile}
              />
            ) : (
              <>
                <UserProfile user={currentUser} />
                <button onClick={() => setIsEditingProfile(true)}>
                  Edit Profile
                </button>
                <button onClick={() => setCurrentUser(null)}>Logout</button>
              </>
            )}
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
                        <UserProfile user={applicant} />
                        <div className="application-actions">
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
