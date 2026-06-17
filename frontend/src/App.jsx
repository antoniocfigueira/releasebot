import { Bot, CalendarDays, CheckCircle2, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import AdminSettings from './components/AdminSettings.jsx';
import CalendarPreview from './components/CalendarPreview.jsx';
import CampaignsPage from './components/CampaignsPage.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import LoginPage from './components/LoginPage.jsx';
import ReleasesList from './components/ReleasesList.jsx';
import ReleasesTable from './components/ReleasesTable.jsx';
import Sidebar from './components/Sidebar.jsx';
import StatCard from './components/StatCard.jsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activePage, setActivePage] = useState('Dashboard');
  const [releases, setReleases] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Olá, sou o ReleaseBOT. Posso ajudar a organizar lançamentos, campanhas e calendário.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    loadReleases();
    loadCampaigns();
  }, [isLoggedIn]);

  function handleLogin() {
    setIsLoggedIn(true);
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setShowChat(false);
    setActivePage('Dashboard');
    setChatInput('');
    setIsTyping(false);
  }

  async function loadReleases() {
    try {
      const response = await fetch('/api/releases');
      const result = await response.json();

      if (result.success) {
        setReleases(result.data);
      }
    } catch {
      setMessages((current) => [
        ...current,
        { from: 'bot', text: 'Não foi possível ligar ao backend.' }
      ]);
    }
  }

  async function loadCampaigns() {
    try {
      const response = await fetch('/api/campaigns');
      const result = await response.json();

      if (result.success) {
        setCampaigns(result.data);
      }
    } catch {
      setCampaigns([]);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!chatInput.trim()) return;

    const message = chatInput;
    const botMessageIndex = messages.length + 1;

    setMessages((current) => [
      ...current,
      { from: 'user', text: message },
      { from: 'bot', text: '' }
    ]);
    setChatInput('');
    setIsTyping(true);

    try {
      const source = new EventSource(`/api/ai/stream?message=${encodeURIComponent(message)}`);

      source.addEventListener('chunk', (event) => {
        const data = JSON.parse(event.data);
        setMessages((current) =>
          current.map((item, index) =>
            index === botMessageIndex ? { ...item, text: item.text + data.text } : item
          )
        );
      });

      source.addEventListener('done', async (event) => {
        const result = JSON.parse(event.data);
        source.close();
        setIsTyping(false);
        setReleases(result.releases);

        setMessages((current) =>
          current.map((item, index) =>
            index === botMessageIndex ? { ...item, text: result.reply } : item
          )
        );

        if (result.ui?.activePage) {
          setActivePage(result.ui.activePage);
        }
        if (result.ui?.refreshCampaigns) {
          await loadCampaigns();
        }
      });

      source.addEventListener('error', (event) => {
        source.close();
        setIsTyping(false);
        const data = event.data ? JSON.parse(event.data) : { error: 'Erro no streaming.' };
        setMessages((current) =>
          current.map((item, index) =>
            index === botMessageIndex ? { ...item, text: data.error } : item
          )
        );
      });
    } catch {
      setMessages((current) => [
        ...current,
        { from: 'bot', text: 'Não foi possível comunicar com o bot.' }
      ]);
      setIsTyping(false);
    }
  }

  async function updateRelease(id, data) {
    const response = await fetch(`/api/releases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();

    if (result.success) {
      await loadReleases();
    }
  }

  async function deleteRelease(id) {
    const response = await fetch(`/api/releases/${id}`, {
      method: 'DELETE'
    });
    const result = await response.json();

    if (result.success) {
      await loadReleases();
    }
  }

  const pending = releases.filter((release) => release.status === 'pending').length;
  const published = releases.filter((release) => release.status === 'published').length;
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = releases.filter((release) => release.release_date?.slice(0, 10) >= today).length;
  const recentReleases = [...releases].sort((first, second) => second.id - first.id);

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <main className="min-h-screen bg-slate-100 p-4 text-slate-900 md:p-6 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-7xl flex-col gap-5">
        <div className="grid flex-1 gap-5 lg:grid-cols-[220px_1fr]">
          <Sidebar activePage={activePage} setActivePage={setActivePage} />

          <section className="space-y-5">
            <Header
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              onLogout={handleLogout}
            />

            {activePage === 'Dashboard' && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <StatCard icon={Clock} label="Pendentes" value={pending} color="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200" />
                  <StatCard icon={CalendarDays} label="Próximos" value={upcoming} color="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200" />
                  <StatCard icon={CheckCircle2} label="Publicados" value={published} color="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200" />
                </div>

                <ReleasesList releases={recentReleases.slice(0, 6)} onUpdate={updateRelease} />
              </>
            )}

            {activePage === 'Releases' && (
              <ReleasesTable releases={releases} onUpdate={updateRelease} onDelete={deleteRelease} />
            )}

            {activePage === 'Calendário' && <CalendarPreview releases={releases} />}

            {activePage === 'Campanhas' && <CampaignsPage campaigns={campaigns} />}

            {activePage === 'Definições' && (
              <AdminSettings releases={releases} onCreated={loadReleases} onDeleteAll={loadReleases} />
            )}
          </section>
        </div>

        <Footer />
      </div>

      {!showChat && (
        <button
          className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl transition hover:bg-blue-700 active:scale-95"
          onClick={() => setShowChat(true)}
          aria-label="Abrir chat AI"
        >
          <Bot size={24} />
        </button>
      )}

      {showChat && (
        <div className="fixed inset-0 z-50 bg-slate-950/20 p-3 backdrop-blur-sm sm:inset-auto sm:bottom-4 sm:right-4 sm:w-[380px] sm:bg-transparent sm:p-0 sm:backdrop-blur-0">
          <ChatPanel
            messages={messages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            isTyping={isTyping}
            onSubmit={sendMessage}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
      </main>
    </div>
  );
}

export default App;
