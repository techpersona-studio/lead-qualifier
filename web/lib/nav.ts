export function getNavVisibility(pathname: string, user: { id: string } | null) {
  if (pathname.startsWith("/login")) {
    return { showNav: false, showSignOut: false };
  }
  return { showNav: true, showSignOut: user !== null };
}
