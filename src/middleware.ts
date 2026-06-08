import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Rotas que exigem autenticação.
 * O Firebase SDK roda apenas no cliente, por isso usamos um cookie de sessão
 * gravado pelo AuthProvider para checar no middleware (server-side).
 * O cookie "taskflow_session" é definido como "1" após login bem-sucedido
 * e removido no logout.
 */
const PROTECTED_ROUTES = ["/dashboard", "/profile"];
const AUTH_ROUTES = ["/login", "/register"];
const SESSION_COOKIE = "taskflow_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Não autenticado tentando acessar rota protegida → redireciona para login
  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Autenticado tentando acessar login/register → redireciona para dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica middleware a todas as rotas exceto:
     * - _next/static (assets estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico
     * - arquivos com extensão (ex: .png, .svg)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
