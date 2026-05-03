export const isAuthenticated = () => {
  return localStorage.getItem('lagoa_admin_session') === 'true';
};

export const logout = () => {
  localStorage.removeItem('lagoa_admin_session');
};

export const login = (user: string, pass: string) => {
  if (user === 'Administrador' && pass === 'Lagoa123@') {
    localStorage.setItem('lagoa_admin_session', 'true');
    return true;
  }
  return false;
};
