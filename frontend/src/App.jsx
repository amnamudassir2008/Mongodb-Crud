import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./pages/Auth.css";
import "./App.css";

/* =========================================================
   Students API
   Backend: /api/students
   JWT token zaroori
   ========================================================= */

const STUDENTS_API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/students";

const getToken = () =>
  localStorage.getItem("auth_token") ||
  sessionStorage.getItem("auth_token") ||
  "";

async function studentsRequest(
  path = "",
  { method = "GET", body } = {}
) {
  let res;

  try {
    res = await fetch(`${STUDENTS_API}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Server se connect nahi ho paaya.");
  }

  let data = null;

  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON response */
  }

  if (!res.ok) {
    const err = new Error(
      data?.message ||
        data?.error ||
        `Request failed (${res.status})`
    );

    err.status = res.status;
    throw err;
  }

  return data;
}

const friendlyError = (msg = "") =>
  /E11000|duplicate/i.test(msg)
    ? "Ye email pehle se maujood hai."
    : msg;

const COURSE_COLORS = [
  "#ff4f8b",
  "#22d3ee",
  "#22e58f",
  "#ffb020",
  "#8b7cf6",
  "#3b82f6",
];

const EMPTY_FORM = {
  name: "",
  email: "",
  age: "",
  course: "",
};

const initialOf = (name) =>
  (name || "?").trim().charAt(0).toUpperCase();

/* =========================================================
   Dashboard
   ========================================================= */

function Dashboard({ user, onLogout }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);

  const formRef = useRef(null);

  /* ---------------------------------------------------------
     Toast
     --------------------------------------------------------- */

  const showToast = useCallback((type, text) => {
    setToast({ type, text });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;

    const t = setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => clearTimeout(t);
  }, [toast]);

  /* ---------------------------------------------------------
     API Error
     --------------------------------------------------------- */

  const handleApiError = useCallback(
    (err) => {
      if (err?.status === 401) {
        onLogout("Session expire ho gaya. Dobara login karein.");
        return true;
      }

      return false;
    },
    [onLogout]
  );

  /* ---------------------------------------------------------
     Load Students
     --------------------------------------------------------- */

  const loadStudents = useCallback(async () => {
    setLoading(true);

    try {
      const data = await studentsRequest();

      const list = Array.isArray(data)
        ? data
        : data?.students || data?.data || [];

      setStudents(list);
    } catch (err) {
      if (!handleApiError(err)) {
        showToast(
          "error",
          friendlyError(
            err?.message || "Students load nahi ho sake."
          )
        );
      }
    } finally {
      setLoading(false);
    }
  }, [handleApiError, showToast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  /* ---------------------------------------------------------
     Search
     --------------------------------------------------------- */

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return students;

    return students.filter((student) => {
      return (
        student?.name?.toLowerCase().includes(q) ||
        student?.email?.toLowerCase().includes(q) ||
        student?.course?.toLowerCase().includes(q)
      );
    });
  }, [students, query]);

  /* ---------------------------------------------------------
     Form
     --------------------------------------------------------- */

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  };

  const openEditForm = (student) => {
    setEditId(student._id || student.id);

    setForm({
      name: student.name || "",
      email: student.email || "",
      age: student.age ?? "",
      course: student.course || "",
    });

    setFormError("");
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  /* ---------------------------------------------------------
     Save Student
     --------------------------------------------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");

    if (!form.name.trim()) {
      setFormError("Name required hai.");
      return;
    }

    if (!form.email.trim()) {
      setFormError("Email required hai.");
      return;
    }

    if (!form.course.trim()) {
      setFormError("Course required hai.");
      return;
    }

    setSaving(true);

    try {
      const body = {
        name: form.name.trim(),
        email: form.email.trim(),
        age: form.age === "" ? undefined : Number(form.age),
        course: form.course.trim(),
      };

      let result;

      if (editId) {
        result = await studentsRequest(`/${editId}`, {
          method: "PUT",
          body,
        });

        showToast("success", "Student successfully update ho gaya.");
      } else {
        result = await studentsRequest("", {
          method: "POST",
          body,
        });

        showToast("success", "Student successfully add ho gaya.");
      }

      const updatedStudent =
        result?.student || result?.data || result;

      if (editId) {
        setStudents((prev) =>
          prev.map((student) =>
            (student._id || student.id) === editId
              ? updatedStudent
              : student
          )
        );
      } else {
        setStudents((prev) => [
          updatedStudent,
          ...prev,
        ]);
      }

      closeForm();
    } catch (err) {
      if (!handleApiError(err)) {
        const message = friendlyError(
          err?.message || "Student save nahi ho saka."
        );

        setFormError(message);
      }
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------
     Delete Student
     --------------------------------------------------------- */

  const confirmDelete = async () => {
    if (!toDelete) return;

    const id = toDelete._id || toDelete.id;

    setDeleting(true);

    try {
      await studentsRequest(`/${id}`, {
        method: "DELETE",
      });

      setStudents((prev) =>
        prev.filter(
          (student) =>
            (student._id || student.id) !== id
        )
      );

      showToast(
        "success",
        "Student successfully delete ho gaya."
      );

      setToDelete(null);
    } catch (err) {
      if (!handleApiError(err)) {
        showToast(
          "error",
          friendlyError(
            err?.message || "Student delete nahi ho saka."
          )
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------------------------------------------------
     Logout
     --------------------------------------------------------- */

  const handleLogout = () => {
    onLogout();
  };

  /* ---------------------------------------------------------
     Dashboard UI
     --------------------------------------------------------- */

  return (
    <div className="dashboard">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Student Management</h1>
          <p>
            Welcome,{" "}
            <strong>
              {user?.name || user?.username || "User"}
            </strong>
          </p>
        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      {/* Main */}
      <main className="dashboard-main">

        {/* Controls */}
        <div className="dashboard-controls">

          <input
            type="text"
            placeholder="Search students..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />

          <button
            type="button"
            className="add-student-btn"
            onClick={openAddForm}
          >
            + Add Student
          </button>

        </div>

        {/* Form */}
        {showForm && (
          <div
            className="student-form-card"
            ref={formRef}
          >
            <div className="form-header">
              <h2>
                {editId
                  ? "Edit Student"
                  : "Add Student"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                className="close-btn"
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="error-message">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <input
                  type="text"
                  name="name"
                  placeholder="Student Name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                />

                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={form.age}
                  onChange={handleFormChange}
                  min="1"
                />

                <input
                  type="text"
                  name="course"
                  placeholder="Course"
                  value={form.course}
                  onChange={handleFormChange}
                  required
                />

              </div>

              <div className="form-actions">

                <button
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editId
                    ? "Update Student"
                    : "Add Student"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

              </div>
            </form>
          </div>
        )}

        {/* Students */}
        <section className="students-section">

          <div className="section-heading">
            <h2>Students</h2>

            <span>
              {filteredStudents.length} student
              {filteredStudents.length !== 1
                ? "s"
                : ""}
            </span>
          </div>

          {loading ? (
            <div className="loading-state">
              Loading students...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="empty-state">
              <h3>No students found</h3>

              <p>
                {query
                  ? "Search ko change karke dobara try karein."
                  : "Abhi koi student available nahi hai."}
              </p>
            </div>
          ) : (
            <div className="students-grid">

              {filteredStudents.map(
                (student, index) => {
                  const id =
                    student._id || student.id;

                  const color =
                    COURSE_COLORS[
                      index % COURSE_COLORS.length
                    ];

                  return (
                    <article
                      className="student-card"
                      key={id || index}
                    >

                      <div
                        className="student-avatar"
                        style={{
                          backgroundColor: color,
                        }}
                      >
                        {initialOf(student.name)}
                      </div>

                      <div className="student-info">

                        <h3>
                          {student.name ||
                            "Unnamed Student"}
                        </h3>

                        <p>
                          {student.email || "No email"}
                        </p>

                        {student.age !==
                          undefined &&
                          student.age !== null &&
                          student.age !== "" && (
                            <p>
                              Age: {student.age}
                            </p>
                          )}

                        <span className="course-badge">
                          {student.course ||
                            "No course"}
                        </span>

                      </div>

                      <div className="student-actions">

                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(student)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() =>
                            setToDelete(student)
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>

      </main>

      {/* Delete Modal */}
      {toDelete && (
        <div className="modal-overlay">

          <div className="confirm-modal">

            <h2>Delete Student?</h2>

            <p>
              Kya aap{" "}
              <strong>
                {toDelete.name}
              </strong>{" "}
              ko delete karna chahte hain?
            </p>

            <div className="modal-actions">

              <button
                type="button"
                onClick={() => setToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-btn"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`toast ${
            toast.type === "error"
              ? "toast-error"
              : "toast-success"
          }`}
        >
          {toast.text}
        </div>
      )}

    </div>
  );
}

/* =========================================================
   App
   ========================================================= */

export default function App() {
  const [user, setUser] = useState(() => {
    const saved =
      localStorage.getItem("auth_user") ||
      sessionStorage.getItem("auth_user");

    if (!saved) return null;

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState("login");
  const [notice, setNotice] = useState("");
  const [initialEmail, setInitialEmail] =
    useState("");

  const handleLoginSuccess = useCallback(
    (data, remember) => {
      const token =
        data?.token ||
        data?.accessToken ||
        data?.jwt;

      const loggedUser =
        data?.user ||
        data?.data?.user ||
        data?.data ||
        null;

      if (!token) {
        console.error(
          "Login response mein token nahi mila:",
          data
        );

        setNotice(
          "Login successful hua lekin token nahi mila."
        );

        return;
      }

      const storage = remember
        ? localStorage
        : sessionStorage;

      storage.setItem("auth_token", token);

      if (loggedUser) {
        storage.setItem(
          "auth_user",
          JSON.stringify(loggedUser)
        );
      }

      setUser(loggedUser || {});
      setNotice("");
    },
    []
  );

  const handleSignupSuccess = useCallback(
    (email) => {
      setInitialEmail(email);
      setAuthMode("login");

      setNotice(
        "Account successfully create ho gaya. Ab login karein."
      );
    },
    []
  );

  const handleLogout = useCallback(
    (message = "") => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_user");

      setUser(null);
      setAuthMode("login");

      if (message) {
        setNotice(message);
      }
    },
    []
  );

  if (user) {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  if (authMode === "signup") {
    return (
      <Signup
        onSwitch={() => {
          setAuthMode("login");
          setNotice("");
        }}
        onSuccess={handleSignupSuccess}
      />
    );
  }

  return (
    <Login
      onSwitch={() => {
        setAuthMode("signup");
        setNotice("");
      }}
      onSuccess={handleLoginSuccess}
      notice={notice}
      initialEmail={initialEmail}
    />
  );
}