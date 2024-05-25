import { AppLoadContext, createCookieSessionStorage, redirect } from "@remix-run/cloudflare";

export const sessionKey = 'privateKey'

export function combineHeaders(
  ...headers: Array<ResponseInit['headers'] | null | undefined>
) {
  const combined = new Headers()
  for (const header of headers) {
    if (!header) continue
    for (const [key, value] of new Headers(header).entries()) {
      combined.append(key, value)
    }
  }
  return combined
}

export const sessionStorage = ({ SESSION_SECRET, ENV }: AppLoadContext['env']) => {
  return createCookieSessionStorage({
    cookie: {
      name: 'en_toast',
      sameSite: 'lax',
      path: '/',
      httpOnly: true,
      secrets: SESSION_SECRET.split(','),
      secure: ENV === 'production',
    },
  })
}

export async function createPrivateKeyHeaders(value: string, ctx: AppLoadContext['env']) {
  const session = await sessionStorage(ctx).getSession()
  session.flash(sessionKey, value)
  const cookie = await sessionStorage(ctx).commitSession(session)
  return new Headers({ 'set-cookie': cookie })
}

export async function getPrivateKey(request: Request, ctx: AppLoadContext['env']) {
  const session = await sessionStorage(ctx).getSession(
    request.headers.get('cookie'),
  )
  const privateKey = session.get(sessionKey)
  return {
    privateKey,
    headers: privateKey
      ? new Headers({
        'set-cookie': await sessionStorage(ctx).destroySession(session),
      })
      : null,
  }
}

export async function redirectWithPrivateKey(
  url: string,
  privateKey: string,
  init: ResponseInit | undefined,
  ctx: AppLoadContext['env']
) {
  return redirect(url, {
    ...init,
    headers: combineHeaders(init?.headers, await createPrivateKeyHeaders(privateKey, ctx)),
  })
}
