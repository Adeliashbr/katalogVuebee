import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  AlertCircle,
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import {
  loginAdmin,
  setAuthToken,
  fetchAdminDemoInfo,
  requestPasswordReset,
  resetPasswordWithToken,
} from "../services/api";
import { VubeeLogo } from "./VubeeLogo";

export const AdminLoginModal = ({ isOpen, onClose, onSuccess }) => {
  // Views: 'login' | 'forgot' | 'reset'
  const [view, setView] = useState("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot password state
  const [resetEmail, setResetEmail] = useState("");

  // Reset password state
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status feedback
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Active admin info in database for helper/demo
  const [demoEmail, setDemoEmail] = useState("admin@katalogwa.com");

  useEffect(() => {
    if (!isOpen) {
      setView("login");
      setErrorMsg("");
      setSuccessMsg("");
      return undefined;
    }

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open-locked");

    // Fetch demo info from DB to avoid mismatched credentials
    fetchAdminDemoInfo()
      .then((res) => {
        if (res?.email) setDemoEmail(res.email);
      })
      .catch(() => {});

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open-locked");
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFillDemo = () => {
    setEmail(demoEmail);
    setPassword("admin123");
    setErrorMsg("");
    setSuccessMsg("");
  };

  // 1. Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Email dan Password wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginAdmin(email.trim(), password);
      setAuthToken(result.token);
      onSuccess(result.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Email atau Password salah.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Forgot Password Request
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const targetEmail = (resetEmail || email).trim();
    if (!targetEmail) {
      setErrorMsg("Email administrator wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordReset(targetEmail);
      if (res?.resetToken) {
        setResetToken(res.resetToken);
        setSuccessMsg(
          "Permintaan reset berhasil diverifikasi. Silakan masukkan kata sandi baru.",
        );
        setView("reset");
      } else {
        setSuccessMsg(
          res?.message ||
            "Permintaan reset telah disiapkan. Silakan periksa instruksi pemulihan.",
        );
      }
    } catch (err) {
      setErrorMsg(err.message || "Gagal memproses permintaan reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Submit Reset Password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!resetToken.trim()) {
      setErrorMsg("Token reset password wajib diisi.");
      return;
    }

    if (!newPassword) {
      setErrorMsg("Password baru wajib diisi.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("Password baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi password baru tidak cocok.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordWithToken({
        token: resetToken.trim(),
        newPassword,
        confirmPassword,
      });

      setSuccessMsg(
        res?.message ||
          "Password berhasil diperbarui. Silakan login menggunakan password baru.",
      );
      // Switch back to login view with updated email
      if (res?.email) {
        setEmail(res.email);
      } else if (resetEmail) {
        setEmail(resetEmail);
      }
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");
      setView("login");
    } catch (err) {
      setErrorMsg(err.message || "Gagal mereset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay-backdrop" onClick={onClose}>
      <div
        className="modal-luxury-window animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "440px",
          background: "#FFFFFF",
          maxHeight: "none",
          overflowY: "visible",
        }}
      >
        {/* Tombol tutup — menempel di sudut kartu (satu modal utuh) */}
        <button
          type="button"
          className="modal-close-icon-btn"
          onClick={onClose}
          title="Tutup"
          aria-label="Tutup modal login"
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            zIndex: 2,
          }}
        >
          <X size={18} />
        </button>

        {/* Logo — bagian dari isi modal, bukan bar terpisah */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "1.5rem 1.5rem 0",
          }}
        >
          <VubeeLogo height={40} variant="dark" />
        </div>

        {/* ============================================================== */}
        {/* VIEW 1: LOGIN FORM                                            */}
        {/* ============================================================== */}
        {view === "login" && (
          <form onSubmit={handleLoginSubmit}>
            <div className="modal-inner-body" style={{ paddingTop: "0.25rem" }}>
              <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.45rem",
                    fontWeight: 700,
                    color: "var(--color-primary)",
                    marginBottom: "0.35rem",
                  }}
                >
                  Login Admin
                </h2>
                <p
                  style={{
                    fontSize: "0.84rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Masuk untuk mengelola katalog produk dan pengaturan toko
                  Vuebee.
                </p>
              </div>

              {successMsg && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.75rem 0.9rem",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--color-success-bg)",
                    color: "var(--color-success)",
                    fontSize: "0.84rem",
                    marginBottom: "1rem",
                  }}
                  className="animate-fade-in"
                >
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="form-alert-error animate-fade-in">
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="form-group-item">
                <label className="form-label-title" htmlFor="admin-email-input">
                  Alamat Email
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="admin-email-input"
                    type="email"
                    className="form-input-control"
                    placeholder="admin@katalogwa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: "2.5rem" }}
                    autoFocus
                    required
                  />
                  <Mail
                    size={16}
                    style={{
                      position: "absolute",
                      left: "0.9rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-text-muted)",
                    }}
                  />
                </div>
              </div>

              <div className="form-group-item">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label
                    className="form-label-title"
                    htmlFor="admin-password-input"
                  >
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setErrorMsg("");
                      setSuccessMsg("");
                      setView("forgot");
                    }}
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--color-accent-hover)",
                      fontWeight: 600,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      marginBottom: "0.35rem",
                      textDecoration: "underline",
                    }}
                  >
                    Lupa Password?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    id="admin-password-input"
                    type={showLoginPassword ? "text" : "password"}
                    className="form-input-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                    required
                  />
                  <KeyRound
                    size={16}
                    style={{
                      position: "absolute",
                      left: "0.9rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-text-muted)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{
                      position: "absolute",
                      right: "0.8rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-text-muted)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label={
                      showLoginPassword
                        ? "Sembunyikan password"
                        : "Lihat password"
                    }
                    tabIndex={-1}
                  >
                    {showLoginPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  marginTop: "0.5rem",
                }}
                disabled={isLoading}
              >
                <span>
                  {isLoading ? "Memverifikasi..." : "Masuk ke Dashboard"}
                </span>
                <ArrowRight size={16} />
              </button>

              {/* Quick Demo Fill */}
              <div
                style={{
                  marginTop: "1.25rem",
                  padding: "0.85rem",
                  backgroundColor: "var(--color-surface-subtle)",
                  borderRadius: "var(--radius-md)",
                  border: "1px dashed var(--color-border)",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.4rem",
                  }}
                >
                  Akun administrator terdaftar:
                </p>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--color-accent)",
                    fontWeight: 700,
                    textDecoration: "underline",
                  }}
                >
                  Klik untuk mengisi otomatis ({demoEmail} / admin123)
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: FORGOT PASSWORD REQUEST                                */}
        {/* ============================================================== */}
        {view === "forgot" && (
          <form onSubmit={handleForgotSubmit}>
            <div className="modal-inner-body" style={{ paddingTop: "0.25rem" }}>
              <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-accent-light)",
                    color: "var(--color-accent-hover)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}
                >
                  <KeyRound size={22} />
                </div>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.45rem",
                    fontWeight: 700,
                    color: "var(--color-primary)",
                    marginBottom: "0.35rem",
                  }}
                >
                  Reset Password Admin
                </h2>
                <p
                  style={{
                    fontSize: "0.84rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Masukkan email administrator yang terdaftar untuk memulihkan
                  akses akun Anda.
                </p>
              </div>

              {errorMsg && (
                <div className="form-alert-error animate-fade-in">
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="form-group-item">
                <label
                  className="form-label-title"
                  htmlFor="forgot-email-input"
                >
                  Email Admin
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="forgot-email-input"
                    type="email"
                    className="form-input-control"
                    placeholder="admin@katalogwa.com"
                    value={resetEmail || email}
                    onChange={(e) => setResetEmail(e.target.value)}
                    style={{ paddingLeft: "2.5rem" }}
                    autoFocus
                    required
                  />
                  <Mail
                    size={16}
                    style={{
                      position: "absolute",
                      left: "0.9rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-text-muted)",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  marginTop: "0.75rem",
                }}
                disabled={isLoading}
              >
                <span>
                  {isLoading
                    ? "Memproses..."
                    : "Kirim Permintaan Reset Password"}
                </span>
                <ArrowRight size={16} />
              </button>

              <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setSuccessMsg("");
                    setView("login");
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Kembali ke Halaman Login</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: SET NEW PASSWORD FORM                                  */}
        {/* ============================================================== */}
        {view === "reset" && (
          <form onSubmit={handleResetSubmit}>
            <div className="modal-inner-body" style={{ paddingTop: "0.25rem" }}>
              <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-surface-subtle)",
                    color: "var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}
                >
                  <ShieldCheck size={24} />
                </div>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.45rem",
                    fontWeight: 700,
                    color: "var(--color-primary)",
                    marginBottom: "0.35rem",
                  }}
                >
                  Buat Password Baru
                </h2>
                <p
                  style={{
                    fontSize: "0.84rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Masukkan kata sandi baru untuk akun administrator Anda.
                </p>
              </div>

              {successMsg && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.75rem 0.9rem",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--color-success-bg)",
                    color: "var(--color-success)",
                    fontSize: "0.84rem",
                    marginBottom: "1rem",
                  }}
                  className="animate-fade-in"
                >
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="form-alert-error animate-fade-in">
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="form-group-item">
                <label
                  className="form-label-title"
                  htmlFor="new-password-input"
                >
                  Password Baru
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="new-password-input"
                    type={showNewPassword ? "text" : "password"}
                    className="form-input-control"
                    placeholder="Minimal 8 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                    required
                    minLength={8}
                    autoFocus
                  />
                  <KeyRound
                    size={16}
                    style={{
                      position: "absolute",
                      left: "0.9rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-text-muted)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: "absolute",
                      right: "0.8rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-text-muted)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label={
                      showNewPassword
                        ? "Sembunyikan password"
                        : "Lihat password"
                    }
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group-item">
                <label
                  className="form-label-title"
                  htmlFor="confirm-password-input"
                >
                  Konfirmasi Password Baru
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="confirm-password-input"
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-input-control"
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                    required
                    minLength={8}
                  />
                  <KeyRound
                    size={16}
                    style={{
                      position: "absolute",
                      left: "0.9rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-text-muted)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: "0.8rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-text-muted)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label={
                      showConfirmPassword
                        ? "Sembunyikan password"
                        : "Lihat password"
                    }
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  marginTop: "0.75rem",
                }}
                disabled={isLoading}
              >
                <span>
                  {isLoading ? "Menyimpan..." : "Simpan Password Baru"}
                </span>
                <ArrowRight size={16} />
              </button>

              <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setSuccessMsg("");
                    setView("login");
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Batal dan Kembali ke Login</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLoginModal;
