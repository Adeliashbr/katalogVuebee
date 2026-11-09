import readline from "readline";
import bcrypt from "bcryptjs";
import { db } from "../db/db.js";

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

async function main() {
  console.log("====================================================");
  console.log("   VUEBEE ADMIN PASSWORD RECOVERY TOOL (CLI)");
  console.log("====================================================\n");

  const currentAdmin = db.getAdmin();
  if (!currentAdmin) {
    console.error("❌ Error: Tidak ada akun administrator yang terdaftar di database.");
    process.exit(1);
  }

  console.log("Akun administrator aktif saat ini:");
  console.log(`- Nama : ${currentAdmin.name}`);
  console.log(`- Email: ${currentAdmin.email}`);
  console.log("----------------------------------------------------\n");

  const args = process.argv.slice(2);
  let targetEmail = args[0];
  let newPassword = args[1];

  if (!targetEmail) {
    targetEmail = await prompt(`Masukkan email admin [Default: ${currentAdmin.email}]: `);
    if (!targetEmail) targetEmail = currentAdmin.email;
  }

  // Cari admin berdasarkan email
  let admin = db.getAdminByEmail(targetEmail);
  if (!admin) {
    if (currentAdmin.email.toLowerCase() === targetEmail.toLowerCase()) {
      admin = currentAdmin;
    } else {
      console.error(`❌ Error: Akun dengan email "${targetEmail}" tidak ditemukan.`);
      console.log(`Akun yang terdaftar adalah: "${currentAdmin.email}"`);
      process.exit(1);
    }
  }

  if (!newPassword) {
    newPassword = await prompt("Masukkan kata sandi baru (minimal 8 karakter): ");
  }

  if (!newPassword || newPassword.length < 8) {
    console.error("❌ Error: Kata sandi baru harus minimal 8 karakter.");
    process.exit(1);
  }

  // Hash menggunakan bcrypt (salt rounds: 10, sama dengan sistem login)
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  // Perbarui akun admin yang sudah ada tanpa membuat akun duplikat atau menghapus data lain
  db.updateAdminPassword(admin.id, hashedPassword);
  db.invalidateAllResetsForAdmin(admin.id);

  console.log("\n✅ BERHASIL: Kata sandi administrator telah diperbarui.");
  console.log("Detail login akun:");
  console.log(`- Email    : ${admin.email}`);
  console.log(`- ID Akun  : ${admin.id}`);
  console.log(`- Status   : Aktif & Siap Digunakan`);
  console.log("\nSilakan login ke portal administrator Vuebee menggunakan email dan password baru tersebut.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Terjadi kesalahan saat mereset password:", err);
  process.exit(1);
});

