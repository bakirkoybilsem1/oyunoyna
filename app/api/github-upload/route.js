import { NextResponse } from 'next/server';

const GITHUB_OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER || 'bakirkoybilsem1';
const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO || 'oyun-merkezi';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

export async function POST(req) {
  try {
    const { isim, slug, htmlKodu } = await req.json();

    if (!isim || !htmlKodu) {
      return NextResponse.json({ error: 'isim ve htmlKodu zorunlu' }, { status: 400 });
    }

    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GitHub token tanımlı değil' }, { status: 500 });
    }

    const path = `${slug}/index.html`;
    const content = Buffer.from(htmlKodu).toString('base64');

    // Mevcut dosya varsa SHA al
    let sha;
    const checkRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' } }
    );
    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    }

    const body = {
      message: `Oyun eklendi: ${isim}`,
      content,
      ...(sha ? { sha } : {}),
    };

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message }, { status: res.status });
    }

    const gameUrl = `https://${GITHUB_OWNER}.github.io/${GITHUB_REPO}/${slug}/`;
    return NextResponse.json({ gameUrl });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
