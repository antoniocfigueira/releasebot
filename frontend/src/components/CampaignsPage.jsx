import { Clipboard, Megaphone } from 'lucide-react';
import { useState } from 'react';

function getPlanSections(plan) {
  return (plan || '')
    .split('\n\n')
    .map((section) => section.trim())
    .filter(Boolean);
}

function CampaignsPage({ campaigns }) {
  const [selectedId, setSelectedId] = useState(null);

  const selectedCampaign =
    campaigns.find((campaign) => campaign.id === selectedId) ||
    campaigns[0] ||
    null;

  async function copyPlan() {
    if (!selectedCampaign?.plan) return;
    await navigator.clipboard.writeText(selectedCampaign.plan);
  }

  return (
    <section className="flex h-[calc(100vh-310px)] min-h-[460px] flex-col gap-4 overflow-hidden">
      <div className="shrink-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">Campanhas</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
          Planos de promoção
        </h2>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[320px_1fr]">
        <div className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Campanhas criadas</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">{campaigns.length}</span>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {campaigns.map((campaign) => (
              <button
                key={campaign.id}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  selectedCampaign?.id === campaign.id
                    ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50'
                    : 'border-slate-200 bg-slate-50 hover:border-blue-200 dark:border-slate-700 dark:bg-slate-800'
                }`}
                onClick={() => setSelectedId(campaign.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-600 p-2 text-white">
                    <Megaphone size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{campaign.title}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {campaign.release_title} - {campaign.artist}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                      {campaign.status}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <article className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {selectedCampaign ? (
            <>
              <div className="mb-5 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {selectedCampaign.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {selectedCampaign.release_title} - {selectedCampaign.artist}
                  </p>
                </div>

                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={copyPlan}
                >
                  <Clipboard size={16} />
                  Copiar plano
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
                {getPlanSections(selectedCampaign.plan).map((section, index) => (
                  <div
                    key={`${selectedCampaign.id}-${index}`}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <p className="whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-200">
                      {section}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Ainda não existem campanhas.
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

export default CampaignsPage;
