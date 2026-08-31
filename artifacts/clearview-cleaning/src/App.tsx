import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCreateQuote } from '@workspace/api-client-react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Droplets,
  Home as HomeIcon,
  Mail,
  MapPin,
  Menu,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
type Mode = 'residential' | 'commercial';

const EASE = [0.22, 0.75, 0.25, 1] as const;

const modeCopy = {
  residential: {
    label: 'Home care',
    title: (
      <>
        Come home
        <br />
        to <span className="font-display-italic">clear</span>.
      </>
    ),
    body: 'The kind of clean you feel before you see it. Steady, attentive care for the rooms your family actually lives in.',
    prompt: 'Tell us about your home, your routine, and what you\u2019d love to hand off.',
    services: ['Recurring home care', 'Deep cleans & resets', 'Move-in / move-out'],
  },
  commercial: {
    label: 'Facility care',
    title: (
      <>
        Standards you
        <br />
        can <span className="font-display-italic">verify</span>.
      </>
    ),
    body: 'A workplace that is always presentation-ready, without another line on your facilities list. Clear scopes, steady crews, visible results.',
    prompt: 'Tell us about your facility, your schedule, and the standard you need held.',
    services: ['Office & workplace care', 'Retail & common areas', 'Post-construction clean'],
  },
} satisfies Record<Mode, { label: string; title: ReactNode; body: string; prompt: string; services: string[] }>;

/** Reusable scroll-triggered reveal. Respects prefers-reduced-motion. */
function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'span';
}) {
  const reduceMotion = useReducedMotion();
  const Comp = as === 'span' ? motion.span : motion.div;
  return (
    <Comp
      className={className}
      initial={reduceMotion ? undefined : { opacity: 0, y: 26 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-72px' }}
      transition={{ duration: 0.65, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

function Logo() {
  return (
    <a href="#top" className="focus-ring flex items-center gap-2.5" data-testid="link-logo">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--accent))]">
        <Droplets size={18} strokeWidth={2.4} />
      </span>
      <span className="font-display text-[1.4rem] tracking-[-0.02em] text-[hsl(var(--foreground))]">
        Clearview<span className="text-[hsl(var(--accent))]">.</span>
      </span>
    </a>
  );
}

const NAV_LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#standards', label: 'Our standard' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#faq', label: 'FAQ' },
];

function Header({ mode, onModeChange }: { mode: Mode; onModeChange: (value: Mode) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <div className="bg-[hsl(var(--secondary))] px-4 py-2 text-center text-[11px] font-medium tracking-[0.03em] text-[hsl(var(--secondary-foreground)/.78)]">
        <span className="text-[hsl(var(--accent))]">&#9679;</span>&nbsp; Locally owned in the Bay Area &middot; serving homes and teams since 2011 &nbsp;
        <a className="underline underline-offset-4 hover:text-[hsl(var(--accent))]" href="#quote" data-testid="link-announcement-quote">
          Book your first clean
        </a>
      </div>
      <header className="sticky top-0 z-50 pt-3 sm:pt-4">
        <div className="section-shell">
          <div className="glass flex h-[68px] items-center justify-between rounded-full border border-[hsl(var(--border))] px-3 shadow-[var(--shadow-sm)] sm:px-4">
            <Logo />
            <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="focus-ring text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
                  data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex items-center rounded-full bg-[hsl(var(--muted))] p-1" aria-label="Choose service type">
                <button
                  onClick={() => onModeChange('residential')}
                  className={`focus-ring rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${mode === 'residential' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
                  data-testid="button-header-residential"
                >
                  Home
                </button>
                <button
                  onClick={() => onModeChange('commercial')}
                  className={`focus-ring rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${mode === 'commercial' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
                  data-testid="button-header-commercial"
                >
                  Business
                </button>
              </div>
              <a
                href="#quote"
                className="btn-primary focus-ring group inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] py-2 pl-4 pr-2 text-sm font-bold text-[hsl(var(--accent-foreground))]"
                data-testid="link-header-quote"
              >
                Book a visit
                <span className="icon-chip flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--accent-foreground)/.12)]">
                  <ArrowUpRight size={14} />
                </span>
              </a>
            </div>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="focus-ring rounded-full p-2 md:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              data-testid="button-mobile-menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="glass mt-2 overflow-hidden rounded-3xl border border-[hsl(var(--border))] px-6 py-5 md:hidden"
              >
                <nav className="flex flex-col gap-5" aria-label="Mobile navigation">
                  {NAV_LINKS.map((link) => (
                    <a key={link.href} href={link.href} onClick={closeMenu} className="text-sm font-semibold" data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      {link.label}
                    </a>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => { onModeChange('residential'); closeMenu(); }}
                      className={`rounded-full border px-3 py-2 text-xs font-bold ${mode === 'residential' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))]'}`}
                      data-testid="button-mobile-residential"
                    >
                      Home care
                    </button>
                    <button
                      onClick={() => { onModeChange('commercial'); closeMenu(); }}
                      className={`rounded-full border px-3 py-2 text-xs font-bold ${mode === 'commercial' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))]'}`}
                      data-testid="button-mobile-commercial"
                    >
                      Facility care
                    </button>
                  </div>
                  <a href="#quote" onClick={closeMenu} className="inline-flex w-fit items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--accent-foreground))]" data-testid="link-mobile-quote">
                    Book a visit <ArrowUpRight size={16} />
                  </a>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
    <div id="quote" className="bezel scroll-mt-28 shadow-[var(--shadow-lg)]">
      <div className="bezel-inner bg-[hsl(var(--card))] p-6 ring-1 ring-[hsl(var(--card-border))] sm:p-8">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow mb-2 text-[hsl(var(--primary))]">Start here</p>
            <h2 className="font-display text-[2.1rem] leading-[1.05] tracking-[-0.02em]">Let&rsquo;s plan your visit.</h2>
          </div>
          <span className="rounded-full bg-[hsl(var(--muted))] px-3 py-1.5 font-mono-ui text-[10px] font-bold text-[hsl(var(--muted-foreground))]">~1 min</span>
        </div>
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-[hsl(var(--muted)/.7)] p-1" role="tablist" aria-label="Quote audience">
          <button type="button" onClick={() => onModeChange('residential')} className={`focus-ring flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${mode === 'residential' ? 'bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid="button-quote-residential">
            <HomeIcon size={15} /> Home
          </button>
          <button type="button" onClick={() => onModeChange('commercial')} className={`focus-ring flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${mode === 'commercial' ? 'bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid="button-quote-commercial">
            <Building2 size={15} /> Business
          </button>
        </div>
        {success ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-[hsl(var(--primary)/.2)] bg-[hsl(var(--primary)/.06)] p-6 text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><Check size={25} /></span>
            <h3 className="font-display text-2xl tracking-[-0.02em]">You&rsquo;re on our list.</h3>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[hsl(var(--muted-foreground))]">Thanks for reaching out. A Clearview coordinator will reply within one business day with times and a clear price.</p>
            <button onClick={() => setSuccess(false)} className="mt-6 text-sm font-bold text-[hsl(var(--primary))] underline underline-offset-4" data-testid="button-submit-another">Send another request</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
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
            <button type="submit" disabled={createQuote.isPending} className="btn-primary focus-ring group flex w-full items-center justify-between rounded-xl bg-[hsl(var(--primary))] py-3.5 pl-5 pr-3 text-sm font-bold text-[hsl(var(--primary-foreground))] disabled:cursor-wait disabled:opacity-70" data-testid="button-submit-quote">
              {createQuote.isPending ? 'Sending your request\u2026' : 'Request my visit'}
              <span className="icon-chip flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--primary-foreground)/.14)]"><ArrowUpRight size={16} /></span>
            </button>
            <p className="text-center text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">No sales call. Just a clear plan, a real price, and times that work.</p>
          </form>
        )}
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: ShieldCheck, title: 'Insured & bonded', text: 'Peace of mind for every home and facility, every visit.' },
  { icon: BadgeCheck, title: '15+ years in the Bay Area', text: 'An established local team, not a rotating gig-app roster.' },
  { icon: Users, title: '60+ trained cleaners', text: 'Vetted, trained, and matched carefully to your space.' },
  { icon: Star, title: '4.9 / 5 average rating', text: 'From more than 240 local homes and offices.' },
];

const STANDARDS: [string, string][] = [
  ['A familiar face', 'The same small crew, carefully matched to your space.'],
  ['A visible plan', 'Your priorities are noted, shared, and checked before we leave.'],
  ['A real response', 'Questions get answered by a human who knows your account.'],
];

const PROCESS: [string, string, string][] = [
  ['01', 'Tell us what matters', 'A quick conversation gives us the shape of your home or facility and the details you care about most.'],
  ['02', 'Get the clear plan', 'You receive a straightforward scope, timing, and price. No vague \u201cstarting at\u201d surprises.'],
  ['03', 'Come home to done', 'Your crew arrives prepared, works with care, and leaves the space ready for what is next.'],
];

const FAQS: [string, string][] = [
  ['How do I actually book a cleaning?', 'Use the form above or call us. We reply within a business day with real time slots and a clear price \u2014 nothing is scheduled until you confirm it.'],
  ['Do I need to be home for the clean?', 'Not at all. Many clients share a secure entry plan, and we always confirm arrival and completion by text.'],
  ['Can I request the same crew?', 'Yes. Consistency is part of the service \u2014 we match a small crew to your space and keep that relationship steady.'],
  ['What if I need something outside the usual checklist?', 'Tell us. We will build it into the scope when we can, or point you to a trusted local specialist when we cannot.'],
  ['Do you bring your own supplies?', 'Yes. Our crews arrive with professional-grade, low-scent products and everything needed for the agreed scope.'],
  ['Are you insured, and what if my usual cleaner is unavailable?', 'Yes, fully insured and bonded, with backup staff available so your agreed schedule stays dependable.'],
];

function Home() {
  const [mode, setMode] = useState<Mode>('residential');
  const copy = modeCopy[mode];

  return (
    <div id="top" className="overflow-hidden">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[hsl(var(--accent))] focus:px-4 focus:py-2 focus:text-sm focus:font-bold">
        Skip to content
      </a>
      <Header mode={mode} onModeChange={setMode} />
      <main id="main">
        {/* HERO */}
        <section className="relative bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">
          <div className="grain droplet-grid absolute inset-0 overflow-hidden opacity-[.35]" />
          <div className="pointer-events-none absolute -right-32 -top-24 h-[460px] w-[460px] rounded-full bg-[hsl(var(--primary)/.4)] blur-3xl" />
          <div className="streak pointer-events-none absolute inset-y-0 right-[-10%] w-[65%] rotate-[6deg] opacity-70 blur-2xl" />
          <div className="section-shell relative grid min-h-[660px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-20 lg:py-20">
            <div>
              <Reveal>
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--secondary-foreground)/.18)] px-3 py-2 text-xs font-medium text-[hsl(var(--secondary-foreground)/.78)]">
                  <span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" /> {copy.label} <span className="text-[hsl(var(--secondary-foreground)/.35)]">/</span> Bay Area
                </div>
              </Reveal>
              <Reveal delay={0.05}>
                <h1 className="font-display text-[clamp(3.4rem,7.6vw,6.8rem)] font-normal leading-[.94] tracking-[-0.01em] text-[hsl(var(--secondary-foreground))]">
                  {copy.title}
                </h1>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-8 max-w-[470px] text-lg leading-8 text-[hsl(var(--secondary-foreground)/.7)]">{copy.body}</p>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="mt-9 flex flex-wrap items-center gap-6">
                  <a href="#quote" className="btn-primary focus-ring group inline-flex items-center gap-3 rounded-full bg-[hsl(var(--accent))] py-3 pl-5 pr-2.5 text-sm font-bold text-[hsl(var(--accent-foreground))]" data-testid="link-hero-quote">
                    Book your clean
                    <span className="icon-chip flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--accent-foreground)/.12)]"><ArrowUpRight size={16} /></span>
                  </a>
                  <a href="#services" className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--secondary-foreground)/.72)] transition-colors hover:text-[hsl(var(--secondary-foreground))]" data-testid="link-hero-services">
                    See what we do <ArrowDownRight size={16} />
                  </a>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="mt-12 flex items-center gap-4 border-t border-[hsl(var(--secondary-foreground)/.14)] pt-5">
                  <div className="flex -space-x-2">
                    {['MC', 'DR', 'AS'].map((initials) => (
                      <span key={initials} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[hsl(var(--secondary))] bg-[hsl(var(--primary))] text-[9px] font-bold text-[hsl(var(--primary-foreground))]">{initials}</span>
                    ))}
                  </div>
                  <p className="text-xs text-[hsl(var(--secondary-foreground)/.6)]">
                    <strong className="text-[hsl(var(--secondary-foreground)/.92)]">Your neighbors</strong> keep coming back.<br />4.9 average across 240+ clean homes.
                  </p>
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.12}>
              <QuoteForm mode={mode} onModeChange={setMode} />
            </Reveal>
          </div>
          <div className="section-shell relative flex items-center justify-between border-t border-[hsl(var(--secondary-foreground)/.12)] py-4 text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--secondary-foreground)/.45)]">
            <span>Care you can see</span><span className="hidden sm:block">A better baseline for every space</span><span>Est. 2011 &middot; CA</span>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/.6)]">
          <div className="section-shell grid gap-0 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 0.05} className={`flex gap-4 py-4 sm:px-6 ${index > 0 ? 'sm:border-l sm:border-[hsl(var(--border))]' : ''} ${index >= 2 ? 'border-t border-[hsl(var(--border))] sm:border-t-0' : ''}`}>
                <div>
                  <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))]"><feature.icon size={17} /></span>
                  <h3 className="text-sm font-bold" data-testid={`feature-title-${index}`}>{feature.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{feature.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="section-shell scroll-mt-24 py-24 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-24">
            <Reveal className="lg:sticky lg:top-32 lg:self-start">
              <p className="eyebrow text-[hsl(var(--primary))]">The Clearview menu</p>
              <h2 className="mt-4 max-w-sm font-display text-5xl leading-[.98] tracking-[-0.01em] sm:text-6xl">The right clean for your real life.</h2>
              <p className="mt-6 max-w-sm text-base leading-7 text-[hsl(var(--muted-foreground))]">We do not force every space into the same checklist. Tell us what matters, and we build the care around it.</p>
              <a href="#quote" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))] underline decoration-[hsl(var(--accent))] decoration-2 underline-offset-8 hover:text-[hsl(var(--secondary))]" data-testid="link-services-quote">
                Talk through your space <ArrowUpRight size={16} />
              </a>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              <Reveal className="sm:col-span-2">
                <article className="lift relative min-h-[340px] overflow-hidden rounded-[22px] bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))]">
                  <div className="droplet-grid pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-40" />
                  <div className="streak pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full opacity-60 blur-xl" />
                  <span className="eyebrow relative text-[hsl(var(--primary-foreground)/.6)]">{mode === 'residential' ? 'Home care' : 'Facility care'}</span>
                  <div className="relative mt-24 max-w-[360px]">
                    <h3 className="font-display text-4xl tracking-[-.01em]">A clean that fits your rhythm.</h3>
                    <p className="mt-3 text-sm leading-6 text-[hsl(var(--primary-foreground)/.68)]">{copy.services[0]} with a plan that stays steady as life changes.</p>
                  </div>
                  <span className="absolute bottom-7 right-7 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"><ArrowUpRight size={18} /></span>
                </article>
              </Reveal>
              <Reveal delay={0.05}>
                <article className="lift h-full rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7">
                  <span className="eyebrow text-[hsl(var(--muted-foreground))]">Reset</span>
                  <h3 className="mt-16 font-display text-3xl tracking-[-.01em]">{copy.services[1]}</h3>
                  <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">For the moments that need more than a maintenance visit.</p>
                  <div className="mt-7 h-1 w-12 bg-[hsl(var(--accent))]" />
                </article>
              </Reveal>
              <Reveal delay={0.1}>
                <article className="lift h-full rounded-[22px] bg-[hsl(var(--accent))] p-7 text-[hsl(var(--accent-foreground))]">
                  <span className="eyebrow text-[hsl(var(--accent-foreground)/.65)]">Transition</span>
                  <h3 className="mt-16 font-display text-3xl tracking-[-.01em]">{copy.services[2]}</h3>
                  <p className="mt-3 text-sm leading-6 text-[hsl(var(--accent-foreground)/.72)]">A fresh beginning, handled with care and a detailed finish.</p>
                  <div className="mt-7 flex justify-end"><Sparkles size={27} strokeWidth={1.5} /></div>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        {/* STANDARDS */}
        <section id="standards" className="scroll-mt-24 bg-[hsl(var(--muted)/.7)] py-24 sm:py-32">
          <div className="section-shell grid items-center gap-14 lg:grid-cols-[1fr_1fr] lg:gap-24">
            <Reveal>
              <div className="relative min-h-[460px] overflow-hidden rounded-[24px] bg-[hsl(var(--secondary))] p-8 text-[hsl(var(--secondary-foreground))]">
                <div className="droplet-grid pointer-events-none absolute inset-0 opacity-40" />
                <div className="streak pointer-events-none absolute inset-y-[-20%] right-[-30%] w-[80%] rotate-[10deg] opacity-70 blur-2xl" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="eyebrow text-[hsl(var(--secondary-foreground)/.6)]">Inside the standard</span>
                    <ShieldCheck size={25} className="text-[hsl(var(--accent))]" />
                  </div>
                  <div>
                    <p className="font-display text-7xl leading-none tracking-[-.01em] text-[hsl(var(--accent))]">clear<span className="text-[hsl(var(--secondary-foreground))]">.</span></p>
                    <p className="mt-3 max-w-[240px] text-sm leading-6 text-[hsl(var(--secondary-foreground)/.62)]">Our promise is simple: you should never have to wonder what happened while you were away.</p>
                  </div>
                  <div className="flex items-end justify-between border-t border-[hsl(var(--secondary-foreground)/.16)] pt-5">
                    <span className="eyebrow text-[hsl(var(--secondary-foreground)/.5)]">Our promise</span>
                    <span className="text-xs font-bold">No corners skipped</span>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div>
                <p className="eyebrow text-[hsl(var(--primary))]">Why Clearview</p>
                <h2 className="mt-4 max-w-lg font-display text-5xl leading-[.98] tracking-[-.01em] sm:text-6xl">Dependable is a design choice.</h2>
                <p className="mt-6 max-w-lg text-base leading-7 text-[hsl(var(--muted-foreground))]">We built the company around the parts of cleaning service that usually feel fuzzy: who is coming, what will be done, and whether someone will make it right.</p>
                <div className="mt-8 space-y-5">
                  {STANDARDS.map(([title, text]) => (
                    <div key={title} className="flex gap-4">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><Check size={12} strokeWidth={3} /></span>
                      <div>
                        <h3 className="text-sm font-bold">{title}</h3>
                        <p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="section-shell scroll-mt-24 py-24 sm:py-32">
          <Reveal>
            <div className="mb-14 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow text-[hsl(var(--primary))]">A lighter lift</p>
                <h2 className="mt-4 font-display text-5xl leading-[.95] tracking-[-.01em] sm:text-6xl">Three steps.<br />Then breathe.</h2>
              </div>
              <p className="max-w-xs text-sm leading-6 text-[hsl(var(--muted-foreground))]">From first hello to finished space, the process is as considered as the result.</p>
            </div>
          </Reveal>
          <div className="relative grid gap-10 border-t border-[hsl(var(--border))] pt-10 md:grid-cols-3 md:gap-8">
            {PROCESS.map(([number, title, text], index) => (
              <Reveal key={number} delay={index * 0.08} className="relative">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(var(--primary))] font-mono-ui text-xs font-bold text-[hsl(var(--primary-foreground))]">{number}</span>
                <h3 className="mt-8 max-w-[220px] font-display text-3xl leading-[1.02] tracking-[-.01em]">{title}</h3>
                <p className="mt-4 max-w-[260px] text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* TESTIMONIAL + STATS */}
        <section className="relative overflow-hidden bg-[hsl(var(--primary))] py-24 text-[hsl(var(--primary-foreground))] sm:py-28">
          <div className="streak pointer-events-none absolute inset-y-0 left-[-15%] w-[55%] -rotate-6 opacity-40 blur-2xl" />
          <div className="section-shell relative grid items-center gap-12 lg:grid-cols-[.78fr_1.22fr] lg:gap-24">
            <Reveal>
              <p className="eyebrow text-[hsl(var(--accent))]">Sample testimonial</p>
              <div className="mt-5 font-display text-6xl leading-none text-[hsl(var(--accent))]">&ldquo;</div>
              <blockquote className="mt-[-8px] font-display text-3xl leading-[1.15] tracking-[-.01em] sm:text-4xl">The first time we walked back in, we both said the same thing: it feels like our house again.</blockquote>
              <div className="mt-7 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-xs font-bold text-[hsl(var(--accent-foreground))]">MC</span>
                <div>
                  <p className="text-sm font-bold">Maya &amp; Chris <span className="font-normal text-[hsl(var(--primary-foreground)/.5)]">(sample)</span></p>
                  <p className="text-xs text-[hsl(var(--primary-foreground)/.55)]">Noe Valley &middot; recurring home care</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bezel"><div className="bezel-inner bg-[hsl(var(--primary-foreground)/.06)] p-5 ring-1 ring-[hsl(var(--primary-foreground)/.14)] sm:p-7"><Clock3 className="text-[hsl(var(--accent))]" size={22} /><p className="mt-10 font-display text-4xl tracking-[-.01em]">1 day</p><p className="mt-2 text-xs leading-5 text-[hsl(var(--primary-foreground)/.6)]">Typical response time for a new quote.</p></div></div>
                <div className="bezel"><div className="bezel-inner bg-[hsl(var(--primary-foreground)/.06)] p-5 ring-1 ring-[hsl(var(--primary-foreground)/.14)] sm:p-7"><CheckCircle2 className="text-[hsl(var(--accent))]" size={22} /><p className="mt-10 font-display text-4xl tracking-[-.01em]">4.9 / 5</p><p className="mt-2 text-xs leading-5 text-[hsl(var(--primary-foreground)/.6)]">From more than 240 local clients.</p></div></div>
                <div className="col-span-2 bezel"><div className="bezel-inner bg-[hsl(var(--secondary))] p-5 sm:p-7"><p className="eyebrow text-[hsl(var(--secondary-foreground)/.55)]">Our coverage</p><div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-[hsl(var(--secondary-foreground))]"><span className="flex items-center gap-2"><MapPin size={16} className="text-[hsl(var(--accent))]" /> San Francisco</span><span className="text-[hsl(var(--secondary-foreground)/.3)]">/</span><span>Marin</span><span className="text-[hsl(var(--secondary-foreground)/.3)]">/</span><span>East Bay</span></div></div></div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section-shell scroll-mt-24 py-24 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-24">
            <Reveal>
              <p className="eyebrow text-[hsl(var(--primary))]">Good to know</p>
              <h2 className="mt-4 font-display text-5xl leading-[.98] tracking-[-.01em]">The questions<br />people ask.</h2>
              <p className="mt-6 max-w-xs text-sm leading-6 text-[hsl(var(--muted-foreground))]">Still curious? We are happy to talk it through. That is what the quote form is for.</p>
              <a href="#quote" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-faq-quote">Ask us directly <ArrowUpRight size={16} /></a>
            </Reveal>
            <Reveal delay={0.06} className="divide-y divide-[hsl(var(--border))] border-y border-[hsl(var(--border))]">
              {FAQS.map(([question, answer]) => (
                <details key={question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-bold [&::-webkit-details-marker]:hidden" data-testid={`button-faq-${question.slice(0, 12).replaceAll(' ', '-').toLowerCase()}`}>
                    {question}
                    <ChevronDown size={19} className="shrink-0 text-[hsl(var(--primary))] transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <p className="max-w-xl pt-3 pr-8 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{answer}</p>
                </details>
              ))}
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="section-shell pb-20">
          <Reveal>
            <div className="grain relative overflow-hidden rounded-[26px] bg-[hsl(var(--accent))] px-7 py-12 sm:px-14 sm:py-16">
              <div className="relative flex flex-col justify-between gap-9 md:flex-row md:items-end">
                <div>
                  <p className="eyebrow text-[hsl(var(--accent-foreground)/.6)]">Ready when you are</p>
                  <h2 className="mt-4 max-w-xl font-display text-5xl leading-[.94] tracking-[-.01em] sm:text-6xl">A cleaner week starts here.</h2>
                </div>
                <a href="#quote" className="btn-primary focus-ring group inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-[hsl(var(--secondary))] py-3 pl-5 pr-2.5 text-sm font-bold text-[hsl(var(--secondary-foreground))]" data-testid="link-bottom-quote">
                  Book a visit
                  <span className="icon-chip flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--secondary-foreground)/.14)]"><ArrowUpRight size={16} /></span>
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <footer className="bg-[hsl(var(--secondary))] py-12 text-[hsl(var(--secondary-foreground))]">
        <div className="section-shell">
          <div className="flex flex-col justify-between gap-10 border-b border-[hsl(var(--secondary-foreground)/.13)] pb-10 sm:flex-row">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--accent))]"><Droplets size={18} /></span>
                <span className="font-display text-[1.4rem] tracking-[-.02em]">Clearview<span className="text-[hsl(var(--accent))]">.</span></span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-6 text-[hsl(var(--secondary-foreground)/.55)]">Thoughtful cleaning for homes, teams, and the spaces in between.</p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm text-[hsl(var(--secondary-foreground)/.68)]">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="hover:text-[hsl(var(--accent))]" data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>{link.label}</a>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 pt-6 text-[11px] text-[hsl(var(--secondary-foreground)/.45)] sm:flex-row">
            <span>&copy; 2026 Clearview Cleaning Co. All rights reserved.</span>
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <PhoneCall size={13} /> <a href="tel:+14155550184" className="hover:text-[hsl(var(--accent))]" data-testid="link-footer-phone">(415) 555-0184</a>
              <span className="mx-1">&middot;</span>
              <Mail size={13} /> <a href="mailto:hello@clearview.co" className="hover:text-[hsl(var(--accent))]" data-testid="link-footer-email">hello@clearview.co</a>
            </span>
          </div>
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
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);
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
