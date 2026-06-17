import { Lock, Music2 } from 'lucide-react';
import { useState } from 'react';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submitLogin(event) {
    event.preventDefault();

    if (username === 'admin' && password === 'admin') {
      setError('');
      onLogin();
      return;
    }

    setError('Credenciais inválidas.');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 text-slate-900">
      <section className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-blue-600 p-3 text-white">
            <Music2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">ReleaseBOT</h1>
            <p className="text-sm text-slate-500">Login local</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={submitLogin}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="username">
              Utilizador
            </label>
            <input
              id="username"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Lock size={16} />
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
