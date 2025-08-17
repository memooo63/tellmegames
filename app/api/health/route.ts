import { NextResponse } from "next/server"
import crypto from "crypto"

export async function GET() {
  const T0 = Date.now()
  const trace = (prefix: string, extra?: any) =>
    console.log(`[TRACE] [health] ${prefix} t+${Date.now() - T0}ms`, extra ?? "")
  const rid = crypto.randomUUID()
  const rawgKeyPresent = Boolean(process.env.RAWG_KEY)
  trace(`[${rid}] RAWG_KEY ${rawgKeyPresent ? "present" : "MISSING"}`)
  let status = 0
  let timeMs = 0
  try {
    const url = `https://api.rawg.io/api/games?page_size=1&key=${process.env.RAWG_KEY}`
    trace(`[${rid}] RAWG request`, { url })
    const t = Date.now()
    const res = await fetch(url)
    timeMs = Date.now() - t
    status = res.status
    trace(`[${rid}] RAWG response`, { status, timeMs })
    return NextResponse.json(
      { ok: res.ok, rawgKey: rawgKeyPresent, status, timeMs },
      { status: res.ok ? 200 : 500 },
    )
  } catch (e) {
    trace(`[${rid}] RAWG error`, { message: (e as Error).message })
    return NextResponse.json(
      { ok: false, rawgKey: rawgKeyPresent, status, timeMs },
      { status: 500 },
    )
  }
}
