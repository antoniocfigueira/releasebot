import * as releasebot from '../services/aiService.js';
import { query } from '../services/db.js';

function validateRelease(data) {
  return data.title && data.artist && data.type && data.release_date;
}

export async function chat(req, res) {
  if (!req.body.message?.trim()) {
    return res.status(400).json({ success: false, error: 'A mensagem é obrigatória.' });
  }

  await releasebot.streamChat(res, req.body.message.trim());
}

export async function stream(req, res) {
  const message = req.query.message || 'Ajuda-me a organizar os próximos lançamentos.';

  await releasebot.streamChat(res, message);
}

export async function getReleases(req, res, next) {
  try {
    const releases = await releasebot.listReleases(req.query);
    res.json({ success: true, data: releases });
  } catch (error) {
    next(error);
  }
}

export async function getCampaigns(req, res, next) {
  try {
    const campaigns = await query(`
      SELECT campaigns.*, releases.title AS release_title, artists.name AS artist
      FROM campaigns
      JOIN releases ON releases.id = campaigns.release_id
      JOIN artists ON artists.id = releases.artist_id
      ORDER BY campaigns.created_at DESC
    `);

    res.json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
}

export async function postRelease(req, res, next) {
  try {
    if (!validateRelease(req.body)) {
      return res.status(400).json({
        success: false,
        error: 'Título, artista, tipo e data são obrigatórios.'
      });
    }

    const release = await releasebot.createRelease(req.body);
    res.status(201).json({ success: true, data: release });
  } catch (error) {
    next(error);
  }
}

export async function putRelease(req, res, next) {
  try {
    const fields = [];
    const params = [];

    for (const field of ['title', 'type', 'release_date', 'genre', 'distributor', 'priority', 'status', 'notes']) {
      if (req.body[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(field === 'genre' && req.body[field] ? req.body[field].trim().toLowerCase() : req.body[field]);
      }
    }

    if (!fields.length && req.body.artist === undefined) {
      return res.status(400).json({ success: false, error: 'Não existem dados para atualizar.' });
    }

    if (fields.length) {
      params.push(req.params.id);
      await query(`UPDATE releases SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    if (req.body.artist !== undefined) {
      const rows = await query('SELECT artist_id FROM releases WHERE id = ?', [req.params.id]);

      if (rows.length) {
        await query('UPDATE artists SET name = ? WHERE id = ?', [req.body.artist, rows[0].artist_id]);
      }
    }

    const releases = await releasebot.listReleases();
    const release = releases.find((item) => item.id === Number(req.params.id));
    res.json({ success: true, data: release || null });
  } catch (error) {
    next(error);
  }
}

export async function deleteRelease(req, res, next) {
  try {
    await query('DELETE FROM releases WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: { id: Number(req.params.id) } });
  } catch (error) {
    next(error);
  }
}
