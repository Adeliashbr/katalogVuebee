import React, { useState, useEffect, useRef } from "react";
import {
  UserRound,
  ShieldCheck,
  Camera,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  fetchAdminProfile,
  updateAdminProfile,
  uploadAdminAvatar,
  deleteAdminAvatar,
  updateAdminPassword,
  setAuthToken,
} from "../services/api";

export const AdminProfileView = ({
  adminUser,
  onUpdateAdminUser,
  showFeedback = () => {},
}) => {
  // Safe fallback default data
  const fallbackUser = {
    name: "Administrator Vuebee",
    email: "admin@katalogwa.com",
    avatar: null,
  };

  const [currentAdmin, setCurrentAdmin] = useState(adminUser || fallbackUser);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState("");

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: adminUser?.name || fallbackUser.name,
    email: adminUser?.email || fallbackUser.email,
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Avatar states
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  // Password states
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Synchronize when adminUser prop changes
  useEffect(() => {
    if (adminUser) {
      setCurrentAdmin(adminUser);
      setProfileForm({
        name: adminUser.name || fallbackUser.name,
        email: adminUser.email || fallbackUser.email,
      });
    }
  }, [adminUser]);

  // Fetch fresh profile on mount to guarantee up-to-date data from DB
  const loadFreshProfile = async () => {
    setIsLoadingProfile(true);
    setProfileLoadError("");
    try {
      const res = await fetchAdminProfile();
      if (res?.user) {
        setCurrentAdmin(res.user);
        setProfileForm({
          name: res.user.name || fallbackUser.name,
          email: res.user.email || fallbackUser.email,
        });
        onUpdateAdminUser?.(res.user);
      }
    } catch (err) {
      console.warn("Gagal memuat profil admin terbaru dari backend:", err);
      setProfileLoadError(
        "Koneksi backend belum stabil. Menampilkan data profil lokal.",
      );
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    loadFreshProfile();
  }, []);

  // Cleanup object URL preview
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // --- Avatar Handling ---
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi Ukuran File (Maksimal 2 MB / 2.097.152 bytes)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showFeedback("error", "Ukuran foto maksimal 2 MB. Silakan pilih gambar lain.");
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      return;
    }

    // Validasi format/ekstensi dan MIME type (PNG, JPG, JPEG, WebP)
    const allowedExtensions = /\.(png|jpe?g|webp)$/i;
    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const extOk = allowedExtensions.test(file.name);
    const mimeOk = allowedMimeTypes.includes(file.type.toLowerCase());

    if (!extOk || !mimeOk) {
      showFeedback(
        "error",
        "Format gambar tidak didukung. Gunakan PNG, JPG, JPEG, atau WebP.",
      );
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      return;
    }

    // Tampilkan pratinjau lokal instan
    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setIsUploadingAvatar(true);

    try {
      const res = await uploadAdminAvatar(file);
      if (res?.user) {
        setCurrentAdmin(res.user);
        onUpdateAdminUser?.(res.user);
      }
      showFeedback("success", res?.message || "Foto profil berhasil diperbarui");
    } catch (err) {
      showFeedback("error", err?.message || "Gagal mengunggah foto profil");
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
      setSelectedAvatarFile(null);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus foto profil dan kembali ke avatar default?",
      )
    ) {
      return;
    }

    setIsDeletingAvatar(true);
    try {
      const res = await deleteAdminAvatar();
      if (res?.user) {
        setCurrentAdmin(res.user);
        onUpdateAdminUser?.(res.user);
      }
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(null);
      setSelectedAvatarFile(null);
      showFeedback("success", res?.message || "Foto profil berhasil dihapus");
    } catch (err) {
      showFeedback("error", err?.message || "Gagal menghapus foto profil");
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  // --- Profile Save (Nama & Email) ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const trimmedName = (profileForm.name || "").trim();
    const trimmedEmail = (profileForm.email || "").trim();

    if (!trimmedName) {
      showFeedback("error", "Nama administrator tidak boleh kosong.");
      return;
    }

    if (!trimmedEmail) {
      showFeedback("error", "Email admin tidak boleh kosong.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showFeedback(
        "error",
        "Format email tidak valid. Gunakan alamat email yang benar.",
      );
      return;
    }

    if (
      trimmedName === currentAdmin?.name &&
      trimmedEmail.toLowerCase() === (currentAdmin?.email || "").toLowerCase()
    ) {
      showFeedback("error", "Tidak ada perubahan data profil.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await updateAdminProfile({
        name: trimmedName,
        email: trimmedEmail,
      });

      if (res?.token) {
        setAuthToken(res.token);
      }

      if (res?.user) {
        setCurrentAdmin(res.user);
        onUpdateAdminUser?.(res.user);
      }

      showFeedback("success", res?.message || "Profil admin berhasil diperbarui");
    } catch (err) {
      showFeedback("error", err?.message || "Gagal memperbarui profil admin");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Password Change ---
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordForm.oldPassword) {
      showFeedback("error", "Password lama wajib diisi.");
      return;
    }

    if (!passwordForm.newPassword) {
      showFeedback("error", "Password baru wajib diisi.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showFeedback("error", "Password baru minimal 8 karakter.");
      return;
    }

    if (passwordForm.newPassword === passwordForm.oldPassword) {
      showFeedback(
        "error",
        "Password baru tidak boleh sama dengan password lama.",
      );
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showFeedback("error", "Konfirmasi password baru tidak cocok.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await updateAdminPassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showFeedback("success", res?.message || "Password admin berhasil diperbarui");
    } catch (err) {
      showFeedback("error", err?.message || "Gagal mengubah password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="profile-tab animate-fade-in">
      <p className="admin-page-desc profile-desc">
        Kelola informasi akun, foto profil, dan keamanan akun administrator toko Vuebee.
      </p>

      {/* Warning jika data gagal dimuat dari server */}
      {profileLoadError && (
        <div
          style={{
            maxWidth: "760px",
            width: "100%",
            marginBottom: "1.25rem",
            padding: "0.85rem 1.1rem",
            backgroundColor: "var(--color-warning-bg)",
            color: "var(--color-warning)",
            border: "1px solid #FDE68A",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.86rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <AlertCircle size={18} />
            <span>{profileLoadError}</span>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadFreshProfile}
            disabled={isLoadingProfile}
            style={{ fontSize: "0.78rem", padding: "0.25rem 0.6rem" }}
          >
            <RefreshCw
              size={12}
              className={isLoadingProfile ? "animate-spin" : ""}
            />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      <div className="profile-grid">
        {/* ============================================================== */}
        {/* CARD 1: INFORMASI AKUN ADMIN (ATAS)                           */}
        {/* ============================================================== */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="profile-badge">
              <UserRound size={14} />
              Informasi Akun
            </span>
            <h2>Informasi Akun Admin</h2>
            <p>
              Perbarui foto profil, nama administrator, dan email yang digunakan untuk masuk ke dashboard.
            </p>
          </div>

          {/* Bagian Atas Card: Avatar lingkaran, Nama, Email, Tombol Ganti Foto */}
          <div className="profile-user-overview">
            <div className="profile-avatar-wrapper">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Pratinjau Foto Profil"
                  className="profile-avatar-img"
                />
              ) : currentAdmin?.avatar ? (
                <img
                  src={currentAdmin.avatar}
                  alt={currentAdmin?.name || "Foto Profil Admin"}
                  className="profile-avatar-img"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {(currentAdmin?.name || "A").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="profile-user-identity">
              <h3 className="profile-admin-display-name">
                {currentAdmin?.name || "Administrator Vuebee"}
              </h3>
              <span className="profile-admin-display-email">
                {currentAdmin?.email || "admin@katalogwa.com"}
              </span>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              style={{ display: "none" }}
            />

            <div className="profile-avatar-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar || isDeletingAvatar}
              >
                <Camera size={14} />
                <span>
                  {isUploadingAvatar ? "Mengunggah Foto..." : "Ganti Foto Profil"}
                </span>
              </button>

              {currentAdmin?.avatar && (
                <button
                  type="button"
                  className="btn btn-danger-soft btn-sm"
                  onClick={handleDeleteAvatar}
                  disabled={isUploadingAvatar || isDeletingAvatar}
                >
                  <Trash2 size={14} />
                  <span>
                    {isDeletingAvatar ? "Menghapus..." : "Hapus Foto"}
                  </span>
                </button>
              )}
            </div>

            <p className="profile-avatar-hint">
              Format: PNG, JPG, JPEG, atau WebP. Maksimal 2 MB.
            </p>
          </div>

          {/* Form: Nama Admin & Email Admin */}
          <form onSubmit={handleSaveProfile} className="profile-form-body">
            <div>
              <label className="form-label-title">Nama Admin</label>
              <input
                type="text"
                className="form-input-control"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                placeholder="Nama Administrator"
                required
              />
            </div>

            <div>
              <label className="form-label-title">Email Admin (Gmail)</label>
              <input
                type="email"
                className="form-input-control"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
                placeholder="admin@gmail.com"
                required
              />
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--color-text-muted)",
                  marginTop: "0.35rem",
                }}
              >
                Email ini digunakan sebagai akun autentikasi login administrator toko Vuebee.
              </p>
            </div>

            <div style={{ marginTop: "0.5rem" }}>
              <button
                type="submit"
                className="btn btn-primary profile-submit-btn"
                disabled={isSavingProfile}
              >
                <Save size={16} />
                <span>
                  {isSavingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* ============================================================== */}
        {/* CARD 2: KEAMANAN AKUN (BAWAH)                                 */}
        {/* ============================================================== */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="profile-badge">
              <ShieldCheck size={14} />
              Keamanan Akun
            </span>
            <h2>Keamanan Akun</h2>
            <p>
              Perbarui kata sandi akun administrator untuk menjaga keamanan toko Vuebee.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="profile-form-body">
            <div>
              <label className="form-label-title">Password Lama</label>
              <div className="password-input-group">
                <input
                  type={showOldPassword ? "text" : "password"}
                  className="form-input-control"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      oldPassword: e.target.value,
                    })
                  }
                  placeholder="Masukkan password saat ini"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  aria-label={
                    showOldPassword ? "Sembunyikan password" : "Lihat password"
                  }
                  tabIndex={-1}
                >
                  {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="form-label-title">Password Baru</label>
              <div className="password-input-group">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="form-input-control"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Minimal 8 karakter"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={
                    showNewPassword ? "Sembunyikan password" : "Lihat password"
                  }
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--color-text-muted)",
                  marginTop: "0.35rem",
                }}
              >
                Password baru minimal 8 karakter.
              </p>
            </div>

            <div>
              <label className="form-label-title">Konfirmasi Password Baru</label>
              <div className="password-input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-input-control"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Ulangi password baru"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword
                      ? "Sembunyikan password"
                      : "Lihat password"
                  }
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ marginTop: "0.5rem" }}>
              <button
                type="submit"
                className="btn btn-primary profile-submit-btn"
                disabled={isChangingPassword}
              >
                <Lock size={16} />
                <span>
                  {isChangingPassword ? "Memperbarui..." : "Ubah Password"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

