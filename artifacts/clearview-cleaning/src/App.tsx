import { useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateQuote } from '@workspace/api-client-react';
import { ArrowDownRight, ArrowUpRight, Building2, Check, CheckCircle2, ChevronDown, Clock3, Droplets, Home as HomeIcon, MapPin, Menu, PhoneCall, ShieldCheck, Sparkles, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
type Mode = 'residential' | 'commercial';

const modeCopy = {
  residential: {
    label: 'Home care',
    title: <>A clearer kind<br />of clean.</>,
    body: 'The kind of clean you feel the moment you walk in. Thoughtful, reliable home service for the rooms you live in most.',
    prompt: 'Tell us about your home, your routine, and what you would love to hand off.',
    services: ['Recurring home cleaning', 'Deep cleans & resets', 'Move-in / move-out'],
  },
  commercial: {
    label: 'Facility care',
    title: <>Standards your<br />team can trust.</>,
    body: 'A consistently ready workplace, without another thing on your facilities list. Clear scopes, dependable crews, visible results.',
    prompt: 'Tell us about your facility, schedule, and the standard you need maintained.',
    services: ['Office & workplace care', 'Retail and common areas', 'Post-construction clean'],
  },
};

function Logo() {
  return (
    <a href="#top" className="focus-ring flex items-center gap-3" data-testid="link-logo">
      <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]">
        <Droplets size={20} strokeWidth={2.3} />
      </span>
      <span className="font-display text-[1.35rem] font-semibold tracking-[-0.04em]">Clearview<span className="text-[hsl(var(--primary))]">.</span></span>
    </a>
  );
}

function Header({ mode, onModeChange }: { mode: Mode; onModeChange: (value: Mode) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMenu = () => setMobileOpen(false);
  return (
    <>
      <div className="bg-[hsl(var(--secondary))] px-4 py-2 text-center text-[11px] font-medium tracking-[0.04em] text-[hsl(var(--primary-foreground))]">
        <span className="text-[hsl(var(--accent))]">●</span>&nbsp; Locally owned. Showing up since 2011. &nbsp; <a className="underline underline-offset-4 hover:text-[hsl(var(--accent))]" href="#quote" data-testid="link-announcement-quote">Request a clear quote</a>
      </div>
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border)/.8)] bg-[hsl(var(--background)/.93)] backdrop-blur-md">
        <div className="section-shell flex h-[76px] items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            <a href="#services" className="focus-ring text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]" data-testid="link-nav-services">Services</a>
            <a href="#standards" className="focus-ring text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]" data-testid="link-nav-standards">Our standard</a>
            <a href="#how-it-works" className="focus-ring text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]" data-testid="link-nav-process">How it works</a>
          </nav>
          <div className="hidden items-center gap-4 md:flex">
            <div className="flex items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/.7)] p-1" aria-label="Choose service type">
              <button onClick={() => onModeChange('residential')} className={`focus-ring rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${mode === 'residential' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`} data-testid="button-header-residential">Home</button>
              <button onClick={() => onModeChange('commercial')} className={`focus-ring rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${mode === 'commercial' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`} data-testid="button-header-commercial">Business</button>
            </div>
            <a href="#quote" className="focus-ring inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--foreground))] transition-transform hover:-translate-y-0.5" data-testid="link-header-quote">Get a quote <ArrowUpRight size={16} /></a>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="focus-ring rounded-lg p-2 md:hidden" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">
            {mobileOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-5 md:hidden">
            <nav className="flex flex-col gap-5" aria-label="Mobile navigation">
              <a href="#services" onClick={closeMenu} className="text-sm font-semibold" data-testid="link-mobile-services">Services</a>
              <a href="#standards" onClick={closeMenu} className="text-sm font-semibold" data-testid="link-mobile-standards">Our standard</a>
              <a href="#how-it-works" onClick={closeMenu} className="text-sm font-semibold" data-testid="link-mobile-process">How it works</a>
              <div className="flex items-center gap-2 pt-1">
                <button onClick={() => { onModeChange('residential'); closeMenu(); }} className={`rounded-full border px-3 py-2 text-xs font-bold ${mode === 'residential' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))]'}`} data-testid="button-mobile-residential">Home care</button>
                <button onClick={() => { onModeChange('commercial'); closeMenu(); }} className={`rounded-full border px-3 py-2 text-xs font-bold ${mode === 'commercial' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))]'}`} data-testid="button-mobile-commercial">Facility care</button>
              </div>
              <a href="#quote" onClick={closeMenu} className="inline-flex w-fit items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-bold" data-testid="link-mobile-quote">Get a quote <ArrowUpRight size={16} /></a>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

function QuoteForm({ mode, onModeChange }: { mode: Mode; onModeChange: (value: Mode) => void }) {
  const createQuote = useCreateQuote();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim().length < 2) { setError('Please add your name so we know who to reply to.'); return; }
    if (contact.trim().length < 5) { setError('Please add an email or phone number.'); return; }
    if (message.trim().length < 10) { setError('A few more details will help us prepare the right quote.'); return; }
    setError('');
    createQuote.mutate({ data: { name: name.trim(), contact: contact.trim(), message: message.trim(), mode } }, {
      onSuccess: () => {
        setSuccess(true);
        setName('');
        setContact('');
        setMessage('');
      },
      onError: () => setError('We could not send that just now. Please try again or call us at (415) 555-0184.'),
    });
  };

  return (
    <div id="quote" className="relative scroll-mt-28 rounded-[24px] bg-[hsl(var(--card))] p-6 shadow-[0_24px_65px_rgba(8,40,52,.18)] ring-1 ring-[hsl(var(--foreground)/.08)] sm:p-8">
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-2 text-[hsl(var(--primary))]">Start here</p>
          <h2 className="font-display text-[2rem] leading-[1.05] tracking-[-0.04em]">Let’s make a plan.</h2>
        </div>
        <span className="rounded-full bg-[hsl(var(--muted))] px-3 py-1.5 font-mono-ui text-[10px] font-bold text-[hsl(var(--muted-foreground))]">01 / 01</span>
      </div>
      <div className="mb-6 grid grid-cols-2 rounded-xl bg-[hsl(var(--muted)/.7)] p-1" role="tablist" aria-label="Quote audience">
        <button type="button" onClick={() => onModeChange('residential')} className={`focus-ring flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${mode === 'residential' ? 'bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid="button-quote-residential"><HomeIcon size={15} /> Home</button>
        <button type="button" onClick={() => onModeChange('commercial')} className={`focus-ring flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${mode === 'commercial' ? 'bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid="button-quote-commercial"><Building2 size={15} /> Business</button>
      </div>
      {success ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-[hsl(var(--primary)/.2)] bg-[hsl(var(--primary)/.06)] p-6 text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><Check size={25} /></span>
          <h3 className="font-display text-2xl tracking-[-0.03em]">You’re on our list.</h3>
          <p className="mt-2 max-w-xs text-sm leading-6 text-[hsl(var(--muted-foreground))]">Thanks for reaching out. A Clearview coordinator will be in touch within one business day.</p>
          <button onClick={() => setSuccess(false)} className="mt-6 text-sm font-bold text-[hsl(var(--primary))] underline underline-offset-4" data-testid="button-submit-another">Send another request</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="quote-name" className="mb-1.5 block text-xs font-bold text-[hsl(var(--foreground))]">Your name</label>
            <input id="quote-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Jane or Jordan Lee" className="quote-field focus-ring w-full rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm outline-none transition-colors focus:border-[hsl(var(--primary))]" data-testid="input-quote-name" />
          </div>
          <div>
            <label htmlFor="quote-contact" className="mb-1.5 block text-xs font-bold text-[hsl(var(--foreground))]">Email or phone</label>
            <input id="quote-contact" value={contact} onChange={(event) => setContact(event.target.value)} placeholder="jane@example.com" className="quote-field focus-ring w-full rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm outline-none transition-colors focus:border-[hsl(var(--primary))]" data-testid="input-quote-contact" />
          </div>
          <div>
            <label htmlFor="quote-message" className="mb-1.5 block text-xs font-bold text-[hsl(var(--foreground))]">{mode === 'residential' ? 'What would you like cleaned?' : 'Tell us about your facility'}</label>
            <textarea id="quote-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={3} placeholder={modeCopy[mode].prompt} className="quote-field focus-ring w-full resize-none rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm leading-5 outline-none transition-colors focus:border-[hsl(var(--primary))]" data-testid="input-quote-message" />
          </div>
          {error && <p className="rounded-lg bg-[hsl(var(--destructive)/.09)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]" role="alert" data-testid="status-quote-error">{error}</p>}
          <button type="submit" disabled={createQuote.isPending} className="focus-ring group flex w-full items-center justify-between rounded-xl bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-all hover:-translate-y-0.5 hover:bg-[hsl(var(--secondary))] disabled:cursor-wait disabled:opacity-70" data-testid="button-submit-quote">
            {createQuote.isPending ? 'Sending your request…' : 'Request my clear quote'} <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
          <p className="text-center text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">No sales pitch. Just a thoughtful reply and a clear next step.</p>
        </form>
      )}
    </div>
  );
}

function Home() {
  const [mode, setMode] = useState<Mode>('residential');
  const copy = modeCopy[mode];
  return (
    <div id="top" className="overflow-hidden">
      <Header mode={mode} onModeChange={setMode} />
      <main>
        <section className="relative bg-[hsl(var(--secondary))] text-[hsl(var(--primary-foreground))]">
          <div className="noise absolute inset-0 overflow-hidden">
            <div className="absolute -right-40 -top-28 h-[520px] w-[520px] rounded-full border-[1px] border-[hsl(var(--accent)/.25)]" />
            <div className="absolute -right-24 top-0 h-[400px] w-[400px] rounded-full border-[1px] border-[hsl(var(--accent)/.2)]" />
            <div className="absolute bottom-[-250px] left-[-120px] h-[420px] w-[420px] rounded-full bg-[hsl(var(--primary)/.28)] blur-3xl" />
          </div>
          <div className="section-shell relative grid min-h-[680px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-20 lg:py-20">
            <div className="reveal">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary-foreground)/.18)] px-3 py-2 text-xs font-medium text-[hsl(var(--primary-foreground)/.75)]">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" /> {copy.label} <span className="text-[hsl(var(--primary-foreground)/.35)]">/</span> Bay Area
              </div>
              <h1 className="font-display text-[clamp(3.8rem,8vw,7.5rem)] font-semibold leading-[.88] tracking-[-0.07em] text-[hsl(var(--primary-foreground))]">{copy.title}</h1>
              <p className="mt-8 max-w-[470px] text-lg leading-8 text-[hsl(var(--primary-foreground)/.68)]">{copy.body}</p>
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <a href="#quote" className="focus-ring inline-flex items-center gap-3 rounded-full bg-[hsl(var(--accent))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--foreground))] transition-transform hover:-translate-y-1" data-testid="link-hero-quote">Get your clear quote <ArrowUpRight size={17} /></a>
                <a href="#services" className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary-foreground)/.7)] transition-colors hover:text-[hsl(var(--primary-foreground))]" data-testid="link-hero-services">See what we do <ArrowDownRight size={16} /></a>
              </div>
              <div className="mt-12 flex items-center gap-4 border-t border-[hsl(var(--primary-foreground)/.14)] pt-5">
                <div className="flex -space-x-2">
                  {['MC', 'DR', 'AS'].map((initials) => <span key={initials} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[hsl(var(--secondary))] bg-[hsl(var(--primary))] text-[9px] font-bold text-[hsl(var(--primary-foreground))]">{initials}</span>)}
                </div>
                <p className="text-xs text-[hsl(var(--primary-foreground)/.58)]"><strong className="text-[hsl(var(--primary-foreground)/.9)]">Your neighbors</strong> keep coming back.<br />4.9 average across 240+ clean homes.</p>
              </div>
            </div>
            <div className="reveal reveal-delay-2">
              <QuoteForm mode={mode} onModeChange={setMode} />
            </div>
          </div>
          <div className="section-shell relative flex items-center justify-between border-t border-[hsl(var(--primary-foreground)/.12)] py-4 text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--primary-foreground)/.45)]">
            <span>Care you can see</span><span className="hidden sm:block">A better baseline for every space</span><span>Est. 2011 / CA</span>
          </div>
        </section>

        <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/.5)]">
          <div className="section-shell grid gap-0 py-6 sm:grid-cols-3">
            {[
              ['01', 'Fully insured + bonded', 'Peace of mind for every home and facility.'],
              ['02', '[X]+ years serving locally', 'An established team that knows what dependable means.'],
              ['03', '[X]+ trained cleaners', 'Vetted people we would trust in our own spaces.'],
              ['04', '4.9 / 5 average rating', 'The details are the difference. Every time.'],
            ].map(([number, title, text], index) => (
              <div key={number} className={`flex gap-4 py-4 sm:px-6 ${index > 0 ? 'border-t border-[hsl(var(--border))] sm:border-l sm:border-t-0' : ''}`} data-testid={`feature-${number}`}>
                <span className="font-mono-ui text-[10px] font-bold text-[hsl(var(--accent))]">{number}</span>
                <div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{text}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="section-shell scroll-mt-24 py-24 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-24">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="eyebrow text-[hsl(var(--primary))]">The Clearview menu</p>
              <h2 className="mt-4 max-w-sm font-display text-5xl leading-[.98] tracking-[-0.055em] sm:text-6xl">The right clean for your real life.</h2>
              <p className="mt-6 max-w-sm text-base leading-7 text-[hsl(var(--muted-foreground))]">We do not force every space into the same checklist. Tell us what matters, and we build the care around it.</p>
              <a href="#quote" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))] underline decoration-[hsl(var(--accent))] decoration-2 underline-offset-8 hover:text-[hsl(var(--secondary))]" data-testid="link-services-quote">Talk through your space <ArrowUpRight size={16} /></a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <article className="lift relative min-h-[350px] overflow-hidden rounded-[22px] bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))] sm:col-span-2">
                <div className="absolute right-0 top-0 h-full w-1/2 opacity-50">
                  <div className="window-grid h-full w-full" />
                  <div className="absolute right-[18%] top-[18%] h-28 w-28 rounded-full border border-[hsl(var(--accent)/.7)]" />
                  <div className="absolute right-[9%] top-[10%] h-40 w-40 rounded-full border border-[hsl(var(--accent)/.35)]" />
                </div>
                <span className="relative font-mono-ui text-[10px] text-[hsl(var(--primary-foreground)/.58)]">01 / {mode === 'residential' ? 'HOME' : 'FACILITY'}</span>
                <div className="relative mt-24 max-w-[360px]"><h3 className="font-display text-4xl tracking-[-.04em]">A clean that fits your rhythm.</h3><p className="mt-3 text-sm leading-6 text-[hsl(var(--primary-foreground)/.65)]">{copy.services[0]} with a plan that stays steady as life changes.</p></div>
                <span className="absolute bottom-7 right-7 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"><ArrowUpRight size={18} /></span>
              </article>
              <article className="lift rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7">
                <span className="font-mono-ui text-[10px] text-[hsl(var(--muted-foreground))]">02 / RESET</span>
                <h3 className="mt-16 font-display text-3xl tracking-[-.04em]">{copy.services[1]}</h3>
                <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">For the moments that need more than a maintenance visit.</p>
                <div className="mt-7 h-1 w-12 bg-[hsl(var(--accent))]" />
              </article>
              <article className="lift rounded-[22px] bg-[hsl(var(--accent))] p-7 text-[hsl(var(--foreground))]">
                <span className="font-mono-ui text-[10px] text-[hsl(var(--foreground)/.65)]">03 / TRANSITION</span>
                <h3 className="mt-16 font-display text-3xl tracking-[-.04em]">{copy.services[2]}</h3>
                <p className="mt-3 text-sm leading-6 text-[hsl(var(--foreground)/.7)]">A fresh beginning, handled with care and a detailed finish.</p>
                <div className="mt-7 flex justify-end"><Sparkles size={27} strokeWidth={1.5} /></div>
              </article>
            </div>
          </div>
        </section>

        <section id="standards" className="scroll-mt-24 bg-[hsl(var(--muted)/.72)] py-24 sm:py-32">
          <div className="section-shell grid items-center gap-14 lg:grid-cols-[1fr_1fr] lg:gap-24">
            <div className="relative min-h-[470px] overflow-hidden rounded-[24px] bg-[hsl(var(--secondary))] p-8 text-[hsl(var(--primary-foreground))]">
              <div className="absolute inset-0 opacity-50 window-grid" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between"><span className="eyebrow text-[hsl(var(--primary-foreground)/.6)]">Inside the standard</span><ShieldCheck size={25} className="text-[hsl(var(--accent))]" /></div>
                <div>
                  <p className="font-display text-7xl leading-none tracking-[-.08em] text-[hsl(var(--accent))]">clear<span className="text-[hsl(var(--primary-foreground))]">.</span></p>
                  <p className="mt-3 max-w-[240px] text-sm leading-6 text-[hsl(var(--primary-foreground)/.6)]">Our promise is simple: you should never have to wonder what happened while you were away.</p>
                </div>
                <div className="flex items-end justify-between border-t border-[hsl(var(--primary-foreground)/.16)] pt-5"><span className="font-mono-ui text-[10px] text-[hsl(var(--primary-foreground)/.5)]">CHECKLIST / 04</span><span className="text-xs font-bold">No corners skipped</span></div>
              </div>
            </div>
            <div>
              <p className="eyebrow text-[hsl(var(--primary))]">Why Clearview</p>
              <h2 className="mt-4 max-w-lg font-display text-5xl leading-[.98] tracking-[-.055em] sm:text-6xl">Dependable is a design choice.</h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-[hsl(var(--muted-foreground))]">We built the company around the parts of cleaning service that usually feel fuzzy: who is coming, what will be done, and whether someone will make it right.</p>
              <div className="mt-8 space-y-5">
                {[
                  ['A familiar face', 'The same small crew, carefully matched to your space.'],
                  ['A visible plan', 'Your priorities are noted, shared, and checked before we leave.'],
                  ['A real response', 'Questions get answered by a human who knows your account.'],
                ].map(([title, text]) => <div key={title} className="flex gap-4"><span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><Check size={12} strokeWidth={3} /></span><div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p></div></div>)}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section-shell scroll-mt-24 py-24 sm:py-32">
          <div className="mb-14 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="eyebrow text-[hsl(var(--primary))]">A lighter lift</p><h2 className="mt-4 font-display text-5xl leading-[.95] tracking-[-.055em] sm:text-6xl">Three steps.<br />Then breathe.</h2></div>
            <p className="max-w-xs text-sm leading-6 text-[hsl(var(--muted-foreground))]">From first hello to finished space, the process is as considered as the result.</p>
          </div>
          <div className="grid border-y border-[hsl(var(--border))] md:grid-cols-3">
            {[
              ['01', 'Tell us what matters', 'A quick conversation gives us the shape of your home or facility and the details you care about most.'],
              ['02', 'Get the clear plan', 'You receive a straightforward scope, timing, and price. No vague “starting at” surprises.'],
              ['03', 'Come home to done', 'Your crew arrives prepared, works with care, and leaves the space ready for what is next.'],
            ].map(([number, title, text], index) => <div key={number} className={`relative py-8 md:px-8 md:py-10 ${index > 0 ? 'border-t border-[hsl(var(--border))] md:border-l md:border-t-0' : 'md:pl-0'}`}><span className="font-mono-ui text-xs font-bold text-[hsl(var(--accent))]">{number}</span><h3 className="mt-12 max-w-[200px] font-display text-3xl leading-[1] tracking-[-.04em]">{title}</h3><p className="mt-4 max-w-[260px] text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p><ArrowUpRight className="absolute right-0 top-8 text-[hsl(var(--primary)/.55)] md:right-8" size={18} /></div>)}
          </div>
        </section>

        <section className="bg-[hsl(var(--primary))] py-24 text-[hsl(var(--primary-foreground))] sm:py-28">
          <div className="section-shell grid items-center gap-12 lg:grid-cols-[.78fr_1.22fr] lg:gap-24">
           <div><p className="eyebrow text-[hsl(var(--accent))]">Sample testimonial</p><div className="mt-5 font-display text-6xl leading-none text-[hsl(var(--accent))]">“</div><blockquote className="mt-[-8px] font-display text-3xl leading-[1.15] tracking-[-.035em] sm:text-4xl">The first time we walked back in, we both said the same thing: it feels like our house again.</blockquote><div className="mt-7 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-xs font-bold text-[hsl(var(--foreground))]">MC</span><div><p className="text-sm font-bold">Maya &amp; Chris <span className="font-normal text-[hsl(var(--primary-foreground)/.5)]">(sample)</span></p><p className="text-xs text-[hsl(var(--primary-foreground)/.55)]">Noe Valley · recurring home care</p></div></div></div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-[hsl(var(--primary-foreground)/.16)] p-5 sm:p-7"><Clock3 className="text-[hsl(var(--accent))]" size={22} /><p className="mt-10 font-display text-4xl tracking-[-.05em]">1 day</p><p className="mt-2 text-xs leading-5 text-[hsl(var(--primary-foreground)/.58)]">Typical response time for a new quote.</p></div>
              <div className="rounded-2xl border border-[hsl(var(--primary-foreground)/.16)] p-5 sm:p-7"><CheckCircle2 className="text-[hsl(var(--accent))]" size={22} /><p className="mt-10 font-display text-4xl tracking-[-.05em]">4.9 / 5</p><p className="mt-2 text-xs leading-5 text-[hsl(var(--primary-foreground)/.58)]">From more than 240 local clients.</p></div>
              <div className="col-span-2 rounded-2xl bg-[hsl(var(--secondary))] p-5 sm:p-7"><p className="eyebrow text-[hsl(var(--primary-foreground)/.5)]">Our coverage</p><div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium"><span className="flex items-center gap-2"><MapPin size={16} className="text-[hsl(var(--accent))]" /> San Francisco</span><span className="text-[hsl(var(--primary-foreground)/.3)]">/</span><span>Marin</span><span className="text-[hsl(var(--primary-foreground)/.3)]">/</span><span>East Bay</span></div></div>
            </div>
          </div>
        </section>

        <section className="section-shell py-24 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-24">
            <div><p className="eyebrow text-[hsl(var(--primary))]">Good to know</p><h2 className="mt-4 font-display text-5xl leading-[.98] tracking-[-.055em]">The questions<br />people ask.</h2><p className="mt-6 max-w-xs text-sm leading-6 text-[hsl(var(--muted-foreground))]">Still curious? We are happy to talk it through. That is what the quote is for.</p><a href="#quote" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-faq-quote">Ask us directly <ArrowUpRight size={16} /></a></div>
            <div className="divide-y divide-[hsl(var(--border))] border-y border-[hsl(var(--border))]">
              {[
                ['Do I need to be home for the clean?', 'Not at all. Many of our clients share a secure entry plan, and we will always confirm arrival and completion.'],
                ['Can I request the same crew?', 'Yes. Consistency is part of the service. We match a small crew to your space and keep that relationship steady.'],
                ['What if I need something outside the usual checklist?', 'Tell us. We will build it into the scope when we can, or point you to a trusted local specialist when we cannot.'],
                ['Do you bring your own supplies?', 'Yes. Our crews arrive with professional-grade, low-scent products and everything needed for the agreed scope.'],
               ['Are you insured, and what if my usual cleaner is unavailable?', 'Yes. We are fully insured and bonded, with backup staff available so your agreed schedule stays dependable.'],
              ].map(([question, answer]) => <details key={question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-bold [&::-webkit-details-marker]:hidden" data-testid={`button-faq-${question.slice(0, 12).replaceAll(' ', '-').toLowerCase()}`}>{question}<ChevronDown size={19} className="shrink-0 text-[hsl(var(--primary))] transition-transform group-open:rotate-180" /></summary><p className="max-w-xl pt-3 pr-8 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{answer}</p></details>)}
            </div>
          </div>
        </section>

        <section className="section-shell pb-20">
          <div className="noise relative overflow-hidden rounded-[26px] bg-[hsl(var(--accent))] px-7 py-12 sm:px-14 sm:py-16">
            <div className="relative flex flex-col justify-between gap-9 md:flex-row md:items-end">
              <div><p className="eyebrow text-[hsl(var(--foreground)/.6)]">Ready when you are</p><h2 className="mt-4 max-w-xl font-display text-5xl leading-[.92] tracking-[-.06em] sm:text-6xl">A cleaner week starts here.</h2></div>
              <a href="#quote" className="focus-ring inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-[hsl(var(--secondary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-1" data-testid="link-bottom-quote">Request a quote <ArrowUpRight size={17} /></a>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-[hsl(var(--secondary))] py-12 text-[hsl(var(--primary-foreground))]">
        <div className="section-shell">
          <div className="flex flex-col justify-between gap-10 border-b border-[hsl(var(--primary-foreground)/.13)] pb-10 sm:flex-row">
            <div><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"><Droplets size={20} /></span><span className="font-display text-[1.35rem] font-semibold tracking-[-.04em]">Clearview<span className="text-[hsl(var(--accent))]">.</span></span></div><p className="mt-4 max-w-xs text-sm leading-6 text-[hsl(var(--primary-foreground)/.5)]">Thoughtful cleaning for homes, teams, and the spaces in between.</p></div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm text-[hsl(var(--primary-foreground)/.63)]"><a href="#services" className="hover:text-[hsl(var(--accent))]" data-testid="link-footer-services">Services</a><a href="#standards" className="hover:text-[hsl(var(--accent))]" data-testid="link-footer-standard">Our standard</a><a href="#how-it-works" className="hover:text-[hsl(var(--accent))]" data-testid="link-footer-process">How it works</a><a href="#quote" className="hover:text-[hsl(var(--accent))]" data-testid="link-footer-quote">Get a quote</a></div>
          </div>
           <div className="flex flex-col justify-between gap-3 pt-6 text-[11px] text-[hsl(var(--primary-foreground)/.4)] sm:flex-row"><span>© 2024 Clearview Cleaning Co. All rights reserved.</span><span className="flex items-center gap-2"><PhoneCall size={13} /> <a href="tel:+14155550184" className="hover:text-[hsl(var(--accent))]" data-testid="link-footer-phone">(415) 555-0184</a> <span className="mx-1">·</span> <a href="mailto:hello@clearview.co" className="hover:text-[hsl(var(--accent))]" data-testid="link-footer-email">hello@clearview.co</a></span></div>
        </div>
      </footer>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;