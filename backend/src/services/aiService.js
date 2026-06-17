import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { query } from './db.js';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const models = [
  process.env.GEMINI_MODEL,
  'gemini-3.1-pro-preview',
  'gemini-3.1-flash-lite',
  'gemini-3.1-flash-lite-preview',
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-3.5-flash',
  'gemini-pro-latest',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-lite-001'
].filter(Boolean);

const sessions = new Map();

function getSession(sessionId = 'default') {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { history: [] });
  }

  return sessions.get(sessionId);
}

const systemInstruction = [
  'És o ReleaseBOT, um assistente para gerir lançamentos musicais.',
  'Interpreta linguagem natural e usa function calling para acoes reais.',
  'Usa apenas as funcoes basicas disponiveis para criar, listar, editar, apagar releases e criar campanhas.',
  'Para pedidos coletivos, como todos ou tudo, usa varias chamadas das funcoes basicas existentes.',
  'Exemplo: se pedirem para apagar todos os releases, chama delete_release uma vez por cada release existente.',
  'Exemplo: se pedirem para editar todos os releases, chama update_release uma vez por cada release existente.',
  'Não digas que não consegues só por ser um pedido coletivo.',
  'Quando criares uma campanha, cria planos de promoção completos, com fases, conteúdos, canais, calendário e métricas.',
  'Se faltar título ou plano da campanha, cria tu valores completos e adequados ao release.',
  'Guarda os generos sempre em minusculas, por exemplo edm, pop ou hip hop.',
  'Quando o utilizador falar em prioridade alta, media ou baixa, converte para high, medium ou low.',
  'Responde em portugues de Portugal e de forma curta.'
].join('\n');

const functionDeclarations = [
  {
    name: 'create_release',
    description: 'Cria um novo lançamento musical.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        artist: { type: 'string' },
        type: { type: 'string', enum: ['single', 'ep', 'album'] },
        release_date: { type: 'string', description: 'Data no formato YYYY-MM-DD' },
        genre: { type: 'string' },
        distributor: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        status: { type: 'string', enum: ['draft', 'pending', 'published', 'cancelled'] },
        notes: { type: 'string' }
      },
      required: ['title', 'artist', 'type', 'release_date']
    }
  },
  {
    name: 'list_releases',
    description: 'Lista lançamentos, podendo filtrar pelo estado ou tipo.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['draft', 'pending', 'published', 'cancelled'] },
        type: { type: 'string', enum: ['single', 'ep', 'album'] }
      }
    }
  },
  {
    name: 'update_release',
    description: 'Atualiza um lançamento identificado pelo título atual. Pode alterar título, artista, data, prioridade ou estado.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Título atual do lançamento que deve ser alterado.' },
        new_title: { type: 'string', description: 'Novo título do lançamento.' },
        artist: { type: 'string', description: 'Novo nome do artista.' },
        release_date: { type: 'string', description: 'Nova data no formato YYYY-MM-DD' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        status: { type: 'string', enum: ['draft', 'pending', 'published', 'cancelled'] }
      },
      required: ['title']
    }
  },
  {
    name: 'delete_release',
    description: 'Apaga um lançamento identificado pelo título.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' }
      },
      required: ['title']
    }
  },
  {
    name: 'create_campaign_plan',
    description: 'Cria um plano completo de promoção para um lançamento musical identificado pelo título.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        release_title: { type: 'string' },
        campaign_title: { type: 'string' },
        plan: { type: 'string', description: 'Plano de promoção detalhado, com objetivos, fases, canais, calendário, conteúdos e métricas.' }
      },
      required: ['release_title']
    }
  }
];


export async function listReleases(filters = {}) {
  let sql = `
    SELECT releases.*, artists.name AS artist
    FROM releases
    JOIN artists ON artists.id = releases.artist_id
  `;
  const conditions = [];
  const params = [];

  if (filters.status) {
    conditions.push('releases.status = ?');
    params.push(filters.status);
  }

  if (filters.type) {
    conditions.push('releases.type = ?');
    params.push(filters.type);
  }

  if (conditions.length) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  sql += ' ORDER BY releases.release_date ASC';
  return query(sql, params);
}

export async function createRelease(data) {
  const genre = data.genre ? data.genre.trim().toLowerCase() : null;
  let artists = await query('SELECT id FROM artists WHERE name = ?', [data.artist]);

  if (!artists.length) {
    const artistResult = await query(
      'INSERT INTO artists (name, genre) VALUES (?, ?)',
      [data.artist, genre]
    );
    artists = [{ id: artistResult.insertId }];
  }

  const result = await query(
    `INSERT INTO releases
      (artist_id, title, type, release_date, genre, distributor, priority, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      artists[0].id,
      data.title,
      data.type,
      data.release_date,
      genre,
      data.distributor || null,
      data.priority || 'medium',
      data.status || 'draft',
      data.notes || null
    ]
  );

  const releases = await query(
    `SELECT releases.*, artists.name AS artist
     FROM releases
     JOIN artists ON artists.id = releases.artist_id
     WHERE releases.id = ?`,
    [result.insertId]
  );

  return releases[0];
}

async function updateRelease(data) {
  const fields = [];
  const params = [];
  const releases = await listReleases();
  const release = releases.find((item) => item.title.toLowerCase() === data.title.toLowerCase());

  if (!release) {
    return null;
  }

  if (data.new_title) {
    fields.push('title = ?');
    params.push(data.new_title);
  }

  if (data.release_date) {
    fields.push('release_date = ?');
    params.push(data.release_date);
  }

  if (data.status) {
    fields.push('status = ?');
    params.push(data.status);
  }

  if (data.priority) {
    fields.push('priority = ?');
    params.push(data.priority);
  }

  if (!fields.length) {
    if (data.artist) {
      await query('UPDATE artists SET name = ? WHERE id = ?', [data.artist, release.artist_id]);
      const updatedReleases = await listReleases();
      return updatedReleases.find((item) => item.id === release.id) || null;
    }

    return null;
  }

  params.push(release.id);
  await query(`UPDATE releases SET ${fields.join(', ')} WHERE id = ?`, params);

  if (data.artist) {
    await query('UPDATE artists SET name = ? WHERE id = ?', [data.artist, release.artist_id]);
  }

  const updatedReleases = await listReleases();
  return updatedReleases.find((item) => item.id === release.id) || null;
}

async function deleteRelease(title) {
  const releases = await listReleases();
  const release = releases.find((item) => item.title.toLowerCase() === title.toLowerCase());

  if (!release) return null;
  await query('DELETE FROM releases WHERE id = ?', [release.id]);
  return release;
}

function buildCampaignPlan(release) {
  return [
    `Objetivo: preparar e promover o lançamento "${release.title}" de ${release.artist}, aumentando pre-saves, alcance nas redes sociais e streams na primeira semana.`,
    '',
    'Fase 1 - Preparacao (3 a 4 semanas antes):',
    '- Confirmar capa, metadata, data de lançamento e links de distribuição.',
    '- Criar um calendário de conteúdos com teasers, bastidores, excertos da música e publicações do artista.',
    '- Preparar uma mensagem curta sobre o conceito do release para usar em posts, press kit e emails.',
    '',
    'Fase 2 - Pré-lançamento (2 semanas antes):',
    '- Publicar teaser de 10 a 15 segundos em Reels, TikTok e Stories.',
    '- Ativar campanha de pre-save e fixar o link na bio.',
    '- Enviar o release para playlists independentes, curadores e contactos relevantes.',
    '- Criar 3 captions diferentes: uma emocional, uma direta e uma focada no género musical.',
    '',
    'Fase 3 - Semana do lançamento:',
    '- Publicar capa oficial, excerto principal e chamada para ouvir nas plataformas.',
    '- Fazer stories diarios com link direto para Spotify/Apple Music/YouTube.',
    '- Partilhar bastidores ou explicação curta sobre a música.',
    '- Pedir aos seguidores para guardar, adicionar a playlists e partilhar.',
    '',
    'Fase 4 - Pós-lançamento (1 a 2 semanas depois):',
    '- Publicar agradecimento e melhores reações do público.',
    '- Criar conteúdo secundário: lyric video, visualizer curto ou performance simples.',
    '- Reforçar o pitch para playlists e partilhar resultados iniciais.',
    '',
    'Canais principais:',
    '- Instagram: reels, stories, post da capa e bastidores.',
    '- TikTok: excertos curtos, trend simples e conteúdo espontâneo.',
    '- Spotify/Apple Music: pre-save, playlists e partilhas do link.',
    '- YouTube: visualizer, teaser ou short.',
    '',
    'Métricas a acompanhar:',
    '- Número de pre-saves.',
    '- Streams nos primeiros 7 dias.',
    '- Guardados e adicionados a playlists.',
    '- Alcance e interacoes nos posts.',
    '- Cliques no link da bio.'
  ].join('\n');
}

async function createCampaignPlan(data) {
  const releases = await listReleases();
  const release = releases.find((item) => item.title.toLowerCase() === data.release_title.toLowerCase());

  if (!release) return null;

  const campaignTitle = data.campaign_title || `Campanha de lançamento - ${release.title}`;
  const plan = data.plan && data.plan.length > 600 ? data.plan : buildCampaignPlan(release);

  const result = await query(
    'INSERT INTO campaigns (release_id, title, plan, status) VALUES (?, ?, ?, ?)',
    [release.id, campaignTitle, plan, 'draft']
  );

  return {
    id: result.insertId,
    release_id: release.id,
    release_title: release.title,
    title: campaignTitle,
    plan,
    status: 'draft'
  };
}
async function executeFunction(name, args) {
  if (name === 'create_release') return createRelease(args);
  if (name === 'list_releases') return listReleases(args);
  if (name === 'update_release') return updateRelease(args);
  if (name === 'delete_release') return deleteRelease(args.title);
  if (name === 'create_campaign_plan') return createCampaignPlan(args);
  return { ok: false, error: `Função ${name} desconhecida` };
}

function getUiFromActions(actions, activePage) {
  const refreshCampaigns = actions.some((action) => action.name === 'create_campaign_plan');
  const refreshReleases = actions.some((action) =>
    ['create_release', 'update_release', 'delete_release'].includes(action.name)
  );

  return {
    refreshReleases,
    refreshCampaigns,
    activePage: activePage === 'none' ? null : activePage
  };
}

function getActivePageFromActions(actions) {
  if (actions.some((action) => action.name === 'create_campaign_plan')) {
    return 'Campanhas';
  }

  return 'none';
}

async function saveChatMessage(message, reply) {
  await query(
    'INSERT INTO chat_history (user_message, ai_response) VALUES (?, ?)',
    [message, reply]
  );
}

async function generateWithFallback(contents, config) {
  let lastError;

  for (const currentModel of models) {
    try {
      return await ai.models.generateContent({
        model: currentModel,
        contents,
        config
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function generateStreamWithFallback(contents, config) {
  let lastError;

  for (const currentModel of models) {
    try {
      return await ai.models.generateContentStream({
        model: currentModel,
        contents,
        config
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function writeTextStream(res, text, delay = 18) {
  const parts = text.match(/\S+\s*/g) || [];

  for (const part of parts) {
    res.write(`event: chunk\n`);
    res.write(`data: ${JSON.stringify({ text: part })}\n\n`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export async function streamChat(res, message, sessionId = 'default') {
  const session = getSession(sessionId);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  try {
    const releases = await listReleases();
    const actions = [];

    session.history.push({
      role: 'user',
      parts: [
        {
          text: [
            `Data atual: ${new Date().toISOString().slice(0, 10)}`,
            `Lançamentos atuais: ${JSON.stringify(releases)}`,
            `Pedido: ${message}`
          ].join('\n')
        }
      ]
    });

    const initial = await generateWithFallback(
      session.history,
      {
        systemInstruction,
        tools: [{ functionDeclarations }],
        temperature: 0.3
      }
    );

    const calls = initial.functionCalls || [];
    let reply = '';

    if (calls.length > 0) {
      session.history.push(initial.candidates[0].content);
      const fnResponses = [];

      for (const call of calls) {
        const result = await executeFunction(call.name, call.args || {});
        const action = {
          id: call.id,
          name: call.name,
          args: call.args || {},
          success: result?.ok !== false && Boolean(result),
          result
        };

        actions.push(action);
        fnResponses.push({
          functionResponse: {
            name: call.name,
            ...(call.id ? { id: call.id } : {}),
            response: { result }
          }
        });

        res.write(`event: action\n`);
        res.write(`data: ${JSON.stringify({ action })}\n\n`);
      }

      session.history.push({
        role: 'user',
        parts: fnResponses
      });

      const stream = await generateStreamWithFallback(
        session.history,
        {
          systemInstruction,
          tools: [{ functionDeclarations }],
          temperature: 0.3
        }
      );

      for await (const chunk of stream) {
        const text = typeof chunk.text === 'function' ? chunk.text() : chunk.text || '';

        if (text) {
          reply += text;
          await writeTextStream(res, text);
        }
      }

      session.history.push({ role: 'model', parts: [{ text: reply }] });
    } else {
      reply = initial.candidates?.[0]?.content?.parts?.[0]?.text || '';

      await writeTextStream(res, reply);

      session.history.push({ role: 'model', parts: [{ text: reply }] });
    }

    const updatedReleases = await listReleases();
    const activePage = getActivePageFromActions(actions);
    const ui = getUiFromActions(actions, activePage);

    await saveChatMessage(message, reply || 'Pedido processado.');

    const result = {
      type: actions.length ? 'action_result' : 'message',
      reply: reply || 'Pedido processado.',
      action: actions[0]?.name || 'message',
      actions,
      ui,
      releases: updatedReleases
    };

    res.write(`event: done\n`);
    res.write(`data: ${JSON.stringify(result)}\n\n`);
    res.end();
  } catch (error) {
    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}
