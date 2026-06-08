import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  User,
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "@/lib/firebase";

// ─── Registro ────────────────────────────────────────────────────────────────

export async function registerWithEmail(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  await sendEmailVerification(credential.user);
  return credential.user;
}

// ─── Login por e-mail ─────────────────────────────────────────────────────────

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  if (!credential.user.emailVerified) {
    await signOut(auth);
    throw new Error(
      "E-mail não verificado. Verifique sua caixa de entrada e clique no link de confirmação antes de fazer login."
    );
  }
  return credential.user;
}

// ─── Login Social (Popup) ─────────────────────────────────────────────────────

export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function loginWithGithub(): Promise<User> {
  const result = await signInWithPopup(auth, githubProvider);
  return result.user;
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await signOut(auth);
}

// ─── Reenvio de verificação ───────────────────────────────────────────────────

export async function resendVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Nenhum usuário autenticado.");
  await sendEmailVerification(user);
}

// ─── Exclusão de conta ────────────────────────────────────────────────────────

export async function deleteCurrentAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Nenhum usuário autenticado.");
  try {
    await deleteUser(user);
  } catch (error: unknown) {
    const firebaseError = error as { code?: string };
    if (firebaseError.code === "auth/requires-recent-login") {
      throw new ReauthRequiredError();
    }
    throw error;
  }
}

export async function reauthAndDeleteWithPassword(password: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("Nenhum usuário autenticado.");
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
  await deleteUser(user);
}

export async function reauthAndDeleteWithGoogle(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Nenhum usuário autenticado.");
  await reauthenticateWithPopup(user, googleProvider);
  await deleteUser(user);
}

export async function reauthAndDeleteWithGithub(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Nenhum usuário autenticado.");
  await reauthenticateWithPopup(user, githubProvider);
  await deleteUser(user);
}

// ─── Erro customizado ─────────────────────────────────────────────────────────

export class ReauthRequiredError extends Error {
  public readonly code = "requires-reauth";
  constructor() {
    super("Por segurança, você precisa fazer login novamente antes de excluir sua conta.");
  }
}

// ─── Mensagens de erro Firebase ───────────────────────────────────────────────

export function getFirebaseErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "Este e-mail já está cadastrado.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/weak-password": "Senha muito fraca.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "Credenciais inválidas. Verifique e-mail e senha.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
    "auth/network-request-failed": "Falha de rede. Verifique sua conexão com a internet.",
    "auth/popup-closed-by-user": "Login cancelado.",
    "auth/cancelled-popup-request": "Login cancelado.",
    "auth/popup-blocked": "Popup bloqueado pelo navegador. Permita popups para este site.",
    "auth/account-exists-with-different-credential": "Este e-mail já está associado a outro método de login.",
    "auth/requires-recent-login": "Por segurança, faça login novamente antes desta operação.",
    "auth/unauthorized-domain": "Domínio não autorizado no Firebase.",
  };
  return messages[code] ?? "Ocorreu um erro inesperado. Tente novamente.";
}
