interface Props {
  tagline: string
}

// Pure CSS/SVG — no external images. The masked "4242" on the card is a
// nod to the app's own simulated deposit flow (the only accepted test
// card number), not a real value.
export function LoginBrandPanel({ tagline }: Props) {
  return (
    <div className="relative hidden flex-col items-center justify-center gap-10 overflow-hidden bg-navy px-8 py-12 text-white md:flex md:w-1/2 lg:w-2/5">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-8 h-72 w-72 animate-[blob-drift_9s_ease-in-out_infinite] rounded-full bg-gold/20 blur-3xl motion-reduce:animate-none"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-4 h-80 w-80 animate-[blob-drift_12s_ease-in-out_infinite_reverse] rounded-full bg-sky-400/10 blur-3xl motion-reduce:animate-none"
      />

      <div className="relative z-10 animate-[float-card_6s_ease-in-out_infinite] motion-reduce:animate-none">
        <div className="relative h-48 w-80 max-w-[80vw] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-navy-deep via-navy to-navy-deep p-6 shadow-2xl shadow-black/40">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-[shimmer-sweep_5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent motion-reduce:animate-none"
          />

          <div className="flex items-center justify-between">
            <div className="flex h-8 w-11 items-center justify-center rounded-md bg-gradient-to-br from-gold to-amber-600">
              <div className="h-4 w-7 rounded-sm border border-navy-deep/40" />
            </div>
            <span className="font-serif text-sm tracking-widest text-gold">CW</span>
          </div>

          <p className="mt-8 font-mono text-lg tracking-[0.2em] text-white/90">
            •••• •••• •••• 4242
          </p>

          <div className="mt-6 flex items-end justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
              Cobuccio Wallet
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">12/30</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-2 text-center">
        <span className="font-serif text-3xl tracking-wide">Cobuccio Wallet</span>
        <p className="max-w-xs text-sm text-white/60">{tagline}</p>
      </div>
    </div>
  )
}
